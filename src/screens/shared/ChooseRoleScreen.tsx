import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { colors, spacing, fontSizes, fontWeights, radius } from '../../constants/theme';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'ChooseRole'>;
};

const ROLES = [
  {
    key: 'RESTAURANT' as const,
    title: 'Restaurant Donor',
    subtitle: 'Share surplus food from your business',
    iconBg: colors.accentLight,
    iconColor: colors.accentPrimary,
    iconName: 'storefront-outline' as const,
    screen: 'RestaurantRegister' as const,
    showChevron: true,
  },
  {
    key: 'DONOR' as const,
    title: 'Individual Donor',
    subtitle: 'Sponsor meals for those in need',
    iconBg: colors.warningYellowLight,
    iconColor: colors.warningYellow,
    iconName: 'heart-outline' as const,
    screen: 'DonorRegister' as const,
    showChevron: false,
  },
  {
    key: 'RECEIVER' as const,
    title: 'Receiver',
    subtitle: 'Find complimentary food near you',
    iconBg: colors.successGreenLight,
    iconColor: colors.successGreen,
    iconName: 'person-outline' as const,
    screen: 'ReceiverRegister' as const,
    showChevron: false,
  },
] as const;

export default function ChooseRoleScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.screen}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
      </TouchableOpacity>

      <View style={styles.body}>
        <Text style={styles.title}>Join Peony Care</Text>
        <Text style={styles.subtitle}>Choose how you'd like to contribute</Text>

        <View style={styles.cards}>
          {ROLES.map((role) => (
            <TouchableOpacity
              key={role.key}
              style={styles.card}
              onPress={() => navigation.navigate(role.screen)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconBox, { backgroundColor: role.iconBg }]}>
                <Ionicons name={role.iconName} size={24} color={role.iconColor} />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{role.title}</Text>
                <Text style={styles.cardSubtitle}>{role.subtitle}</Text>
              </View>
              {role.showChevron && (
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.loginRow}>
          Already have an account?{' '}
          <Text
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
          >
            Login
          </Text>
        </Text>
      </View>
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
    flex: 1,
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.xl,
  },
  title: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSizes.md,
    color: colors.textMuted,
    marginBottom: spacing['3xl'],
  },
  cards: {
    gap: spacing.lg,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.card,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: { flex: 1 },
  cardTitle: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    lineHeight: 18,
  },
  loginRow: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing['3xl'],
  },
  loginLink: {
    color: colors.accentPrimary,
    fontWeight: fontWeights.semiBold,
  },
});
