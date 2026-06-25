import { useEffect, useRef, memo } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../constants/theme';

export function usePulse(): Animated.Value {
  const opacity = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);
  return opacity;
}

type Props = {
  opacity: Animated.Value;
  width?: number | `${number}%`;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
};

const SkeletonBox = memo(function SkeletonBox({
  opacity,
  width = '100%',
  height,
  borderRadius = 8,
  style,
}: Props) {
  return (
    <Animated.View
      style={[styles.box, { width, height, borderRadius, opacity }, style]}
    />
  );
});

const styles = StyleSheet.create({
  box: { backgroundColor: colors.surfaceSecondary },
});

export default SkeletonBox;
