import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  colors, spacing, radius, fontSizes, fontFamilies, letterSpacings, layout,
} from '../../constants/theme';

type Props = {
  onRetry: () => void;
  onContinueOffline: () => void;
};

function OfflineErrorScreen({ onRetry, onContinueOffline }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="cloud-offline" size={40} color={colors.textPrimary} />
        </View>
        <Text style={styles.title}>No connection</Text>
        <Text style={styles.desc}>
          We can't reach Peony Care servers right now. Check your Wi-Fi or mobile data and try again.
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryBtn} onPress={onRetry} activeOpacity={0.85}>
          <Ionicons name="refresh" size={18} color={colors.textInverse} />
          <Text style={styles.primaryBtnText}>Try again</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.outlineBtn} onPress={onContinueOffline} activeOpacity={0.85}>
          <Text style={styles.outlineBtnText}>Continue offline</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default memo(OfflineErrorScreen);

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  title: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['2xl'],
    color: colors.textPrimary,
    letterSpacing: letterSpacings.subheading,
    textAlign: 'center',
    marginBottom: 12,
  },
  desc: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['14'],
    color: colors.textMuted,
    lineHeight: 22,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: spacing['2xl'],
  },
  primaryBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    height: layout.buttonHeight,
    borderRadius: radius.card,
    backgroundColor: colors.accentPrimary,
  },
  primaryBtnText: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.md,
    color: colors.textInverse,
    letterSpacing: letterSpacings.button,
  },
  outlineBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    height: layout.buttonHeight,
    borderRadius: radius.card,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    marginTop: spacing.md,
  },
  outlineBtnText: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    letterSpacing: letterSpacings.button,
  },
});
