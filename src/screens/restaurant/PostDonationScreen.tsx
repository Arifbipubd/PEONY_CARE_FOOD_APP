import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createDonation } from '../../services/restaurant';
import { FoodCategory } from '../../types';
import {
  colors, spacing, radius, fontSizes, fontFamilies, letterSpacings, layout,
} from '../../constants/theme';
import { DonationsStackParamList } from '../../navigation/RestaurantTabs';

type Props = {
  navigation: NativeStackNavigationProp<DonationsStackParamList, 'PostDonation'>;
};

type ScheduleType = 'one-time' | 'every-day' | 'custom-days';

const CATEGORIES: { key: FoodCategory; label: string }[] = [
  { key: 'RICE',    label: 'Rice' },
  { key: 'NOODLES', label: 'Noodles' },
  { key: 'BREAD',   label: 'Bread' },
  { key: 'SNACKS',  label: 'Snacks' },
  { key: 'DRINKS',  label: 'Drinks' },
  { key: 'OTHER',   label: 'Other' },
];

const UNITS = ['packs', 'portions', 'boxes', 'bags', 'items'] as const;

const SCHEDULES: { key: ScheduleType; label: string }[] = [
  { key: 'one-time',    label: 'One-time' },
  { key: 'every-day',   label: 'Every day' },
  { key: 'custom-days', label: 'Custom days' },
];

// 30-min slots 00:00 → 23:30
const TIME_SLOTS: string[] = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? '00' : '30';
  return `${String(h).padStart(2, '0')}:${m}`;
});

function buildIsoTime(timeStr: string): string {
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr ?? '0', 10);
  const m = parseInt(mStr ?? '0', 10);
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0).toISOString();
}

