'use client';

export type Page = 'frij' | 'spice' | 'grocery';

interface Props {
  active: Page;
  onSelect: (page: Page) => void;
}

const NAV_ITEMS: { key: Page; label: string; icon: string }[] = [
  { key: 'frij', label: 'Frij', icon: '🧊' },
  { key: 'spice', label: 'Spize Rak', icon: '🧂' },
  { key: 'grocery', label: 'Grosry Lizst', icon: '📝' },
];

export default function Sidebar({ active, onSelect }: Props) {
  return (
    <nav className="flex shrink-0 flex-row gap-1 border-b border-panel pb-3 md:w-40 md:flex-col md:border-b-0 md:border-r md:border-panel md:pb-0 md:pr-3">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.key}
          onClick={() => onSelect(item.key)}
          aria-current={active === item.key ? 'page' : undefined}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition md:flex-none md:justify-start ${
            active === item.key ? 'bg-mint text-frost' : 'text-muted hover:bg-panel hover:text-ice'
          }`}
        >
          <span aria-hidden>{item.icon}</span>
          <span className="hidden md:inline">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
