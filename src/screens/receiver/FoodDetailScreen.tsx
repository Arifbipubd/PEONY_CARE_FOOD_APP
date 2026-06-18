import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getFoodDetail, getDailyLimit } from '../../services/receiver';
import { FoodItem, DailyLimitStatus } from '../../types';
import { colors, spacing, radius, fontSizes, fontWeights, layout } from '../../constants/theme';
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


export default function FoodDetailScreen({ navigation, route }: Props) {
  const { foodId } = route.params;
  const insets = useSafeAreaInsets();

  const [food, setFood]             = useState<FoodItem | null>(null);
  const [dailyLimit, setDailyLimit] = useState<DailyLimitStatus | null>(null);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([getFoodDetail(foodId), getDailyLimit()]).then(([item, limit]) => {
      setFood(item);
      setDailyLimit(limit);
      setLoading(false);
    });
  }, [foodId]);

  if (loading) {
    return (
      <View style={styles.loaderWrap}>
        <ActivityIndicator color={colors.accentPrimary} />
      </View>
    );
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
              <Ionicons name="storefront-outline" size={16} color={colors.accentPrimary} />
              <Text style={styles.restaurantName}>{food.restaurantName}</Text>
            </TouchableOpacity>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={14} color={colors.textMuted} />
              <Text style={styles.restaurantAddress}>{food.restaurantAddress}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="navigate-outline" size={14} color={colors.textMuted} />
              <Text style={styles.distance}>{food.distanceKm.toFixed(1)} km away</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Pickup window */}
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={16} color={colors.pickupOrange} />
            <Text style={styles.pickupTime}>
              {formatPickupFull(food.pickupStart, food.pickupEnd)}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* About */}
          <Text style={styles.sectionLabel}>ABOUT</Text>
          <Text style={styles.description}>{food.description}</Text>
          {food.sponsorshipType === 'DIRECT' ? (
            <View style={styles.infoRow}>
              <Ionicons name="heart-outline" size={14} color={colors.warningYellow} />
              <Text style={styles.sponsorLink}>Direct Donation</Text>
            </View>
          ) : (
            <View style={styles.sponsorCard}>
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
                <Text style={styles.sponsorByLabel}>Sponsored by</Text>
                <Text style={styles.sponsorName}>
                  {food.sponsorshipType === 'SPONSORED_NAMED'
                    ? (food.sponsorDisplayName ?? '')
                    : 'Anonymous donor'}
                </Text>
              </View>
              <Ionicons name="heart" size={18} color={colors.warningYellow} />
            </View>
          )}

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

        </View>
      </ScrollView>

      {/* Fixed claim button */}
      <SafeAreaView edges={['bottom']} style={styles.bottomWrap}>
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
  loaderWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  image: {
    width: '100%',
    height: layout.foodImageHeight,
    backgroundColor: colors.borderDefault,
  },

  backBtn: {
    position: 'absolute',
    left: spacing['2xl'],
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
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
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  leftBadge: {
    backgroundColor: colors.accentLight,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  leftBadgeText: {
    fontSize: fontSizes.sm,
    color: colors.accentPrimary,
    fontWeight: fontWeights.semiBold,
  },

  categoryChip: {
    alignSelf: 'flex-start',
    borderRadius: radius.chip,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  categoryText: { fontSize: fontSizes.sm, color: colors.textMuted },

  divider: { height: 1, backgroundColor: colors.borderDefault },

  restaurantBlock:   { gap: spacing.sm },
  restaurantNameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  infoRow:           { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  restaurantName:    { fontSize: fontSizes.md, fontWeight: fontWeights.semiBold, color: colors.textPrimary },
  restaurantAddress: { fontSize: fontSizes.sm, color: colors.textMuted },
  distance:          { fontSize: fontSizes.sm, color: colors.textMuted },

  pickupTime: {
    fontSize: fontSizes.md,
    color: colors.pickupOrange,
    fontWeight: fontWeights.semiBold,
  },

  sectionLabel: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    fontWeight: fontWeights.semiBold,
    letterSpacing: 0.8,
  },
  description: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
  sponsorLink: {
    fontSize: fontSizes.sm,
    color: colors.accentPrimary,
  },

  sponsorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  sponsorAvatarNamed: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sponsorAvatarAnon: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sponsorAvatarText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
    color: colors.goldDark,
  },
  sponsorTextBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  sponsorByLabel: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  sponsorName: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semiBold,
    color: colors.textPrimary,
  },

  progressBlock: { gap: spacing.xs },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: { fontSize: fontSizes.sm, color: colors.textMuted },
  progressTrack: {
    height: 6,
    backgroundColor: colors.borderDefault,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accentPrimary,
    borderRadius: radius.pill,
  },

  bottomWrap: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderDefault,
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.md,
  },
  claimBtn: {
    backgroundColor: colors.accentPrimary,
    borderRadius: radius.card,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  claimBtnText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.textInverse,
    letterSpacing: 0.5,
  },
  dailyLimitText: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
});
