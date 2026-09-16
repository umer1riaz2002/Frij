// TheMealDB serves ingredient photos as all-lowercase, with underscores in
// place of spaces (confirmed against their own docs and ingredient pages -
// e.g. "lime.png", "lime-small.png" - NOT capitalized, NOT %20-encoded).
// This is a separate, independent use of TheMealDB from recipe search -
// it's just a free photo source and has nothing to do with which API
// (Spoonacular) is used to find recipes.
function toMealDbSlug(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, '_');
}

// Their database doesn't always use the name people actually say - e.g.
// green/spring onions are filed only under "scallions." Extend as more
// mismatches turn up.
const IMAGE_NAME_ALIASES: Record<string, string> = {
  'green onion': 'scallions',
  'green onions': 'scallions',
  'spring onion': 'scallions',
  'spring onions': 'scallions',
  'scallion': 'scallions',
};

/**
 * Best-effort match for generic ingredient names, free, no key required.
 * Pair this with <ImageWithFallback> so a miss falls back to a neutral
 * placeholder instead of a broken image.
 */
export function mealDbIngredientImageUrl(searchTerm: string | undefined | null): string {
  const cleaned = (searchTerm ?? '').trim().toLowerCase();
  const canonical = IMAGE_NAME_ALIASES[cleaned] ?? cleaned;
  const slug = toMealDbSlug(canonical);
  return `https://www.themealdb.com/images/ingredients/${encodeURIComponent(slug)}-small.png`;
}
