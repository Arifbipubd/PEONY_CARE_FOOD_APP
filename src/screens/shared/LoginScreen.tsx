import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../navigation/AuthStack';
import Button from '../../components/Button';
import Input from '../../components/Input';
import LogoBadge from '../../components/LogoBadge';
import { sendOtp } from '../../services/auth';
import { colors, spacing, fontSizes, fontWeights } from '../../constants/theme';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSend() {
    if (!email.trim() || !email.includes('@')) {
      setError('Enter a valid email address');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await sendOtp(email.trim());
      navigation.navigate('Otp', { email: email.trim() });
    } catch {
      setError('Failed to send code. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      {/* Back arrow — plain, matches design */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.body}>
          <View style={styles.logoWrap}>
            <LogoBadge size={80} />
          </View>

          <Text style={styles.title}>Welcome back</Text>

          <Input
            label="Email address"
            value={email}
            onChangeText={(t) => { setEmail(t); setError(''); }}
            placeholder="you@example.com"
            keyboardType="email-address"
            error={error}
            leftIcon={<Ionicons name="mail-outline" size={18} color={colors.textMuted} />}
          />

          <Button
            label="Send code"
            onPress={handleSend}
            loading={loading}
            disabled={!email.includes('@')}
            style={styles.btn}
          />

          <Text style={styles.signupRow}>
            New here?{' '}
            <Text
              style={styles.signupLink}
              onPress={() => navigation.navigate('Register', {
                registrationToken: 'mock-reg-token',
                email: '',
              })}
            >
              Sign up
            </Text>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  back: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  flex: {
    flex: 1,
  },
  body: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['2xl'],
    gap: spacing['2xl'],
  },
  title: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  logoWrap: {
    alignItems: 'center',
  },
  btn: {
    marginTop: spacing.xs,
  },
  signupRow: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  signupLink: {
    color: colors.accentPrimary,
    fontWeight: fontWeights.semiBold,
  },
});
