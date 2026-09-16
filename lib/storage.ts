import { FridgeItem, SpiceItem, GroceryItem } from './types';
import { deriveSearchTerm } from './ingredientName';

const FRIDGE_KEY = 'frij:fridge:v1';
const SPICE_KEY = 'frij:spicerack:v1';
const GROCERY_KEY = 'frij:grocerylist:v1';

export function loadFridge(): FridgeItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(FRIDGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Partial<FridgeItem>[];

    // Back-fill items saved before `searchTerm` (or other fields) existed,
    // so fridge data from an older version of the app doesn't crash on load.
    return parsed
      .filter((i): i is Partial<FridgeItem> & { id: string; name: string } => Boolean(i.id && i.name))
      .map((i) => ({
        id: i.id as string,
        name: i.name as string,
        searchTerm: i.searchTerm || deriveSearchTerm(i.name as string),
        qty: i.qty ?? 1,
        unit: i.unit ?? 'pcs',
        category: i.category ?? 'other',
      }));
  } catch {
    return [];
  }
}

export function saveFridge(items: FridgeItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(FRIDGE_KEY, JSON.stringify(items));
  } catch {
    // Storage unavailable (private browsing, quota) - the app still works in-memory for this session.
  }
}

export function loadSpiceRack(): SpiceItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(SPICE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Partial<SpiceItem>[];
    return parsed
      .filter((s): s is Partial<SpiceItem> & { id: string; name: string } => Boolean(s.id && s.name))
      .map((s) => ({
        id: s.id as string,
        name: s.name as string,
        searchTerm: s.searchTerm || deriveSearchTerm(s.name as string),
      }));
  } catch {
    return [];
  }
}

export function saveSpiceRack(spices: SpiceItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SPICE_KEY, JSON.stringify(spices));
  } catch {
    // Storage unavailable - still works in-memory for this session.
  }
}

export function loadGroceryList(): GroceryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(GROCERY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Partial<GroceryItem>[];
    return parsed
      .filter((g): g is Partial<GroceryItem> & { id: string; name: string } => Boolean(g.id && g.name))
      .map((g) => ({
        id: g.id as string,
        name: g.name as string,
        searchTerm: g.searchTerm || deriveSearchTerm(g.name as string),
        qty: g.qty ?? 1,
        unit: g.unit ?? 'pcs',
      }));
  } catch {
    return [];
  }
}

export function saveGroceryList(groceries: GroceryItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(GROCERY_KEY, JSON.stringify(groceries));
  } catch {
    // Storage unavailable - still works in-memory for this session.
  }
}
