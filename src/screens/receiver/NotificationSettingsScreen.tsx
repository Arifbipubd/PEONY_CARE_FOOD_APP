import React, { useState, useCallback, useEffect, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
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
  fontFamilies,
  letterSpacings,
} from '../../constants/theme';
import { ProfileStackParamList } from '../../navigation/ReceiverTabs';
import {
  getNotificationSettings,
  updateNotificationSettings,
} from '../../services/receiver';
import { logApiCatch } from '../../services/api';

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
  disabled?: boolean;
};

const SettingRow = memo(function SettingRow({
  icon,
  iconBg,
  title,
  subtitle,
  value,
  onValueChange,
  showDivider,
  disabled,
}: SettingRowProps) {
  return (
    <>
      <View style={[styles.row, disabled && styles.rowDisabled]}>
        <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>
          {icon}
        </View>
        <View style={styles.rowText}>
          <Text style={styles.rowTitle}>{title}</Text>
          <Text style={styles.rowSub}>{subtitle}</Text>
        </View>
        <CustomSwitch
          value={value}
          onValueChange={onValueChange}
          disabled={disabled}
        />
      </View>
      {showDivider && <View style={styles.divider} />}
    </>
  );
});

export default function NotificationSettingsScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [pushEnabled, setPushEnabled] = useState(true);
  const [newFoodEnabled, setNewFoodEnabled] = useState(true);
  const [claimEnabled, setClaimEnabled] = useState(true);
  const [dailyLimitEnabled, setDailyLimitEnabled] = useState(true);

  useEffect(() => {
    getNotificationSettings()
      .then((s) => {
        setPushEnabled(s.pushEnabled);
        setNewFoodEnabled(s.alertNewFoodNearby);
        setClaimEnabled(s.alertClaimConfirmations);
        setDailyLimitEnabled(s.alertDailyLimitReset);
      })
      .catch((err) => {
        logApiCatch('getNotificationSettings', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const togglePush = useCallback((v: boolean) => setPushEnabled(v), []);
  const toggleNewFood = useCallback((v: boolean) => setNewFoodEnabled(v), []);
  const toggleClaim = useCallback((v: boolean) => setClaimEnabled(v), []);
  const toggleDailyLimit = useCallback((v: boolean) => setDailyLimitEnabled(v), []);

  const handleSave = useCallback(() => {
    if (saving) return;
    setSaving(true);
    updateNotificationSettings({
      pushEnabled,
      alertNewFoodNearby: newFoodEnabled,
      alertClaimConfirmations: claimEnabled,
      alertDailyLimitReset: dailyLimitEnabled,
    })
      .then(() => navigation.goBack())
      .catch((err) => {
        logApiCatch('updateNotificationSettings', err);
        Alert.alert('Couldn’t save', 'Please check your connection and try again.');
        setSaving(false);
      });
  }, [
    saving,
    pushEnabled,
    newFoodEnabled,
    claimEnabled,
    dailyLimitEnabled,
    navigation,
  ]);

  if (loading) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.accentPrimary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>

      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={8}>
        <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <Text style={styles.eyebrow}>Stay in the loop</Text>
        <Text style={styles.title}>Notifications</Text>
        <Text style={styles.subtitle}>Choose which alerts reach you and when.</Text>

        <Text style={styles.sectionLabel}>Push notifications</Text>

        <SettingRow
          icon={<Ionicons name="notifications" size={18} color={colors.accentPrimary} />}
          iconBg={colors.avatarBg}
          title="Enable push notifications"
          subtitle="Master toggle for all alerts"
          value={pushEnabled}
          onValueChange={togglePush}
        />

        <Text style={[styles.sectionLabel, styles.sectionLabelGap]}>Food alerts</Text>

        <SettingRow
          icon={<MaterialCommunityIcons name="silverware-fork-knife" size={18} color={colors.textPrimary} />}
          iconBg={colors.surfaceSecondary}
          title="New food nearby"
          subtitle="Donations within your radius"
          value={newFoodEnabled}
          onValueChange={toggleNewFood}
          showDivider
          disabled={!pushEnabled}
        />
        <SettingRow
          icon={<Ionicons name="checkmark-circle" size={18} color={colors.textPrimary} />}
          iconBg={colors.surfaceSecondary}
          title="Claim confirmations"
          subtitle="Pickup details and reminders"
          value={claimEnabled}
          onValueChange={toggleClaim}
          showDivider
          disabled={!pushEnabled}
        />
        <SettingRow
          icon={<Ionicons name="refresh" size={18} color={colors.goldDark} />}
          iconBg={colors.goldLight}
          title="Daily limit reset"
          subtitle="When your claim limit resets"
          value={dailyLimitEnabled}
          onValueChange={toggleDailyLimit}
          disabled={!pushEnabled}
        />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          activeOpacity={0.85}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={colors.textInverse} />
          ) : (
            <Ionicons name="checkmark" size={18} color={colors.textInverse} />
          )}
          <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save settings'}</Text>
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

  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scroll: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['2xl'],
  },

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

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
  rowDisabled: {
    opacity: 0.45,
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

  footer: {
    paddingHorizontal: 16,
    paddingTop: spacing.sm,
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
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.md,
    letterSpacing: letterSpacings.button,
    color: colors.textInverse,
  },
});
