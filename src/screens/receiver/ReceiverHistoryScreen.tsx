import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SectionList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getClaimHistory, getReceiverProfile } from '../../services/receiver';
import { ClaimHistory, ClaimHistoryItem, ReceiverProfile } from '../../types';
import { colors, spacing, radius, fontSizes, fontWeights, layout } from '../../constants/theme';
import { HistoryStackParamList } from '../../navigation/ReceiverTabs';

type Props = {
  navigation: NativeStackNavigationProp<HistoryStackParamList, 'ReceiverHistory'>;
};

type HistorySection = {
  title: string;
  count: number;
  data: ClaimHistoryItem[];
};

function weekLabel(weekStart: string): string {
  const start = new Date(weekStart);
  const diffDays = Math.floor((Date.now() - start.getTime()) / 86_400_000);
  if (diffDays < 7)  return 'This week';
  if (diffDays < 14) return 'Last week';
  return start.toLocaleDateString('en-SG', { month: 'short', day: 'numeric' });
}

function relativeTime(isoString: string): string {
  const date = new Date(isoString);
  const diffDays = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (diffDays === 0) {
    const t = date.toLocaleTimeString('en-SG', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `today, ${t}`;
  }
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7)  return `${diffDays} days ago`;
  return date.toLocaleDateString('en-SG', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function ReceiverHistoryScreen({ navigation }: Props) {
  const [history, setHistory] = useState<ClaimHistory | null>(null);
  const [profile, setProfile] = useState<ReceiverProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getClaimHistory(), getReceiverProfile()]).then(([h, p]) => {
      setHistory(h);
      setProfile(p);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <ActivityIndicator style={styles.loader} color={colors.accentPrimary} />
      </SafeAreaView>
    );
  }

  const sections: HistorySection[] = (history?.groupedByWeek ?? []).map((g) => ({
    title: weekLabel(g.weekStart),
    count: g.claims.length,
    data:  g.claims,
  }));

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.getParent()?.navigate('Home')} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.getParent()?.navigate('Alerts')} hitSlop={8}>
          <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <SectionList<ClaimHistoryItem, HistorySection>
        sections={sections}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          <View style={styles.stats}>
            <Text style={styles.lifetimeLabel}>Lifetime</Text>
            <Text style={styles.heading}>Claim history</Text>
            <Text style={styles.bigNumber}>{profile?.lifetimeMeals ?? 0}</Text>
            <Text style={styles.statsSubtitle}>
              meals received across {profile?.restaurantsCount ?? 0} restaurants
            </Text>
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionCount}>{section.count} meals</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const collected = item.status === 'CLAIMED';
          const subtitle  = item.sponsorDisplayName
            ? `${item.restaurantName} · Sponsored by ${item.sponsorDisplayName}`
            : `${item.restaurantName} · ${relativeTime(item.claimedAt)}`;
          return (
            <View style={styles.row}>
              <Image source={{ uri: item.photoUrl }} style={styles.thumb} resizeMode="cover" />
              <View style={styles.rowText}>
                <Text style={styles.foodName} numberOfLines={1}>{item.foodName}</Text>
                <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
              </View>
              <Text style={[styles.status, collected ? styles.collected : styles.expired]}>
                {collected ? 'Collected' : 'Expired'}
              </Text>
            </View>
          );
        }}
        contentContainerStyle={styles.listContent}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  loader: { flex: 1 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },

  stats: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.lg,
  },
  lifetimeLabel: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  heading: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  bigNumber: {
    fontSize: 52,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    lineHeight: 58,
  },
  statsSubtitle: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceSecondary,
  },
  sectionTitle: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    fontWeight: fontWeights.semiBold,
  },
  sectionCount: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  thumb: {
    width: layout.restaurantFoodThumb,
    height: layout.restaurantFoodThumb,
    borderRadius: radius.sm,
    backgroundColor: colors.borderDefault,
  },
  rowText: { flex: 1, gap: spacing.xs },
  foodName: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semiBold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },

  status: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semiBold,
  },
  collected: { color: colors.successGreen },
  expired:   { color: colors.textMuted },

  listContent: { paddingBottom: spacing['4xl'] },
});
