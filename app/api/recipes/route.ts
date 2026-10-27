import { NextRequest, NextResponse } from 'next/server';
import { searchSpoonacular, SpoonacularError } from '@/lib/recipes/spoonacular';
import { refineMissingIngredients } from '@/lib/recipes/refine';
import { parseGroups, searchTerms, allTerms, rankRecipes } from '@/lib/recipes/priority';
import { Recipe } from '@/lib/types';

// Caps how many "what's this composite ingredient made of" lookups a
// single search is allowed to trigger, across all returned recipes combined.
const DECOMPOSE_BUDGET = 6;

// The user's own key arrives in this header (saved in their browser via the
// Settings page). The key ends up inside a request URL to Spoonacular, so it
// is checked against a strict pattern first - anything with stray characters
// (like "&" or spaces) is rejected rather than passed along.
const KEY_HEADER = 'x-spoonacular-key';
const KEY_PATTERN = /^[A-Za-z0-9_-]{8,100}$/;

export async function GET(request: NextRequest) {
  // Items arrive grouped by priority tier (protein, pantry, dairy, produce, other, spices).
  const groups = parseGroups(request.nextUrl.searchParams);
  const queryTerms = searchTerms(groups); // what Spoonacular is asked about: no spices, no staples
  const names = allTerms(groups); // everything on hand, used to decide what is missing

  if (queryTerms.length === 0) {
    return NextResponse.json(
      { error: 'Add at least one ingredient to your fridge first. Spices alone are not enough to search with.' },
      { status: 400 }
    );
  }

  const headerKey = request.headers.get(KEY_HEADER)?.trim();
  if (headerKey && !KEY_PATTERN.test(headerKey)) {
    return NextResponse.json(
      { error: "That API key doesn't look valid. Check it in Settings.", code: 'bad_key' },
      { status: 400 }
    );
  }

  // The user's own key wins. The server's key (from .env.local) is only a
  // fallback - leave it unset on a public deployment so nobody spends yours.
  const apiKey = headerKey || process.env.SPOONACULAR_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'No Spoonacular API key yet. Add yours in Settings to find recipes.', code: 'no_key' },
      { status: 401 }
    );
  }

  try {
    const found = await searchSpoonacular(queryTerms, apiKey, groups);
    let recipes: Recipe[] = found.recipes;

    // Rank first so the best matches are the ones that get the
    // budget-limited composite-ingredient lookups below.
    recipes = rankRecipes(recipes, found.tierMatches);

    let budget = DECOMPOSE_BUDGET;
    const refined: Recipe[] = [];
    for (const r of recipes) {
      const { recipe, spent } = await refineMissingIngredients(r, names, budget, apiKey);
      budget -= spent;
      refined.push(recipe);
    }
    recipes = refined;

    // Re-rank - a recipe's missingCount can drop after refinement.
    recipes = rankRecipes(recipes, found.tierMatches);

    return NextResponse.json({ recipes });
  } catch (err) {
    if (err instanceof SpoonacularError) {
      if (err.status === 401 || err.status === 403) {
        return NextResponse.json(
          { error: 'Spoonacular rejected that API key. Check it in Settings.', code: 'bad_key' },
          { status: 401 }
        );
      }
      if (err.status === 402) {
        return NextResponse.json(
          {
            error:
              "This Spoonacular key has used up its daily points. They reset daily, or you can switch to a different key in Settings.",
            code: 'quota',
          },
          { status: 402 }
        );
      }
      if (err.status === 429) {
        return NextResponse.json(
          { error: 'Spoonacular is rate-limiting this key. Wait a minute and try again.', code: 'rate_limited' },
          { status: 429 }
        );
      }
    }
    // Log the error object only - never the request URL, which contains the key.
    console.error('[api/recipes]', err instanceof Error ? err.message : 'unknown error');
    return NextResponse.json(
      { error: 'Could not reach the recipe service. Try again in a moment.' },
      { status: 502 }
    );
  }
}