export default function PostDonationScreen({ navigation }: Props) {
  const [name,         setName]         = useState('');
  const [category,     setCategory]     = useState<FoodCategory>('RICE');
  const [quantity,     setQuantity]     = useState('');
  const [unitIndex,    setUnitIndex]    = useState(0);
  const [pickupFrom,   setPickupFrom]   = useState('');
  const [pickupUntil,  setPickupUntil]  = useState('');
  const [schedule,     setSchedule]     = useState<ScheduleType>('one-time');
  const [notes,        setNotes]        = useState('');
  const [photoUri,     setPhotoUri]     = useState<string | null>(null);
  const [submitting,   setSubmitting]   = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const [showUnitModal, setShowUnitModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [timeTarget,    setTimeTarget]    = useState<'from' | 'until'>('from');

  const unit = UNITS[unitIndex]!;

  const bc = (field: string) =>
    focusedField === field ? colors.accentPrimary : colors.borderDefault;

  const openTimePicker = useCallback((target: 'from' | 'until') => {
    setTimeTarget(target);
    setShowTimeModal(true);
  }, []);

  const selectTime = useCallback((time: string) => {
    if (timeTarget === 'from') setPickupFrom(time);
    else setPickupUntil(time);
    setShowTimeModal(false);
  }, [timeTarget]);

  const selectUnit = useCallback((index: number) => {
    setUnitIndex(index);
    setShowUnitModal(false);
  }, []);

  const handlePickPhoto = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!name.trim()) {
      Alert.alert('Missing field', 'Please enter a food name.');
      return;
    }
    if (!quantity.trim() || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      Alert.alert('Missing field', 'Please enter a valid quantity.');
      return;
    }
    if (!pickupFrom || !pickupUntil) {
      Alert.alert('Missing field', 'Please select pickup start and end times.');
      return;
    }
    setSubmitting(true);
    try {
      await createDonation({
        name:             name.trim(),
        description:      notes.trim(),
        category,
        unit,
        quantityOriginal: Number(quantity),
        pickupStart:      buildIsoTime(pickupFrom),
        pickupEnd:        buildIsoTime(pickupUntil),
        photoUrl:         photoUri,
      });
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to post donation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [name, notes, category, unit, quantity, pickupFrom, pickupUntil, photoUri, navigation]);

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
        <Text style={styles.eyebrow}>New listing</Text>
        <Text style={styles.title}>{"What are you\ndonating?"}</Text>

        {/* FOOD NAME */}
        <Text style={styles.fieldLabel}>FOOD NAME</Text>
        <TextInput
          style={[styles.input, { borderColor: bc('name') }]}
          placeholder="e.g. Chicken Rice"
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
          onFocus={() => setFocusedField('name')}
          onBlur={() => setFocusedField(null)}
          returnKeyType="next"
        />

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
            <Text style={styles.fieldLabel}>QUANTITY</Text>
            <TextInput
              style={[styles.input, { borderColor: bc('qty') }]}
              placeholder="0"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
              onFocus={() => setFocusedField('qty')}
              onBlur={() => setFocusedField(null)}
            />
          </View>
          <View style={styles.half}>
            <Text style={styles.fieldLabel}>UNIT</Text>
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

        {/* PICKUP FROM + UNTIL */}
        <View style={[styles.row, styles.sectionTop]}>
          <View style={styles.half}>
            <Text style={styles.fieldLabel}>PICKUP FROM</Text>
            <TouchableOpacity
              style={[styles.inputWrap, styles.inlineRow,
                { borderColor: pickupFrom ? colors.accentPrimary : colors.borderDefault }]}
              onPress={() => openTimePicker('from')}
              activeOpacity={0.8}
            >
              <Text style={pickupFrom ? styles.pickerValue : styles.pickerPlaceholder}>
                {pickupFrom || '18:00'}
              </Text>
              <Ionicons name="time" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
          <View style={styles.half}>
            <Text style={styles.fieldLabel}>UNTIL</Text>
            <TouchableOpacity
              style={[styles.inputWrap, styles.inlineRow,
                { borderColor: pickupUntil ? colors.accentPrimary : colors.borderDefault }]}
              onPress={() => openTimePicker('until')}
              activeOpacity={0.8}
            >
              <Text style={pickupUntil ? styles.pickerValue : styles.pickerPlaceholder}>
                {pickupUntil || '20:00'}
              </Text>
              <Ionicons name="time" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* SCHEDULE */}
        <Text style={[styles.fieldLabel, styles.sectionTop]}>SCHEDULE</Text>
        <View style={styles.schedRow}>
          {SCHEDULES.map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              style={[styles.schedBtn, schedule === key && styles.schedBtnActive]}
              onPress={() => setSchedule(key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.schedText, schedule === key && styles.schedTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

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
          <Ionicons
            name={photoUri ? 'checkmark-circle' : 'camera'}
            size={32}
            color={photoUri ? colors.successGreen : colors.textMuted}
          />
          <Text style={styles.photoTitle}>{photoUri ? 'Photo added' : 'Add a photo'}</Text>
          <Text style={styles.photoSub}>
            {photoUri ? 'Tap to change' : 'Helps food get claimed faster'}
          </Text>
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
              <Text style={styles.submitText}>Post donation</Text>
              <Ionicons name="arrow-forward" size={18} color={colors.textInverse} />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

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

      {/* ── Time picker modal ─────────────────────────────────────────────── */}
      <Modal
        visible={showTimeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTimeModal(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowTimeModal(false)}
        >
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>
              {timeTarget === 'from' ? 'Pickup from' : 'Until'}
            </Text>
            <FlatList
              data={TIME_SLOTS}
              keyExtractor={(item) => item}
              style={styles.timeList}
              showsVerticalScrollIndicator={false}
              removeClippedSubviews
              maxToRenderPerBatch={24}
              windowSize={10}
              renderItem={({ item }) => {
                const selected =
                  timeTarget === 'from' ? pickupFrom === item : pickupUntil === item;
                return (
                  <TouchableOpacity
                    style={styles.sheetOption}
                    onPress={() => selectTime(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.sheetOptionText, selected && styles.sheetOptionActive]}>
                      {item}
                    </Text>
                    {selected && (
                      <Ionicons name="checkmark" size={20} color={colors.accentPrimary} />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
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
  pickerPlaceholder: {
    flex: 1,
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.md,
    color: colors.textMuted,
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
  timeList: {
    maxHeight: 300,
  },
});
