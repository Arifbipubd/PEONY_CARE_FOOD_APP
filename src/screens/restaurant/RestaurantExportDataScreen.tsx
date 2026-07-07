import { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { ProfileStackParamList } from '../../navigation/RestaurantTabs';
import {
  colors, spacing, fontSizes, fontFamilies, radius,
} from '../../constants/theme';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'RestaurantExportData'>;
};

const EXPORT_ITEMS = [
  'Business profile: name, UEN, address, hours',
  'Contact details: name, email, mobile',
  'Donation and claim history',
  'Sponsored-order and payout records',
  'Analytics data',
] as const;

export default function RestaurantExportDataScreen({ navigation }: Props) {
  const handleRequest = useCallback(() => {
    // TODO: wire to POST /restaurant/account/export/
    navigation.goBack();
  }, [navigation]);

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
          Get a copy of everything Peony Care holds about your business, as required by Singapore's PDPA.
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
            <Text style={styles.deliverTitle}>Sent to your business email</Text>
            <Text style={styles.deliverSub}>
              We'll send a secure download link within 48 hours.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.requestBtn}
          activeOpacity={0.85}
          onPress={handleRequest}
        >
          <Ionicons name="download-outline" size={16} color={colors.textInverse} />
          <Text style={styles.requestBtnLabel}>Request my data</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelBtn}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelBtnLabel}>Cancel</Text>
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

  bulletLast: { marginBottom: 0 },

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
});
