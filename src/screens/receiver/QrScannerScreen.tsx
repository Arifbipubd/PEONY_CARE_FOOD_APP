import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { claimFood } from '../../services/receiver';
import { colors, spacing, radius, fontSizes, fontWeights } from '../../constants/theme';
import { HomeStackParamList } from '../../navigation/ReceiverTabs';

type Props = {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'QrScanner'>;
};

const FRAME_SIZE     = 260;
const CORNER_LEN     = 30;
const CORNER_WIDTH   = 3;

export default function QrScannerScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [torch,   setTorch]   = useState(false);
  const [scanned, setScanned] = useState(false);
  const sweepAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(sweepAnim, {
          toValue: FRAME_SIZE - 4,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(sweepAnim, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const handleScan = async (qrPayload: string) => {
    if (scanned) return;
    setScanned(true);
    try {
      const claim = await claimFood('', qrPayload);
      navigation.navigate('ClaimSuccess', { claim });
    } catch {
      setScanned(false);
    }
  };

  return (
    <View style={styles.screen}>
      {permission?.granted ? (
        <CameraView
          style={StyleSheet.absoluteFill}
          enableTorch={torch}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={scanned ? undefined : ({ data }) => handleScan(data)}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#0A0A0A' }]} />
      )}

      <View style={[styles.overlay, { paddingTop: insets.top + spacing.md }]}>

        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={20} color={colors.textInverse} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setTorch((t) => !t)}>
            <Ionicons
              name={torch ? 'flash' : 'flash-outline'}
              size={20}
              color={torch ? colors.warningYellow : colors.textInverse}
            />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <Text style={styles.hint}>Show this at the counter</Text>
        <Text style={styles.title}>Scan claim QR</Text>

        {/* Scan frame */}
        <View style={styles.frame}>
          {/* Corner brackets */}
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />

          {/* Sweep line */}
          <Animated.View
            style={[styles.sweepLine, { transform: [{ translateY: sweepAnim }] }]}
          />
        </View>

        <Text style={styles.alignHint}>Align the staff's QR code inside the frame</Text>

        <View style={{ flex: 1 }} />

        {/* Dev simulate buttons */}
        <View style={[styles.devRow, { paddingBottom: insets.bottom + spacing.lg }]}>
          <TouchableOpacity
            style={styles.devBtn}
            onPress={() => handleScan('food-001|rest-001|1750000000')}
          >
            <Text style={styles.devBtnText}>Simulate Success</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.devBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.devBtnText}>Simulate Failure</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0A0A0A' },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
  },

  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  hint: {
    fontSize: fontSizes.sm,
    color: 'rgba(255,255,255,0.55)',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    color: colors.textInverse,
    marginBottom: spacing['3xl'],
  },

  frame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    overflow: 'hidden',
  },

  corner: {
    position: 'absolute',
    width: CORNER_LEN,
    height: CORNER_LEN,
    borderColor: colors.accentPrimary,
  },
  cornerTL: {
    top: 0, left: 0,
    borderTopWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderTopLeftRadius: radius.sm,
  },
  cornerTR: {
    top: 0, right: 0,
    borderTopWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderTopRightRadius: radius.sm,
  },
  cornerBL: {
    bottom: 0, left: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderBottomLeftRadius: radius.sm,
  },
  cornerBR: {
    bottom: 0, right: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderBottomRightRadius: radius.sm,
  },

  sweepLine: {
    position: 'absolute',
    left: CORNER_LEN,
    right: CORNER_LEN,
    height: 2,
    backgroundColor: colors.accentPrimary,
    opacity: 0.8,
  },

  alignHint: {
    fontSize: fontSizes.sm,
    color: 'rgba(255,255,255,0.45)',
    marginTop: spacing.xl,
    textAlign: 'center',
  },

  devRow: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  devBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: radius.input,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  devBtnText: {
    fontSize: fontSizes.sm,
    color: colors.textInverse,
    fontWeight: fontWeights.medium,
  },
});
