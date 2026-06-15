import type { NavItemId } from '../config/navItems';

type IconProps = {
  size?: number;
  className?: string;
};

const defaults = { size: 20, className: undefined as string | undefined };

function Svg({ size, className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size ?? 20}
      height={size ?? 20}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function NavIcon({ id, size = defaults.size, className }: { id: NavItemId } & IconProps) {
  switch (id) {
    case 'home':
      return (
        <Svg size={size} className={className}>
          <path
            d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'list':
      return (
        <Svg size={size} className={className}>
          <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </Svg>
      );
    case 'nearby':
      return (
        <Svg size={size} className={className}>
          <path
            d="M12 21s7-4.35 7-10a7 7 0 1 0-14 0c0 5.65 7 10 7 10Z"
            stroke="currentColor"
            strokeWidth="1.75"
          />
          <circle cx="12" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.75" />
        </Svg>
      );
    case 'route':
      return (
        <Svg size={size} className={className}>
          <path
            d="M3 6h7l2 3h9v11H3V6Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <path d="M10 6V3h4v3" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
        </Svg>
      );
    case 'account':
      return (
        <Svg size={size} className={className}>
          <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.75" />
          <path
            d="M5 20c1.2-3.5 4-5.5 7-5.5s5.8 2 7 5.5"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </Svg>
      );
    default:
      return null;
  }
}
