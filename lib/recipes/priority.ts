import { ingredientsMatch } from '../ingredientMatch';

// Matching priority, highest first. Spices are deliberately last.
export type Tier = 'protein' | 'pantry' | 'dairy' | 'produce' | 'other' | 'spices';
export const TIER_ORDER: Tier[] = ['protein', 'pantry', 'dairy', 'produce', 'other', 'spices'];

export type TermGroups = Record<Tier, string[]>;

export function emptyGroups(): TermGroups {
  return { protein: [], pantry: [], dairy: [], produce: [], other: [], spices: [] };
}

// Spices are never sent to Spoonacular's ingredient search; they are only used afterwards, to decide
// what counts as missing and as the last tie-break. These staples are also left out of the search
// itself wherever they live (fridge or spice rack), because recipes matching "salt + pepper + oil"
// crowded out simple recipes built on the real ingredients. Edit freely.
const STAPLES = new Set([
  'salt', 'pepper', 'black pepper', 'ground black pepper', 'oil', 'olive oil', 'vegetable oil',
  'cooking oil', 'canola oil', 'water',
]);

export function isStaple(term: string): boolean {
  return STAPLES.has(term.trim().toLowerCase());
}

const MAX_TERM_LENGTH = 60;
const MAX_TERMS_PER_TIER = 50;

function cleanList(raw: string | null): string[] {
  if (!raw) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of raw.split(',')) {
    const term = part.trim();
    const key = term.toLowerCase();
    if (!term || term.length > MAX_TERM_LENGTH || seen.has(key)) continue;
    seen.add(key);
    out.push(term);
    if (out.length >= MAX_TERMS_PER_TIER) break;
  }
  return out;
}

/**
 * Reads the tiers from the request: ?protein=a,b&pantry=c&dairy=...&produce=...&other=...&spices=...
 * An old-style ?ingredients=a,b,c is still accepted and treated as one unranked group ("other").
 */
export function parseGroups(params: URLSearchParams): TermGroups {
  const groups = emptyGroups();
  for (const tier of TIER_ORDER) groups[tier] = cleanList(params.get(tier));
  const legacy = cleanList(params.get('ingredients'));
  if (legacy.length > 0) groups.other = Array.from(new Set([...groups.other, ...legacy]));
  return groups;
}

/** Terms sent to Spoonacular: every non-spice term except staples. */
export function searchTerms(groups: TermGroups): string[] {
  const out: string[] = [];
  for (const tier of TIER_ORDER) {
    if (tier === 'spices') continue;
    for (const term of groups[tier]) if (!isStaple(term) && !out.includes(term)) out.push(term);
  }
  return out;
}

/** Everything the person has on hand, used to decide what a recipe is missing. */
export function allTerms(groups: TermGroups): string[] {
  return Array.from(new Set(TIER_ORDER.flatMap((t) => groups[t])));
}

/**
 * For one recipe, how many of the person's items in each tier it uses (in TIER_ORDER order).
 * `usedNames` are the ingredients Spoonacular matched to the search; `recipeIngredients` is the
 * recipe's full ingredient list. Spices and staples are matched against the full list, because they
 * were not part of the search.
 */
export function countTierMatches(groups: TermGroups, usedNames: string[], recipeIngredients: string[]): number[] {
  return TIER_ORDER.map((tier) =>
    groups[tier].filter((term) => {
      const names = tier === 'spices' || isStaple(term) ? recipeIngredients : usedNames;
      return names.some((n) => ingredientsMatch(term, n));
    }).length
  );
}

interface Rankable {
  id: string | number;
  missingCount: number;
}

/**
 * Orders recipes by the hierarchy: more protein matches first, then pantry/grain, dairy, produce,
 * other; then fewer missing ingredients; then more spice matches. Original order breaks any remaining tie.
 */
export function rankRecipes<T extends Rankable>(recipes: T[], matches: Map<string | number, number[]>): T[] {
  const lastTier = TIER_ORDER.length - 1; // spices
  return recipes
    .map((r, index) => ({ r, index, m: matches.get(r.id) ?? TIER_ORDER.map(() => 0) }))
    .sort((a, b) => {
      for (let i = 0; i < lastTier; i++) if (a.m[i] !== b.m[i]) return b.m[i] - a.m[i];
      if (a.r.missingCount !== b.r.missingCount) return a.r.missingCount - b.r.missingCount;
      if (a.m[lastTier] !== b.m[lastTier]) return b.m[lastTier] - a.m[lastTier];
      return a.index - b.index;
    })
    .map((x) => x.r);
}
