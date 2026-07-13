import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SectionList,
  ScrollView,
  StyleSheet,
} from 'react-native';
import SkeletonBox, { usePulse } from '../../components/SkeletonBox';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getClaimHistory, getReceiverProfile } from '../../services/receiver';
import { ClaimHistory, ClaimHistoryItem, ReceiverProfile } from '../../types';
import {
  colors, spacing, radius, fontSizes, fontFamilies, fontWeights, letterSpacings, layout,
} from '../../constants/theme';
import { HistoryStackParamList } from '../../navigation/ReceiverTabs';
import { useNotificationStore } from '../../store/notificationStore';

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

function HistorySkeleton() {
  const opacity = usePulse();
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={hSkelStyles.header}>
        <SkeletonBox opacity={opacity} width={22} height={22} borderRadius={100} />
        <SkeletonBox opacity={opacity} width={40} height={40} borderRadius={100} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} scrollEnabled={false} contentContainerStyle={hSkelStyles.scroll}>
        <SkeletonBox opacity={opacity} width={60} height={13} />
        <SkeletonBox opacity={opacity} width={180} height={28} style={hSkelStyles.heading} />
        <SkeletonBox opacity={opacity} width={80} height={48} style={hSkelStyles.bigNum} />
        <SkeletonBox opacity={opacity} width={200} height={14} style={hSkelStyles.subText} />
        <View style={hSkelStyles.sectionHeader}>
          <SkeletonBox opacity={opacity} width={80} height={14} />
          <SkeletonBox opacity={opacity} width={60} height={14} />
        </View>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={hSkelStyles.row}>
            <SkeletonBox opacity={opacity} width={56} height={56} borderRadius={12} />
            <View style={hSkelStyles.rowText}>
              <SkeletonBox opacity={opacity} width={160} height={15} />
              <SkeletonBox opacity={opacity} width={120} height={13} style={hSkelStyles.rowSub} />
            </View>
            <SkeletonBox opacity={opacity} width={60} height={22} borderRadius={10} />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const hSkelStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
  },
  scroll: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['2xl'],
    paddingBottom: spacing['4xl'],
  },
  heading: { marginTop: spacing.sm },
  bigNum:  { marginTop: spacing.md },
  subText: { marginTop: spacing.sm },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing['2xl'],
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.md,
  },
  rowText: { flex: 1, gap: 6 },
  rowSub: { marginTop: 2 },
});

export default function ReceiverHistoryScreen({ navigation }: Props) {
  const [history, setHistory] = useState<ClaimHistory | null>(null);
  const [profile, setProfile] = useState<ReceiverProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { unreadCount } = useNotificationStore();

  useEffect(() => {
    Promise.allSettled([getClaimHistory(), getReceiverProfile()]).then(([h, p]) => {
      if (h.status === 'fulfilled') setHistory(h.value);
      if (p.status === 'fulfilled') setProfile(p.value);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <HistorySkeleton />;
  }

  const sections: HistorySection[] = (history?.groupedByWeek ?? []).map((g) => ({
    title: weekLabel(g.weekStart),
    count: g.claims.length,
    data:  g.claims,
  }));

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (sections.length === 0) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.getParent()?.navigate('Home')} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.emptyPageTitle}>Claim history</Text>
        <View style={styles.emptyBody}>
          <View style={styles.emptyIconCircle}>
            <MaterialCommunityIcons name="history" size={40} color={colors.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>No claims yet</Text>
          <Text style={styles.emptyDesc}>
            Your claimed meals will appear here. Start by browsing complimentary food near you.
          </Text>
          <TouchableOpacity
            style={styles.emptyCta}
            onPress={() => navigation.getParent()?.navigate('Home')}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="silverware-fork-knife" size={18} color={colors.textInverse} />
            <Text style={styles.emptyCtaText}>Find food nearby</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Filled state ─────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.getParent()?.navigate('Home')} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.notifBtn}
          onPress={() => navigation.getParent()?.navigate('Alerts')}
          hitSlop={8}
        >
          <Ionicons name="notifications-outline" size={20} color={colors.textPrimary} />
          {unreadCount > 0 && <View style={styles.notifDot} />}
        </TouchableOpacity>
      </View>

      <SectionList<ClaimHistoryItem, HistorySection>
        sections={sections}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        windowSize={5}
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
              <Image source={{ uri: item.photoUrl || undefined }} style={styles.thumb} resizeMode="cover" />
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

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
  },

  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.accentPrimary,
  },

  // ── Empty state ──────────────────────────────────────────────────────────────
  emptyPageTitle: {
    fontSize: fontSizes['2xl'],
    fontFamily: fontFamilies.bold,
    letterSpacing: letterSpacings.subheading,
    color: colors.textPrimary,
    paddingTop: 4,
    paddingHorizontal: spacing['2xl'],
    paddingBottom: 16,
  },
  emptyBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  emptyTitle: {
    fontSize: fontSizes['2xl'],
    fontFamily: fontFamilies.bold,
    letterSpacing: letterSpacings.subheading,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
  },
  emptyDesc: {
    fontSize: fontSizes['14'],
    fontFamily: fontFamilies.regular,
    lineHeight: 21,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing['2xl'],
  },
  emptyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.accentPrimary,
    borderRadius: radius.card,
    height: layout.buttonHeight,
    marginTop: 16,
    marginHorizontal: 20,
    alignSelf: 'stretch',
    shadowColor: colors.accentPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  emptyCtaText: {
    fontSize: fontSizes.md,
    fontFamily: fontFamilies.bold,
    letterSpacing: letterSpacings.button,
    color: colors.textInverse,
  },

  // ── Filled state ─────────────────────────────────────────────────────────────
  stats: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.lg,
  },
  lifetimeLabel: {
    fontSize: fontSizes.sm,
    fontFamily: fontFamilies.medium,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  heading: {
    fontSize: fontSizes['2xl'],
    fontFamily: fontFamilies.bold,
    letterSpacing: letterSpacings.subheading,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  bigNumber: {
    fontSize: fontSizes['5xl'],
    fontFamily: fontFamilies.bold,
    lineHeight: fontSizes['5xl'],
    letterSpacing: letterSpacings.heading,
    color: colors.textPrimary,
  },
  statsSubtitle: {
    fontSize: fontSizes['14'],
    fontFamily: fontFamilies.regular,
    color: colors.textMuted,
    marginTop: 10,
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
    fontSize: fontSizes['12'],
    fontFamily: fontFamilies.medium,
    color: colors.textMuted,
  },
  sectionCount: {
    fontSize: fontSizes['12'],
    fontFamily: fontFamilies.semiBold,
    color: colors.textMuted,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: 14,
    gap: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.borderDefault,
  },
  rowText: { flex: 1 },
  foodName: {
    fontSize: fontSizes['14'],
    fontFamily: fontFamilies.semiBold,
    letterSpacing: -0.21,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: fontSizes['12'],
    fontFamily: fontFamilies.regular,
    color: colors.textMuted,
    marginTop: 2,
  },

  status: {
    fontSize: fontSizes['14'],
    fontFamily: fontFamilies.bold,
    letterSpacing: -0.21,
  },
  collected: { color: colors.successGreen },
  expired:   { color: colors.textMuted },

  listContent: { paddingBottom: spacing['4xl'] },
});
