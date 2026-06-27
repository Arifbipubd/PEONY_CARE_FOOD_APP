import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthStack';
import Button from '../../components/Button';
import { StatusBadge } from '../../components/Badge';
import LogoBadge from '../../components/LogoBadge';
import {
  colors,
  spacing,
  fontSizes,
  fontWeights,
  fontFamilies,
  lineHeights,
  letterSpacings,
} from '../../constants/theme';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Splash'>;
};

export default function SplashScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.body}>
        <View style={styles.logoGlow}>
          <LogoBadge size={96} />
        </View>
        <Text style={styles.title}>{'Peony\nCare'}</Text>
        <Text style={styles.subtitle}>
          {'Complementary meals for Singaporeans in need —\nfrom generous restaurants and donors nearby.'}
        </Text>
        <View style={styles.badgeWrap}>
          <StatusBadge
            label="HUMAN FOR HUMANITY"
            color="red"
            icon={<Ionicons name="heart" size={13} color={colors.accentDark} />}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          label="Get started"
          onPress={() => navigation.navigate('ChooseRole')}
          rightIcon={<Ionicons name="arrow-forward" size={18} color={colors.textInverse} />}
        />
        <Button
          label="I already have an account"
          variant="outline"
          onPress={() => navigation.navigate('Login')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
  },
  logoGlow: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['2xl'],
  },
  title: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['5xl'],
    lineHeight: lineHeights.heading,
    letterSpacing: letterSpacings.heading,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: fontFamilies.regular,
    fontSize: 14,
    lineHeight: lineHeights.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing['3xl'],
  },
  badgeWrap: { alignItems: 'center' },
  footer: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['2xl'],
    gap: spacing.md,
  },
});
