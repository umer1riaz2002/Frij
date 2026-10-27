'use client';

import { useMemo, useState } from 'react';
import { Category, FridgeItem } from '@/lib/types';
import { CATEGORIES } from '@/lib/categories';
import AddIngredientForm from './AddIngredientForm';
import ReceiptScanner from './ReceiptScanner';
import FridgeShelves from './FridgeShelves';

type Panel = 'none' | 'manual' | 'scan';

interface Props {
  items: FridgeItem[];
  onAdd: (name: string, qty: number, unit: string, category: Category, searchTerm: string) => void;
  onAddMany: (
    items: { name: string; qty: number; unit: string; category: Category; searchTerm: string }[]
  ) => void;
  onAdjust: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
}

export default function FridgeGrid({ items, onAdd, onAddMany, onAdjust, onRemove }: Props) {
  const [panel, setPanel] = useState<Panel>('none');
  const [query, setQuery] = useState('');

  const filtered = useMemo(
    () => items.filter((i) => i.name.toLowerCase().includes(query.trim().toLowerCase())),
    [items, query]
  );

  const grouped = useMemo(
    () =>
      CATEGORIES.map((c) => ({
        ...c,
        items: filtered.filter((i) => i.category === c.value),
      })).filter((g) => g.items.length > 0),
    [filtered]
  );

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-sm font-medium uppercase tracking-wide text-yolk ">
          My Frij - {items.length} {items.length === 1 ? 'item' : 'items'}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setPanel((p) => (p === 'manual' ? 'none' : 'manual'))}
            className="rounded-lg bg-yellow px-3 py-1.5 text-xs font-medium text-frost"
          >
            {panel === 'manual' ? 'Close' : '+ Add ingredient'}
          </button>
          <button
            onClick={() => setPanel((p) => (p === 'scan' ? 'none' : 'scan'))}
            className="rounded-lg bg-purple px-3 py-1.5 text-xs font-medium text-ice hover:bg-mauve "
          >
            {panel === 'scan' ? 'Close' : '📷 Scan items'}
          </button>
        </div>
      </div>

      {panel === 'manual' && (
        <AddIngredientForm
          onSubmit={(name, qty, unit, category, searchTerm) => {
            onAdd(name, qty, unit, category, searchTerm);
            setPanel('none');
          }}
          onCancel={() => setPanel('none')}
        />
      )}

      {panel === 'scan' && (
        <ReceiptScanner
          onAddMany={(newItems) => {
            onAddMany(newItems);
            setPanel('none');
          }}
          onCancel={() => setPanel('none')}
        />
      )}

      {items.length === 0 && panel === 'none' && (
        <p className="mt-4 text-sm text-yolk ">Add in your groceries to get started.</p>
      )}

      {items.length > 0 && (
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your fridge..."
          className="mt-4 w-full rounded-lg bg-purple px-3 py-2 text-sm text-ice outline-none placeholder:text-yolk  focus:ring-2 focus:ring-yellow"
        />
      )}

      {items.length > 0 && filtered.length === 0 && (
        <p className="mt-4 text-sm text-yolk ">Nothing in your fridge matches &quot;{query}&quot;.</p>
      )}

      <FridgeShelves groups={grouped} query={query} onAdjust={onAdjust} onRemove={onRemove} onAdd={onAdd}
      />

    </section>
  );
}
