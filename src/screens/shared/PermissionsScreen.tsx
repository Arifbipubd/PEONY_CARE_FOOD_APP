import { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types';
import { colors, spacing, fontSizes, fontFamilies, letterSpacings, radius } from '../../constants/theme';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Permissions'>;
  route:      RouteProp<AuthStackParamList, 'Permissions'>;
};

type Badge = 'REQUIRED' | 'OPTIONAL';

interface PermItem {
  key:       string;
  icon:      React.ComponentProps<typeof Ionicons>['name'];
  iconBg:    string;
  iconColor: string;
  title:     string;
  desc:      string;
  badge:     Badge;
}

const LOCATION: PermItem = {
  key:       'location',
  icon:      'location',
  iconBg:    colors.avatarBg,
  iconColor: colors.accentPrimary,
  title:     'Location',
  desc:      'So we can show food donations near you. Only used while the app is open.',
  badge:     'REQUIRED',
};

const CAMERA_RECEIVER: PermItem = {
  key:       'camera',
  icon:      'camera',
  iconBg:    '#FFF3D0',
  iconColor: '#B8941E',
  title:     'Camera',
  desc:      'To scan QR codes at pickup and add a profile photo. Photos are only uploaded when you tap Save.',
  badge:     'REQUIRED',
};

const CAMERA_RESTAURANT: PermItem = {
  ...CAMERA_RECEIVER,
  desc:  'To upload food photos for your listings and display QR codes for receivers to scan.',
  badge: 'REQUIRED',
};

const NOTIFICATIONS_RECEIVER: PermItem = {
  key:       'notifications',
  icon:      'notifications',
  iconBg:    colors.mintLight,
  iconColor: colors.successGreen,
  title:     'Notifications',
  desc:      'Get alerted when new food appears nearby. You can mute these anytime in settings.',
  badge:     'OPTIONAL',
};

const NOTIFICATIONS_RESTAURANT: PermItem = {
  ...NOTIFICATIONS_RECEIVER,
  desc:  'Get alerted when a receiver claims one of your food donations.',
  badge: 'REQUIRED',
};

function getPerms(role: string): PermItem[] {
  if (role === 'RESTAURANT') return [LOCATION, CAMERA_RESTAURANT, NOTIFICATIONS_RESTAURANT];
  if (role === 'DONOR')      return [LOCATION, NOTIFICATIONS_RECEIVER];
  return [LOCATION, CAMERA_RECEIVER, NOTIFICATIONS_RECEIVER]; // RECEIVER
}

function getSubtitle(role: string, count: number): string {
  if (role === 'RESTAURANT') {
    return 'A few permissions so you can manage your donations effectively.';
  }
  const word = count === 2 ? 'Two' : 'Three';
  return `${word} things we'll ask for so the app can help you find food.`;
}

export default function PermissionsScreen({ navigation, route }: Props) {
  const { accessToken, refreshToken, user } = route.params;
  const { setAuth } = useAuthStore();

  const perms    = getPerms(user.role);
  const subtitle = getSubtitle(user.role, perms.length);

  const finish = useCallback(() => {
    setAuth(accessToken, refreshToken, user as { id: string; phone: string; role: UserRole });
  }, [accessToken, refreshToken, user, setAuth]);

  return (
    <SafeAreaView style={styles.screen}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Almost ready</Text>
          <Text style={styles.title}>Quick permissions</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <View style={styles.cards}>
          {perms.map((p) => (
            <View key={p.key} style={styles.card}>
              <View style={[styles.iconWrap, { backgroundColor: p.iconBg }]}>
                <Ionicons name={p.icon} size={22} color={p.iconColor} />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{p.title}</Text>
                <Text style={styles.cardDesc}>{p.desc}</Text>
                <Text style={styles.badge}>{p.badge}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.allowBtn} onPress={finish} activeOpacity={0.85}>
            <Text style={styles.allowLabel}>Allow & continue</Text>
            <Ionicons name="arrow-forward" size={18} color={colors.textInverse} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipBtn} onPress={finish} activeOpacity={0.7}>
            <Text style={styles.skipLabel}>Skip for now</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.privacy}>
          We only use this data to help you find food. Details in our{' '}
          <Text
            style={styles.privacyLink}
            onPress={() => navigation.navigate('TermsPrivacy')}
          >
            Privacy Policy
          </Text>
          .
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  back: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  body: {
    paddingBottom: spacing['2xl'],
  },

  // Header
  header: {
    paddingHorizontal: spacing['2xl'],
  },
  eyebrow: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginBottom: 6,
  },
  title: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['2xl'],
    letterSpacing: letterSpacings.subheading,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
  },
  subtitle: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['14'],
    lineHeight: 21,
    color: colors.textMuted,
    paddingBottom: spacing['3xl'],
  },

  // Cards
  cards: { gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: spacing.xl,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    backgroundColor: colors.surface,
    gap: 14,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardText: { flex: 1 },
  cardTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['14'],
    letterSpacing: -0.21,
    color: colors.textPrimary,
  },
  cardDesc: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    lineHeight: 18,
    color: colors.textMuted,
    marginTop: 4,
  },
  badge: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.xs,
    letterSpacing: 0.88,
    color: colors.textMuted,
    marginTop: 6,
    textTransform: 'uppercase',
  },

  // Actions
  actions: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  allowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing['2xl'],
    height: 54,
    borderRadius: radius.sheet,
    backgroundColor: colors.accentPrimary,
    gap: spacing.sm,
  },
  allowLabel: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['14'],
    letterSpacing: 0.28,
    color: colors.textInverse,
  },
  skipBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing['2xl'],
    height: 54,
  },
  skipLabel: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['14'],
    letterSpacing: 0.28,
    color: colors.textMuted,
  },

  // Privacy
  privacy: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    lineHeight: 18,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingTop: 16,
    paddingBottom: spacing['4xl'],
  },
  privacyLink: {
    fontFamily: fontFamilies.semiBold,
    color: colors.accentPrimary,
  },
});
