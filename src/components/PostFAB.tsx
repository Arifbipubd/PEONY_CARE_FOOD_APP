import { memo } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, fontSizes, fontFamilies, letterSpacings } from '../constants/theme';

interface PostFABProps {
  onPress: () => void;
  label?: string;
}

function PostFAB({ onPress, label = 'Post food' }: PostFABProps) {
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.85}>
      <Ionicons name="add" size={20} color={colors.textInverse} />
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: spacing['2xl'],
    bottom: spacing['2xl'],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.accentPrimary,
    borderRadius: radius.pill,
    paddingHorizontal: 20,
    paddingVertical: spacing.lg,
    shadowColor: colors.accentPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  label: {
    fontSize: fontSizes['14'],
    fontFamily: fontFamilies.bold,
    color: colors.textInverse,
    letterSpacing: letterSpacings.buttonSm,
  },
});

export default memo(PostFAB);
