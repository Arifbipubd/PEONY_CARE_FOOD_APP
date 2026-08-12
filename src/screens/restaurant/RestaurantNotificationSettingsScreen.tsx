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
import { ProfileStackParamList } from '../../navigation/RestaurantTabs';
import {
  getNotificationSettings,
  updateNotificationSettings,
  getRestaurantProfile,
} from '../../services/restaurant';
import { logApiCatch } from '../../services/api';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'RestaurantNotificationSettings'>;
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
      {showDivider ? <View style={styles.divider} /> : null}
    </>
  );
});

export default function RestaurantNotificationSettingsScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contactEmail, setContactEmail] = useState('');

  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [alertNewClaim, setAlertNewClaim] = useState(true);
  const [alertSponsored, setAlertSponsored] = useState(true);
  const [alertAllClaimed, setAlertAllClaimed] = useState(true);
  const [alertWindowExpiring, setAlertWindowExpiring] = useState(true);
  const [alertNoShow, setAlertNoShow] = useState(false);
  // API-only fields — loaded and sent back, no UI
  const [alertDonationClaimed, setAlertDonationClaimed] = useState(true);
  const [alertReceipts, setAlertReceipts] = useState(true);

  useEffect(() => {
    Promise.all([getNotificationSettings(), getRestaurantProfile()])
      .then(([s, profile]) => {
        setPushEnabled(s.pushEnabled);
        setEmailEnabled(s.emailEnabled);
        setAlertNewClaim(s.alertNewClaim);
        setAlertSponsored(s.alertSponsored);
        setAlertAllClaimed(s.alertAllClaimed);
        setAlertWindowExpiring(s.alertWindowExpiring);
        setAlertNoShow(s.alertNoShow);
        setAlertDonationClaimed(s.alertDonationClaimed);
        setAlertReceipts(s.alertReceipts);
        setContactEmail(profile.contactEmail);
      })
      .catch((err) => {
        logApiCatch('getRestaurantNotificationSettings', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const togglePush = useCallback((v: boolean) => setPushEnabled(v), []);
  const toggleEmail = useCallback((v: boolean) => setEmailEnabled(v), []);
  const toggleNewClaim = useCallback((v: boolean) => setAlertNewClaim(v), []);
  const toggleSponsored = useCallback((v: boolean) => setAlertSponsored(v), []);
  const toggleAllClaimed = useCallback((v: boolean) => setAlertAllClaimed(v), []);
  const toggleWindowExpiring = useCallback((v: boolean) => setAlertWindowExpiring(v), []);
  const toggleNoShow = useCallback((v: boolean) => setAlertNoShow(v), []);

  const handleSave = useCallback(() => {
    if (saving) return;
    setSaving(true);
    updateNotificationSettings({
      pushEnabled,
      emailEnabled,
      alertNewClaim,
      alertSponsored,
      alertAllClaimed,
      alertWindowExpiring,
      alertNoShow,
      alertDonationClaimed,
      alertReceipts,
    })
      .then(() => navigation.goBack())
      .catch((err) => {
        logApiCatch('updateRestaurantNotificationSettings', err);
        Alert.alert('Couldn’t save', 'Please check your connection and try again.');
        setSaving(false);
      });
  }, [
    saving,
    pushEnabled,
    emailEnabled,
    alertNewClaim,
    alertSponsored,
    alertAllClaimed,
    alertWindowExpiring,
    alertNoShow,
    alertDonationClaimed,
    alertReceipts,
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

        <Text style={[styles.sectionLabel, styles.sectionLabelGap]}>Listing alerts</Text>

        <SettingRow
          icon={<Ionicons name="person" size={18} color={colors.accentPrimary} />}
          iconBg={colors.avatarBg}
          title="New claim on your listing"
          subtitle="When a receiver claims food you posted"
          value={alertNewClaim}
          onValueChange={toggleNewClaim}
          showDivider
          disabled={!pushEnabled}
        />
        <SettingRow
          icon={<MaterialCommunityIcons name="hand-heart" size={18} color={colors.goldDark} />}
          iconBg={colors.goldLight}
          title="Sponsored donation received"
          subtitle="A donor paid for a meal — prep needed"
          value={alertSponsored}
          onValueChange={toggleSponsored}
          showDivider
          disabled={!pushEnabled}
        />
        <SettingRow
          icon={<Ionicons name="checkmark" size={18} color={colors.textPrimary} />}
          iconBg={colors.surfaceSecondary}
          title="All portions claimed"
          subtitle="When a listing is fully claimed"
          value={alertAllClaimed}
          onValueChange={toggleAllClaimed}
          showDivider
          disabled={!pushEnabled}
        />
        <SettingRow
          icon={<Ionicons name="time-outline" size={18} color={colors.textPrimary} />}
          iconBg={colors.surfaceSecondary}
          title="Pickup window expiring"
          subtitle="30 minutes before window closes"
          value={alertWindowExpiring}
          onValueChange={toggleWindowExpiring}
          showDivider
          disabled={!pushEnabled}
        />
        <SettingRow
          icon={<Ionicons name="hourglass-outline" size={18} color={colors.textMuted} />}
          iconBg={colors.surfaceSecondary}
          title="No-show after window"
          subtitle="When a receiver doesn't collect in time"
          value={alertNoShow}
          onValueChange={toggleNoShow}
          disabled={!pushEnabled}
        />

        <Text style={[styles.sectionLabel, styles.sectionLabelGap]}>Delivery channels</Text>

        <SettingRow
          icon={<Ionicons name="mail" size={18} color={colors.sliderBlue} />}
          iconBg={colors.surfaceSecondary}
          title="Email"
          subtitle={contactEmail || 'No email on file'}
          value={emailEnabled}
          onValueChange={toggleEmail}
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
