'use client';

import { EffortTag } from '@/lib/types';

const FILTERS: { value: EffortTag; label: string }[] = [
  { value: 'quick', label: 'Quick (< 20 min)' },
  { value: 'one-pot', label: 'One-pot' },
  { value: 'hands-off', label: 'Hands-off / oven' },
  { value: 'minimal', label: 'Minimal effort' },
];

interface Props {
  active: EffortTag[];
  onToggle: (tag: EffortTag) => void;
}

export default function FilterChips({ active, onToggle }: Props) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {FILTERS.map((f) => {
        const isActive = active.includes(f.value);
        return (
          <button
            key={f.value}
            onClick={() => onToggle(f.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              isActive ? 'bg-mint text-frost' : 'bg-panel text-muted hover:text-ice'
            }`}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}
