import { useState, useEffect, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import ReceiverHomeEmptyScreen from './ReceiverHomeEmptyScreen';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
  Linking,
} from 'react-native';
import { requestForegroundPermissionsAsync, getCurrentPositionAsync, Accuracy } from 'expo-location';
import SkeletonBox, { usePulse } from '../../components/SkeletonBox';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useProfileStore } from '../../store/profileStore';
import { useNotificationStore } from '../../store/notificationStore';
import FoodCard from '../../components/FoodCard';
import FilterSheet, { FilterState, DEFAULT_FILTERS } from '../../components/FilterSheet';
import { browseFood, getDailyLimit, getReceiverProfile, searchFood, updateReceiverLocation } from '../../services/receiver';
import { useLocation } from '../../hooks/useLocation';
import { getNearbyRestaurants } from '../../services/restaurant';
import { getNotifications } from '../../services/notifications';
import { FoodItem, FoodCategory, DailyLimitStatus, PublicRestaurant } from '../../types';
import { colors, spacing, radius, fontSizes, fontWeights, fontFamilies, letterSpacings, lineHeights, layout } from '../../constants/theme';
import { HomeStackParamList } from '../../navigation/ReceiverTabs';

type Props = {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'ReceiverHome'>;
};

type Tab = 'meals' | 'restaurants';

const CHIPS: { label: string; value: FoodCategory | null }[] = [
  { label: 'All',     value: null },
  { label: 'Rice',    value: 'RICE' },
  { label: 'Noodles', value: 'NOODLES' },
  { label: 'Bread',   value: 'BREAD' },
  { label: 'Snacks',  value: 'SNACKS' },
];


function EmptyRestaurantsState({ onAdjustRadius }: { onAdjustRadius: () => void }) {
  return (
    <View style={emptyStyles.wrap}>
      <View style={emptyStyles.iconCircle}>
        <Ionicons name="storefront-outline" size={44} color={colors.textMuted} />
      </View>
      <Text style={emptyStyles.heading}>No restaurants nearby</Text>
      <Text style={emptyStyles.body}>
        Restaurants in your area will appear here. Try expanding your search radius.
      </Text>
      <TouchableOpacity style={emptyStyles.ctaBtn} onPress={onAdjustRadius} activeOpacity={0.85}>
        <Ionicons name="navigate" size={16} color={colors.accentPrimary} />
        <Text style={emptyStyles.ctaBtnText}>Widen search radius</Text>
      </TouchableOpacity>
    </View>
  );
}

function EmptyMealsState({ onAdjustRadius }: { onAdjustRadius: () => void }) {
  return (
    <View style={emptyStyles.wrap}>
      <View style={emptyStyles.iconCircle}>
        <Ionicons name="restaurant-outline" size={44} color={colors.textMuted} />
      </View>
      <Text style={emptyStyles.heading}>No meals nearby</Text>
      <Text style={emptyStyles.body}>
        Restaurants post surplus food throughout the day. Check back soon.
      </Text>
      <TouchableOpacity style={emptyStyles.ctaBtn} onPress={onAdjustRadius} activeOpacity={0.85}>
        <Ionicons name="navigate" size={16} color={colors.accentPrimary} />
        <Text style={emptyStyles.ctaBtnText}>Widen search radius</Text>
      </TouchableOpacity>
    </View>
  );
}

const emptyStyles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingTop: spacing['4xl'],
    paddingHorizontal: spacing['2xl'],
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,   // component-specific, not in spacing scale
  },
  heading: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.lg,       // 17px
    letterSpacing: -0.425,        // component-specific, not in letterSpacings scale
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,              // component-specific, not in spacing scale
  },
  body: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['14'],    // 14px
    lineHeight: lineHeights.body, // 21px
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 280,
    marginBottom: 24,             // component-specific, not in spacing scale
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,                       // component-specific, not in spacing scale
    backgroundColor: colors.avatarBg,  // #FFE0E5 — light red tint
    borderRadius: radius.pill,
    paddingHorizontal: 22,        // component-specific, not in spacing scale
    paddingVertical: 12,          // component-specific, not in spacing scale
  },
  ctaBtnText: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['14'],    // 14px
    color: colors.accentPrimary,
  },
});

