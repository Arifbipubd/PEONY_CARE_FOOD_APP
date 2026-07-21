import { useState, useCallback, memo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import SkeletonBox, { usePulse } from '../../components/SkeletonBox';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../../store/authStore';
import { useProfileStore } from '../../store/profileStore';
import { useNotificationStore } from '../../store/notificationStore';
import { logout } from '../../services/auth';
import { getReceiverProfile } from '../../services/receiver';
import { ReceiverProfile } from '../../types';
import {
  colors, spacing, radius, fontSizes, fontFamilies, letterSpacings, lineHeights,
} from '../../constants/theme';
import { ProfileStackParamList } from '../../navigation/ReceiverTabs';
import SgFlag from '../../components/SgFlag';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'ReceiverProfile'>;
};

function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatSGPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('65') && digits.length === 10) {
    return `+65 ${digits.slice(2, 6)} ${digits.slice(6)}`;
  }
  return phone;
}

type MenuRow = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconBg: string;
  iconColor: string;
  label: string;
  labelColor?: string;
  subtitle?: string;
  onPress: () => void;
};

function ProfileSkeleton() {
  const opacity = usePulse();
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={pSkelStyles.header}>
        <SkeletonBox opacity={opacity} width={22} height={22} borderRadius={100} />
        <SkeletonBox opacity={opacity} width={40} height={40} borderRadius={100} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={pSkelStyles.scroll} scrollEnabled={false}>
        <SkeletonBox opacity={opacity} width={96} height={96} borderRadius={100} style={pSkelStyles.avatar} />
        <SkeletonBox opacity={opacity} width={140} height={22} style={pSkelStyles.name} />
        <SkeletonBox opacity={opacity} width={110} height={16} style={pSkelStyles.phone} />
        <View style={pSkelStyles.statsRow}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={pSkelStyles.statBox}>
              <SkeletonBox opacity={opacity} width={48} height={28} />
              <SkeletonBox opacity={opacity} width={56} height={11} style={pSkelStyles.statLabel} />
            </View>
          ))}
        </View>
        <SkeletonBox opacity={opacity} width={70} height={18} style={pSkelStyles.sectionLabel} />
        <View style={pSkelStyles.menuCard}>
          {[0, 1].map((i) => (
            <View key={i} style={[pSkelStyles.menuRow, i === 0 && pSkelStyles.menuRowBorder]}>
              <SkeletonBox opacity={opacity} width={36} height={36} borderRadius={100} />
              <View style={pSkelStyles.menuText}>
                <SkeletonBox opacity={opacity} width={130} height={14} />
                <SkeletonBox opacity={opacity} width={90} height={12} style={pSkelStyles.menuSub} />
              </View>
            </View>
          ))}
        </View>
        <SkeletonBox opacity={opacity} width={70} height={18} style={pSkelStyles.sectionLabel} />
        <View style={pSkelStyles.menuCard}>
          {[0, 1].map((i) => (
            <View key={i} style={[pSkelStyles.menuRow, i === 0 && pSkelStyles.menuRowBorder]}>
              <SkeletonBox opacity={opacity} width={36} height={36} borderRadius={100} />
              <SkeletonBox opacity={opacity} width={120} height={14} style={pSkelStyles.menuText} />
            </View>
          ))}
        </View>
        <SkeletonBox opacity={opacity} width={160} height={32} borderRadius={100} style={pSkelStyles.pill} />
        <SkeletonBox opacity={opacity} height={52} borderRadius={18} style={pSkelStyles.logout} />
      </ScrollView>
    </SafeAreaView>
  );
}

const pSkelStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing['4xl'],
    alignItems: 'center',
  },
  avatar:      { marginBottom: spacing.lg },
  name:        { marginBottom: spacing.sm },
  phone:       { marginBottom: spacing['2xl'] },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
    marginBottom: spacing['2xl'],
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.card,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 6,
  },
  statLabel:     { marginTop: 2 },
  sectionLabel:  { alignSelf: 'flex-start', marginBottom: spacing.md },
  menuCard: {
    width: '100%',
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.card,
    overflow: 'hidden',
    marginBottom: spacing['2xl'],
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: spacing.lg,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  menuText:  { flex: 1 },
  menuSub:   { marginTop: 4 },
  pill:      { marginTop: 14 },
  logout:    { width: '100%', marginTop: spacing['2xl'] },
});

