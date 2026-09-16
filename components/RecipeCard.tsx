'use client';

import { useState } from 'react';
import { Recipe } from '@/lib/types';

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl bg-panelRaised p-4">
      <div className="flex gap-3">
        {recipe.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={recipe.image} alt="" className="h-16 w-16 rounded-lg object-cover" />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-sm font-medium text-ice">{recipe.title}</p>
          <p className="mt-0.5 font-mono text-xs text-muted">
            {recipe.readyMinutes !== null ? `${recipe.readyMinutes} min` : ''}
            {recipe.missingCount > 0 ? ` - missing ${recipe.missingCount}` : ' - you have it all'}
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {recipe.tags.map((t) => (
              <span key={t} className="rounded-full bg-panel px-2 py-0.5 font-mono text-[10px] text-mint">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
      <button onClick={() => setOpen((o) => !o)} className="mt-3 text-xs font-medium text-mint hover:underline">
        {open ? 'Hide details' : 'Show details'}
      </button>
      {open && (
        <div className="mt-2 space-y-3">
          {recipe.makeableFromScratch.length > 0 && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">You can make from scratch</p>
              <ul className="mt-1 space-y-1 text-xs text-mint">
                {recipe.makeableFromScratch.map((m, i) => (
                  <li key={i}>
                    <span className="font-medium">{m.name}</span> - using {m.components.join(', ')}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {recipe.missingIngredients.length > 0 && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">Missing</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-coral">
                {recipe.missingIngredients.map((ing, i) => (
                  <li key={i}>{ing}</li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Steps</p>
            <ol className="mt-1 list-decimal space-y-1 pl-4 text-xs text-muted">
              {recipe.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      )}
      {recipe.sourceUrl && (
        <a
          href={recipe.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-2 block text-xs text-muted hover:text-ice"
        >
          Open source recipe
        </a>
      )}
    </div>
  );
}
