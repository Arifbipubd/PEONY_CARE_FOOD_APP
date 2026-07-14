import React, { memo } from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  colors, spacing, radius, fontSizes, fontFamilies,
  letterSpacings, lineHeights, layout,
} from '../constants/theme';

interface Props {
  visible:   boolean;
  foodName:  string;
  deleting?: boolean;
  onConfirm: () => void;
  onCancel:  () => void;
}

const DeleteDonationSheet = memo(({ visible, foodName, deleting, onConfirm, onCancel }: Props) => (
  <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
    <View style={styles.overlay}>
      <View style={styles.sheet}>

        <View style={styles.handle} />

        {/* Icon circle */}
        <View style={styles.iconCircle}>
          <Ionicons name="trash" size={26} color={colors.accentPrimary} />
        </View>

        {/* Title */}
        <Text style={styles.title}>Delete this donation?</Text>

        {/* Body text — food name bold */}
        <Text style={styles.body}>
          <Text style={styles.bodyBold}>{foodName}</Text>
          {' will be permanently removed, and receivers who already claimed it will be notified. This can\'t be undone.'}
        </Text>

        {/* Buttons */}
        <SafeAreaView edges={['bottom']}>
          <TouchableOpacity
            style={styles.deleteBtn}
            activeOpacity={0.85}
            onPress={onConfirm}
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator size="small" color={colors.textInverse} />
            ) : (
              <>
                <Ionicons name="trash" size={18} color={colors.textInverse} />
                <Text style={styles.deleteText}>Delete donation</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            activeOpacity={0.8}
            onPress={onCancel}
            disabled={deleting}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </SafeAreaView>

      </View>
    </View>
  </Modal>
));

export default DeleteDonationSheet;

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
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accentLight,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },

  title: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.xl,
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: letterSpacings.bodyBold,
    marginBottom: 8,
    includeFontPadding: false,
  },
  body: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['14'],
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: lineHeights.body,
    marginBottom: 24,
    includeFontPadding: false,
  },
  bodyBold: {
    fontFamily: fontFamilies.bold,
    color: colors.textPrimary,
  },

  deleteBtn: {
    height: layout.buttonHeight,
    backgroundColor: colors.dangerRed,
    borderRadius: radius.card,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  deleteText: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['14'],
    color: colors.textInverse,
    letterSpacing: letterSpacings.buttonSm,
    includeFontPadding: false,
  },
  cancelBtn: {
    height: layout.buttonHeight,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: spacing['2xl'],
  },
  cancelText: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['14'],
    color: colors.textPrimary,
    includeFontPadding: false,
  },
});
