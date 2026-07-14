import { View, StyleSheet } from 'react-native';
import Svg, { Rect, Circle } from 'react-native-svg';

interface Props {
  size?: number;
}

export default function BdFlag({ size = 26 }: Props) {
  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}>
      <Svg width={size} height={size} viewBox="0 0 26 26">
        {/* Green background */}
        <Rect x="0" y="0" width="26" height="26" fill="#006A4E" />
        {/* Red circle — slightly left of centre */}
        <Circle cx="12" cy="13" r="7.5" fill="#F42A41" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { overflow: 'hidden' },
});
