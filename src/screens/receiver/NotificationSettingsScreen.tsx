import React, { useState, useCallback, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { CustomSwitch } from '../../components/CustomSwitch';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  colors,
  spacing,
  radius,
  fontSizes,
  fontWeights,
  fontFamilies,
  letterSpacings,
} from '../../constants/theme';
import { ProfileStackParamList } from '../../navigation/ReceiverTabs';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'NotificationSettings'>;
};

type SettingRowProps = {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  showDivider?: boolean;
};

const SettingRow = memo(function SettingRow({
  icon,
  iconBg,
  title,
  subtitle,
  value,
  onValueChange,
  showDivider,
}: SettingRowProps) {
  return (
    <>
      <View style={styles.row}>
        <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>
          {icon}
        </View>
        <View style={styles.rowText}>
          <Text style={styles.rowTitle}>{title}</Text>
          <Text style={styles.rowSub}>{subtitle}</Text>
        </View>
        <CustomSwitch value={value} onValueChange={onValueChange} />
      </View>
      {showDivider && <View style={styles.divider} />}
    </>
  );
});

export default function NotificationSettingsScreen({ navigation }: Props) {
  const [pushEnabled,       setPushEnabled]       = useState(true);
  const [newFoodEnabled,    setNewFoodEnabled]    = useState(true);
  const [claimEnabled,      setClaimEnabled]      = useState(true);
  const [dailyLimitEnabled, setDailyLimitEnabled] = useState(true);

  const togglePush       = useCallback((v: boolean) => setPushEnabled(v),       []);
  const toggleNewFood    = useCallback((v: boolean) => setNewFoodEnabled(v),    []);
  const toggleClaim      = useCallback((v: boolean) => setClaimEnabled(v),      []);
  const toggleDailyLimit = useCallback((v: boolean) => setDailyLimitEnabled(v), []);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>

      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={8}>
        <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Hero */}
        <Text style={styles.eyebrow}>Stay in the loop</Text>
        <Text style={styles.title}>Notifications</Text>
        <Text style={styles.subtitle}>Choose which alerts reach you and when.</Text>

        {/* Push notifications section */}
        <Text style={styles.sectionLabel}>Push notifications</Text>

        <SettingRow
          icon={<Ionicons name="notifications" size={18} color={colors.accentPrimary} />}
          iconBg={colors.avatarBg}
          title="Enable push notifications"
          subtitle="Master toggle for all alerts"
          value={pushEnabled}
          onValueChange={togglePush}
        />

        {/* Food alerts section */}
        <Text style={[styles.sectionLabel, styles.sectionLabelGap]}>Food alerts</Text>

        <SettingRow
          icon={<MaterialCommunityIcons name="silverware-fork-knife" size={18} color={colors.textPrimary} />}
          iconBg={colors.surfaceSecondary}
          title="New food nearby"
          subtitle="Donations within your radius"
          value={newFoodEnabled}
          onValueChange={toggleNewFood}
          showDivider
        />
        <SettingRow
          icon={<Ionicons name="checkmark-circle" size={18} color={colors.textPrimary} />}
          iconBg={colors.surfaceSecondary}
          title="Claim confirmations"
          subtitle="Pickup details and reminders"
          value={claimEnabled}
          onValueChange={toggleClaim}
          showDivider
        />
        <SettingRow
          icon={<Ionicons name="refresh" size={18} color={colors.goldDark} />}
          iconBg={colors.goldLight}
          title="Daily limit reset"
          subtitle="When your claim limit resets"
          value={dailyLimitEnabled}
          onValueChange={toggleDailyLimit}
        />
      </ScrollView>

      {/* Save button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveBtn}
          activeOpacity={0.85}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="checkmark" size={18} color={colors.textInverse} />
          <Text style={styles.saveBtnText}>Save settings</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },

  backBtn: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    alignSelf: 'flex-start',
  },

  scroll: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['2xl'],
  },

  // ── Hero ─────────────────────────────────────────────────────────────────────
  eyebrow: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginBottom: 6,
  },
  title: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['2xl'],
    letterSpacing: letterSpacings.subheading,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['14'],
    color: colors.textMuted,
    marginTop: 8,
    marginBottom: spacing['2xl'],
  },

  // ── Section titles ────────────────────────────────────────────────────────────
  sectionLabel: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.lg,
    letterSpacing: -0.425,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  sectionLabelGap: {
    marginTop: spacing['2xl'],
  },

  // ── Setting row ───────────────────────────────────────────────────────────────
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rowText: { flex: 1 },
  rowTitle: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['14'],
    letterSpacing: -0.21,
    color: colors.textPrimary,
  },
  rowSub: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    color: colors.textMuted,
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: colors.borderDefault,
  },

  // ── Footer ────────────────────────────────────────────────────────────────────
  footer: {
    paddingHorizontal: 16,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.md,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentPrimary,
    borderRadius: radius.card,
    height: 52,
    gap: spacing.sm,
  },
  saveBtnText: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.md,
    letterSpacing: letterSpacings.button,
    color: colors.textInverse,
  },
});
