import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Claim } from '../../types';
import {
  colors,
  spacing,
  radius,
  fontSizes,
  fontWeights,
  fontFamilies,
  letterSpacings,
} from '../../constants/theme';
import { HomeStackParamList } from '../../navigation/ReceiverTabs';

type Props = {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'ClaimSuccess'>;
  route: RouteProp<HomeStackParamList, 'ClaimSuccess'>;
};

function claimCode(claim: Claim): string {
  return 'PNY-' + claim.claimId.replace(/\W/g, '').toUpperCase().slice(-5);
}

function pickupEndTime(pickupWindow: string): string {
  return pickupWindow.split('–')[1]?.trim() ?? pickupWindow;
}

export default function ClaimSuccessScreen({ navigation, route }: Props) {
  const { claim } = route.params;
  const insets = useSafeAreaInsets();

  const goHome = () => navigation.navigate('ReceiverHome');

  return (
    <SafeAreaView style={styles.screen} edges={['bottom']}>

      {/* Close button */}
      <TouchableOpacity
        style={[styles.closeBtn, { top: insets.top + spacing.md }]}
        onPress={goHome}
      >
        <Ionicons name="close" size={20} color={colors.textPrimary} />
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >

        {/* Success icon */}
        <View style={styles.successCircle}>
          <Ionicons name="checkmark" size={52} color={colors.textInverse} />
        </View>

        <Text style={styles.heading}>Meal claimed!</Text>
        <Text style={styles.subheading}>
          Show this QR at the counter to collect your meal.
        </Text>

        {/* Claim QR card */}
        <View style={styles.qrCard}>
          <Ionicons name="qr-code" size={160} color={colors.textPrimary} />
          <Text style={styles.claimCodeLabel}>CLAIM CODE</Text>
          <Text style={styles.claimCode}>{claimCode(claim)}</Text>
        </View>

        {/* Pickup details */}
        <Text style={styles.sectionLabel}>Pickup details</Text>

        <View style={styles.detailsCard}>

          {/* Row 1 — restaurant + food */}
          <View style={styles.detailRow}>
            <View style={[styles.detailIcon, { backgroundColor: colors.avatarBg }]}>
              <MaterialCommunityIcons name="silverware-fork-knife" size={16} color={colors.accentPrimary} />
            </View>
            <View style={styles.detailText}>
              <Text style={styles.detailPrimary}>{claim.restaurantName}</Text>
              <Text style={styles.detailSecondary}>{claim.foodName}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Row 2 — address + map link */}
          <View style={styles.detailRow}>
            <View style={[styles.detailIcon, { backgroundColor: colors.surfaceSecondary }]}>
              <Ionicons name="location" size={16} color={colors.textMuted} />
            </View>
            <View style={styles.detailText}>
              <Text style={styles.detailPrimary}>{claim.pickupAddress}</Text>
              <Text style={styles.detailSecondary}>{claim.distanceKm.toFixed(1)} km away</Text>
            </View>
            <TouchableOpacity hitSlop={8}>
              <Text style={styles.mapLink}>Map</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Row 3 — time window */}
          <View style={styles.detailRow}>
            <View style={[styles.detailIcon, { backgroundColor: colors.goldLight }]}>
              <Ionicons name="time" size={16} color={colors.warningYellow} />
            </View>
            <View style={styles.detailText}>
              <Text style={styles.detailPrimary}>Today, {claim.pickupWindow}</Text>
              <Text style={styles.detailSecondary}>
                Reservation expires after {pickupEndTime(claim.pickupWindow)}
              </Text>
            </View>
          </View>

        </View>

        {/* Daily limit notice */}
        {!claim.dailyLimit.canClaim && (
          <View style={styles.limitBox}>
            <Text style={styles.limitText}>
              You've used your daily claim. Limit resets at midnight.
            </Text>
          </View>
        )}

      </ScrollView>

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.85} onPress={goHome}>
          <Ionicons name="home" size={18} color={colors.textInverse} style={styles.btnIcon} />
          <Text style={styles.primaryBtnText}>Back to browse</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryBtn}
          activeOpacity={0.7}
          onPress={() => navigation.getParent()?.navigate('History')}
        >
          <MaterialCommunityIcons name="history" size={18} color={colors.textPrimary} style={styles.btnIcon} />
          <Text style={styles.secondaryBtnText}>View in history</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },

  closeBtn: {
    position: 'absolute',
    left: spacing['2xl'],
    zIndex: 10,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scroll: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: 72,
    paddingBottom: spacing['2xl'],
    alignItems: 'center',
  },

  successCircle: {
    width: 124,
    height: 124,
    borderRadius: radius.pill,
    backgroundColor: colors.successGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['2xl'],
  },

  heading: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacings.subheading,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subheading: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['14'],
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: spacing.md,
    marginBottom: spacing['2xl'],
  },

  qrCard: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing['2xl'],
    marginBottom: spacing['2xl'],
    gap: spacing.xs,
  },
  claimCodeLabel: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    letterSpacing: 1,
    marginTop: spacing.md,
  },
  claimCode: {
    fontFamily: Platform.select({ ios: 'Courier New', android: 'monospace' }),
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    letterSpacing: 1.02,
    marginTop: spacing.xs,
  },

  sectionLabel: {
    alignSelf: 'flex-start',
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    letterSpacing: -0.425,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },

  detailsCard: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailText: { flex: 1 },
  detailPrimary: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['14'],
    fontWeight: fontWeights.semiBold,
    letterSpacing: -0.21,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  detailSecondary: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    color: colors.textMuted,
  },
  mapLink: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['14'],
    fontWeight: fontWeights.semiBold,
    color: colors.accentPrimary,
  },
  divider: { height: 1, backgroundColor: colors.borderDefault },

  limitBox: {
    width: '100%',
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.input,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: spacing.lg,
  },
  limitText: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    color: colors.textPrimary,
    lineHeight: 20,
  },

  actions: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing.lg,
    paddingTop: spacing['3xl'],
    gap: spacing.md,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentPrimary,
    borderRadius: radius.card,
    height: 54,
    gap: spacing.sm,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.card,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    height: 54,
    gap: spacing.sm,
  },
  btnIcon: {},
  primaryBtnText: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacings.button,
    color: colors.textInverse,
  },
  secondaryBtnText: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacings.button,
    color: colors.textPrimary,
  },
});
