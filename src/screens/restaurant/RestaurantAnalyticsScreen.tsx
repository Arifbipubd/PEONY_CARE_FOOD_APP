import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ImageWithSkeleton from '../../components/ImageWithSkeleton';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Polyline, Polygon } from 'react-native-svg';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getAnalytics } from '../../services/restaurant';
import { RestaurantAnalytics, AnalyticsDish, AnalyticsSponsor } from '../../types';
import {
  colors, spacing, radius, fontSizes, fontFamilies, letterSpacings,
} from '../../constants/theme';
import { ProfileStackParamList } from '../../navigation/RestaurantTabs';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'RestaurantAnalytics'>;
};

const PERIODS = ['7D', '30D', '3M', '1Y', 'All'] as const;
type Period = typeof PERIODS[number];

const SW            = Dimensions.get('window').width;
const CONTENT_W     = SW - spacing['2xl'] * 2;
const CARD_INNER_W  = CONTENT_W - 32;
const BAR_CHART_H   = 120;
const LINE_CHART_H  = 100;
const HEATMAP_CELL  = Math.floor((CONTENT_W - 32 - 24) / 7);

const HEATMAP_COLOURS = ['#FFF0F2', '#FECACA', '#F87171', colors.accentPrimary];

// ─── Sub-components ───────────────────────────────────────────────────────────

const AnalyticStatCard = React.memo(({ value, label, valueColor }: {
  value: string; label: string; valueColor: string;
}) => (
  <View style={styles.summaryStatCard}>
    <Text style={[styles.summaryStatValue, { color: valueColor }]}>{value}</Text>
    <Text style={styles.summaryStatLabel}>{label}</Text>
  </View>
));

const RowSeparator = React.memo(() => <View style={styles.separator} />);

const DishRow = React.memo(({ item }: { item: AnalyticsDish }) => (
  <View style={styles.listRow}>
    {item.photoUrl ? (
      <ImageWithSkeleton source={{ uri: item.photoUrl }} style={styles.dishThumb} resizeMode="cover" />
    ) : (
      <View style={[styles.dishThumb, styles.dishThumbPlaceholder]} />
    )}
    <View style={styles.listRowText}>
      <Text style={styles.listRowName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.listRowSub}>{item.mealCount} meals · {item.claimRatePct}% claim rate</Text>
    </View>
  </View>
));

const SponsorRow = React.memo(({ item }: { item: AnalyticsSponsor }) => (
  <View style={styles.listRow}>
    {item.isAnonymous ? (
      <View style={[styles.sponsorAvatar, styles.anonAvatar]}>
        <Ionicons name="person" size={18} color={colors.textMuted} />
      </View>
    ) : (
      <View style={styles.sponsorAvatar}>
        <Text style={styles.sponsorInitials}>{item.initials}</Text>
      </View>
    )}
    <View style={styles.listRowText}>
      <Text style={styles.listRowName} numberOfLines={1}>{item.displayName}</Text>
      {!item.isAnonymous && (
        <Text style={styles.listRowSub}>
          {item.sponsoredCount} sponsored · S${item.totalAmountSGD}
        </Text>
      )}
    </View>
  </View>
));

// ─── Empty state ──────────────────────────────────────────────────────────────

const PLACEHOLDER_RATIOS = [0.30, 0.45, 0.55, 0.70, 0.50, 0.65, 0.75, 0.60];
const WEEKS_8 = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'];

type EmptyProps = { onPostDonation: () => void };

