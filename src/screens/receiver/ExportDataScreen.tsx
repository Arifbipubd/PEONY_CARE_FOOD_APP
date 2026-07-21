import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { ProfileStackParamList } from '../../navigation/ReceiverTabs';
import { api } from '../../services/api';
import {
  colors, spacing, fontSizes, fontFamilies, radius,
} from '../../constants/theme';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'ExportData'>;
};

const EXPORT_ITEMS = [
  'Profile: name, mobile number, photo',
  'Claim and pickup history',
  'Notification preferences',
  'Saved locations and search radius',
] as const;

export default function ExportDataScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleRequest = useCallback(async () => {
    if (loading || submitted) return;
    setLoading(true);
    setError('');
    try {
      await api.post('/receiver/account/data-export/');
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not submit request. Try again.');
    } finally {
      setLoading(false);
    }
  }, [loading, submitted]);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.heroIcon}>
          <Ionicons name="download" size={28} color={colors.accentPrimary} />
        </View>

        <Text style={styles.title}>Download my data</Text>

        <Text style={styles.desc}>
          Get a copy of everything Peony Care holds about you, as required by Singapore's PDPA.
        </Text>

        <View style={styles.exportSection}>
          <Text style={styles.exportLabel}>YOUR EXPORT INCLUDES</Text>
          {EXPORT_ITEMS.map((item, i) => (
            <Text
              key={item}
              style={[styles.bullet, i === EXPORT_ITEMS.length - 1 && styles.bulletLast]}
            >
              {'• ' + item}
            </Text>
          ))}
        </View>

        <View style={styles.deliverRow}>
          <Ionicons name="mail" size={22} color={colors.accentPrimary} />
          <View style={styles.deliverText}>
            <Text style={styles.deliverTitle}>Sent to your email</Text>
            <Text style={styles.deliverSub}>
              We'll send a secure download link within 48 hours.
            </Text>
          </View>
        </View>

        {!!error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        {submitted ? (
          <View style={styles.successBox}>
            <Ionicons name="checkmark-circle" size={20} color={colors.successGreen} />
            <Text style={styles.successText}>
              Request submitted — you'll receive a download link within 48 hours.
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.requestBtn, loading && styles.requestBtnDisabled]}
            activeOpacity={0.85}
            onPress={handleRequest}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.textInverse} />
            ) : (
              <>
                <Ionicons name="download-outline" size={16} color={colors.textInverse} />
                <Text style={styles.requestBtnLabel}>Request my data</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.cancelBtn}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelBtnLabel}>{submitted ? 'Done' : 'Cancel'}</Text>
        </TouchableOpacity>
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
    backgroundColor: colors.avatarBg,
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
    textAlign: 'left',
    paddingTop: 8,
    paddingHorizontal: spacing['2xl'],
    paddingBottom: 24,
  },

  exportSection: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: 16,
    paddingBottom: 16,
  },

  exportLabel: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['12'],
    lineHeight: 16.2,
    letterSpacing: 0.96,
    textTransform: 'uppercase',
    color: colors.textMuted,
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

  deliverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    borderRadius: radius.input,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 20,
    marginHorizontal: spacing['2xl'],
  },

  deliverText: { flex: 1 },

  deliverTitle: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['14'],
    lineHeight: 21,
    color: colors.textPrimary,
  },

  deliverSub: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    lineHeight: 18,
    color: colors.textMuted,
    marginTop: 2,
  },

  requestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentPrimary,
    height: 54,
    borderRadius: radius.card,
    marginTop: 24,
    marginHorizontal: spacing['2xl'],
    gap: 8,
  },

  requestBtnLabel: {
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
    marginBottom: 32,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
  },

  cancelBtnLabel: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['14'],
    letterSpacing: 0.28,
    color: colors.textPrimary,
  },

  requestBtnDisabled: { opacity: 0.6 },

  errorText: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    color: colors.dangerRed,
    textAlign: 'center',
    paddingHorizontal: spacing['2xl'],
    marginTop: spacing.lg,
  },

  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.successGreenLight,
    borderRadius: radius.input,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 24,
    marginHorizontal: spacing['2xl'],
  },

  successText: {
    flex: 1,
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    lineHeight: 18,
    color: colors.successGreen,
  },
});
