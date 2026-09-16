import { Category } from './types';

// Single words are matched against whole words in the name (so "boiled"
// never falsely matches a single-word keyword like "oil"). Multi-word
// phrases are matched as whole phrases within the name instead.
const CATEGORY_HINTS: { category: Category; keywords: string[] }[] = [
  {
    // Eggs are grouped here deliberately, matching how people actually
    // shop and stock a fridge (same aisle/shelf as milk and yogurt) rather
    // than a strict nutritional "eggs = protein" categorization.
    category: 'dairy',
    keywords: [
      'egg', 'eggs', 'milk', 'yogurt', 'yoghurt', 'cheese', 'butter',
      'cream', 'buttermilk', 'ghee', 'sour cream', 'half and half',
      'cottage cheese', 'whipped cream',
    ],
  },
  {
    category: 'protein',
    keywords: [
      'chicken', 'beef', 'pork', 'turkey', 'bacon', 'sausage', 'ham',
      'fish', 'salmon', 'tuna', 'shrimp', 'tofu', 'tempeh', 'steak',
      'lamb', 'duck', 'crab', 'lobster',
    ],
  },
  {
    category: 'produce',
    keywords: [
      'apple', 'apples', 'banana', 'bananas', 'lettuce', 'spinach', 'kale',
      'tomato', 'tomatoes', 'onion', 'onions', 'garlic', 'carrot', 'carrots',
      'potato', 'potatoes', 'pepper', 'peppers', 'cucumber', 'cucumbers',
      'broccoli', 'cauliflower', 'lemon', 'lemons', 'lime', 'limes',
      'avocado', 'avocados', 'mushroom', 'mushrooms', 'celery', 'zucchini',
      'squash', 'corn', 'peas', 'grape', 'grapes', 'berry', 'berries',
      'strawberry', 'strawberries', 'blueberry', 'blueberries', 'orange',
      'oranges', 'mango', 'cabbage', 'cilantro', 'parsley', 'basil', 'ginger',
    ],
  },
  {
    category: 'pantry',
    keywords: [
      'flour', 'sugar', 'rice', 'pasta', 'oats', 'beans', 'lentils', 'bread',
      'cereal', 'broth', 'stock', 'oil', 'vinegar', 'honey', 'syrup',
      'noodles', 'quinoa', 'crackers', 'chips', 'jam', 'ketchup', 'mustard',
      'mayonnaise', 'soy sauce', 'salsa', 'peanut butter',
    ],
  },
];

function nameWords(text: string): string[] {
  return text.toLowerCase().split(/[^a-z]+/).filter(Boolean);
}

function matchesKeyword(nameLower: string, words: string[], keyword: string): boolean {
  if (keyword.includes(' ')) {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${escaped}\\b`).test(nameLower);
  }
  return words.includes(keyword);
}

/**
 * Guesses a fridge category from the ingredient name alone. Falls back to
 * 'other' when nothing matches - the category dropdown stays editable so a
 * wrong guess is always a click away from a fix, not a dead end.
 */
export function guessCategory(name: string): Category {
  const nameLower = name.toLowerCase();
  const words = nameWords(name);
  for (const hint of CATEGORY_HINTS) {
    if (hint.keywords.some((k) => matchesKeyword(nameLower, words, k))) {
      return hint.category;
    }
  }
  return 'other';
}
