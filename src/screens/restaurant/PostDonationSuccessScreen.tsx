import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { getRestaurantProfile } from '../../services/restaurant';
import {
  colors, spacing, radius, fontSizes, fontFamilies, letterSpacings, layout,
} from '../../constants/theme';
import { DonationsStackParamList, RestaurantTabParamList } from '../../navigation/RestaurantTabs';

type Props = {
  navigation: NativeStackNavigationProp<DonationsStackParamList, 'PostDonationSuccess'>;
  route:      RouteProp<DonationsStackParamList, 'PostDonationSuccess'>;
};

const CATEGORY_LABELS: Record<string, string> = {
  RICE: 'Rice', NOODLES: 'Noodles', BREAD: 'Bread',
  SNACKS: 'Snacks', DRINKS: 'Drinks', OTHER: 'Other',
};

export default function PostDonationSuccessScreen({ navigation, route }: Props) {
  const { foodName, quantity, unit, category, pickupWindow } = route.params;

  const [restaurantName,    setRestaurantName]    = useState('');
  const [restaurantAddress, setRestaurantAddress] = useState('');

  useEffect(() => {
    getRestaurantProfile()
      .then((p) => { setRestaurantName(p.name); setRestaurantAddress(p.address); })
      .catch(() => {});
  }, []);

  const handleTrackClaims = useCallback(() => {
    navigation.navigate('DonationList');
  }, [navigation]);

  const handleBackToDashboard = useCallback(() => {
    navigation
      .getParent<BottomTabNavigationProp<RestaurantTabParamList>>()
      ?.navigate('Home');
  }, [navigation]);

  const categoryLabel = CATEGORY_LABELS[category] ?? category;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={styles.headerSection}>
          <View style={styles.successCircle}>
            <Ionicons name="checkmark" size={56} color={colors.textInverse} />
          </View>
          <Text style={styles.title}>Donation posted</Text>
          <Text style={styles.subtitle}>
            Receivers nearby will be notified within seconds.
          </Text>
        </View>

        {/* ── Listing details ── */}
        <Text style={styles.sectionLabel}>Listing details</Text>

        <View style={styles.detailsCard}>
          {/* Food row */}
          <View style={styles.detailRow}>
            <View style={[styles.iconCircle, styles.iconRed]}>
              <FontAwesome5 name="utensils" size={16} color={colors.accentPrimary} />
            </View>
            <View style={styles.detailText}>
              <Text style={styles.detailTitle}>{foodName}</Text>
              <Text style={styles.detailSub}>{quantity} {unit} · {categoryLabel}</Text>
            </View>
          </View>

          <View style={styles.separator} />

          {/* Time row */}
          <View style={styles.detailRow}>
            <View style={[styles.iconCircle, styles.iconGrey]}>
              <Ionicons name="time" size={18} color={colors.textPrimary} />
            </View>
            <View style={styles.detailText}>
              <Text style={styles.detailTitle}>{pickupWindow}</Text>
              <Text style={styles.detailSub}>Pickup window</Text>
            </View>
          </View>

          <View style={styles.separator} />

          {/* Location row */}
          <View style={styles.detailRow}>
            <View style={[styles.iconCircle, styles.iconGrey]}>
              <Ionicons name="location" size={18} color={colors.textPrimary} />
            </View>
            <View style={styles.detailText}>
              <Text style={styles.detailTitle} numberOfLines={1}>
                {restaurantName || '—'}
              </Text>
              <Text style={styles.detailSub} numberOfLines={1}>
                {restaurantAddress || '—'}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Estimated reach ── */}
        <View style={styles.reachBanner}>
          <View style={[styles.iconCircle, styles.iconLarge, styles.iconRed]}>
            <Ionicons name="megaphone" size={20} color={colors.accentPrimary} />
          </View>
          <View style={styles.reachText}>
            <Text style={styles.reachTitle}>Estimated reach</Text>
            <Text style={styles.reachSub}>~340 receivers within 5 km will see this.</Text>
          </View>
        </View>

        {/* ── Buttons ── */}
        <TouchableOpacity style={styles.primaryBtn} onPress={handleTrackClaims} activeOpacity={0.85}>
          <Ionicons name="list" size={16} color={colors.textInverse} />
          <Text style={styles.primaryBtnText}>Track claims</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.outlineBtn} onPress={handleBackToDashboard} activeOpacity={0.85}>
          <Text style={styles.outlineBtnText}>Back to dashboard</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    paddingBottom: spacing['4xl'],
  },

  // ── Header ───────────────────────────────────────────────────────────────
  headerSection: {
    alignItems: 'center',
    paddingTop: spacing['4xl'],
    paddingBottom: spacing['2xl'],
    paddingHorizontal: spacing['2xl'],
  },
  successCircle: {
    width: 124,
    height: 124,
    borderRadius: 62,
    backgroundColor: colors.successGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  title: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['2xl'],
    color: colors.textPrimary,
    letterSpacing: letterSpacings.subheading,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['14'],
    color: colors.textMuted,
    lineHeight: 21,
    textAlign: 'center',
    paddingHorizontal: 12,
  },

  // ── Listing details ───────────────────────────────────────────────────────
  sectionLabel: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.lg,
    color: colors.textPrimary,
    letterSpacing: -0.43,
    paddingHorizontal: 20,
    marginBottom: spacing.md,
  },
  detailsCard: {
    marginHorizontal: 20,
    borderRadius: radius.card,
    backgroundColor: colors.surfaceTertiary,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: 16,
  },
  separator: {
    height: 1,
    backgroundColor: colors.borderDefault,
    marginLeft: 66,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  iconLarge: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  iconRed: {
    backgroundColor: colors.avatarBg,
  },
  iconGrey: {
    backgroundColor: colors.surfaceSecondary,
  },
  detailText: {
    flex: 1,
  },
  detailTitle: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['14'],
    color: colors.textPrimary,
    letterSpacing: -0.21,
  },
  detailSub: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    color: colors.textMuted,
    marginTop: 2,
  },

  // ── Estimated reach ───────────────────────────────────────────────────────
  reachBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.accentLight,
    borderRadius: 24,
    marginHorizontal: 20,
    marginTop: spacing['2xl'],
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  reachText: {
    flex: 1,
  },
  reachTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['14'],
    color: colors.textPrimary,
  },
  reachSub: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginTop: 2,
  },

  // ── Buttons ───────────────────────────────────────────────────────────────
  primaryBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    height: layout.buttonHeight,
    borderRadius: radius.card,
    backgroundColor: colors.accentPrimary,
    marginTop: 16,
    marginHorizontal: 20,
  },
  primaryBtnText: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.md,
    color: colors.textInverse,
    letterSpacing: letterSpacings.button,
  },
  outlineBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    height: layout.buttonHeight,
    borderRadius: radius.card,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    marginTop: spacing.md,
    marginHorizontal: 20,
  },
  outlineBtnText: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    letterSpacing: letterSpacings.button,
  },
});
