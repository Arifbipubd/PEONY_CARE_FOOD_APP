import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList, PendingRegistration } from '../../navigation/AuthStack';
import Button from '../../components/Button';
import {
  verifyOtp,
  sendOtp,
  registerReceiver,
  registerDonor,
  registerRestaurant,
} from '../../services/auth';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types';
import LogoBadge from '../../components/LogoBadge';
import { colors, spacing, fontSizes, fontWeights, radius } from '../../constants/theme';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Otp'>;
  route: RouteProp<AuthStackParamList, 'Otp'>;
};

const CODE_LENGTH    = 6;
const RESEND_SECONDS = 30;

async function autoRegister(
  pending: PendingRegistration,
  token: string,
): Promise<{ accessToken: string; refreshToken: string; user: { id: string; phone: string; role: UserRole } }> {
  if (pending.role === 'RECEIVER') return registerReceiver(pending.displayName, token);
  if (pending.role === 'DONOR')    return registerDonor(pending.displayName, pending.email, token);
  return registerRestaurant(
    {
      restaurant_name: pending.restaurantName,
      uen:             pending.uen,
      address:         pending.address,
      contact_name:    pending.contactName,
      contact_email:   pending.email,
    },
    token,
  );
}

export default function OtpScreen({ navigation, route }: Props) {
  const { phone, purpose, pendingRegistration } = route.params;
  const { setAuth } = useAuthStore();

  const [code, setCode]       = useState('');
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const inputRef = useRef<TextInput>(null);

  // The box that shows the cursor: next empty slot, capped at last box
  const activeIndex = Math.min(code.length, CODE_LENGTH - 1);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  async function handleVerify() {
    if (code.length < CODE_LENGTH) { setError('Enter all 6 digits'); return; }
    setLoading(true);
    setError('');
    try {
      const result = await verifyOtp(phone, code);

      if (!result.isNewUser && result.accessToken && result.refreshToken && result.user) {
        setAuth(result.accessToken, result.refreshToken, result.user);
        return;
      }

      if (result.isNewUser && result.registrationToken && pendingRegistration) {
        const reg = await autoRegister(pendingRegistration, result.registrationToken);
        setAuth(reg.accessToken, reg.refreshToken, reg.user as { id: string; phone: string; role: UserRole });
        return;
      }

      setError('Unexpected response. Please try again.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (seconds > 0) return;
    try {
      await sendOtp(phone, purpose);
      setSeconds(RESEND_SECONDS);
      setCode('');
      inputRef.current?.focus();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to resend. Try again.');
    }
  }

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <SafeAreaView style={styles.screen}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
      </TouchableOpacity>

      <View style={styles.body}>
        <LogoBadge size={80} />

        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>
          Code sent to <Text style={styles.phoneBold}>{phone}</Text>
        </Text>

        {/* Tap anywhere on the row to bring up the keyboard */}
        <TouchableOpacity
          style={styles.codeRow}
          activeOpacity={1}
          onPress={() => inputRef.current?.focus()}
        >
          {Array(CODE_LENGTH).fill(null).map((_, i) => {
            const char = code[i];
            const isActive = focused && i === activeIndex;
            return (
              <View
                key={i}
                style={[
                  styles.digitBox,
                  isActive ? styles.digitBoxActive : null,
                ]}
              >
                <Text style={styles.digitText}>{char ?? ''}</Text>
              </View>
            );
          })}
        </TouchableOpacity>

        {/* Single hidden input — captures all typing and backspaces */}
        <TextInput
          ref={inputRef}
          value={code}
          onChangeText={(t) => { setCode(t.replace(/\D/g, '').slice(0, CODE_LENGTH)); setError(''); }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          keyboardType="number-pad"
          maxLength={CODE_LENGTH}
          style={styles.hiddenInput}
          caretHidden
          autoFocus
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity onPress={handleResend} disabled={seconds > 0}>
          <Text style={styles.resendText}>
            Didn't get the code?{' '}
            <Text style={[styles.resendLink, seconds > 0 && styles.resendDisabled]}>
              {seconds > 0 ? `Resend in ${formatTime(seconds)}` : 'Resend now'}
            </Text>
          </Text>
        </TouchableOpacity>

        <Button
          label="Sign in"
          onPress={handleVerify}
          loading={loading}
          disabled={code.length < CODE_LENGTH}
          style={styles.btn}
          rightIcon={<Ionicons name="arrow-forward" size={20} color={colors.textInverse} />}
        />
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
    paddingTop: spacing.lg,
    alignItems: 'center',
    gap: spacing.lg,
  },
  title: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: fontSizes.md,
    color: colors.textMuted,
  },
  phoneBold: {
    color: colors.textPrimary,
    fontWeight: fontWeights.semiBold,
  },
  codeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  digitBox: {
    width: 48,
    height: 58,
    borderRadius: radius.input,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  digitBoxActive: {
    borderColor: colors.accentPrimary,
    backgroundColor: colors.accentLight,
  },
  digitText: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  error: {
    fontSize: fontSizes.sm,
    color: colors.errorRed,
  },
  resendText: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  resendLink: {
    color: colors.accentPrimary,
    fontWeight: fontWeights.semiBold,
  },
  resendDisabled: {
    color: colors.textMuted,
  },
  btn: { width: '100%' },
});
