import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { setOnConfirm } from './RestaurantLocationScreen';
import { getRestaurantProfile, updateRestaurantProfile } from '../../services/restaurant';
import { RestaurantProfile } from '../../types';
import {
  colors, spacing, radius, fontSizes, fontFamilies, letterSpacings,
} from '../../constants/theme';
import { ProfileStackParamList } from '../../navigation/RestaurantTabs';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'EditRestaurantDetails'>;
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

// ─── Section header ───────────────────────────────────────────────────────────

type SectionHeaderProps = {
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
};

const SectionHeader = memo(({ iconName, label }: SectionHeaderProps) => (
  <View style={styles.sectionHeader}>
    <Ionicons name={iconName} size={14} color={colors.textMuted} />
    <Text style={styles.sectionLabel}>{label}</Text>
  </View>
));

// ─── Form field ───────────────────────────────────────────────────────────────

type FormFieldProps = {
  label: string;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  value: string;
  onChangeText?: (v: string) => void;
  editable?: boolean;
  multiline?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
  hint?: React.ReactNode;
  placeholder?: string;
};

const FormField = memo(({
  label, iconName, value, onChangeText, editable = true,
  multiline = false, keyboardType = 'default', hint, placeholder,
}: FormFieldProps) => {
  const [focused, setFocused] = useState(false);
  return (
    <View>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[
        styles.inputWrap,
        focused && editable && styles.inputFocused,
        !editable && styles.inputDisabled,
        multiline && styles.inputWrapMulti,
      ]}>
        <Ionicons
          name={iconName}
          size={18}
          color={editable ? colors.textMuted : colors.borderDefault}
          style={styles.inputIcon}
        />
        <TextInput
          style={[styles.inputText, multiline && styles.inputTextMulti]}
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
          textAlignVertical={multiline ? 'top' : 'center'}
          keyboardType={keyboardType}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>
      {hint}
    </View>
  );
});

// ─── Phone field ──────────────────────────────────────────────────────────────

const PhoneField = memo(({ value, onChangeText }: {
  value: string;
  onChangeText: (v: string) => void;
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <View>
      <Text style={styles.fieldLabel}>Phone number</Text>
      <View style={[styles.inputWrap, focused && styles.inputFocused]}>
        <Text style={styles.phoneFlag}>🇸🇬</Text>
        <Text style={styles.phonePrefix}>+65</Text>
        <View style={styles.phoneDivider} />
        <TextInput
          style={styles.phoneInputText}
          value={value}
          onChangeText={onChangeText}
          keyboardType="phone-pad"
          maxLength={8}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>
    </View>
  );
});

// ─── Time field ───────────────────────────────────────────────────────────────

const TimeField = memo(({ label, iconName, value, onChangeText }: {
  label: string;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  value: string;
  onChangeText: (v: string) => void;
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.timeFieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.inputWrap, focused && styles.inputFocused]}>
        <Ionicons name={iconName} size={16} color={colors.textMuted} style={styles.inputIcon} />
        <TextInput
          style={[styles.inputText, styles.timeInputText]}
          value={value}
          onChangeText={onChangeText}
          keyboardType="numeric"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <Ionicons name="time-outline" size={18} color={colors.textMuted} style={styles.clockIcon} />
      </View>
    </View>
  );
});

// ─── Day chip ─────────────────────────────────────────────────────────────────

