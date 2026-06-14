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
import { AuthStackParamList } from '../../navigation/AuthStack';
import Button from '../../components/Button';
import { verifyOtp, sendOtp } from '../../services/auth';
import { useAuthStore } from '../../store/authStore';
import LogoBadge from '../../components/LogoBadge';
import { colors, spacing, fontSizes, fontWeights, radius } from '../../constants/theme';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Otp'>;
  route: RouteProp<AuthStackParamList, 'Otp'>;
};

const CODE_LENGTH    = 6;
const RESEND_SECONDS = 30;

export default function OtpScreen({ navigation, route }: Props) {
  const { email } = route.params;
  const { setAuth } = useAuthStore();

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const inputRefs = useRef<Array<TextInput | null>>(Array(CODE_LENGTH).fill(null));

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  function handleChange(text: string, index: number) {
    const char = text.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    setError('');
    if (char && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyPress(key: string, index: number) {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function handleVerify() {
    const code = digits.join('');
    if (code.length < CODE_LENGTH) { setError('Enter all 6 digits'); return; }
    setLoading(true);
    setError('');
    try {
      const result = await verifyOtp(email, code);
      if (!result.isNewUser && result.accessToken && result.refreshToken && result.user) {
        setAuth(result.accessToken, result.refreshToken, result.user);
      } else if (result.isNewUser && result.registrationToken) {
        navigation.navigate('Register', {
          registrationToken: result.registrationToken,
          email,
        });
      }
    } catch {
      setError('Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (seconds > 0) return;
    await sendOtp(email);
    setSeconds(RESEND_SECONDS);
    setDigits(Array(CODE_LENGTH).fill(''));
    inputRefs.current[0]?.focus();
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

        <Text style={styles.title}>Check your inbox</Text>
        <Text style={styles.subtitle}>
          Sent to <Text style={styles.emailBold}>{email}</Text>
        </Text>

        <View style={styles.codeRow}>
          {digits.map((d, i) => (
            <TextInput
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              value={d}
              onChangeText={(t) => handleChange(t, i)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
              keyboardType="number-pad"
              maxLength={1}
              style={[styles.digitBox, d ? styles.digitBoxFilled : null]}
              caretHidden
              selectTextOnFocus
            />
          ))}
        </View>

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
          label="Verify & continue"
          onPress={handleVerify}
          loading={loading}
          disabled={digits.join('').length < CODE_LENGTH}
          style={styles.btn}
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
  emailBold: {
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
    textAlign: 'center',
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  digitBoxFilled: {
    borderColor: colors.accentPrimary,
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
  btn: {
    width: '100%',
  },
});
