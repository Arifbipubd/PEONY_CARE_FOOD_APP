import { useState, useCallback, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  colors, spacing, radius, fontSizes, fontWeights, fontFamilies, letterSpacings,
} from '../../constants/theme';
import { ProfileStackParamList } from '../../navigation/ReceiverTabs';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'TermsPrivacy'>;
};

type Tab = 'terms' | 'privacy' | 'cookies';

type BodyPart = { text: string; accent?: boolean };

type SectionData = {
  heading: string;
  body?: string;
  bodyParts?: BodyPart[];
  bullets?: string[];
  afterBullets?: string;
};

const HERO_SUBTITLE: Record<Tab, string> = {
  terms:   'How Peony Care works for receivers.',
  privacy: 'What we collect and how we use it.',
  cookies: 'How Peony Care handles your data and what you agree to.',
};

const TERMS_SECTIONS: SectionData[] = [
  {
    heading: '1. Eligibility',
    body: 'Peony Care is for Singapore residents who need food assistance. You register with your mobile number — no NRIC, income document, or other verification required.',
  },
  {
    heading: '2. One claim per day',
    body: 'Each receiver can claim one food donation every 24 hours. This is a fairness rule that helps us reach more people across the island. Your daily limit resets at midnight Singapore time.',
  },
  {
    heading: '3. Pickup & etiquette',
    body: 'If you claim food, please collect it within the stated pickup window.',
    bullets: [
      'Show your QR code at pickup.',
      'Be respectful to restaurant staff.',
      "Don't resell donated food.",
      "If you can't make it, cancel the claim so others can take it.",
    ],
    afterBullets: 'Repeated no-shows may result in a temporary suspension.',
  },
  {
    heading: '4. Food safety',
    body: "Restaurants and individual donors are responsible for the quality and safety of the food they post. Peony Care is a platform — we don't prepare, store, or transport food. If you ever receive food that looks unsafe, refuse it and report it through the app.",
  },
  {
    heading: '5. Account termination',
    body: 'We may suspend or terminate accounts that abuse the service, including fraudulent claims, harassment of restaurant staff, or repeated no-shows.',
  },
];

const PRIVACY_SECTIONS: SectionData[] = [
  {
    heading: 'What we collect',
    bullets: [
      'Account: your first name and Singapore mobile number.',
      'Location: only when you enable GPS to find food near you.',
      'Activity: claims, pickup history, and no-show count.',
    ],
  },
  {
    heading: 'How we use it',
    body: "We use your data to show food donations near you, send SMS verification codes, and remind you about pickups you've claimed. We don't sell your data — ever.",
  },
  {
    heading: 'PDPA compliance',
    bodyParts: [
      { text: "Peony Care complies with Singapore's Personal Data Protection Act (PDPA). You can request to view, correct, or delete your data at any time by emailing " },
      { text: 'privacy@peonycare.sg', accent: true },
      { text: '.' },
    ],
  },
  {
    heading: 'Sharing',
    body: "Restaurants only see your claim code and first name at pickup. They never see your phone number, location, or claim history. Donors never see any of your details.",
  },
];

const COOKIES_SECTIONS: SectionData[] = [
  {
    heading: 'Essential cookies',
    body: "Required for the app to work — login session, security, and basic functionality. These can't be turned off.",
  },
  {
    heading: 'Analytics',
    body: 'We use anonymous usage analytics to understand which features are useful. You can opt out from the Notifications & Privacy section in your profile.',
  },
  {
    heading: 'Third parties',
    body: 'We use Cloudflare for security. No tracking pixels, no ad networks.',
  },
];

const CONTENT: Record<Tab, SectionData[]> = {
  terms:   TERMS_SECTIONS,
  privacy: PRIVACY_SECTIONS,
  cookies: COOKIES_SECTIONS,
};

const BulletItem = memo(function BulletItem({ text }: { text: string }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bulletDot}>{'•'}</Text>
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
});

