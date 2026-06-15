import { useState, useEffect } from 'react';
import {
  View,
  Text,
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
import FoodCard from '../../components/FoodCard';
import { browseFood, getDailyLimit } from '../../services/receiver';
import { FoodItem, FoodCategory, DailyLimitStatus } from '../../types';
import { colors, spacing, radius, fontSizes, fontWeights } from '../../constants/theme';
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

export default function ReceiverHomeScreen({ navigation }: Props) {
  const { displayName } = useProfileStore();
  const name = displayName || 'Sarah';

  const [activeTab, setActiveTab]     = useState<Tab>('meals');
  const [activeChip, setActiveChip]   = useState<FoodCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [foods, setFoods]             = useState<FoodItem[]>([]);
  const [dailyLimit, setDailyLimit]   = useState<DailyLimitStatus | null>(null);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    Promise.all([browseFood(), getDailyLimit()]).then(([items, limit]) => {
      setFoods(items);
      setDailyLimit(limit);
      setLoading(false);
    });
  }, []);

  const filtered = foods.filter((f) => {
    if (activeChip && f.category !== activeChip) return false;
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
          <TouchableOpacity hitSlop={8}>
            <Ionicons name="notifications-outline" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <Text style={styles.greeting}>{getGreeting()}</Text>
        <Text style={styles.userName}>{name}</Text>

        {/* Claims badge */}
        {dailyLimit && (
          <View style={styles.claimsBadge}>
            <Ionicons name="checkmark-circle" size={14} color={colors.successGreen} />
            <Text style={styles.claimsText}>
              Claims: {dailyLimit.used}/{dailyLimit.limit} today
            </Text>
          </View>
        )}

        {/* Search bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search food or restaurant..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity hitSlop={8}>
            <Ionicons name="options-outline" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {(['meals', 'restaurants'] as Tab[]).map((tab) => {
            const active = activeTab === tab;
            const label  = tab === 'meals' ? 'Available Meals' : 'Nearby Restaurants';
            const count  = tab === 'meals' ? foods.length : 7;
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
              const active = activeChip === c.value;
              return (
                <TouchableOpacity
                  key={c.label}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setActiveChip(c.value)}
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
          ListEmptyComponent={
            <Text style={styles.emptyText}>No meals found.</Text>
          }
        />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.emptyText}>Restaurant list coming soon.</Text>
        </View>
      )}

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
    backgroundColor: colors.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
    color: colors.textInverse,
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
  searchBar: {
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

  // Empty / placeholder
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: fontSizes.md,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing['2xl'],
  },
});
