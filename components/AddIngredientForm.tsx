'use client';

import { FormEvent, useState } from 'react';
import { Category } from '@/lib/types';
import { CATEGORIES } from '@/lib/categories';
import { guessUnit } from '@/lib/units';
import { guessCategory } from '@/lib/categoryGuess';
import { deriveSearchTerm } from '@/lib/ingredientName';
import { UNIT_GROUPS } from '@/lib/unitGroups';

interface Props {
  onSubmit: (name: string, qty: number, unit: string, category: Category, searchTerm: string) => void;
  onCancel: () => void;
  initialCategory?: Category;
}

export default function AddIngredientForm({ onSubmit, onCancel, initialCategory }: Props) {
  const [name, setName] = useState('');
  const [qty, setQty] = useState(1);
  const [unit, setUnit] = useState('pcs');
  const [unitTouched, setUnitTouched] = useState(false);
  const [category, setCategory] = useState<Category>(initialCategory ?? 'produce');
  const [categoryTouched, setCategoryTouched] = useState(initialCategory !== undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTermTouched, setSearchTermTouched] = useState(false);
  const [error, setError] = useState('');

  function handleNameChange(newName: string) {
    setName(newName);
    setError('');

    // Category is guessed first so unit-guessing (which uses category as a
    // fallback) sees the up-to-date value rather than a stale one - React
    // state updates aren't synchronous, so this is computed locally instead
    // of reading back the `category` state variable in the same call.
    const effectiveCategory = categoryTouched ? category : guessCategory(newName);
    if (!categoryTouched) setCategory(effectiveCategory);
    if (!unitTouched) setUnit(guessUnit(newName, effectiveCategory));
    if (!searchTermTouched) setSearchTerm(deriveSearchTerm(newName));
  }

  function handleCategoryChange(newCategory: Category) {
    setCategory(newCategory);
    setCategoryTouched(true);
    if (!unitTouched) setUnit(guessUnit(name, newCategory));
  }

  function handleUnitChange(newUnit: string) {
    setUnit(newUnit);
    setUnitTouched(true);
  }

  function handleSearchTermChange(newTerm: string) {
    setSearchTerm(newTerm);
    setSearchTermTouched(true);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Give it a name first.');
      return;
    }
    const finalSearchTerm = searchTerm.trim() || deriveSearchTerm(name);
    onSubmit(name.trim(), qty, unit, category, finalSearchTerm);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-wrap items-end gap-3 rounded-2xl bg-purple p-4">
      <div className="flex flex-col">
        <label className="mb-1 text-xs text-yolk " htmlFor="ing-name">
          Ingredient
        </label>
        <input
          id="ing-name"
          autoFocus
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="e.g. Costco green onion"
          className="w-44 rounded-lg bg-mauve  px-3 py-2 text-sm text-ice outline-none focus:ring-2 focus:ring-yellow"
        />
        {error && <span className="mt-1 text-xs text-coral">{error}</span>}
      </div>

      <div className="flex flex-col">
        <label className="mb-1 text-xs text-yolk " htmlFor="ing-search">
          Search &amp; photo as
        </label>
        <input
          id="ing-search"
          value={searchTerm}
          onChange={(e) => handleSearchTermChange(e.target.value)}
          placeholder="e.g. green onion"
          className="w-36 rounded-lg bg-mauve  px-3 py-2 text-sm text-ice outline-none focus:ring-2 focus:ring-yellow"
        />
      </div>

      <div className="flex flex-col">
        <label className="mb-1 text-xs text-yolk " htmlFor="ing-qty">
          Qty
        </label>
        <input
          id="ing-qty"
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
          className="w-16 rounded-lg bg-mauve  px-3 py-2 text-sm text-ice outline-none focus:ring-2 focus:ring-yellow"
        />
      </div>

      <div className="flex flex-col">
        <label className="mb-1 text-xs text-yolk " htmlFor="ing-unit">
          Unit
        </label>
        <select
          id="ing-unit"
          value={unit}
          onChange={(e) => handleUnitChange(e.target.value)}
          className="rounded-lg bg-mauve  px-3 py-2 text-sm text-ice outline-none focus:ring-2 focus:ring-yellow"
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

      <div className="flex flex-col">
        <label className="mb-1 text-xs text-yolk " htmlFor="ing-cat">
          Category
        </label>
        <select
          id="ing-cat"
          value={category}
          onChange={(e) => handleCategoryChange(e.target.value as Category)}
          className="rounded-lg bg-mauve  px-3 py-2 text-sm text-ice outline-none focus:ring-2 focus:ring-yellow"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" className="rounded-lg bg-yellow px-4 py-2 text-sm font-medium text-frost">
        Add to fridge
      </button>
      <button type="button" onClick={onCancel} className="text-sm text-yolk  hover:text-ice">
        Cancel
      </button>
    </form>
  );
}
