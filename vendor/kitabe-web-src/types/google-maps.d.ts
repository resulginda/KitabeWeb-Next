declare global {
  interface Window {
    /** AdSense vb.; Google Maps JS artık kullanılmıyor */
    google?: unknown;
    adsbygoogle: any[] & { loaded?: boolean };
  }
}

export {};

