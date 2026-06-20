import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import BottomSheet from './BottomSheet';
import { FoodItem, FoodCategory } from '../types';
import { colors, spacing, radius, fontSizes, fontWeights, fontFamilies } from '../constants/theme';

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
        <Text style={[styles.sectionLabel, styles.distanceSectionLabel]}>DISTANCE</Text>
        <Text style={styles.distanceValue}>{draft.maxDistanceKm} km</Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={1}
        maximumValue={20}
        step={1}
        value={draft.maxDistanceKm}
        minimumTrackTintColor={colors.sliderBlue}
        maximumTrackTintColor={colors.borderDefault}
        thumbTintColor={colors.sliderBlue}
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
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    letterSpacing: -0.5,      // component-specific
    color: colors.textPrimary,
  },
  reset: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['12'],
    fontWeight: fontWeights.semiBold,
    color: colors.accentPrimary,
  },

  sectionLabel: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold,
    letterSpacing: 0.88,      // component-specific
    color: colors.textMuted,
    marginBottom: 12,         // component-specific
  },
  distanceSectionLabel: {
    marginBottom: 0,
  },

  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  chip: {
    borderRadius: radius.pill,
    paddingHorizontal: 14,    // component-specific
    paddingVertical: 8,       // component-specific
    backgroundColor: colors.surfaceSecondary,
  },
  chipActive: {
    backgroundColor: colors.textPrimary,
  },
  chipText: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['12'],
    fontWeight: fontWeights.semiBold,
    color: colors.textPrimary,
  },
  chipTextActive: {
    color: colors.textInverse,
  },

  distanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,         // component-specific — matches slider margin-top in Figma
  },
  distanceValue: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    letterSpacing: -0.5,      // component-specific
    color: colors.textPrimary,
  },
  slider: {
    height: 16,               // component-specific — matches Figma slider height
    marginBottom: spacing.xl,
  },

  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cancelBtn: {
    flex: 1,
    height: 50,               // component-specific
    borderRadius: radius.input,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['14'],
    fontWeight: fontWeights.semiBold,
    color: colors.textPrimary,
  },
  applyBtn: {
    flex: 1.6,
    height: 50,               // component-specific
    borderRadius: radius.input,
    backgroundColor: colors.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accentPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  applyBtnText: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['14'],
    fontWeight: fontWeights.bold,
    letterSpacing: 0.28,      // component-specific
    color: colors.textInverse,
  },
});
