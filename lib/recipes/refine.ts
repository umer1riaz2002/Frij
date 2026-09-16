import { Recipe } from '../types';
import { looksComposite, decomposeComposite } from './decompose';
import { ingredientsMatch } from '../ingredientMatch';

/**
 * Cleans up a recipe's missing-ingredients list in two passes:
 *
 * 1. Re-verifies each "missing" ingredient against our own word-based
 *    matcher (ingredientsMatch) before trusting it - Spoonacular's
 *    missedIngredients field comes from ITS OWN matching engine, so this
 *    catches cases where their matching is stricter than ours (e.g. plural
 *    mismatches, or a recipe saying "juice of lime" when the fridge just
 *    has "lime").
 *
 * 2. Checks composite/prepared ingredients (e.g. "pico de gallo sauce")
 *    against a REAL recipe for that item, fetched live from Spoonacular -
 *    instead of a hardcoded dictionary. If the fridge (fridge items + spice
 *    rack, both passed in via fridgeTerms) already covers most of what
 *    that lookup returns, it moves from "missing" into a separate "you can
 *    make this from scratch" list.
 *
 * There's no staple-ingredient filtering here - salt, pepper, etc. are only
 * excluded from "missing" if the user has actually put them in their Spize
 * Rak, which flows in through fridgeTerms like anything else.
 *
 * decomposeBudget bounds how many composite lookups this call may spend, so
 * one "Find recipes" click can't fan out into dozens of extra requests -
 * returns how much of the budget it used, so the caller can track it
 * across recipes.
 */
export async function refineMissingIngredients(
  recipe: Recipe,
  fridgeTerms: string[],
  decomposeBudget: number,
  spoonacularKey: string
): Promise<{ recipe: Recipe; spent: number }> {
  // Pass 1: re-verify against our own matcher, regardless of what
  // Spoonacular's own matching originally flagged.
  const reVerifiedMissing = recipe.missingIngredients.filter(
    (m) => !fridgeTerms.some((f) => ingredientsMatch(m, f))
  );

  const stillMissing: string[] = [];
  const makeableFromScratch: { name: string; components: string[] }[] = [];
  let spent = 0;

  // Only worth the extra lookups for recipes that are already close -
  // keeps this bounded instead of decomposing ingredients for a recipe
  // missing a dozen things nobody's going to make from scratch anyway.
  const worthTrying = reVerifiedMissing.length > 0 && reVerifiedMissing.length <= 3;

  for (const missing of reVerifiedMissing) {
    if (worthTrying && spent < decomposeBudget && looksComposite(missing)) {
      spent += 1;
      const components = await decomposeComposite(missing, spoonacularKey);
      if (components) {
        const missingComponents = components.filter(
          (c) => !fridgeTerms.some((f) => ingredientsMatch(c, f))
        );
        // Allow one component's worth of slack - a live-sourced ingredient
        // list is messier than a hand-curated one (it'll include things
        // like "salt" or "fresh cilantro" that may not phrase-match a
        // fridge/spice-rack entry exactly), so requiring a perfect match
        // would undersell what this is actually catching.
        if (missingComponents.length <= 1) {
          makeableFromScratch.push({ name: missing, components });
          continue;
        }
      }
    }
    stillMissing.push(missing);
  }

  return {
    recipe: {
      ...recipe,
      missingIngredients: stillMissing,
      missingCount: stillMissing.length,
      makeableFromScratch,
    },
    spent,
  };
}
