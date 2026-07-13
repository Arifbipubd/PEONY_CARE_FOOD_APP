import React, { memo, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  colors, spacing, radius, fontSizes, fontFamilies, letterSpacings, layout,
} from '../../constants/theme';

type Props = {
  onRetry: () => void;
  onContactSupport: () => void;
  errorCode?: string;
};

function generateErrorCode(): string {
  const d = new Date();
  const date = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const suffix = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `REF #ERR-${date}-${suffix}`;
}

function ServerErrorScreen({ onRetry, onContactSupport, errorCode }: Props) {
  const code = useMemo(() => errorCode ?? generateErrorCode(), [errorCode]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.outerCircle}>
          <View style={styles.innerCircle}>
            <Text style={styles.exclamation}>!</Text>
          </View>
        </View>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.desc}>
          Our servers are having a rough moment. Give it a quick retry, or contact support if it keeps happening.
        </Text>
        <View style={styles.errorChip}>
          <Text style={styles.errorChipText}>{code}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryBtn} onPress={onRetry} activeOpacity={0.85}>
          <Ionicons name="refresh" size={18} color={colors.textInverse} />
          <Text style={styles.primaryBtnText}>Try again</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.outlineBtn} onPress={onContactSupport} activeOpacity={0.85}>
          <Ionicons name="headset" size={20} color={colors.textPrimary} />
          <Text style={styles.outlineBtnText}>Contact support</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default memo(ServerErrorScreen);

const MONO_FONT = Platform.select({ ios: 'Menlo', android: 'monospace' }) ?? 'monospace';

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
  outerCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: colors.accentLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  innerCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exclamation: {
    fontFamily: fontFamilies.bold,
    fontSize: 28,
    color: colors.textInverse,
    lineHeight: 34,
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
  errorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.pill,
    paddingVertical: 6,
    paddingHorizontal: spacing.lg,
    marginTop: 20,
  },
  errorChipText: {
    fontFamily: MONO_FONT,
    fontSize: fontSizes.xs,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.88,
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
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
