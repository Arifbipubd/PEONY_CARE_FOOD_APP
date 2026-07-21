import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Pressable,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { setOnConfirm } from './RestaurantLocationScreen';
import { getRestaurantProfile, updateRestaurantProfile, uploadRestaurantProfilePhoto } from '../../services/restaurant';
import { RestaurantProfile } from '../../types';
import {
  colors, spacing, radius, fontSizes, fontFamilies, letterSpacings,
} from '../../constants/theme';
import { ProfileStackParamList } from '../../navigation/RestaurantTabs';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'EditRestaurantDetails'>;
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

const TIME_SLOTS: string[] = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? '00' : '30';
  return `${String(h).padStart(2, '0')}:${m}`;
});

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
        {!multiline && (
          <Ionicons
            name={iconName}
            size={18}
            color={editable ? colors.textMuted : colors.borderDefault}
            style={styles.inputIcon}
          />
        )}
        <TextInput
          style={[styles.inputText, multiline && styles.inputTextMulti, multiline && styles.inputTextMultiPad]}
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

const COUNTRIES = [
  { flag: '🇸🇬', name: 'Singapore', code: '+65' },
  { flag: '🇧🇩', name: 'Bangladesh', code: '+880' },
] as const;

type Country = typeof COUNTRIES[number];

