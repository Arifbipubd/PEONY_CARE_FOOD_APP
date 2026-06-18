import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Claim } from '../../types';
import { colors, spacing, radius, fontSizes, fontWeights } from '../../constants/theme';
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
          <Ionicons name="checkmark" size={44} color={colors.textInverse} />
        </View>

        <Text style={styles.heading}>Meal claimed!</Text>
        <Text style={styles.subheading}>
          Show this QR at the counter to collect your complementary meal.
        </Text>

        {/* Claim QR card */}
        <View style={styles.qrCard}>
          {/* QR placeholder */}
          <View style={styles.qrPlaceholder}>
            <Ionicons name="qr-code-outline" size={80} color={colors.borderDefault} />
          </View>
          <Text style={styles.claimCodeLabel}>CLAIM CODE</Text>
          <Text style={styles.claimCode}>{claimCode(claim)}</Text>
        </View>

        {/* Pickup details */}
        <Text style={styles.sectionLabel}>Pickup details</Text>

        <View style={styles.detailsCard}>

          {/* Row 1 — restaurant + food */}
          <View style={styles.detailRow}>
            <View style={[styles.detailIcon, { backgroundColor: '#FCE4E4' }]}>
              <Ionicons name="restaurant-outline" size={16} color={colors.accentPrimary} />
            </View>
            <View style={styles.detailText}>
              <Text style={styles.detailPrimary}>{claim.restaurantName}</Text>
              <Text style={styles.detailSecondary}>{claim.foodName}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Row 2 — address + map link */}
          <View style={styles.detailRow}>
            <View style={[styles.detailIcon, { backgroundColor: colors.borderDefault }]}>
              <Ionicons name="location-outline" size={16} color={colors.textMuted} />
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
            <View style={[styles.detailIcon, { backgroundColor: '#FEF9E7' }]}>
              <Ionicons name="time-outline" size={16} color={colors.warningYellow} />
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
          <Text style={styles.primaryBtnText}>Back to browse</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryBtn}
          activeOpacity={0.7}
          onPress={() => navigation.getParent()?.navigate('History')}
        >
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
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSecondary,
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
    width: 88,
    height: 88,
    borderRadius: radius.pill,
    backgroundColor: colors.successGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },

  heading: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subheading: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing['2xl'],
  },

  qrCard: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing.xl,
    marginBottom: spacing['2xl'],
    gap: spacing.sm,
  },
  qrPlaceholder: {
    width: 160,
    height: 160,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  claimCodeLabel: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    fontWeight: fontWeights.semiBold,
    letterSpacing: 1,
  },
  claimCode: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    letterSpacing: 2,
  },

  sectionLabel: {
    alignSelf: 'flex-start',
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
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
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailText: { flex: 1, gap: spacing.xs },
  detailPrimary: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semiBold,
    color: colors.textPrimary,
  },
  detailSecondary: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  mapLink: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semiBold,
    color: colors.accentPrimary,
  },
  divider: { height: 1, backgroundColor: colors.borderDefault, marginLeft: 56 + spacing.lg },

  limitBox: {
    width: '100%',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  limitText: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    lineHeight: 20,
    textAlign: 'center',
  },

  actions: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing.lg,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderDefault,
    paddingTop: spacing.md,
  },
  primaryBtn: {
    backgroundColor: colors.accentPrimary,
    borderRadius: radius.card,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.textInverse,
  },
  secondaryBtn: {
    borderRadius: radius.card,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
});
