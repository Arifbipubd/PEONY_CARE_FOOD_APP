import { useState, useEffect } from 'react';
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
import { ApiError } from '../../services/api';
import { colors, spacing, fontSizes, fontWeights } from '../../constants/theme';
import CountryPicker, { CountryOption, COUNTRIES } from '../../components/CountryPicker';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: Props) {
  const [phone, setPhone]     = useState('');
  const [country, setCountry] = useState<CountryOption>(COUNTRIES[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [rateLimitSecs, setRateLimitSecs] = useState(0);

  useEffect(() => {
    if (rateLimitSecs <= 0) return;
    const t = setTimeout(() => {
      setRateLimitSecs((s) => {
        const next = s - 1;
        if (next <= 0) setError('');
        return next;
      });
    }, 1000);
    return () => clearTimeout(t);
  }, [rateLimitSecs]);

  const cleaned = phone.trim().replace(/\s/g, '');
  const isSg = country.code === 'SG';
  const isValidPhone = isSg
    ? /^[689]\d{7}$/.test(cleaned)
    : /^0?1[3-9]\d{8}$/.test(cleaned);
  const phoneError = isSg
    ? (cleaned.length > 0 && !/^[689]/.test(cleaned) ? 'Must start with 6, 8 or 9' :
       cleaned.length > 8 ? 'Must be exactly 8 digits' : '')
    : (cleaned.length > 11 ? 'Please enter a valid phone number' : '');

  async function handleSend() {
    if (!isValidPhone) { setError(`Enter a valid ${country.label} number`); return; }
    setError('');
    setLoading(true);
    try {
      const localPart = cleaned.startsWith('0') ? cleaned.slice(1) : cleaned;
      const fullPhone = `${country.dial}${localPart}`;
      await sendOtp(fullPhone, 'LOGIN');
      navigation.navigate('Otp', { phone: fullPhone, purpose: 'LOGIN' });
    } catch (err: unknown) {
      if (err instanceof ApiError && err.code === 'OTP_RATE_LIMITED') {
        const secs = (err.details?.retry_after_seconds as number) ?? 60;
        setRateLimitSecs(secs);
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to send code. Try again.');
      }
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
        behavior="padding"
      >
        <View style={styles.body}>
          <View style={styles.logoWrap}>
            <LogoBadge size={80} />
          </View>

          <Text style={styles.title}>Welcome back</Text>

          <Input
            label="Mobile number"
            value={phone}
            onChangeText={(t) => { setPhone(t.replace(/\D/g, '')); setError(''); }}
            placeholder={isSg ? '91234567' : '01712345678'}
            keyboardType="number-pad"
            error={phoneError || (rateLimitSecs > 0 && error ? `${error} Retry in ${rateLimitSecs}s.` : error)}
            leftSection={
              <CountryPicker selected={country} onSelect={(c) => { setCountry(c); setPhone(''); setError(''); }} />
            }
          />

          <Button
            label="Send code"
            onPress={handleSend}
            loading={loading}
            disabled={!isValidPhone}
            style={styles.btn}
            rightIcon={<Ionicons name="arrow-forward" size={20} color={colors.textInverse} />}
          />

          <Text style={styles.switchRow}>
            New here?{' '}
            <Text
              style={styles.switchLink}
              onPress={() => navigation.navigate('ChooseRole')}
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
  screen: { flex: 1, backgroundColor: colors.surface },
  back: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  flex: { flex: 1 },
  body: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['2xl'],
    gap: spacing['2xl'],
  },
  logoWrap: { alignItems: 'center' },
  title: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  btn: { marginTop: spacing.xs },
  switchRow: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  switchLink: {
    color: colors.accentPrimary,
    fontWeight: fontWeights.semiBold,
  },
});
