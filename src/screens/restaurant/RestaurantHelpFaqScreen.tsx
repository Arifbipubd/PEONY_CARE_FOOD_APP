import { useState, useCallback, useEffect, useRef, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Easing,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  colors, spacing, radius, fontSizes, fontFamilies, letterSpacings,
} from '../../constants/theme';
import { ProfileStackParamList } from '../../navigation/RestaurantTabs';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'RestaurantHelpFaq'>;
};

type FaqEntry = { q: string; a: string };

const FAQ_ITEMS: FaqEntry[] = [
  {
    q: 'How do I post a donation?',
    a: 'From the home screen, tap the Post button. Fill in dish details, quantity, and the pickup window — that\'s it.',
  },
  {
    q: 'How do I close an active donation?',
    a: 'Open the donation detail and tap Close. Closed donations move to the Inactive tab and you can reactivate them later.',
  },
  {
    q: 'What is a sponsored donation?',
    a: 'When an individual donor sponsors meals at your restaurant, they pay for the food. You\'ll get a notification listing the dishes — just prepare them for pickup.',
  },
  {
    q: 'What if a receiver doesn\'t show up?',
    a: 'After the pickup window ends, tap No-show on the claim. The portion returns to the pool so others can claim it.',
  },
  {
    q: 'Is there a fee to use Peony Care?',
    a: 'No. Posting donations and receiving sponsored orders is free for restaurant partners — forever.',
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

export default function RestaurantHelpFaqScreen({ navigation }: Props) {
  const [expanded, setExpanded] = useState<Set<number>>(
    () => new Set([0, 1, 2, 3, 4]),
  );

  const toggleFaq = useCallback((i: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  }, []);

  const handleEmail = useCallback(() => {
    Linking.openURL('mailto:partners@peonycare.sg');
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
        <Text style={styles.eyebrow}>We're here for you</Text>
        <Text style={styles.title}>Help & FAQ</Text>
        <Text style={styles.subtitle}>Quick answers for restaurant partners.</Text>

        <Text style={styles.sectionLabel}>Contact us</Text>
        <TouchableOpacity style={styles.contactCard} onPress={handleEmail} activeOpacity={0.7}>
          <View style={styles.contactIconCircle}>
            <Ionicons name="mail" size={18} color={colors.accentPrimary} />
          </View>
          <View style={styles.contactText}>
            <Text style={styles.contactTitle}>Email us</Text>
            <Text style={styles.contactSub}>partners@peonycare.sg</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>

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

        <View style={styles.footerCard}>
          <Text style={styles.footerNote}>
            {'Still need help? Email '}
            <Text style={styles.footerEmail} onPress={handleEmail}>
              partners@peonycare.sg
            </Text>
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

  eyebrow: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginBottom: 6,
  },
  title: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['2xl'],
    letterSpacing: letterSpacings.subheading,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['14'],
    color: colors.textMuted,
    marginTop: 8,
    marginBottom: spacing['2xl'],
  },

  sectionLabel: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.lg,
    letterSpacing: -0.425,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  sectionLabelGap: { marginTop: spacing['2xl'] },

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
    letterSpacing: -0.21,
    color: colors.textPrimary,
  },
  contactSub: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    color: colors.textMuted,
    marginTop: 2,
  },

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
  faqCardGap: { marginBottom: spacing.md },
  faqBody: { overflow: 'hidden' },
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
    letterSpacing: -0.21,
    lineHeight: 19.6,
    color: colors.accentPrimary,
  },
  faqA: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    lineHeight: 19.5,
    color: colors.textMuted,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },

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
    color: colors.textMuted,
    lineHeight: 18,
  },
  footerEmail: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['12'],
    lineHeight: 18,
    color: colors.accentPrimary,
  },
});
