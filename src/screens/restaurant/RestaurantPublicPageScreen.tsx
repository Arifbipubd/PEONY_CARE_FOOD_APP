import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import SkeletonBox, { usePulse } from '../../components/SkeletonBox';
import { getRestaurantProfile, getDonations } from '../../services/restaurant';
import { RestaurantProfile, RestaurantDonation } from '../../types';
import {
  colors, spacing, radius, fontSizes, fontFamilies, letterSpacings, layout,
} from '../../constants/theme';
import { ProfileStackParamList } from '../../navigation/RestaurantTabs';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'RestaurantPublicPage'>;
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PublicPageSkeleton() {
  const opacity = usePulse();
  return (
    <View style={styles.screen}>
      <SkeletonBox opacity={opacity} height={layout.foodImageHeight} borderRadius={0} />
      <View style={skelStyles.content}>
        <SkeletonBox opacity={opacity} width={140} height={28} borderRadius={radius.pill} style={skelStyles.mt14} />
        <SkeletonBox opacity={opacity} width={240} height={32} style={skelStyles.mt8} />
        <SkeletonBox opacity={opacity} width={160} height={18} style={skelStyles.mt4} />
        <View style={skelStyles.statsRow}>
          <SkeletonBox opacity={opacity} width={100} height={75} borderRadius={radius.card} />
          <SkeletonBox opacity={opacity} width={100} height={75} borderRadius={radius.card} />
          <SkeletonBox opacity={opacity} width={100} height={75} borderRadius={radius.card} />
        </View>
        <SkeletonBox opacity={opacity} width={60} height={22} style={skelStyles.mt28} />
        <SkeletonBox opacity={opacity} height={63} style={skelStyles.mt4} />
        {[0, 1, 2].map((i) => (
          <View key={i} style={skelStyles.infoRow}>
            <SkeletonBox opacity={opacity} width={36} height={36} borderRadius={radius.pill} />
            <View style={skelStyles.infoTextCol}>
              <SkeletonBox opacity={opacity} width={150} height={15} />
              <SkeletonBox opacity={opacity} width={100} height={12} style={skelStyles.mt4} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const skelStyles = StyleSheet.create({
  content: { paddingHorizontal: spacing['2xl'] },
  mt4:  { marginTop: 4 },
  mt8:  { marginTop: 8 },
  mt14: { marginTop: 14 },
  mt28: { marginTop: spacing['3xl'] },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing['2xl'],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 14,
  },
  infoTextCol: { gap: 4 },
});

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = memo(function StatCard({
  value, label, valueColor,
}: { value: string; label: string; valueColor: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statNum, { color: valueColor }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
});

// ─── Info Row ─────────────────────────────────────────────────────────────────

type InfoRowProps = {
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  iconBg: string;
  iconColor: string;
  title: string;
  sub: string;
  onPress?: () => void;
};

const InfoRow = memo(function InfoRow({
  iconName, iconBg, iconColor, title, sub, onPress,
}: InfoRowProps) {
  return (
    <TouchableOpacity
      style={styles.infoRow}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={[styles.infoIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={iconName} size={18} color={iconColor} />
      </View>
      <View style={styles.infoTextCol}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoSub}>{sub}</Text>
      </View>
      {onPress ? <Ionicons name="chevron-forward" size={16} color={colors.textMuted} /> : null}
    </TouchableOpacity>
  );
});

// ─── Food Item Row ────────────────────────────────────────────────────────────

const FoodRow = memo(function FoodRow({
  item, isLast,
}: { item: RestaurantDonation; isLast: boolean }) {
  const isSponsored = !!item.sponsorDisplayName;

  const initials = useMemo(() => {
    if (!item.sponsorDisplayName) return '';
    return item.sponsorDisplayName
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('');
  }, [item.sponsorDisplayName]);

  const subText = isSponsored
    ? `${item.quantityAvailable} ${item.unit} · by ${item.sponsorDisplayName}`
    : `${item.quantityAvailable} ${item.unit} · pickup ${item.pickupWindow}`;

  return (
    <>
      <View style={styles.foodRow}>
        {isSponsored ? (
          <View style={styles.sponsorAvatar}>
            <Text style={styles.sponsorInitials}>{initials}</Text>
          </View>
        ) : (
          <Image
            source={{ uri: item.photoUrl || undefined }}
            style={styles.foodThumb}
            resizeMode="cover"
          />
        )}
        <View style={styles.foodInfo}>
          <Text style={styles.foodName} numberOfLines={1}>
            {item.name}{isSponsored ? ' · Sponsored' : ''}
          </Text>
          <Text style={styles.foodSub} numberOfLines={1}>{subText}</Text>
        </View>
        <Text style={styles.foodLeft}>{item.quantityAvailable} left</Text>
      </View>
      {!isLast ? <View style={styles.divider} /> : null}
    </>
  );
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function RestaurantPublicPageScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const [profile, setProfile]     = useState<RestaurantProfile | null>(null);
  const [donations, setDonations] = useState<RestaurantDonation[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([getRestaurantProfile(), getDonations()])
      .then(([p, d]) => { setProfile(p); setDonations(d.active); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCall = useCallback(() => {
    if (!profile?.contactPhone) return;
    Linking.openURL(`tel:${profile.contactPhone.replace(/\s/g, '')}`);
  }, [profile?.contactPhone]);

  if (loading) return <PublicPageSkeleton />;
  if (!profile) return null;

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Hero image + back button */}
        <View>
          {profile.photoUrl ? (
            <Image
              source={{ uri: profile.photoUrl }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.heroImage, styles.heroPlaceholder]} />
          )}
          <TouchableOpacity
            style={[styles.backBtn, { top: insets.top + 16 }]}
            onPress={() => navigation.goBack()}
            hitSlop={8}
          >
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>

          {/* Verified partner badge */}
          {profile.isVerified ? (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color={colors.accentPrimary} />
              <Text style={styles.verifiedText}>Verified partner</Text>
            </View>
          ) : null}

          {/* Restaurant name */}
          <Text style={styles.name}>{profile.name}</Text>

          {/* Rating sub text */}
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color={colors.warningYellow} />
            <Text style={styles.ratingText}>
              {profile.rating} · {profile.reviewCount} reviews
            </Text>
          </View>

          {/* Stat cards */}
          <View style={styles.statsRow}>
            <StatCard
              value={String(profile.peopleFed)}
              label="FED"
              valueColor={colors.accentPrimary}
            />
            <StatCard
              value={String(profile.totalFoodShared)}
              label="DONATIONS"
              valueColor={colors.textPrimary}
            />
            <StatCard
              value={`${profile.claimRatePct}%`}
              label="CLAIM RATE"
              valueColor={colors.goldDark}
            />
          </View>

          {/* About */}
          <Text style={[styles.sectionTitle, styles.sectionGap]}>About</Text>
          <Text style={styles.aboutBody}>{profile.about || 'No description added yet.'}</Text>

          {/* Location */}
          <InfoRow
            iconName="location"
            iconBg={colors.avatarBg}
            iconColor={colors.accentPrimary}
            title={profile.address}
            sub={`Singapore ${profile.postalCode}`}
          />
          <View style={styles.divider} />

          {/* Opening hours */}
          <InfoRow
            iconName="time"
            iconBg={colors.surfaceSecondary}
            iconColor={colors.textPrimary}
            title={profile.openingHours || 'Not set'}
            sub="Open daily"
          />
          <View style={styles.divider} />

          {/* Phone */}
          <InfoRow
            iconName="call"
            iconBg={colors.surfaceSecondary}
            iconColor={colors.textPrimary}
            title={profile.contactPhone}
            sub="Tap to call"
            onPress={handleCall}
          />

          {/* Available now */}
          <View style={[styles.availableHeader, styles.sectionGap]}>
            <Text style={styles.sectionTitle}>Available now</Text>
            <Text style={styles.itemCount}>{donations.length} items</Text>
          </View>

          {donations.length === 0 ? (
            <Text style={styles.emptyText}>No active listings right now.</Text>
          ) : (
            donations.map((item, i) => (
              <FoodRow
                key={item.id}
                item={item}
                isLast={i === donations.length - 1}
              />
            ))
          )}

        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },

  // ── Hero ────────────────────────────────────────────────────────────────────
  heroImage: {
    width: '100%',
    height: layout.foodImageHeight,
  },
  heroPlaceholder: { backgroundColor: colors.borderDefault },
  backBtn: {
    position: 'absolute',
    left: 16,
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  // ── Content ─────────────────────────────────────────────────────────────────
  content: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['4xl'],
  },

  // ── Verified badge ──────────────────────────────────────────────────────────
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    backgroundColor: colors.avatarBg,
    borderRadius: radius.pill,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginTop: 14,
  },
  verifiedText: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['12'],
    color: colors.accentPrimary,
  },

  // ── Name & rating ────────────────────────────────────────────────────────────
  name: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['2xl'],
    letterSpacing: letterSpacings.subheading,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ratingText: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['14'],
    color: colors.textMuted,
  },

  // ── Stats ───────────────────────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing['2xl'],
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.card,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  statNum: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['2xl'],
    lineHeight: 26.4,
    letterSpacing: -0.84,
  },
  statLabel: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.xs,
    letterSpacing: 0.88,
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginTop: 4,
    textAlign: 'center',
  },

  // ── Section ─────────────────────────────────────────────────────────────────
  sectionGap: { marginTop: spacing['3xl'] },
  sectionTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.lg,
    letterSpacing: -0.425,
    color: colors.textPrimary,
  },

  // ── About ───────────────────────────────────────────────────────────────────
  aboutBody: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['14'],
    lineHeight: 21,
    color: colors.textMuted,
    marginTop: 4,
    paddingBottom: spacing.lg,
  },

  // ── Info rows ───────────────────────────────────────────────────────────────
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: spacing.md,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  infoTextCol: { flex: 1 },
  infoTitle: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['14'],
    letterSpacing: -0.21,
    color: colors.textPrimary,
  },
  infoSub: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    color: colors.textMuted,
    marginTop: 2,
  },

  // ── Divider ─────────────────────────────────────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: colors.borderDefault,
  },

  // ── Available now header ─────────────────────────────────────────────────────
  availableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemCount: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['14'],
    color: colors.textMuted,
  },
  emptyText: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginTop: spacing.md,
  },

  // ── Food rows ────────────────────────────────────────────────────────────────
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 14,
  },
  foodThumb: {
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    backgroundColor: colors.borderDefault,
    flexShrink: 0,
  },
  sponsorAvatar: {
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    backgroundColor: colors.goldMid,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sponsorInitials: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['16'],
    color: colors.textInverse,
  },
  foodInfo: { flex: 1 },
  foodName: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['14'],
    letterSpacing: -0.21,
    color: colors.textPrimary,
  },
  foodSub: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    color: colors.textMuted,
    marginTop: 2,
  },
  foodLeft: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['14'],
    color: colors.accentPrimary,
    flexShrink: 0,
  },
});
