import { useState } from 'react';
import { requestForegroundPermissionsAsync, getCurrentPositionAsync, Accuracy } from 'expo-location';
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

const COPY = {
  DONOR:    { title: 'Become a donor',      alreadyLabel: 'Already a donor?' },
  RECEIVER: { title: 'Create your account', alreadyLabel: 'Already a member?' },
} as const;

export default function RegisterScreen({ navigation, route }: Props) {
  const { registrationToken, role = 'RECEIVER' } = route.params;
  const { setAuth } = useAuthStore();

  const [name, setName]       = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const copy = COPY[role as keyof typeof COPY] ?? COPY.RECEIVER;

  async function handleCreate() {
    if (!name.trim()) { setError('Full name is required'); return; }
    setLoading(true);
    setError('');
    try {
      let lat: number | null = null;
      let lng: number | null = null;
      if (role === 'RECEIVER') {
        try {
          const { status } = await requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const pos = await getCurrentPositionAsync({ accuracy: Accuracy.Balanced });
            lat = pos.coords.latitude;
            lng = pos.coords.longitude;
          }
        } catch {
          // proceed without location — backend will use 0,0 until home screen updates it
        }
      }
      const result = role === 'DONOR'
        ? await registerDonor(name.trim(), '', registrationToken)
        : await registerReceiver(name.trim(), registrationToken, lat, lng);
      setAuth(
        result.accessToken,
        result.refreshToken,
        result.user as { id: string; phone: string; role: UserRole },
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
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
            onChangeText={(t) => { setName(t); setError(''); }}
            placeholder="Your name"
            error={error}
            leftIcon={<Ionicons name="person-outline" size={18} color={colors.textMuted} />}
          />
        </View>

        <Button
          label="Create account"
          onPress={handleCreate}
          loading={loading}
        />

        <Text style={styles.terms}>
          By signing up you agree to our{' '}
          <Text style={styles.termsLink}>Terms & Privacy</Text>.
        </Text>

        <Text style={styles.loginRow}>
          {copy.alreadyLabel}{' '}
          <Text
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
          >
            Log in
          </Text>
        </Text>
      </ScrollView>
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
