import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SkeletonBox, { usePulse } from '../../components/SkeletonBox';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getPublicRestaurantDetail } from '../../services/restaurant';
import { PublicRestaurant, FoodItem } from '../../types';
import { colors, spacing, radius, fontSizes, fontWeights, layout } from '../../constants/theme';
import { HomeStackParamList } from '../../navigation/ReceiverTabs';

type Props = {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'RestaurantPage'>;
  route: RouteProp<HomeStackParamList, 'RestaurantPage'>;
};

const CATEGORY_LABELS: Record<string, string> = {
  RICE: 'Rice', NOODLES: 'Noodles', BREAD: 'Bread',
  SNACKS: 'Snacks', DRINKS: 'Drinks', OTHER: 'Other',
};

function uniqueCategoryChip(foods: FoodItem[]): string {
  const seen = new Set<string>();
  const labels: string[] = [];
  for (const f of foods) {
    const label = CATEGORY_LABELS[f.category] ?? f.category;
    if (!seen.has(label)) { seen.add(label); labels.push(label); }
  }
  return labels.join(' · ');
}

function sponsorLine(item: FoodItem): string {
  if (item.sponsorshipType === 'SPONSORED_NAMED')
    return `Sponsored by ${item.sponsorDisplayName ?? ''}`;
  if (item.sponsorshipType === 'SPONSORED_ANONYMOUS') return 'Sponsored anonymously';
  return 'Direct from restaurant';
}

function RestaurantSkeleton() {
  const opacity = usePulse();
  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} scrollEnabled={false}>
        <SkeletonBox opacity={opacity} height={260} borderRadius={0} />
        <View style={rSkelStyles.content}>
          <View style={rSkelStyles.nameRow}>
            <SkeletonBox opacity={opacity} height={22} style={rSkelStyles.nameFlex} />
            <SkeletonBox opacity={opacity} width={64} height={26} borderRadius={10} />
          </View>
          <SkeletonBox opacity={opacity} width={120} height={26} borderRadius={22} />
          <View style={rSkelStyles.metaRow}>
            <SkeletonBox opacity={opacity} width={80} height={14} />
            <SkeletonBox opacity={opacity} width={100} height={14} />
          </View>
          <View style={rSkelStyles.divider} />
          {[0, 1].map((i) => (
            <View key={i} style={rSkelStyles.foodRow}>
              <SkeletonBox opacity={opacity} width={72} height={72} borderRadius={12} />
              <View style={rSkelStyles.foodRowText}>
                <SkeletonBox opacity={opacity} width={140} height={15} />
                <SkeletonBox opacity={opacity} width={100} height={13} style={rSkelStyles.foodRowSub} />
                <SkeletonBox opacity={opacity} width={60} height={22} borderRadius={10} style={rSkelStyles.foodRowSub} />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const rSkelStyles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  nameFlex: { flex: 1 },
  metaRow: {
    flexDirection: 'row',
    gap: spacing['2xl'],
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderDefault,
    marginVertical: spacing.sm,
  },
  foodRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
  },
  foodRowText: {
    flex: 1,
    gap: 6,
  },
  foodRowSub: { marginTop: 2 },
});

