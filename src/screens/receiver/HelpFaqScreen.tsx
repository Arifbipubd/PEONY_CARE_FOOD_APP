import { useState, useCallback, useEffect, useRef, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  colors, spacing, radius, fontSizes, fontWeights, fontFamilies, letterSpacings,
} from '../../constants/theme';
import { ProfileStackParamList } from '../../navigation/ReceiverTabs';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'HelpFaq'>;
};

type FaqEntry = { q: string; a: string };

const FAQ_ITEMS: FaqEntry[] = [
  {
    q: 'How many meals can I claim per day?',
    a: 'One complimentary meal per day, per account. Your daily limit resets at midnight Singapore time.',
  },
  {
    q: 'How do I claim a meal?',
    a: 'Browse meals nearby on the Home tab, tap Claim, then show the QR code at the restaurant within the pickup window.',
  },
  {
    q: 'What if I miss the pickup window?',
    a: 'The meal returns to the pool for others to claim. Your daily limit still resets the next day so you can try again.',
  },
  {
    q: 'What if the food I want is gone?',
    a: "Meals are first-come, first-served. Turn on notifications and we'll alert you when new food is posted nearby.",
  },
  {
    q: 'Is my data private?',
    a: "Yes. We follow Singapore's PDPA. Restaurants only see your claim code — not your name or any personal details.",
  },
];

const FaqItem = memo(function FaqItem({
  item,
  index,
  expanded,
  onToggle,
  isLast,
}: {
  item: FaqEntry;
  index: number;
  expanded: boolean;
  onToggle: (i: number) => void;
  isLast: boolean;
}) {
  const handlePress = useCallback(() => onToggle(index), [onToggle, index]);

  const maxHeightAnim = useRef(new Animated.Value(expanded ? 400 : 0)).current;
  const opacityAnim   = useRef(new Animated.Value(expanded ? 1 : 0)).current;
  const chevronAnim   = useRef(new Animated.Value(expanded ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(maxHeightAnim, {
      toValue: expanded ? 400 : 0,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: expanded ? 1 : 0,
        duration: expanded ? 260 : 140,
        useNativeDriver: true,
      }),
      Animated.timing(chevronAnim, {
        toValue: expanded ? 1 : 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [expanded]);

  const chevronRotate = chevronAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={[styles.faqCard, !isLast && styles.faqCardGap]}>
      <TouchableOpacity
        style={styles.faqHeader}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Text style={styles.faqQ}>{item.q}</Text>
        <Animated.View style={{ transform: [{ rotate: chevronRotate }] }}>
          <Ionicons name="chevron-down" size={18} color={colors.accentPrimary} />
        </Animated.View>
      </TouchableOpacity>
      <Animated.View style={[styles.faqBody, { maxHeight: maxHeightAnim }]}>
        <Animated.View style={{ opacity: opacityAnim }}>
          <Text style={styles.faqA}>{item.a}</Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
});

export default function HelpFaqScreen({ navigation }: Props) {
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set([0, 1, 2, 3, 4]));

  const toggleFaq = useCallback((i: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  }, []);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>

      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={8}>
        <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Hero */}
        <Text style={styles.eyebrow}>We're here for you</Text>
        <Text style={styles.title}>Help & FAQ</Text>
        <Text style={styles.subtitle}>Quick answers to the most common questions.</Text>

        {/* Contact us */}
        <Text style={styles.sectionLabel}>Contact us</Text>
        <View style={styles.contactCard}>
          <View style={styles.contactIconCircle}>
            <Ionicons name="mail" size={18} color={colors.accentPrimary} />
          </View>
          <View style={styles.contactText}>
            <Text style={styles.contactTitle}>Email us</Text>
            <Text style={styles.contactSub}>support@peonycare.sg</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </View>

        {/* Frequently asked */}
        <Text style={[styles.sectionLabel, styles.sectionLabelGap]}>Frequently asked</Text>

        {FAQ_ITEMS.map((item, i) => (
          <FaqItem
            key={i}
            item={item}
            index={i}
            expanded={expanded.has(i)}
            onToggle={toggleFaq}
            isLast={i === FAQ_ITEMS.length - 1}
          />
        ))}

        {/* Footer note */}
        <View style={styles.footerCard}>
          <Text style={styles.footerNote}>
            {'Still need help? Email '}
            <Text style={styles.footerEmail}>support@peonycare.sg</Text>
            {' — we usually reply within 4 hours.'}
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },

  backBtn: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    alignSelf: 'flex-start',
  },

  scroll: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['4xl'],
  },

  // ── Hero ─────────────────────────────────────────────────────────────────────
  eyebrow: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.textMuted,
    marginBottom: 6,
  },
  title: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacings.subheading,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['14'],
    fontWeight: fontWeights.regular,
    color: colors.textMuted,
    marginTop: 8,
    marginBottom: spacing['2xl'],
  },

  // ── Section labels ────────────────────────────────────────────────────────────
  sectionLabel: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    letterSpacing: -0.425,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  sectionLabelGap: {
    marginTop: spacing['2xl'],
  },

  // ── Contact card ──────────────────────────────────────────────────────────────
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.card,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: spacing.lg,
  },
  contactIconCircle: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  contactText: { flex: 1 },
  contactTitle: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['14'],
    fontWeight: fontWeights.semiBold,
    letterSpacing: -0.21,
    color: colors.textPrimary,
  },
  contactSub: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    fontWeight: fontWeights.regular,
    color: colors.textMuted,
    marginTop: 2,
  },

  // ── FAQ items ─────────────────────────────────────────────────────────────────
  faqCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.input,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  faqCardGap: {
    marginBottom: spacing.md,
  },
  faqBody: {
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: spacing.md,
  },
  faqQ: {
    flex: 1,
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['14'],
    fontWeight: fontWeights.semiBold,
    letterSpacing: -0.21,
    lineHeight: 19.6,
    color: colors.accentPrimary,
  },
  faqA: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    lineHeight: 19.5,
    color: colors.textMuted,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },

  // ── Footer note ───────────────────────────────────────────────────────────────
  footerCard: {
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.input,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: spacing['3xl'],
  },
  footerNote: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    fontWeight: fontWeights.regular,
    color: colors.textMuted,
    lineHeight: 18,
  },
  footerEmail: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['12'],
    fontWeight: fontWeights.semiBold,
    lineHeight: 18,
    color: colors.accentPrimary,
  },
});
