type AdPosition = 'sidebar' | 'in-content' | 'below-content';

const LABELS: Record<AdPosition, string> = {
  sidebar: 'Reklam — Kenar çubuğu',
  'in-content': 'Reklam — İçerik ortası',
  'below-content': 'Reklam — İçerik altı',
};

export function AdSlot({ position }: { position: AdPosition }) {
  const slotMap: Record<AdPosition, string> = {
    sidebar: '1122334455',
    'in-content': '2233445566',
    'below-content': '3344556677',
  };

  return (
    <aside
      className={`ad-slot ad-${position}`}
      aria-label="Advertisement"
      data-ad-position={position}
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-PLACEHOLDER"
        data-ad-slot={slotMap[position]}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      <span style={{ position: 'absolute', opacity: 0.4, fontSize: '0.75rem' }}>
        {LABELS[position]}
      </span>
    </aside>
  );
}
