import { useState, memo } from 'react';
import {
  View,
  Image,
  ImageSourcePropType,
  ImageResizeMode,
  StyleSheet,
  Animated,
} from 'react-native';
import { usePulse } from './SkeletonBox';
import { colors } from '../constants/theme';

function LoadingSkeleton() {
  const opacity = usePulse();
  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.skeleton, { opacity }]}
    />
  );
}

interface Props {
  source: ImageSourcePropType;
  style?: object;
  resizeMode?: ImageResizeMode;
}

const ImageWithSkeleton = memo(function ImageWithSkeleton({
  source,
  style,
  resizeMode = 'cover',
}: Props) {
  const hasUri = typeof source === 'object' && !!(source as { uri?: string }).uri;
  const [loaded, setLoaded] = useState(!hasUri);

  return (
    <View style={[styles.container, style]}>
      <Image
        source={source}
        style={StyleSheet.absoluteFill}
        resizeMode={resizeMode}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
      />
      {!loaded && <LoadingSkeleton />}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { overflow: 'hidden', backgroundColor: colors.surfaceSecondary },
  skeleton: { backgroundColor: colors.surfaceSecondary },
});

export default ImageWithSkeleton;
