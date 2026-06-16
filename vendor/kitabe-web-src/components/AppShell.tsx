import type { ReactNode } from 'react';

import { SiteHeader } from './SiteHeader';

import './AppShell.css';



type AppShellProps = {

  children: ReactNode;

  footer?: ReactNode;

  showChrome?: boolean;

};



export function AppShell({ children, footer, showChrome = true }: AppShellProps) {

  if (!showChrome) {

    return <>{children}</>;

  }



  return (

    <div className="app-shell">

      <SiteHeader />

      <div className="app-shell-main">

        <div className="app-shell-content">{children}</div>

        {footer}

      </div>

    </div>

  );

}


