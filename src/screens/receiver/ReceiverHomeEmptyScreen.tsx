import { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DailyLimitStatus } from '../../types';
import {
  colors,
  spacing,
  radius,
  fontSizes,
  fontFamilies,
} from '../../constants/theme';

const STEPS = [
  {
    n: 1,
    title: 'Browse nearby meals',
    desc: 'Complimentary surplus food from restaurants around you — updated in real time.',
  },
  {
    n: 2,
    title: 'Claim one',
    desc: 'Reserve a portion. You have until the pickup window ends to collect it.',
  },
  {
    n: 3,
    title: 'Scan the QR at pickup',
    desc: 'Show the staff your app — scan their QR to confirm collection.',
  },
];

type Props = {
  firstName: string;
  unreadCount: number;
  dailyLimit: DailyLimitStatus | null;
  onNotificationsPress: () => void;
  onBrowseWithout: () => void;
};

function ReceiverHomeEmptyScreen({
  firstName,
  unreadCount,
  dailyLimit,
  onNotificationsPress,
  onBrowseWithout,
}: Props) {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.greeting}>Hi, {firstName} 👋</Text>
          <TouchableOpacity
            style={styles.bellButton}
            hitSlop={8}
            onPress={onNotificationsPress}
          >
            <Ionicons name="notifications" size={20} color={colors.textPrimary} />
            {unreadCount > 0 && <View style={styles.bellDot} />}
          </TouchableOpacity>
        </View>

        {/* Claims badge */}
        {dailyLimit && (
          <View style={styles.claimsBadge}>
            <Ionicons name="checkmark-circle" size={14} color={colors.successGreen} />
            <Text style={styles.claimsText}>
              Claims: {dailyLimit.used}/{dailyLimit.limit} today
            </Text>
          </View>
        )}

        {/* Empty state */}
        <View style={styles.emptySection}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons
              name="silverware-fork-knife"
              size={44}
              color={colors.accentPrimary}
            />
          </View>
          <Text style={styles.emptyTitle}>No meals near you yet</Text>
          <Text style={styles.emptyBody}>
            {"When restaurants nearby post surplus food, it'll show up here. Enable location to see the closest options first."}
          </Text>
        </View>

        {/* HOW PEONY CARE WORKS */}
        <View style={styles.stepsSection}>
          <Text style={styles.stepsLabel}>HOW PEONY CARE WORKS</Text>
          {STEPS.map((step, idx) => (
            <View key={step.n}>
              <View style={styles.stepRow}>
                <View style={styles.stepNumCircle}>
                  <Text style={styles.stepNumText}>{step.n}</Text>
                </View>
                <View style={styles.stepText}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDesc}>{step.desc}</Text>
                </View>
              </View>
              {idx < STEPS.length - 1 && <View style={styles.stepDivider} />}
            </View>
          ))}
        </View>

        {/* Enable location */}
        <TouchableOpacity
          style={styles.primaryBtn}
          activeOpacity={0.85}
          onPress={() => Linking.openSettings()}
        >
          <Ionicons name="locate" size={20} color={colors.textInverse} />
          <Text style={styles.primaryBtnText}>Enable location</Text>
        </TouchableOpacity>

        {/* Browse without location */}
        <TouchableOpacity
          style={styles.ghostBtn}
          activeOpacity={0.7}
          onPress={onBrowseWithout}
        >
          <Text style={styles.ghostBtnText}>Or browse without location →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

export default memo(ReceiverHomeEmptyScreen);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },

  scroll: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['4xl'],
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.lg,
  },
  greeting: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.xl,
    letterSpacing: -0.5,
    color: colors.textPrimary,
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.accentPrimary,
    borderWidth: 1,
    borderColor: colors.surfaceSecondary,
  },

  claimsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.successGreenLight,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
    gap: 4,
    marginTop: spacing.md,
  },
  claimsText: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['12'],
    color: colors.successGreen,
  },

  emptySection: {
    alignItems: 'center',
    marginTop: spacing['2xl'],
  },
  iconCircle: {
    width: 108,
    height: 108,
    borderRadius: radius.pill,
    backgroundColor: colors.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.lg,
    letterSpacing: -0.425,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  emptyBody: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['14'],
    lineHeight: 21,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 8,
    marginTop: 8,
  },

  stepsSection: {
    marginTop: spacing['2xl'],
  },
  stepsLabel: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.xs,
    letterSpacing: 0.88,
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
    paddingVertical: 14,
  },
  stepNumCircle: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepNumText: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['12'],
    color: colors.textPrimary,
  },
  stepText: { flex: 1 },
  stepTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['14'],
    lineHeight: 21,
    color: colors.textPrimary,
  },
  stepDesc: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    lineHeight: 16.8,
    color: colors.textMuted,
    marginTop: 2,
  },
  stepDivider: {
    height: 1,
    backgroundColor: colors.borderDefault,
  },

  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentPrimary,
    borderRadius: radius.pill,
    height: 52,
    gap: 8,
    marginTop: 22,
  },
  primaryBtnText: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['14'],
    letterSpacing: 0.28,
    color: colors.textInverse,
  },
  ghostBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginTop: 12,
  },
  ghostBtnText: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['12'],
    color: colors.accentPrimary,
    textAlign: 'center',
  },
});
