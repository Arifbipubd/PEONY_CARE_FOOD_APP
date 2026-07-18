import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { HomeStackParamList } from '../../navigation/ReceiverTabs';
import {
  colors,
  spacing,
  radius,
  fontSizes,
  fontFamilies,
} from '../../constants/theme';

type Props = {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'DailyLimit'>;
  route: RouteProp<HomeStackParamList, 'DailyLimit'>;
};

function countdown(resetsAt: string): string {
  const diff = new Date(resetsAt).getTime() - Date.now();
  if (diff <= 0) return '0:00';
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  return `${h}:${String(m).padStart(2, '0')}`;
}

export default function DailyLimitScreen({ navigation, route }: Props) {
  const { resetsAt } = route.params;
  const [timeLeft, setTimeLeft] = useState(countdown(resetsAt));

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(countdown(resetsAt)), 60_000);
    return () => clearInterval(id);
  }, [resetsAt]);

  const handleViewClaim = useCallback(
    () => navigation.getParent()?.navigate('History' as never),
    [navigation],
  );

  const handleBackToBrowse = useCallback(
    () => navigation.navigate('ReceiverHome'),
    [navigation],
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>

      {/* Back arrow */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
        hitSlop={8}
      >
        <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
      </TouchableOpacity>

      {/* Centred content */}
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="hourglass" size={52} color={colors.pickupOrange} />
        </View>

        <Text style={styles.title}>Daily limit reached</Text>
        <Text style={styles.desc}>
          {"You've claimed your meal today. The limit resets at midnight so more people get to eat."}
        </Text>

        <View style={styles.timerCard}>
          <Text style={styles.timerValue}>{timeLeft}</Text>
          <Text style={styles.timerLabel}>UNTIL RESET</Text>
        </View>
      </View>

      {/* Bottom actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryBtn}
          activeOpacity={0.85}
          onPress={handleViewClaim}
        >
          <Ionicons name="time" size={18} color={colors.textInverse} />
          <Text style={styles.primaryBtnText}>View today's claim</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          activeOpacity={0.7}
          onPress={handleBackToBrowse}
        >
          <Text style={styles.secondaryBtnText}>Back to browse</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },

  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginLeft: spacing['2xl'],
    marginTop: spacing.lg,
  },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
  },

  iconCircle: {
    width: 128,
    height: 128,
    borderRadius: radius.pill,
    backgroundColor: colors.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },

  title: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['2xl'],
    lineHeight: 28.8,
    letterSpacing: -0.6,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },

  desc: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['14'],
    lineHeight: 21,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 300,
  },

  timerCard: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.card,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: 22,
    marginTop: 28,
    alignSelf: 'center',
    width: 280,
    alignItems: 'center',
  },

  timerValue: {
    fontFamily: fontFamilies.bold,
    fontSize: 40,
    color: colors.accentPrimary,
    lineHeight: 48,
  },

  timerLabel: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.xs,
    letterSpacing: 0.88,
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginTop: spacing.xs,
  },

  actions: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['2xl'],
  },

  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentPrimary,
    borderRadius: radius.card,
    height: 54,
    gap: 8,
  },
  primaryBtnText: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.md,
    letterSpacing: 0.3,
    color: colors.textInverse,
  },

  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.card,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    height: 54,
    marginTop: 10,
  },
  secondaryBtnText: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.md,
    letterSpacing: 0.3,
    color: colors.textPrimary,
  },
});
