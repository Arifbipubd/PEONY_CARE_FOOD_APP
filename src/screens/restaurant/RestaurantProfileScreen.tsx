import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import SkeletonBox, { usePulse } from '../../components/SkeletonBox';
import { getRestaurantProfile } from '../../services/restaurant';
import { RestaurantProfile } from '../../types';
import { logout } from '../../services/auth';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import {
  colors, spacing, radius, fontSizes, fontFamilies, letterSpacings,
} from '../../constants/theme';
import { ProfileStackParamList } from '../../navigation/RestaurantTabs';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'RestaurantProfile'>;
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = memo(({ value, label, valueColor }: {
  value: string;
  label: string;
  valueColor: string;
}) => (
  <View style={styles.statCard}>
    <Text style={[styles.statNum, { color: valueColor }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
));

// ─── Profile Row ──────────────────────────────────────────────────────────────

type RowProps = {
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  danger?: boolean;
};

const ProfileRow = memo(({
  iconName, iconColor, iconBg, title, subtitle, onPress, danger = false,
}: RowProps) => (
  <TouchableOpacity
    style={styles.row}
    onPress={onPress}
    activeOpacity={0.7}
    disabled={!onPress}
  >
    <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>
      <Ionicons name={iconName} size={18} color={iconColor} />
    </View>
    <View style={styles.rowText}>
      <Text style={[styles.rowTitle, danger && styles.rowTitleDanger]}>{title}</Text>
      {subtitle ? <Text style={styles.rowSub}>{subtitle}</Text> : null}
    </View>
    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
  </TouchableOpacity>
));

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ProfileSkeleton() {
  const opacity = usePulse();
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={skelStyles.header}>
        <SkeletonBox opacity={opacity} width={22} height={22} borderRadius={radius.pill} />
        <SkeletonBox opacity={opacity} width={36} height={36} borderRadius={radius.pill} />
      </View>
      <ScrollView scrollEnabled={false} showsVerticalScrollIndicator={false}>
        <View style={skelStyles.avatarSection}>
          <SkeletonBox opacity={opacity} width={88} height={88} borderRadius={radius.pill} />
          <SkeletonBox opacity={opacity} width={200} height={26} style={skelStyles.name} />
          <SkeletonBox opacity={opacity} width={130} height={16} style={skelStyles.phone} />
          <SkeletonBox opacity={opacity} width={180} height={14} style={skelStyles.address} />
        </View>
        <View style={skelStyles.statsRow}>
          {[0, 1, 2].map((i) => (
            <SkeletonBox key={i} opacity={opacity} width={100} height={75} borderRadius={radius.card} />
          ))}
        </View>
        <View style={skelStyles.section}>
          <SkeletonBox opacity={opacity} width={80} height={18} />
          {[0, 1, 2, 3, 4].map((i) => (
            <View key={i} style={skelStyles.rowItem}>
              <SkeletonBox opacity={opacity} width={36} height={36} borderRadius={radius.pill} />
              <SkeletonBox opacity={opacity} width={150} height={15} />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function RestaurantProfileScreen({ navigation }: Props) {
  const [profile, setProfile] = useState<RestaurantProfile | null>(null);
  const [loading, setLoading]     = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const { refreshToken, clearAuth } = useAuthStore();
  const { unreadCount }             = useNotificationStore();

  useEffect(() => {
    getRestaurantProfile()
      .then(setProfile)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const initials = useMemo(
    () => (profile ? getInitials(profile.name) : ''),
    [profile],
  );

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    try {
      if (refreshToken) await logout(refreshToken);
    } finally {
      clearAuth();
    }
  }, [refreshToken, clearAuth]);

  const navToAlerts = useCallback(() => {
    navigation.getParent()?.navigate('Alerts' as never);
  }, [navigation]);

  const navToClaims = useCallback(() => {
    (navigation.getParent() as any)?.navigate('Donations', { screen: 'TodaysClaims' });
  }, [navigation]);

  if (loading) return <ProfileSkeleton />;

  const p = profile;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.getParent()?.navigate('Home' as never)}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bellBtn} onPress={navToAlerts} hitSlop={8}>
          <Ionicons name="notifications" size={20} color={colors.textPrimary} />
          {unreadCount > 0 && <View style={styles.bellDot} />}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Avatar section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.restaurantName}>{p?.name ?? ''}</Text>
          <View style={styles.phoneRow}>
            <Text style={styles.phoneFlag}>🇸🇬</Text>
            <Text style={styles.phoneText}>{p?.contactPhone ?? ''}</Text>
          </View>
          <Text style={styles.addressText}>{p?.address ?? ''}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard
            value={String(p?.peopleFed ?? 0)}
            label="PEOPLE FED"
            valueColor={colors.accentPrimary}
          />
          <StatCard
            value={`${p?.claimRatePct ?? 0}%`}
            label="CLAIM RATE"
            valueColor={colors.textPrimary}
          />
          <StatCard
            value={String(p?.rating ?? 0)}
            label="RATING"
            valueColor={colors.goldDark}
          />
        </View>

        {/* Business section */}
        <Text style={styles.sectionTitle}>Business</Text>
        <View>
          <ProfileRow
            iconName="storefront"
            iconColor={colors.accentPrimary}
            iconBg={colors.avatarBg}
            title="Restaurant details"
            subtitle="Name, address, hours"
          />
          <View style={styles.divider} />
          <ProfileRow
            iconName="images"
            iconColor={colors.accentPrimary}
            iconBg={colors.avatarBg}
            title="Menu photos"
            subtitle="Shown to donors"
          />
          <View style={styles.divider} />
          <ProfileRow
            iconName="globe"
            iconColor={colors.goldDark}
            iconBg={colors.goldLight}
            title="Public page"
            subtitle="View as customers see you"
          />
          <View style={styles.divider} />
          <ProfileRow
            iconName="receipt"
            iconColor={colors.goldDark}
            iconBg={colors.goldLight}
            title="Claims"
            subtitle="Pending pickups & history"
            onPress={navToClaims}
          />
          <View style={styles.divider} />
          <ProfileRow
            iconName="bar-chart"
            iconColor={colors.textPrimary}
            iconBg={colors.surfaceSecondary}
            title="Analytics"
          />
        </View>

        {/* Account section */}
        <Text style={[styles.sectionTitle, styles.sectionTitleAccount]}>Account</Text>
        <View>
          <ProfileRow
            iconName="notifications"
            iconColor={colors.textPrimary}
            iconBg={colors.surfaceSecondary}
            title="Notifications"
            onPress={navToAlerts}
          />
          <View style={styles.divider} />
          <ProfileRow
            iconName="help-circle"
            iconColor={colors.textPrimary}
            iconBg={colors.surfaceSecondary}
            title="Help & FAQ"
          />
          <View style={styles.divider} />
          <ProfileRow
            iconName="download"
            iconColor={colors.textPrimary}
            iconBg={colors.surfaceSecondary}
            title="Download my data"
            subtitle="Get a copy of your business data"
          />
          <View style={styles.divider} />
          <ProfileRow
            iconName="trash"
            iconColor={colors.dangerRed}
            iconBg={colors.accentLight}
            title="Delete account"
            subtitle="Permanently remove your restaurant"
            danger
          />
        </View>

        {/* Rating chip */}
        <View style={styles.ratingWrap}>
          <View style={styles.ratingChip}>
            <Ionicons name="star" size={12} color={colors.accentPrimary} />
            <Text style={styles.ratingText}>
              {p?.rating ?? 0} · {p?.reviewCount ?? 0} reviews
            </Text>
          </View>
        </View>

        {/* Log out */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.85}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <ActivityIndicator color={colors.dangerRed} />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={18} color={colors.dangerRed} />
              <Text style={styles.logoutText}>Log out</Text>
            </>
          )}
        </TouchableOpacity>

      </ScrollView>
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
  bellBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.accentPrimary,
  },

  scroll: { paddingBottom: spacing['4xl'] },

  // ── Avatar ──────────────────────────────────────────────────────────────────
  avatarSection: {
    alignItems: 'center',
    paddingTop: spacing['2xl'],
    paddingHorizontal: spacing['2xl'],
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: radius.pill,
    backgroundColor: colors.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['2xl'],
    color: colors.accentPrimary,
  },
  restaurantName: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['2xl'],
    color: colors.textPrimary,
    letterSpacing: letterSpacings.subheading,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 4,
  },
  phoneFlag: { fontSize: fontSizes['14'] },
  phoneText: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['14'],
    color: colors.textMuted,
  },
  addressText: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['14'],
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },

  // ── Stats ───────────────────────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginHorizontal: spacing['2xl'],
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
    color: colors.textMuted,
    letterSpacing: 0.88,
    textTransform: 'uppercase',
    marginTop: 4,
    textAlign: 'center',
  },

  // ── Section ─────────────────────────────────────────────────────────────────
  sectionTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.lg,
    color: colors.textPrimary,
    letterSpacing: -0.425,
    marginHorizontal: spacing['2xl'],
    marginTop: spacing['3xl'],
    marginBottom: spacing.lg,
  },
  sectionTitleAccount: { marginTop: spacing['4xl'] },

  // ── Rows ────────────────────────────────────────────────────────────────────
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: 14,
    gap: spacing.md,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, gap: 2 },
  rowTitle: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['14'],
    color: colors.textPrimary,
    letterSpacing: -0.21,
  },
  rowTitleDanger: { color: colors.dangerRed },
  rowSub: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    color: colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderDefault,
    marginLeft: spacing['2xl'] + 36 + spacing.md,
  },

  // ── Rating chip ─────────────────────────────────────────────────────────────
  ratingWrap: { alignItems: 'center', marginTop: 14 },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.avatarBg,
    borderRadius: radius.pill,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  ratingText: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['12'],
    color: colors.accentPrimary,
  },

  // ── Log out ─────────────────────────────────────────────────────────────────
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: radius.card,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginTop: spacing.lg,
  },
  logoutText: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['16'],
    color: colors.dangerRed,
  },
});

const skelStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
  },
  avatarSection: {
    alignItems: 'center',
    paddingTop: spacing['2xl'],
    gap: spacing.sm,
  },
  name:    { marginTop: spacing.md },
  phone:   { marginTop: 4 },
  address: { marginTop: 2 },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginHorizontal: spacing['2xl'],
    marginTop: spacing['2xl'],
  },
  section: {
    marginTop: spacing['3xl'],
    paddingHorizontal: spacing['2xl'],
    gap: spacing['2xl'],
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
});
