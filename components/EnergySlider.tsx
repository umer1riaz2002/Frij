'use client';

import { EffortTag } from '@/lib/types';

const LEVELS: { label: string; emoji: string; filters: EffortTag[] }[] = [
  { label: 'Wiped', emoji: '🫠', filters: ['minimal', 'quick'] },
  { label: 'Low', emoji: '😮‍💨', filters: ['minimal', 'hands-off'] },
  { label: 'Okay', emoji: '🙂', filters: ['quick'] },
  { label: 'Got this', emoji: '💪', filters: [] },
];

interface Props {
  value: number;
  onChange: (level: number, filters: EffortTag[]) => void;
}

export default function EnergySlider({ value, onChange }: Props) {
  const current = LEVELS[value];

  return (
    <div className="mb-4 rounded-2xl bg-purple p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-yolk ">Energy today</span>
        <span className="text-sm text-ice">
          {current.emoji} {current.label}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={LEVELS.length - 1}
        step={1}
        value={value}
        onChange={(e) => {
          const level = Number(e.target.value);
          onChange(level, LEVELS[level].filters);
        }}
        className="w-full accent-yellow"
        aria-label="Energy level"
      />
      <div className="mt-1 flex justify-between text-[10px] text-yolk ">
        {LEVELS.map((l) => (
          <span key={l.label}>{l.label}</span>
        ))}
      </div>
    </div>
  );
}
