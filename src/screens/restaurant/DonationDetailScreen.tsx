import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { DonationsStackParamList } from '../../navigation/RestaurantTabs';
import { getDonationDetail, deleteDonation } from '../../services/restaurant';
import { RestaurantDonation } from '../../types';
import CollectQrSheet     from '../../components/CollectQrSheet';
import CollectFailedSheet  from '../../components/CollectFailedSheet';
import CollectSuccessSheet from '../../components/CollectSuccessSheet';
import DeleteDonationSheet from '../../components/DeleteDonationSheet';
import {
  colors, spacing, radius, fontSizes, fontFamilies, letterSpacings,
} from '../../constants/theme';

type Props = {
  navigation: NativeStackNavigationProp<DonationsStackParamList, 'DonationDetail'>;
  route:      RouteProp<DonationsStackParamList, 'DonationDetail'>;
};

type CollectState = null | 'qr' | 'success' | 'failed';

export default function DonationDetailScreen({ navigation, route }: Props) {
  const { donationId } = route.params;

  const [donation, setDonation]       = useState<RestaurantDonation | null>(null);
  const [loading, setLoading]         = useState(true);
  const [collectState, setCollect]    = useState<CollectState>(null);
  const [deleteVisible, setDelete]    = useState(false);
  const [deleting, setDeleting]       = useState(false);

  useEffect(() => {
    getDonationDetail(donationId)
      .then(setDonation)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [donationId]);

  // ─── Collect flow ────────────────────────────────────────────────────────────

  const openQr         = useCallback(() => setCollect('qr'),  []);
  const closeAllSheets = useCallback(() => setCollect(null),   []);
  const showQrAgain    = useCallback(() => setCollect('qr'),   []);

  // ─── Delete flow ─────────────────────────────────────────────────────────────

  const openDelete  = useCallback(() => setDelete(true),  []);
  const closeDelete = useCallback(() => setDelete(false), []);

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

  // ─── Render ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView style={styles.centred} edges={['top']}>
        <ActivityIndicator color={colors.accentPrimary} />
      </SafeAreaView>
    );
  }

  if (!donation) {
    return (
      <SafeAreaView style={styles.centred} edges={['top']}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.errorText}>Donation not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{donation.name}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status row */}
        <View style={styles.statusRow}>
          <View style={[styles.badge, styles.badgeActive]}>
            <Text style={styles.badgeActiveText}>{donation.listStatus}</Text>
          </View>
          <View style={[styles.badge, styles.badgeStatus]}>
            <Text style={styles.badgeStatusText}>{donation.status.replace('_', ' ')}</Text>
          </View>
        </View>

        {/* Donation name */}
        <Text style={styles.donationName}>{donation.name}</Text>
        <Text style={styles.donationMeta}>
          {donation.category} · {donation.quantityOriginal} {donation.unit} · {donation.pickupWindow}
        </Text>

        {/* Claims summary */}
        <View style={styles.claimCard}>
          <Text style={styles.claimLabel}>CLAIMED</Text>
          <Text style={styles.claimCount}>
            {donation.claimsCount}
            <Text style={styles.claimTotal}>/{donation.quantityOriginal}</Text>
          </Text>
        </View>

        {/* Pending claims — each has "Mark collected" */}
        {(donation.claims ?? []).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Claims</Text>
            {(donation.claims ?? []).map((claim) => (
              <View key={claim.id} style={styles.claimRow}>
                <View style={styles.claimInfo}>
                  <Text style={styles.claimName}>{claim.receiverName}</Text>
                  <Text style={styles.claimTime}>{claim.claimedAt}</Text>
                </View>
                {claim.status === 'CLAIMED' ? (
                  <View style={styles.collectedBadge}>
                    <Text style={styles.collectedText}>Collected</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.markBtn}
                    activeOpacity={0.85}
                    onPress={openQr}
                  >
                    <Text style={styles.markBtnText}>Mark collected</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        {/* If no individual claims yet, show a generic Mark collected button */}
        {(donation.claims ?? []).length === 0 && donation.claimsCount > 0 && (
          <TouchableOpacity style={styles.collectBtn} activeOpacity={0.85} onPress={openQr}>
            <Ionicons name="qr-code" size={18} color={colors.textInverse} />
            <Text style={styles.collectBtnText}>Mark collected</Text>
          </TouchableOpacity>
        )}

        {/* Delete */}
        <TouchableOpacity style={styles.deleteRow} activeOpacity={0.7} onPress={openDelete}>
          <Ionicons name="trash-outline" size={16} color={colors.dangerRed} />
          <Text style={styles.deleteRowText}>Delete donation</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* ── Sheets ── */}
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

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  centred: {
    flex: 1,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['14'],
    color: colors.textMuted,
    marginTop: spacing.lg,
    includeFontPadding: false,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['16'],
    color: colors.textPrimary,
    includeFontPadding: false,
  },
  headerSpacer: {
    width: 40,
  },

  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['4xl'],
  },

  // Status
  statusRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.badge,
  },
  badgeActive: {
    backgroundColor: colors.successGreenLight,
  },
  badgeActiveText: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.xs,
    color: colors.successGreen,
    includeFontPadding: false,
  },
  badgeStatus: {
    backgroundColor: colors.accentLight,
  },
  badgeStatusText: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.xs,
    color: colors.accentPrimary,
    includeFontPadding: false,
  },

  // Name / meta
  donationName: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['2xl'],
    color: colors.textPrimary,
    letterSpacing: letterSpacings.bodyBold,
    includeFontPadding: false,
  },
  donationMeta: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['14'],
    color: colors.textMuted,
    marginTop: 4,
    includeFontPadding: false,
  },

  // Claim card
  claimCard: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.sm,
  },
  claimLabel: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    letterSpacing: 0.88,
    includeFontPadding: false,
  },
  claimCount: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['2xl'],
    color: colors.textPrimary,
    marginTop: 4,
    includeFontPadding: false,
  },
  claimTotal: {
    fontFamily: fontFamilies.regular,
    color: colors.textMuted,
  },

  // Section
  section: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['16'],
    color: colors.textPrimary,
    marginBottom: spacing.md,
    includeFontPadding: false,
  },

  // Claim rows
  claimRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  claimInfo: { flex: 1, marginRight: spacing.md },
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
  collectedBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    backgroundColor: colors.successGreenLight,
    borderRadius: radius.badge,
  },
  collectedText: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.xs,
    color: colors.successGreen,
    includeFontPadding: false,
  },
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

  // Generic collect button (when no individual claims loaded)
  collectBtn: {
    height: 52,
    backgroundColor: colors.accentPrimary,
    borderRadius: radius.card,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.xl,
  },
  collectBtnText: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['14'],
    color: colors.textInverse,
    includeFontPadding: false,
  },

  // Delete row
  deleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing['3xl'],
    paddingVertical: spacing.md,
  },
  deleteRowText: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['14'],
    color: colors.dangerRed,
    includeFontPadding: false,
  },
});