const PhoneField = memo(({ localNumber, countryCode, onChangeNumber, onChangeCode }: {
  localNumber: string;
  countryCode: string;
  onChangeNumber: (v: string) => void;
  onChangeCode: (c: string) => void;
}) => {
  const [focused, setFocused] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const selected = COUNTRIES.find((c) => c.code === countryCode) ?? COUNTRIES[0];

  const handleSelect = useCallback((c: Country) => {
    onChangeCode(c.code);
    setPickerOpen(false);
  }, [onChangeCode]);

  return (
    <View>
      <Text style={styles.fieldLabel}>Phone number</Text>
      <View style={[styles.inputWrap, focused && styles.inputFocused]}>
        <TouchableOpacity
          style={styles.countryBtn}
          activeOpacity={0.7}
          onPress={() => setPickerOpen(true)}
        >
          <Text style={styles.countryFlag}>{selected.flag}</Text>
          <Text style={styles.countryCode}>{selected.code}</Text>
          <Ionicons name="chevron-down" size={14} color={colors.textMuted} />
        </TouchableOpacity>
        <View style={styles.phoneDivider} />
        <TextInput
          style={styles.phoneInputText}
          value={localNumber}
          onChangeText={onChangeNumber}
          keyboardType="phone-pad"
          placeholder="XXXXXXXXXX"
          placeholderTextColor={colors.textMuted}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>

      <Modal
        visible={pickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerOpen(false)}
      >
        <Pressable style={styles.pickerOverlay} onPress={() => setPickerOpen(false)}>
          <View style={styles.pickerSheet}>
            <Text style={styles.pickerTitle}>Select country</Text>
            <FlatList
              data={COUNTRIES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.pickerRow,
                    item.code === countryCode && styles.pickerRowActive,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={styles.pickerFlag}>{item.flag}</Text>
                  <Text style={styles.pickerName}>{item.name}</Text>
                  <Text style={styles.pickerCode}>{item.code}</Text>
                  {item.code === countryCode && (
                    <Ionicons name="checkmark" size={18} color={colors.accentPrimary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
});

// ─── Time picker button ───────────────────────────────────────────────────────

const TimePickerBtn = memo(({ label, iconName, value, onPress }: {
  label: string;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  value: string;
  onPress: () => void;
}) => (
  <View style={styles.timeFieldWrap}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TouchableOpacity style={styles.inputWrap} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name={iconName} size={16} color={colors.textMuted} style={styles.inputIcon} />
      <Text style={[styles.inputText, styles.timePickerText, !value && styles.timePlaceholder]}>
        {value || '--:--'}
      </Text>
      <Ionicons name="time" size={18} color={colors.textMuted} style={styles.clockIcon} />
    </TouchableOpacity>
  </View>
));

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
  const [profile, setProfile]       = useState<RestaurantProfile | null>(null);
  const [name, setName]             = useState('');
  const [cuisine, setCuisine]       = useState('');
  const [address, setAddress]       = useState('');
  const [lat, setLat]               = useState(0);
  const [lng, setLng]               = useState(0);
  const [countryCode, setCountryCode] = useState('+65');
  const [phone, setPhone]           = useState('');
  const [email, setEmail]           = useState('');
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
        const full = p.contactPhone ?? '';
        if (full.startsWith('+880')) {
          setCountryCode('+880');
          setPhone(full.slice(4));
        } else if (full.startsWith('+65')) {
          setCountryCode('+65');
          setPhone(full.slice(3));
        } else {
          setCountryCode('+65');
          setPhone(full.replace(/^\+\d+/, ''));
        }
        setEmail(p.contactEmail);
        setOpensAt(p.opensAt?.slice(0, 5) ?? '10:00');
        setClosesAt(p.closesAt?.slice(0, 5) ?? '21:00');
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

  const [showTimeModal, setShowTimeModal] = useState(false);
  const [timeTarget,    setTimeTarget]    = useState<'opens' | 'closes'>('opens');
  const timeListRef = useRef<FlatList>(null);

  const openTimePicker = useCallback((target: 'opens' | 'closes') => {
    setTimeTarget(target);
    setShowTimeModal(true);
    const current = target === 'opens' ? opensAt : closesAt;
    const idx = TIME_SLOTS.findIndex((s) => s === current);
    if (idx >= 0) {
      setTimeout(() => {
        timeListRef.current?.scrollToIndex({ index: idx, animated: false });
      }, 50);
    }
  }, [opensAt, closesAt]);

  const selectTime = useCallback((time: string) => {
    if (timeTarget === 'opens') setOpensAt(time);
    else setClosesAt(time);
    setShowTimeModal(false);
  }, [timeTarget]);

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handleChangePhoto = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    setPhotoPreview(asset.uri);
    try {
      const newUrl = await uploadRestaurantProfilePhoto(asset.uri);
      setProfile((prev) => (prev ? { ...prev, photoUrl: newUrl } : prev));
      setPhotoPreview(null);
    } catch {
      setPhotoPreview(null);
    }
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
        cuisineType:  cuisine || undefined,
        address,
        latitude:     lat || undefined,
        longitude:    lng || undefined,
        contactPhone: phone ? `${countryCode}${phone}` : undefined,
        contactEmail: email || undefined,
        opensAt,
        closesAt,
        openDays:     Array.from(openDays),
        openingHours,
        about,
      });
      navigation.goBack();
    } catch {
      // API error — stay on screen, user can retry
    } finally {
      setSaving(false);
    }
  }, [saving, name, address, lat, lng, countryCode, phone, email, opensAt, closesAt, openDays, about, navigation]);

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
            {(photoPreview ?? profile?.photoUrl) ? (
              <Image
                source={{ uri: photoPreview ?? profile!.photoUrl! }}
                style={styles.heroImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.heroImage, styles.heroPlaceholder]} />
            )}
            <TouchableOpacity style={styles.changePhotoBtn} activeOpacity={0.8} onPress={handleChangePhoto}>
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
            <PhoneField
              localNumber={phone}
              countryCode={countryCode}
              onChangeNumber={setPhone}
              onChangeCode={setCountryCode}
            />
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
              <TimePickerBtn label="Opens"  iconName="sunny" value={opensAt}  onPress={() => openTimePicker('opens')} />
              <TimePickerBtn label="Closes" iconName="moon"  value={closesAt} onPress={() => openTimePicker('closes')} />
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
              placeholder="Tell customers about your restaurant, cuisine, and what makes it special…"
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

      {/* Time picker modal */}
      <Modal
        visible={showTimeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTimeModal(false)}
      >
        <View style={styles.timeOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowTimeModal(false)} />
          <View style={styles.timeSheet}>
            <Text style={styles.timeSheetTitle}>
              {timeTarget === 'opens' ? 'Opens at' : 'Closes at'}
            </Text>
            <FlatList
              ref={timeListRef}
              data={TIME_SLOTS}
              keyExtractor={(item) => item}
              style={styles.timeList}
              showsVerticalScrollIndicator={false}
              removeClippedSubviews
              maxToRenderPerBatch={24}
              windowSize={10}
              onScrollToIndexFailed={({ index }) => {
                timeListRef.current?.scrollToOffset({ offset: index * 50, animated: false });
              }}
              renderItem={({ item }) => {
                const selected = timeTarget === 'opens' ? opensAt === item : closesAt === item;
                return (
                  <TouchableOpacity
                    style={styles.timeOption}
                    onPress={() => selectTime(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.timeOptionText, selected && styles.timeOptionActive]}>
                      {item}
                    </Text>
                    {selected && <Ionicons name="checkmark" size={20} color={colors.accentPrimary} />}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>

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
  inputTextMulti:    { textAlignVertical: 'top' },
  inputTextMultiPad: { paddingLeft: 14 },

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
  countryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: 14,
    paddingRight: 10,
  },
  countryFlag: {
    fontSize: fontSizes['14'],
  },
  countryCode: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['14'],
    color: colors.textPrimary,
    includeFontPadding: false,
  },
  phoneDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.borderDefault,
    marginRight: 10,
  },
  phoneInputText: {
    flex: 1,
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['14'],
    color: colors.textPrimary,
    paddingRight: 16,
    includeFontPadding: false,
  },

  // Country picker modal
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing['4xl'],
  },
  pickerTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['16'],
    color: colors.textPrimary,
    letterSpacing: -0.24,
    paddingHorizontal: spacing['2xl'],
    marginBottom: spacing.lg,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: 16,
  },
  pickerRowActive: {
    backgroundColor: colors.accentLight,
  },
  pickerFlag: {
    fontSize: 24,
  },
  pickerName: {
    flex: 1,
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes['14'],
    color: colors.textPrimary,
    includeFontPadding: false,
  },
  pickerCode: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['14'],
    color: colors.textMuted,
    includeFontPadding: false,
  },

  // Time row
  timeRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  timeFieldWrap: { flex: 1 },
  timePickerText: {
    flex: 1,
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['14'],
    color: colors.textPrimary,
    includeFontPadding: false,
  },
  timePlaceholder: { color: colors.textMuted },
  clockIcon: { marginRight: 12 },

  // Time picker modal
  timeOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  timeSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingHorizontal: 20,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing['4xl'],
  },
  timeSheetTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['16'],
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  timeList: { maxHeight: 300 },
  timeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  timeOptionText: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
  },
  timeOptionActive: {
    fontFamily: fontFamilies.semiBold,
    color: colors.accentPrimary,
  },

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
