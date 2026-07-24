import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useFocusEffect } from '@react-navigation/native';
import ImageWithSkeleton from '../../components/ImageWithSkeleton';
import { DonationsStackParamList } from '../../navigation/RestaurantTabs';
import { getDonationDetail, deleteDonation, pauseDonation } from '../../services/restaurant';
import { RestaurantDonation } from '../../types';
import CollectQrSheet     from '../../components/CollectQrSheet';
import CollectFailedSheet  from '../../components/CollectFailedSheet';
import CollectSuccessSheet from '../../components/CollectSuccessSheet';
import DeleteDonationSheet from '../../components/DeleteDonationSheet';
import {
  colors, spacing, radius, fontSizes, fontFamilies, letterSpacings, layout,
} from '../../constants/theme';

type Props = {
  navigation: NativeStackNavigationProp<DonationsStackParamList, 'DonationDetail'>;
  route:      RouteProp<DonationsStackParamList, 'DonationDetail'>;
};

type CollectState = null | 'qr' | 'success' | 'failed';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-SG', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

function timeRemaining(pickupEnd: string): string {
  const diff = new Date(pickupEnd).getTime() - Date.now();
  if (diff <= 0) return 'Window closed';
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (h > 0) return `${h}h ${m}m until window closes`;
  return `${m}m until window closes`;
}

