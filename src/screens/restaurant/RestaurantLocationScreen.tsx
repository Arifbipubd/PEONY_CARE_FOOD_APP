import React, { useState, useCallback, useRef, useEffect, memo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { colors, spacing, radius, fontSizes, fontFamilies, letterSpacings } from '../../constants/theme';

type LocationParamList = {
  RestaurantLocation: { latitude: number; longitude: number; address: string };
};

type Props = {
  navigation: NativeStackNavigationProp<LocationParamList, 'RestaurantLocation'>;
  route:      RouteProp<LocationParamList, 'RestaurantLocation'>;
};

const DELTA = { latitudeDelta: 0.008, longitudeDelta: 0.008 };

type LocationResult = { latitude: number; longitude: number; address: string };
let _onConfirm: ((result: LocationResult) => void) | null = null;

// Called by EditRestaurantDetailsScreen before navigating here
export function setOnConfirm(cb: (result: LocationResult) => void) {
  _onConfirm = cb;
}

// ─── Address card ─────────────────────────────────────────────────────────────

interface AddressCardProps {
  address:    string;
  postalCode: string;
  lat:        number;
  lng:        number;
}

const AddressCard = memo(({ address, postalCode, lat, lng }: AddressCardProps) => (
  <View style={styles.card}>
    <Text style={styles.cardLabel}>SELECTED LOCATION</Text>
    <View style={styles.cardRow}>
      <Ionicons name="location" size={20} color={colors.accentPrimary} style={styles.cardIcon} />
      <View style={styles.cardText}>
        <Text style={styles.cardAddress} numberOfLines={2}>{address || 'Singapore'}</Text>
        <Text style={styles.cardCoords}>
          {postalCode ? `Singapore ${postalCode} · ` : ''}
          {lat.toFixed(5)}, {lng.toFixed(5)}
        </Text>
      </View>
    </View>
  </View>
));

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function RestaurantLocationScreen({ navigation, route }: Props) {
  const { latitude: initLat, longitude: initLng, address: initAddr } = route.params;

  const [pin, setPin]             = useState({ latitude: initLat, longitude: initLng });
  const [region, setRegion]       = useState<Region>({ ...DELTA, latitude: initLat, longitude: initLng });
  const [address, setAddress]     = useState(initAddr);
  const [postalCode, setPostal]   = useState('');
  const [searchQuery, setQuery]   = useState('');
  const [searching, setSearching] = useState(false);

  const mapRef = useRef<MapView>(null);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (results.length > 0) {
        const r = results[0];
        const street = [r.streetNumber, r.street].filter(Boolean).join(' ');
        setAddress(street || r.name || r.district || 'Singapore');
        setPostal(r.postalCode ?? '');
      }
    } catch {
      // keep current address on failure
    }
  }, []);

  useEffect(() => {
    if (initLat && initLng) reverseGeocode(initLat, initLng);
  }, []);

  const handleDragEnd = useCallback((e: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setPin({ latitude, longitude });
    reverseGeocode(latitude, longitude);
  }, [reverseGeocode]);

  const handleMapPress = useCallback((e: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setPin({ latitude, longitude });
    mapRef.current?.animateToRegion({ ...DELTA, latitude, longitude }, 300);
    reverseGeocode(latitude, longitude);
  }, [reverseGeocode]);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    Keyboard.dismiss();
    setSearching(true);
    try {
      const results = await Location.geocodeAsync(searchQuery.trim() + ', Singapore');
      if (results.length > 0) {
        const { latitude, longitude } = results[0];
        const newRegion = { ...DELTA, latitude, longitude };
        setPin({ latitude, longitude });
        setRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 500);
        reverseGeocode(latitude, longitude);
      }
    } catch {
      // silent fail — user can try again
    } finally {
      setSearching(false);
    }
  }, [searchQuery, reverseGeocode]);

  const handleConfirm = useCallback(() => {
    if (_onConfirm) {
      _onConfirm({ latitude: pin.latitude, longitude: pin.longitude, address });
      _onConfirm = null;
    }
    navigation.goBack();
  }, [navigation, pin, address]);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Titles */}
      <View style={styles.titleBlock}>
        <Text style={styles.eyebrow}>Pin your restaurant</Text>
        <Text style={styles.title}>Set location</Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search address or postal code"
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoCorrect={false}
        />
        {searching && <ActivityIndicator size="small" color={colors.textMuted} />}
      </View>

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        onPress={handleMapPress}
        showsUserLocation
        showsMyLocationButton={false}
      >
        <Marker
          coordinate={pin}
          draggable
          onDragEnd={handleDragEnd}
        />
      </MapView>

      {/* Bottom panel */}
      <View style={styles.bottom}>
        <Text style={styles.hint}>This is where receivers and donors will find you.</Text>

        <AddressCard
          address={address}
          postalCode={postalCode}
          lat={pin.latitude}
          lng={pin.longitude}
        />

        <SafeAreaView edges={['bottom']}>
          <TouchableOpacity style={styles.confirmBtn} activeOpacity={0.85} onPress={handleConfirm}>
            <Ionicons name="checkmark" size={18} color={colors.textInverse} />
            <Text style={styles.confirmText}>Confirm location</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>

    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },

  // Header
  header: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Titles
  titleBlock: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing.md,
  },
  eyebrow: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginBottom: 6,
    includeFontPadding: false,
  },
  title: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['2xl'],
    color: colors.textPrimary,
    letterSpacing: -0.6,
    includeFontPadding: false,
  },

  // Search bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: radius.input,
    height: 48,
    marginHorizontal: spacing.xl,
    marginBottom: 12,
    paddingHorizontal: spacing['2xl'],
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['14'],
    color: colors.textPrimary,
    includeFontPadding: false,
  },

  // Map
  map: {
    flex: 1,
    width: '100%',
  },

  // Bottom panel
  bottom: {
    backgroundColor: colors.surface,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing['2xl'],
  },
  hint: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingTop: 4,
    marginBottom: spacing.lg,
    includeFontPadding: false,
  },

  // Address card
  card: {
    marginBottom: spacing.sm,
  },
  cardLabel: {
    fontFamily: fontFamilies.bold,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 0.88,
    textTransform: 'uppercase',
    marginBottom: 8,
    includeFontPadding: false,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  cardIcon: {
    marginTop: 1,
  },
  cardText: {
    flex: 1,
  },
  cardAddress: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['14'],
    color: colors.textPrimary,
    includeFontPadding: false,
  },
  cardCoords: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    color: colors.textMuted,
    marginTop: 2,
    includeFontPadding: false,
  },

  // Confirm button
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentPrimary,
    height: 54,
    borderRadius: radius.card,
    marginHorizontal: 0,
    marginTop: 16,
    gap: 8,
  },
  confirmText: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.md,
    color: colors.textInverse,
    letterSpacing: letterSpacings.button,
    includeFontPadding: false,
  },
});
