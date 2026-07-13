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
  colors, spacing, radius, fontSizes, fontFamilies, letterSpacings,
} from '../../constants/theme';
import { ProfileStackParamList } from '../../navigation/RestaurantTabs';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'RestaurantTermsPrivacy'>;
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
  terms:   'How Peony Care works for restaurant partners.',
  privacy: 'What we collect and how we use it.',
  cookies: 'How Peony Care handles your data and what you agree to.',
};

const TERMS_SECTIONS: SectionData[] = [
  {
    heading: '1. Eligibility',
    body: 'Restaurant partners must be registered businesses with a valid Singapore UEN. The account must be opened by an authorised representative aged 18 or above.',
  },
  {
    heading: '2. Posting donations',
    body: 'Food you post must be safe for consumption and accurately described.',
    bullets: [
      'Set realistic pickup windows — receivers plan around them.',
      'Close listings you can no longer fulfil before the window opens.',
      "Don't post food that's past its safe use-by date.",
      'Photos must show the actual dish, not stock images.',
    ],
  },
  {
    heading: '3. Sponsored donations',
    body: "When an individual donor sponsors meals at your restaurant, you'll receive a notification listing the dishes and quantity. Prepare them as you would a regular order. Peony Care processes the payment from the donor and transfers it to your registered bank account.",
  },
  {
    heading: '4. No-show claims',
    body: "After a pickup window closes, mark any receiver who didn't collect as No-show in the app. The portion returns to the pool so others can claim it. Peony Care tracks no-show patterns to improve platform reliability.",
  },
  {
    heading: '5. Account termination',
    body: 'We may suspend or terminate restaurant accounts for false or misleading listings, harassment of receivers, repeated failure to fulfil posted donations, or fraudulent sponsored-order activity.',
  },
];

const PRIVACY_SECTIONS: SectionData[] = [
  {
    heading: 'What we collect',
    bullets: [
      'Business: restaurant name, UEN, address, opening hours.',
      'Contact: owner/manager name, business email, business mobile.',
      'Operations: donations posted, claims received, sponsored orders, payout history.',
    ],
  },
  {
    heading: 'How we use it',
    body: "We use your data to list your restaurant on the platform for receivers to find, manage claims and sponsored orders, and pay you for sponsored donations. We don't sell your data — ever.",
  },
  {
    heading: 'PDPA compliance',
    bodyParts: [
      { text: "Peony Care complies with Singapore's Personal Data Protection Act (PDPA). You can request to view, correct, or delete your business profile at any time by emailing " },
      { text: 'privacy@peonycare.sg', accent: true },
      { text: '.' },
    ],
  },
  {
    heading: "What's public vs private",
    bullets: [
      'Public: your restaurant name, address, hours, and dish photos — visible to all receivers and donors.',
      'Private: your contact email, contact mobile, UEN, and payout records — never shown to other users.',
    ],
  },
  {
    heading: 'How long we keep it',
    body: 'Business data is retained while your restaurant account is open. After deletion: contact details removed within 30 days; UEN and tax-related records retained 7 years per ACRA and IRAS requirements; payout records retained 7 years.',
  },
  {
    heading: 'Service providers',
    body: 'We use trusted third parties to operate the platform:',
    bullets: [
      'Twilio — SMS delivery for OTP codes.',
      'Stripe — payout processing for sponsored donations.',
      'Cloudflare — security and DDoS protection.',
      'Iconify — icon assets (no personal data).',
    ],
  },
  {
    heading: 'Where your data lives',
    body: 'Business data is stored in Singapore on AWS ap-southeast-1. Payment data is processed by Stripe (Singapore region).',
  },
  {
    heading: 'Age requirement',
    body: 'Restaurant accounts must be opened by an authorised representative aged 18 or above. We rely on ACRA UEN verification to confirm business authenticity.',
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
    body: 'We use Cloudflare for security and Stripe for payment processing. No tracking pixels, no ad networks.',
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

export default function RestaurantTermsPrivacyScreen({ navigation }: Props) {
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
        <Text style={styles.eyebrow}>Our promise</Text>
        <Text style={styles.title}>Terms & privacy</Text>
        <Text style={styles.subtitle}>{HERO_SUBTITLE[activeTab]}</Text>

        <View style={styles.lastUpdatedCard}>
          <Ionicons name="time-outline" size={14} color={colors.textMuted} />
          <Text style={styles.lastUpdatedText}>Last updated 1 June 2026</Text>
        </View>

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

        {sections.map((section, i) => (
          <SectionBlock
            key={section.heading}
            section={section}
            isLast={i === sections.length - 1}
          />
        ))}

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
  tabBtnActive: { backgroundColor: colors.textPrimary },
  tabLabel: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['12'],
    color: colors.textPrimary,
  },
  tabLabelActive: { color: colors.textInverse },

  sectionGap: { marginBottom: spacing['2xl'] },
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

  bulletsGap: { marginTop: spacing.xs },
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
  afterBulletsGap: { marginTop: spacing.md },

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
