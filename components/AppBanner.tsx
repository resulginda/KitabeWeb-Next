'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

const STORAGE_KEY = 'kitabe_app_banner_dismissed';
const APP_STORE_URL = 'https://apps.apple.com/tr/app/kitabe-turkey-travel-guide/id6759072943';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.kitabeapp';

function getOS(): 'ios' | 'android' | 'other' {
  if (typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'other';
}

function isMobile(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

export default function AppBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isMobile()) return;
    const dismissed = sessionStorage.getItem(STORAGE_KEY);
    if (!dismissed) setVisible(true);
  }, []);

  function dismiss() {
    sessionStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  }

  function openApp() {
    const os = getOS();
    const storeUrl = os === 'ios' ? APP_STORE_URL : PLAY_STORE_URL;

    if (os === 'android') {
      const fallback = encodeURIComponent(PLAY_STORE_URL);
      window.location.href = `intent://#Intent;scheme=kitabe;package=com.kitabeapp;S.browser_fallback_url=${fallback};end`;
    } else if (os === 'ios') {
      // Önce custom scheme'i dene, uygulama yoksa App Store'a yönlendir
      const timer = setTimeout(() => {
        window.location.href = storeUrl;
      }, 1500);
      window.addEventListener('pagehide', () => clearTimeout(timer), { once: true });
      window.location.href = 'kitabe://';
    } else {
      window.open(storeUrl, '_blank');
    }
  }

  if (!visible) return null;

  return (
    <div className="app-banner" role="banner" aria-label="Uygulamayı aç">
      <button
        className="app-banner-close"
        onClick={dismiss}
        aria-label="Kapat"
        type="button"
      >
        ✕
      </button>

      <Image
        src="/icon.png"
        alt="Kitabe"
        width={48}
        height={48}
        className="app-banner-icon"
        priority={false}
      />

      <div className="app-banner-text">
        <strong>Kitabe</strong>
        <span>Ücretsiz · Uygulamamızda aç</span>
      </div>

      <button
        className="app-banner-btn"
        onClick={openApp}
        type="button"
      >
        Uygulamada Aç
      </button>
    </div>
  );
}
