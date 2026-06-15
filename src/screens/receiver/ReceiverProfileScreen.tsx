import { useState, useEffect } from 'react';
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
import { useAuthStore } from '../../store/authStore';
import { logout } from '../../services/auth';
import { getReceiverProfile } from '../../services/receiver';
import { ReceiverProfile } from '../../types';
import { colors, spacing, radius, fontSizes, fontWeights } from '../../constants/theme';
import { ProfileStackParamList } from '../../navigation/ReceiverTabs';

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

type MenuRow = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconBg: string;
  iconColor: string;
  label: string;
  subtitle?: string;
  onPress: () => void;
};

export default function ReceiverProfileScreen({ navigation }: Props) {
  const { refreshToken, clearAuth } = useAuthStore();
  const [profile, setProfile] = useState<ReceiverProfile | null>(null);
  const [loading, setLoading]   = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    getReceiverProfile().then((p) => {
      setProfile(p);
      setLoading(false);
    });
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      if (refreshToken) await logout(refreshToken);
    } finally {
      clearAuth();
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <ActivityIndicator style={styles.loader} color={colors.accentPrimary} />
      </SafeAreaView>
    );
  }

  if (!profile) return null;

  const accountRows: MenuRow[] = [
    {
      icon: 'location-outline',
      iconBg: colors.accentLight,
      iconColor: colors.accentPrimary,
      label: 'Location settings',
      subtitle: '5 km radius · Joo Chiat',
      onPress: () => navigation.navigate('LocationSettings'),
    },
    {
      icon: 'notifications-outline',
      iconBg: '#FEF9E7',
      iconColor: colors.warningYellow,
      label: 'Notifications',
      subtitle: '3 channels enabled',
      onPress: () => {},
    },
    {
      icon: 'lock-closed-outline',
      iconBg: colors.surfaceSecondary,
      iconColor: colors.textMuted,
      label: 'Change password',
      onPress: () => {},
    },
  ];

  const supportRows: MenuRow[] = [
    {
      icon: 'help-circle-outline',
      iconBg: colors.surfaceSecondary,
      iconColor: colors.textMuted,
      label: 'Help & FAQ',
      onPress: () => {},
    },
    {
      icon: 'document-text-outline',
      iconBg: colors.surfaceSecondary,
      iconColor: colors.textMuted,
      label: 'Terms & Privacy',
      onPress: () => {},
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
          onPress={() => navigation.getParent()?.navigate('Alerts')}
          hitSlop={8}
        >
          <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Avatar */}
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initials(profile.displayName)}</Text>
        </View>

        <Text style={styles.name}>{profile.displayName}</Text>
        <Text style={styles.email}>{profile.email}</Text>

        {/* Verified badge */}
        {profile.isVerified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={14} color={colors.accentPrimary} />
            <Text style={styles.verifiedText}>
              Verified · Member since {profile.memberSince}
            </Text>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: colors.accentPrimary }]}>
              {profile.lifetimeMeals}
            </Text>
            <Text style={styles.statLabel}>MEALS</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: colors.warningYellow }]}>
              {profile.restaurantsCount}
            </Text>
            <Text style={styles.statLabel}>RESTAURANTS</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: colors.textPrimary }]}>
              {profile.daysActive}
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

        {/* Log out */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          disabled={loggingOut}
          activeOpacity={0.7}
        >
          {loggingOut
            ? <ActivityIndicator color={colors.accentPrimary} />
            : <Text style={styles.logoutText}>Log out</Text>
          }
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

function MenuRowItem({ row, isLast }: { row: MenuRow; isLast: boolean }) {
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
        <Text style={styles.menuLabel}>{row.label}</Text>
        {row.subtitle && (
          <Text style={styles.menuSubtitle}>{row.subtitle}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  loader: { flex: 1 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },

  scroll: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['2xl'],
    paddingBottom: spacing['4xl'],
    alignItems: 'center',
  },

  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: radius.pill,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  avatarText: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    color: colors.accentPrimary,
  },

  name: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  email: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },

  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.accentLight,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing['2xl'],
  },
  verifiedText: {
    fontSize: fontSizes.sm,
    color: colors.accentPrimary,
    fontWeight: fontWeights.medium,
  },

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
    paddingVertical: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statNumber: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
  },
  statLabel: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    fontWeight: fontWeights.semiBold,
    letterSpacing: 0.5,
  },

  sectionLabel: {
    alignSelf: 'flex-start',
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },

  menuCard: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    overflow: 'hidden',
    marginBottom: spacing['2xl'],
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  menuRowLast: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: { flex: 1, gap: spacing.xs },
  menuLabel: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semiBold,
    color: colors.textPrimary,
  },
  menuSubtitle: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },

  logoutBtn: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.pill,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  logoutText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semiBold,
    color: colors.accentPrimary,
  },
});
