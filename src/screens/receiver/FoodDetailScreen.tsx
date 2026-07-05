import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import SkeletonBox, { usePulse } from '../../components/SkeletonBox';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getFoodDetail, getDailyLimit } from '../../services/receiver';
import { FoodItem, DailyLimitStatus } from '../../types';
import { colors, spacing, radius, fontSizes, fontFamilies, layout } from '../../constants/theme';
import { HomeStackParamList } from '../../navigation/ReceiverTabs';

type Props = {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'FoodDetail'>;
  route: RouteProp<HomeStackParamList, 'FoodDetail'>;
};

const CATEGORY_LABELS: Record<string, string> = {
  RICE: 'Rice', NOODLES: 'Noodles', BREAD: 'Bread',
  SNACKS: 'Snacks', DRINKS: 'Drinks', OTHER: 'Other',
};

function formatPickupFull(start: string, end: string): string {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-SG', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  return `Today, ${fmt(start)} — ${fmt(end)}`;
}


function DetailSkeleton() {
  const opacity = usePulse();
  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} scrollEnabled={false}>
        <SkeletonBox opacity={opacity} height={260} borderRadius={0} />
        <View style={dSkelStyles.content}>
          <View style={dSkelStyles.titleRow}>
            <SkeletonBox opacity={opacity} height={22} style={dSkelStyles.titleFlex} />
            <SkeletonBox opacity={opacity} width={70} height={26} borderRadius={10} />
          </View>
          <SkeletonBox opacity={opacity} width={80} height={26} borderRadius={22} />
          <SkeletonBox opacity={opacity} height={14} />
          <SkeletonBox opacity={opacity} width="80%" height={14} />
          <SkeletonBox opacity={opacity} height={14} width="90%" />
          <SkeletonBox opacity={opacity} height={72} borderRadius={14} style={dSkelStyles.gap} />
          <SkeletonBox opacity={opacity} height={52} borderRadius={14} />
        </View>
      </ScrollView>
      <SafeAreaView edges={['bottom']} style={dSkelStyles.bottom}>
        <SkeletonBox opacity={opacity} height={54} borderRadius={18} />
      </SafeAreaView>
    </View>
  );
}

const dSkelStyles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  titleFlex: { flex: 1 },
  gap: { marginTop: spacing.sm },
  bottom: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderDefault,
  },
});

