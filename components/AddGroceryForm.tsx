'use client';

import { FormEvent, useState } from 'react';
import { guessUnit } from '@/lib/units';
import { deriveSearchTerm } from '@/lib/ingredientName';
import { UNIT_GROUPS } from '@/lib/unitGroups';

interface Props {
  onSubmit: (name: string, qty: number, unit: string, searchTerm: string) => void;
  onCancel: () => void;
}

export default function AddGroceryForm({ onSubmit, onCancel }: Props) {
  const [name, setName] = useState('');
  const [qty, setQty] = useState(1);
  const [unit, setUnit] = useState('pcs');
  const [unitTouched, setUnitTouched] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTermTouched, setSearchTermTouched] = useState(false);
  const [error, setError] = useState('');

  function handleNameChange(newName: string) {
    setName(newName);
    setError('');
    // No fridge "category" here, so name-specific hints still apply and
    // anything unmatched just falls back to 'pcs' via the 'other' bucket.
    if (!unitTouched) setUnit(guessUnit(newName, 'other'));
    if (!searchTermTouched) setSearchTerm(deriveSearchTerm(newName));
  }

  function handleUnitChange(newUnit: string) {
    setUnit(newUnit);
    setUnitTouched(true);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Give it a name first.');
      return;
    }
    onSubmit(name.trim(), qty, unit, searchTerm.trim() || deriveSearchTerm(name));
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-wrap items-end gap-3 rounded-2xl bg-panel p-4">
      <div className="flex flex-col">
        <label className="mb-1 text-xs text-muted" htmlFor="grocery-name">
          To buy
        </label>
        <input
          id="grocery-name"
          autoFocus
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="e.g. chicken thighs"
          className="w-44 rounded-lg bg-panelRaised px-3 py-2 text-sm text-ice outline-none focus:ring-2 focus:ring-mint"
        />
        {error && <span className="mt-1 text-xs text-coral">{error}</span>}
      </div>

      <div className="flex flex-col">
        <label className="mb-1 text-xs text-muted" htmlFor="grocery-qty">
          Qty
        </label>
        <input
          id="grocery-qty"
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
          className="w-16 rounded-lg bg-panelRaised px-3 py-2 text-sm text-ice outline-none focus:ring-2 focus:ring-mint"
        />
      </div>

      <div className="flex flex-col">
        <label className="mb-1 text-xs text-muted" htmlFor="grocery-unit">
          Unit
        </label>
        <select
          id="grocery-unit"
          value={unit}
          onChange={(e) => handleUnitChange(e.target.value)}
          className="rounded-lg bg-panelRaised px-3 py-2 text-sm text-ice outline-none focus:ring-2 focus:ring-mint"
        >
          {UNIT_GROUPS.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.units.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <button type="submit" className="rounded-lg bg-mint px-4 py-2 text-sm font-medium text-frost">
        Add to list
      </button>
      <button type="button" onClick={onCancel} className="text-sm text-muted hover:text-ice">
        Cancel
      </button>
    </form>
  );
}