const DayChip = memo(({ day, selected, onPress }: {
  day: string;
  selected: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[styles.dayChip, selected ? styles.dayChipActive : styles.dayChipInactive]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={[styles.dayChipText, selected ? styles.dayChipTextActive : styles.dayChipTextInactive]}>
      {day}
    </Text>
  </TouchableOpacity>
));

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function EditRestaurantDetailsScreen({ navigation }: Props) {
  const [profile, setProfile]   = useState<RestaurantProfile | null>(null);
  const [name, setName]         = useState('');
  const [cuisine, setCuisine]   = useState('');
  const [address, setAddress]   = useState('');
  const [lat, setLat]           = useState(0);
  const [lng, setLng]           = useState(0);
  const [phone, setPhone]       = useState('');
  const [email, setEmail]       = useState('');
  const [opensAt, setOpensAt]   = useState('10:00');
  const [closesAt, setClosesAt] = useState('21:00');
  const [openDays, setOpenDays] = useState<Set<string>>(new Set(DAYS));
  const [about, setAbout]       = useState('');

  useEffect(() => {
    getRestaurantProfile()
      .then((p) => {
        setProfile(p);
        setName(p.name);
        setCuisine(p.cuisineType ?? '');
        setAddress(p.address);
        setLat(p.latitude);
        setLng(p.longitude);
        setPhone(p.contactPhone.replace('+65', '').trim());
        setEmail(p.contactEmail);
        setOpensAt(p.opensAt ?? '10:00');
        setClosesAt(p.closesAt ?? '21:00');
        if (p.openDays && p.openDays.length > 0) setOpenDays(new Set(p.openDays));
        setAbout(p.about);
      })
      .catch(() => {});
  }, []);

  const toggleDay = useCallback((day: string) => {
    setOpenDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  }, []);

  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    try {
      const openingHours = [
        `${opensAt}–${closesAt}`,
        Array.from(openDays).join(', '),
      ].filter(Boolean).join(' · ');

      await updateRestaurantProfile({
        name,
        address,
        latitude:     lat || undefined,
        longitude:    lng || undefined,
        contactPhone: phone ? `+65${phone}` : undefined,
        contactEmail: email || undefined,
        openingHours,
        about,
      });
      navigation.goBack();
    } catch {
      // API error — stay on screen, user can retry
    } finally {
      setSaving(false);
    }
  }, [saving, name, address, lat, lng, phone, email, opensAt, closesAt, openDays, about, navigation]);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAwareScrollView
        style={styles.flex}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        extraScrollHeight={20}
        >

          {/* Hero image + change photo */}
          <View style={styles.heroWrap}>
            {profile?.photoUrl ? (
              <Image
                source={{ uri: profile.photoUrl }}
                style={styles.heroImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.heroImage, styles.heroPlaceholder]} />
            )}
            <TouchableOpacity style={styles.changePhotoBtn} activeOpacity={0.8}>
              <Ionicons name="camera" size={14} color={colors.textPrimary} />
              <Text style={styles.changePhotoText}>Change photo</Text>
            </TouchableOpacity>
          </View>

          {/* Identity */}
          <View style={styles.identityBlock}>
            <View style={styles.nameRow}>
              <Text style={styles.idName} numberOfLines={1}>{name || (profile?.name ?? '')}</Text>
              <Ionicons name="checkmark-circle" size={18} color={colors.accentPrimary} />
            </View>
            <View style={styles.idSubRow}>
              <Ionicons name="eye" size={13} color={colors.textMuted} />
              <Text style={styles.idSub}>Shown to donors and receivers</Text>
            </View>
          </View>

          {/* BUSINESS */}
          <SectionHeader iconName="apps" label="BUSINESS" />
          <View style={styles.section}>
            <FormField
              label="Restaurant name"
              iconName="storefront"
              value={name}
              onChangeText={setName}
            />
            <FormField
              label="Cuisine"
              iconName="restaurant"
              value={cuisine}
              onChangeText={setCuisine}
              placeholder="e.g. Hainanese · Chinese"
            />
            <FormField
              label="UEN (business registration)"
              iconName="id-card"
              value={profile?.uen ?? ''}
              editable={false}
              hint={
                <View style={styles.uenHintRow}>
                  <Ionicons name="checkmark-circle" size={13} color={colors.successGreen} />
                  <Text style={styles.hintText}>
                    {'Verified with ACRA. '}
                    <Text style={styles.hintLink}>Contact support</Text>
                    {' to change.'}
                  </Text>
                </View>
              }
            />
          </View>

          {/* LOCATION */}
          <SectionHeader iconName="location" label="LOCATION" />
          <View style={styles.section}>
            <FormField
              label="Address"
              iconName="location"
              value={address}
              onChangeText={setAddress}
            />
            <TouchableOpacity
              style={styles.mapLink}
              activeOpacity={0.7}
              onPress={() => {
                setOnConfirm((result) => {
                  setLat(result.latitude);
                  setLng(result.longitude);
                  setAddress(result.address);
                });
                navigation.navigate('RestaurantLocation', {
                  latitude: lat || 1.3521,
                  longitude: lng || 103.8198,
                  address,
                });
              }}
            >
              <Ionicons name="map" size={13} color={colors.accentPrimary} />
              <Text style={styles.mapLinkText}>Set exact pin on map</Text>
            </TouchableOpacity>
          </View>

          {/* CONTACT */}
          <SectionHeader iconName="at" label="CONTACT" />
          <View style={styles.section}>
            <PhoneField value={phone} onChangeText={setPhone} />
            <FormField
              label="Contact email"
              iconName="mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
          </View>

          {/* OPENING HOURS */}
          <SectionHeader iconName="time" label="OPENING HOURS" />
          <View style={styles.section}>
            <View style={styles.timeRow}>
              <TimeField label="Opens"  iconName="sunny"  value={opensAt}  onChangeText={setOpensAt} />
              <TimeField label="Closes" iconName="moon"   value={closesAt} onChangeText={setClosesAt} />
            </View>
            <View style={styles.daysRow}>
              {DAYS.map((day) => (
                <DayChip
                  key={day}
                  day={day}
                  selected={openDays.has(day)}
                  onPress={() => toggleDay(day)}
                />
              ))}
            </View>
            <Text style={styles.daysHint}>Open daily · tap a day to close it</Text>
          </View>

          {/* ABOUT */}
          <SectionHeader iconName="reorder-three" label="ABOUT" />
          <View style={styles.section}>
            <FormField
              label="Short description"
              iconName="document-text"
              value={about}
              onChangeText={setAbout}
              multiline
            />
            <Text style={styles.hintText}>Shown on your public listing.</Text>
          </View>

          <View style={styles.bottomPad} />
      </KeyboardAwareScrollView>

      {/* Save button */}
      <SafeAreaView edges={['bottom']} style={styles.saveWrap}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85} disabled={saving}>
          <Ionicons name="checkmark" size={18} color={colors.textInverse} />
          <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save changes'}</Text>
        </TouchableOpacity>
      </SafeAreaView>

    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  flex:   { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['16'],
    color: colors.textPrimary,
    letterSpacing: -0.24,
  },
  headerSpacer: { width: 22 },

  scrollContent: { paddingBottom: spacing['2xl'] },

  // Hero
  heroWrap: { position: 'relative' },
  heroImage: {
    width: '100%',
    height: 180,
    backgroundColor: colors.borderDefault,
  },
  heroPlaceholder: { backgroundColor: colors.surfaceSecondary },
  changePhotoBtn: {
    position: 'absolute',
    top: 12,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 34,
    paddingHorizontal: 13,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.95)',
    zIndex: 2,
  },
  changePhotoText: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['12'],
    color: colors.textPrimary,
  },

  // Identity
  identityBlock: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  idName: {
    flex: 1,
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.lg,
    color: colors.textPrimary,
    letterSpacing: -0.255,
  },
  idSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 3,
  },
  idSub: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    color: colors.textMuted,
    includeFontPadding: false,
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingTop: spacing['2xl'],
    paddingHorizontal: spacing['2xl'],
    paddingBottom: 12,
  },
  sectionLabel: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    letterSpacing: 0.88,
    textTransform: 'uppercase',
  },

  // Section content
  section: {
    paddingHorizontal: spacing['2xl'],
    gap: spacing.lg,
  },

  // Field label
  fieldLabel: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['12'],
    color: colors.textMuted,
    marginBottom: 8,
  },

  // Input
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: radius.input,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  inputWrapMulti: {
    height: undefined,
    minHeight: 100,
    alignItems: 'flex-start',
    paddingTop: 14,
    paddingBottom: 14,
  },
  inputFocused:  { borderColor: colors.accentPrimary },
  inputDisabled: { backgroundColor: colors.surfaceSecondary },
  inputIcon:     { marginLeft: 14, marginRight: 8 },
  inputText: {
    flex: 1,
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['14'],
    color: colors.textPrimary,
    paddingRight: 16,
    includeFontPadding: false,
  },
  inputTextMulti: { textAlignVertical: 'top' },

  // UEN hint
  uenHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 7,
  },
  hintText: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    color: colors.textMuted,
    includeFontPadding: false,
  },
  hintLink: {
    fontFamily: fontFamilies.semiBold,
    color: colors.accentPrimary,
  },

  // Map link
  mapLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  mapLinkText: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['12'],
    color: colors.accentPrimary,
    includeFontPadding: false,
  },

  // Phone field
  phoneFlag: {
    fontSize: fontSizes['14'],
    marginLeft: 14,
  },
  phonePrefix: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['14'],
    color: colors.textPrimary,
    marginLeft: 6,
    includeFontPadding: false,
  },
  phoneDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.borderDefault,
    marginHorizontal: 12,
  },
  phoneInputText: {
    flex: 1,
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['14'],
    color: colors.textPrimary,
    paddingRight: 16,
    includeFontPadding: false,
  },

  // Time row
  timeRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  timeFieldWrap: { flex: 1 },
  timeInputText: { flex: 1 },
  clockIcon: { marginRight: 12 },

  // Day chips
  daysRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dayChip: {
    flex: 1,
    height: 42,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayChipActive:   { backgroundColor: colors.accentLight, borderColor: colors.accentPrimary },
  dayChipInactive: { backgroundColor: colors.surface,     borderColor: colors.borderDefault },
  dayChipText: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.xs,
    textAlign: 'center',
    includeFontPadding: false,
  },
  dayChipTextActive:   { color: colors.accentPrimary },
  dayChipTextInactive: { color: colors.textMuted },

  daysHint: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    color: colors.textMuted,
    includeFontPadding: false,
  },

  // Save
  saveWrap: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderDefault,
    backgroundColor: colors.surface,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 54,
    borderRadius: radius.card,
    backgroundColor: colors.accentPrimary,
    shadowColor: colors.accentPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.27,
    shadowRadius: 17,
    elevation: 6,
  },
  saveBtnText: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.md,
    color: colors.textInverse,
    letterSpacing: letterSpacings.button,
  },

  bottomPad: { height: spacing['2xl'] },
});