function HomeSkeleton() {
  const opacity = usePulse();
  return (
    <SafeAreaView style={styles.screen}>
      <View style={skelStyles.top}>
        <View style={skelStyles.headerRow}>
          <SkeletonBox opacity={opacity} width={130} height={26} />
          <SkeletonBox opacity={opacity} width={40} height={40} borderRadius={100} />
        </View>
        <SkeletonBox opacity={opacity} width={140} height={26} borderRadius={100} />
        <View style={skelStyles.searchRow}>
          <SkeletonBox opacity={opacity} height={48} borderRadius={14} style={skelStyles.searchFlex} />
          <SkeletonBox opacity={opacity} width={48} height={48} borderRadius={14} />
        </View>
        <View style={skelStyles.tabRow}>
          <SkeletonBox opacity={opacity} height={30} borderRadius={8} style={skelStyles.tabFlex} />
          <SkeletonBox opacity={opacity} height={30} borderRadius={8} style={skelStyles.tabFlex} />
        </View>
        <View style={skelStyles.chipsRow}>
          {[60, 56, 70, 60, 64].map((w, i) => (
            <SkeletonBox key={i} opacity={opacity} width={w} height={30} borderRadius={22} />
          ))}
        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={skelStyles.cards}
        scrollEnabled={false}
      >
        {[0, 1, 2].map((i) => (
          <View key={i} style={skelStyles.card}>
            <SkeletonBox opacity={opacity} height={160} borderRadius={18} />
            <View style={skelStyles.cardBody}>
              <View style={skelStyles.cardTitleRow}>
                <SkeletonBox opacity={opacity} width={160} height={16} />
                <SkeletonBox opacity={opacity} width={60} height={22} borderRadius={10} />
              </View>
              <SkeletonBox opacity={opacity} width={110} height={13} style={skelStyles.cardMeta} />
              <View style={skelStyles.cardChips}>
                <SkeletonBox opacity={opacity} width={60} height={22} borderRadius={10} />
                <SkeletonBox opacity={opacity} width={80} height={22} borderRadius={10} />
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const skelStyles = StyleSheet.create({
  top: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  searchFlex: { flex: 1 },
  tabRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  tabFlex: { flex: 1 },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  cards: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  card: { gap: 0 },
  cardBody: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  cardMeta: { marginTop: 2 },
  cardChips: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 2,
  },
});

export default function ReceiverHomeScreen({ navigation }: Props) {
  const { displayName, setProfile } = useProfileStore();
  const { unreadCount, setNotifications } = useNotificationStore();
  const name = displayName || 'Sarah';
  const firstName = name.split(' ')[0];
  const { lat, lng, loading: locLoading } = useLocation();
  const locationPatched = useRef(false);

  const [skipEmpty, setSkipEmpty]        = useState(false);
  const [activeTab, setActiveTab]       = useState<Tab>('meals');
  const [filters, setFilters]           = useState<FilterState>(DEFAULT_FILTERS);
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [searchQuery, setSearchQuery]   = useState('');
  const [foods, setFoods]               = useState<FoodItem[]>([]);
  const [searchResults, setSearchResults] = useState<FoodItem[] | null>(null);
  const [restaurants, setRestaurants]   = useState<PublicRestaurant[]>([]);
  const [dailyLimit, setDailyLimit]     = useState<DailyLimitStatus | null>(null);
  const [loading, setLoading]           = useState(true);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchData = useCallback((overrideLat?: number, overrideLng?: number) => {
    const useLat = overrideLat ?? lat ?? undefined;
    const useLng = overrideLng ?? lng ?? undefined;
    console.log('[Home] fetchData lat:', useLat, 'lng:', useLng);
    Promise.allSettled([
      browseFood(useLat, useLng),
      getDailyLimit(),
      getNearbyRestaurants(useLat, useLng),
      getReceiverProfile(),
      getNotifications(),
    ]).then(([items, limit, rests, profile, notifications]) => {
      console.log('[Home] foods:', items.status, items.status === 'fulfilled' ? items.value.length : (items as PromiseRejectedResult).reason);
      console.log('[Home] restaurants:', rests.status, rests.status === 'fulfilled' ? rests.value.length : (rests as PromiseRejectedResult).reason);
      if (items.status === 'fulfilled')         setFoods(items.value);
      if (limit.status === 'fulfilled')         setDailyLimit(limit.value);
      if (rests.status === 'fulfilled')         setRestaurants(rests.value);
      if (profile.status === 'fulfilled') {
        console.log('[Home] profile', profile.value);
        setProfile({ displayName: profile.value.displayName });
      }
      if (notifications.status === 'fulfilled') setNotifications(notifications.value);
      setLoading(false);
    });
  }, [lat, lng, setProfile, setNotifications]);

  useEffect(() => {
    if (locLoading || lat === null || lng === null || locationPatched.current) return;
    locationPatched.current = true;
    updateReceiverLocation(lat, lng).catch(() => {});
  }, [locLoading, lat, lng]);

  useEffect(() => {
    if (locLoading) return;
    fetchData();
  }, [locLoading, fetchData]);

  useFocusEffect(
    useCallback(() => {
      if (locLoading) return;
      setLoading(true);
      fetchData();
    }, [locLoading, fetchData]),
  );

  useEffect(() => {
    const hasQuery = searchQuery.trim() !== '';
    const hasCategory = filters.category !== null;
    const hasRadiusChange = filters.maxDistanceKm !== DEFAULT_FILTERS.maxDistanceKm;

    if (!hasQuery && !hasCategory && !hasRadiusChange) {
      setSearchResults(null);
      return;
    }

    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

    searchTimerRef.current = setTimeout(() => {
      searchFood(
        searchQuery.trim(),
        filters.category ?? undefined,
        lat ?? undefined,
        lng ?? undefined,
        filters.maxDistanceKm,
      )
        .then(setSearchResults)
        .catch(() => {});
    }, 300);

    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [searchQuery, filters.category, filters.maxDistanceKm, lat, lng]);

  const displayedFoods = searchResults ?? foods;
  const filtered = displayedFoods.filter((f) => {
    const { showOnly } = filters;
    if (showOnly.sponsored && f.sponsorshipType === 'DIRECT') return false;
    if (showOnly.halal && !f.isHalal) return false;
    if (showOnly.vegetarian && !f.isVegetarian) return false;
    if (showOnly.pickupUnder1h) {
      const msLeft = new Date(f.pickupEnd).getTime() - Date.now();
      if (!(msLeft > 0 && msLeft <= 60 * 60 * 1000)) return false;
    }
    return true;
  });

  const handleEnableLocation = useCallback(async () => {
    try {
      const { status } = await requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Linking.openSettings();
        return;
      }
      setLoading(true);
      let latitude = lat;
      let longitude = lng;
      if (latitude == null || longitude == null) {
        const pos = await getCurrentPositionAsync({ accuracy: Accuracy.Balanced });
        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;
      }
      updateReceiverLocation(latitude, longitude).catch(() => {});
      fetchData(latitude, longitude);
    } catch {
      setLoading(false);
    }
  }, [lat, lng, fetchData]);

  const handleNotifications = useCallback(
    () => navigation.getParent()?.navigate('Alerts' as never),
    [navigation],
  );
  const handleBrowseWithout = useCallback(() => setSkipEmpty(true), []);

  if (loading) {
    return <HomeSkeleton />;
  }

  if (lat === null && lng === null && !skipEmpty) {
    return (
      <ReceiverHomeEmptyScreen
        firstName={firstName}
        unreadCount={unreadCount}
        dailyLimit={dailyLimit}
        onNotificationsPress={handleNotifications}
        onEnableLocation={handleEnableLocation}
        onBrowseWithout={handleBrowseWithout}
      />
    );
  }

  return (
    <SafeAreaView style={styles.screen}>

      {/* ── Fixed top section ── */}
      <View style={styles.top}>

        {/* Greeting + Bell */}
        <View style={styles.headerRow}>
          <Text style={styles.greeting}>Hi, {firstName} 👋</Text>
          <TouchableOpacity
            style={styles.bellButton}
            hitSlop={8}
            onPress={() => navigation.getParent()?.navigate('Alerts' as never)}
          >
            <Ionicons name="notifications" size={20} color={colors.textPrimary} />
            {unreadCount > 0 && <View style={styles.bellDot} />}
          </TouchableOpacity>
        </View>

        {/* Claims badge */}
        {dailyLimit && (
          <View style={styles.claimsBadge}>
            <Ionicons name="checkmark-circle" size={14} color={colors.successGreen} />
            <Text style={styles.claimsText}>
              Claims: {dailyLimit.used}/{dailyLimit.limit} today
            </Text>
          </View>
        )}

        {/* Search bar + filter button */}
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search food or restaurant..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            hitSlop={8}
            onPress={() => setFilterSheetVisible(true)}
          >
            <Ionicons name="options-outline" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {(['meals', 'restaurants'] as Tab[]).map((tab) => {
            const active = activeTab === tab;
            const label  = tab === 'meals' ? 'Available Meals' : 'Nearby Restaurants';
            const count  = tab === 'meals' ? foods.length : restaurants.length;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, active && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
                <Text style={[styles.tabCount, active && styles.tabCountActive]}>{count}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Category chips — meals tab only */}
        {activeTab === 'meals' && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {CHIPS.map((c) => {
              const active = filters.category === c.value;
              return (
                <TouchableOpacity
                  key={c.label}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setFilters((f) => ({ ...f, category: c.value }))}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* ── Scrollable content ── */}
      {activeTab === 'meals' ? (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FoodCard item={item} onPress={() => navigation.navigate('FoodDetail', { foodId: item.id })} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyMealsState onAdjustRadius={() => navigation.getParent()?.navigate('Profile' as never)} />}
        />
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.restaurantCard}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('RestaurantPage', {
                restaurantId: item.id,
                distanceKm: item.distanceKm,
              })}
            >
              <View>
                <Image
                  source={{ uri: item.photoUrl ?? undefined }}
                  style={styles.restaurantCardImage}
                  resizeMode="cover"
                />
                <View style={styles.restaurantCardBadgeWrap}>
                  <View style={styles.restaurantCardBadge}>
                    <Text style={styles.restaurantCardBadgeText}>{item.mealCount} meals</Text>
                  </View>
                </View>
              </View>
              <View style={styles.restaurantCardBody}>
                <Text style={styles.restaurantCardName}>{item.name}</Text>
                <Text style={styles.restaurantCardCuisine}>{item.cuisineType}</Text>
                <View style={styles.restaurantCardMeta}>
                  <View style={styles.restaurantCardMetaItem}>
                    <Ionicons name="navigate" size={12} color={colors.textMuted} />
                    <Text style={styles.restaurantCardMetaText}>{item.distanceKm.toFixed(1)} km</Text>
                  </View>
                  <View style={styles.restaurantCardMetaItem}>
                    <Ionicons name="time" size={12} color={colors.textMuted} />
                    <Text style={styles.restaurantCardMetaText}>Open · until {item.closesAt}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyRestaurantsState onAdjustRadius={() => navigation.getParent()?.navigate('Profile' as never)} />}
        />
      )}

      <FilterSheet
        visible={filterSheetVisible}
        onClose={() => setFilterSheetVisible(false)}
        foods={foods}
        value={filters}
        onApply={setFilters}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },

  top: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.surface,
  },

  // Header row
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.xl,
    letterSpacing: letterSpacings.bodyBold,
    color: colors.textPrimary,
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.accentPrimary,
    borderWidth: 1,
    borderColor: colors.surfaceSecondary,
  },

  // Claims badge
  claimsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.successGreenLight,
    borderRadius: radius.pill,
    paddingHorizontal: 12,  // component-specific, not in spacing scale
    paddingVertical: 5,     // component-specific, not in spacing scale
    gap: 4,                 // component-specific, not in spacing scale
  },
  claimsText: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['12'],
    color: colors.successGreen,
  },

  // Search
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.input,
    paddingHorizontal: 16,  // component-specific, not in spacing scale
    height: layout.actionButtonSize,
    gap: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['16'],
    color: colors.textPrimary,
    padding: 0,
  },
  filterButton: {
    width: layout.actionButtonSize,
    height: layout.actionButtonSize,
    borderRadius: radius.input,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: 12,   // component-specific, not in spacing scale
    paddingHorizontal: 4, // component-specific, not in spacing scale
    gap: spacing.xs,
    marginBottom: -1,
  },
  tabActive: {
    borderBottomWidth: 2.5,
    borderBottomColor: colors.accentPrimary,
  },
  tabLabel: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  tabLabelActive: {
    fontFamily: fontFamilies.semiBold,
    color: colors.accentPrimary,
  },
  tabCount: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.xl,
    color: colors.textMuted,
  },
  tabCountActive: {
    color: colors.accentPrimary,
  },

  // Chips
  chipsRow: {
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  chip: {
    borderRadius: radius.chip,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.accentPrimary,
    borderColor: colors.accentPrimary,
  },
  chipText: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    fontWeight: fontWeights.medium,
  },
  chipTextActive: {
    color: colors.textInverse,
  },

  // List
  listContent: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.lg,
    paddingBottom: spacing['4xl'],
  },

  // Restaurant cards
  restaurantCard: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  restaurantCardImage: {
    width: '100%',
    height: 140,              // component-specific — Figma: 140px (food cards are 170px)
    backgroundColor: colors.borderDefault,
  },
  restaurantCardBadgeWrap: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },
  restaurantCardBadge: {
    backgroundColor: colors.accentPrimary,
    borderRadius: radius.pill,
    paddingHorizontal: 12,    // component-specific
    paddingVertical: 5,       // component-specific
    shadowColor: colors.accentPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 4,
  },
  restaurantCardBadgeText: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.xs,       // 11px
    color: colors.textInverse,
  },
  restaurantCardBody: {
    padding: spacing.md,
    gap: 4,                   // component-specific — cuisine margin-top: 4px in Figma
  },
  restaurantCardName: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.md,       // 15px
    letterSpacing: -0.225,        // component-specific
    color: colors.textPrimary,
  },
  restaurantCardCuisine: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,       // 13px
    color: colors.textMuted,
  },
  restaurantCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,                   // component-specific — items left-aligned with gap
  },
  restaurantCardMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,                   // component-specific
  },
  restaurantCardMetaText: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],    // 12px
    color: colors.textMuted,
    includeFontPadding: false,
  },
});