export default function FoodDetailScreen({ navigation, route }: Props) {
  const { foodId } = route.params;
  const insets = useSafeAreaInsets();

  const [food, setFood]             = useState<FoodItem | null>(null);
  const [dailyLimit, setDailyLimit] = useState<DailyLimitStatus | null>(null);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    Promise.allSettled([getFoodDetail(foodId), getDailyLimit()]).then(([item, limit]) => {
      if (item.status === 'fulfilled')  setFood(item.value);
      if (limit.status === 'fulfilled') setDailyLimit(limit.value);
      setLoading(false);
    });
  }, [foodId]);

  if (loading) {
    return <DetailSkeleton />;
  }

  if (!food) return null;

  const claimed = food.quantityOriginal - food.quantityAvailable;
  const pct     = Math.round((claimed / food.quantityOriginal) * 100);

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Hero image + back button */}
        <View>
          <Image source={{ uri: food.photoUrl }} style={styles.image} resizeMode="cover" />
          <TouchableOpacity
            style={[styles.backBtn, { top: insets.top + spacing.md }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>

          {/* Title + "X left" badge */}
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={2}>{food.name}</Text>
            <View style={styles.leftBadge}>
              <Text style={styles.leftBadgeText}>{food.quantityAvailable} of {food.quantityOriginal} left</Text>
            </View>
          </View>

          {/* Category chip */}
          <View style={styles.categoryChip}>
            <Text style={styles.categoryText}>
              {CATEGORY_LABELS[food.category] ?? food.category}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Restaurant info — tap name to view restaurant page */}
          <View style={styles.restaurantBlock}>
            <TouchableOpacity
              style={styles.restaurantNameRow}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('RestaurantPage', {
                restaurantId: food.restaurantId,
                distanceKm: food.distanceKm,
              })}
            >
              <Ionicons name="storefront" size={16} color={colors.accentPrimary} />
              <Text style={styles.restaurantName}>{food.restaurantName}</Text>
            </TouchableOpacity>
            <View style={styles.infoRow}>
              <Ionicons name="location" size={14} color={colors.textMuted} />
              <Text style={styles.restaurantAddress}>{food.restaurantAddress}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="navigate" size={14} color={colors.textMuted} />
              <Text style={styles.distance}>{food.distanceKm.toFixed(1)} km away</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Pickup window */}
          <View style={styles.infoRow}>
            <Ionicons name="time" size={16} color={colors.pickupOrange} />
            <Text style={styles.pickupTime}>
              {formatPickupFull(food.pickupStart, food.pickupEnd)}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* About */}
          <Text style={styles.sectionLabel}>ABOUT</Text>
          <Text style={styles.description}>{food.description}</Text>
          {food.sponsorshipType === 'DIRECT' ? (
            <View style={styles.directDonorRow}>
              <Ionicons name="heart" size={14} color={colors.goldDark} />
              <Text style={styles.sponsorLink}>Direct Donation</Text>
            </View>
          ) : (
            <View style={[
              styles.sponsorCard,
              food.sponsorshipType === 'SPONSORED_NAMED' ? styles.sponsorCardNamed : styles.sponsorCardAnon,
            ]}>
              {food.sponsorshipType === 'SPONSORED_NAMED' ? (
                <View style={styles.sponsorAvatarNamed}>
                  <Text style={styles.sponsorAvatarText}>
                    {(food.sponsorDisplayName ?? '').charAt(0).toUpperCase()}
                  </Text>
                </View>
              ) : (
                <View style={styles.sponsorAvatarAnon}>
                  <Ionicons name="person-outline" size={18} color={colors.textPrimary} />
                </View>
              )}
              <View style={styles.sponsorTextBlock}>
                <Text style={[
                  styles.sponsorByLabel,
                  food.sponsorshipType === 'SPONSORED_NAMED' && styles.sponsorByLabelNamed,
                ]}>Sponsored by</Text>
                <Text style={styles.sponsorName}>
                  {food.sponsorshipType === 'SPONSORED_NAMED'
                    ? (food.sponsorDisplayName ?? '')
                    : 'Anonymous donor'}
                </Text>
              </View>
              {food.sponsorshipType === 'SPONSORED_NAMED' ? (
                <MaterialCommunityIcons name="hand-heart" size={20} color={colors.goldDark} />
              ) : (
                <Ionicons name="heart" size={18} color={colors.goldMid} />
              )}
            </View>
          )}

        </View>
      </ScrollView>

      {/* Fixed bottom — progress + claim button */}
      <SafeAreaView edges={['bottom']} style={styles.bottomWrap}>
        {/* Claimed progress */}
        <View style={styles.progressBlock}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>{claimed} of {food.quantityOriginal}</Text>
            <Text style={styles.progressLabel}>{pct}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${pct}%` as `${number}%` }]} />
          </View>
        </View>
        <TouchableOpacity
          style={styles.reportRow}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('ReportListing', {
            restaurantName: food.restaurantName,
            foodId: food.id,
          })}
        >
          <Ionicons name="flag-outline" size={14} color={colors.textMuted} />
          <Text style={styles.reportText}>Report this listing</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.claimBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('QrScanner')}
        >
          <Text style={styles.claimBtnText}>CLAIM THIS FOOD</Text>
        </TouchableOpacity>
        {dailyLimit && (
          <Text style={styles.dailyLimitText}>
            Daily Limit: {dailyLimit.used}/{dailyLimit.limit} used
          </Text>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:     { flex: 1, backgroundColor: colors.surface },

  image: {
    width: '100%',
    height: layout.foodImageHeight,
    backgroundColor: colors.borderDefault,
  },

  backBtn: {
    position: 'absolute',
    left: spacing['2xl'],
    width: 40,                          // component-specific — Figma: 40px
    height: 40,                         // component-specific — Figma: 40px
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.95)',  // component-specific — Figma: rgba(255,255,255,0.95)
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },    // component-specific — Figma: 0 4
    shadowOpacity: 0.08,                       // component-specific — Figma: 0.08
    shadowRadius: 12,                          // component-specific — Figma: 12
    elevation: 3,
  },

  content: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.lg,
    paddingBottom: spacing['4xl'],
    gap: spacing.md,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  title: {
    flex: 1,
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.xl,            // 20px — Figma: 20px (was fontSizes['2xl'] = 24)
    lineHeight: 28,                    // component-specific — Figma: 28px
    letterSpacing: -0.7,               // component-specific — Figma: -0.7px
    color: colors.textPrimary,
  },
  leftBadge: {
    backgroundColor: colors.avatarBg,  // #FFE0E5 — Figma: rgb(255,224,229)
    borderRadius: radius.pill,
    paddingHorizontal: 12,             // component-specific — Figma: 12px
    paddingVertical: 5,                // component-specific — Figma: 5px
  },
  leftBadgeText: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['12'],         // 12px — Figma: 12px (was fontSizes.sm = 13)
    color: colors.accentPrimary,
  },

  categoryChip: {
    alignSelf: 'flex-start',
    borderRadius: radius.sm,           // 8px — Figma: 8px (was radius.chip = 22)
    backgroundColor: colors.surfaceSecondary,  // Figma: rgb(245,245,245)
    paddingHorizontal: 12,             // component-specific — Figma: 12px
    paddingVertical: 4,                // component-specific — Figma: 4px
  },
  categoryText: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['12'],         // 12px — Figma: 12px (was fontSizes.sm = 13)
    color: colors.textMuted,
  },

  divider: { height: 1, backgroundColor: colors.borderDefault },

  restaurantBlock:   { gap: spacing.sm },
  restaurantNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoRow:           { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  restaurantName: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.md,            // 15px ✓
    color: colors.textPrimary,
    includeFontPadding: false,
  },
  restaurantAddress: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,            // 13px ✓
    color: colors.textMuted,
    includeFontPadding: false,
  },
  distance: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,            // 13px ✓
    color: colors.textMuted,
    includeFontPadding: false,
  },

  pickupTime: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.md,            // 15px ✓
    color: colors.pickupOrange,
    includeFontPadding: false,
  },

  sectionLabel: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['12'],         // 12px — Figma: 12px (was fontSizes.xs = 11)
    color: colors.textMuted,
    letterSpacing: 0.96,              // component-specific — Figma: 0.96px (was 0.8)
  },
  description: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['14'],         // 14px — Figma: 14px (was fontSizes.sm = 13)
    color: colors.textMuted,
    lineHeight: 21,                    // component-specific — Figma: 21px (was 20)
  },

  directDonorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,                            // component-specific — Figma: 8px (was spacing.sm = 6)
  },
  sponsorLink: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.sm,
    color: colors.goldDark,            // Figma: prim/yellow/600 = #B8941E
    includeFontPadding: false,
  },

  sponsorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,                   // 14px — Figma: 14px (was spacing.md = 10)
    paddingVertical: spacing.lg,       // 14px — Figma: 14px padding
    paddingHorizontal: 16,             // component-specific — Figma: 16px
    borderRadius: radius.input,        // 14px — Figma: 14px
  },
  sponsorCardNamed: {
    backgroundColor: colors.goldLight, // rgb(255,243,208)
  },
  sponsorCardAnon: {
    backgroundColor: colors.surfaceSecondary,  // rgb(245,245,245)
  },

  sponsorAvatarNamed: {
    width: 44,                         // component-specific — Figma: 44px
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.goldMid,   // Figma: rgb(212,175,55) = #D4AF37 = goldMid
    alignItems: 'center',
    justifyContent: 'center',
  },
  sponsorAvatarAnon: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,   // white circle visible on surfaceSecondary card bg
    alignItems: 'center',
    justifyContent: 'center',
  },
  sponsorAvatarText: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['14'],         // Figma: 14px
    letterSpacing: 0.28,               // component-specific — Figma: 0.28px
    color: colors.textInverse,         // Figma: white
  },
  sponsorTextBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  sponsorByLabel: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  sponsorByLabelNamed: {
    color: colors.goldDark,            // Figma: prim/yellow/600 = #B8941E for named card
  },
  sponsorName: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
  },

  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  reportText: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['12'],
    color: colors.textMuted,
  },

  progressBlock: { gap: spacing.xs },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes['12'],         // 12px — Figma: 12px (was fontSizes.sm = 13)
    color: colors.textMuted,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.borderDefault,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accentPrimary,
    borderRadius: 3,                   // component-specific — Figma: 3px (was radius.pill = 100)
  },

  bottomWrap: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  claimBtn: {
    backgroundColor: colors.accentPrimary,
    borderRadius: radius.input,        // 14px — Figma: 16px ≈ radius.input (was radius.card = 18)
    height: layout.buttonHeight,       // 54px — Figma: 54px (was paddingVertical only)
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accentPrimary,
    shadowOffset: { width: 0, height: 4.63 },  // component-specific — Figma
    shadowOpacity: 0.267,                       // component-specific — Figma
    shadowRadius: 17.26,                        // component-specific — Figma
    elevation: 6,
  },
  claimBtnText: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.md,            // 15px ✓
    color: colors.textInverse,
    letterSpacing: 0.3,               // component-specific — Figma: 0.3px (was 0.5)
  },
  dailyLimitText: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],         // 12px — Figma: 12px (was fontSizes.sm = 13)
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 10,                     // component-specific — Figma: 10px (was spacing.sm = 6)
    marginBottom: spacing.xs,
  },
});
