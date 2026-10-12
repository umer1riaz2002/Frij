'use client';

import { useState } from 'react';
import { EffortTag, Recipe } from '@/lib/types';
import { getSpoonacularKey } from '@/lib/apiKey';
import EnergySlider from './EnergySlider';
import FilterChips from './FilterChips';
import RecipeCard from './RecipeCard';

interface Props {
  searchTerms: string[];
  onOpenSettings?: () => void;
}

// Error codes that are fixed by changing the API key in Settings.
const KEY_ERROR_CODES = ['no_key', 'bad_key', 'quota'];

export default function RecipePanel({ searchTerms, onOpenSettings }: Props) {
  const [recipes, setRecipes] = useState<Recipe[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [activeFilters, setActiveFilters] = useState<EffortTag[]>(['quick']); // matches the 'Okay' default level below
  const [energyLevel, setEnergyLevel] = useState(2);

  async function findRecipes() {
    setLoading(true);
    setError('');
    setErrorCode('');
    try {
      const key = getSpoonacularKey();
      const res = await fetch(`/api/recipes?ingredients=${encodeURIComponent(searchTerms.join(','))}`, {
        headers: key ? { 'x-spoonacular-key': key } : {},
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong finding recipes.');
        setErrorCode(data.code ?? '');
        setRecipes(null);
      } else {
        setRecipes(data.recipes);
      }
    } catch {
      setError('Could not reach the recipe service. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  function toggleFilter(tag: EffortTag) {
    setActiveFilters((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  const visible = recipes?.filter((r) => activeFilters.every((f) => r.tags.includes(f))) ?? [];

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-sm font-medium uppercase tracking-wide text-muted">Recipes</h2>
        <button
          onClick={findRecipes}
          disabled={searchTerms.length === 0 || loading}
          className="rounded-lg bg-mint px-4 py-2 text-sm font-medium text-frost disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? 'Looking...' : 'Find recipes'}
        </button>
      </div>

      <EnergySlider
        value={energyLevel}
        onChange={(level, filters) => {
          setEnergyLevel(level);
          setActiveFilters(filters);
        }}
      />

      {error && (
        <div className="mb-3">
          <p className="text-sm text-coral">{error}</p>
          {onOpenSettings && KEY_ERROR_CODES.includes(errorCode) && (
            <button onClick={onOpenSettings} className="mt-1 text-xs font-medium text-mint hover:underline">
              Open Settings
            </button>
          )}
        </div>
      )}

      {recipes && recipes.length > 0 && <FilterChips active={activeFilters} onToggle={toggleFilter} />}

      {recipes && recipes.length === 0 && !error && (
        <p className="text-sm text-muted">No recipes matched what&apos;s in your fridge yet. Try adding a few more items.</p>
      )}

      {recipes && recipes.length > 0 && visible.length === 0 && (
        <p className="text-sm text-muted">Nothing matches those filters - try loosening one, or bump your energy level up.</p>
      )}

      <div className="space-y-3">
        {visible.map((r) => (
          <RecipeCard key={r.id} recipe={r} />
        ))}
      </div>
    </section>
  );
}
