import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useProfileStore } from '../../store/profileStore';
import { useNotificationStore } from '../../store/notificationStore';
import FoodCard from '../../components/FoodCard';
import FilterSheet, { FilterState, DEFAULT_FILTERS, matchesFilters } from '../../components/FilterSheet';
import { browseFood, getDailyLimit, getReceiverProfile } from '../../services/receiver';
import { getNearbyRestaurants } from '../../services/restaurant';
import { getNotifications } from '../../services/notifications';
import { FoodItem, FoodCategory, DailyLimitStatus, PublicRestaurant } from '../../types';
import { colors, spacing, radius, fontSizes, fontWeights, layout } from '../../constants/theme';
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

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function EmptyMealsState({ onAdjustRadius }: { onAdjustRadius: () => void }) {
  return (
    <View style={emptyStyles.wrap}>
      <View style={emptyStyles.iconCircle}>
        <Ionicons name="fast-food-outline" size={44} color={colors.textMuted} />
      </View>
      <Text style={emptyStyles.heading}>No food nearby</Text>
      <Text style={emptyStyles.body}>
        There's nothing within your 5 km radius right now. New donations appear throughout the day.
      </Text>
      <View style={emptyStyles.tipsBox}>
        <Text style={emptyStyles.tip}>Enable alerts to be notified when new food appears nearby.</Text>
        <Text style={emptyStyles.tip}>Expand your search radius from settings.</Text>
        <Text style={emptyStyles.tip}>Most donations appear between 5–8 PM.</Text>
      </View>
      <TouchableOpacity style={emptyStyles.primaryBtn} onPress={onAdjustRadius} activeOpacity={0.85}>
        <Text style={emptyStyles.primaryBtnText}>Adjust search radius</Text>
      </TouchableOpacity>
      <TouchableOpacity style={emptyStyles.secondaryBtn} activeOpacity={0.7}>
        <Text style={emptyStyles.secondaryBtnText}>Browse map</Text>
      </TouchableOpacity>
    </View>
  );
}

const emptyStyles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingTop: spacing['2xl'],
    paddingHorizontal: spacing['2xl'],
    gap: spacing.lg,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  heading: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  body: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  tipsBox: {
    width: '100%',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.md,
  },
  tip: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
  primaryBtn: {
    width: '100%',
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
    width: '100%',
    borderWidth: 1,
    borderColor: colors.borderDefault,
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

export default function ReceiverHomeScreen({ navigation }: Props) {
  const { displayName, setProfile } = useProfileStore();
  const { unreadCount, setNotifications } = useNotificationStore();
  const name = displayName || 'Sarah';
  const firstName = name.split(' ')[0];

  const [activeTab, setActiveTab]       = useState<Tab>('meals');
  const [filters, setFilters]           = useState<FilterState>(DEFAULT_FILTERS);
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [searchQuery, setSearchQuery]   = useState('');
  const [foods, setFoods]               = useState<FoodItem[]>([]);
  const [restaurants, setRestaurants]   = useState<PublicRestaurant[]>([]);
  const [dailyLimit, setDailyLimit]     = useState<DailyLimitStatus | null>(null);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    Promise.all([
      browseFood(),
      getDailyLimit(),
      getNearbyRestaurants(),
      getReceiverProfile(),
      getNotifications(),
    ]).then(([items, limit, rests, profile, notifications]) => {
      setFoods(items);
      setDailyLimit(limit);
      setRestaurants(rests);
      setProfile({ displayName: profile.displayName });
      setNotifications(notifications);
      setLoading(false);
    });
  }, []);

  const filtered = foods.filter((f) => {
    if (!matchesFilters(f, filters)) return false;
    if (searchQuery.trim() && !f.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <ActivityIndicator style={styles.loader} color={colors.accentPrimary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>

      {/* ── Fixed top section ── */}
      <View style={styles.top}>

        {/* Avatar + Bell */}
        <View style={styles.headerRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(name)}</Text>
          </View>
          <TouchableOpacity
            style={styles.bellButton}
            hitSlop={8}
            onPress={() => navigation.getParent()?.navigate('Alerts' as never)}
          >
            <Ionicons name="notifications" size={20} color={colors.textPrimary} />
            {unreadCount > 0 && <View style={styles.bellDot} />}
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <Text style={styles.greeting}>{getGreeting()}</Text>
        <Text style={styles.userName}>{firstName}</Text>

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
              <Image
                source={{ uri: item.photoUrl }}
                style={styles.restaurantCardImage}
                resizeMode="cover"
              />
              <View style={styles.restaurantCardBody}>
                <Text style={styles.restaurantCardName}>{item.name}</Text>
                <Text style={styles.restaurantCardCuisine}>{item.cuisineType}</Text>
                <View style={styles.restaurantCardMeta}>
                  <View style={styles.restaurantCardMetaLeft}>
                    <Ionicons name="location-outline" size={13} color={colors.textMuted} />
                    <Text style={styles.restaurantCardMetaText}>{item.distanceKm.toFixed(1)} km</Text>
                  </View>
                  <Text style={styles.restaurantCardMetaText}>Open · until {item.closesAt}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
  loader: { flex: 1 },

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
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
    color: colors.accentPrimary,
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

  // Greeting
  greeting: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  userName: {
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },

  // Claims badge
  claimsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.successGreenLight,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  claimsText: {
    fontSize: fontSizes.sm,
    color: colors.successGreen,
    fontWeight: fontWeights.medium,
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
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    padding: 0,
  },
  filterButton: {
    width: 40,
    height: 40,
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
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.accentPrimary,
  },
  tabLabel: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    fontWeight: fontWeights.medium,
  },
  tabLabelActive: {
    color: colors.accentPrimary,
  },
  tabCount: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
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
    height: layout.cardImageHeight,
    backgroundColor: colors.borderDefault,
  },
  restaurantCardBody: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  restaurantCardName: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  restaurantCardCuisine: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  restaurantCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  restaurantCardMetaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  restaurantCardMetaText: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
});