export default function DonationDetailScreen({ navigation, route }: Props) {
  const { donationId } = route.params;
  const insets = useSafeAreaInsets();

  const [donation, setDonation]    = useState<RestaurantDonation | null>(null);
  const [loading, setLoading]      = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [collectState, setCollect] = useState<CollectState>(null);
  const [deleteVisible, setDelete] = useState(false);
  const [deleting, setDeleting]    = useState(false);
  const [pausing, setPausing]      = useState(false);

  const loadData = useCallback(
    () => getDonationDetail(donationId).then(setDonation).catch(() => {}),
    [donationId],
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

  const openQr         = useCallback(() => setCollect('qr'),  []);
  const closeAllSheets = useCallback(() => setCollect(null),   []);
  const showQrAgain    = useCallback(() => setCollect('qr'),   []);
  const openDelete     = useCallback(() => setDelete(true),   []);
  const closeDelete    = useCallback(() => setDelete(false),  []);

  const confirmDelete = useCallback(async () => {
    if (!donation) return;
    setDeleting(true);
    try {
      await deleteDonation(donation.id);
      setDelete(false);
      navigation.goBack();
    } catch {
      setDeleting(false);
    }
  }, [donation, navigation]);

  const handlePause = useCallback(async () => {
    if (!donation || pausing) return;
    setPausing(true);
    try {
      await pauseDonation(donation.id);
      navigation.navigate('DonationList', { initialTab: 'inactive' });
    } catch {
      setPausing(false);
    }
  }, [donation, navigation, pausing]);

  const handleEdit = useCallback(() => {
    navigation.navigate('PostDonation', { donationId: donation?.id });
  }, [donation, navigation]);

  if (loading) {
    return (
      <View style={styles.centred}>
        <ActivityIndicator color={colors.accentPrimary} />
      </View>
    );
  }

  if (!donation) {
    return (
      <View style={[styles.centred, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, styles.backBtnFallback]}>
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.errorText}>Donation not found.</Text>
      </View>
    );
  }

  const claimedPct  = donation.quantityOriginal > 0
    ? (donation.quantityClaimed / donation.quantityOriginal) * 100
    : 0;
  const leftToClaim = donation.quantityAvailable;
  const claims      = donation.claims ?? [];
  const isSponsored = !!donation.sponsorDisplayName;
  const sourceName  = isSponsored ? donation.sponsorDisplayName! : 'Self-donated';
  const sourceNote  = donation.donationSourceNote
    ?? (isSponsored ? undefined : 'Surplus from today\'s service');

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accentPrimary} colors={[colors.accentPrimary]} />}
      >

        {/* Hero image */}
        <View>
          <ImageWithSkeleton
            source={{ uri: donation.photoUrl }}
            style={styles.image}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={[styles.backBtn, { top: insets.top + spacing.md }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>

          {/* Badges row */}
          <View style={styles.badgeRow}>
            <View style={[styles.badge, styles.badgeGreen]}>
              <Ionicons name="checkmark-circle" size={12} color={colors.successGreen} />
              <Text style={styles.badgeGreenText}>{donation.listStatus}</Text>
            </View>
            {donation.isRepeating && (
              <View style={[styles.badge, styles.badgeRed]}>
                <Ionicons name="refresh" size={12} color={colors.accentPrimary} />
                <Text style={styles.badgeRedText}>Repeats daily</Text>
              </View>
            )}
          </View>

          {/* Title + meta */}
          <Text style={styles.title}>{donation.name}</Text>
          <Text style={styles.meta}>
            {donation.category} · {donation.quantityOriginal} {donation.unit} · pickup {donation.pickupWindow}
          </Text>

          {/* Progress section */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.claimedLabel}>CLAIMED</Text>
              <Text style={styles.claimedCount}>
                <Text style={styles.claimedNum}>{donation.quantityClaimed}</Text>
                <Text style={styles.claimedTotal}>/{donation.quantityOriginal}</Text>
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.min(claimedPct, 100)}%` as `${number}%` }]} />
            </View>
            <View style={styles.progressFooter}>
              <Text style={styles.progressSub}>{leftToClaim} left to claim</Text>
              <Text style={styles.progressSub}>{timeRemaining(donation.pickupEnd)}</Text>
            </View>
          </View>

          {/* Repeats daily card */}
          {donation.isRepeating && (
            <View style={styles.repeatCard}>
              <Ionicons name="refresh" size={20} color={colors.accentPrimary} />
              <View style={styles.repeatCardBody}>
                <Text style={styles.repeatCardTitle}>Repeats daily</Text>
                <Text style={styles.repeatCardSub} numberOfLines={2}>
                  Auto-posts every day at {donation.repeatTimeLabel ?? '--'}
                  {donation.nextPostLabel ? ` · next ${donation.nextPostLabel}` : ''}
                </Text>
              </View>
              <TouchableOpacity onPress={handleEdit} hitSlop={8}>
                <Text style={styles.editLink}>Edit</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Description */}
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{donation.description}</Text>

          {/* Claims */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Claims</Text>
            <Text style={styles.sectionCount}>{donation.quantityClaimed} of {donation.quantityOriginal}</Text>
          </View>

          {claims.map((claim) => {
            const collected = claim.status === 'COLLECTED';
            const initials  = getInitials(claim.receiverName);
            const timeLabel = collected
              ? `Collected ${formatTime(claim.collectedAt ?? claim.claimedAt)}`
              : 'Waiting for pickup';
            return (
              <View key={claim.id} style={styles.claimRow}>
                {collected ? (
                  <View style={[styles.avatar, styles.avatarGreen]}>
                    <Ionicons name="checkmark" size={18} color={colors.successGreen} />
                  </View>
                ) : (
                  <View style={[styles.avatar, styles.avatarGray]}>
                    <Text style={styles.avatarInitials}>{initials}</Text>
                  </View>
                )}
                <View style={styles.claimInfo}>
                  <Text style={styles.claimName}>{claim.receiverName}</Text>
                  <Text style={styles.claimTime}>{timeLabel}</Text>
                </View>
                {collected ? (
                  <View style={styles.collectedBadge}>
                    <Text style={styles.collectedBadgeText}>Collected</Text>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.markBtn} onPress={openQr} activeOpacity={0.85}>
                    <Text style={styles.markBtnText}>Mark collected</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}

          {claims.length === 0 && (
            <Text style={styles.noClaimsText}>No claims yet.</Text>
          )}

          {/* Donation source */}
          <Text style={[styles.sectionTitle, styles.donationSourceTitle]}>Donation source</Text>
          <View style={styles.sourceRow}>
            <View style={[styles.avatar, styles.avatarPink]}>
              <Ionicons
                name={isSponsored ? 'person' : 'storefront'}
                size={18}
                color={colors.accentPrimary}
              />
            </View>
            <View style={styles.sourceBody}>
              <Text style={styles.sourceName}>{sourceName}</Text>
              {sourceNote && <Text style={styles.sourceNote}>{sourceNote}</Text>}
            </View>
          </View>

          {/* Show QR Code */}
          <TouchableOpacity style={styles.qrBtn} onPress={openQr} activeOpacity={0.85}>
            <Ionicons name="qr-code" size={20} color={colors.textInverse} />
            <Text style={styles.qrBtnText}>Show QR Code</Text>
          </TouchableOpacity>

          {/* Edit + Pause buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.outlineBtn} onPress={handleEdit} activeOpacity={0.8}>
              <Ionicons name="create" size={16} color={colors.textPrimary} />
              <Text style={styles.outlineBtnText}>Edit listing</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.outlineBtn}
              onPress={handlePause}
              activeOpacity={0.8}
              disabled={pausing}
            >
              <Ionicons name="pause" size={16} color={colors.textPrimary} />
              <Text style={styles.outlineBtnText}>{pausing ? 'Pausing…' : 'Pause'}</Text>
            </TouchableOpacity>
          </View>

          {/* Delete */}
          <TouchableOpacity style={styles.deleteBtn} onPress={openDelete} activeOpacity={0.8}>
            <Ionicons name="trash" size={16} color={colors.dangerRed} />
            <Text style={styles.deleteBtnText}>Delete donation</Text>
          </TouchableOpacity>

          {/* Footer hint */}
          <Text style={styles.footerHint}>
            {'To mark a claim collected, tap '}
            <Text style={styles.footerHintBold}>Mark collected</Text>
            {' to show a QR, then have the receiver scan it. If their scan fails, the claim stays pending.'}
          </Text>

        </View>
      </ScrollView>

      <CollectQrSheet
        visible={collectState === 'qr'}
        qrData={donation.foodQrData}
        onCancel={closeAllSheets}
      />
      <CollectFailedSheet
        visible={collectState === 'failed'}
        onShowQrAgain={showQrAgain}
        onClose={closeAllSheets}
      />
      <CollectSuccessSheet
        visible={collectState === 'success'}
        onDone={closeAllSheets}
      />
      <DeleteDonationSheet
        visible={deleteVisible}
        foodName={donation.name}
        deleting={deleting}
        onConfirm={confirmDelete}
        onCancel={closeDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: colors.surface },
  centred: { flex: 1, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  errorText: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['14'],
    color: colors.textMuted,
    marginTop: spacing.lg,
    includeFontPadding: false,
  },

  // Hero image
  image: {
    width: '100%',
    height: layout.foodImageHeight,
    backgroundColor: colors.borderDefault,
  },
  backBtn: {
    position: 'absolute',
    left: spacing['2xl'],
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  backBtnFallback: {
    position: 'relative',
    left: 0,
    top: 0,
    marginBottom: spacing['2xl'],
    backgroundColor: colors.surfaceSecondary,
    shadowOpacity: 0,
    elevation: 0,
  },

  // Content
  content: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['4xl'],
  },

  // Badges
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  badgeGreen: { backgroundColor: colors.successGreenLight },
  badgeGreenText: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.xs,
    color: colors.successGreen,
    includeFontPadding: false,
    textTransform: 'capitalize',
  },
  badgeRed: { backgroundColor: colors.accentLight },
  badgeRedText: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.xs,
    color: colors.accentPrimary,
    includeFontPadding: false,
  },

  // Title + meta
  title: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['2xl'],
    color: colors.textPrimary,
    letterSpacing: letterSpacings.bodyBold,
    includeFontPadding: false,
  },
  meta: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['14'],
    color: colors.textMuted,
    marginTop: 4,
    includeFontPadding: false,
  },

  // Progress
  progressSection: {
    marginTop: spacing['2xl'],
    marginBottom: spacing.xl,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  claimedLabel: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    letterSpacing: 0.88,
    includeFontPadding: false,
  },
  claimedCount: {
    includeFontPadding: false,
  },
  claimedNum: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.xl,
    color: colors.textPrimary,
  },
  claimedTotal: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.xl,
    color: colors.textMuted,
  },
  progressTrack: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.borderDefault,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.accentPrimary,
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  progressSub: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    color: colors.textMuted,
    includeFontPadding: false,
  },

  // Repeats daily card
  repeatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.accentLight,
    borderRadius: radius.input,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  repeatCardBody: { flex: 1 },
  repeatCardTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['14'],
    color: colors.textPrimary,
    includeFontPadding: false,
  },
  repeatCardSub: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    color: colors.textMuted,
    marginTop: 2,
    includeFontPadding: false,
  },
  editLink: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.sm,
    color: colors.accentPrimary,
    includeFontPadding: false,
  },

  // Section headings
  sectionTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['16'],
    color: colors.textPrimary,
    marginBottom: spacing.md,
    includeFontPadding: false,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing['2xl'],
    marginBottom: spacing.md,
  },
  sectionCount: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    includeFontPadding: false,
  },

  // Description
  descriptionText: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['14'],
    color: colors.textMuted,
    lineHeight: 22,
    includeFontPadding: false,
  },

  // Claim rows
  claimRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
    gap: spacing.md,
  },
  claimInfo: { flex: 1 },
  claimName: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['14'],
    color: colors.textPrimary,
    includeFontPadding: false,
  },
  claimTime: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    color: colors.textMuted,
    marginTop: 2,
    includeFontPadding: false,
  },
  noClaimsText: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    paddingVertical: spacing.md,
    includeFontPadding: false,
  },

  // Avatar
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarGreen: { backgroundColor: colors.successGreenLight },
  avatarGray:  { backgroundColor: colors.surfaceSecondary },
  avatarPink:  { backgroundColor: colors.avatarBg },
  avatarInitials: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    includeFontPadding: false,
  },

  // Collected badge
  collectedBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    backgroundColor: colors.successGreenLight,
    borderRadius: radius.pill,
  },
  collectedBadgeText: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.xs,
    color: colors.successGreen,
    includeFontPadding: false,
  },

  // Mark collected button
  markBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    backgroundColor: colors.accentPrimary,
    borderRadius: radius.pill,
  },
  markBtnText: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.xs,
    color: colors.textInverse,
    includeFontPadding: false,
  },

  // Donation source
  donationSourceTitle: { marginTop: spacing['2xl'] },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  sourceBody: { flex: 1 },
  sourceName: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['14'],
    color: colors.textPrimary,
    includeFontPadding: false,
  },
  sourceNote: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    color: colors.textMuted,
    marginTop: 2,
    includeFontPadding: false,
  },

  // Show QR button
  qrBtn: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.accentPrimary,
    borderRadius: radius.card,
    marginTop: spacing['3xl'],
  },
  qrBtnText: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['14'],
    color: colors.textInverse,
    letterSpacing: letterSpacings.button,
    includeFontPadding: false,
  },

  // Action row (Edit + Pause)
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing['3xl'],
  },
  outlineBtn: {
    flex: 1,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.input,
    backgroundColor: colors.surface,
  },
  outlineBtnText: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['14'],
    color: colors.textPrimary,
    includeFontPadding: false,
  },

  // Delete button
  deleteBtn: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.input,
    marginTop: spacing.md,
  },
  deleteBtnText: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['14'],
    color: colors.dangerRed,
    includeFontPadding: false,
  },

  // Footer hint
  footerHint: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    color: colors.textMuted,
    lineHeight: 18,
    marginTop: spacing['2xl'],
    includeFontPadding: false,
  },
  footerHintBold: {
    fontFamily: fontFamilies.bold,
    color: colors.textPrimary,
  },
});
