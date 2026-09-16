interface SpoonacularExtendedIngredient {
  name?: string;
  nameClean?: string;
}

// A handful of keywords that suggest a "missing ingredient" is actually a
// prepared/composite item (a sauce, paste, seasoning blend...) rather than
// a single raw ingredient - worth checking whether the fridge already
// covers what it's typically made from. This only decides WHETHER to look
// something up, not what it contains - that part is fetched live below.
const COMPOSITE_HINT_WORDS = [
  'sauce', 'paste', 'salsa', 'dressing', 'seasoning', 'marinade',
  'dip', 'relish', 'chutney', 'pesto', 'gravy', 'rub', 'mix',
];

export function looksComposite(name: string): boolean {
  const lower = name.toLowerCase();
  return COMPOSITE_HINT_WORDS.some((w) => lower.includes(w));
}

/**
 * Looks up a recipe matching this composite ingredient's name and returns
 * ITS ingredient list as the "components" - fetched live from Spoonacular,
 * so nothing here is a hardcoded guess at what's "in" a pico de gallo or a
 * taco seasoning. fillIngredients avoids a second round trip for the
 * ingredient list.
 */
export async function decomposeComposite(name: string, spoonacularKey: string): Promise<string[] | null> {
  const url = `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(
    name
  )}&number=1&addRecipeInformation=true&fillIngredients=true&apiKey=${spoonacularKey}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const ingredients: SpoonacularExtendedIngredient[] | undefined = data.results?.[0]?.extendedIngredients;
  if (!ingredients || ingredients.length === 0) return null;

  return ingredients.map((ing) => ing.nameClean || ing.name).filter((n): n is string => Boolean(n));
}
