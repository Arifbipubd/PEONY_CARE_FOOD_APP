import { View, StyleSheet } from 'react-native';
import Svg, { Rect, Circle } from 'react-native-svg';
import { colors } from '../constants/theme';

interface Props {
  size?: number;
}

export default function SgFlag({ size = 26 }: Props) {
  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}>
      <Svg width={size} height={size} viewBox="0 0 26 26">
        {/* Red top half */}
        <Rect x="0" y="0" width="26" height="13" fill={colors.accentPrimary} />
        {/* White bottom half */}
        <Rect x="0" y="13" width="26" height="13" fill={colors.surface} />
        {/* White crescent — white circle with red circle offset right to cut the crescent */}
        <Circle cx="8" cy="7" r="4.5" fill={colors.surface} />
        <Circle cx="10" cy="7" r="3.5" fill={colors.accentPrimary} />
        {/* 5 white stars in pentagon arrangement */}
        <Circle cx="18"   cy="3.5"  r="1.2" fill={colors.surface} />
        <Circle cx="21.3" cy="5.9"  r="1.2" fill={colors.surface} />
        <Circle cx="20.1" cy="9.8"  r="1.2" fill={colors.surface} />
        <Circle cx="15.9" cy="9.8"  r="1.2" fill={colors.surface} />
        <Circle cx="14.7" cy="5.9"  r="1.2" fill={colors.surface} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { overflow: 'hidden' },
});
