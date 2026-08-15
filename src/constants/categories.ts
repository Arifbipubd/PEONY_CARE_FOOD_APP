import type { FoodCategory } from '../types';

export const FOOD_CATEGORIES: { value: FoodCategory; label: string }[] = [
  { value: 'COOKED_MEAL',  label: 'Cooked meal' },
  { value: 'RICE',         label: 'Rice' },
  { value: 'NOODLES',      label: 'Noodles' },
  { value: 'BREAD_BAKERY', label: 'Bread & bakery' },
  { value: 'VEGETABLES',   label: 'Vegetables' },
  { value: 'FRUITS',       label: 'Fruits' },
  { value: 'PROTEIN',      label: 'Meat & protein' },
  { value: 'SOUP',         label: 'Soup' },
  { value: 'DESSERT',      label: 'Dessert' },
  { value: 'DRINKS',       label: 'Drinks' },
  { value: 'PACKAGED',     label: 'Packaged food' },
  { value: 'OTHER',        label: 'Other' },
];

const LABEL_BY_VALUE: Record<string, string> = Object.fromEntries(
  FOOD_CATEGORIES.map(({ value, label }) => [value, label]),
);

export function foodCategoryLabel(value: string): string {
  return LABEL_BY_VALUE[value]
    ?? value.charAt(0) + value.slice(1).toLowerCase().replace(/_/g, ' ');
}
