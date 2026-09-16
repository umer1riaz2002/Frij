import { EffortTag } from '../types';

const HANDS_OFF_WORDS = [
  'oven', 'bake', 'baked', 'roast', 'roasted', 'simmer', 'simmered',
  'slow cook', 'crockpot', 'sheet pan',
];

const ACTIVE_WORDS = ['stir', 'saute', 'sauté', 'whisk', 'chop', 'flip', 'fold', 'knead'];

export function classifyFromSpoonacular(
  readyMinutes: number | null,
  steps: string[],
  equipment: string[]
): EffortTag[] {
  const tags: EffortTag[] = [];

  if (readyMinutes !== null && readyMinutes <= 20) tags.push('quick');

  const uniqueEquipment = new Set(equipment.map((e) => e.toLowerCase()));
  if (uniqueEquipment.size <= 1) tags.push('one-pot');

  const text = steps.join(' ').toLowerCase();
  const activeStepCount = steps.filter((s) =>
    ACTIVE_WORDS.some((w) => s.toLowerCase().includes(w))
  ).length;
  if (HANDS_OFF_WORDS.some((w) => text.includes(w)) && activeStepCount <= 2) {
    tags.push('hands-off');
  }

  if (steps.length > 0 && steps.length <= 4) tags.push('minimal');

  return tags;
}
