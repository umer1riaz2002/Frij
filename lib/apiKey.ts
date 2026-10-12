// The user's own Spoonacular key lives only in this browser's localStorage.
// It is sent to Frij's /api/recipes route in a request header on each search
// (see components/RecipePanel.tsx), and that route forwards it to Spoonacular.
// It is never written to a database or logged.
const KEY = 'frij:spoonacular-key:v1';

// Set once the visitor has made a choice on the intro screen (entered a key
// or picked the demo key), so the intro doesn't show again on every visit.
const INTRO_KEY = 'frij:intro-seen:v1';

export function getSpoonacularKey(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const value = window.localStorage.getItem(KEY);
    return value && value.trim() ? value.trim() : null;
  } catch {
    return null;
  }
}

export function setSpoonacularKey(key: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(KEY, key.trim());
    return true;
  } catch {
    // Storage unavailable (private browsing, blocked site data).
    return false;
  }
}

export function clearSpoonacularKey(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Nothing to clear if storage is unavailable.
  }
}

export function hasSeenIntro(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(INTRO_KEY) === '1';
  } catch {
    return false;
  }
}

export function markIntroSeen(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(INTRO_KEY, '1');
  } catch {
    // If storage is blocked the intro simply shows again next visit.
  }
}

export function maskKey(key: string): string {
  return key.length <= 4 ? '••••' : `••••••••${key.slice(-4)}`;
}

// Same pattern the server enforces in app/api/recipes/route.ts, so a typo or
// stray characters get caught here with a friendly message instead of a 400.
export const KEY_PATTERN = /^[A-Za-z0-9_-]{8,100}$/;

export function isPlausibleKey(key: string): boolean {
  return KEY_PATTERN.test(key.trim());
}
