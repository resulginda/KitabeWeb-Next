import type { ReactNode } from 'react';

import { AdSlot } from './AdSlot';



type PageAdLayoutProps = {

  children: ReactNode;

  /** Keşfet / ana sayfa: tam genişlik, yan reklam yok */

  fullWidth?: boolean;

};



export function PageAdLayout({ children, fullWidth = false }: PageAdLayoutProps) {

  if (fullWidth) {

    return (

      <div className="spa-ad-shell spa-ad-shell--full">

        <div className="spa-main-column spa-main-column--full">{children}</div>

        <div className="spa-ad-below">

          <AdSlot position="below-content" />

        </div>

      </div>

    );

  }



  return (

    <div className="spa-ad-shell">

      <div className="spa-page-layout">

        <div className="spa-main-column">

          {children}

          <AdSlot position="in-content" />

        </div>

      </div>

      <div className="spa-ad-below">

        <AdSlot position="below-content" />

      </div>

    </div>

  );

}


