import { Recipe } from '../types';
import { classifyFromSpoonacular } from './effort';
import { TermGroups, countTierMatches } from './priority';

const BASE = 'https://api.spoonacular.com';

interface SpoonacularStep {
  step: string;
  equipment?: { name: string }[];
}

interface SpoonacularMissedIngredient {
  name: string;
}

interface SpoonacularNamed {
  name?: string;
  nameClean?: string;
}

export interface SearchResult {
  recipes: Recipe[];
  // Per recipe, how many of the person's items in each priority tier it uses (see priority.ts).
  tierMatches: Map<string | number, number[]>;
}

// Carries Spoonacular's HTTP status so the API route can tell the user what
// actually went wrong (bad key vs. out of daily points) instead of a generic
// error. The message deliberately never includes the request URL, since that
// URL contains the API key.
export class SpoonacularError extends Error {
  status: number;
  constructor(step: string, status: number) {
    super(`Spoonacular ${step} failed: ${status}`);
    this.name = 'SpoonacularError';
    this.status = status;
  }
}

export async function searchSpoonacular(
  ingredientNames: string[],
  apiKey: string,
  groups: TermGroups
): Promise<SearchResult> {
  const tierMatches = new Map<string | number, number[]>();
  if (ingredientNames.length === 0) return { recipes: [], tierMatches };

  const key = encodeURIComponent(apiKey);

  const findUrl = `${BASE}/recipes/findByIngredients?ingredients=${encodeURIComponent(
    ingredientNames.join(',')
  )}&number=12&ranking=1&ignorePantry=true&apiKey=${key}`;

  const findRes = await fetch(findUrl);
  if (!findRes.ok) throw new SpoonacularError('findByIngredients', findRes.status);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const findData: any[] = await findRes.json();
  if (findData.length === 0) return { recipes: [], tierMatches };

  const ids = findData.map((r) => r.id).join(',');
  const infoUrl = `${BASE}/recipes/informationBulk?ids=${ids}&apiKey=${key}`;

  const infoRes = await fetch(infoUrl);
  if (!infoRes.ok) throw new SpoonacularError('informationBulk', infoRes.status);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const infoData: any[] = await infoRes.json();

  const infoById = new Map(infoData.map((r) => [r.id, r]));

  const recipes = findData.map((base) => {
    const info = infoById.get(base.id) ?? {};
    const steps: string[] = info.analyzedInstructions?.[0]?.steps?.map((s: SpoonacularStep) => s.step) ?? [];
    const equipment: string[] =
      info.analyzedInstructions?.[0]?.steps?.flatMap(
        (s: SpoonacularStep) => s.equipment?.map((e) => e.name) ?? []
      ) ?? [];
    const missingIngredients: string[] =
      (base.missedIngredients as SpoonacularMissedIngredient[] | undefined)?.map((m) => m.name) ?? [];

    const usedNames: string[] = ((base.usedIngredients ?? []) as SpoonacularNamed[]).flatMap((u) =>
      [u.name, u.nameClean].filter((n): n is string => Boolean(n))
    );
    const recipeIngredients: string[] = ((info.extendedIngredients ?? []) as SpoonacularNamed[]).flatMap((e) =>
      [e.nameClean, e.name].filter((n): n is string => Boolean(n))
    );
    tierMatches.set(base.id, countTierMatches(groups, usedNames, recipeIngredients));

    return {
      id: base.id,
      title: base.title,
      image: base.image,
      sourceUrl: info.sourceUrl,
      readyMinutes: info.readyInMinutes ?? null,
      missingCount: base.missedIngredientCount,
      missingIngredients,
      makeableFromScratch: [], // populated centrally in the API route
      usedCount: base.usedIngredientCount,
      tags: classifyFromSpoonacular(info.readyInMinutes ?? null, steps, equipment),
      steps: steps.length > 0 ? steps : ['Full steps are on the source site - open the recipe link.'],
    } as Recipe;
  });

  return { recipes, tierMatches };
}
