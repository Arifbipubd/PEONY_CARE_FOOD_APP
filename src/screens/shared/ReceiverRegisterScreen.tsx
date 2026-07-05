import { useState, useEffect } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendOtp } from '../../services/auth';
import { ApiError } from '../../services/api';
import { colors, spacing, fontSizes, fontFamilies, lineHeights, letterSpacings } from '../../constants/theme';
import SgFlag from '../../components/SgFlag';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'ReceiverRegister'>;
};

export default function ReceiverRegisterScreen({ navigation }: Props) {
  const [name, setName]               = useState('');
  const [phone, setPhone]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
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
  const isValidSgPhone = /^[689]\d{7}$/.test(cleaned);
  const phoneError =
    cleaned.length > 0 && !/^[689]/.test(cleaned) ? 'Must start with 6, 8 or 9' :
    cleaned.length > 8                             ? 'Must be exactly 8 digits'  : '';
  const canSubmit = name.trim().length > 0 && isValidSgPhone;

  async function handleSend() {
    if (!name.trim()) { setError('Full name is required'); return; }
    if (!isValidSgPhone) { setError('Enter a valid Singapore number'); return; }
    setError('');
    setLoading(true);
    try {
      const fullPhone = `+65${cleaned}`;
      await AsyncStorage.setItem('peony_pending_name', name.trim());
      await sendOtp(fullPhone, 'REGISTER');
      navigation.navigate('Otp', {
        phone: fullPhone,
        purpose: 'REGISTER',
        pendingRegistration: { role: 'RECEIVER', displayName: name.trim() },
      });
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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <LogoBadge size={80} />

          <Text style={styles.title}>Create your account</Text>

          <View style={styles.form}>
            <Input
              label="Full name"
              value={name}
              onChangeText={(t) => { setName(t); setError(''); }}
              placeholder="Sarah Mun"
              leftIcon={<Ionicons name="person-outline" size={18} color={colors.textMuted} />}
            />
            <Input
              label="Mobile number"
              value={phone}
              onChangeText={(t) => { setPhone(t.replace(/\D/g, '')); setError(''); }}
              placeholder="91234567"
              keyboardType="number-pad"
              error={phoneError || (rateLimitSecs > 0 && error ? `${error} Retry in ${rateLimitSecs}s.` : error)}
              leftSection={
                <>
                  <SgFlag size={24} />
                  <Text style={styles.prefix}>+65</Text>
                </>
              }
            />
          </View>

          <Button
            label="Send code"
            onPress={handleSend}
            loading={loading}
            disabled={!canSubmit}
            size="sm"
            rightIcon={<Ionicons name="arrow-forward" size={20} color={colors.textInverse} />}
          />

          <Text style={styles.terms}>
            By signing up you agree to our{' '}
            <Text style={styles.termsLink}>Terms & Privacy</Text>.
          </Text>

          <Text style={styles.loginRow}>
            Already a member?{' '}
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
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['2xl'],
    lineHeight: lineHeights.subheading,
    letterSpacing: letterSpacings.subheading,
    color: colors.textPrimary,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  form: { alignSelf: 'stretch', gap: spacing.lg },
  prefix: {
    fontFamily: fontFamilies.regular,
    fontSize: 14,
    color: colors.textPrimary,
  },
  terms: {
    fontFamily: fontFamilies.regular,
    fontSize: 14,
    lineHeight: lineHeights.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  termsLink: {
    fontFamily: fontFamilies.semiBold,
    color: colors.accentPrimary,
  },
  loginRow: {
    fontFamily: fontFamilies.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  loginLink: {
    fontFamily: fontFamilies.semiBold,
    color: colors.accentPrimary,
  },
});
