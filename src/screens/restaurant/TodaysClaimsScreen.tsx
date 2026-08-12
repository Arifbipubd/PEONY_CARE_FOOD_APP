import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  ActivityIndicator, RefreshControl, Modal, TextInput,
  KeyboardAvoidingView, Platform, ScrollView as RNScrollView,
  Pressable, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import {
  getTodaysClaims, collectClaim, markNoShow,
  getClaimReportContext, submitClaimReport,
  TodaysClaimsData,
} from '../../services/restaurant';
import { RestaurantClaim, ClaimReportContext } from '../../types';
import { ProfileStackParamList } from '../../navigation/RestaurantTabs';
import { ApiError } from '../../services/api';
import {
  colors, spacing, radius, fontSizes, fontFamilies, letterSpacings,
} from '../../constants/theme';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'TodaysClaims'>;
type FilterKey = 'all' | 'pending' | 'collected' | 'noShow';

interface ReportState {
  claim:             RestaurantClaim;
  context:           ClaimReportContext | null;
  contextLoading:    boolean;
  selectedReasonId:  string | null;
  comment:           string;
  submitting:        boolean;
}

const FILTER_ORDER: FilterKey[] = ['collected'];
const FILTER_LABELS: Record<FilterKey, string> = {
  all: 'All', pending: 'Pending', collected: 'Collected', noShow: 'No-show',
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function claimStatusKey(c: RestaurantClaim): string {
  return (c.statusKey ?? c.status ?? '').toUpperCase();
}

function isPending(c: RestaurantClaim): boolean {
  const s = claimStatusKey(c);
  return s === 'CLAIMED' || s === 'PENDING';
}
function isCollected(c: RestaurantClaim): boolean { return claimStatusKey(c) === 'COLLECTED'; }
function isNoShow(c: RestaurantClaim): boolean    { return claimStatusKey(c) === 'NO_SHOW'; }

export default function TodaysClaimsScreen({ navigation }: { navigation: Nav }) {
  const insets = useSafeAreaInsets();

  const [data,       setData]       = useState<TodaysClaimsData | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter,     setFilter]     = useState<FilterKey>('collected');
  const [actionId,   setActionId]   = useState<string | null>(null);
  const [report,     setReport]     = useState<ReportState | null>(null);

  const load = useCallback(async () => {
    try {
      const result = await getTodaysClaims();
      setData(result);
    } catch {
      // keep previous data on network error
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
    }, [load]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load().finally(() => setRefreshing(false));
  }, [load]);

  const filterCounts = useMemo<Record<FilterKey, number>>(() => {
    if (!data) return { all: 0, pending: 0, collected: 0, noShow: 0 };
    return {
      all:       data.total,
      pending:   data.pending,
      collected: data.collected,
      noShow:    data.noShow,
    };
  }, [data]);

  const filteredClaims = useMemo<RestaurantClaim[]>(() => {
    if (!data) return [];
    if (filter === 'all')       return data.claims;
    if (filter === 'pending')   return data.claims.filter(isPending);
    if (filter === 'collected') return data.claims.filter(isCollected);
    return data.claims.filter(isNoShow);
  }, [data, filter]);

  const subtitle = useMemo(() => {
    if (!data || data.total === 0) return 'no claims yet today';
    const parts: string[] = [];
    if (data.pending   > 0) parts.push(`${data.pending} pending`);
    if (data.collected > 0) parts.push(`${data.collected} collected`);
    if (data.noShow    > 0) parts.push(`${data.noShow} no-show`);
    return parts.join(' · ');
  }, [data]);

  const handleMarkCollected = useCallback(async (claim: RestaurantClaim) => {
    setActionId(claim.id);
    try {
      await collectClaim(claim.id);
      setData((prev) => {
        if (!prev) return prev;
        const claims = prev.claims.map((c) =>
          c.id === claim.id
            ? { ...c, status: 'COLLECTED', statusKey: 'COLLECTED', statusLabel: 'Collected',
                canMarkCollected: false, canMarkNoShow: false,
                collectedAt: new Date().toISOString() }
            : c,
        );
        const newCollected = claims.filter(isCollected).length;
        const newPending   = claims.filter(isPending).length;
        return { ...prev, claims, collected: newCollected, pending: newPending };
      });
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : 'Could not mark collected. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setActionId(null);
    }
  }, []);

  const handleMarkNoShow = useCallback(async (claim: RestaurantClaim) => {
    setActionId(claim.id);
    try {
      await markNoShow(claim.id);
      setData((prev) => {
        if (!prev) return prev;
        const claims = prev.claims.map((c) =>
          c.id === claim.id
            ? { ...c, status: 'NO_SHOW', statusKey: 'NO_SHOW', statusLabel: 'No-show',
                canMarkCollected: false, canMarkNoShow: false }
            : c,
        );
        const newNoShow  = claims.filter(isNoShow).length;
        const newPending = claims.filter(isPending).length;
        return { ...prev, claims, noShow: newNoShow, pending: newPending };
      });
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : 'Could not mark as no-show.';
      Alert.alert('Error', msg);
    } finally {
      setActionId(null);
    }
  }, []);

  const openReport = useCallback(async (claim: RestaurantClaim) => {
    setReport({ claim, context: null, contextLoading: true, selectedReasonId: null, comment: '', submitting: false });
    try {
      const ctx = await getClaimReportContext(claim.id);
      setReport((prev) => prev ? { ...prev, context: ctx, contextLoading: false } : null);
    } catch {
      setReport((prev) => prev ? { ...prev, contextLoading: false } : null);
    }
  }, []);

  const closeReport = useCallback(() => setReport(null), []);

  const handleSubmitReport = useCallback(async () => {
    if (!report?.selectedReasonId || !report.claim) return;
    setReport((prev) => prev ? { ...prev, submitting: true } : null);
    try {
      await submitClaimReport(report.claim.id, report.selectedReasonId, report.comment || undefined);
      setReport(null);
    } catch {
      setReport((prev) => prev ? { ...prev, submitting: false } : null);
    }
  }, [report]);

  const renderClaim = useCallback(({ item }: { item: RestaurantClaim }) => {
    const pending   = isPending(item);
    const collected = isCollected(item);
    const noShow    = isNoShow(item);
    const initials  = getInitials(item.receiverName);
    const actioning = actionId === item.id;

    return (
      <View style={styles.card}>
        {/* Top row: avatar + info + status badge */}
        <View style={styles.cardTop}>
          {collected ? (
            <View style={[styles.avatar, styles.avatarGreen]}>
              <Ionicons name="checkmark" size={18} color={colors.successGreen} />
            </View>
          ) : noShow ? (
            <View style={[styles.avatar, styles.avatarGray]}>
              <Ionicons name="close" size={16} color={colors.textMuted} />
            </View>
          ) : (
            <View style={[styles.avatar, styles.avatarRed]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}

          <View style={styles.cardInfo}>
            <Text style={styles.receiverName} numberOfLines={1}>{item.receiverName}</Text>
            <Text style={styles.pickupLine} numberOfLines={1}>
              {pending
                ? `Pickup ${item.pickupWindowShort ?? item.pickupWindow}`
                : item.collectedAtLabel ?? (collected ? 'Collected' : 'No-show')}
            </Text>
            {!!item.itemsLabel && (
              <Text style={styles.itemsLabel} numberOfLines={2}>{item.itemsLabel}</Text>
            )}
          </View>

          {collected ? (
            <View style={[styles.statusBadge, styles.statusBadgeGreen]}>
              <Text style={styles.statusBadgeGreenText}>Collected</Text>
            </View>
          ) : noShow ? (
            <View style={[styles.statusBadge, styles.statusBadgeYellow]}>
              <Text style={styles.statusBadgeYellowText}>No-show</Text>
            </View>
          ) : (
            <View style={[styles.statusBadge, styles.statusBadgePending]}>
              <Text style={styles.statusBadgePendingText}>Pending</Text>
            </View>
          )}
        </View>

        {/* Action row — only for pending claims */}
        {pending && (
          <View style={styles.cardActions}>
            <View style={styles.actionBtns}>
              {item.canMarkCollected && (
                <TouchableOpacity
                  style={[styles.btnCollect, actioning && styles.btnDisabled]}
                  onPress={() => handleMarkCollected(item)}
                  disabled={actioning}
                  activeOpacity={0.85}
                >
                  <Ionicons name="qr-code" size={13} color={colors.textInverse} />
                  <Text style={styles.btnCollectText}>
                    {actioning ? 'Saving…' : 'Mark collected'}
                  </Text>
                </TouchableOpacity>
              )}
              {item.canMarkNoShow && (
                <TouchableOpacity
                  style={[styles.btnNoShow, actioning && styles.btnDisabled]}
                  onPress={() => handleMarkNoShow(item)}
                  disabled={actioning}
                  activeOpacity={0.85}
                >
                  <Text style={styles.btnNoShowText}>Mark no-show</Text>
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity style={styles.reportLink} onPress={() => openReport(item)} activeOpacity={0.7}>
              <Ionicons name="flag" size={13} color={colors.textMuted} />
              <Text style={styles.reportLinkText}>Report</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }, [actionId, handleMarkCollected, handleMarkNoShow, openReport]);

  const ListHeader = useCallback(() => (
    <View style={styles.listHeader}>
      <Text style={styles.todayLabel}>Today</Text>
      <Text style={styles.pageTitle}>Claims</Text>

      <View style={styles.counterBox}>
        <Text style={styles.counterNum}>{data?.total ?? 0}</Text>
      </View>
      <Text style={styles.subtitle}>{subtitle}</Text>

      <RNScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsScroll}
        contentContainerStyle={styles.chipsContent}
      >
        {FILTER_ORDER.map((key) => (
          <TouchableOpacity
            key={key}
            style={[styles.chip, filter === key && styles.chipActive]}
            onPress={() => setFilter(key)}
            activeOpacity={0.8}
          >
            <Text style={[styles.chipLabel, filter === key && styles.chipLabelActive]}>
              {FILTER_LABELS[key]}
            </Text>
            <Text style={[styles.chipCount, filter === key && styles.chipCountActive]}>
              {' '}{filterCounts[key]}
            </Text>
          </TouchableOpacity>
        ))}
      </RNScrollView>
    </View>
  ), [data, subtitle, filter, filterCounts]);

  const ListEmpty = useCallback(() => {
    if (filter !== 'all') {
      return (
        <View style={styles.filterEmpty}>
          <Text style={styles.filterEmptyText}>No {FILTER_LABELS[filter].toLowerCase()} claims</Text>
        </View>
      );
    }
    return (
      <View style={styles.emptyState}>
        <Ionicons name="reader-outline" size={52} color={colors.borderDefault} />
        <Text style={styles.emptyTitle}>No claims yet</Text>
        <Text style={styles.emptyBody}>
          Once receivers start claiming your active donations, they'll appear here — ready to be marked collected.
        </Text>
        <TouchableOpacity
          style={styles.viewDonationsBtn}
          onPress={() => (navigation.getParent() as any)?.navigate('Donations', { screen: 'DonationList' })}
          activeOpacity={0.85}
        >
          <Ionicons name="receipt" size={18} color={colors.textInverse} />
          <Text style={styles.viewDonationsBtnText}>View my donations</Text>
        </TouchableOpacity>
      </View>
    );
  }, [filter, navigation]);

  const ListFooter = useCallback(() => {
    if ((data?.total ?? 0) === 0) return null;
    return (
      <View style={styles.footerHint}>
        <Ionicons name="qr-code" size={18} color={colors.accentPrimary} style={styles.footerIcon} />
        <Text style={styles.footerHintText}>
          {'Each claim gets marked '}
          <Text style={styles.footerHintBold}>collected</Text>
          {' after the receiver scans your pickup QR — no manual verification needed.'}
        </Text>
      </View>
    );
  }, [data]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconBtn, styles.bellBtn]} activeOpacity={0.8}>
          <Ionicons name="notifications" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {loading && !data ? (
        <View style={styles.centred}>
          <ActivityIndicator color={colors.accentPrimary} />
        </View>
      ) : (
        <FlatList
          data={filteredClaims}
          keyExtractor={(item) => item.id}
          renderItem={renderClaim}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={ListEmpty}
          ListFooterComponent={ListFooter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accentPrimary}
              colors={[colors.accentPrimary]}
            />
          }
          contentContainerStyle={styles.listContent}
          removeClippedSubviews
          maxToRenderPerBatch={10}
          windowSize={10}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Report bottom sheet */}
      <Modal
        visible={!!report}
        transparent
        animationType="slide"
        onRequestClose={closeReport}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <Pressable style={styles.modalDismiss} onPress={closeReport} />
          <View style={[styles.reportSheet, { paddingBottom: insets.bottom + spacing['2xl'] }]}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Report this claim</Text>

            {report?.contextLoading ? (
              <ActivityIndicator color={colors.accentPrimary} style={styles.sheetLoader} />
            ) : report?.context ? (
              <RNScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Text style={styles.sheetContext}>{report.context.contextLine}</Text>

                <Text style={styles.sheetSectionLabel}>Reason</Text>
                {report.context.reasons.map((reason) => (
                  <TouchableOpacity
                    key={reason.id}
                    style={styles.reasonRow}
                    onPress={() =>
                      setReport((prev) => prev ? { ...prev, selectedReasonId: reason.id } : null)
                    }
                    activeOpacity={0.8}
                  >
                    <View style={[styles.radio, report.selectedReasonId === reason.id && styles.radioSelected]}>
                      {report.selectedReasonId === reason.id && <View style={styles.radioDot} />}
                    </View>
                    <Text style={styles.reasonText}>{reason.label}</Text>
                  </TouchableOpacity>
                ))}

                <Text style={styles.sheetSectionLabel}>Comment (optional)</Text>
                <TextInput
                  style={styles.commentInput}
                  value={report.comment}
                  onChangeText={(t) =>
                    setReport((prev) => prev ? { ...prev, comment: t } : null)
                  }
                  placeholder="Add more context…"
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />

                <Text style={styles.sheetFooter}>{report.context.footerNote}</Text>

                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    (!report.selectedReasonId || report.submitting) && styles.submitBtnDisabled,
                  ]}
                  onPress={handleSubmitReport}
                  disabled={!report.selectedReasonId || report.submitting}
                  activeOpacity={0.85}
                >
                  <Text style={styles.submitBtnText}>
                    {report.submitting ? 'Submitting…' : 'Submit report'}
                  </Text>
                </TouchableOpacity>
              </RNScrollView>
            ) : (
              <Text style={styles.sheetContext}>Could not load reasons. Please try again.</Text>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: colors.surface },
  centred: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBtn: {
    backgroundColor: colors.surfaceSecondary,
  },

  // ── List ────────────────────────────────────────────────────────────────────
  listContent: {
    paddingBottom: spacing['4xl'],
  },
  listHeader: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing.md,
  },

  // ── Title block ─────────────────────────────────────────────────────────────
  todayLabel: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    includeFontPadding: false,
  },
  pageTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['3xl'],
    color: colors.textPrimary,
    letterSpacing: letterSpacings.subheading,
    includeFontPadding: false,
    marginBottom: spacing.lg,
  },

  // ── Counter box ──────────────────────────────────────────────────────────────
  counterBox: {
    marginBottom: spacing.sm,
  },
  counterNum: {
    fontFamily: fontFamilies.bold,
    fontSize: 56,
    color: colors.textPrimary,
    letterSpacing: letterSpacings.subheading,
    includeFontPadding: false,
    lineHeight: 64,
  },
  subtitle: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginBottom: spacing.xl,
    includeFontPadding: false,
  },

  // ── Filter chips ─────────────────────────────────────────────────────────────
  chipsScroll: { marginHorizontal: -spacing['2xl'] },
  chipsContent: {
    paddingHorizontal: spacing['2xl'],
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: 9,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  chipLabel: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
    includeFontPadding: false,
  },
  chipLabelActive: { color: colors.textInverse },
  chipCount: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    includeFontPadding: false,
  },
  chipCountActive: { color: colors.textInverse },

  // ── Claim card ───────────────────────────────────────────────────────────────
  card: {
    marginHorizontal: spacing['2xl'],
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    padding: spacing.lg,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },

  // Avatar
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarRed:   { backgroundColor: colors.avatarBg },
  avatarGreen: { backgroundColor: colors.successGreenLight },
  avatarGray:  { backgroundColor: colors.surfaceSecondary },
  avatarText: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.xs,
    color: colors.accentPrimary,
    includeFontPadding: false,
  },

  // Card info
  cardInfo: { flex: 1, gap: 2 },
  receiverName: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['14'],
    color: colors.textPrimary,
    includeFontPadding: false,
  },
  pickupLine: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    color: colors.textMuted,
    includeFontPadding: false,
  },
  itemsLabel: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    color: colors.textMuted,
    includeFontPadding: false,
    marginTop: 1,
  },

  // Status badges
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
    flexShrink: 0,
    alignSelf: 'flex-start',
  },
  statusBadgePending: {
    borderWidth: 1,
    borderColor: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  statusBadgePendingText: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.xs,
    color: colors.textPrimary,
    includeFontPadding: false,
  },
  statusBadgeGreen: {
    backgroundColor: colors.successGreenLight,
  },
  statusBadgeGreenText: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.xs,
    color: colors.successGreen,
    includeFontPadding: false,
  },
  statusBadgeYellow: {
    backgroundColor: colors.warningYellowLight,
  },
  statusBadgeYellowText: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.xs,
    color: colors.warningYellow,
    includeFontPadding: false,
  },

  // Card actions
  cardActions: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  actionBtns: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  btnCollect: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.lg,
    paddingVertical: 9,
    backgroundColor: colors.accentPrimary,
    borderRadius: radius.pill,
  },
  btnCollectText: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.xs,
    color: colors.textInverse,
    letterSpacing: letterSpacings.buttonSm,
    includeFontPadding: false,
  },
  btnNoShow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 9,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  btnNoShowText: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.xs,
    color: colors.textPrimary,
    includeFontPadding: false,
  },
  btnDisabled: { opacity: 0.5 },
  reportLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
  },
  reportLinkText: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    includeFontPadding: false,
  },

  // ── Empty states ──────────────────────────────────────────────────────────────
  filterEmpty: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: spacing['2xl'],
  },
  filterEmptyText: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['14'],
    color: colors.textMuted,
    includeFontPadding: false,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: spacing['3xl'],
    paddingTop: 32,
    gap: spacing.md,
  },
  emptyTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.xl,
    color: colors.textPrimary,
    includeFontPadding: false,
    marginTop: spacing.md,
  },
  emptyBody: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['14'],
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    includeFontPadding: false,
  },
  viewDonationsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.lg,
    paddingHorizontal: spacing['2xl'],
    height: 52,
    backgroundColor: colors.accentPrimary,
    borderRadius: radius.pill,
  },
  viewDonationsBtnText: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['14'],
    color: colors.textInverse,
    letterSpacing: letterSpacings.button,
    includeFontPadding: false,
  },

  // ── Footer hint ───────────────────────────────────────────────────────────────
  footerHint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginHorizontal: spacing['2xl'],
    marginTop: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.input,
  },
  footerIcon: { marginTop: 1 },
  footerHintText: {
    flex: 1,
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    color: colors.textMuted,
    lineHeight: 18,
    includeFontPadding: false,
  },
  footerHintBold: {
    fontFamily: fontFamilies.bold,
    color: colors.textPrimary,
  },

  // ── Report modal ──────────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalDismiss: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  reportSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius:  radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.lg,
    maxHeight: '85%',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.borderDefault,
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  sheetTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['16'],
    color: colors.textPrimary,
    includeFontPadding: false,
    marginBottom: spacing.md,
  },
  sheetLoader: { marginVertical: 32 },
  sheetContext: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: spacing.xl,
    includeFontPadding: false,
  },
  sheetSectionLabel: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    letterSpacing: 0.6,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
    includeFontPadding: false,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: colors.accentPrimary },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.accentPrimary,
  },
  reasonText: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['14'],
    color: colors.textPrimary,
    flex: 1,
    includeFontPadding: false,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.input,
    padding: spacing.lg,
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['14'],
    color: colors.textPrimary,
    minHeight: 88,
  },
  sheetFooter: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    color: colors.textMuted,
    lineHeight: 18,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    includeFontPadding: false,
  },
  submitBtn: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentPrimary,
    borderRadius: radius.card,
    marginBottom: spacing.md,
  },
  submitBtnDisabled: { opacity: 0.45 },
  submitBtnText: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['14'],
    color: colors.textInverse,
    letterSpacing: letterSpacings.button,
    includeFontPadding: false,
  },
});
