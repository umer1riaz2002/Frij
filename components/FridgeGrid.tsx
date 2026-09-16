'use client';

import { useMemo, useState } from 'react';
import { Category, FridgeItem } from '@/lib/types';
import { CATEGORIES } from '@/lib/categories';
import { mealDbIngredientImageUrl } from '@/lib/images';
import AddIngredientForm from './AddIngredientForm';
import ImageWithFallback from './ImageWithFallback';

interface Props {
  items: FridgeItem[];
  onAdd: (name: string, qty: number, unit: string, category: Category, searchTerm: string) => void;
  onAdjust: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
}

export default function FridgeGrid({ items, onAdd, onAdjust, onRemove }: Props) {
  const [adding, setAdding] = useState(false);
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
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-sm font-medium uppercase tracking-wide text-muted">
          My Frij - {items.length} {items.length === 1 ? 'item' : 'items'}
        </h2>
        <button
          onClick={() => setAdding((a) => !a)}
          className="rounded-lg bg-mint px-3 py-1.5 text-xs font-medium text-frost"
        >
          {adding ? 'Close' : '+ Add ingredient'}
        </button>
      </div>

      {adding && (
        <AddIngredientForm
          onSubmit={(name, qty, unit, category, searchTerm) => {
            onAdd(name, qty, unit, category, searchTerm);
            setAdding(false);
          }}
          onCancel={() => setAdding(false)}
        />
      )}

      {items.length === 0 && !adding && (
        <p className="mt-4 text-sm text-muted">Your fridge is empty. Add something to get started.</p>
      )}

      {items.length > 0 && (
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your fridge..."
          className="mt-4 w-full rounded-lg bg-panel px-3 py-2 text-sm text-ice outline-none placeholder:text-muted focus:ring-2 focus:ring-mint"
        />
      )}

      {items.length > 0 && filtered.length === 0 && (
        <p className="mt-4 text-sm text-muted">Nothing in your fridge matches &quot;{query}&quot;.</p>
      )}

      <div className="mt-4 space-y-5">
        {grouped.map((group) => (
          <div key={group.value}>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
              {group.emoji} {group.label} - {group.items.length}
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {group.items.map((item) => (
                <div
                  key={item.id}
                  className={`relative rounded-2xl border-l-4 bg-panelRaised p-3 shadow-[inset_0_2px_6px_rgba(0,0,0,0.4)] ${group.borderClass}`}
                >
                  <span className="absolute -right-2 -top-2 rounded-full bg-mint px-2 py-0.5 font-mono text-xs font-semibold text-frost shadow-[0_0_0_3px_theme(colors.frost)]">
                    {item.qty}
                  </span>
                  <div className="flex items-center gap-2">
                    <ImageWithFallback
                      src={mealDbIngredientImageUrl(item.searchTerm)}
                      alt=""
                      fallbackLabel={item.name}
                      className="h-10 w-10 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ice">{item.name}</p>
                      <p className="text-xs text-muted">{item.unit}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() => onAdjust(item.id, -1)}
                      aria-label={`Remove one ${item.name}`}
                      className="h-6 w-6 rounded-full bg-panel text-ice hover:bg-frost"
                    >
                      -
                    </button>
                    <button
                      onClick={() => onAdjust(item.id, 1)}
                      aria-label={`Add one ${item.name}`}
                      className="h-6 w-6 rounded-full bg-panel text-ice hover:bg-frost"
                    >
                      +
                    </button>
                    <button
                      onClick={() => onRemove(item.id)}
                      aria-label={`Delete ${item.name}`}
                      className="ml-auto text-xs text-muted hover:text-coral"
                    >
                      remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