export default function ReceiverProfileScreen({ navigation }: Props) {
  const { refreshToken, clearAuth, user } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const [profile, setProfile] = useState<ReceiverProfile | null>(null);
  const [loading, setLoading]   = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const { displayName: storedName, setProfile: storeSetProfile } = useProfileStore();

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      getReceiverProfile()
        .then((p) => {
          setProfile(p);
          storeSetProfile({ photoUrl: p.photoUrl, displayName: p.displayName });
        })
        .catch((e) => { console.log('[ReceiverProfile] error', e); })
        .finally(() => setLoading(false));
    }, [storeSetProfile]),
  );

  async function handleLogout() {
    setLoggingOut(true);
    try {
      if (refreshToken) await logout(refreshToken);
    } finally {
      clearAuth();
    }
  }

  if (loading) {
    return <ProfileSkeleton />;
  }

  const effectiveProfile: ReceiverProfile = profile ?? {
    id: user?.id ?? '',
    displayName: storedName || 'Receiver',
    phone: user?.phone ?? '',
    photoUrl: null,
    browseRadiusKm: 5,
    memberSince: '',
    daysActive: 0,
    totalClaims: 0,
    lastClaimDate: null,
    lifetimeMeals: 0,
    restaurantsCount: 0,
  };

  const accountRows: MenuRow[] = [
    {
      icon: 'location',
      iconBg: colors.avatarBg,
      iconColor: colors.accentPrimary,
      label: 'Location settings',
      subtitle: '5 km radius · Joo Chiat',
      onPress: () => navigation.navigate('LocationSettings'),
    },
    {
      icon: 'notifications',
      iconBg: colors.goldLight,
      iconColor: colors.goldDark,
      label: 'Notifications',
      subtitle: '3 channels enabled',
      onPress: () => navigation.navigate('NotificationSettings'),
    },
    {
      icon: 'download-outline',
      iconBg: colors.surfaceSecondary,
      iconColor: colors.textPrimary,
      label: 'Download my data',
      subtitle: 'Get a copy of your data',
      onPress: () => navigation.navigate('ExportData'),
    },
    {
      icon: 'trash-outline',
      iconBg: colors.accentLight,
      iconColor: colors.textPrimary,
      label: 'Delete account',
      labelColor: colors.dangerRed,
      subtitle: 'Permanently remove your data',
      onPress: () => navigation.navigate('DeleteAccount'),
    },
  ];

  const supportRows: MenuRow[] = [
    {
      icon: 'help-circle',
      iconBg: colors.surfaceSecondary,
      iconColor: colors.textMuted,
      label: 'Help & FAQ',
      onPress: () => navigation.navigate('HelpFaq'),
    },
    {
      icon: 'document-text',
      iconBg: colors.surfaceSecondary,
      iconColor: colors.textMuted,
      label: 'Terms & Privacy',
      onPress: () => navigation.navigate('TermsPrivacy'),
    },
  ];

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.getParent()?.navigate('Home')}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.notifBtn}
          onPress={() => navigation.getParent()?.navigate('Alerts')}
          hitSlop={8}
        >
          <Ionicons name="notifications" size={20} color={colors.textPrimary} />
          {unreadCount > 0 && <View style={styles.notifDot} />}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Avatar */}
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarCircle}>
            {effectiveProfile.photoUrl ? (
              <Image source={{ uri: effectiveProfile.photoUrl }} style={styles.avatarImage} resizeMode="cover" />
            ) : (
              <Text style={styles.avatarText}>{initials(effectiveProfile.displayName)}</Text>
            )}
          </View>
          <TouchableOpacity style={styles.cameraBtn} onPress={() => navigation.navigate('EditProfile')} activeOpacity={0.8}>
            <Ionicons name="camera" size={15} color={colors.textInverse} />
          </TouchableOpacity>
        </View>

        {/* Name */}
        <Text style={styles.name}>{effectiveProfile.displayName}</Text>

        {/* Phone row */}
        <View style={styles.phoneRow}>
          <SgFlag size={16} />
          <Text style={styles.phone}>{formatSGPhone(effectiveProfile.phone)}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: colors.accentPrimary }]}>
              {effectiveProfile.lifetimeMeals}
            </Text>
            <Text style={styles.statLabel}>MEALS</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: colors.goldDark }]}>
              {effectiveProfile.restaurantsCount}
            </Text>
            <Text style={styles.statLabel}>RESTAURANTS</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: colors.textPrimary }]}>
              {effectiveProfile.daysActive}
            </Text>
            <Text style={styles.statLabel}>DAYS</Text>
          </View>
        </View>

        {/* Account section */}
        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.menuCard}>
          {accountRows.map((row, i) => (
            <MenuRowItem
              key={row.label}
              row={row}
              isLast={i === accountRows.length - 1}
            />
          ))}
        </View>

        {/* Support section */}
        <Text style={styles.sectionLabel}>Support</Text>
        <View style={styles.menuCard}>
          {supportRows.map((row, i) => (
            <MenuRowItem
              key={row.label}
              row={row}
              isLast={i === supportRows.length - 1}
            />
          ))}
        </View>

        {/* Member since pill */}
        <View style={styles.memberPill}>
          <Ionicons name="calendar-outline" size={14} color={colors.accentPrimary} />
          <Text style={styles.memberText}>Member since {effectiveProfile.memberSince}</Text>
        </View>

        {/* Log out */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          disabled={loggingOut}
          activeOpacity={0.7}
        >
          {loggingOut ? (
            <ActivityIndicator color={colors.errorRed} />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={18} color={colors.errorRed} />
              <Text style={styles.logoutText}>Log out</Text>
            </>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const MenuRowItem = memo(function MenuRowItem({ row, isLast }: { row: MenuRow; isLast: boolean }) {
  return (
    <TouchableOpacity
      style={[styles.menuRow, isLast && styles.menuRowLast]}
      onPress={row.onPress}
      activeOpacity={0.6}
    >
      <View style={[styles.menuIcon, { backgroundColor: row.iconBg }]}>
        <Ionicons name={row.icon} size={18} color={row.iconColor} />
      </View>
      <View style={styles.menuText}>
        <Text style={[styles.menuLabel, row.labelColor ? { color: row.labelColor } : null]}>{row.label}</Text>
        {row.subtitle && (
          <Text style={styles.menuSubtitle}>{row.subtitle}</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
});

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

  scroll: {
    paddingHorizontal: 16,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing['4xl'],
    alignItems: 'center',
  },

  // ── Avatar ───────────────────────────────────────────────────────────────────
  avatarWrapper: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: radius.pill,
    backgroundColor: colors.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: radius.pill,
  },
  avatarText: {
    fontSize: fontSizes.xl,
    fontFamily: fontFamilies.bold,
    letterSpacing: 0.4,
    color: colors.accentPrimary,
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.accentPrimary,
    borderWidth: 3,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Name / phone ─────────────────────────────────────────────────────────────
  name: {
    fontSize: fontSizes['2xl'],
    fontFamily: fontFamilies.bold,
    letterSpacing: letterSpacings.subheading,
    color: colors.textPrimary,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    marginBottom: spacing['2xl'],
  },
  phone: {
    fontSize: fontSizes['14'],
    fontFamily: fontFamilies.regular,
    color: colors.textMuted,
  },

  // ── Stats ─────────────────────────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
    marginBottom: spacing['2xl'],
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.card,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: fontSizes['2xl'],
    fontFamily: fontFamilies.bold,
    lineHeight: lineHeights.subheading,
    letterSpacing: -0.84,
  },
  statLabel: {
    fontSize: fontSizes.xs,
    fontFamily: fontFamilies.semiBold,
    color: colors.textMuted,
    letterSpacing: 0.88,
    marginTop: 4,
  },

  // ── Section title ─────────────────────────────────────────────────────────────
  sectionLabel: {
    alignSelf: 'flex-start',
    fontSize: fontSizes.lg,
    fontFamily: fontFamilies.bold,
    letterSpacing: -0.425,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },

  // ── Menu card ─────────────────────────────────────────────────────────────────
  menuCard: {
    width: '100%',
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.card,
    overflow: 'hidden',
    marginBottom: spacing['2xl'],
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  menuRowLast: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  menuText: { flex: 1 },
  menuLabel: {
    fontSize: fontSizes['14'],
    fontFamily: fontFamilies.semiBold,
    letterSpacing: -0.21,
    color: colors.textPrimary,
  },
  menuSubtitle: {
    fontSize: fontSizes['12'],
    fontFamily: fontFamilies.regular,
    color: colors.textMuted,
    marginTop: 2,
  },

  // ── Member since pill ─────────────────────────────────────────────────────────
  memberPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.avatarBg,
    borderRadius: radius.pill,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginTop: 14,
  },
  memberText: {
    fontSize: fontSizes['12'],
    fontFamily: fontFamilies.semiBold,
    color: colors.accentPrimary,
  },

  // ── Logout ────────────────────────────────────────────────────────────────────
  logoutBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    marginTop: spacing['2xl'],
  },
  logoutText: {
    fontSize: fontSizes['16'],
    fontFamily: fontFamilies.semiBold,
    color: colors.errorRed,
  },
});