const SectionBlock = memo(function SectionBlock({
  section,
  isLast,
}: {
  section: SectionData;
  isLast: boolean;
}) {
  return (
    <View style={!isLast ? styles.sectionGap : undefined}>
      <Text style={styles.sectionHeading}>{section.heading}</Text>

      {section.body ? (
        <Text style={styles.sectionBody}>{section.body}</Text>
      ) : null}

      {section.bodyParts ? (
        <Text style={styles.sectionBody}>
          {section.bodyParts.map((part, i) =>
            part.accent ? (
              <Text key={i} style={styles.accentInline}>{part.text}</Text>
            ) : (
              <Text key={i}>{part.text}</Text>
            )
          )}
        </Text>
      ) : null}

      {section.bullets ? (
        <View style={section.body ? styles.bulletsGap : undefined}>
          {section.bullets.map((b, i) => (
            <BulletItem key={i} text={b} />
          ))}
        </View>
      ) : null}

      {section.afterBullets ? (
        <Text style={[styles.sectionBody, styles.afterBulletsGap]}>
          {section.afterBullets}
        </Text>
      ) : null}
    </View>
  );
});

export default function TermsPrivacyScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('terms');

  const selectTerms   = useCallback(() => setActiveTab('terms'),   []);
  const selectPrivacy = useCallback(() => setActiveTab('privacy'), []);
  const selectCookies = useCallback(() => setActiveTab('cookies'), []);

  const sections = CONTENT[activeTab];

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
        <Text style={styles.eyebrow}>Our promise</Text>
        <Text style={styles.title}>Terms & privacy</Text>
        <Text style={styles.subtitle}>{HERO_SUBTITLE[activeTab]}</Text>

        {/* Last updated */}
        <View style={styles.lastUpdatedCard}>
          <Ionicons name="time-outline" size={14} color={colors.textMuted} />
          <Text style={styles.lastUpdatedText}>Last updated 1 June 2026</Text>
        </View>

        {/* Tab switcher */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'terms' && styles.tabBtnActive]}
            onPress={selectTerms}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabLabel, activeTab === 'terms' && styles.tabLabelActive]}>
              Terms
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'privacy' && styles.tabBtnActive]}
            onPress={selectPrivacy}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabLabel, activeTab === 'privacy' && styles.tabLabelActive]}>
              Privacy
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'cookies' && styles.tabBtnActive]}
            onPress={selectCookies}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabLabel, activeTab === 'cookies' && styles.tabLabelActive]}>
              Cookies
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {sections.map((section, i) => (
          <SectionBlock
            key={section.heading}
            section={section}
            isLast={i === sections.length - 1}
          />
        ))}

        {/* Footer */}
        <View style={styles.footerCard}>
          <Text style={styles.footerNote}>Questions about your data? Email</Text>
          <Text style={styles.footerEmail}>privacy@peonycare.sg.</Text>
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
    color: colors.textMuted,
    marginBottom: spacing.sm,
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
  },

  // ── Last updated ──────────────────────────────────────────────────────────────
  lastUpdatedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.input,
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
    marginTop: 8,
    marginBottom: spacing['2xl'],
  },
  lastUpdatedText: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    color: colors.textMuted,
  },

  // ── Tab switcher ──────────────────────────────────────────────────────────────
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing['2xl'],
  },
  tabBtn: {
    flex: 1,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnActive: {
    backgroundColor: colors.textPrimary,
  },
  tabLabel: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['12'],
    color: colors.textPrimary,
  },
  tabLabelActive: {
    color: colors.textInverse,
  },

  // ── Sections ──────────────────────────────────────────────────────────────────
  sectionGap: {
    marginBottom: spacing['2xl'],
  },
  sectionHeading: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.md,
    letterSpacing: -0.225,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  sectionBody: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    lineHeight: 20.8,
    color: colors.textMuted,
  },
  accentInline: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.sm,
    lineHeight: 20.8,
    color: colors.accentPrimary,
  },

  // ── Bullets ───────────────────────────────────────────────────────────────────
  bulletsGap: {
    marginTop: spacing.xs,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: 4,
  },
  bulletDot: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    lineHeight: 20.8,
    color: colors.textMuted,
  },
  bulletText: {
    flex: 1,
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    lineHeight: 20.8,
    color: colors.textMuted,
  },
  afterBulletsGap: {
    marginTop: spacing.md,
  },

  // ── Footer ────────────────────────────────────────────────────────────────────
  footerCard: {
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.input,
    paddingVertical: spacing.lg,
    paddingHorizontal: 16,
    marginTop: spacing.sm,
  },
  footerNote: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    lineHeight: 18,
    color: colors.textMuted,
  },
  footerEmail: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['12'],
    lineHeight: 18,
    color: colors.accentPrimary,
  },
});
