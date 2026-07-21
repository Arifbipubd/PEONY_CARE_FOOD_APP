import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { ProfileStackParamList } from '../../navigation/ReceiverTabs';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import {
  colors, spacing, fontSizes, fontFamilies, radius,
} from '../../constants/theme';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'DeleteAccount'>;
};

const DELETED_ITEMS = [
  'Your name, mobile number, and profile photo',
  'Your claim history and pickup records',
  'Notification preferences and saved locations',
  'Any in-progress claims (cancelled automatically)',
] as const;

export default function DeleteAccountScreen({ navigation }: Props) {
  const { clearAuth } = useAuthStore();
  const [confirmText, setConfirmText] = useState('');
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isConfirmed = confirmText === 'DELETE';

  const handleDelete = useCallback(async () => {
    if (!isConfirmed || loading) return;
    setLoading(true);
    setError('');
    try {
      await api.post('/receiver/account/delete/', { confirmation: 'DELETE' });
      clearAuth();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not delete account. Try again.');
      setLoading(false);
    }
  }, [isConfirmed, loading, clearAuth]);

  const handleMailto = useCallback(() => {
    Linking.openURL('mailto:support@peonycare.sg');
  }, []);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.heroIcon}>
          <Ionicons name="warning" size={28} color={colors.dangerRed} />
        </View>

        <Text style={styles.title}>Delete account</Text>

        <Text style={styles.desc}>
          This is permanent. We can't recover your account after deletion.
        </Text>

        <View style={styles.dangerCard}>
          <Text style={styles.dangerLabel}>WHAT GETS DELETED</Text>
          {DELETED_ITEMS.map((item, i) => (
            <Text
              key={item}
              style={[styles.bullet, i === DELETED_ITEMS.length - 1 && styles.bulletLast]}
            >
              {'• ' + item}
            </Text>
          ))}
        </View>

        <View style={styles.confirmSection}>
          <Text style={styles.confirmLabel}>Type DELETE to confirm</Text>
          <TextInput
            style={[styles.confirmInput, focused && styles.confirmInputFocused]}
            value={confirmText}
            onChangeText={setConfirmText}
            autoCapitalize="characters"
            placeholder="DELETE"
            placeholderTextColor={colors.textMuted}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
        </View>

        {!!error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        <TouchableOpacity
          style={[styles.deleteBtn, (!isConfirmed || loading) && styles.deleteBtnDisabled]}
          activeOpacity={0.85}
          onPress={handleDelete}
          disabled={!isConfirmed || loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <>
              <Ionicons name="trash" size={16} color={colors.textInverse} />
              <Text style={styles.deleteBtnLabel}>Delete my account</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelBtn}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelBtnLabel}>Cancel</Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Need help instead? Email{' '}
            <Text style={styles.infoEmail} onPress={handleMailto}>
              support@peonycare.sg
            </Text>
            {' '}— we may be able to fix the issue without deleting.
          </Text>
        </View>
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

  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 16,
    marginBottom: 20,
  },

  title: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['2xl'],
    letterSpacing: -0.6,
    color: colors.textPrimary,
    textAlign: 'center',
  },

  desc: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['14'],
    lineHeight: 21,
    color: colors.textMuted,
    textAlign: 'center',
    paddingTop: 8,
    paddingHorizontal: spacing['2xl'],
    paddingBottom: 24,
  },

  dangerCard: {
    backgroundColor: colors.accentLight,
    borderRadius: radius.card,
    borderWidth: 1.5,
    borderColor: colors.accentLightBorder,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginHorizontal: 20,
  },

  dangerLabel: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['12'],
    lineHeight: 16.2,
    letterSpacing: 0.96,
    textTransform: 'uppercase',
    color: colors.dangerRed,
    marginBottom: 10,
  },

  bullet: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    lineHeight: 19.2,
    color: colors.textPrimary,
    marginBottom: 4,
  },

  bulletLast: {
    marginBottom: 0,
  },

  confirmSection: {
    paddingHorizontal: spacing['2xl'],
    marginTop: 24,
  },

  confirmLabel: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['12'],
    color: colors.textMuted,
    marginBottom: 8,
  },

  confirmInput: {
    height: 52,
    borderRadius: radius.input,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    paddingHorizontal: 16,
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['14'],
    letterSpacing: 0.28,
    color: colors.textPrimary,
  },

  confirmInputFocused: {
    borderColor: colors.dangerRed,
  },

  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.dangerRed,
    height: 54,
    borderRadius: radius.card,
    marginTop: 16,
    marginHorizontal: spacing['2xl'],
    gap: 8,
  },

  deleteBtnDisabled: {
    opacity: 0.5,
  },

  deleteBtnLabel: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['14'],
    letterSpacing: 0.28,
    color: colors.textInverse,
  },

  cancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: radius.card,
    marginTop: 10,
    marginHorizontal: spacing['2xl'],
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
  },

  cancelBtnLabel: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['14'],
    letterSpacing: 0.28,
    color: colors.textPrimary,
  },

  infoBox: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 24,
    marginHorizontal: 20,
    marginBottom: 32,
  },

  infoText: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    lineHeight: 18,
    color: colors.textMuted,
  },

  infoEmail: {
    fontFamily: fontFamilies.semiBold,
    color: colors.accentPrimary,
  },

  errorText: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    color: colors.dangerRed,
    textAlign: 'center',
    paddingHorizontal: spacing['2xl'],
    marginTop: spacing.lg,
  },
});
