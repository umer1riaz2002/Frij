'use client';

import { ChangeEvent, useState } from 'react';
import { Category } from '@/lib/types';
import { CATEGORIES } from '@/lib/categories';
import { UNIT_GROUPS } from '@/lib/unitGroups';
import { guessCategory } from '@/lib/categoryGuess';
import { guessUnit } from '@/lib/units';
import { deriveSearchTerm } from '@/lib/ingredientName';

interface DraftItem {
  id: string;
  name: string;
  qty: number;
  unit: string;
  category: Category;
  include: boolean;
}

interface Props {
  onAddMany: (
    items: { name: string; qty: number; unit: string; category: Category; searchTerm: string }[]
  ) => void;
  onCancel: () => void;
}

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

const ALL_UNITS = UNIT_GROUPS.flatMap((g) => g.units);

export default function ReceiptScanner({ onAddMany, onCancel }: Props) {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<'receipt' | 'shelf'>('receipt');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [drafts, setDrafts] = useState<DraftItem[] | null>(null);

  function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setDrafts(null);
    const reader = new FileReader();
    reader.onload = () => setImageDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function extract() {
    if (!imageDataUrl) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/scan-receipt', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ image: imageDataUrl, mode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Could not extract items from that photo.');
        return;
      }
      const items: { name: string; qty: number; unit?: string }[] = data.items ?? [];
      if (items.length === 0) {
        setError("Didn't spot any items in that photo - try a clearer shot, or add items manually.");
        return;
      }
      setDrafts(
        items.map((i) => {
          const category = guessCategory(i.name);
          return {
            id: makeId(),
            name: i.name,
            qty: i.qty,
            unit: i.unit || guessUnit(i.name, category),
            category,
            include: true,
          };
        })
      );
    } catch {
      setError('Could not reach the scanning service. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  function updateDraft(id: string, patch: Partial<DraftItem>) {
    setDrafts((prev) => prev?.map((d) => (d.id === id ? { ...d, ...patch } : d)) ?? null);
  }

  function removeDraft(id: string) {
    setDrafts((prev) => prev?.filter((d) => d.id !== id) ?? null);
  }

  function confirmAdd() {
    if (!drafts) return;
    const toAdd = drafts
      .filter((d) => d.include && d.name.trim())
      .map((d) => ({
        name: d.name.trim(),
        qty: d.qty,
        unit: d.unit,
        category: d.category,
        searchTerm: deriveSearchTerm(d.name),
      }));
    if (toAdd.length === 0) return;
    onAddMany(toAdd);
  }

  const includedCount = drafts?.filter((d) => d.include).length ?? 0;

  return (
    <div className="mt-4 rounded-2xl bg-purple p-4">
      {!drafts && (
        <>
          <div className="mb-3 flex gap-2">
            <button
              onClick={() => setMode('receipt')}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                mode === 'receipt' ? 'bg-yellow text-frost' : 'bg-mauve  text-yolk '
              }`}
            >
              Receipt
            </button>
            <button
              onClick={() => setMode('shelf')}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                mode === 'shelf' ? 'bg-yellow text-frost' : 'bg-mauve  text-yolk '
              }`}
            >
              Shelf / fridge photo
            </button>
          </div>

          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="block text-xs text-yolk  file:mr-3 file:rounded-lg file:border-0 file:bg-mauve  file:px-3 file:py-2 file:text-xs file:text-ice"
          />

          {imageDataUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageDataUrl} alt="Selected" className="mt-3 max-h-48 rounded-lg object-contain" />
          )}

          {error && <p className="mt-2 text-xs text-coral">{error}</p>}

          <div className="mt-3 flex gap-2">
            <button
              onClick={extract}
              disabled={!imageDataUrl || loading}
              className="rounded-lg bg-yellow px-4 py-2 text-sm font-medium text-purple disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? 'Reading photo...' : 'Extract items'}
            </button>
            <button onClick={onCancel} className="text-sm text-yolk  hover:text-ice">
              Cancel
            </button>
          </div>
        </>
      )}

      {drafts && (
        <>
          <p className="mb-3 text-xs text-yolk ">
            Found {drafts.length} item{drafts.length === 1 ? '' : 's'} - uncheck anything wrong, edit the rest, then add.
          </p>
          <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {drafts.map((d) => (
              <div key={d.id} className="flex flex-wrap items-center gap-2 rounded-lg bg-mauve  p-2">
                <input
                  type="checkbox"
                  checked={d.include}
                  onChange={(e) => updateDraft(d.id, { include: e.target.checked })}
                  className="h-4 w-4 shrink-0"
                  aria-label={`Include ${d.name}`}
                />
                <input
                  value={d.name}
                  onChange={(e) => updateDraft(d.id, { name: e.target.value })}
                  className="min-w-0 flex-1 rounded bg-purple px-2 py-1 text-xs text-ice outline-none focus:ring-1 focus:ring-yellow"
                />
                <input
                  type="number"
                  min={1}
                  value={d.qty}
                  onChange={(e) => updateDraft(d.id, { qty: Math.max(1, Number(e.target.value)) })}
                  className="w-12 rounded bg-purple px-2 py-1 text-xs text-ice outline-none focus:ring-1 focus:ring-yellow"
                />
                <select
                  value={d.unit}
                  onChange={(e) => updateDraft(d.id, { unit: e.target.value })}
                  className="rounded bg-purple px-2 py-1 text-xs text-ice outline-none focus:ring-1 focus:ring-yellow"
                >
                  {ALL_UNITS.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </select>
                <select
                  value={d.category}
                  onChange={(e) => updateDraft(d.id, { category: e.target.value as Category })}
                  className="rounded bg-purple px-2 py-1 text-xs text-ice outline-none focus:ring-1 focus:ring-yellow"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => removeDraft(d.id)}
                  aria-label={`Remove ${d.name} from list`}
                  className="text-xs text-yolk  hover:text-coral"
                >
                  x
                </button>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={confirmAdd}
              disabled={includedCount === 0}
              className="rounded-lg bg-yellow px-4 py-2 text-sm font-medium text-purple disabled:cursor-not-allowed disabled:opacity-40"
            >
              Add {includedCount} item{includedCount === 1 ? '' : 's'} to fridge
            </button>
            <button onClick={() => setDrafts(null)} className="text-sm text-yolk  hover:text-ice">
              Back
            </button>
            <button onClick={onCancel} className="text-sm text-yolk  hover:text-ice">
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}
