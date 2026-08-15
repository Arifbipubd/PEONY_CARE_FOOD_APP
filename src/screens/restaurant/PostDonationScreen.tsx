import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import ImageWithSkeleton from '../../components/ImageWithSkeleton';
import { Ionicons } from '@expo/vector-icons';
import { launchImageLibraryAsync } from 'expo-image-picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { createDonation, updateDonation, getDonationDetail } from '../../services/restaurant';
import { getUserFacingErrorMessage } from '../../services/api';
import { FoodCategory } from '../../types';
import { FOOD_CATEGORIES } from '../../constants/categories';
import {
  colors, spacing, radius, fontSizes, fontFamilies, letterSpacings, layout,
} from '../../constants/theme';
import { DonationsStackParamList } from '../../navigation/RestaurantTabs';
import { buildTodayPickupRange, formatAvailabilityLabel } from '../../utils/availability';

type Props = {
  navigation: NativeStackNavigationProp<DonationsStackParamList, 'PostDonation'>;
  route:      RouteProp<DonationsStackParamList, 'PostDonation'>;
};

type ScheduleType = 'one-time' | 'every-day' | 'custom-days';

const CATEGORIES = FOOD_CATEGORIES.map(({ value, label }) => ({ key: value, label }));

const UNITS = ['packs', 'portions', 'boxes', 'bags', 'items'] as const;

const SCHEDULES: { key: ScheduleType; label: string }[] = [
  { key: 'one-time',    label: 'One-time' },
  { key: 'every-day',   label: 'Every day' },
  { key: 'custom-days', label: 'Custom days' },
];

/** Weekday chips for Custom days — indices match API Mon=0 … Sun=6 */
const WEEKDAYS: { key: number; label: string }[] = [
  { key: 0, label: 'Mon' },
  { key: 1, label: 'Tue' },
  { key: 2, label: 'Wed' },
  { key: 3, label: 'Thu' },
  { key: 4, label: 'Fri' },
  { key: 5, label: 'Sat' },
  { key: 6, label: 'Sun' },
];

