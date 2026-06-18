import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, radius, fontSizes, fontWeights } from '../../constants/theme';
import { HomeStackParamList } from '../../navigation/ReceiverTabs';

type Props = {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'ScanError'>;
};

const REASONS = [
  {
    n: 1,
    label: 'Code expired',
    detail: 'Pickup windows close at the listed time.',
  },
  {
    n: 2,
    label: 'Wrong restaurant',
    detail: 'This claim belongs to a different partner.',
  },
  {
    n: 3,
    label: 'Bad lighting',
    detail: 'Move closer or turn on the flash and try again.',
  },
];

export default function ScanErrorScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="qr-code-outline" size={48} color={colors.accentPrimary} />
        </View>
        <Text style={styles.heading}>Can't read this QR</Text>
        <Text style={styles.body}>
          The code didn't match an active claim. A few things to check:
        </Text>

        <View style={styles.reasonsList}>
          {REASONS.map((r, i) => (
            <View key={r.n}>
              <View style={styles.reasonRow}>
                <View style={styles.reasonBadge}>
                  <Text style={styles.reasonBadgeText}>{r.n}</Text>
                </View>
                <View style={styles.reasonText}>
                  <Text style={styles.reasonLabel}>{r.label}</Text>
                  <Text style={styles.reasonDetail}>{r.detail}</Text>
                </View>
              </View>
              {i < REASONS.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('QrScanner')}
        >
          <Text style={styles.primaryBtnText}>Try again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.7}>
          <Text style={styles.secondaryBtnText}>Contact support</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },

  header: {
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
    gap: spacing.lg,
  },

  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: radius.pill,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },

  heading: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  body: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },

  reasonsList: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    overflow: 'hidden',
    marginTop: spacing.md,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.lg,
    gap: spacing.md,
  },
  divider: { height: 1, backgroundColor: colors.borderDefault },
  reasonBadge: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  reasonBadgeText: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold,
    color: colors.accentPrimary,
  },
  reasonText: { flex: 1, gap: spacing.xs },
  reasonLabel: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semiBold,
    color: colors.textPrimary,
  },
  reasonDetail: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },

  actions: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['2xl'],
    gap: spacing.sm,
  },
  primaryBtn: {
    backgroundColor: colors.accentPrimary,
    borderRadius: radius.card,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.textInverse,
  },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
});
