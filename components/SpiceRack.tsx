'use client';

import { useMemo, useState } from 'react';
import { SpiceItem } from '@/lib/types';
import { mealDbIngredientImageUrl } from '@/lib/images';
import AddSpiceForm from './AddSpiceForm';
import ImageWithFallback from './ImageWithFallback';

interface Props {
  spices: SpiceItem[];
  onAdd: (name: string, searchTerm: string) => void;
  onRemove: (id: string) => void;
}

export default function SpiceRack({ spices, onAdd, onRemove }: Props) {
  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(
    () => spices.filter((s) => s.name.toLowerCase().includes(query.trim().toLowerCase())),
    [spices, query]
  );

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-sm font-medium uppercase tracking-wide text-muted">
          Spize Rak - {spices.length} {spices.length === 1 ? 'spice' : 'spices'}
        </h2>
        <button
          onClick={() => setAdding((a) => !a)}
          className="rounded-lg bg-mint px-3 py-1.5 text-xs font-medium text-frost"
        >
          {adding ? 'Close' : '+ Add spice'}
        </button>
      </div>

      <p className="mb-3 text-xs text-muted">
        Anything in here counts as on-hand for recipes - no quantities, just what&apos;s within reach of the stove.
      </p>

      {adding && (
        <AddSpiceForm
          onSubmit={(name, searchTerm) => {
            onAdd(name, searchTerm);
            setAdding(false);
          }}
          onCancel={() => setAdding(false)}
        />
      )}

      {spices.length === 0 && !adding && (
        <p className="mt-2 text-sm text-muted">
          Empty rack. Add salt, pepper, or anything specific like Guajillo pepper.
        </p>
      )}

      {spices.length > 0 && (
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your spice rack..."
          className="mt-2 w-full rounded-lg bg-panel px-3 py-2 text-sm text-ice outline-none placeholder:text-muted focus:ring-2 focus:ring-mint"
        />
      )}

      <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
        {filtered.map((spice) => (
          <div key={spice.id} className="relative rounded-2xl bg-panelRaised p-3">
            <button
              onClick={() => onRemove(spice.id)}
              aria-label={`Remove ${spice.name}`}
              className="absolute -right-2 -top-2 h-5 w-5 rounded-full bg-panel text-xs text-muted hover:text-coral"
            >
              x
            </button>
            <ImageWithFallback
              src={mealDbIngredientImageUrl(spice.searchTerm)}
              alt=""
              fallbackLabel={spice.name}
              className="h-10 w-10 rounded-lg object-cover"
            />
            <p className="mt-2 truncate text-xs font-medium text-ice">{spice.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
