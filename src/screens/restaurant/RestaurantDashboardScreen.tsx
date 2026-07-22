import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ImageWithSkeleton from '../../components/ImageWithSkeleton';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { getDashboard, getMenuPhotos, menuPhotosExist, donationsExist } from '../../services/restaurant';
import { useLocation } from '../../hooks/useLocation';
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
        <ImageWithSkeleton source={{ uri: item.photoUrl }} style={styles.donationThumb} resizeMode="cover" />
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

// ─── Empty / new-restaurant dashboard ────────────────────────────────────────

type EmptyProps = {
  restaurantName:  string;
  hasMenuPhotos:   boolean;
  hasDonations:    boolean;
  navigation: BottomTabNavigationProp<RestaurantTabParamList, 'Home'>;
  refreshing:      boolean;
  onRefresh:       () => void;
};

const EmptyDashboard = React.memo(({ restaurantName, hasMenuPhotos, hasDonations, navigation, refreshing, onRefresh }: EmptyProps) => {
  const steps = useMemo(() => [
    {
      num: 1,
      done: true,
      title: 'Create your account',
      sub: 'Signed up and verified with ACRA',
    },
    {
      num: 2,
      done: hasMenuPhotos,
      title: 'Add menu photos',
      sub: 'Required — donors see this before sponsoring',
    },
    {
      num: 3,
      done: hasDonations,
      title: 'Post your first donation',
      sub: 'Once your menu is up, list surplus food for receivers',
    },
  ], [hasMenuPhotos, hasDonations]);
  const goAddPhotos = useCallback(
    () => navigation.navigate('Profile', { screen: 'MenuPhotos' } as never),
    [navigation],
  );
  const goPost = useCallback(
    () => navigation.navigate('Donations', { screen: 'PostDonation' } as never),
    [navigation],
  );
  const goClaims = useCallback(
    () => navigation.navigate('Profile', { screen: 'TodaysClaims' } as never),
    [navigation],
  );
  const handleStepPress = useCallback(
    (num: number) => { if (num === 2) goAddPhotos(); else if (num === 3) goPost(); },
    [goAddPhotos, goPost],
  );

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={es.scroll}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accentPrimary} colors={[colors.accentPrimary]} />}
    >

      {/* Account verified chip */}
      <View style={es.chip}>
        <MaterialCommunityIcons name="check-decagram" size={14} color={colors.accentPrimary} />
        <Text style={es.chipText}>Account verified</Text>
      </View>

      {/* Welcome title + subtitle */}
      <Text style={es.title}>{'Welcome to Peony Care,\n' + restaurantName + ' 🌸'}</Text>
      <Text style={es.subtitle}>
        {"You're all set up. Complete one quick step to start receiving donations."}
      </Text>

      {/* ACTION REQUIRED card — hidden once menu photos are uploaded */}
      {!hasMenuPhotos && (
        <View style={es.warnCard}>
          <View style={es.warnLabelRow}>
            <Ionicons name="warning" size={14} color={colors.pickupOrange} />
            <Text style={es.warnLabel}>ACTION REQUIRED</Text>
          </View>
          <Text style={es.warnTitle}>Add menu photos to receive donations</Text>
          <Text style={es.warnBody}>
            {"Donors can't sponsor meals here until they see your menu. Upload a photo of your menu board or a few dish shots to go live."}
          </Text>
          <TouchableOpacity style={es.warnBtn} activeOpacity={0.85} onPress={goAddPhotos}>
            <Ionicons name="images" size={16} color={colors.textInverse} />
            <Text style={es.warnBtnText}>Add menu photos</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* GET STARTED steps */}
      <Text style={es.getStartedLabel}>GET STARTED</Text>

      {steps.map((step, idx) => (
        <React.Fragment key={step.num}>
          <TouchableOpacity
            style={es.stepRow}
            activeOpacity={step.done ? 1 : 0.75}
            onPress={() => handleStepPress(step.num)}
            disabled={step.done}
          >
            {step.done ? (
              <View style={es.doneCircle}>
                <Ionicons name="checkmark" size={14} color={colors.textInverse} />
              </View>
            ) : (
              <View style={es.numCircle}>
                <Text style={es.numText}>{step.num}</Text>
              </View>
            )}

            <View style={es.stepContent}>
              <Text style={es.stepTitle}>{step.title}</Text>
              <Text style={es.stepSub}>{step.sub}</Text>
            </View>

            {step.done ? (
              <View style={es.doneCircle}>
                <Ionicons name="checkmark" size={14} color={colors.textInverse} />
              </View>
            ) : (
              <Ionicons name="arrow-forward" size={18} color={colors.accentPrimary} />
            )}
          </TouchableOpacity>
          {idx < steps.length - 1 && <View style={es.stepDivider} />}
        </React.Fragment>
      ))}

      {/* YOUR IMPACT SO FAR */}
      <View style={es.impactHeader}>
        <Text style={es.impactLabel}>YOUR IMPACT SO FAR</Text>
        <TouchableOpacity onPress={goClaims} hitSlop={8}>
          <Text style={es.impactLink}>See claims</Text>
        </TouchableOpacity>
      </View>

      <View style={es.impactStatRow}>
        <StatCard value="0" label="PEOPLE FED" valueColor={colors.textPrimary} />
        <StatCard value="0" label="DONATIONS"  valueColor={colors.textPrimary} />
        <StatCard value="—" label="CLAIM RATE" valueColor={colors.textMuted} />
      </View>

      {/* Active donations — empty */}
      <Text style={es.activeSectionTitle}>Active donations</Text>
      <View style={es.emptyList}>
        <MaterialCommunityIcons name="silverware-fork-knife" size={40} color={colors.borderDefault} />
        <Text style={es.emptyTitle}>No donations yet</Text>
        <Text style={es.emptySub}>
          {"Finish adding menu photos, then post your first donation. Receivers nearby will see it right away."}
        </Text>
      </View>

    </ScrollView>
  );
});

