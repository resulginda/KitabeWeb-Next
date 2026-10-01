'use client';

import { useEffect, useState } from 'react';
import { AUTH_TOKEN_KEY } from '@kitabe/utils/authToken';
import { persistLanguageChoice } from '@kitabe/utils/detectLocale';
import type { Locale } from '@/lib/places';

type Props = {
  locale: Locale;
  login: string;
  register: string;
  myAccount: string;
};

/** JWT imzası burada doğrulanmaz; yalnızca başlıkta gösterim için okunur. */
function readSession(): { initial: string } | null {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) return null;
  try {
    const payload = JSON.parse(
      atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
    ) as { email?: string; exp?: number };
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return { initial: payload.email?.charAt(0).toUpperCase() || 'K' };
  } catch {
    return { initial: 'K' };
  }
}

/** Hub başlığı statik; oturum localStorage'da olduğu için giriş durumu istemcide okunur. */
export function HubAuthActions({ locale, login, register, myAccount }: Props) {
  const [session, setSession] = useState<{ initial: string } | null>(null);

  useEffect(() => {
    try {
      persistLanguageChoice(locale, true);
      setSession(readSession());
    } catch {
      setSession(null);
    }
  }, [locale]);

  if (session) {
    return (
      <a href="/account" className="site-header-account-pill">
        <span className="site-header-account-avatar" aria-hidden>
          {session.initial}
        </span>
        <span className="site-header-account-label">{myAccount}</span>
      </a>
    );
  }

  return (
    <>
      <a href="/login" className="btn btn-secondary btn-sm site-header-login">
        {login}
      </a>
      <a href="/register" className="btn btn-primary btn-sm site-header-register">
        {register}
      </a>
    </>
  );
}
