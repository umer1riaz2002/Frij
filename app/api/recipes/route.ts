import { NextRequest, NextResponse } from 'next/server';
import { searchSpoonacular } from '@/lib/recipes/spoonacular';
import { refineMissingIngredients } from '@/lib/recipes/refine';
import { Recipe } from '@/lib/types';

// Caps how many "what's this composite ingredient made of" lookups a
// single search is allowed to trigger, across all returned recipes combined.
const DECOMPOSE_BUDGET = 6;

export async function GET(request: NextRequest) {
  const ingredientsParam = request.nextUrl.searchParams.get('ingredients');
  const names = (ingredientsParam ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (names.length === 0) {
    return NextResponse.json(
      { error: 'Add at least one ingredient to your fridge first.' },
      { status: 400 }
    );
  }

  const apiKey = process.env.SPOONACULAR_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          'Spoonacular API key missing. Add SPOONACULAR_API_KEY to .env.local and restart the dev server.',
      },
      { status: 500 }
    );
  }

  try {
    let recipes: Recipe[] = await searchSpoonacular(names, apiKey);

    // Sort first so the "almost there" recipes are the ones that get the
    // budget-limited composite-ingredient lookups below.
    recipes.sort((a, b) => a.missingCount - b.missingCount);

    let budget = DECOMPOSE_BUDGET;
    const refined: Recipe[] = [];
    for (const r of recipes) {
      const { recipe, spent } = await refineMissingIngredients(r, names, budget, apiKey);
      budget -= spent;
      refined.push(recipe);
    }
    recipes = refined;

    // Re-sort - a recipe's missingCount can drop after refinement.
    recipes.sort((a, b) => a.missingCount - b.missingCount);

    return NextResponse.json({ recipes });
  } catch (err) {
    console.error('[api/recipes]', err);
    return NextResponse.json(
      { error: 'Could not reach the recipe service. Try again in a moment.' },
      { status: 502 }
    );
  }
}
