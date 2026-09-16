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

export async function searchSpoonacular(ingredientNames: string[], apiKey: string): Promise<Recipe[]> {
  if (ingredientNames.length === 0) return [];

  const findUrl = `${BASE}/recipes/findByIngredients?ingredients=${encodeURIComponent(
    ingredientNames.join(',')
  )}&number=12&ranking=1&ignorePantry=true&apiKey=${apiKey}`;

  const findRes = await fetch(findUrl);
  if (!findRes.ok) throw new Error(`Spoonacular findByIngredients failed: ${findRes.status}`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const findData: any[] = await findRes.json();
  if (findData.length === 0) return [];

  const ids = findData.map((r) => r.id).join(',');
  const infoUrl = `${BASE}/recipes/informationBulk?ids=${ids}&apiKey=${apiKey}`;

  const infoRes = await fetch(infoUrl);
  if (!infoRes.ok) throw new Error(`Spoonacular informationBulk failed: ${infoRes.status}`);
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
