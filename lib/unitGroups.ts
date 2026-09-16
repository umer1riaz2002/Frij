export const UNIT_GROUPS: { label: string; units: { value: string; label: string }[] }[] = [
  {
    label: 'Count',
    units: [
      { value: 'pcs', label: 'pcs' },
      { value: 'dozen', label: 'dozen' },
    ],
  },
  {
    label: 'Metric',
    units: [
      { value: 'g', label: 'g' },
      { value: 'kg', label: 'kg' },
      { value: 'ml', label: 'ml' },
      { value: 'l', label: 'l' },
    ],
  },
  {
    label: 'Imperial',
    units: [
      { value: 'oz', label: 'oz' },
      { value: 'lb', label: 'lb' },
      { value: 'tsp', label: 'tsp' },
      { value: 'tbsp', label: 'tbsp' },
      { value: 'fl oz', label: 'fl oz' },
      { value: 'cup', label: 'cup' },
      { value: 'pint', label: 'pint' },
      { value: 'quart', label: 'quart' },
      { value: 'gallon', label: 'gallon' },
    ],
  },
];
