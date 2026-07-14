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
  visible: boolean;
  onDone:  () => void;
}

const CollectSuccessSheet = memo(({ visible, onDone }: Props) => (
  <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
    <View style={styles.overlay}>
      <View style={styles.sheet}>

        <View style={styles.handle} />

        {/* Success icon */}
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark" size={32} color={colors.successGreen} />
        </View>

        {/* Title */}
        <Text style={styles.title}>Marked collected</Text>

        {/* Description */}
        <Text style={styles.sub}>
          The receiver scanned successfully, so this claim is now marked collected.
        </Text>

        {/* Done button */}
        <SafeAreaView edges={['bottom']}>
          <TouchableOpacity style={styles.doneBtn} activeOpacity={0.85} onPress={onDone}>
            <Ionicons name="checkmark" size={18} color={colors.textInverse} />
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </SafeAreaView>

      </View>
    </View>
  </Modal>
));

export default CollectSuccessSheet;

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
    backgroundColor: colors.mintLight,
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

  doneBtn: {
    height: 52,
    backgroundColor: colors.accentPrimary,
    borderRadius: radius.card,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    marginBottom: spacing['2xl'],
  },
  doneText: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['14'],
    color: colors.textInverse,
    includeFontPadding: false,
  },
});
