import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { getApprovalStatus } from '../../services/restaurant';
import LogoBadge from '../../components/LogoBadge';
import Button from '../../components/Button';
import { colors, spacing, fontSizes, fontFamilies, letterSpacings } from '../../constants/theme';

export default function ApprovalPendingScreen() {
  const { setApproved, clearAuth } = useAuthStore();
  const [checking, setChecking] = useState(false);
  const [message, setMessage]   = useState('');

  const handleCheck = useCallback(async () => {
    setChecking(true);
    setMessage('');
    try {
      const { isApproved: approved } = await getApprovalStatus();
      if (approved) {
        setApproved(true);
        // RootNavigator re-renders automatically to RestaurantTabs
      } else {
        setMessage('Still pending — check back soon.');
      }
    } catch {
      setMessage('Could not reach server. Try again.');
    } finally {
      setChecking(false);
    }
  }, [setApproved]);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.body}>
        <LogoBadge size={80} />

        <View style={styles.iconWrap}>
          <Ionicons name="time" size={48} color={colors.warningYellow} />
        </View>

        <Text style={styles.title}>Waiting for approval</Text>
        <Text style={styles.subtitle}>
          Your restaurant has been submitted for review. Our team will verify your details and activate your account — this usually takes 1–2 business days.
        </Text>

        {message ? (
          <Text style={styles.message}>{message}</Text>
        ) : null}

        <Button
          label="Check status"
          onPress={handleCheck}
          loading={checking}
          size="sm"
          rightIcon={
            checking
              ? <ActivityIndicator size="small" color={colors.textInverse} />
              : <Ionicons name="refresh" size={18} color={colors.textInverse} />
          }
        />

        <TouchableOpacity onPress={clearAuth} style={styles.logoutRow} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={16} color={colors.textMuted} />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  body: {
    flex: 1,
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['4xl'],
    alignItems: 'center',
    gap: spacing['2xl'],
  },
  iconWrap: {
    marginTop: spacing.md,
  },
  title: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['2xl'],
    letterSpacing: letterSpacings.subheading,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['14'],
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  message: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  logoutText: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
});
