import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardTypeOptions,
  ViewStyle,
} from 'react-native';
import { colors, spacing, radius, fontSizes, fontWeights, fontFamilies } from '../constants/theme';

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  editable?: boolean;
  leftIcon?: React.ReactNode;
  leftSection?: React.ReactNode;
  maxLength?: number;
  style?: ViewStyle;
}

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  keyboardType = 'default',
  secureTextEntry = false,
  editable = true,
  leftIcon,
  leftSection,
  maxLength,
  style,
}: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.focusRing, focused && !error && styles.focusRingActive]}>
        <View
          style={[
            styles.inputRow,
            leftSection ? styles.inputRowWithSection : null,
            focused && styles.inputFocused,
            !!error && styles.inputError,
            !editable && styles.inputDisabled,
          ]}
        >
          {leftSection ? (
            <>
              <View style={styles.leftSectionWrapper}>{leftSection}</View>
              <View style={styles.sectionDivider} />
            </>
          ) : leftIcon ? (
            <View style={styles.iconWrapper}>{leftIcon}</View>
          ) : null}
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.textMuted}
            keyboardType={keyboardType}
            secureTextEntry={secureTextEntry}
            editable={editable}
            maxLength={maxLength}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={styles.input}
          />
        </View>
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  label: {
    fontFamily: fontFamilies.semiBold,
    fontSize: 12,
    fontWeight: fontWeights.semiBold,
    color: colors.textMuted,
  },
  focusRing: {
    borderRadius: radius.input + 3,
    borderWidth: 3,
    borderColor: 'transparent',
    margin: -3,
  },
  focusRingActive: {
    borderColor: 'rgba(200, 16, 46, 0.1)',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: radius.input,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    overflow: 'hidden',
  },
  inputRowWithSection: {
    paddingLeft: 0,
  },
  inputFocused: {
    borderColor: colors.accentPrimary,
  },
  inputError: {
    borderColor: colors.errorRed,
  },
  inputDisabled: {
    backgroundColor: colors.surfaceSecondary,
  },
  iconWrapper: {
    marginRight: spacing.md,
  },
  leftSectionWrapper: {
    paddingHorizontal: spacing.md,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSecondary,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sectionDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: colors.borderDefault,
    marginRight: spacing.md,
  },
  input: {
    flex: 1,
    fontFamily: fontFamilies.regular,
    fontSize: 14,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  errorText: {
    fontSize: fontSizes.xs,
    color: colors.errorRed,
  },
});
