import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getMenuPhotos, uploadMenuPhotos, deleteMenuPhoto, MenuPhoto } from '../../services/restaurant';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  colors, spacing, radius, fontSizes, fontFamilies, letterSpacings,
} from '../../constants/theme';
import { ProfileStackParamList } from '../../navigation/RestaurantTabs';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'MenuPhotos'>;
};

const MAX_PHOTOS = 10;
const { width: SW } = Dimensions.get('window');
const CONTENT_W  = SW - spacing['2xl'] * 2;
const TILE_SIZE  = Math.floor((CONTENT_W - 8) / 2);
const CAROUSEL_H = Math.round(CONTENT_W * 0.68);

const ADD_SLOT = '__ADD__' as const;

type GridItem = MenuPhoto | typeof ADD_SLOT;

// ─── Empty state ──────────────────────────────────────────────────────────────

type EmptyProps = {
  onPostDonation: () => void;
};

const EmptyMenuPhotos = React.memo(({ onPostDonation }: EmptyProps) => (
  <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={es.scroll}>

    {/* Illustration */}
    <View style={es.illoWrap}>
      <MaterialCommunityIcons name="image-multiple" size={44} color={colors.accentPrimary} />
    </View>

    {/* Hero text */}
    <Text style={es.eyebrow}>Your public menu</Text>
    <Text style={es.title}>No menu photos yet</Text>
    <Text style={es.sub}>
      {"Snap your menu board, paper menu, or a couple of dish shots. Donors see these when they're deciding to sponsor a meal here."}
    </Text>

    {/* WHY UPLOAD MENU PHOTOS? */}
    <View style={es.whySection}>
      <View style={es.whyLabelRow}>
        <MaterialCommunityIcons name="lightbulb-on-outline" size={14} color={colors.textMuted} />
        <Text style={es.whyLabel}>WHY UPLOAD MENU PHOTOS?</Text>
      </View>

      {/* Benefit rows */}
      <View style={es.benefitRow}>
        <Ionicons name="eye" size={18} color={colors.accentPrimary} style={es.benefitIcon} />
        <Text style={es.benefitText}>
          <Text style={es.benefitBold}>{'Donors see them first.'}</Text>
          {' A clear menu helps them decide to sponsor here.'}
        </Text>
      </View>

      <View style={es.benefitRow}>
        <MaterialCommunityIcons name="camera-plus" size={18} color={colors.accentPrimary} style={es.benefitIcon} />
        <Text style={es.benefitText}>
          <Text style={es.benefitBold}>{'Up to 10 photos.'}</Text>
          {' Add more anytime, reorder or remove them.'}
        </Text>
      </View>

      <View style={es.benefitRow}>
        <MaterialCommunityIcons name="sync" size={18} color={colors.accentPrimary} style={es.benefitIcon} />
        <Text style={es.benefitText}>
          <Text style={es.benefitBold}>{'Updates apply instantly'}</Text>
          {' — donors always see your latest menu.'}
        </Text>
      </View>
    </View>

    {/* Not ready link */}
    <TouchableOpacity style={es.notReadyRow} onPress={onPostDonation} activeOpacity={0.7} hitSlop={8}>
      <Text style={es.notReadyMuted}>Not ready?{'  '}</Text>
      <Text style={es.notReadyLink}>Post a donation instead</Text>
      <Ionicons name="arrow-forward" size={14} color={colors.accentPrimary} />
    </TouchableOpacity>

  </ScrollView>
));

