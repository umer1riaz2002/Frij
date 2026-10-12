import { Recipe } from '../types';
import { classifyFromSpoonacular } from './effort';

const BASE = 'https://api.spoonacular.com';

interface SpoonacularStep {
  step: string;
  equipment?: { name: string }[];
}

interface SpoonacularMissedIngredient {
  name: string;
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

export async function searchSpoonacular(ingredientNames: string[], apiKey: string): Promise<Recipe[]> {
  if (ingredientNames.length === 0) return [];

  const key = encodeURIComponent(apiKey);

  const findUrl = `${BASE}/recipes/findByIngredients?ingredients=${encodeURIComponent(
    ingredientNames.join(',')
  )}&number=12&ranking=1&ignorePantry=true&apiKey=${key}`;

  const findRes = await fetch(findUrl);
  if (!findRes.ok) throw new SpoonacularError('findByIngredients', findRes.status);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const findData: any[] = await findRes.json();
  if (findData.length === 0) return [];

  const ids = findData.map((r) => r.id).join(',');
  const infoUrl = `${BASE}/recipes/informationBulk?ids=${ids}&apiKey=${key}`;

  const infoRes = await fetch(infoUrl);
  if (!infoRes.ok) throw new SpoonacularError('informationBulk', infoRes.status);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const infoData: any[] = await infoRes.json();

  const infoById = new Map(infoData.map((r) => [r.id, r]));

  return findData.map((base) => {
    const info = infoById.get(base.id) ?? {};
    const steps: string[] = info.analyzedInstructions?.[0]?.steps?.map((s: SpoonacularStep) => s.step) ?? [];
    const equipment: string[] =
      info.analyzedInstructions?.[0]?.steps?.flatMap(
        (s: SpoonacularStep) => s.equipment?.map((e) => e.name) ?? []
      ) ?? [];
    const missingIngredients: string[] =
      (base.missedIngredients as SpoonacularMissedIngredient[] | undefined)?.map((m) => m.name) ?? [];

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
}
