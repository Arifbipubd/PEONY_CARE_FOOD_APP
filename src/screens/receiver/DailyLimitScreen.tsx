import { useState, useEffect } from 'react';
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
import { colors, spacing, radius, fontSizes, fontWeights } from '../../constants/theme';
import { HomeStackParamList } from '../../navigation/ReceiverTabs';

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

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="hourglass-outline" size={48} color={colors.accentPrimary} />
        </View>
        <Text style={styles.heading}>Daily limit reached</Text>
        <Text style={styles.body}>
          You've claimed your meal today. The limit resets at midnight so more people get to eat.
        </Text>

        <View style={styles.timerBox}>
          <Text style={styles.timerValue}>{timeLeft}</Text>
          <Text style={styles.timerLabel}>UNTIL RESET</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('ReceiverHome')}
        >
          <Text style={styles.primaryBtnText}>View today's claim</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryBtn}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('ReceiverHome')}
        >
          <Text style={styles.secondaryBtnText}>Back to browse</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },

  header: {
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
    gap: spacing.lg,
  },

  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: radius.pill,
    backgroundColor: '#FEF0E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },

  heading: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  body: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },

  timerBox: {
    width: '100%',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.card,
    paddingVertical: spacing['2xl'],
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  timerValue: {
    fontSize: 52,
    fontWeight: fontWeights.bold,
    color: colors.accentPrimary,
    lineHeight: 60,
  },
  timerLabel: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    fontWeight: fontWeights.semiBold,
    letterSpacing: 1,
  },

  actions: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['2xl'],
    gap: spacing.sm,
  },
  primaryBtn: {
    backgroundColor: colors.accentPrimary,
    borderRadius: radius.pill,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.textInverse,
  },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.pill,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
});
