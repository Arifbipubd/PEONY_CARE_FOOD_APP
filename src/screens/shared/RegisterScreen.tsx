import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../navigation/AuthStack';
import Button from '../../components/Button';
import Input from '../../components/Input';
import LogoBadge from '../../components/LogoBadge';
import { registerReceiver, registerDonor } from '../../services/auth';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types';
import { colors, spacing, fontSizes, fontWeights } from '../../constants/theme';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
  route: RouteProp<AuthStackParamList, 'Register'>;
};

// Title and footer text differ by role — everything else is identical
const COPY = {
  DONOR: {
    title: 'Become a donor',
    alreadyLabel: 'Already a donor?',
  },
  RECEIVER: {
    title: 'Create your account',
    alreadyLabel: 'Already a member?',
  },
} as const;

export default function RegisterScreen({ navigation, route }: Props) {
  const { registrationToken, email: prefillEmail, role = 'RECEIVER' } = route.params;
  const { setAuth } = useAuthStore();

  const [name, setName]   = useState('');
  const [email, setEmail] = useState(prefillEmail ?? '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState<{ name?: string; email?: string }>({});

  const copy = COPY[role as keyof typeof COPY] ?? COPY.RECEIVER;

  function validate() {
    const e: typeof errors = {};
    if (!name.trim())  e.name  = 'Full name is required';
    if (!email.trim() || !email.includes('@')) e.email = 'Enter a valid email address';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSend() {
    if (!validate()) return;
    setLoading(true);
    try {
      const fn = role === 'DONOR' ? registerDonor : registerReceiver;
      const result = await fn(name.trim(), email.trim(), registrationToken);
      setAuth(
        result.accessToken,
        result.refreshToken,
        result.user as { id: string; phone: string; role: UserRole },
      );
    } catch {
      setErrors({ name: 'Registration failed. Please try again.' });
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

      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <LogoBadge size={80} />

        <Text style={styles.title}>{copy.title}</Text>

        <View style={styles.form}>
          <Input
            label="Full name"
            value={name}
            onChangeText={(t) => { setName(t); setErrors((e) => ({ ...e, name: undefined })); }}
            placeholder="Your name"
            error={errors.name}
            leftIcon={<Ionicons name="person-outline" size={18} color={colors.textMuted} />}
          />

          {/* Email input — no icon, matches design */}
          <Input
            label="Email address"
            value={email}
            onChangeText={(t) => { setEmail(t); setErrors((e) => ({ ...e, email: undefined })); }}
            placeholder="you@example.com"
            keyboardType="email-address"
            error={errors.email}
          />
        </View>

        <Button
          label="Send code"
          onPress={handleSend}
          loading={loading}
        />

        <Text style={styles.terms}>
          By signing up you agree to our{' '}
          <Text style={styles.termsLink}>Terms & Privacy</Text>.
        </Text>

        <Text style={styles.loginRow}>
          {copy.alreadyLabel}{' '}
          <Text style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
            Log in
          </Text>
        </Text>
      </ScrollView>
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
  body: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.lg,
    paddingBottom: spacing['4xl'],
    gap: spacing['2xl'],
    alignItems: 'center',
  },
  title: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  form: {
    alignSelf: 'stretch',
    gap: spacing.lg,
  },
  terms: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  termsLink: {
    color: colors.accentPrimary,
    fontWeight: fontWeights.medium,
  },
  loginRow: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  loginLink: {
    color: colors.accentPrimary,
    fontWeight: fontWeights.semiBold,
  },
});
