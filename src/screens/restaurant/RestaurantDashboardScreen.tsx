import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { getDashboard } from '../../services/restaurant';
import { RestaurantDashboard, RestaurantDonation } from '../../types';
import { useNotificationStore } from '../../store/notificationStore';
import SkeletonBox, { usePulse } from '../../components/SkeletonBox';
import PostFAB from '../../components/PostFAB';
import {
  colors, spacing, radius, fontSizes, fontFamilies, letterSpacings,
} from '../../constants/theme';
import { RestaurantTabParamList } from '../../navigation/RestaurantTabs';

type Props = {
  navigation: BottomTabNavigationProp<RestaurantTabParamList, 'Home'>;
};

// ─── Skeleton ────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  const opacity = usePulse();
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <SkeletonBox opacity={opacity} width={40} height={40} borderRadius={radius.pill} />
        <SkeletonBox opacity={opacity} width={40} height={40} borderRadius={radius.pill} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} scrollEnabled={false} contentContainerStyle={sk.scroll}>
        <SkeletonBox opacity={opacity} width={140} height={13} />
        <SkeletonBox opacity={opacity} width={200} height={28} style={sk.mt6} />
        <SkeletonBox opacity={opacity} width={100} height={48} style={sk.mt6} />
        <SkeletonBox opacity={opacity} width={220} height={13} style={sk.mt6} />
        <SkeletonBox opacity={opacity} width={120} height={28} borderRadius={radius.pill} style={sk.mt10} />
        <View style={sk.cardRow}>
          {[0, 1, 2].map((i) => (
            <SkeletonBox key={i} opacity={opacity} style={{ flex: 1 }} height={76} borderRadius={radius.card} />
          ))}
        </View>
        <View style={sk.cardRow}>
          {[0, 1, 2].map((i) => (
            <SkeletonBox key={i} opacity={opacity} style={{ flex: 1 }} height={76} borderRadius={radius.card} />
          ))}
        </View>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={sk.row}>
            <SkeletonBox opacity={opacity} width={44} height={44} borderRadius={radius.pill} />
            <View style={sk.rowText}>
              <SkeletonBox opacity={opacity} width={140} height={14} />
              <SkeletonBox opacity={opacity} width={100} height={12} style={sk.mt4} />
            </View>
            <SkeletonBox opacity={opacity} width={36} height={14} />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const sk = StyleSheet.create({
  scroll:   { paddingHorizontal: spacing['2xl'], paddingTop: spacing.xl, paddingBottom: 100 },
  mt6:      { marginTop: 6 },
  mt10:     { marginTop: 10 },
  mt4:      { marginTop: 4 },
  cardRow:  { flexDirection: 'row', gap: 8, marginTop: spacing['2xl'] },
  row:      { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, paddingVertical: 14 },
  rowText:  { flex: 1 },
});

// ─── Stat card ───────────────────────────────────────────────────────────────

