import { useEffect, useRef, memo } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';

type Props = {
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
};

const TRACK_W = 46;
const TRACK_H = 28;
const THUMB   = 22;
const PAD     =  3;
const OFF_X   = PAD;
const ON_X    = TRACK_W - THUMB - PAD;

export const CustomSwitch = memo(function CustomSwitch({ value, onValueChange, disabled }: Props) {
  const translateX = useRef(new Animated.Value(value ? ON_X : OFF_X)).current;
  const trackAnim  = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: value ? ON_X : OFF_X,
        useNativeDriver: true,
        bounciness: 0,
        speed: 20,
      }),
      Animated.timing(trackAnim, {
        toValue: value ? 1 : 0,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
  }, [value, translateX, trackAnim]);

  const trackBg = trackAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [colors.borderDefault, colors.accentPrimary],
  });

  return (
    <Pressable
      onPress={() => { if (!disabled) onValueChange(!value); }}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      hitSlop={6}
    >
      <Animated.View style={[styles.track, { backgroundColor: trackBg }]}>
        <Animated.View style={[styles.thumb, { transform: [{ translateX }] }]} />
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  track: {
    width:        TRACK_W,
    height:       TRACK_H,
    borderRadius: TRACK_H / 2,
    justifyContent: 'center',
  },
  thumb: {
    width:           THUMB,
    height:          THUMB,
    borderRadius:    THUMB / 2,
    backgroundColor: colors.surface,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 1 },
    shadowOpacity:   0.18,
    shadowRadius:    2,
    elevation:       2,
  },
});
