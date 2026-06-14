import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, radius, fontSizes, fontWeights } from '../constants/theme';

// ─── Status Badge ─────────────────────────────────────────────────────────────
// Small pill showing availability: "2 left", "Available", "Expired", etc.

type BadgeColor = 'red' | 'green' | 'yellow' | 'grey';

const BG: Record<BadgeColor, string> = {
  red:    colors.accentLight,
  green:  '#DCFCE7',
  yellow: '#FEF9C3',
  grey:   colors.surfaceSecondary,
};

const FG: Record<BadgeColor, string> = {
  red:    colors.accentPrimary,
  green:  colors.successGreen,
  yellow: colors.warningYellow,
  grey:   colors.textMuted,
};

interface StatusBadgeProps {
  label: string;
  color?: BadgeColor;
}

export function StatusBadge({ label, color = 'red' }: StatusBadgeProps) {
  return (
    <View style={[styles.statusBadge, { backgroundColor: BG[color] }]}>
      <Text style={[styles.statusText, { color: FG[color] }]}>{label}</Text>
    </View>
  );
}

// ─── Category Chip ────────────────────────────────────────────────────────────
// Tappable filter pill: "All", "Rice", "Noodles", etc.
// active = dark filled; inactive = white with border

interface CategoryChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
}

export function CategoryChip({ label, active = false, onPress }: CategoryChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
    >
      <Text style={[styles.chipText, active ? styles.chipTextActive : styles.chipTextInactive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.badge,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semiBold,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: colors.textPrimary,
  },
  chipInactive: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
  },
  chipText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
  },
  chipTextActive: {
    color: colors.textInverse,
  },
  chipTextInactive: {
    color: colors.textPrimary,
  },
});
