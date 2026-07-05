import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CustomSwitch } from '../../components/CustomSwitch';
import SkeletonBox, { usePulse } from '../../components/SkeletonBox';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getLocationSettings } from '../../services/receiver';
import { LocationSettings, RecentPlace } from '../../types';
import { colors, spacing, radius, fontSizes, fontWeights, fontFamilies, letterSpacings } from '../../constants/theme';
import { ProfileStackParamList } from '../../navigation/ReceiverTabs';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'LocationSettings'>;
};

const RADIUS_OPTIONS = [1, 2, 3, 5, 10];

const PLACE_TYPE_COLORS: Record<string, string> = {
  FOOD_CENTRE: '#FF6B35',
  RESTAURANT:  '#D31B1B',
  SHOPPING:    '#7C3AED',
  TRANSIT:     '#2563EB',
  PARK:        '#26A34E',
  OTHER:       '#6B7280',
};

function relativeDay(isoString: string): string {
  const diffDays = Math.floor((Date.now() - new Date(isoString).getTime()) / 86_400_000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays}d ago`;
}

function LocationSkeleton() {
  const opacity = usePulse();
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={lSkelStyles.header}>
        <SkeletonBox opacity={opacity} width={22} height={22} borderRadius={100} />
        <SkeletonBox opacity={opacity} width={22} height={22} borderRadius={100} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={lSkelStyles.scroll} scrollEnabled={false}>
        <SkeletonBox opacity={opacity} width={100} height={13} />
        <SkeletonBox opacity={opacity} width={200} height={28} style={lSkelStyles.heading} />
        <View style={lSkelStyles.radiusRow}>
          {[0, 1, 2, 3, 4].map((i) => (
            <SkeletonBox key={i} opacity={opacity} width={44} height={36} borderRadius={100} />
          ))}
        </View>
        {[0, 1].map((i) => (
          <View key={i} style={lSkelStyles.toggleRow}>
            <View style={lSkelStyles.toggleText}>
              <SkeletonBox opacity={opacity} width={140} height={15} />
              <SkeletonBox opacity={opacity} width={200} height={12} style={lSkelStyles.toggleSub} />
            </View>
            <SkeletonBox opacity={opacity} width={50} height={28} borderRadius={100} />
          </View>
        ))}
        <SkeletonBox opacity={opacity} width={110} height={18} style={lSkelStyles.sectionLabel} />
        {[0, 1].map((i) => (
          <View key={i} style={lSkelStyles.placeRow}>
            <SkeletonBox opacity={opacity} width={36} height={36} borderRadius={100} />
            <View style={lSkelStyles.placeText}>
              <SkeletonBox opacity={opacity} width={130} height={14} />
              <SkeletonBox opacity={opacity} width={80} height={12} style={lSkelStyles.toggleSub} />
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const lSkelStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
  },
  scroll: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['4xl'],
    paddingTop: spacing.lg,
    gap: spacing['2xl'],
  },
  heading: { marginTop: spacing.sm },
  radiusRow: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  toggleText: { flex: 1, gap: 4 },
  toggleSub:  { marginTop: 2 },
  sectionLabel: { marginTop: spacing.sm },
  placeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  placeText: { flex: 1, gap: 4 },
});

export default function LocationSettingsScreen({ navigation }: Props) {
  const [settings, setSettings] = useState<LocationSettings | null>(null);
  const [loading, setLoading]   = useState(true);

  const [radius, setRadius]           = useState(5);
  const [locationSvc, setLocationSvc] = useState(true);
  const [saveHistory, setSaveHistory] = useState(true);
  const [recentPlaces, setRecentPlaces] = useState<RecentPlace[]>([]);

  useEffect(() => {
    getLocationSettings()
      .then((s) => {
        setSettings(s);
        setRadius(s.searchRadiusKm);
        setLocationSvc(s.locationServicesEnabled);
        setSaveHistory(s.saveLocationHistory);
        setRecentPlaces(s.recentPlaces);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LocationSkeleton />;
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.getParent()?.navigate('Alerts' as never)}
          hitSlop={8}
        >
          <Ionicons name="notifications" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Title */}
        <Text style={styles.subtitle}>Find food near you</Text>
        <Text style={styles.heading}>Location settings</Text>

        {/* Search radius */}
        <Text style={styles.sectionLabel}>Search radius</Text>
        <View style={styles.radiusDisplay}>
          <Text style={styles.radiusNumber}>{radius}</Text>
          <Text style={styles.radiusUnit}>km</Text>
        </View>
        <View style={styles.chipRow}>
          {RADIUS_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.chip, opt === radius && styles.chipActive]}
              onPress={() => setRadius(opt)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, opt === radius && styles.chipTextActive]}>
                {opt} km
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.radiusHint}>
          Donations within this distance appear in your browse feed.
        </Text>

        {/* Permissions */}
        <Text style={styles.sectionLabel}>Permissions</Text>
        <View style={styles.permCard}>
          <View style={styles.permRow}>
            <View style={[styles.permIcon, { backgroundColor: colors.surfaceSecondary }]}>
              <Ionicons name="location-outline" size={18} color={colors.textMuted} />
            </View>
            <View style={styles.permText}>
              <Text style={styles.permLabel}>Location services</Text>
              <Text style={styles.permSub}>Use GPS to find food near you</Text>
            </View>
            <CustomSwitch value={locationSvc} onValueChange={setLocationSvc} />
          </View>
          <View style={styles.permDivider} />
          <View style={styles.permRow}>
            <View style={[styles.permIcon, { backgroundColor: colors.surfaceSecondary }]}>
              <Ionicons name="time-outline" size={18} color={colors.textMuted} />
            </View>
            <View style={styles.permText}>
              <Text style={styles.permLabel}>Save location history</Text>
              <Text style={styles.permSub}>Better recommendations based on usual areas</Text>
            </View>
            <CustomSwitch value={saveHistory} onValueChange={setSaveHistory} />
          </View>
        </View>

        {/* Recent places */}
        <View style={styles.recentHeader}>
          <Text style={styles.sectionLabel}>Recent places</Text>
          <Text style={styles.recentCount}>{recentPlaces.length} places</Text>
        </View>
        <View style={styles.placesCard}>
          {recentPlaces.map((place, i) => (
            <View key={place.id}>
              <View style={styles.placeRow}>
                <View style={[styles.placeIcon, { backgroundColor: PLACE_TYPE_COLORS[place.placeType] ?? '#6B7280' }]}>
                  <Ionicons name="location-outline" size={16} color={colors.textInverse} />
                </View>
                <View style={styles.placeText}>
                  <Text style={styles.placeName}>{place.name}</Text>
                  <Text style={styles.placeAddress}>{place.area}</Text>
                </View>
                <Text style={styles.placeTime}>{relativeDay(place.visitedAt)}</Text>
              </View>
              {i < recentPlaces.length - 1 && <View style={styles.placeDivider} />}
            </View>
          ))}
          <View style={styles.clearDivider} />
          <TouchableOpacity
            onPress={() => setRecentPlaces([])}
            activeOpacity={0.7}
            style={styles.clearBtn}
          >
            <Ionicons name="trash-outline" size={15} color={colors.accentPrimary} />
            <Text style={styles.clearText}>Clear location history</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Save button */}
      <View style={styles.saveWrap}>
        <TouchableOpacity style={styles.saveBtn} activeOpacity={0.85}>
          <Ionicons name="checkmark" size={20} color={colors.textInverse} />
          <Text style={styles.saveBtnText}>Save settings</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },

  scroll: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['2xl'],
    paddingBottom: spacing['4xl'],
  },

  subtitle: {
    fontSize: fontSizes.sm,
    fontFamily: fontFamilies.medium,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  heading: {
    fontSize: fontSizes['2xl'],
    fontFamily: fontFamilies.bold,
    letterSpacing: letterSpacings.subheading,
    color: colors.textPrimary,
    marginBottom: spacing['2xl'],
  },

  sectionLabel: {
    fontSize: fontSizes.lg,
    fontFamily: fontFamilies.bold,
    letterSpacing: -0.425,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },

  radiusDisplay: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  radiusNumber: {
    fontSize: fontSizes['5xl'],
    fontFamily: fontFamilies.bold,
    letterSpacing: letterSpacings.heading,
    color: colors.textPrimary,
    lineHeight: fontSizes['5xl'],
  },
  radiusUnit: {
    fontSize: fontSizes.xl,
    color: colors.textMuted,
    fontFamily: fontFamilies.semiBold,
  },

  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    borderRadius: radius.pill,
    height: 36,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: colors.textPrimary,
  },
  chipText: {
    fontSize: fontSizes['12'],
    color: colors.textPrimary,
    fontFamily: fontFamilies.semiBold,
  },
  chipTextActive: {
    color: colors.textInverse,
  },

  radiusHint: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: spacing['2xl'],
  },

  permCard: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    overflow: 'hidden',
    marginBottom: spacing['2xl'],
  },
  permRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  permDivider: { height: 1, backgroundColor: colors.borderDefault },
  permIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permText: { flex: 1, gap: spacing.xs },
  permLabel: {
    fontSize: fontSizes['14'],
    fontFamily: fontFamilies.semiBold,
    letterSpacing: -0.21,
    color: colors.textPrimary,
  },
  permSub: {
    fontSize: fontSizes['12'],
    color: colors.textMuted,
  },

  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.md,
  },
  recentCount: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },

  placesCard: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  placeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  placeDivider: { height: 1, backgroundColor: colors.borderDefault, marginLeft: 56 + spacing.lg },
  clearDivider: { height: 1, backgroundColor: colors.borderDefault },
  placeIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeText: { flex: 1, gap: spacing.xs },
  placeName: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semiBold,
    color: colors.textPrimary,
  },
  placeAddress: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  placeTime: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },

  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  clearText: {
    fontSize: fontSizes.sm,
    fontFamily: fontFamilies.semiBold,
    color: colors.accentPrimary,
  },

  saveWrap: {
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderDefault,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accentPrimary,
    borderRadius: radius.card,
    height: 52,
  },
  saveBtnText: {
    fontSize: fontSizes.md,
    fontFamily: fontFamilies.bold,
    letterSpacing: letterSpacings.button,
    color: colors.textInverse,
  },
});