export default function RestaurantPageScreen({ navigation, route }: Props) {
  const { restaurantId, distanceKm } = route.params;
  const insets = useSafeAreaInsets();

  const [restaurant, setRestaurant] = useState<PublicRestaurant | null>(null);
  const [foods, setFoods]           = useState<FoodItem[]>([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    getPublicRestaurantDetail(restaurantId)
      .then(({ restaurant, foods }) => { setRestaurant(restaurant); setFoods(foods); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [restaurantId]);

  if (loading) {
    return <RestaurantSkeleton />;
  }

  if (!restaurant) return null;

  const categoryChip = uniqueCategoryChip(foods);

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Hero image + back button */}
        <View>
          <Image
            source={{ uri: restaurant.photoUrl ?? undefined }}
            style={styles.image}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={[styles.backBtn, { top: insets.top + spacing.md }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>

          {/* Name + meals badge */}
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={3}>{restaurant.name}</Text>
            {foods.length > 0 && (
              <View style={styles.mealsBadge}>
                <Text style={styles.mealsBadgeText}>{foods.length} meals</Text>
              </View>
            )}
          </View>

          {/* Category chip derived from food items */}
          {categoryChip.length > 0 && (
            <View style={styles.categoryChip}>
              <Text style={styles.categoryText}>{categoryChip}</Text>
            </View>
          )}

          <View style={styles.divider} />

          {/* Info rows */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={15} color={colors.textMuted} />
              <Text style={styles.infoText}>{restaurant.address}</Text>
            </View>

            {distanceKm !== undefined && (
              <View style={styles.infoRow}>
                <Ionicons name="navigate-outline" size={15} color={colors.textMuted} />
                <Text style={styles.infoText}>{distanceKm.toFixed(1)} km away</Text>
              </View>
            )}

            {(restaurant.openingHours?.length ?? 0) > 0 && (
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={15} color={colors.textMuted} />
                <Text style={styles.infoText}>{restaurant.openingHours}</Text>
              </View>
            )}

            <View style={styles.infoRow}>
              <Ionicons
                name="shield-checkmark-outline"
                size={15}
                color={restaurant.isVerified ? colors.successGreen : colors.textMuted}
              />
              <Text style={[
                styles.infoText,
                restaurant.isVerified && { color: colors.successGreen },
              ]}>
                {restaurant.isVerified ? 'Verified restaurant' : 'Pending verification'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Available meals list */}
          <Text style={styles.sectionLabel}>
            AVAILABLE MEALS ({foods.length})
          </Text>

          {foods.length === 0 ? (
            <Text style={styles.emptyText}>No meals available right now.</Text>
          ) : (
            foods.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.foodCard}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('FoodDetail', { foodId: item.id })}
              >
                <Image
                  source={{ uri: item.photoUrl }}
                  style={styles.foodThumb}
                  resizeMode="cover"
                />
                <View style={styles.foodInfo}>
                  <Text style={styles.foodName} numberOfLines={1}>{item.name}</Text>
                  <View style={styles.foodMetaRow}>
                    <Text style={styles.foodLeft}>
                      <Text style={styles.foodLeftNum}>{item.quantityAvailable}</Text>
                      {' left'}
                    </Text>
                    <Text style={styles.foodPickup}>{item.pickupWindow}</Text>
                  </View>
                  <Text
                    style={
                      item.sponsorshipType === 'DIRECT'
                        ? styles.sponsorDirect
                        : styles.sponsorSponsored
                    }
                    numberOfLines={1}
                  >
                    {sponsorLine(item)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}

        </View>
      </ScrollView>
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

  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  name: {
    flex: 1,
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  mealsBadge: {
    backgroundColor: colors.accentLight,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  mealsBadgeText: {
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

  infoSection: { gap: spacing.md },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },

  sectionLabel: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    fontWeight: fontWeights.semiBold,
    letterSpacing: 0.8,
  },
  emptyText: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
  },

  foodCard: {
    flexDirection: 'row',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  foodThumb: {
    width: layout.restaurantFoodThumb,
    height: layout.restaurantFoodThumb,
    borderRadius: radius.sm,
    backgroundColor: colors.borderDefault,
  },
  foodInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xs,
  },
  foodName: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semiBold,
    color: colors.textPrimary,
  },
  foodMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  foodLeft: {
    fontSize: fontSizes.sm,
    color: colors.accentPrimary,
  },
  foodLeftNum: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.accentPrimary,
  },
  foodPickup: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  sponsorDirect: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  sponsorSponsored: {
    fontSize: fontSizes.sm,
    color: colors.accentPrimary,
  },
});
