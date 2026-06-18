// TODO: implement full RestaurantProfileScreen design
import { useState } from 'react';
import { Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { logout } from '../../services/auth';
import { colors, spacing, fontSizes, fontWeights } from '../../constants/theme';

export default function RestaurantProfileScreen() {
  const { refreshToken, clearAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      if (refreshToken) await logout(refreshToken);
    } finally {
      clearAuth();
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.placeholder}>Profile — coming soon</Text>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} disabled={loading}>
        {loading
          ? <ActivityIndicator color={colors.errorRed} />
          : <>
              <Ionicons name="log-out-outline" size={18} color={colors.errorRed} />
              <Text style={styles.logoutText}>Log out</Text>
            </>
        }
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface, paddingHorizontal: spacing['2xl'] },
  placeholder: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: colors.textMuted,
    fontSize: fontSizes.md,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    marginBottom: spacing['2xl'],
  },
  logoutText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semiBold,
    color: colors.errorRed,
  },
});