const EmptyAnalytics = React.memo(({ onPostDonation }: EmptyProps) => (
  <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={es.scroll}>

    <View style={es.card}>
      <View style={es.illoCircle}>
        <MaterialCommunityIcons name="poll" size={36} color={colors.goldDark} />
      </View>
      <Text style={es.title}>No analytics yet</Text>
      <Text style={es.sub}>
        {'Post your first donation to start tracking impact — lives fed, claim rate, peak hours, and repeat receivers.'}
      </Text>
      <TouchableOpacity style={es.btn} activeOpacity={0.85} onPress={onPostDonation}>
        <Ionicons name="add" size={16} color={colors.textInverse} />
        <Text style={es.btnText}>Post a donation</Text>
      </TouchableOpacity>
    </View>

    <Text style={es.sectionTitle}>Your impact so far</Text>

    <View style={es.grid}>
      <View style={es.gridRow}>
        <View style={es.gridCell}>
          <Text style={es.gridLabel}>PEOPLE FED</Text>
          <Text style={es.gridValue}>0</Text>
          <Text style={es.gridSub}>lifetime</Text>
        </View>
        <View style={es.gridDividerV} />
        <View style={es.gridCell}>
          <Text style={es.gridLabel}>DONATIONS</Text>
          <Text style={es.gridValue}>0</Text>
          <Text style={es.gridSub}>posted</Text>
        </View>
      </View>
      <View style={es.gridDividerH} />
      <View style={es.gridRow}>
        <View style={es.gridCell}>
          <Text style={es.gridLabel}>CLAIM RATE</Text>
          <Text style={[es.gridValue, { color: colors.textMuted }]}>—</Text>
          <Text style={es.gridSub}>no claims yet</Text>
        </View>
        <View style={es.gridDividerV} />
        <View style={es.gridCell}>
          <Text style={es.gridLabel}>SPONSORED $</Text>
          <Text style={[es.gridValue, { color: colors.goldDark }]}>S$0</Text>
          <Text style={es.gridSub}>from donors</Text>
        </View>
      </View>
    </View>

    <Text style={es.chartLabel}>MEALS PER WEEK (LAST 8 WEEKS)</Text>
    <View style={es.chartWrap}>
      {WEEKS_8.map((w, i) => (
        <View key={w} style={es.barCol}>
          <View style={[es.placeholderBar, { height: Math.round(BAR_CHART_H * PLACEHOLDER_RATIOS[i]) }]} />
          <Text style={es.barLabel}>{w}</Text>
        </View>
      ))}
    </View>
    <Text style={es.chartCaption}>
      Chart will populate once donations start rolling in.
    </Text>

  </ScrollView>
));

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function RestaurantAnalyticsScreen({ navigation }: Props) {
  const [data, setData]       = useState<RestaurantAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod]   = useState<Period>('30D');

  useEffect(() => {
    setLoading(true);
    getAnalytics(period)
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [period]);

  const handleBack = useCallback(() => navigation.goBack(), [navigation]);

  const handlePeriodChange = useCallback((p: Period) => setPeriod(p), []);

  const handlePostDonation = useCallback(
    () => (navigation.getParent() as any)?.navigate('Donations', { screen: 'PostDonation' }),
    [navigation],
  );

  const isEmpty = useMemo(
    () => !data || (data.livesFed === 0 && data.totalDonations === 0),
    [data],
  );

  const barChartData = useMemo(() => {
    const pts = data?.weeklyMeals ?? [];
    const maxVal = Math.max(...pts.map((p) => p.meals), 1);
    return pts.map((p, i) => ({
      ...p,
      barH: Math.max(4, Math.round((p.meals / maxVal) * BAR_CHART_H)),
      isActive: i === pts.length - 1,
    }));
  }, [data]);

  const linePoints = useMemo(() => {
    const pts = data?.claimRateTrend ?? [];
    if (pts.length < 2) return { line: '', fill: '' };
    const xStep = CARD_INNER_W / (pts.length - 1);
    const coords = pts.map((p, i) => ({
      x: i * xStep,
      y: LINE_CHART_H - (p.ratePct / 100) * LINE_CHART_H,
    }));
    const line = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
    const fill = [
      `0,${LINE_CHART_H}`,
      ...coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`),
      `${CARD_INNER_W},${LINE_CHART_H}`,
    ].join(' ');
    return { line, fill };
  }, [data]);

  const renderDish = useCallback(
    ({ item }: { item: AnalyticsDish }) => <DishRow item={item} />,
    [],
  );
  const renderSponsor = useCallback(
    ({ item }: { item: AnalyticsSponsor }) => <SponsorRow item={item} />,
    [],
  );
  const keyExtractorDish    = useCallback((item: AnalyticsDish) => item.id, []);
  const keyExtractorSponsor = useCallback((item: AnalyticsSponsor) => item.id, []);

  const lastWeekMeals = data?.weeklyMeals[data.weeklyMeals.length - 1]?.meals ?? 0;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>

      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {!loading && isEmpty && (
        <EmptyAnalytics onPostDonation={handlePostDonation} />
      )}

      {!loading && !isEmpty && data && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {/* ── Hero ─────────────────────────────────────────────────────── */}
          <Text style={styles.heroEyebrow}>Total impact</Text>
          <Text style={styles.heroTitle}>Lives fed</Text>
          <Text style={styles.heroNumber}>{data.livesFed.toLocaleString()}</Text>
          <Text style={styles.heroSub}>
            across {data.totalDonations} donations · {data.claimRatePct}% claim rate
          </Text>
          <View style={styles.growthBadge}>
            <Text style={styles.growthText}>+{data.growthPctThisWeek}% this week</Text>
          </View>

          {/* ── Period filter ─────────────────────────────────────────────── */}
          <View style={styles.periodRow}>
            {PERIODS.map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.periodPill, period === p && styles.periodPillActive]}
                onPress={() => handlePeriodChange(p)}
                activeOpacity={0.8}
              >
                <Text style={[styles.periodLabel, period === p && styles.periodLabelActive]}>
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Card 1: bar chart ─────────────────────────────────────────── */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardLabel}>MEALS DONATED · WEEKLY</Text>
              <Text style={styles.cardValue}>{lastWeekMeals}</Text>
            </View>
            <View style={styles.barChartWrap}>
              <View style={styles.yAxis}>
                {[60, 40, 20, 0].map((v) => (
                  <Text key={v} style={styles.yLabel}>{v}</Text>
                ))}
              </View>
              <View style={styles.barsOuter}>
                <View style={styles.barsArea}>
                  {barChartData.map((b) => (
                    <View
                      key={b.week}
                      style={[
                        styles.bar,
                        {
                          height: b.barH,
                          backgroundColor: b.isActive ? colors.accentPrimary : colors.surfaceSecondary,
                        },
                      ]}
                    />
                  ))}
                </View>
                <View style={styles.xAxisRow}>
                  {barChartData.map((b) => (
                    <Text
                      key={b.week}
                      style={[styles.barXLabel, b.isActive && styles.barXLabelActive]}
                    >
                      {b.week}
                    </Text>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* ── Card 2: line/area chart ───────────────────────────────────── */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardLabel}>CLAIM RATE TREND</Text>
              <Text style={styles.cardValue}>{data.claimRatePct}%</Text>
            </View>
            <Svg width={CARD_INNER_W} height={LINE_CHART_H} style={styles.svgChart}>
              <Polygon
                points={linePoints.fill}
                fill={colors.accentLight}
                fillOpacity={0.7}
              />
              <Polyline
                points={linePoints.line}
                fill="none"
                stroke={colors.accentPrimary}
                strokeWidth={2}
              />
            </Svg>
            <View style={styles.xAxisRow}>
              {data.claimRateTrend.map((p, i) => (
                <Text
                  key={p.week}
                  style={[
                    styles.barXLabel,
                    i === data.claimRateTrend.length - 1 && styles.barXLabelActive,
                  ]}
                >
                  {p.week}
                </Text>
              ))}
            </View>
          </View>

          {/* ── Card 3: donation source ───────────────────────────────────── */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardLabel}>DONATION SOURCE</Text>
              <Text style={styles.cardValue}>{data.totalDonations}</Text>
            </View>
            <View style={styles.splitBar}>
              <View style={[styles.splitBarLeft, { flex: data.directCount }]} />
              <View style={[styles.splitBarRight, { flex: data.sponsoredCount }]} />
            </View>
            <View style={styles.sourceRow}>
              <View style={[styles.sourceCard, { backgroundColor: colors.accentLight }]}>
                <Text style={styles.sourceValue}>{data.directCount}</Text>
                <Text style={styles.sourceLabel}>DIRECT</Text>
                <Text style={styles.sourceSub}>
                  {Math.round((data.directCount / data.totalDonations) * 100)}% from your kitchen
                </Text>
              </View>
              <View style={[styles.sourceCard, { backgroundColor: colors.goldLight }]}>
                <Text style={styles.sourceValue}>{data.sponsoredCount}</Text>
                <Text style={styles.sourceLabel}>SPONSORED</Text>
                <Text style={styles.sourceSub}>
                  {Math.round((data.sponsoredCount / data.totalDonations) * 100)}% paid by donors
                </Text>
              </View>
            </View>
          </View>

          {/* ── Card 4: heatmap ───────────────────────────────────────────── */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardLabel}>CLAIM ACTIVITY · LAST 4 WEEKS</Text>
              <Text style={styles.heatmapDays}>Mon → Sun</Text>
            </View>
            <View style={styles.heatmapGrid}>
              {data.heatmap.map((row, ri) => (
                <View key={ri} style={styles.heatmapRow}>
                  {row.map((intensity, ci) => (
                    <View
                      key={ci}
                      style={[styles.heatmapCell, { backgroundColor: HEATMAP_COLOURS[intensity] }]}
                    />
                  ))}
                </View>
              ))}
            </View>
            <View style={styles.heatmapLegend}>
              <Text style={styles.legendText}>Less</Text>
              {HEATMAP_COLOURS.map((c, i) => (
                <View key={i} style={[styles.legendSwatch, { backgroundColor: c }]} />
              ))}
              <Text style={styles.legendText}>More</Text>
            </View>
          </View>

          {/* ── Summary stat row ──────────────────────────────────────────── */}
          <View style={styles.summaryRow}>
            <AnalyticStatCard
              value={String(data.totalDonations)}
              label="DONATIONS"
              valueColor={colors.accentPrimary}
            />
            <AnalyticStatCard
              value={data.livesFed.toLocaleString()}
              label="MEALS"
              valueColor={colors.textPrimary}
            />
            <AnalyticStatCard
              value={`${data.claimRatePct}%`}
              label="CLAIM RATE"
              valueColor={colors.goldDark}
            />
          </View>

          {/* ── Most claimed dishes ───────────────────────────────────────── */}
          <Text style={styles.sectionTitle}>Most claimed dishes</Text>
          <FlatList
            data={data.topDishes}
            keyExtractor={keyExtractorDish}
            renderItem={renderDish}
            ItemSeparatorComponent={RowSeparator}
            scrollEnabled={false}
            removeClippedSubviews={false}
            maxToRenderPerBatch={10}
            windowSize={5}
          />

          {/* ── Sponsors ──────────────────────────────────────────────────── */}
          <Text style={[styles.sectionTitle, styles.sectionTitleGap]}>Sponsors</Text>
          <FlatList
            data={data.topSponsors}
            keyExtractor={keyExtractorSponsor}
            renderItem={renderSponsor}
            ItemSeparatorComponent={RowSeparator}
            scrollEnabled={false}
            removeClippedSubviews={false}
            maxToRenderPerBatch={10}
            windowSize={5}
          />

        </ScrollView>
      )}

    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },

  header: {
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
  },

  scroll: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.sm,
    paddingBottom: 100,
  },

  // ── Hero ────────────────────────────────────────────────────────────────────
  heroEyebrow: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    color: colors.textMuted,
  },
  heroTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['2xl'],
    letterSpacing: letterSpacings.subheading,
    color: colors.textPrimary,
    marginTop: 2,
  },
  heroNumber: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['5xl'],
    letterSpacing: letterSpacings.heading,
    color: colors.textPrimary,
    lineHeight: fontSizes['5xl'],
    marginTop: spacing.lg,
  },
  heroSub: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['14'],
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
  },
  growthText: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['12'],
    color: colors.successGreen,
  },

  // ── Period filter ────────────────────────────────────────────────────────────
  periodRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: spacing['2xl'],
    marginBottom: spacing['2xl'],
  },
  periodPill: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodPillActive: { backgroundColor: colors.textPrimary },
  periodLabel: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['12'],
    color: colors.textMuted,
  },
  periodLabelActive: { color: colors.textInverse },

  // ── Card wrapper ─────────────────────────────────────────────────────────────
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    padding: 16,
    marginBottom: spacing['2xl'],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardLabel: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    letterSpacing: 0.88,
    textTransform: 'uppercase',
    flex: 1,
    marginRight: 8,
  },
  cardValue: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['2xl'],
    color: colors.textPrimary,
    letterSpacing: letterSpacings.subheading,
  },

  // ── Bar chart ────────────────────────────────────────────────────────────────
  barChartWrap: {
    flexDirection: 'row',
  },
  yAxis: {
    width: 28,
    height: BAR_CHART_H,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 4,
    paddingBottom: 2,
  },
  yLabel: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    lineHeight: 14,
  },
  barsOuter: { flex: 1 },
  barsArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: BAR_CHART_H,
    gap: 4,
  },
  bar: {
    flex: 1,
    borderRadius: radius.xs,
  },
  xAxisRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 6,
  },
  barXLabel: {
    flex: 1,
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    textAlign: 'center',
  },
  barXLabelActive: {
    color: colors.accentPrimary,
    fontFamily: fontFamilies.semiBold,
  },

  // ── Line/area chart ──────────────────────────────────────────────────────────
  svgChart: { marginBottom: 6 },

  // ── Donation source ──────────────────────────────────────────────────────────
  splitBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: radius.pill,
    overflow: 'hidden',
    marginBottom: 12,
  },
  splitBarLeft: {
    backgroundColor: colors.accentPrimary,
  },
  splitBarRight: {
    backgroundColor: colors.goldDark,
  },
  sourceRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  sourceCard: {
    flex: 1,
    borderRadius: radius.sm,
    padding: 12,
  },
  sourceValue: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['2xl'],
    color: colors.textPrimary,
    letterSpacing: letterSpacings.subheading,
  },
  sourceLabel: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    letterSpacing: 0.88,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  sourceSub: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    color: colors.textMuted,
    marginTop: 4,
  },

  // ── Heatmap ──────────────────────────────────────────────────────────────────
  heatmapDays: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    color: colors.textMuted,
  },
  heatmapGrid: { gap: 4 },
  heatmapRow: {
    flexDirection: 'row',
    gap: 4,
  },
  heatmapCell: {
    width: HEATMAP_CELL,
    height: HEATMAP_CELL,
    borderRadius: radius.xs,
  },
  heatmapLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  legendText: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    color: colors.textMuted,
  },
  legendSwatch: {
    width: 14,
    height: 14,
    borderRadius: radius.xs,
  },

  // ── Summary stat row ─────────────────────────────────────────────────────────
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: spacing['2xl'],
  },
  summaryStatCard: {
    flex: 1,
    alignItems: 'center',
  },
  summaryStatValue: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['2xl'],
    letterSpacing: letterSpacings.subheading,
  },
  summaryStatLabel: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    letterSpacing: 0.88,
    textTransform: 'uppercase',
    marginTop: 4,
    textAlign: 'center',
  },

  // ── Section titles ───────────────────────────────────────────────────────────
  sectionTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.lg,
    letterSpacing: -0.425,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  sectionTitleGap: { marginTop: spacing['2xl'] },

  // ── List rows ────────────────────────────────────────────────────────────────
  separator: {
    height: 1,
    backgroundColor: colors.borderDefault,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: spacing.lg,
  },
  dishThumb: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    overflow: 'hidden',
    backgroundColor: colors.borderDefault,
  },
  dishThumbPlaceholder: { backgroundColor: colors.mintLight },
  listRowText: { flex: 1 },
  listRowName: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['14'],
    color: colors.textPrimary,
    letterSpacing: -0.21,
  },
  listRowSub: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    color: colors.textMuted,
    marginTop: 2,
  },
  sponsorAvatar: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  anonAvatar: { backgroundColor: colors.surfaceSecondary },
  sponsorInitials: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.sm,
    color: colors.goldDark,
  },
});

// ─── Empty styles ─────────────────────────────────────────────────────────────

const es = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: 80,
  },
  card: {
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    padding: spacing['2xl'],
    alignItems: 'center',
  },
  illoCircle: {
    width: 96,
    height: 96,
    borderRadius: radius.pill,
    backgroundColor: colors.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['2xl'],
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  sub: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['14'],
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 8,
    marginTop: 8,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentPrimary,
    borderRadius: radius.pill,
    height: 48,
    paddingHorizontal: spacing['3xl'],
    gap: 8,
    marginTop: spacing['2xl'],
  },
  btnText: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.md,
    letterSpacing: letterSpacings.button,
    color: colors.textInverse,
  },
  sectionTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.xl,
    color: colors.textPrimary,
    marginTop: spacing['2xl'],
    marginBottom: spacing.lg,
  },
  grid: {
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    overflow: 'hidden',
  },
  gridRow: { flexDirection: 'row' },
  gridCell: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: spacing.md,
  },
  gridDividerV: {
    width: 1,
    backgroundColor: colors.borderDefault,
  },
  gridDividerH: {
    height: 1,
    backgroundColor: colors.borderDefault,
  },
  gridLabel: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    letterSpacing: 0.88,
    textTransform: 'uppercase',
  },
  gridValue: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['2xl'],
    color: colors.textPrimary,
    letterSpacing: letterSpacings.subheading,
    marginTop: 4,
  },
  gridSub: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    color: colors.textMuted,
    marginTop: 2,
  },
  chartLabel: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    letterSpacing: 0.88,
    textTransform: 'uppercase',
    marginTop: spacing['2xl'],
    marginBottom: 12,
  },
  chartWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: BAR_CHART_H + 20,
    gap: 4,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  placeholderBar: {
    width: '100%',
    backgroundColor: colors.borderDefault,
    borderRadius: radius.xs,
    opacity: 0.6,
  },
  barLabel: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  chartCaption: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 12,
  },
});
