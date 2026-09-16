'use client';

import { useState } from 'react';
import { FridgeItem, GroceryItem } from '@/lib/types';
import { mealDbIngredientImageUrl } from '@/lib/images';
import { ingredientsMatch } from '@/lib/ingredientMatch';
import AddGroceryForm from './AddGroceryForm';
import ImageWithFallback from './ImageWithFallback';

interface Props {
  groceries: GroceryItem[];
  fridgeItems: FridgeItem[];
  onAdd: (name: string, qty: number, unit: string, searchTerm: string) => void;
  onRemove: (id: string) => void;
}

function findFridgeMatch(searchTerm: string, fridgeItems: FridgeItem[]): FridgeItem | undefined {
  return fridgeItems.find((f) => ingredientsMatch(f.searchTerm, searchTerm));
}

export default function GroceryList({ groceries, fridgeItems, onAdd, onRemove }: Props) {
  const [adding, setAdding] = useState(false);
  // Dismissal is per grocery-item id and lives only in this session - if the
  // fridge situation changes (item removed then re-added), the notice can
  // reasonably reappear rather than staying silently dismissed forever.
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  function dismiss(id: string) {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-sm font-medium uppercase tracking-wide text-muted">
          Grosry Lizst - {groceries.length} {groceries.length === 1 ? 'item' : 'items'}
        </h2>
        <button
          onClick={() => setAdding((a) => !a)}
          className="rounded-lg bg-mint px-3 py-1.5 text-xs font-medium text-frost"
        >
          {adding ? 'Close' : '+ Add to list'}
        </button>
      </div>

      {adding && (
        <AddGroceryForm
          onSubmit={(name, qty, unit, searchTerm) => {
            onAdd(name, qty, unit, searchTerm);
            setAdding(false);
          }}
          onCancel={() => setAdding(false)}
        />
      )}

      {groceries.length === 0 && !adding && (
        <p className="mt-4 text-sm text-muted">Nothing on the list yet.</p>
      )}

      <div className="mt-4 space-y-2">
        {groceries.map((g) => {
          const match = findFridgeMatch(g.searchTerm, fridgeItems);
          const showNotice = Boolean(match) && !dismissed.has(g.id);

          return (
            <div key={g.id} className="rounded-2xl bg-panelRaised p-3">
              <div className="flex items-center gap-3">
                <ImageWithFallback
                  src={mealDbIngredientImageUrl(g.searchTerm)}
                  alt=""
                  fallbackLabel={g.name}
                  className="h-10 w-10 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ice">{g.name}</p>
                  <p className="text-xs text-muted">
                    {g.qty} {g.unit}
                  </p>
                </div>
                <button
                  onClick={() => onRemove(g.id)}
                  aria-label={`Remove ${g.name} from list`}
                  className="shrink-0 text-xs text-muted hover:text-coral"
                >
                  remove
                </button>
              </div>

              {showNotice && match && (
                <div className="mt-2 flex items-start justify-between gap-2 rounded-lg bg-panel px-3 py-2 text-xs text-yolk">
                  <span>
                    Already have {match.qty} {match.unit} {match.name} in fridge
                  </span>
                  <button
                    onClick={() => dismiss(g.id)}
                    aria-label="Dismiss notice"
                    className="shrink-0 text-muted hover:text-ice"
                  >
                    x
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
