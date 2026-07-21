import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../navigation/AuthStack';
import Button from '../../components/Button';
import Input from '../../components/Input';
import LogoBadge from '../../components/LogoBadge';
import CountryPicker, { CountryOption, COUNTRIES } from '../../components/CountryPicker';
import { sendOtp } from '../../services/auth';
import { ApiError } from '../../services/api';
import { setOnConfirm } from '../restaurant/RestaurantLocationScreen';
import {
  colors, spacing, fontSizes, fontFamilies, letterSpacings, radius,
} from '../../constants/theme';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'RestaurantRegister'>;
};

export default function RestaurantRegisterScreen({ navigation }: Props) {
  const [restaurantName, setRestaurantName] = useState('');
  const [uen, setUen]                       = useState('');
  const [address, setAddress]               = useState('');
  const [contactName, setContactName]       = useState('');
  const [phone, setPhone]                   = useState('');
  const [country, setCountry]               = useState<CountryOption>(COUNTRIES[0]);
  const [email, setEmail]                   = useState('');
  const [lat, setLat]                        = useState(0);
  const [lng, setLng]                        = useState(0);
  const [termsAccepted, setTermsAccepted]   = useState(false);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState('');
  const [rateLimitSecs, setRateLimitSecs]   = useState(0);

  useEffect(() => {
    if (rateLimitSecs <= 0) return;
    const t = setTimeout(() => {
      setRateLimitSecs((s) => {
        const next = s - 1;
        if (next <= 0) setError('');
        return next;
      });
    }, 1000);
    return () => clearTimeout(t);
  }, [rateLimitSecs]);

  const cleaned = phone.trim().replace(/\s/g, '');
  const isSg = country.code === 'SG';
  const isValidPhone = isSg
    ? /^[689]\d{7}$/.test(cleaned)
    : /^0?1[3-9]\d{8}$/.test(cleaned);
  const phoneError = isSg
    ? (cleaned.length > 0 && !/^[689]/.test(cleaned) ? 'Must start with 6, 8 or 9' :
       cleaned.length > 8 ? 'Must be exactly 8 digits' : '')
    : (cleaned.length > 11 ? 'Please enter a valid phone number' : '');

  const canSubmit =
    restaurantName.trim().length > 0 &&
    uen.trim().length > 0 &&
    address.trim().length > 0 &&
    contactName.trim().length > 0 &&
    isValidPhone &&
    termsAccepted;

  const clearError = useCallback(() => setError(''), []);

  async function handleSend() {
    if (!restaurantName.trim()) { setError('Restaurant name is required'); return; }
    if (!uen.trim())             { setError('UEN is required'); return; }
    if (!address.trim())         { setError('Address is required'); return; }
    if (!contactName.trim())     { setError('Contact name is required'); return; }
    if (!isValidPhone)            { setError(`Enter a valid ${country.label} number`); return; }
    if (!termsAccepted)          { setError('You must agree to the Terms and Privacy Policy'); return; }
    setError('');
    setLoading(true);
    try {
      const localPart = cleaned.startsWith('0') ? cleaned.slice(1) : cleaned;
      const fullPhone = `${country.dial}${localPart}`;
      await sendOtp(fullPhone, 'REGISTER');
      navigation.navigate('Otp', {
        phone: fullPhone,
        purpose: 'REGISTER',
        pendingRegistration: {
          role:          'RESTAURANT',
          restaurantName: restaurantName.trim(),
          uen:            uen.trim(),
          address:        address.trim(),
          contactName:    contactName.trim(),
          email:          email.trim(),
          contactPhone:   fullPhone,
        },
      });
    } catch (err: unknown) {
      if (err instanceof ApiError && err.code === 'OTP_RATE_LIMITED') {
        const secs = (err.details?.retry_after_seconds as number) ?? 60;
        setRateLimitSecs(secs);
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to send code. Try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
      </TouchableOpacity>

      <KeyboardAwareScrollView
        style={styles.flex}
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid
        extraScrollHeight={20}
      >
          <LogoBadge size={80} />

          <Text style={styles.title}>Register your restaurant</Text>

          <View style={styles.form}>
            <Input
              label="Restaurant name"
              value={restaurantName}
              onChangeText={(t) => { setRestaurantName(t); clearError(); }}
              placeholder="Tian Tian Hainanese"
              leftIcon={<Ionicons name="storefront" size={18} color={colors.textMuted} />}
            />
            <Input
              label="UEN (business registration)"
              value={uen}
              onChangeText={(t) => { setUen(t); clearError(); }}
              placeholder="200912345A"
              leftIcon={<Ionicons name="id-card" size={18} color={colors.textMuted} />}
            />
            <View style={styles.addressBlock}>
              <Input
                label="Address"
                value={address}
                onChangeText={(t) => { setAddress(t); clearError(); }}
                placeholder="443 Joo Chiat Rd, Singapore"
                leftIcon={<Ionicons name="location" size={18} color={colors.textMuted} />}
              />
              <TouchableOpacity
                style={styles.pinRow}
                activeOpacity={0.7}
                onPress={() => {
                  setOnConfirm((result) => {
                    setLat(result.latitude);
                    setLng(result.longitude);
                    setAddress(result.address);
                  });
                  navigation.navigate('RestaurantLocation', {
                    latitude:  lat || 1.3521,
                    longitude: lng || 103.8198,
                    address,
                  });
                }}
              >
                <Ionicons name="bookmark" size={14} color={colors.accentPrimary} />
                <Text style={styles.pinText}>Pin exact location on map</Text>
              </TouchableOpacity>
            </View>
            <Input
              label="Contact name"
              value={contactName}
              onChangeText={(t) => { setContactName(t); clearError(); }}
              placeholder="Manager / owner"
              leftIcon={<Ionicons name="person" size={18} color={colors.textMuted} />}
            />
            <Input
              label="Mobile number"
              value={phone}
              onChangeText={(t) => { setPhone(t.replace(/\D/g, '')); clearError(); }}
              placeholder={isSg ? '91234567' : '01712345678'}
              keyboardType="number-pad"
              error={phoneError}
              leftSection={
                <CountryPicker selected={country} onSelect={(c) => { setCountry(c); setPhone(''); clearError(); }} />
              }
            />
            <Input
              label="Email address"
              value={email}
              onChangeText={(t) => { setEmail(t); clearError(); }}
              placeholder="contact@restaurant.sg"
              keyboardType="email-address"
              leftIcon={<Ionicons name="mail" size={18} color={colors.textMuted} />}
            />
          </View>

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setTermsAccepted((v) => !v)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
              {termsAccepted && (
                <Ionicons name="checkmark" size={14} color={colors.textInverse} />
              )}
            </View>
            <Text style={styles.termsText}>
              {'I agree to the '}
              <Text style={styles.termsLink}>Terms</Text>
              {' and '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
              {'.'}
            </Text>
          </TouchableOpacity>

          {error ? (
            <Text style={styles.errorText}>
              {rateLimitSecs > 0 ? `${error} Retry in ${rateLimitSecs}s.` : error}
            </Text>
          ) : null}

          <Button
            label="Send code"
            onPress={handleSend}
            loading={loading}
            disabled={!canSubmit}
            size="sm"
            rightIcon={<Ionicons name="arrow-forward" size={20} color={colors.textInverse} />}
          />

          <Text style={styles.loginRow}>
            Already a partner?{' '}
            <Text style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
              Log in
            </Text>
          </Text>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  back: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  body: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.lg,
    paddingBottom: spacing['4xl'],
    gap: spacing['2xl'],
    alignItems: 'center',
  },
  title: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['2xl'],
    letterSpacing: letterSpacings.subheading,
    color: colors.textPrimary,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  form: { alignSelf: 'stretch', gap: spacing.lg },
  addressBlock: { gap: spacing.xs },
  pinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  pinText: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['12'],
    color: colors.accentPrimary,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: spacing.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radius.xs,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.accentPrimary,
    borderColor: colors.accentPrimary,
  },
  termsText: {
    flex: 1,
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['14'],
    color: colors.textMuted,
  },
  termsLink: {
    fontFamily: fontFamilies.semiBold,
    color: colors.accentPrimary,
  },
  errorText: {
    fontSize: fontSizes.sm,
    color: colors.errorRed,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  loginRow: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  loginLink: {
    fontFamily: fontFamilies.semiBold,
    color: colors.accentPrimary,
  },
});
