import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
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
  navigation: NativeStackNavigationProp<AuthStackParamList, 'DonorRegister'>;
};

export default function DonorRegisterScreen({ navigation }: Props) {
  const [name, setName]     = useState('');
  const [email, setEmail]   = useState('');
  const [phone, setPhone]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const cleaned = phone.trim().replace(/\s/g, '');
  const canSubmit = name.trim().length > 0 && cleaned.length >= 8;

  async function handleSend() {
    if (!name.trim()) { setError('Full name is required'); return; }
    if (cleaned.length < 8) { setError('Enter a valid phone number'); return; }
    setError('');
    setLoading(true);
    try {
      const fullPhone = `+65${cleaned}`;
      await sendOtp(fullPhone, 'REGISTER');
      navigation.navigate('Otp', {
        phone: fullPhone,
        purpose: 'REGISTER',
        pendingRegistration: {
          role: 'DONOR',
          displayName: name.trim(),
          email: email.trim(),
        },
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send code. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <LogoBadge size={80} />

          <Text style={styles.title}>Become a donor</Text>

          <View style={styles.form}>
            <Input
              label="Full name"
              value={name}
              onChangeText={(t) => { setName(t); setError(''); }}
              placeholder="John Tan"
              leftIcon={<Ionicons name="person-outline" size={18} color={colors.textMuted} />}
            />
            <Input
              label="Email address"
              value={email}
              onChangeText={(t) => { setEmail(t); setError(''); }}
              placeholder="john@example.com"
              keyboardType="email-address"
              leftIcon={<Ionicons name="mail-outline" size={18} color={colors.textMuted} />}
            />
            <Input
              label="Phone number"
              value={phone}
              onChangeText={(t) => { setPhone(t.replace(/\D/g, '')); setError(''); }}
              placeholder="91234567"
              keyboardType="number-pad"
              error={error}
              leftIcon={<Text style={styles.prefix}>+65</Text>}
            />
          </View>

          <Button
            label="Send code"
            onPress={handleSend}
            loading={loading}
            disabled={!canSubmit}
          />

          <Text style={styles.terms}>
            By signing up you agree to our{' '}
            <Text style={styles.termsLink}>Terms & Privacy</Text>.
          </Text>

          <Text style={styles.loginRow}>
            Already a donor?{' '}
            <Text style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
              Log in
            </Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
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
  form: { alignSelf: 'stretch', gap: spacing.lg },
  prefix: {
    fontSize: fontSizes.md,
    color: colors.textMuted,
    fontWeight: fontWeights.medium,
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
