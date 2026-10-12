'use client';

export type Page = 'frij' | 'spice' | 'grocery' | 'settings';

interface Props {
  active: Page;
  onSelect: (page: Page) => void;
}

const NAV_ITEMS: { key: Page; label: string; icon: string }[] = [
  { key: 'frij', label: 'Frij', icon: '🧊' },
  { key: 'spice', label: 'Spize Rak', icon: '🧂' },
  { key: 'grocery', label: 'Grosry Lizst', icon: '📝' },
  { key: 'settings', label: 'Settings', icon: '⚙️' },
];

export default function Sidebar({ active, onSelect }: Props) {
  return (
    <nav className="sticky top-0 z-20 flex flex-row gap-1 border-b border-panel bg-frost/95 px-4 py-2 backdrop-blur sm:px-6 md:fixed md:inset-y-0 md:left-0 md:w-48 md:flex-col md:gap-1 md:border-b-0 md:border-r md:bg-frost md:px-3 md:py-6">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.key}
          onClick={() => onSelect(item.key)}
          aria-current={active === item.key ? 'page' : undefined}
          className={`flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-2 text-sm md:flex-row md:gap-2 md:px-3 font-medium transition md:flex-none md:justify-start ${
            active === item.key ? 'bg-mint text-frost' : 'text-muted hover:bg-panel hover:text-ice'
          }`}
        >
          <span aria-hidden className="text-base">{item.icon}</span>
          <span className="text-[10px] leading-tight md:text-sm">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
