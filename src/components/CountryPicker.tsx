import React, { memo, useState, useCallback } from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import SgFlag from './SgFlag';
import BdFlag from './BdFlag';
import { colors, spacing, radius, fontSizes, fontFamilies } from '../constants/theme';

export type CountryCode = 'SG' | 'BD';

export interface CountryOption {
  code:     CountryCode;
  dial:     string;
  label:    string;
  Flag:     React.ComponentType<{ size?: number }>;
}

export const COUNTRIES: CountryOption[] = [
  { code: 'SG', dial: '+65',  label: 'Singapore',  Flag: SgFlag },
  { code: 'BD', dial: '+880', label: 'Bangladesh',  Flag: BdFlag },
];

export function flagFromPhone(phone: string): React.ComponentType<{ size?: number }> {
  const sorted = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);
  return sorted.find(c => phone.startsWith(c.dial))?.Flag ?? SgFlag;
}

interface Props {
  selected:  CountryOption;
  onSelect:  (c: CountryOption) => void;
}

const CountryPicker = memo(({ selected, onSelect }: Props) => {
  const [open, setOpen] = useState(false);

  const pick = useCallback((c: CountryOption) => {
    onSelect(c);
    setOpen(false);
  }, [onSelect]);

  const { Flag } = selected;

  return (
    <>
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
        hitSlop={4}
      >
        <Flag size={24} />
        <Text style={styles.dial}>{selected.dial}</Text>
        <Ionicons name="chevron-down" size={14} color={colors.textMuted} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" statusBarTranslucent>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setOpen(false)}>
          <SafeAreaView edges={['bottom']} style={styles.safeWrap}>
            <View style={styles.sheet}>
              <View style={styles.handle} />
              <Text style={styles.sheetTitle}>Select country</Text>
              {COUNTRIES.map((c) => {
                const CFlag = c.Flag;
                const isActive = c.code === selected.code;
                return (
                  <TouchableOpacity
                    key={c.code}
                    style={styles.row}
                    activeOpacity={0.7}
                    onPress={() => pick(c)}
                  >
                    <CFlag size={32} />
                    <View style={styles.rowText}>
                      <Text style={styles.rowLabel}>{c.label}</Text>
                      <Text style={styles.rowDial}>{c.dial}</Text>
                    </View>
                    {isActive && (
                      <Ionicons name="checkmark-circle" size={22} color={colors.accentPrimary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </SafeAreaView>
        </TouchableOpacity>
      </Modal>
    </>
  );
});

export default CountryPicker;

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dial: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['14'],
    color: colors.textPrimary,
  },

  // Modal
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  safeWrap: {
    backgroundColor: colors.surface,
    borderTopLeftRadius:  radius.sheet,
    borderTopRightRadius: radius.sheet,
  },
  sheet: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['2xl'],
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderDefault,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: spacing.lg,
  },
  sheetTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['16'],
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  rowText: { flex: 1 },
  rowLabel: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['14'],
    color: colors.textPrimary,
  },
  rowDial: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    color: colors.textMuted,
    marginTop: 2,
  },
});
