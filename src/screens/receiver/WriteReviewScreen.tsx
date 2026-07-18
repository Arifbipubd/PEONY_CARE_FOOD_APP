import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { HomeStackParamList } from '../../navigation/ReceiverTabs';
import { submitReview } from '../../services/receiver';
import {
  colors,
  spacing,
  radius,
  fontSizes,
  fontFamilies,
} from '../../constants/theme';

type Props = {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'WriteReview'>;
  route: RouteProp<HomeStackParamList, 'WriteReview'>;
};

const TAGS = [
  'Friendly staff',
  'Fresh & tasty',
  'Quick pickup',
  'Generous portion',
  'Clean packaging',
];

const RATING_LABELS = ['No rating yet', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

export default function WriteReviewScreen({ navigation, route }: Props) {
  const { claimId, restaurantName, restaurantPhotoUrl, foodName } = route.params;

  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [commentFocused, setCommentFocused] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const ratingLabel = useMemo(() => RATING_LABELS[rating], [rating]);

  const handleStarPress = useCallback((star: number) => {
    setRating(star);
  }, []);

  const handleTagToggle = useCallback((tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag],
    );
  }, []);

  const handleSubmit = useCallback(async () => {
    if (rating === 0) return;
    setSubmitting(true);
    try {
      await submitReview({ claimId, rating, tags: selectedTags, comment: comment.trim() });
      navigation.navigate('ReceiverHome');
    } catch {
      setSubmitting(false);
    }
  }, [rating, selectedTags, comment, claimId, navigation]);

  const handleMaybeLater = useCallback(() => {
    navigation.navigate('ReceiverHome');
  }, [navigation]);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scroll}
      >
        {/* Back arrow */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.eyebrow}>Your experience</Text>
          <Text style={styles.title}>Write a review</Text>
        </View>

        {/* Restaurant row */}
        <View style={styles.restaurantRow}>
          {restaurantPhotoUrl ? (
            <Image
              source={{ uri: restaurantPhotoUrl }}
              style={styles.restaurantPhoto}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.restaurantPhoto, styles.restaurantPhotoFallback]}>
              <Ionicons name="storefront" size={28} color={colors.textMuted} />
            </View>
          )}
          <View style={styles.restaurantInfo}>
            <Text style={styles.restaurantName} numberOfLines={1}>
              {restaurantName}
            </Text>
            <Text style={styles.meta}>{foodName} · collected today</Text>
          </View>
        </View>

        {/* Star rating */}
        <View style={styles.starsSection}>
          <Text style={styles.tapToRate}>Tap to rate</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(star => (
              <TouchableOpacity
                key={star}
                onPress={() => handleStarPress(star)}
                hitSlop={4}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={38}
                  color={star <= rating ? colors.accentPrimary : colors.borderDefault}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ratingHint}>{ratingLabel}</Text>
        </View>

        {/* What stood out */}
        <Text style={styles.tagsLabel}>WHAT STOOD OUT? (OPTIONAL)</Text>
        <View style={styles.tagsRow}>
          {TAGS.map(tag => {
            const selected = selectedTags.includes(tag);
            return (
              <TouchableOpacity
                key={tag}
                style={[styles.tag, selected && styles.tagSelected]}
                onPress={() => handleTagToggle(tag)}
                activeOpacity={0.7}
              >
                <Text style={[styles.tagText, selected && styles.tagTextSelected]}>
                  {tag}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Comment */}
        <Text style={styles.commentLabel}>Add a comment (optional)</Text>
        <TextInput
          style={[styles.commentInput, commentFocused && styles.commentInputFocused]}
          placeholder="Share a little about your experience…"
          placeholderTextColor={colors.textMuted}
          multiline
          value={comment}
          onChangeText={setComment}
          onFocus={() => setCommentFocused(true)}
          onBlur={() => setCommentFocused(false)}
          textAlignVertical="top"
        />

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, rating === 0 && styles.submitBtnDisabled]}
          activeOpacity={0.85}
          onPress={handleSubmit}
          disabled={submitting || rating === 0}
        >
          {submitting ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <>
              <Ionicons name="send" size={18} color={colors.textInverse} />
              <Text style={styles.submitBtnText}>Submit review</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Maybe later */}
        <TouchableOpacity
          style={styles.laterBtn}
          activeOpacity={0.7}
          onPress={handleMaybeLater}
        >
          <Text style={styles.laterBtnText}>Maybe later</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },

  scroll: { paddingBottom: spacing['2xl'] },

  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginLeft: spacing['2xl'],
    marginTop: spacing.lg,
  },

  headerSection: {
    paddingHorizontal: spacing['2xl'],
    marginTop: spacing.md,
  },
  eyebrow: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginBottom: 6,
  },
  title: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['2xl'],
    letterSpacing: -0.6,
    color: colors.textPrimary,
  },

  restaurantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    marginTop: spacing['2xl'],
    gap: spacing.md,
  },
  restaurantPhoto: {
    width: 64,
    height: 64,
    borderRadius: radius.sm,
  },
  restaurantPhotoFallback: {
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restaurantInfo: { flex: 1 },
  restaurantName: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.md,
    letterSpacing: -0.225,
    color: colors.textPrimary,
  },
  meta: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    color: colors.textMuted,
    marginTop: 2,
  },

  starsSection: {
    alignItems: 'center',
    marginTop: spacing['2xl'],
  },
  tapToRate: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['14'],
    color: colors.textPrimary,
    textAlign: 'center',
    paddingTop: 8,
    paddingHorizontal: spacing['2xl'],
  },
  starsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  ratingHint: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    color: colors.textMuted,
    textAlign: 'center',
    paddingBottom: 8,
    marginTop: spacing.sm,
  },

  tagsLabel: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['12'],
    letterSpacing: 0.96,
    color: colors.textMuted,
    textTransform: 'uppercase',
    paddingTop: spacing['2xl'],
    paddingHorizontal: spacing['2xl'],
    paddingBottom: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing['2xl'],
    gap: spacing.sm,
  },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    backgroundColor: colors.surface,
  },
  tagSelected: {
    borderColor: colors.accentPrimary,
  },
  tagText: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['12'],
    letterSpacing: 0.24,
    color: colors.textPrimary,
  },
  tagTextSelected: {
    color: colors.accentPrimary,
  },

  commentLabel: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    paddingHorizontal: spacing['2xl'],
    marginTop: spacing['2xl'],
    marginBottom: spacing.sm,
  },
  commentInput: {
    marginHorizontal: spacing['2xl'],
    borderRadius: radius.input,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['14'],
    lineHeight: 21,
    color: colors.textPrimary,
    height: 110,
  },
  commentInputFocused: {
    borderColor: colors.accentPrimary,
  },

  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentPrimary,
    borderRadius: radius.card,
    height: 54,
    marginHorizontal: spacing['2xl'],
    marginTop: spacing['2xl'],
    gap: 8,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['14'],
    letterSpacing: 0.28,
    color: colors.textInverse,
  },

  laterBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.card,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    height: 54,
    marginHorizontal: spacing['2xl'],
    marginTop: 10,
  },
  laterBtnText: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['14'],
    letterSpacing: 0.28,
    color: colors.textPrimary,
  },
});