export default function PostDonationScreen({ navigation, route }: Props) {
  const donationId = route.params?.donationId;
  const isEditMode = !!donationId;
  const [name,         setName]         = useState('');
  const [nameError,    setNameError]    = useState('');
  const [category,     setCategory]     = useState<FoodCategory>('RICE');
  const [quantity,     setQuantity]     = useState('');
  const [quantityError, setQuantityError] = useState('');
  const [unitIndex,    setUnitIndex]    = useState(0);
  const [schedule,     setSchedule]     = useState<ScheduleType>('one-time');
  const [customDays,   setCustomDays]   = useState<number[]>([]);
  const [scheduleError, setScheduleError] = useState('');
  const [notes,        setNotes]        = useState('');
  const [photoUri,     setPhotoUri]     = useState<string | null>(null);
  const [submitting,   setSubmitting]   = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const [photoChanged,  setPhotoChanged]  = useState(false);
  const [initializing,  setInitializing]  = useState(isEditMode);

  const [showUnitModal, setShowUnitModal] = useState(false);

  const [showQrModal,       setShowQrModal]       = useState(false);
  const [qrData,            setQrData]            = useState('');
  const [postedName,        setPostedName]        = useState('');
  const [postedId,          setPostedId]          = useState('');
  const [postedPickupWindow, setPostedPickupWindow] = useState('');
  const [postedReachLabel,  setPostedReachLabel]  = useState('');

  const unit = UNITS[unitIndex]!;

  useEffect(() => {
    if (!donationId) return;
    getDonationDetail(donationId)
      .then((d) => {
        setName(d.name);
        setCategory(d.category);
        setQuantity(String(d.quantityOriginal));
        const unitIdx = (UNITS as readonly string[]).indexOf(d.unit);
        setUnitIndex(unitIdx >= 0 ? unitIdx : 0);
        const rt = d.recurrenceType;
        if (rt === 'DAILY') {
          setSchedule('every-day');
          setCustomDays([]);
        } else if (rt === 'CUSTOM' || rt === 'WEEKLY') {
          setSchedule('custom-days');
          setCustomDays(d.recurrenceDays ?? []);
        } else {
          setSchedule('one-time');
          setCustomDays([]);
        }
        setNotes(d.description ?? '');
        setPhotoUri(d.photoUrl || null);
      })
      .catch(() => {})
      .finally(() => setInitializing(false));
  }, [donationId]);

  const bc = (field: string) =>
    focusedField === field ? colors.accentPrimary : colors.borderDefault;

  const selectUnit = useCallback((index: number) => {
    setUnitIndex(index);
    setShowUnitModal(false);
  }, []);

  const handleScheduleChange = useCallback((key: ScheduleType) => {
    setSchedule(key);
    setScheduleError('');
    if (key !== 'custom-days') setCustomDays([]);
  }, []);

  const toggleCustomDay = useCallback((day: number) => {
    setCustomDays((prev) => {
      const next = prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day].sort((a, b) => a - b);
      return next;
    });
    setScheduleError('');
  }, []);

  const handlePickPhoto = useCallback(async () => {
    const result = await launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      setPhotoChanged(true);
    }
  }, []);

  const handleNameChange = useCallback((text: string) => {
    setName(text);
    if (nameError) setNameError('');
  }, [nameError]);

  const handleQuantityChange = useCallback((text: string) => {
    setQuantity(text);
    if (quantityError) setQuantityError('');
  }, [quantityError]);

  const handleSubmit = useCallback(async () => {
    const nextNameError = !name.trim() ? 'Food name is required' : '';
    const nextQuantityError =
      !quantity.trim() || isNaN(Number(quantity)) || Number(quantity) <= 0
        ? 'Enter a valid quantity'
        : '';
    const nextScheduleError =
      schedule === 'custom-days' && customDays.length === 0
        ? 'Select at least one day'
        : '';

    setNameError(nextNameError);
    setQuantityError(nextQuantityError);
    setScheduleError(nextScheduleError);

    if (
      nextNameError ||
      nextQuantityError ||
      nextScheduleError
    ) {
      return;
    }

    setSubmitting(true);
    try {
      const { start, end } = buildTodayPickupRange();
      const recurrenceType =
        schedule === 'every-day'
          ? 'DAILY' as const
          : schedule === 'custom-days'
            ? 'CUSTOM' as const
            : 'NONE' as const;
      const payload = {
        name:             name.trim(),
        description:      notes.trim(),
        category,
        unit,
        quantityOriginal: Number(quantity),
        pickupStart:      start,
        pickupEnd:        end,
        recurrenceType,
        recurrenceDays:   schedule === 'custom-days' ? customDays : undefined,
        localPhotoUri:    photoChanged ? photoUri : undefined,
      };
      if (isEditMode && donationId) {
        await updateDonation(donationId, payload);
        navigation.goBack();
      } else {
        const result = await createDonation({ ...payload, localPhotoUri: photoUri ?? undefined });
        setQrData(result.foodQrData);
        setPostedName(result.name);
        setPostedId(result.id);
        setPostedPickupWindow(formatAvailabilityLabel(
          recurrenceType,
          schedule === 'custom-days' ? customDays : undefined,
        ));
        setPostedReachLabel(result.estimatedReachLabel ?? '');
        setShowQrModal(true);
      }
    } catch (err) {
      Alert.alert(
        isEditMode ? "Couldn't save" : "Couldn't post",
        getUserFacingErrorMessage(err, 'Could not save this listing. Please try again.'),
      );
    } finally {
      setSubmitting(false);
    }
  }, [name, notes, category, unit, quantity, schedule, customDays, photoUri, photoChanged, isEditMode, donationId, navigation]);

  if (initializing) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.accentPrimary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
      </TouchableOpacity>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.eyebrow}>{isEditMode ? 'Edit listing' : 'New listing'}</Text>
        <Text style={styles.title}>{isEditMode ? 'Update your donation' : 'What are you donating?'}</Text>

        {/* FOOD NAME */}
        <Text style={styles.fieldLabel}>
          FOOD NAME
          <Text style={styles.requiredMark}> *</Text>
        </Text>
        <TextInput
          style={[
            styles.input,
            focusedField === 'name' && !nameError && styles.inputFocused,
            !!nameError && styles.inputError,
          ]}
          placeholder="e.g. Chicken Rice"
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={handleNameChange}
          onFocus={() => setFocusedField('name')}
          onBlur={() => setFocusedField(null)}
          returnKeyType="next"
        />
        {nameError ? <Text style={styles.fieldError}>{nameError}</Text> : null}

        {/* CATEGORY */}
        <Text style={[styles.fieldLabel, styles.sectionTop]}>CATEGORY</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {CATEGORIES.map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              style={[styles.chip, category === key && styles.chipActive]}
              onPress={() => setCategory(key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, category === key && styles.chipTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* QUANTITY + UNIT */}
        <View style={[styles.row, styles.sectionTop]}>
          <View style={styles.half}>
            <Text style={styles.fieldLabel}>
              QUANTITY
              <Text style={styles.requiredMark}> *</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                focusedField === 'qty' && !quantityError && styles.inputFocused,
                !!quantityError && styles.inputError,
              ]}
              placeholder="0"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={quantity}
              onChangeText={handleQuantityChange}
              onFocus={() => setFocusedField('qty')}
              onBlur={() => setFocusedField(null)}
            />
            {quantityError ? <Text style={styles.fieldError}>{quantityError}</Text> : null}
          </View>
          <View style={styles.half}>
            <Text style={styles.fieldLabel}>
              UNIT
              <Text style={styles.requiredMark}> *</Text>
            </Text>
            <TouchableOpacity
              style={[styles.inputWrap, styles.inlineRow]}
              onPress={() => setShowUnitModal(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.pickerValue}>{unit}</Text>
              <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* SCHEDULE */}
        <Text style={[styles.fieldLabel, styles.sectionTop]}>
          SCHEDULE
          <Text style={styles.requiredMark}> *</Text>
        </Text>
        <View style={styles.schedRow}>
          {SCHEDULES.map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              style={[styles.schedBtn, schedule === key && styles.schedBtnActive]}
              onPress={() => handleScheduleChange(key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.schedText, schedule === key && styles.schedTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {schedule === 'custom-days' ? (
          <View style={styles.dayRow}>
            {WEEKDAYS.map(({ key, label }) => {
              const selected = customDays.includes(key);
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.dayBtn, selected && styles.dayBtnActive]}
                  onPress={() => toggleCustomDay(key)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.dayText, selected && styles.dayTextActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : null}
        {scheduleError ? <Text style={styles.fieldError}>{scheduleError}</Text> : null}

        {/* NOTES (OPTIONAL) */}
        <Text style={[styles.fieldLabel, styles.sectionTop]}>NOTES (OPTIONAL)</Text>
        <TextInput
          style={[styles.input, styles.textarea, { borderColor: bc('notes') }]}
          placeholder={"Anything receivers should know —\nallergens, packaging, etc."}
          placeholderTextColor={colors.textMuted}
          multiline
          value={notes}
          onChangeText={setNotes}
          onFocus={() => setFocusedField('notes')}
          onBlur={() => setFocusedField(null)}
          textAlignVertical="top"
        />

        {/* PHOTO */}
        <TouchableOpacity style={styles.photoBox} onPress={handlePickPhoto} activeOpacity={0.8}>
          {photoUri ? (
            <>
              <ImageWithSkeleton source={{ uri: photoUri }} style={styles.photoPreview} resizeMode="cover" />
              <View style={styles.photoOverlay}>
                <Ionicons name="camera" size={16} color={colors.textInverse} />
                <Text style={styles.photoChangeText}>Change</Text>
              </View>
            </>
          ) : (
            <>
              <Ionicons name="camera" size={32} color={colors.textMuted} />
              <Text style={styles.photoTitle}>Add a photo</Text>
              <Text style={styles.photoSub}>Helps food get claimed faster</Text>
            </>
          )}
        </TouchableOpacity>

        {/* POST DONATION */}
        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          activeOpacity={0.85}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <>
              <Text style={styles.submitText}>{isEditMode ? 'Update donation' : 'Post donation'}</Text>
              <Ionicons name="arrow-forward" size={18} color={colors.textInverse} />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* ── QR success modal ─────────────────────────────────────────────── */}
      <Modal
        visible={showQrModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowQrModal(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.qrSheet}>
            <Ionicons name="checkmark-circle" size={36} color={colors.successGreen} />
            <Text style={styles.qrTitle}>Donation posted!</Text>
            <Text style={styles.qrSub}>{postedName}</Text>
            <View style={styles.qrBox}>
              {qrData ? (
                <QRCode value={qrData} size={200} />
              ) : null}
            </View>
            <Text style={styles.qrHint}>Receivers scan this to claim the meal</Text>
            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => {
                setShowQrModal(false);
                navigation.navigate('PostDonationSuccess', {
                  foodName:             name.trim(),
                  quantity:             Number(quantity),
                  unit,
                  category,
                  pickupWindow:         postedPickupWindow,
                  donationId:           postedId,
                  estimatedReachLabel:  postedReachLabel,
                });
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Unit picker modal ─────────────────────────────────────────────── */}
      <Modal
        visible={showUnitModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowUnitModal(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowUnitModal(false)}
        >
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Select unit</Text>
            {UNITS.map((u, i) => (
              <TouchableOpacity
                key={u}
                style={styles.sheetOption}
                onPress={() => selectUnit(i)}
                activeOpacity={0.7}
              >
                <Text style={[styles.sheetOptionText, unitIndex === i && styles.sheetOptionActive]}>
                  {u}
                </Text>
                {unitIndex === i && (
                  <Ionicons name="checkmark" size={20} color={colors.accentPrimary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  backBtn: {
    marginTop: spacing.md,
    marginLeft: spacing.xl,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: spacing['4xl'],
  },
  eyebrow: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    marginTop: spacing.xl,
  },
  title: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['2xl'],
    color: colors.textPrimary,
    letterSpacing: letterSpacings.subheading,
    lineHeight: 32,
    marginBottom: spacing['2xl'],
  },
  fieldLabel: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    letterSpacing: 0.88,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  requiredMark: {
    color: colors.errorRed,
  },
  sectionTop: {
    marginTop: spacing.xl,
  },
  input: {
    height: layout.inputHeight,
    borderRadius: radius.input,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
  },
  inputFocused: {
    borderColor: colors.accentPrimary,
  },
  inputError: {
    borderColor: colors.errorRed,
  },
  fieldError: {
    marginTop: spacing.sm,
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.xs,
    color: colors.errorRed,
  },
  inputWrap: {
    height: layout.inputHeight,
    borderRadius: radius.input,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textarea: {
    height: 100,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  pickerValue: {
    flex: 1,
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: {
    height: 36,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: colors.textPrimary,
  },
  chipText: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['12'],
    color: colors.textPrimary,
  },
  chipTextActive: {
    color: colors.textInverse,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  half: {
    flex: 1,
  },
  schedRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  schedBtn: {
    flex: 1,
    height: 44,
    borderRadius: radius.input,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  schedBtnActive: {
    backgroundColor: colors.avatarBg,
    borderColor: colors.accentPrimary,
  },
  schedText: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['12'],
    color: colors.textPrimary,
  },
  schedTextActive: {
    color: colors.accentPrimary,
  },
  dayRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  dayBtn: {
    flex: 1,
    height: 40,
    borderRadius: radius.input,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayBtnActive: {
    backgroundColor: colors.avatarBg,
    borderColor: colors.accentPrimary,
  },
  dayText: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['12'],
    color: colors.textPrimary,
  },
  dayTextActive: {
    color: colors.accentPrimary,
  },
  photoBox: {
    marginTop: spacing.xl,
    height: 120,
    borderRadius: radius.input,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    overflow: 'hidden',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingVertical: spacing.sm,
  },
  photoChangeText: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.sm,
    color: colors.textInverse,
  },
  photoTitle: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['16'],
    color: colors.textMuted,
  },
  photoSub: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  submitBtn: {
    marginTop: 16,
    height: layout.buttonHeight,
    borderRadius: radius.card,
    backgroundColor: colors.accentPrimary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: colors.accentPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitText: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.md,
    color: colors.textInverse,
    letterSpacing: letterSpacings.button,
  },
  // ── Modals ────────────────────────────────────────────────────────────────
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingHorizontal: 20,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing['4xl'],
  },
  sheetTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['16'],
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  sheetOptionText: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
  },
  sheetOptionActive: {
    fontFamily: fontFamilies.semiBold,
    color: colors.accentPrimary,
  },
  qrSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingHorizontal: 28,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing['4xl'],
    alignItems: 'center',
    gap: spacing.md,
  },
  qrTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['2xl'],
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  qrSub: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.md,
    color: colors.textMuted,
  },
  qrBox: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.xl,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  qrHint: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  doneBtn: {
    marginTop: spacing.lg,
    width: '100%',
    height: layout.buttonHeight,
    borderRadius: radius.card,
    backgroundColor: colors.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneBtnText: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.md,
    color: colors.textInverse,
    letterSpacing: letterSpacings.button,
  },
});
