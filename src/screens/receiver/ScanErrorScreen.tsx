import { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { colors, spacing, radius, fontSizes, fontWeights, fontFamilies } from '../../constants/theme';
import { HomeStackParamList } from '../../navigation/ReceiverTabs';

type Props = {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'ScanError'>;
  route: RouteProp<HomeStackParamList, 'ScanError'>;
};

const REASONS = [
  {
    n: 1,
    label: 'Code expired',
    detail: 'This listing is no longer available today.',
  },
  {
    n: 2,
    label: 'Wrong restaurant',
    detail: 'This claim belongs to a different partner.',
  },
  {
    n: 3,
    label: 'Bad lighting',
    detail: 'Move closer or turn on the flash and try again.',
  },
];

function formatDistanceM(metres: number): string {
  if (metres >= 1000) return `${(metres / 1000).toFixed(1)} km`;
  return `${Math.round(metres)} m`;
}

export default function ScanErrorScreen({ navigation, route }: Props) {
  const { expectedFoodId, reason = 'UNREADABLE', distanceM } = route.params;
  const isTooFar = reason === 'TOO_FAR';
  const needsLocation = reason === 'NO_LOCATION';

  const heading = isTooFar
    ? "You're too far away"
    : needsLocation
      ? 'Location needed'
      : "Can't read this QR";

  const body = isTooFar
    ? 'You must be within 500 m of the restaurant to claim.'
    : needsLocation
      ? 'We need your location to confirm you are at the restaurant.'
      : "The code didn't match an active claim. A few things to check:";

  const distanceLabel = useMemo(() => {
    if (!isTooFar || distanceM == null || Number.isNaN(distanceM)) return '';
    return `You're about ${formatDistanceM(distanceM)} away right now.`;
  }, [isTooFar, distanceM]);

  const handleTryAgain = useCallback(
    () => navigation.navigate('QrScanner', { expectedFoodId }),
    [navigation, expectedFoodId],
  );

  const handleBackToListing = useCallback(
    () => navigation.navigate('FoodDetail', { foodId: expectedFoodId }),
    [navigation, expectedFoodId],
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={[styles.iconCircle, (isTooFar || needsLocation) && styles.iconCircleWarn]}>
          <Ionicons
            name={isTooFar ? 'navigate' : needsLocation ? 'location-outline' : 'qr-code-outline'}
            size={48}
            color={isTooFar || needsLocation ? colors.pickupOrange : colors.accentPrimary}
          />
        </View>
        <Text style={styles.heading}>{heading}</Text>
        <Text style={styles.body}>{body}</Text>
        {distanceLabel ? (
          <View style={styles.distanceChip}>
            <Ionicons name="walk-outline" size={14} color={colors.pickupOrange} />
            <Text style={styles.distanceText}>{distanceLabel}</Text>
          </View>
        ) : null}

        {reason === 'UNREADABLE' ? (
          <View style={styles.reasonsList}>
            {REASONS.map((r, i) => (
              <View key={r.n}>
                <View style={styles.reasonRow}>
                  <View style={styles.reasonBadge}>
                    <Text style={styles.reasonBadgeText}>{r.n}</Text>
                  </View>
                  <View style={styles.reasonText}>
                    <Text style={styles.reasonLabel}>{r.label}</Text>
                    <Text style={styles.reasonDetail}>{r.detail}</Text>
                  </View>
                </View>
                {i < REASONS.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        ) : null}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryBtn}
          activeOpacity={0.85}
          onPress={isTooFar || needsLocation ? handleBackToListing : handleTryAgain}
        >
          <Text style={styles.primaryBtnText}>
            {isTooFar || needsLocation ? 'Back to listing' : 'Try again'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryBtn}
          activeOpacity={0.7}
          onPress={isTooFar || needsLocation ? handleTryAgain : handleBackToListing}
        >
          <Text style={styles.secondaryBtnText}>
            {isTooFar || needsLocation ? 'Try again' : 'Back to listing'}
          </Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },

  header: {
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
    gap: spacing.lg,
  },

  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: radius.pill,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  iconCircleWarn: {
    backgroundColor: colors.goldLight,
  },

  heading: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  body: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },

  distanceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.warningYellowLight,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  distanceText: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.sm,
    color: colors.pickupOrange,
  },

  reasonsList: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    overflow: 'hidden',
    marginTop: spacing.md,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.lg,
    gap: spacing.md,
  },
  divider: { height: 1, backgroundColor: colors.borderDefault },
  reasonBadge: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  reasonBadgeText: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold,
    color: colors.accentPrimary,
  },
  reasonText: { flex: 1, gap: spacing.xs },
  reasonLabel: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semiBold,
    color: colors.textPrimary,
  },
  reasonDetail: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },

  actions: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['2xl'],
    gap: spacing.sm,
  },
  primaryBtn: {
    backgroundColor: colors.accentPrimary,
    borderRadius: radius.card,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.textInverse,
  },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
});
