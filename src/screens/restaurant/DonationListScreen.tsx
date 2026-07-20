import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SectionList,
  FlatList,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getDonations, reactivateDonation, deleteDonation } from '../../services/restaurant';
import { RestaurantDonation, DonationSummary } from '../../types';
import SkeletonBox, { usePulse } from '../../components/SkeletonBox';
import PostFAB from '../../components/PostFAB';
import {
  colors, spacing, radius, fontSizes, fontFamilies, letterSpacings,
} from '../../constants/theme';
import { DonationsStackParamList } from '../../navigation/RestaurantTabs';

type Tab = 'active' | 'past' | 'inactive';
type Props = {
  navigation: NativeStackNavigationProp<DonationsStackParamList, 'DonationList'>;
};
type DaySection = { title: string; data: RestaurantDonation[]; completedCount: number };

// ─── Helpers ─────────────────────────────────────────────────────────────────

function dayLabel(isoDate: string): string {
  const d    = new Date(isoDate);
  const diff = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return d.toLocaleDateString('en-SG', { month: 'short', day: 'numeric' });
}

function shortDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-SG', { month: 'short', day: 'numeric' });
}

function closedWhen(pickupEnd: string): string {
  const diffMs = Date.now() - new Date(pickupEnd).getTime();
  const diffH  = Math.floor(diffMs / 3_600_000);
  const diffD  = Math.floor(diffMs / 86_400_000);
  if (diffH < 24) return `closed ${diffH}h ago`;
  if (diffD === 1) return 'closed yesterday';
  const d = new Date(pickupEnd);
  return `closed ${d.toLocaleDateString('en-SG', { month: 'short', day: 'numeric' })}`;
}

function groupByDate(items: RestaurantDonation[]): DaySection[] {
  const map = new Map<string, RestaurantDonation[]>();
  for (const item of items) {
    const key = item.pickupStart.slice(0, 10);
    const arr = map.get(key) ?? [];
    arr.push(item);
    map.set(key, arr);
  }
  return Array.from(map.entries()).map(([key, data]) => ({
    title: dayLabel(key + 'T00:00:00+08:00'),
    completedCount: data.length,
    data,
  }));
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function ListSkeleton() {
  const opacity = usePulse();
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.headerRow}>
        <SkeletonBox opacity={opacity} width={40} height={40} borderRadius={radius.pill} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} scrollEnabled={false} contentContainerStyle={sk.scroll}>
        <SkeletonBox opacity={opacity} width={100} height={13} />
        <SkeletonBox opacity={opacity} width={180} height={28} style={sk.mt6} />
        <SkeletonBox opacity={opacity} width={60}  height={48} style={sk.mt6} />
        <SkeletonBox opacity={opacity} width={200} height={13} style={sk.mt6} />
        <View style={sk.tabs}>
          {[0, 1, 2].map((i) => (
            <SkeletonBox key={i} opacity={opacity} style={{ flex: 1 }} height={38} borderRadius={radius.pill} />
          ))}
        </View>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={sk.row}>
            <SkeletonBox opacity={opacity} width={52} height={52} borderRadius={radius.pill} />
            <View style={sk.rowText}>
              <SkeletonBox opacity={opacity} width={140} height={14} />
              <SkeletonBox opacity={opacity} width={110} height={12} style={sk.mt4} />
            </View>
            <SkeletonBox opacity={opacity} width={36} height={14} />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const sk = StyleSheet.create({
  scroll:  { paddingHorizontal: spacing['2xl'], paddingTop: spacing.xl, paddingBottom: 100 },
  mt6:     { marginTop: 6 },
  mt4:     { marginTop: 4 },
  tabs:    { flexDirection: 'row', gap: 8, marginTop: spacing.xl },
  row:     { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, paddingVertical: 14 },
  rowText: { flex: 1 },
});

