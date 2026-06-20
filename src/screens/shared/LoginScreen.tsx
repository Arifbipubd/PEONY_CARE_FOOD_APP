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
import SgFlag from '../../components/SgFlag';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: Props) {
  const [phone, setPhone]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const cleaned = phone.trim().replace(/\s/g, '');

  async function handleSend() {
    if (cleaned.length < 8) { setError('Enter a valid phone number'); return; }
    setError('');
    setLoading(true);
    try {
      const fullPhone = `+65${cleaned}`;
      await sendOtp(fullPhone, 'LOGIN');
      navigation.navigate('Otp', { phone: fullPhone, purpose: 'LOGIN' });
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
        <View style={styles.body}>
          <View style={styles.logoWrap}>
            <LogoBadge size={80} />
          </View>

          <Text style={styles.title}>Welcome back</Text>

          <Input
            label="Mobile number"
            value={phone}
            onChangeText={(t) => { setPhone(t.replace(/\D/g, '')); setError(''); }}
            placeholder="91234567"
            keyboardType="number-pad"
            error={error}
            leftSection={
              <>
                <SgFlag size={24} />
                <Text style={styles.prefix}>+65</Text>
              </>
            }
          />

          <Button
            label="Send code"
            onPress={handleSend}
            loading={loading}
            disabled={cleaned.length < 8}
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
  prefix: {
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    fontWeight: fontWeights.medium,
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
