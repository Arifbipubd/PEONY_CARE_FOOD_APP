import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../constants/theme';

interface LogoBadgeProps {
  size?: number;
}

// Placeholder until assets/logo.png is exported from Figma.
// To replace: swap the View+Icon below with:
//   <Image source={require('../../assets/logo.png')} style={{ width: size, height: size, borderRadius: size * 0.25 }} />
export default function LogoBadge({ size = 96 }: LogoBadgeProps) {
  const iconSize = Math.round(size * 0.52);
  const br = Math.round(size * 0.25);

  return (
    <View style={[styles.badge, { width: size, height: size, borderRadius: br }]}>
      <MaterialCommunityIcons name="flower" size={iconSize} color="#fff" />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
