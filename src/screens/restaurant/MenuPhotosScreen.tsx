import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
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

const MOCK_PHOTOS = [
  'https://picsum.photos/seed/menu1/800/540',
  'https://picsum.photos/seed/menu2/800/540',
];

const ADD_SLOT = '__ADD__';

type GridItem = string;

export default function MenuPhotosScreen({ navigation }: Props) {
  const [photos, setPhotos]               = useState<string[]>(MOCK_PHOTOS);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const slotsLeft = useMemo(() => MAX_PHOTOS - photos.length, [photos.length]);

  const gridData = useMemo<GridItem[]>(
    () => (photos.length < MAX_PHOTOS ? [...photos, ADD_SLOT] : photos),
    [photos],
  );

  const handleBack         = useCallback(() => navigation.goBack(), [navigation]);
  const handleDelete       = useCallback(
    (uri: string) => setPhotos(prev => prev.filter(p => p !== uri)),
    [],
  );
  const handleAddPhotoTile = useCallback(() => { /* TODO: launch image picker */ }, []);
  const handleAddPhotosBtn = useCallback(() => { /* TODO: launch image picker */ }, []);

  const handleCarouselScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.x / CONTENT_W);
      setCarouselIndex(Math.max(0, Math.min(idx, photos.length - 1)));
    },
    [photos.length],
  );

  // ─── Grid item ────────────────────────────────────────────────────────────────

  const renderGridItem = useCallback(({ item }: { item: GridItem }) => {
    if (item === ADD_SLOT) {
      return (
        <TouchableOpacity
          style={styles.addTile}
          activeOpacity={0.75}
          onPress={handleAddPhotoTile}
        >
          <MaterialCommunityIcons name="image-plus" size={28} color={colors.textMuted} />
          <Text style={styles.addTileTitle}>Add photo</Text>
          <Text style={styles.addTileSub}>{slotsLeft} slots left</Text>
        </TouchableOpacity>
      );
    }
    return (
      <View style={styles.photoTile}>
        <Image
          source={{ uri: item }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={styles.deleteBadge}
          onPress={() => handleDelete(item)}
          hitSlop={8}
        >
          <Ionicons name="close" size={12} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
    );
  }, [handleAddPhotoTile, handleDelete, slotsLeft]);

  const keyExtractor = useCallback(
    (item: GridItem, idx: number) => `grid-${idx}-${item.slice(-8)}`,
    [],
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Menu photos</Text>
        <View style={styles.backBtn} />
      </View>

      {/* ── Scrollable body ─────────────────────────────────────────────────── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
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
            {photos.map((uri, idx) => (
              <Image
                key={idx}
                source={{ uri }}
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

      {/* ── Sticky bottom button ─────────────────────────────────────────────── */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.addBtn}
          activeOpacity={0.85}
          onPress={handleAddPhotosBtn}
        >
          <Ionicons name="images" size={18} color={colors.textInverse} />
          <Text style={styles.addBtnText}>Add photos</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },

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

  // ── Scroll container
  scroll: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: 32,
  },

  // ── Hero
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

  // ── Donor preview
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

  // ── Your photos
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

  // ── Grid
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

  // ── Reorder hint
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

  // ── Bottom bar
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
  addBtnText: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.md,
    letterSpacing: letterSpacings.button,
    color: colors.textInverse,
  },
});