const es = StyleSheet.create({
  scroll: { paddingBottom: 100 },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.avatarBg,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 6,
    marginHorizontal: spacing['2xl'],
    marginTop: spacing.sm,
    marginBottom: 12,
  },
  chipText: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['12'],
    color: colors.accentPrimary,
  },

  title: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['2xl'],
    lineHeight: 27.6,
    letterSpacing: -0.6,
    color: colors.textPrimary,
    paddingHorizontal: spacing['2xl'],
  },
  subtitle: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['14'],
    lineHeight: 21,
    color: colors.textMuted,
    paddingHorizontal: spacing['2xl'],
    marginTop: 8,
    marginBottom: spacing.lg,
  },

  warnCard: {
    marginHorizontal: spacing['2xl'],
    marginTop: 4,
    marginBottom: spacing.xl,
    borderRadius: radius.card,
    borderWidth: 1.5,
    borderColor: colors.warningYellowBorder,
    backgroundColor: colors.warningYellowLight,
    padding: 18,
    overflow: 'hidden',
  },
  warnLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  warnLabel: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.xs,
    letterSpacing: 0.88,
    color: colors.pickupOrange,
    textTransform: 'uppercase',
  },
  warnTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['16'],
    color: colors.textPrimary,
    marginBottom: 8,
  },
  warnBody: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['14'],
    lineHeight: 21,
    color: colors.textMuted,
    marginBottom: 16,
  },
  warnBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.textPrimary,
    borderRadius: radius.card,
    height: 44,
    gap: 8,
  },
  warnBtnText: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.md,
    letterSpacing: letterSpacings.button,
    color: colors.textInverse,
  },

  getStartedLabel: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.xs,
    letterSpacing: 0.88,
    color: colors.textMuted,
    textTransform: 'uppercase',
    paddingTop: 20,
    paddingHorizontal: spacing['2xl'],
    paddingBottom: 10,
  },

  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  doneCircle: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.successGreen,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  numCircle: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  numText: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['12'],
    color: colors.textMuted,
  },
  stepContent: { flex: 1 },
  stepTitle: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['14'],
    lineHeight: 21,
    color: colors.textPrimary,
  },
  stepSub: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    lineHeight: 18,
    color: colors.textMuted,
    marginTop: 2,
  },
  stepDivider: {
    height: 1,
    backgroundColor: colors.borderDefault,
    marginLeft: spacing['2xl'] + 28 + spacing.md,
  },

  impactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingTop: 20,
    paddingBottom: 10,
  },
  impactLabel: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.xs,
    letterSpacing: 0.88,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  impactLink: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['12'],
    color: colors.accentPrimary,
  },
  impactStatRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: spacing['2xl'],
    marginBottom: spacing['2xl'],
  },

  activeSectionTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.lg,
    letterSpacing: -0.425,
    color: colors.textPrimary,
    paddingHorizontal: spacing['2xl'],
    marginBottom: spacing.lg,
  },

  emptyList: {
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['3xl'],
    paddingBottom: spacing['2xl'],
    gap: spacing.sm,
  },
  emptyTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['14'],
    color: colors.textPrimary,
    textAlign: 'center',
  },
  emptySub: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    lineHeight: 17.4,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 310,
  },
});

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function RestaurantDashboardScreen({ navigation }: Props) {
  const [data, setData]                   = useState<RestaurantDashboard | null>(null);
  const [loading, setLoading]             = useState(true);
  const [hasMenuPhotos, setHasMenuPhotos] = useState(() => menuPhotosExist());
  const [hasDonations, setHasDonations]   = useState(() => donationsExist());
  const { unreadCount } = useNotificationStore();
  const { lat, lng } = useLocation();

  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(
    () => Promise.all([getDashboard(), getMenuPhotos()])
      .then(([d]) => {
        setData(d);
        setHasMenuPhotos(menuPhotosExist());
        setHasDonations(donationsExist());
        console.log('[Dashboard] data:', JSON.stringify(d, null, 2));
      })
      .catch(() => {}),
    [lat, lng],
  );

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData().finally(() => setLoading(false));
    }, [loadData]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData().finally(() => setRefreshing(false));
  }, [loadData]);

  const goToPost = useCallback(() => {
    navigation.navigate('Donations', { screen: 'PostDonation' } as never);
  }, [navigation]);

  if (loading) return <DashboardSkeleton />;
  if (!data)   return null;

  const isEmpty = !hasDonations && data.livesImpacted === 0 && data.todayListings.length === 0 && data.yesterdayListings.length === 0 && data.pastGroups.length === 0;

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
        <TouchableOpacity
          style={styles.avatar}
          onPress={() => navigation.navigate('Profile')}
          hitSlop={8}
          activeOpacity={0.7}
        >
          {data.photoUrl ? (
            <ImageWithSkeleton source={{ uri: data.photoUrl }} style={styles.avatarImg} resizeMode="cover" />
          ) : (
            <Text style={styles.avatarText}>{initials}</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bellBtn}
          onPress={() => navigation.navigate('Alerts')}
          hitSlop={8}
        >
          <Ionicons name="notifications-outline" size={20} color={colors.textPrimary} />
          {unreadCount > 0 && <View style={styles.bellDot} />}
        </TouchableOpacity>
      </View>

      {isEmpty && <EmptyDashboard restaurantName={data.restaurantName} hasMenuPhotos={hasMenuPhotos} hasDonations={hasDonations} navigation={navigation} refreshing={refreshing} onRefresh={onRefresh} />}
      {!isEmpty && (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accentPrimary} colors={[colors.accentPrimary]} />}
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

        {/* Past date groups (e.g. "19 Jul") — active donations from earlier dates */}
        {data.pastGroups.map((group) => (
          <React.Fragment key={group.label}>
            <View style={[styles.dayHeader, styles.dayHeaderGap]}>
              <Text style={styles.dayLabel}>{group.label}</Text>
              <Text style={styles.daySummary}>
                {group.listings.length} listings · {group.fed} fed
              </Text>
            </View>
            {group.listings.map((item) => (
              <DonationRow key={item.id} item={item} />
            ))}
          </React.Fragment>
        ))}


      </ScrollView>
        )}

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
  avatarImg: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
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
