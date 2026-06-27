import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { HomeStackParamList } from '../../navigation/ReceiverTabs';
import { colors, spacing, fontSizes, fontFamilies, radius } from '../../constants/theme';

type Props = {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'ReportListing'>;
  route:      RouteProp<HomeStackParamList, 'ReportListing'>;
};

const REASONS = [
  'Food was unsafe or spoiled',
  'Listing is misleading',
  'Restaurant was closed or absent',
  'Rude or inappropriate behaviour',
  'Asked me to pay for the food',
  'Something else',
] as const;

export default function ReportListingScreen({ navigation, route }: Props) {
  const { restaurantName } = route.params;

  const [selected, setSelected] = useState<string | null>(null);
  const [details,  setDetails]  = useState('');
  const [focused,  setFocused]  = useState(false);

  const handleSelect = useCallback((reason: string) => {
    setSelected(reason);
  }, []);

  const handleSubmit = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.title}>Report a problem</Text>

        <Text style={styles.subtitle}>
          Reporting{' '}
          <Text style={styles.subtitleBold}>{restaurantName}</Text>
          {'. Your report is confidential.'}
        </Text>

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>WHAT'S WRONG?</Text>

        {REASONS.map((reason) => (
          <TouchableOpacity
            key={reason}
            style={styles.radioRow}
            activeOpacity={0.7}
            onPress={() => handleSelect(reason)}
          >
            <View style={[styles.radioOuter, selected === reason && styles.radioOuterActive]}>
              {selected === reason && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.radioLabel}>{reason}</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.textareaSection}>
          <Text style={styles.textareaLabel}>Tell us more (optional)</Text>
          <TextInput
            style={[styles.textarea, focused && styles.textareaFocused]}
            value={details}
            onChangeText={setDetails}
            placeholder="Add any details that help us look into this..."
            placeholderTextColor={colors.textMuted}
            multiline
            textAlignVertical="top"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
        </View>

        <TouchableOpacity
          style={styles.submitBtn}
          activeOpacity={0.85}
          onPress={handleSubmit}
        >
          <Ionicons name="flag-outline" size={16} color={colors.textInverse} />
          <Text style={styles.submitLabel}>Submit report</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelBtn}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelLabel}>Cancel</Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            For emergencies or food poisoning, call SCDF 995 or the SFA hotline 6805 2871 immediately.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },

  back: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },

  title: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['2xl'],
    letterSpacing: -0.6,
    color: colors.textPrimary,
    paddingTop: 4,
    paddingHorizontal: spacing['2xl'],
    paddingBottom: 6,
  },

  subtitle: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['14'],
    lineHeight: 21,
    color: colors.textMuted,
    paddingHorizontal: spacing['2xl'],
    paddingBottom: 8,
  },
  subtitleBold: {
    fontFamily: fontFamilies.bold,
    color: colors.textPrimary,
  },

  divider: { height: 1, backgroundColor: colors.borderDefault },

  sectionLabel: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['12'],
    letterSpacing: 0.96,
    color: colors.textMuted,
    textTransform: 'uppercase',
    paddingTop: 24,
    paddingBottom: 4,
    paddingHorizontal: spacing['2xl'],
  },

  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: 16,
    gap: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: colors.accentPrimary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.accentPrimary,
  },
  radioLabel: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['14'],
    color: colors.textPrimary,
    flex: 1,
  },

  textareaSection: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['2xl'],
  },
  textareaLabel: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['12'],
    color: colors.textMuted,
    marginBottom: 8,
  },
  textarea: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['14'],
    lineHeight: 21,
    color: colors.textPrimary,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radius.input,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    height: 96,
  },
  textareaFocused: {
    borderColor: colors.accentPrimary,
  },

  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentPrimary,
    height: 54,
    borderRadius: radius.card,
    marginTop: 24,
    marginHorizontal: spacing['2xl'],
    gap: 8,
  },
  submitLabel: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['14'],
    letterSpacing: 0.28,
    color: colors.textInverse,
  },

  cancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: radius.card,
    marginTop: 10,
    marginHorizontal: spacing['2xl'],
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
  },
  cancelLabel: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['14'],
    letterSpacing: 0.28,
    color: colors.textPrimary,
  },

  infoBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.input,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 24,
    marginHorizontal: 20,
    marginBottom: 32,
  },
  infoText: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    lineHeight: 18,
    color: colors.textMuted,
  },
});
