import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getLocationSettings } from '../../services/receiver';
import { LocationSettings, RecentPlace } from '../../types';
import { colors, spacing, radius, fontSizes, fontWeights } from '../../constants/theme';
import { ProfileStackParamList } from '../../navigation/ReceiverTabs';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'LocationSettings'>;
};

const RADIUS_OPTIONS = [1, 2, 3, 5, 10];

function relativeDay(isoString: string): string {
  const diffDays = Math.floor((Date.now() - new Date(isoString).getTime()) / 86_400_000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays}d ago`;
}

export default function LocationSettingsScreen({ navigation }: Props) {
  const [settings, setSettings] = useState<LocationSettings | null>(null);
  const [loading, setLoading]   = useState(true);

  const [radius, setRadius]           = useState(5);
  const [locationSvc, setLocationSvc] = useState(true);
  const [saveHistory, setSaveHistory] = useState(true);
  const [recentPlaces, setRecentPlaces] = useState<RecentPlace[]>([]);

  useEffect(() => {
    getLocationSettings().then((s) => {
      setSettings(s);
      setRadius(s.searchRadiusKm);
      setLocationSvc(s.locationServicesEnabled);
      setSaveHistory(s.saveLocationHistory);
      setRecentPlaces(s.recentPlaces);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <ActivityIndicator style={styles.loader} color={colors.accentPrimary} />
      </SafeAreaView>
    );
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
          <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
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
            <Switch
              value={locationSvc}
              onValueChange={setLocationSvc}
              trackColor={{ false: colors.borderDefault, true: colors.accentPrimary }}
              thumbColor={colors.surface}
            />
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
            <Switch
              value={saveHistory}
              onValueChange={setSaveHistory}
              trackColor={{ false: colors.borderDefault, true: colors.accentPrimary }}
              thumbColor={colors.surface}
            />
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
                <View style={[styles.placeIcon, { backgroundColor: place.iconColor }]}>
                  <Ionicons name="location-outline" size={16} color={colors.textMuted} />
                </View>
                <View style={styles.placeText}>
                  <Text style={styles.placeName}>{place.name}</Text>
                  <Text style={styles.placeAddress}>{place.area} · {place.address}</Text>
                </View>
                <Text style={styles.placeTime}>{relativeDay(place.visitedAt)}</Text>
              </View>
              {i < recentPlaces.length - 1 && <View style={styles.placeDivider} />}
            </View>
          ))}
        </View>

        <TouchableOpacity
          onPress={() => setRecentPlaces([])}
          activeOpacity={0.7}
          style={styles.clearBtn}
        >
          <Text style={styles.clearText}>Clear location history</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Save button */}
      <View style={styles.saveWrap}>
        <TouchableOpacity style={styles.saveBtn} activeOpacity={0.85}>
          <Text style={styles.saveBtnText}>Save settings</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  loader: { flex: 1 },

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
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  heading: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    marginBottom: spacing['2xl'],
  },

  sectionLabel: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
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
    fontSize: 52,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    lineHeight: 58,
  },
  radiusUnit: {
    fontSize: fontSizes.xl,
    color: colors.textMuted,
    fontWeight: fontWeights.semiBold,
    paddingBottom: spacing.sm,
  },

  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  chipText: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    fontWeight: fontWeights.medium,
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
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permText: { flex: 1, gap: spacing.xs },
  permLabel: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semiBold,
    color: colors.textPrimary,
  },
  permSub: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },

  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  clearText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semiBold,
    color: colors.accentPrimary,
  },

  saveWrap: {
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderDefault,
  },
  saveBtn: {
    backgroundColor: colors.accentPrimary,
    borderRadius: radius.pill,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.textInverse,
  },
});
