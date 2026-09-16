const NOISE_PHRASES = [
  // Big-box / retailer names people prefix onto bulk items
  'costco', 'walmart', "sam's club", 'sams club', 'kirkland', 'bjs', "bj's",
  "trader joe's", 'trader joes', 'whole foods', 'wholefoods', 'aldi',
  'safeway', 'kroger', 'publix', 'target', 'no name', 'great value',
  "president's choice", 'presidents choice',
  // Size/pack descriptors that don't change what the ingredient IS
  'family size', 'family pack', 'value pack', 'party size', 'jumbo pack',
  'bulk', 'jumbo', 'mega pack', 'multipack', 'multi pack', 'economy size',
];

function stripPhrase(text: string, phrase: string): string {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`\\b${escaped}\\b`, 'gi');
  return text.replace(re, ' ');
}

/**
 * Turns "Costco green onion" into "green onion" so recipe search and
 * ingredient-image lookups match against the actual food, not the brand
 * or pack size it was bought as. The original name the user typed is
 * still what's shown in the UI - this only powers matching/images.
 */
export function deriveSearchTerm(name: string): string {
  let result = name.toLowerCase();
  for (const phrase of NOISE_PHRASES) {
    result = stripPhrase(result, phrase);
  }
  result = result.replace(/\s+/g, ' ').trim();
  return result || name.trim();
}
