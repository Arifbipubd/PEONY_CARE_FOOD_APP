import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { FoodItem, FoodCategory } from '../types';
import { colors, spacing, radius, fontSizes, fontWeights, fontFamilies, layout } from '../constants/theme';

interface FoodCardProps {
  item: FoodItem;
  onPress: () => void;
}

function formatCategory(cat: FoodCategory): string {
  return cat.charAt(0) + cat.slice(1).toLowerCase();
}

function formatPickupWindow(start: string, end: string): string {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-SG', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  return `Pickup ${fmt(start)} – ${fmt(end)}`;
}

function sponsorLabel(item: FoodItem): string {
  if (item.sponsorshipType === 'SPONSORED_NAMED')
    return `Sponsored by ${item.sponsorDisplayName ?? ''}`;
  if (item.sponsorshipType === 'SPONSORED_ANONYMOUS') return 'Sponsored anonymously';
  return 'Direct from restaurant';
}

const FoodCard = React.memo(function FoodCard({ item, onPress }: FoodCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.card}>

      {/* Image + overlaid badges */}
      <View>
        <Image source={{ uri: item.photoUrl || undefined }} style={styles.image} resizeMode="cover" />
        <View style={styles.imageBadges}>
          <View style={styles.badgeCategory}>
            <Text style={styles.badgeCategoryText}>{formatCategory(item.category)}</Text>
          </View>
          <View style={styles.badgeQty}>
            <Text style={styles.badgeQtyText}>{item.quantityAvailable} left</Text>
          </View>
        </View>
      </View>

      {/* Card body */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{item.name}</Text>

        <View style={styles.restaurantRow}>
          <Ionicons name="storefront-outline" size={12} color={colors.textMuted} />
          <Text style={styles.restaurantText} numberOfLines={1}>{item.restaurantName}</Text>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="navigate" size={12} color={colors.textMuted} />
            <Text style={styles.metaText}>{item.distanceKm.toFixed(1)} km</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time" size={12} color={colors.pickupOrange} />
            <Text style={styles.pickupText}>
              {formatPickupWindow(item.pickupStart, item.pickupEnd)}
            </Text>
          </View>
        </View>

        <View style={styles.sponsorRow}>
          {item.sponsorshipType === 'DIRECT' ? (
            <Ionicons name="storefront-outline" size={12} color={colors.textMuted} />
          ) : item.sponsorshipType === 'SPONSORED_NAMED' ? (
            <MaterialCommunityIcons name="hand-heart" size={12} color={colors.warningYellow} />
          ) : (
            <Ionicons name="heart" size={12} color={colors.warningYellow} />
          )}
          <Text style={styles.sponsorText}>{sponsorLabel(item)}</Text>
        </View>
      </View>

    </TouchableOpacity>
  );
});

export default FoodCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: spacing.lg,
  },
  image: {
    width: '100%',
    height: layout.cardImageHeight,
    backgroundColor: colors.borderDefault,
  },
  imageBadges: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  badgeCategory: {
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderRadius: radius.pill,
    paddingHorizontal: 12,  // component-specific, not in spacing scale
    paddingVertical: 5,     // component-specific, not in spacing scale
  },
  badgeCategoryText: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.xs,       // 11px
    letterSpacing: 0.22,          // component-specific, not in letterSpacings scale
    color: colors.textInverse,
  },
  badgeQty: {
    backgroundColor: colors.accentPrimary,
    borderRadius: radius.pill,
    paddingHorizontal: 12,  // component-specific, not in spacing scale
    paddingVertical: 5,     // component-specific, not in spacing scale
    shadowColor: colors.accentPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 4,
  },
  badgeQtyText: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.xs,       // 11px
    color: colors.textInverse,
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.md,       // 15px
    letterSpacing: -0.225,        // component-specific, not in letterSpacings scale
    color: colors.textPrimary,
  },
  restaurantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,                       // component-specific, not in spacing scale
    marginTop: 4,                 // component-specific, not in spacing scale
  },
  restaurantText: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,       // 13px
    color: colors.textMuted,
    flex: 1,
    includeFontPadding: false,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,                       // component-specific, not in spacing scale
    marginTop: spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,                       // component-specific, not in spacing scale
  },
  metaText: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],    // 12px
    color: colors.textMuted,
    includeFontPadding: false,
  },
  pickupText: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes['12'],    // 12px
    color: colors.pickupOrange,
    includeFontPadding: false,
  },
  sponsorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,                       // component-specific, not in spacing scale
    marginTop: 8,                 // component-specific, not in spacing scale
  },
  sponsorText: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes['12'],    // 12px
    color: colors.textMuted,
    includeFontPadding: false,
  },
});
