import React, { memo } from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import {
  colors, spacing, radius, fontSizes, fontFamilies,
  letterSpacings, lineHeights,
} from '../constants/theme';

interface Props {
  visible:   boolean;
  qrData:    string;
  onCancel:  () => void;
}

const CollectQrSheet = memo(({ visible, qrData, onCancel }: Props) => (
  <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
    <View style={styles.overlay}>
      <View style={styles.sheet}>

        <View style={styles.handle} />

        <Text style={styles.title}>Show this QR to the receiver</Text>

        <Text style={styles.sub}>
          Ask them to scan it in their Peony Care app to confirm pickup. It's marked
          collected only when their scan succeeds.
        </Text>

        <View style={styles.qrCard}>
          <QRCode value={qrData || 'placeholder'} size={220} />
        </View>

        <View style={styles.waitRow}>
          <View style={styles.dot} />
          <Text style={styles.waitText}>Waiting for the receiver to scan…</Text>
        </View>

        <SafeAreaView edges={['bottom']}>
          <TouchableOpacity style={styles.cancelBtn} activeOpacity={0.8} onPress={onCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </SafeAreaView>

      </View>
    </View>
  </Modal>
));

export default CollectQrSheet;

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
    marginTop: 6,
    includeFontPadding: false,
  },

  qrCard: {
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    padding: 16,
    marginTop: 16,
    marginBottom: 20,
  },

  waitRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accentPrimary,
  },
  waitText: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['14'],
    color: colors.textMuted,
    includeFontPadding: false,
  },

  cancelBtn: {
    height: 52,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  cancelText: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['14'],
    color: colors.textPrimary,
    includeFontPadding: false,
  },
});
