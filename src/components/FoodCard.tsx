import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { FoodItem } from '../types';
import { colors, spacing, radius, fontSizes, fontWeights, layout } from '../constants/theme';

interface FoodCardProps {
  item: FoodItem;
  onPress: () => void;
}

function formatPickupWindow(start: string, end: string): string {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-SG', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  return `Pickup: ${fmt(start)} – ${fmt(end)}`;
}

function sponsorLabel(item: FoodItem): string {
  if (item.sponsorshipType === 'SPONSORED_NAMED')
    return `Sponsored by ${item.sponsorDisplayName ?? ''}`;
  if (item.sponsorshipType === 'SPONSORED_ANONYMOUS') return 'Sponsored anonymously';
  return 'Direct from restaurant';
}

export default function FoodCard({ item, onPress }: FoodCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.card}>
      <Image source={{ uri: item.photoUrl }} style={styles.image} resizeMode="cover" />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.restaurant} numberOfLines={1}>
          {item.restaurantName}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.distance}>{item.distanceKm.toFixed(1)} km</Text>
          <Text style={styles.dot}>  ·  </Text>
          <Text style={styles.pickup}>
            {formatPickupWindow(item.pickupStart, item.pickupEnd)}
          </Text>
        </View>
        <Text style={item.sponsorshipType === 'DIRECT' ? styles.sponsorDirect : styles.sponsorSponsored}>
          {sponsorLabel(item)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

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
  content: {
    padding: spacing.lg,
    gap: spacing.xs,
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  restaurant: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  distance: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  dot: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  pickup: {
    fontSize: fontSizes.sm,
    color: colors.accentPrimary,
    fontWeight: fontWeights.medium,
  },
  sponsorDirect: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  sponsorSponsored: {
    fontSize: fontSizes.sm,
    color: colors.warningYellow,
  },
});
