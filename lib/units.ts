import { Category } from './types';

// Fallback when nothing in the name matches a specific hint below.
export const CATEGORY_DEFAULT_UNIT: Record<Category, string> = {
  produce: 'pcs',
  protein: 'g',
  dairy: 'ml',
  pantry: 'g',
  other: 'pcs',
};

// Matched against whole words in the ingredient name (not substrings), so
// "hard-boiled egg" won't false-positive on "oil" via "boiled".
// Extend this list freely - it's just keyword -> unit.
const NAME_UNIT_HINTS: { keywords: string[]; unit: string }[] = [
  {
    unit: 'ml',
    keywords: [
      'milk', 'water', 'juice', 'oil', 'broth', 'stock', 'cream',
      'vinegar', 'sauce', 'syrup', 'wine', 'beer', 'yogurt',
    ],
  },
  {
    unit: 'pcs',
    keywords: [
      'egg', 'eggs', 'onion', 'onions', 'garlic', 'tomato', 'tomatoes',
      'potato', 'potatoes', 'lemon', 'lemons', 'lime', 'limes', 'apple',
      'apples', 'banana', 'bananas', 'pepper', 'peppers', 'avocado',
      'avocados', 'carrot', 'carrots', 'cucumber', 'cucumbers',
    ],
  },
  {
    unit: 'g',
    keywords: [
      'flour', 'sugar', 'rice', 'pasta', 'butter', 'cheese', 'chicken',
      'beef', 'pork', 'fish', 'salmon', 'oats', 'beans', 'lentils',
      'bacon', 'tofu', 'shrimp',
    ],
  },
];

function wordsOf(text: string): string[] {
  return text.toLowerCase().split(/[^a-z]+/).filter(Boolean);
}

/**
 * Name-specific hints take priority (e.g. "milk" always suggests ml, even
 * under the "pantry" category); category default is the fallback for
 * anything not in the list.
 */
export function guessUnit(name: string, category: Category): string {
  const words = wordsOf(name);
  for (const hint of NAME_UNIT_HINTS) {
    if (hint.keywords.some((k) => words.includes(k))) return hint.unit;
  }
  return CATEGORY_DEFAULT_UNIT[category];
}