function TabSkeleton({ header }: { header: React.ReactNode }) {
  const opacity = usePulse();
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
      {header}
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={[sk.row, { paddingHorizontal: spacing['2xl'] }]}>
          <SkeletonBox opacity={opacity} width={52} height={52} borderRadius={radius.pill} />
          <View style={sk.rowText}>
            <SkeletonBox opacity={opacity} width={140} height={14} />
            <SkeletonBox opacity={opacity} width={110} height={12} style={sk.mt4} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

// ─── Shared thumbnail ─────────────────────────────────────────────────────────

const DonationThumb = React.memo(({ item }: { item: RestaurantDonation }) => {
  if (item.sponsorDisplayName) {
    return (
      <View style={[styles.thumb, styles.sponsorThumb]}>
        <Text style={styles.sponsorInitials}>{item.sponsorInitials ?? ''}</Text>
      </View>
    );
  }
  if (item.status === 'FULLY_CLAIMED' && !item.photoUrl) {
    return (
      <View style={[styles.thumb, styles.thumbClaimed]}>
        <Ionicons name="checkmark" size={20} color={colors.successGreen} />
      </View>
    );
  }
  if (item.photoUrl) {
    return <Image source={{ uri: item.photoUrl }} style={styles.thumb} resizeMode="cover" />;
  }
  return <View style={[styles.thumb, styles.thumbPlaceholder]} />;
});

// ─── Active row ───────────────────────────────────────────────────────────────

const ActiveRow = React.memo(({ item, onPress }: { item: RestaurantDonation; onPress: () => void }) => {
  const isDone   = item.status === 'FULLY_CLAIMED';
  const nameText = item.sponsorDisplayName ? `${item.name} · Sponsored` : item.name;
  const subtitle = item.sponsorDisplayName
    ? `${item.quantityClaimed} of ${item.quantityOriginal} claimed · by ${item.sponsorDisplayName}`
    : `${item.quantityClaimed} of ${item.quantityOriginal} claimed · ${item.pickupWindow}`;
  const rightText  = isDone ? 'Done' : `${item.quantityClaimed} / ${item.quantityOriginal}`;
  const rightColor = isDone ? colors.successGreen : colors.textMuted;

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <DonationThumb item={item} />
      <View style={styles.rowText}>
        <Text style={styles.rowName} numberOfLines={1}>{nameText}</Text>
        <Text style={styles.rowSub}  numberOfLines={1}>{subtitle}</Text>
      </View>
      <Text style={[styles.rowRight, { color: rightColor, fontFamily: isDone ? fontFamilies.bold : fontFamilies.semiBold }]}>
        {rightText}
      </Text>
    </TouchableOpacity>
  );
});

// ─── Past row ────────────────────────────────────────────────────────────────

const PastRow = React.memo(({ item, onPress, isRelativeSection }: {
  item: RestaurantDonation;
  onPress: () => void;
  isRelativeSection: boolean;
}) => {
  const pct  = item.quantityOriginal > 0
    ? Math.round((item.quantityClaimed / item.quantityOriginal) * 100)
    : 0;
  const full = pct === 100;

  const nameText = item.sponsorDisplayName ? `${item.name} · Sponsored` : item.name;

  const hasExtras = !!(item.noShowCount || item.expiredCount || item.sponsorDisplayName);
  const subParts  = [`${item.quantityClaimed} of ${item.quantityOriginal} claimed`];
  if (item.noShowCount)      subParts.push(`· ${item.noShowCount} no-show`);
  if (item.expiredCount)     subParts.push(`· ${item.expiredCount} expired`);
  if (item.sponsorDisplayName) subParts.push(`· by ${item.sponsorDisplayName}`);
  if (!hasExtras && isRelativeSection) subParts.push(`· ${shortDate(item.pickupStart)}`);

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <DonationThumb item={item} />
      <View style={styles.rowText}>
        <Text style={styles.rowName} numberOfLines={1}>{nameText}</Text>
        <Text style={styles.rowSub}  numberOfLines={1}>{subParts.join(' ')}</Text>
      </View>
      <Text style={[styles.rowRight, { color: full ? colors.successGreen : colors.textMuted, fontFamily: full ? fontFamilies.bold : fontFamilies.semiBold }]}>
        {pct}%
      </Text>
    </TouchableOpacity>
  );
});

// ─── Inactive row ────────────────────────────────────────────────────────────

const InactiveRow = React.memo(({
  item,
  onView, onReactivate, onDelete,
}: {
  item: RestaurantDonation;
  onView: () => void;
  onReactivate: () => void;
  onDelete: () => void;
}) => (
  <View style={styles.inactiveCard}>
    <View style={styles.inactiveRowContent}>
      <DonationThumb item={item} />
      <View style={styles.rowText}>
        <Text style={styles.rowName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.rowSub} numberOfLines={2}>
          {item.quantityOriginal} {item.unit}s · {closedWhen(item.pickupEnd)} · {item.quantityClaimed} of {item.quantityOriginal} claimed
        </Text>
      </View>
    </View>
    <View style={styles.actionRow}>
      <TouchableOpacity style={styles.btnView} onPress={onView} activeOpacity={0.7}>
        <Text style={styles.btnViewText}>View</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btnReactivate} onPress={onReactivate} activeOpacity={0.85}>
        <Ionicons name="refresh" size={13} color={colors.textInverse} />
        <Text style={styles.btnReactivateText}>Reactivate</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btnDelete} onPress={onDelete} activeOpacity={0.7}>
        <Text style={styles.btnDeleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
  </View>
));

