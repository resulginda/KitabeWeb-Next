import type { ReactNode } from 'react';
import DesktopSidebar from './DesktopSidebar';
import DesktopHeader from './DesktopHeader';
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
      <DesktopSidebar />
      <div className="app-shell-main">
        <DesktopHeader />
        <div className="app-shell-content">{children}</div>
        {footer}
      </div>
    </div>
  );
}
