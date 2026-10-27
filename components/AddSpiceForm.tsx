'use client';

import { FormEvent, useState } from 'react';
import { deriveSearchTerm } from '@/lib/ingredientName';

interface Props {
  onSubmit: (name: string, searchTerm: string) => void;
  onCancel: () => void;
}

export default function AddSpiceForm({ onSubmit, onCancel }: Props) {
  const [name, setName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTermTouched, setSearchTermTouched] = useState(false);
  const [error, setError] = useState('');

  function handleNameChange(newName: string) {
    setName(newName);
    setError('');
    if (!searchTermTouched) setSearchTerm(deriveSearchTerm(newName));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Give it a name first.');
      return;
    }
    onSubmit(name.trim(), searchTerm.trim() || deriveSearchTerm(name));
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-wrap items-end gap-3 rounded-2xl bg-purple p-4">
      <div className="flex flex-col">
        <label className="mb-1 text-xs text-yolk " htmlFor="spice-name">
          Spice / seasoning
        </label>
        <input
          id="spice-name"
          autoFocus
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="e.g. salt/pepper"
          className="w-44 rounded-lg bg-mauve  px-3 py-2 text-sm text-ice outline-none focus:ring-2 focus:ring-yellow"
        />
        {error && <span className="mt-1 text-xs text-coral">{error}</span>}
      </div>
      <div className="flex flex-col">
        <label className="mb-1 text-xs text-yolk " htmlFor="spice-search">
          Search &amp; photo as
        </label>
        <input
          id="spice-search"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setSearchTermTouched(true);
          }}
          placeholder="e.g. guajillo pepper"
          className="w-40 rounded-lg bg-mauve  px-3 py-2 text-sm text-ice outline-none focus:ring-2 focus:ring-yellow"
        />
      </div>
      <button type="submit" className="rounded-lg bg-yellow px-4 py-2 text-sm font-medium text-frost">
        Add to rack
      </button>
      <button type="button" onClick={onCancel} className="text-sm text-yolk  hover:text-ice">
        Cancel
      </button>
    </form>
  );
}
