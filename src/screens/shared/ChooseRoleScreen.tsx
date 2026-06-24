import { View, Text, TouchableOpacity, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { colors, spacing, fontSizes, fontWeights, fontFamilies, letterSpacings, lineHeights, radius } from '../../constants/theme';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'ChooseRole'>;
};

const ROLES = [
  {
    key: 'RESTAURANT' as const,
    title: 'Restaurant Donor',
    subtitle: 'Share surplus food from your business',
    iconBg: colors.avatarBg,
    iconColor: colors.accentPrimary,
    renderIcon: (color: string) => <Ionicons name="storefront" size={24} color={color} />,
    screen: 'RestaurantRegister' as const,
  },
  {
    key: 'DONOR' as const,
    title: 'Individual Donor',
    subtitle: 'Sponsor meals for those in need',
    iconBg: colors.goldLight,
    iconColor: colors.goldDark,
    renderIcon: (color: string) => <MaterialCommunityIcons name="hand-heart" size={24} color={color} />,
    screen: 'DonorRegister' as const,
  },
  {
    key: 'RECEIVER' as const,
    title: 'Receiver',
    subtitle: 'Find complimentary food near you',
    iconBg: colors.mintLight,
    iconColor: colors.successGreen,
    renderIcon: (color: string) => <MaterialCommunityIcons name="silverware-fork-knife" size={24} color={color} />,
    screen: 'ReceiverRegister' as const,
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
            <Pressable
              key={role.key}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() => navigation.navigate(role.screen)}
            >
              <View style={[styles.iconBox, { backgroundColor: role.iconBg }]}>
                {role.renderIcon(role.iconColor)}
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{role.title}</Text>
                <Text style={styles.cardSubtitle}>{role.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
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
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacings.subheading,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fontFamilies.regular,
    fontSize: 14,
    fontWeight: fontWeights.regular,
    color: colors.textMuted,
    marginBottom: spacing['3xl'],
  },
  cards: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    backgroundColor: colors.surface,
    padding: 16,
    gap: 16,
  },
  cardPressed: {
    borderColor: colors.accentPrimary,
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
    fontFamily: fontFamilies.semiBold,
    fontSize: 16,
    fontWeight: fontWeights.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    fontFamily: fontFamilies.regular,
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: lineHeights.body,
  },
  loginRow: {
    fontFamily: fontFamilies.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing['3xl'],
  },
  loginLink: {
    color: colors.accentPrimary,
    fontWeight: fontWeights.bold,
  },
});
