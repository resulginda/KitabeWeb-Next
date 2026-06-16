import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

const DEFAULT_ITEM_HEIGHT = 88;
const OVERSCAN = 6;

interface VirtualPlaceListProps<T> {
  items: T[];
  itemHeight?: number;
  className?: string;
  getKey: (item: T, index: number) => string;
  renderItem: (item: T, index: number) => ReactNode;
}

export function VirtualPlaceList<T>({
  items,
  itemHeight = DEFAULT_ITEM_HEIGHT,
  className,
  getKey,
  renderItem,
}: VirtualPlaceListProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(480);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => setViewportHeight(el.clientHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (el) setScrollTop(el.scrollTop);
  }, []);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - OVERSCAN);
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + viewportHeight) / itemHeight) + OVERSCAN
  );
  const offsetY = startIndex * itemHeight;
  const totalHeight = items.length * itemHeight;
  const visible = items.slice(startIndex, endIndex);

  return (
    <div ref={scrollRef} className={className} onScroll={onScroll}>
      <div className="kb-virtual-spacer" style={{ height: totalHeight, position: 'relative' }}>
        <div className="kb-virtual-window" style={{ transform: `translateY(${offsetY}px)` }}>
          {visible.map((item, i) => {
            const index = startIndex + i;
            return (
              <div key={getKey(item, index)} className="kb-virtual-item" style={{ minHeight: itemHeight }}>
                {renderItem(item, index)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
