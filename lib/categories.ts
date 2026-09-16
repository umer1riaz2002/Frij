import { Category } from './types';

export const CATEGORIES: { value: Category; label: string; borderClass: string; emoji: string }[] = [
  { value: 'produce', label: 'Produce', borderClass: 'border-mint', emoji: '🥦' },
  { value: 'protein', label: 'Protein', borderClass: 'border-coral', emoji: '🍗' },
  { value: 'dairy', label: 'Dairy', borderClass: 'border-chill', emoji: '🥛' },
  { value: 'pantry', label: 'Pantry / grain', borderClass: 'border-sand', emoji: '🌾' },
  { value: 'other', label: 'Other', borderClass: 'border-muted', emoji: '🧺' },
];
