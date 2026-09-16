const STOPWORDS = new Set([
  'of', 'fresh', 'chopped', 'diced', 'minced', 'sliced', 'ground',
  'grated', 'crushed', 'juice', 'zest', 'peeled', 'cooked', 'raw',
  'large', 'small', 'medium', 'a', 'an', 'the', 'to', 'taste', 'and',
]);

function naiveSingular(word: string): string {
  return word.endsWith('s') && word.length > 3 ? word.slice(0, -1) : word;
}

function significantWords(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w))
    .map(naiveSingular);
}

/**
 * Compares two ingredient strings by their meaningful words rather than
 * raw substrings, so "Juice of Lime" matches a fridge item named "Lime"
 * or "Limes" - a plain substring check fails on plurals and prep words.
 *
 * Stripping words like "juice"/"zest" as noise is a deliberate choice: if
 * you have the whole fruit, you can make its juice or zest yourself, so
 * treating them as equivalent under-flags rather than over-flags what's
 * actually missing.
 *
 * Known limitation: this is still word-overlap, not real understanding -
 * "olive oil" and "vegetable oil" will match each other via the shared
 * word "oil".
 */
export function ingredientsMatch(a: string, b: string): boolean {
  const wordsA = significantWords(a);
  const wordsB = significantWords(b);
  if (wordsA.length === 0 || wordsB.length === 0) return false;
  return wordsA.some((w) => wordsB.includes(w));
}