const es = StyleSheet.create({
  scroll: {
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingBottom: 32,
  },

  // Illustration
  illoWrap: {
    width: 128,
    height: 128,
    borderRadius: 32,
    backgroundColor: colors.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing['2xl'],
    marginBottom: 4,
  },

  // Hero
  eyebrow: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['12'],
    color: colors.textMuted,
    textAlign: 'center',
  },
  title: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['2xl'],
    letterSpacing: -0.6,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: 4,
  },
  sub: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['14'],
    lineHeight: 21,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 8,
    marginTop: 6,
  },

  // WHY section
  whySection: {
    alignSelf: 'stretch',
    marginTop: spacing['3xl'],
  },
  whyLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  whyLabel: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['12'],
    letterSpacing: 0.96,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  benefitIcon: { marginTop: 1 },
  benefitText: {
    flex: 1,
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    lineHeight: 18,
    color: colors.textPrimary,
  },
  benefitBold: {
    fontFamily: fontFamilies.bold,
  },

  // Not ready link
  notReadyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing['2xl'],
  },
  notReadyMuted: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['14'],
    color: colors.textMuted,
  },
  notReadyLink: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['14'],
    color: colors.accentPrimary,
  },
});

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function MenuPhotosScreen({ navigation }: Props) {
  const [photos, setPhotos]               = useState<MenuPhoto[]>([]);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [uploading, setUploading]         = useState(false);
  const [loadingPhotos, setLoadingPhotos] = useState(true);

  useEffect(() => {
    getMenuPhotos()
      .then((fetched) => setPhotos(fetched))
      .catch(() => {})
      .finally(() => setLoadingPhotos(false));
  }, []);

  const isEmpty   = photos.length === 0;
  const slotsLeft = useMemo(() => MAX_PHOTOS - photos.length, [photos.length]);
  const gridData  = useMemo<GridItem[]>(
    () => (photos.length < MAX_PHOTOS ? [...photos, ADD_SLOT] : photos),
    [photos],
  );

  const handleBack = useCallback(() => navigation.goBack(), [navigation]);

  const handleDelete = useCallback(async (photoId: string) => {
    try {
      const updated = await deleteMenuPhoto(photoId);
      setPhotos(updated);
    } catch {
      Alert.alert('Error', 'Could not delete photo. Please try again.');
    }
  }, []);

  const handleAddPhoto = useCallback(async () => {
    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0 || uploading) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      setUploading(true);
      try {
        const updated = await uploadMenuPhotos(
          result.assets.map((a) => ({
            uri:  a.uri,
            type: a.mimeType ?? 'image/jpeg',
            name: a.fileName  ?? 'photo.jpg',
          })),
        );
        setPhotos(updated);
      } catch {
        Alert.alert('Upload failed', 'Could not upload photos. Please try again.');
      } finally {
        setUploading(false);
      }
    }
  }, [photos.length, uploading]);

  const handlePostDonation = useCallback(
    () => (navigation.getParent() as any)?.navigate('Donations', { screen: 'PostDonation' }),
    [navigation],
  );

  const handleCarouselScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.x / CONTENT_W);
      setCarouselIndex(Math.max(0, Math.min(idx, photos.length - 1)));
    },
    [photos.length],
  );

  // ─── Grid item ──────────────────────────────────────────────────────────────

  const renderGridItem = useCallback(({ item }: { item: GridItem }) => {
    if (item === ADD_SLOT) {
      return (
        <TouchableOpacity
          style={styles.addTile}
          activeOpacity={0.75}
          onPress={handleAddPhoto}
        >
          <MaterialCommunityIcons name="image-plus" size={28} color={colors.textMuted} />
          <Text style={styles.addTileTitle}>Add photo</Text>
          <Text style={styles.addTileSub}>{slotsLeft} slots left</Text>
        </TouchableOpacity>
      );
    }
    const photo = item as MenuPhoto;
    return (
      <View style={styles.photoTile}>
        <Image
          source={{ uri: photo.url }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={styles.deleteBadge}
          onPress={() => handleDelete(photo.id)}
          hitSlop={8}
        >
          <Ionicons name="close" size={12} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
    );
  }, [handleAddPhoto, handleDelete, slotsLeft]);

  const keyExtractor = useCallback(
    (item: GridItem, idx: number) =>
      item === ADD_SLOT ? 'add-slot' : `photo-${(item as MenuPhoto).id}-${idx}`,
    [],
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Menu photos</Text>
        <View style={styles.backBtn} />
      </View>

      {/* ── Loading ───────────────────────────────────────────────────────── */}
      {loadingPhotos && (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.accentPrimary} />
        </View>
      )}

      {/* ── Empty state ───────────────────────────────────────────────────── */}
      {!loadingPhotos && isEmpty && (
        <EmptyMenuPhotos onPostDonation={handlePostDonation} />
      )}

      {/* ── Filled state ──────────────────────────────────────────────────── */}
      {!loadingPhotos && !isEmpty && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* Hero */}
          <Text style={styles.eyebrow}>Your public menu</Text>
          <Text style={styles.heroTitle}>Menu photos</Text>
          <Text style={styles.heroDesc}>
            {'Upload photos of your menu board, paper menu, or dish shots. Donors browse these when deciding to sponsor.'}
          </Text>

          {/* HOW DONORS SEE YOUR MENU */}
          <View style={styles.previewLabelRow}>
            <Ionicons name="eye" size={14} color={colors.textMuted} />
            <Text style={styles.previewLabel}>HOW DONORS SEE YOUR MENU</Text>
          </View>

          <View style={[styles.carouselWrap, { height: CAROUSEL_H }]}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleCarouselScroll}
              scrollEventThrottle={16}
            >
              {photos.map((photo, idx) => (
                <Image
                  key={photo.id ?? idx}
                  source={{ uri: photo.url }}
                  style={{ width: CONTENT_W, height: CAROUSEL_H }}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          </View>

          {/* Dot indicators */}
          <View style={styles.dotsRow}>
            {photos.map((_, idx) => (
              <View
                key={idx}
                style={[styles.dot, idx === carouselIndex && styles.dotActive]}
              />
            ))}
          </View>

          <Text style={styles.previewHint}>
            {`Swipe to see all ${photos.length} photos exactly as they appear on your donor-facing page.`}
          </Text>

          {/* Your photos — section header */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Your photos</Text>
            <Text style={styles.sectionCount}>{photos.length} uploaded · max {MAX_PHOTOS}</Text>
          </View>

          {/* Photo grid */}
          <FlatList
            data={gridData}
            keyExtractor={keyExtractor}
            renderItem={renderGridItem}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            scrollEnabled={false}
            removeClippedSubviews={false}
            maxToRenderPerBatch={MAX_PHOTOS + 1}
            windowSize={3}
          />

          {/* Reorder hint */}
          <View style={styles.hintRow}>
            <Ionicons name="swap-vertical" size={14} color={colors.textMuted} />
            <Text style={styles.hintText}>
              {'Long-press a photo to reorder. Photo #1 is the first one donors see.'}
            </Text>
          </View>
        </ScrollView>
      )}

      {/* ── Sticky bottom button — show when there are slots left or when empty */}
      {!loadingPhotos && (isEmpty || slotsLeft > 0) && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.addBtn, uploading && styles.addBtnDisabled]}
            activeOpacity={0.85}
            onPress={handleAddPhoto}
            disabled={uploading}
          >
            {uploading
              ? <ActivityIndicator size="small" color={colors.textInverse} />
              : <MaterialCommunityIcons name="image-plus" size={18} color={colors.textInverse} />
            }
            <Text style={styles.addBtnText}>
              {uploading ? 'Uploading…' : 'Add photos'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // ── Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.lg,
  },
  backBtn: { width: 40, alignItems: 'flex-start' },
  headerTitle: {
    flex: 1,
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.md,
    letterSpacing: -0.225,
    color: colors.textPrimary,
    textAlign: 'center',
  },

  // ── Scroll container (filled state)
  scroll: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: 32,
  },

  // ── Hero (filled)
  eyebrow: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['12'],
    letterSpacing: -0.18,
    color: colors.textMuted,
    marginBottom: 2,
  },
  heroTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['2xl'],
    letterSpacing: -0.6,
    color: colors.textPrimary,
  },
  heroDesc: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['14'],
    lineHeight: 21,
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: spacing['2xl'],
  },

  // ── Donor preview (filled)
  previewLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  previewLabel: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.xs,
    letterSpacing: 0.88,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  carouselWrap: {
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.borderDefault,
  },
  dotActive: {
    width: 20,
    backgroundColor: colors.accentPrimary,
  },
  previewHint: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: spacing['2xl'],
  },

  // ── Your photos (filled)
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.md,
    letterSpacing: -0.225,
    color: colors.textPrimary,
  },
  sectionCount: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['12'],
    color: colors.textMuted,
  },

  // ── Grid (filled)
  columnWrapper: { gap: 8, marginBottom: 8 },

  photoTile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: radius.input,
    overflow: 'hidden',
    backgroundColor: colors.surfaceSecondary,
  },
  deleteBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: radius.input,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addTileTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
  },
  addTileSub: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    color: colors.textMuted,
  },

  // ── Reorder hint (filled)
  hintRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: spacing.lg,
  },
  hintText: {
    flex: 1,
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    lineHeight: 17.4,
    color: colors.textMuted,
  },

  // ── Bottom bar (shared)
  bottomBar: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderDefault,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentPrimary,
    borderRadius: radius.card,
    height: 54,
    gap: 8,
  },
  addBtnDisabled: {
    opacity: 0.7,
  },
  addBtnText: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.md,
    letterSpacing: letterSpacings.button,
    color: colors.textInverse,
  },
});
