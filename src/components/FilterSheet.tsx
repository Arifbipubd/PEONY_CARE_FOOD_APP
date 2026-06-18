import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import BottomSheet from './BottomSheet';
import { FoodItem, FoodCategory } from '../types';
import { colors, spacing, radius, fontSizes, fontWeights } from '../constants/theme';

export type ShowOnlyFilters = {
  sponsored: boolean;
  pickupUnder1h: boolean;
  halal: boolean;
  vegetarian: boolean;
};

export type FilterState = {
  category: FoodCategory | null;
  maxDistanceKm: number;
  showOnly: ShowOnlyFilters;
};

export const DEFAULT_FILTERS: FilterState = {
  category: null,
  maxDistanceKm: 5,
  showOnly: { sponsored: false, pickupUnder1h: false, halal: false, vegetarian: false },
};

const CATEGORY_OPTIONS: { label: string; value: FoodCategory | null }[] = [
  { label: 'All', value: null },
  { label: 'Rice', value: 'RICE' },
  { label: 'Noodles', value: 'NOODLES' },
  { label: 'Bread', value: 'BREAD' },
  { label: 'Snacks', value: 'SNACKS' },
  { label: 'Drinks', value: 'DRINKS' },
];

const SHOW_ONLY_OPTIONS: { label: string; key: keyof ShowOnlyFilters }[] = [
  { label: 'Sponsored', key: 'sponsored' },
  { label: 'Pickup < 1h', key: 'pickupUnder1h' },
  { label: 'Halal', key: 'halal' },
  { label: 'Vegetarian', key: 'vegetarian' },
];

export function matchesFilters(food: FoodItem, f: FilterState): boolean {
  if (f.category && food.category !== f.category) return false;
  if (food.distanceKm > f.maxDistanceKm) return false;
  if (f.showOnly.sponsored && food.sponsorshipType === 'DIRECT') return false;
  if (f.showOnly.halal && !food.isHalal) return false;
  if (f.showOnly.vegetarian && !food.isVegetarian) return false;
  if (f.showOnly.pickupUnder1h) {
    const msLeft = new Date(food.pickupEnd).getTime() - Date.now();
    if (!(msLeft > 0 && msLeft <= 60 * 60 * 1000)) return false;
  }
  return true;
}

type Props = {
  visible: boolean;
  onClose: () => void;
  foods: FoodItem[];
  value: FilterState;
  onApply: (filters: FilterState) => void;
};

export default function FilterSheet({ visible, onClose, foods, value, onApply }: Props) {
  const [draft, setDraft] = useState<FilterState>(value);

  useEffect(() => {
    if (visible) setDraft(value);
  }, [visible, value]);

  const resultCount = foods.filter((f) => matchesFilters(f, draft)).length;

  const toggleShowOnly = (key: keyof ShowOnlyFilters) => {
    setDraft((d) => ({ ...d, showOnly: { ...d.showOnly, [key]: !d.showOnly[key] } }));
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.header}>
        <Text style={styles.title}>Filter meals</Text>
        <TouchableOpacity onPress={() => setDraft(DEFAULT_FILTERS)} hitSlop={8}>
          <Text style={styles.reset}>Reset</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionLabel}>CATEGORY</Text>
      <View style={styles.chipsWrap}>
        {CATEGORY_OPTIONS.map((c) => {
          const active = draft.category === c.value;
          return (
            <TouchableOpacity
              key={c.label}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setDraft((d) => ({ ...d, category: c.value }))}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{c.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.distanceHeader}>
        <Text style={styles.sectionLabel}>DISTANCE</Text>
        <Text style={styles.distanceValue}>{draft.maxDistanceKm} km</Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={1}
        maximumValue={20}
        step={1}
        value={draft.maxDistanceKm}
        minimumTrackTintColor={colors.accentPrimary}
        maximumTrackTintColor={colors.borderDefault}
        thumbTintColor={colors.accentPrimary}
        onValueChange={(v) => setDraft((d) => ({ ...d, maxDistanceKm: v }))}
      />

      <Text style={styles.sectionLabel}>SHOW ONLY</Text>
      <View style={styles.chipsWrap}>
        {SHOW_ONLY_OPTIONS.map((opt) => {
          const active = draft.showOnly[opt.key];
          return (
            <TouchableOpacity
              key={opt.key}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => toggleShowOnly(opt.key)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{opt.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.cancelBtn} activeOpacity={0.7} onPress={onClose}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.applyBtn}
          activeOpacity={0.85}
          onPress={() => {
            onApply(draft);
            onClose();
          }}
        >
          <Text style={styles.applyBtnText}>Show {resultCount} meals</Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  reset: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.accentPrimary,
  },

  sectionLabel: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },

  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  chip: {
    borderRadius: radius.chip,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceSecondary,
  },
  chipActive: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  chipText: {
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
    fontWeight: fontWeights.medium,
  },
  chipTextActive: {
    color: colors.textInverse,
  },

  distanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distanceValue: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  slider: {
    width: '100%',
    height: 36,
    marginBottom: spacing.xl,
  },

  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cancelBtn: {
    flex: 1,
    borderRadius: radius.card,
    backgroundColor: colors.surfaceSecondary,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  applyBtn: {
    flex: 1.6,
    borderRadius: radius.card,
    backgroundColor: colors.accentPrimary,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  applyBtnText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.textInverse,
  },
});
