export type Category = 'produce' | 'protein' | 'dairy' | 'pantry' | 'other';

export interface FridgeItem {
  id: string;
  name: string;
  searchTerm: string;
  qty: number;
  unit: string;
  category: Category;
}

export interface SpiceItem {
  id: string;
  name: string;
  searchTerm: string;
}

export interface GroceryItem {
  id: string;
  name: string;
  searchTerm: string;
  qty: number;
  unit: string;
}

export type EffortTag = 'quick' | 'one-pot' | 'hands-off' | 'minimal';

export interface Recipe {
  id: string | number;
  title: string;
  image?: string;
  sourceUrl?: string;
  readyMinutes: number | null;
  missingCount: number;
  missingIngredients: string[];
  makeableFromScratch: { name: string; components: string[] }[];
  usedCount: number;
  tags: EffortTag[];
  steps: string[];
}

export interface RecipeResponse {
  recipes: Recipe[];
}