// ─── Empty state ─────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  desc: string;
  ctaLabel?: string;
  onCta?: () => void;
}

const DonationEmptyState = React.memo(({ icon, title, desc, ctaLabel, onCta }: EmptyStateProps) => (
  <View style={styles.emptyBody}>
    <View style={styles.emptyIconCircle}>
      <Ionicons name={icon} size={40} color={colors.textMuted} />
    </View>
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptyDesc}>{desc}</Text>
    {ctaLabel && onCta && (
      <TouchableOpacity style={styles.emptyCta} onPress={onCta} activeOpacity={0.85}>
        <Ionicons name="add" size={18} color={colors.textInverse} />
        <Text style={styles.emptyCtaText}>{ctaLabel}</Text>
      </TouchableOpacity>
    )}
  </View>
));

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function DonationListScreen({ navigation }: Props) {
  const [tab, setTab] = useState<Tab>('active');

  const [summary,       setSummary]       = useState<DonationSummary | null>(null);
  const [active,        setActive]        = useState<RestaurantDonation[] | null>(null);
  const [past,          setPast]          = useState<RestaurantDonation[] | null>(null);
  const [inactive,      setInactive]      = useState<RestaurantDonation[] | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [actionLoading, setActionLoading] = useState<Set<string>>(new Set());

  useEffect(() => {
    getDonations()
      .then(({ active, past, inactive, summary }) => {
        setActive(active);
        setPast(past);
        setInactive(inactive);
        setSummary(summary);
      })
      .catch(() => {
        setActive([]);
        setPast([]);
        setInactive([]);
        setSummary({ activeCount: 0, pastCount: 0, inactiveCount: 0, weeklyMeals: 0 });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleReactivate = useCallback(async (id: string) => {
    if (actionLoading.has(id)) return;
    setActionLoading((prev) => new Set(prev).add(id));
    try {
      await reactivateDonation(id);
      setInactive((prev) => prev?.filter((d) => d.id !== id) ?? prev);
      setSummary((prev) => prev
        ? { ...prev, inactiveCount: prev.inactiveCount - 1, activeCount: prev.activeCount + 1 }
        : prev,
      );
      getDonations().then((result) => setActive(result.active));
    } finally {
      setActionLoading((prev) => { const s = new Set(prev); s.delete(id); return s; });
    }
  }, [actionLoading]);

  const handleDelete = useCallback(async (id: string) => {
    if (actionLoading.has(id)) return;
    setActionLoading((prev) => new Set(prev).add(id));
    try {
      await deleteDonation(id);
      setInactive((prev) => prev?.filter((d) => d.id !== id) ?? prev);
      setSummary((prev) => prev
        ? { ...prev, inactiveCount: prev.inactiveCount - 1 }
        : prev,
      );
    } finally {
      setActionLoading((prev) => { const s = new Set(prev); s.delete(id); return s; });
    }
  }, [actionLoading]);

  const goToDetail = useCallback((id: string) => {
    navigation.navigate('DonationDetail', { donationId: id });
  }, [navigation]);

  const goToPost = useCallback(() => {
    navigation.navigate('PostDonation');
  }, [navigation]);

  const goToAlerts = useCallback(() => {
    navigation.getParent()?.navigate('Alerts' as never);
  }, [navigation]);

  const goBack = useCallback(() => {
    navigation.getParent()?.navigate('Home' as never);
  }, [navigation]);

  const activeSections = useMemo(() => groupByDate(active ?? []), [active]);
  const pastSections   = useMemo(() => groupByDate(past   ?? []), [past]);

  const headerSubtitle = tab === 'active'  ? 'Manage'
    : tab === 'past'                        ? 'Completed history'
    : 'Closed listings';

  const headerNumber = tab === 'active'  ? summary?.activeCount   ?? 0
    : tab === 'past'                      ? summary?.pastCount     ?? 0
    : summary?.inactiveCount              ?? 0;

  const headerSummary = tab === 'active'
    ? `${summary?.activeCount ?? 0} active · ${summary?.pastCount ?? 0} past · ${summary?.inactiveCount ?? 0} inactive`
    : tab === 'past'
    ? `${summary?.weeklyMeals ?? 0} meals donated this week`
    : 'closed early — reactivate or remove';

  const fabLabel = 'Post food';

  const isTabLoading = loading
    || (tab === 'past'     && past    === null)
    || (tab === 'inactive' && inactive === null);

  if (loading) return <ListSkeleton />;

  const Header = (
    <View style={styles.listHeader}>
      <Text style={styles.eyebrow}>{headerSubtitle}</Text>
      <Text style={styles.title}>Donations</Text>
      <Text style={styles.bigNumber}>{headerNumber}</Text>
      <Text style={styles.summary}>{headerSummary}</Text>

      <View style={styles.pills}>
        {(['active', 'past', 'inactive'] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.pill, tab === t && styles.pillActive]}
            onPress={() => setTab(t)}
            activeOpacity={0.75}
          >
            <Text style={[styles.pillText, tab === t && styles.pillTextActive]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>

      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={goBack} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bellBtn} onPress={goToAlerts} hitSlop={8}>
          <Ionicons name="notifications-outline" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* ── ACTIVE ── */}
      {tab === 'active' && (
        <SectionList<RestaurantDonation, DaySection>
          sections={activeSections}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          removeClippedSubviews
          maxToRenderPerBatch={10}
          windowSize={5}
          ListHeaderComponent={Header}
          renderSectionHeader={({ section }) => (
            <View style={styles.dayHeader}>
              <Text style={styles.dayLabel}>{section.title}</Text>
              <Text style={styles.daySummary}>{section.data.length} listings</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <ActiveRow item={item} onPress={() => goToDetail(item.id)} />
          )}
          ListEmptyComponent={
            <DonationEmptyState
              icon="receipt-outline"
              title="No donations yet"
              desc="Post a complementary meal to start sharing with your community."
            />
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* ── PAST ── */}
      {tab === 'past' && (
        isTabLoading ? (
          <TabSkeleton header={Header} />
        ) : (
          <SectionList<RestaurantDonation, DaySection>
            sections={pastSections}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled={false}
            removeClippedSubviews
            maxToRenderPerBatch={10}
            windowSize={5}
            ListHeaderComponent={Header}
            renderSectionHeader={({ section }) => (
              <View style={styles.dayHeader}>
                <Text style={styles.dayLabel}>{section.title}</Text>
                <Text style={styles.daySummary}>{section.completedCount} completed</Text>
              </View>
            )}
            renderItem={({ item, section }) => (
              <PastRow
                item={item}
                onPress={() => goToDetail(item.id)}
                isRelativeSection={section.title === 'Yesterday' || section.title === 'Today'}
              />
            )}
            ListEmptyComponent={
              <DonationEmptyState
                icon="receipt-outline"
                title="No donations yet"
                desc="Post a complementary meal to start sharing with your community."
              />
            }
            contentContainerStyle={styles.listContent}
          />
        )
      )}

      {/* ── INACTIVE ── */}
      {tab === 'inactive' && (
        isTabLoading ? (
          <TabSkeleton header={Header} />
        ) : (
          <FlatList
            data={inactive ?? []}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews
            maxToRenderPerBatch={8}
            windowSize={5}
            ListHeaderComponent={Header}
            renderItem={({ item }) => (
              <InactiveRow
                item={item}
                onView={() => goToDetail(item.id)}
                onReactivate={() => handleReactivate(item.id)}
                onDelete={() => handleDelete(item.id)}
              />
            )}
            ListEmptyComponent={
              <DonationEmptyState
                icon="receipt-outline"
                title="No donations yet"
                desc="Post a complementary meal to start sharing with your community."
              />
            }
            ListFooterComponent={
              <View style={styles.infoBox}>
                <Ionicons name="information-circle" size={20} color={colors.textMuted} style={styles.infoIcon} />
                <Text style={styles.infoText}>
                  Inactive donations were closed before the pickup window ended. Reactivate to bring them back to your Active list, or delete permanently.
                </Text>
              </View>
            }
            contentContainerStyle={styles.listContent}
          />
        )
      )}

      <PostFAB onPress={goToPost} label={fabLabel} />

    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
  },
  backBtn: {
    padding: spacing.sm,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── List header ──────────────────────────────────────────────────────────────
  listHeader: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  eyebrow: {
    fontSize: fontSizes.sm,
    fontFamily: fontFamilies.medium,
    color: colors.textMuted,
    marginBottom: 6,
  },
  title: {
    fontSize: fontSizes['2xl'],
    fontFamily: fontFamilies.bold,
    letterSpacing: letterSpacings.subheading,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  bigNumber: {
    fontSize: fontSizes['5xl'],
    fontFamily: fontFamilies.bold,
    letterSpacing: letterSpacings.heading,
    color: colors.textPrimary,
    lineHeight: 48,
    marginBottom: 0,
  },
  summary: {
    fontSize: fontSizes['14'],
    fontFamily: fontFamilies.regular,
    color: colors.textMuted,
    marginTop: 10,
    marginBottom: 0,
  },

  // ── Tab pills ─────────────────────────────────────────────────────────────────
  pills: {
    flexDirection: 'row',
    gap: 8,
    marginTop: spacing.xl,
  },
  pill: {
    flex: 1,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: {
    backgroundColor: colors.textPrimary,
  },
  pillText: {
    fontSize: fontSizes['12'],
    fontFamily: fontFamilies.semiBold,
    color: colors.textPrimary,
  },
  pillTextActive: {
    color: colors.textInverse,
  },

  // ── Day group header ──────────────────────────────────────────────────────────
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.sm,
  },
  dayLabel: {
    fontSize: fontSizes.sm,
    fontFamily: fontFamilies.semiBold,
    color: colors.textMuted,
  },
  daySummary: {
    fontSize: fontSizes.sm,
    fontFamily: fontFamilies.semiBold,
    color: colors.textMuted,
  },

  // ── Donation row (active / past) ──────────────────────────────────────────────
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: 13,
    gap: spacing.lg,
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.borderDefault,
  },
  thumbPlaceholder: {
    backgroundColor: colors.successGreenLight,
  },
  thumbClaimed: {
    backgroundColor: colors.mintLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sponsorThumb: {
    backgroundColor: colors.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sponsorInitials: {
    fontSize: fontSizes.sm,
    fontFamily: fontFamilies.bold,
    color: colors.goldDark,
  },
  rowText: { flex: 1 },
  rowName: {
    fontSize: fontSizes['14'],
    fontFamily: fontFamilies.semiBold,
    letterSpacing: -0.21,
    color: colors.textPrimary,
  },
  rowSub: {
    fontSize: fontSizes.sm,
    fontFamily: fontFamilies.regular,
    color: colors.textMuted,
    marginTop: 2,
  },
  rowRight: {
    fontSize: fontSizes.sm,
  },

  // ── Inactive card ─────────────────────────────────────────────────────────────
  inactiveCard: {
    paddingHorizontal: spacing['2xl'],
  },
  inactiveRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    gap: spacing.lg,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: spacing.lg,
    paddingLeft: 0,
  },
  btnView: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnViewText: {
    fontSize: fontSizes['12'],
    fontFamily: fontFamilies.semiBold,
    color: colors.textPrimary,
  },
  btnReactivate: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.accentPrimary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  btnReactivateText: {
    fontSize: fontSizes['12'],
    fontFamily: fontFamilies.semiBold,
    color: colors.textInverse,
  },
  btnDelete: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDeleteText: {
    fontSize: fontSizes['12'],
    fontFamily: fontFamilies.semiBold,
    color: colors.dangerRed,
  },
  // ── Info box (inactive footer) ────────────────────────────────────────────────
  infoBox: {
    marginTop: spacing['2xl'],
    marginHorizontal: spacing['2xl'],
    marginBottom: 0,
    paddingVertical: spacing.lg,
    paddingHorizontal: 16,
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.input,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoIcon: {
    flexShrink: 0,
  },
  infoText: {
    flex: 1,
    fontSize: fontSizes['12'],
    fontFamily: fontFamilies.regular,
    color: colors.textMuted,
    lineHeight: 17.4,
  },

  listContent: { paddingBottom: 100 },

  // ── Empty state ───────────────────────────────────────────────────────────────
  emptyBody: {
    paddingTop: 40,
    paddingHorizontal: spacing['2xl'],
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
  },
  emptyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.accentPrimary,
    borderRadius: radius.card,
    height: 52,
    marginTop: 16,
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
});
