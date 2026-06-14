import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthStack';
import Button from '../../components/Button';
import { StatusBadge } from '../../components/Badge';
import LogoBadge from '../../components/LogoBadge';
import { colors, spacing, fontSizes, fontWeights } from '../../constants/theme';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Splash'>;
};

export default function SplashScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.body}>
        <LogoBadge size={96} />
        <Text style={styles.title}>{'Peony\nCare'}</Text>
        <Text style={styles.subtitle}>
          {'Free meals for Singaporeans in need —\nfrom generous restaurants and donors nearby.'}
        </Text>
        <View style={styles.badgeWrap}>
          <StatusBadge label="HUMAN FOR HUMANITY" color="red" />
        </View>
      </View>

      <View style={styles.footer}>
        <Button label="Get started" onPress={() => navigation.navigate('Login')} />
        <Button
          label="I already have an account"
          variant="outline"
          onPress={() => navigation.navigate('Login')}
          style={styles.secondBtn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
  },
  logo: {
    marginBottom: spacing['2xl'],
  },
  title: {
    fontSize: fontSizes['4xl'],
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 42,
    marginBottom: spacing.lg,
  },
  subtitle: {
    fontSize: fontSizes.md,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  badgeWrap: {
    alignItems: 'center',
  },
  footer: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['2xl'],
    gap: spacing.md,
  },
  secondBtn: {
    marginTop: spacing.xs,
  },
});