const StatCard = React.memo(({ value, label, valueColor }: { value: string; label: string; valueColor: string }) => (
  <View style={styles.statCard}>
    <Text style={[styles.statNumber, { color: valueColor }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
));

// ─── Donation row ────────────────────────────────────────────────────────────

const DonationRow = React.memo(({ item }: { item: RestaurantDonation }) => {
  const isFullyClaimed  = item.status === 'FULLY_CLAIMED';
  const isSponsored     = !!item.sponsorDisplayName;
  const showClaimedTick = isFullyClaimed && !item.photoUrl && !isSponsored;
  const pct            = item.quantityOriginal > 0
    ? Math.round((item.quantityClaimed / item.quantityOriginal) * 100)
    : 0;

  const rightLabel = isFullyClaimed
    ? (pct === 100 ? '100%' : 'All claimed')
    : `${item.quantityClaimed} / ${item.quantityOriginal}`;
  const rightColor = isFullyClaimed ? colors.successGreen : colors.textMuted;

  const subtitle = isSponsored
    ? `${item.quantityClaimed} of ${item.quantityOriginal} claimed · by ${item.sponsorDisplayName}`
    : `${item.quantityClaimed} of ${item.quantityOriginal} claimed · ${item.pickupWindow}`;

  const nameLabel = isSponsored ? `${item.name} · Sponsored` : item.name;

  return (
    <View style={styles.donationRow}>
      {isSponsored ? (
        <View style={styles.sponsorAvatar}>
          <Text style={styles.sponsorInitials}>{item.sponsorInitials ?? ''}</Text>
        </View>
      ) : showClaimedTick ? (
        <View style={[styles.donationThumb, styles.thumbClaimed]}>
          <Ionicons name="checkmark" size={20} color={colors.successGreen} />
        </View>
      ) : item.photoUrl ? (
        <Image source={{ uri: item.photoUrl }} style={styles.donationThumb} resizeMode="cover" />
      ) : (
        <View style={[styles.donationThumb, styles.thumbPlaceholder]} />
      )}
      <View style={styles.donationText}>
        <Text style={styles.donationName} numberOfLines={1}>{nameLabel}</Text>
        <Text style={styles.donationSub}  numberOfLines={1}>{subtitle}</Text>
      </View>
      <Text
        style={[
          styles.donationRight,
          { color: rightColor, fontFamily: isFullyClaimed ? fontFamilies.bold : fontFamilies.semiBold },
        ]}
      >
        {rightLabel}
      </Text>
    </View>
  );
});

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function RestaurantDashboardScreen({ navigation }: Props) {
  const [data, setData]       = useState<RestaurantDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const { unreadCount } = useNotificationStore();

  useEffect(() => {
    getDashboard().then((d) => {
      setData(d);
      setLoading(false);
    });
  }, []);

  const goToPost = useCallback(() => {
    navigation.navigate('Donations', { screen: 'PostDonation' } as never);
  }, [navigation]);

  if (loading) return <DashboardSkeleton />;
  if (!data)   return null;

  const initials = data.restaurantName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <TouchableOpacity
          style={styles.bellBtn}
          onPress={() => navigation.navigate('Alerts')}
          hitSlop={8}
        >
          <Ionicons name="notifications-outline" size={20} color={colors.textPrimary} />
          {unreadCount > 0 && <View style={styles.bellDot} />}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >

        {/* Hero */}
        <Text style={styles.restaurantName}>{data.restaurantName}</Text>
        <Text style={styles.heroTitle}>Lives impacted</Text>
        <Text style={styles.heroNumber}>{data.livesImpacted.toLocaleString()}</Text>
        <Text style={styles.heroSub}>
          people fed via {data.donationsThisYear} donations this year
        </Text>
        <View style={styles.growthBadge}>
          <Text style={styles.growthText}>+{data.growthPctThisWeek}% this week</Text>
        </View>

        {/* Today stats */}
        <View style={styles.statRow}>
          <StatCard value={String(data.activeCount)}  label="ACTIVE"        valueColor={colors.accentPrimary} />
          <StatCard value={String(data.claimedToday)} label="CLAIMED TODAY" valueColor={colors.textPrimary} />
          <StatCard value={`${data.claimRatePct}%`}  label="CLAIM RATE"    valueColor={colors.goldDark} />
        </View>

        {/* This week */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>This week</Text>
          <TouchableOpacity hitSlop={8}>
            <Text style={styles.sectionLink}>Details</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.statRow}>
          <StatCard value={String(data.thisWeekDonations)} label="DONATIONS" valueColor={colors.textPrimary} />
          <StatCard value={String(data.thisWeekMeals)}     label="MEALS"     valueColor={colors.accentPrimary} />
          <StatCard value={String(data.thisWeekInactive)}  label="INACTIVE"  valueColor={colors.goldDark} />
        </View>

        {/* Active donations */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active donations</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Donations')} hitSlop={8}>
            <Text style={styles.sectionLink}>See all</Text>
          </TouchableOpacity>
        </View>

        {/* Today group */}
        <View style={styles.dayHeader}>
          <Text style={styles.dayLabel}>Today</Text>
          <Text style={styles.daySummary}>
            {data.todayListings.length} listings · {data.todayPortions} portions
          </Text>
        </View>
        {data.todayListings.map((item) => (
          <DonationRow key={item.id} item={item} />
        ))}

        {/* Yesterday group */}
        {data.yesterdayListings.length > 0 && (
          <>
            <View style={[styles.dayHeader, styles.dayHeaderGap]}>
              <Text style={styles.dayLabel}>Yesterday</Text>
              <Text style={styles.daySummary}>
                {data.yesterdayListings.length} listings · {data.yesterdayFed} fed
              </Text>
            </View>
            {data.yesterdayListings.map((item) => (
              <DonationRow key={item.id} item={item} />
            ))}
          </>
        )}

      </ScrollView>

      <PostFAB onPress={goToPost} />

    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
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
    fontFamily: fontFamilies.bold,
    color: colors.accentPrimary,
  },

  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.accentPrimary,
  },

  scroll: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.sm,
    paddingBottom: 100,
  },

  // ── Hero ────────────────────────────────────────────────────────────────────
  restaurantName: {
    fontSize: fontSizes.sm,
    fontFamily: fontFamilies.medium,
    color: colors.textMuted,
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: fontSizes['2xl'],
    fontFamily: fontFamilies.bold,
    letterSpacing: letterSpacings.subheading,
    color: colors.textPrimary,
    marginBottom: 14,
  },
  heroNumber: {
    fontSize: fontSizes['5xl'],
    fontFamily: fontFamilies.bold,
    letterSpacing: letterSpacings.heading,
    color: colors.textPrimary,
    lineHeight: fontSizes['5xl'],
  },
  heroSub: {
    fontSize: fontSizes['14'],
    fontFamily: fontFamilies.regular,
    color: colors.textMuted,
    marginTop: 10,
  },
  growthBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.mintLight,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 14,
    marginBottom: spacing['2xl'],
  },
  growthText: {
    fontSize: fontSizes['12'],
    fontFamily: fontFamilies.semiBold,
    color: colors.successGreen,
  },

  // ── Stat cards ───────────────────────────────────────────────────────────────
  statRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing['2xl'],
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.card,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 76,
  },
  statNumber: {
    fontSize: fontSizes['2xl'],
    fontFamily: fontFamilies.bold,
    letterSpacing: letterSpacings.subheading,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: fontFamilies.semiBold,
    color: colors.textMuted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginTop: 4,
    textAlign: 'center',
  },

  // ── Section header ────────────────────────────────────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontFamily: fontFamilies.bold,
    letterSpacing: -0.425,
    color: colors.textPrimary,
  },
  sectionLink: {
    fontSize: fontSizes['12'],
    fontFamily: fontFamilies.semiBold,
    color: colors.accentPrimary,
  },

  // ── Day group header ──────────────────────────────────────────────────────
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  dayHeaderGap: {
    marginTop: spacing.lg,
  },
  dayLabel: {
    fontSize: fontSizes['12'],
    fontFamily: fontFamilies.medium,
    color: colors.textMuted,
  },
  daySummary: {
    fontSize: fontSizes.xs,
    fontFamily: fontFamilies.regular,
    color: colors.textMuted,
  },

  // ── Donation row ──────────────────────────────────────────────────────────
  donationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  donationThumb: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.borderDefault,
    overflow: 'hidden',
  },
  thumbPlaceholder: {
    backgroundColor: colors.mintLight,
  },
  thumbClaimed: {
    backgroundColor: colors.mintLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sponsorAvatar: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sponsorInitials: {
    fontSize: fontSizes.sm,
    fontFamily: fontFamilies.bold,
    color: colors.goldDark,
  },
  donationText: { flex: 1 },
  donationName: {
    fontSize: fontSizes['14'],
    fontFamily: fontFamilies.semiBold,
    color: colors.textPrimary,
    letterSpacing: -0.21,
  },
  donationSub: {
    fontSize: fontSizes['12'],
    fontFamily: fontFamilies.regular,
    color: colors.textMuted,
    marginTop: 2,
  },
  donationRight: {
    fontSize: fontSizes['14'],
    letterSpacing: -0.21,
  },

  // ── FAB ───────────────────────────────────────────────────────────────────
});
