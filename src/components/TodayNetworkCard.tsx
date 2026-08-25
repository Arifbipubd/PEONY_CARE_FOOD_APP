import { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NetworkTodaySummary } from '../types';
import {
  colors,
  spacing,
  radius,
  fontSizes,
  fontFamilies,
} from '../constants/theme';

type Props = {
  summary: NetworkTodaySummary;
};

function TodayNetworkCard({ summary }: Props) {
  return (
    <View style={styles.card} accessibilityRole="summary">
      <Text style={styles.kicker}>Today across UDUFood</Text>

      <View style={styles.row}>
        <Ionicons name="storefront-outline" size={16} color={colors.accentPrimary} />
        <Text style={styles.body} numberOfLines={2}>
          {summary.restaurantsLabel}
        </Text>
      </View>

      <View style={styles.row}>
        <Ionicons name="checkmark-circle-outline" size={16} color={colors.successGreen} />
        <Text style={styles.meals} numberOfLines={2}>
          {summary.foodsTodayLabel}
        </Text>
      </View>
    </View>
  );
}

export default memo(TodayNetworkCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.accentLight,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.accentLightBorder,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  kicker: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.xs,
    letterSpacing: 0.88,
    textTransform: 'uppercase',
    color: colors.accentDark,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  body: {
    flex: 1,
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
  },
  meals: {
    flex: 1,
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
});
