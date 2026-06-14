import type { ReactNode } from 'react';
import { AdSlot } from './AdSlot';

/** Sol / sağ / üst banner / alt — tüm SPA içerik sayfaları */
export function PageAdLayout({ children }: { children: ReactNode }) {
  return (
    <div className="spa-ad-shell">
      <div className="spa-page-layout">
        <aside className="spa-ad-left">
          <AdSlot position="left-sidebar" />
        </aside>

        <div className="spa-main-column">
          <AdSlot position="in-content" />
          {children}
        </div>

        <aside className="spa-ad-right">
          <AdSlot position="sidebar" />
        </aside>
      </div>

      <div className="spa-ad-below">
        <AdSlot position="below-content" />
      </div>
    </div>
  );
}
