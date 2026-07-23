import React, { memo } from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { colors, spacing, radius, fontSizes, fontFamilies, letterSpacings, layout } from '../constants/theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'outline';
  size?: 'sm';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  rightIcon?: React.ReactNode;
}

function Button({
  label,
  onPress,
  variant = 'primary',
  size,
  disabled = false,
  loading = false,
  style,
  rightIcon,
}: ButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.base,
        isPrimary ? styles.primary : styles.outline,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.textInverse : colors.accentPrimary} />
      ) : rightIcon ? (
        <View style={styles.labelRow}>
          <Text style={[styles.label, isPrimary ? styles.labelPrimary : styles.labelOutline, size === 'sm' && styles.labelSm]}>
            {label}
          </Text>
          {rightIcon}
        </View>
      ) : (
        <Text style={[styles.label, isPrimary ? styles.labelPrimary : styles.labelOutline, size === 'sm' && styles.labelSm]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: layout.buttonHeight,
    borderRadius: radius.card,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
    alignSelf: 'stretch',
  },
  primary: {
    backgroundColor: colors.accentPrimary,
    shadowColor: colors.accentPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  outline: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
  },
  disabled: {
    opacity: 0.5,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.md,
    letterSpacing: letterSpacings.button,
  },
  labelSm: {
    fontSize: fontSizes['14'],
    letterSpacing: letterSpacings.buttonSm,
  },
  labelPrimary: {
    color: colors.textInverse,
  },
  labelOutline: {
    color: colors.textPrimary,
  },
});

export default memo(Button);
