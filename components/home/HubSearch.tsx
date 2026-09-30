'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';

type Kind = 0 | 1 | 2 | 3;
type RawEntry = [Kind, string, string, string, number, string?];
type Entry = { kind: Kind; name: string; sub: string; href: string; count: number; foldedName: string; hay: string };

type Labels = { city: string; district: string; category: string; place: string; empty: string; loading: string };

const KIND_WEIGHT: Record<Kind, number> = { 0: 400, 1: 250, 2: 200, 3: 100 };
const MAX_RESULTS = 8;

function fold(value: string): string {
  return value
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

const indexCache = new Map<string, Promise<Entry[]>>();

function loadIndex(locale: string): Promise<Entry[]> {
  let pending = indexCache.get(locale);
  if (!pending) {
    pending = fetch(`/api/search-index/${locale}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((rows: RawEntry[]) =>
        rows.map(([kind, name, sub, href, count, alt]) => {
          const foldedName = fold(name);
          return { kind, name, sub, href, count, foldedName, hay: `${foldedName} ${fold(sub)} ${alt ? fold(alt) : ''}` };
        })
      )
      .catch(() => {
        indexCache.delete(locale);
        return [];
      });
    indexCache.set(locale, pending);
  }
  return pending;
}

function search(entries: Entry[], query: string): Entry[] {
  const tokens = fold(query).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];
  const scored: { entry: Entry; score: number }[] = [];
  for (const entry of entries) {
    if (!tokens.every((t) => entry.hay.includes(t))) continue;
    let score = KIND_WEIGHT[entry.kind] + Math.min(entry.count, 99);
    if (tokens.includes(entry.foldedName)) score += 500;
    else if (entry.foldedName.startsWith(tokens[0])) score += 300;
    else if (entry.foldedName.includes(` ${tokens[0]}`)) score += 150;
    scored.push({ entry, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, MAX_RESULTS).map((s) => s.entry);
}

export function HubSearch({
  locale,
  placeholder,
  buttonLabel,
  labels,
}: {
  locale: string;
  placeholder: string;
  buttonLabel: string;
  labels: Labels;
}) {
  const listId = useId();
  const [query, setQuery] = useState('');
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ensureIndex = useCallback(() => {
    if (entries) return;
    loadIndex(locale).then(setEntries);
  }, [entries, locale]);

  const results = useMemo(() => (entries ? search(entries, query) : []), [entries, query]);

  useEffect(() => setActive(-1), [query]);
  useEffect(() => () => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
  }, []);

  const kindLabel = (kind: Kind) =>
    kind === 0 ? labels.city : kind === 1 ? labels.district : kind === 2 ? labels.category : labels.place;

  const go = (entry: Entry | undefined) => {
    if (entry) window.location.assign(entry.href);
  };

  const showPanel = open && query.trim().length > 0;

  return (
    <form
      className="hub-search"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        go(results[active >= 0 ? active : 0]);
      }}
    >
      <input
        type="search"
        value={query}
        placeholder={placeholder}
        aria-label={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={showPanel}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        onFocus={() => {
          ensureIndex();
          setOpen(true);
        }}
        onBlur={() => {
          blurTimer.current = setTimeout(() => setOpen(false), 150);
        }}
        onChange={(e) => {
          ensureIndex();
          setQuery(e.target.value);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive((i) => Math.min(i + 1, results.length - 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive((i) => Math.max(i - 1, -1));
          } else if (e.key === 'Escape') {
            setOpen(false);
          }
        }}
      />
      <button type="submit" className="hub-search-button">
        {buttonLabel}
      </button>

      {showPanel ? (
        <div className="hub-search-panel">
          {!entries ? (
            <p className="hub-search-empty">{labels.loading}</p>
          ) : results.length === 0 ? (
            <p className="hub-search-empty">{labels.empty}</p>
          ) : (
            <ul id={listId} role="listbox" className="hub-search-results">
              {results.map((entry, i) => (
                <li
                  key={`${entry.kind}-${entry.href}`}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  className={i === active ? 'is-active' : undefined}
                >
                  <a href={entry.href} onMouseDown={(e) => e.preventDefault()} onClick={() => setOpen(false)}>
                    <span className={`hub-search-kind hub-search-kind--${entry.kind}`}>{kindLabel(entry.kind)}</span>
                    <span className="hub-search-text">
                      <span className="hub-search-name">{entry.name}</span>
                      {entry.sub ? <span className="hub-search-sub">{entry.sub}</span> : null}
                    </span>
                    {entry.count > 0 ? <span className="hub-search-count">{entry.count}</span> : null}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </form>
  );
}
