import { useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Claim } from '../../types';
import {
  colors,
  spacing,
  radius,
  fontSizes,
  fontFamilies,
  letterSpacings,
} from '../../constants/theme';
import { HomeStackParamList } from '../../navigation/ReceiverTabs';

type Props = {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'ClaimSuccess'>;
  route: RouteProp<HomeStackParamList, 'ClaimSuccess'>;
};

const { width: SCREEN_W } = Dimensions.get('window');

const CONFETTI_COLORS = [
  '#D31B1B', '#26A34E', '#F59E0B', '#3B82F6',
  '#8B5CF6', '#EC4899', '#F97316', '#10B981',
];
const PIECE_COUNT = 16;

export default function ClaimSuccessScreen({ navigation, route }: Props) {
  const { claim } = route.params;
  const insets = useSafeAreaInsets();

  // Capture collection time once on mount
  const collectedAt = useRef(
    new Date().toLocaleTimeString('en-SG', { hour: 'numeric', minute: '2-digit', hour12: true })
  ).current;

  // Stable per-mount confetti config — random values fixed at creation
  const confetti = useRef(
    Array.from({ length: PIECE_COUNT }, (_, i) => ({
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      endX: (Math.random() - 0.5) * 240,
      endY: -(160 + Math.random() * 160),
      w: 7 + Math.round(Math.random() * 5),
      h: 10 + Math.round(Math.random() * 4),
      rotate: `${Math.round(Math.random() * 360)}deg`,
      dur: 850 + Math.round(Math.random() * 350),
      delay: i * 55,
      tx: new Animated.Value(0),
      ty: new Animated.Value(0),
      op: new Animated.Value(1),
    }))
  ).current;

  useEffect(() => {
    const animations = confetti.map((p) =>
      Animated.sequence([
        Animated.delay(p.delay),
        Animated.parallel([
          Animated.timing(p.tx, { toValue: p.endX, duration: p.dur, useNativeDriver: true }),
          Animated.timing(p.ty, { toValue: p.endY, duration: p.dur, useNativeDriver: true }),
          Animated.timing(p.op, { toValue: 0, duration: Math.round(p.dur * 0.8), useNativeDriver: true }),
        ]),
      ])
    );
    Animated.parallel(animations).start();
  }, []);

  const goHome = () => navigation.navigate('ReceiverHome');

  const goReview = () =>
    navigation.navigate('WriteReview', {
      restaurantId: claim.restaurantId,
      claimId: claim.claimId,
      restaurantName: claim.restaurantName,
      restaurantPhotoUrl: claim.restaurantPhotoUrl,
      foodName: claim.foodName,
    });

  // Confetti origin: top inset + scroll paddingTop + half the success circle height
  const confettiOriginY = insets.top + 72 + 62;
  const confettiContainerStyle = useMemo<StyleProp<ViewStyle>>(
    () => [StyleSheet.absoluteFill, { top: confettiOriginY }],
    [confettiOriginY],
  );
  const closeBtnStyle = useMemo<StyleProp<ViewStyle>>(
    () => [styles.closeBtn, { top: insets.top + spacing.md }],
    [insets.top],
  );

  return (
    <SafeAreaView style={styles.screen} edges={['bottom']}>

      {/* Confetti overlay — full screen, non-interactive */}
      <View style={confettiContainerStyle} pointerEvents="none">
        {confetti.map((p, i) => (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: SCREEN_W / 2 - p.w / 2,
              top: 0,
              width: p.w,
              height: p.h,
              backgroundColor: p.color,
              borderRadius: 2,
              opacity: p.op,
              transform: [
                { translateX: p.tx },
                { translateY: p.ty },
                { rotate: p.rotate },
              ],
            }}
          />
        ))}
      </View>

      {/* Close button — no bg, no border */}
      <TouchableOpacity
        style={closeBtnStyle}
        onPress={goHome}
        hitSlop={8}
      >
        <Ionicons name="close" size={20} color={colors.textPrimary} />
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Success circle */}
        <View style={styles.successCircle}>
          <Ionicons name="checkmark" size={52} color={colors.textInverse} />
        </View>

        <Text style={styles.heading}>Meal collected!</Text>
        <Text style={styles.subheading}>
          {`Enjoy your ${claim.foodName} from ${claim.restaurantName}.`}
        </Text>

        {/* Collected section */}
        <Text style={styles.sectionLabel}>Collected</Text>

        <View style={styles.detailsCard}>
          {/* Row 1 — restaurant + food name */}
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

          {/* Row 2 — collection time + address */}
          <View style={styles.detailRow}>
            <View style={[styles.detailIcon, { backgroundColor: colors.goldLight }]}>
              <Ionicons name="checkmark-circle" size={18} color={colors.warningYellow} />
            </View>
            <View style={styles.detailText}>
              <Text style={styles.detailPrimary}>Today, {collectedAt}</Text>
              <Text style={styles.detailSecondary}>{claim.pickupAddress}</Text>
            </View>
          </View>
        </View>

        {/* Review card */}
        <View style={styles.reviewCard}>
          <Text style={styles.reviewTitle}>How was your meal?</Text>
          <Text style={styles.reviewSub}>
            Your review helps other receivers and the restaurant.
          </Text>
        </View>

        {/* Daily limit notice */}
        {!claim.dailyLimit.canClaim && (
          <View style={styles.limitBox}>
            <Ionicons name="information-circle" size={20} color={colors.textMuted} />
            <Text style={styles.limitText}>
              You've used your daily claim. Limit resets at midnight.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.85} onPress={goReview}>
          <Ionicons name="star" size={18} color={colors.textInverse} />
          <Text style={styles.primaryBtnText}>Rate this restaurant</Text>
        </TouchableOpacity>
        <Text style={styles.reviewNote}>
          You can review after the restaurant marks your claim as collected.
        </Text>
        <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.7} onPress={goHome}>
          <Ionicons name="home" size={18} color={colors.textPrimary} />
          <Text style={styles.secondaryBtnText}>Back to browse</Text>
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
    letterSpacing: letterSpacings.subheading,
    color: colors.textPrimary,
    textAlign: 'center',
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

  sectionLabel: {
    alignSelf: 'flex-start',
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.lg,
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
    flexShrink: 0,
  },

  detailText: { flex: 1 },

  detailPrimary: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['14'],
    letterSpacing: -0.21,
    color: colors.textPrimary,
    marginBottom: 2,
  },

  detailSecondary: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    color: colors.textMuted,
  },

  divider: { height: 1, backgroundColor: colors.borderDefault },

  reviewCard: {
    width: '100%',
    backgroundColor: colors.goldLight,
    borderRadius: radius.card,
    padding: 16,
    marginTop: spacing['2xl'],
    alignItems: 'center',
    gap: 4,
  },

  reviewTitle: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['16'],
    color: colors.textPrimary,
    textAlign: 'center',
  },

  reviewSub: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['14'],
    color: colors.warningYellow,
    textAlign: 'center',
    lineHeight: 21,
  },

  limitBox: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  limitText: {
    flex: 1,
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['14'],
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

  primaryBtnText: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.md,
    letterSpacing: letterSpacings.button,
    color: colors.textInverse,
  },

  reviewNote: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing['2xl'],
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    includeFontPadding: false,
  },

  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    height: 54,
    gap: spacing.sm,
  },

  secondaryBtnText: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.md,
    letterSpacing: letterSpacings.button,
    color: colors.textPrimary,
  },
});
