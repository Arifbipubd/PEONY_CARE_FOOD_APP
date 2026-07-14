import React, { memo } from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  colors, spacing, radius, fontSizes, fontFamilies,
  letterSpacings, lineHeights,
} from '../constants/theme';

interface Props {
  visible:       boolean;
  onShowQrAgain: () => void;
  onClose:       () => void;
}

const CollectFailedSheet = memo(({ visible, onShowQrAgain, onClose }: Props) => (
  <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
    <View style={styles.overlay}>
      <View style={styles.sheet}>

        <View style={styles.handle} />

        {/* Icon circle */}
        <View style={styles.iconCircle}>
          <Ionicons name="alert-circle" size={32} color={colors.accentPrimary} />
        </View>

        {/* Title */}
        <Text style={styles.title}>Scan failed</Text>

        {/* Sub text with inline bold */}
        <Text style={styles.sub}>
          {'This claim was '}
          <Text style={styles.subBold}>not</Text>
          {' marked collected. Double-check before trying again:'}
        </Text>

        {/* Checklist rows */}
        <View style={styles.checkList}>
          <View style={styles.checkRow}>
            <Ionicons name="restaurant" size={20} color={colors.accentPrimary} style={styles.rowIcon} />
            <Text style={styles.rowText}>
              {'The food '}
              <Text style={styles.rowBold}>item</Text>
              {' matches this claim.'}
            </Text>
          </View>

          <View style={[styles.checkRow, styles.checkRowGap]}>
            <Ionicons name="person" size={20} color={colors.accentPrimary} style={styles.rowIcon} />
            <Text style={styles.rowText}>
              {'The '}
              <Text style={styles.rowBold}>receiver's details</Text>
              {' — name & order — are correct.'}
            </Text>
          </View>
        </View>

        {/* Buttons */}
        <SafeAreaView edges={['bottom']}>
          <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.85} onPress={onShowQrAgain}>
            <Ionicons name="qr-code" size={18} color={colors.textInverse} />
            <Text style={styles.primaryText}>Show QR again</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.8} onPress={onClose}>
            <Text style={styles.secondaryText}>Close</Text>
          </TouchableOpacity>
        </SafeAreaView>

      </View>
    </View>
  </Modal>
));

export default CollectFailedSheet;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius:  radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingHorizontal: spacing['2xl'],
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderDefault,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },

  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accentLight,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 18,
  },

  title: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.xl,
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: letterSpacings.bodyBold,
    includeFontPadding: false,
  },
  sub: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['14'],
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: lineHeights.body,
    marginTop: 8,
    includeFontPadding: false,
  },
  subBold: {
    fontFamily: fontFamilies.bold,
    color: colors.textMuted,
  },

  checkList: {
    marginTop: 16,
    marginBottom: 24,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  checkRowGap: {
    marginTop: 12,
  },
  rowIcon: {
    marginTop: 1,
  },
  rowText: {
    flex: 1,
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    color: colors.textPrimary,
    lineHeight: 17.4,
    includeFontPadding: false,
  },
  rowBold: {
    fontFamily: fontFamilies.bold,
    color: colors.textPrimary,
  },

  primaryBtn: {
    height: 52,
    backgroundColor: colors.accentPrimary,
    borderRadius: radius.card,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  primaryText: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['14'],
    color: colors.textInverse,
    includeFontPadding: false,
  },
  secondaryBtn: {
    height: 52,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: spacing['2xl'],
  },
  secondaryText: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['14'],
    color: colors.textPrimary,
    includeFontPadding: false,
  },
});
