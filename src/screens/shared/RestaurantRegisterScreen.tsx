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
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../navigation/AuthStack';
import Button from '../../components/Button';
import Input from '../../components/Input';
import LogoBadge from '../../components/LogoBadge';
import CountryPicker, { CountryOption, COUNTRIES } from '../../components/CountryPicker';
import { sendOtp, registerRestaurant } from '../../services/auth';
import { ApiError, firstDetailMessage } from '../../services/api';
import { setOnConfirm } from '../restaurant/RestaurantLocationScreen';
import {
  colors, spacing, fontSizes, fontFamilies, letterSpacings, radius,
} from '../../constants/theme';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'RestaurantRegister'>;
  route: RouteProp<AuthStackParamList, 'RestaurantRegister'>;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UEN_MAX_LENGTH = 10;

function logSignup(step: string, data?: Record<string, unknown>) {
  if (__DEV__) {
    console.log(`[SIGNUP:RESTAURANT] ${step}`, data ?? '');
  }
}

function applyDetailsToSetters(
  details: Record<string, unknown> | undefined,
  setters: {
    restaurantName: (v: string) => void;
    uen: (v: string) => void;
    address: (v: string) => void;
    contactName: (v: string) => void;
    phone: (v: string) => void;
    email: (v: string) => void;
  },
): boolean {
  const restaurantName = firstDetailMessage(details, 'restaurant_name');
  const uen = firstDetailMessage(details, 'uen');
  const address = firstDetailMessage(details, 'address');
  const contactName = firstDetailMessage(details, 'contact_name');
  const phone = firstDetailMessage(details, 'contact_phone');
  const email = firstDetailMessage(details, 'contact_email');

  if (restaurantName) setters.restaurantName(restaurantName);
  if (uen) setters.uen(uen);
  if (address) setters.address(address);
  if (contactName) setters.contactName(contactName);
  if (phone) setters.phone(phone);
  if (email) setters.email(email);

  return Boolean(restaurantName || uen || address || contactName || phone || email);
}

export default function RestaurantRegisterScreen({ navigation, route }: Props) {
  const draft = route.params?.draft;
  const initialErrors = route.params?.fieldErrors;
  const initialCountry =
    COUNTRIES.find((c) => c.code === draft?.countryCode) ?? COUNTRIES[0]!;

  const [restaurantName, setRestaurantName] = useState(draft?.restaurantName ?? '');
  const [uen, setUen]                       = useState(
    (draft?.uen ?? '').slice(0, UEN_MAX_LENGTH),
  );
  const [address, setAddress]               = useState(draft?.address ?? '');
  const [contactName, setContactName]       = useState(draft?.contactName ?? '');
  const [phone, setPhone]                   = useState(draft?.phone ?? '');
  const [country, setCountry]               = useState<CountryOption>(initialCountry);
  const [email, setEmail]                   = useState(draft?.email ?? '');
  const [lat, setLat]                        = useState(draft?.latitude ?? 0);
  const [lng, setLng]                        = useState(draft?.longitude ?? 0);
  const [termsAccepted, setTermsAccepted]   = useState(draft?.termsAccepted ?? false);
  const [registrationToken, setRegistrationToken] = useState(
    route.params?.registrationToken ?? '',
  );
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState('');
  const [rateLimitSecs, setRateLimitSecs]   = useState(0);

  const [restaurantNameError, setRestaurantNameError] = useState(
    initialErrors?.restaurantName ?? '',
  );
  const [uenError, setUenError]                       = useState(initialErrors?.uen ?? '');
  const [addressError, setAddressError]               = useState(initialErrors?.address ?? '');
  const [contactNameError, setContactNameError]       = useState(
    initialErrors?.contactName ?? '',
  );
  const [mobileError, setMobileError]                 = useState(initialErrors?.phone ?? '');
  const [emailError, setEmailError]                   = useState(initialErrors?.email ?? '');
  const [termsError, setTermsError]                   = useState('');

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
  const phoneMaxLength = isSg ? 8 : 10;
  const isValidPhone = isSg
    ? /^[689]\d{7}$/.test(cleaned)
    : /^0?1[3-9]\d{8}$/.test(cleaned);
  const livePhoneError = isSg
    ? (cleaned.length > 0 && !/^[689]/.test(cleaned) ? 'Must start with 6, 8 or 9' :
       cleaned.length > 8 ? 'Must be exactly 8 digits' : '')
    : (cleaned.length > phoneMaxLength ? 'Must be at most 10 digits' : '');

  const handleRestaurantNameChange = useCallback((t: string) => {
    setRestaurantName(t);
    if (restaurantNameError) setRestaurantNameError('');
    if (error) setError('');
  }, [restaurantNameError, error]);

  const handleUenChange = useCallback((t: string) => {
    setUen(t.slice(0, UEN_MAX_LENGTH));
    if (uenError) setUenError('');
    if (error) setError('');
  }, [uenError, error]);

  const handleAddressChange = useCallback((t: string) => {
    setAddress(t);
    if (addressError) setAddressError('');
    if (error) setError('');
  }, [addressError, error]);

  const handleContactNameChange = useCallback((t: string) => {
    setContactName(t);
    if (contactNameError) setContactNameError('');
    if (error) setError('');
  }, [contactNameError, error]);

  const handlePhoneChange = useCallback((t: string) => {
    const digits = t.replace(/\D/g, '');
    const maxLen = country.code === 'SG' ? 8 : 10;
    setPhone(digits.slice(0, maxLen));
    if (mobileError) setMobileError('');
    if (error) setError('');
  }, [country.code, mobileError, error]);

  const handleEmailChange = useCallback((t: string) => {
    setEmail(t);
    if (emailError) setEmailError('');
    if (error) setError('');
  }, [emailError, error]);

  const handleTermsToggle = useCallback(() => {
    setTermsAccepted((v) => {
      const next = !v;
      if (next && termsError) setTermsError('');
      return next;
    });
    if (error) setError('');
  }, [termsError, error]);

  const setFieldErrorsFromApi = useCallback((details?: Record<string, unknown>) => {
    return applyDetailsToSetters(details, {
      restaurantName: setRestaurantNameError,
      uen: setUenError,
      address: setAddressError,
      contactName: setContactNameError,
      phone: setMobileError,
      email: setEmailError,
    });
  }, []);

  async function handleSend() {
    const nextRestaurantNameError = !restaurantName.trim() ? 'Restaurant name is required' : '';
    const nextUenError = !uen.trim()
      ? 'UEN is required'
      : uen.trim().length > UEN_MAX_LENGTH
        ? `UEN must be at most ${UEN_MAX_LENGTH} characters`
        : '';
    const nextAddressError = !address.trim() ? 'Address is required' : '';
    const nextContactNameError = !contactName.trim() ? 'Contact name is required' : '';
    const nextMobileError = !cleaned
      ? 'Mobile number is required'
      : !isValidPhone
        ? `Enter a valid ${country.label} number`
        : livePhoneError;
    const trimmedEmail = email.trim();
    const nextEmailError = !trimmedEmail
      ? 'Email address is required'
      : !EMAIL_RE.test(trimmedEmail)
        ? 'Enter a valid email address'
        : '';
    const nextTermsError = !termsAccepted ? 'You must agree to the Terms and Privacy Policy' : '';

    setRestaurantNameError(nextRestaurantNameError);
    setUenError(nextUenError);
    setAddressError(nextAddressError);
    setContactNameError(nextContactNameError);
    setMobileError(nextMobileError);
    setEmailError(nextEmailError);
    setTermsError(nextTermsError);

    const hasFieldError = Boolean(
      nextRestaurantNameError ||
      nextUenError ||
      nextAddressError ||
      nextContactNameError ||
      nextMobileError ||
      nextEmailError ||
      nextTermsError,
    );

    logSignup('validate', {
      hasFieldError,
      hasRegistrationToken: Boolean(registrationToken),
      restaurantName: restaurantName.trim(),
      uen: uen.trim(),
      uenLength: uen.trim().length,
      address: address.trim(),
      contactName: contactName.trim(),
      phone: cleaned,
      country: country.code,
      email: trimmedEmail,
      lat,
      lng,
      termsAccepted,
      errors: {
        restaurantName: nextRestaurantNameError || undefined,
        uen: nextUenError || undefined,
        address: nextAddressError || undefined,
        contactName: nextContactNameError || undefined,
        mobile: nextMobileError || undefined,
        email: nextEmailError || undefined,
        terms: nextTermsError || undefined,
      },
    });

    if (hasFieldError) return;

    setError('');
    setLoading(true);
    const localPart = cleaned.startsWith('0') ? cleaned.slice(1) : cleaned;
    const fullPhone = `${country.dial}${localPart}`;
    const restaurantData = {
      restaurant_name: restaurantName.trim(),
      uen:             uen.trim(),
      address:         address.trim(),
      contact_name:    contactName.trim(),
      contact_email:   trimmedEmail,
      contact_phone:   fullPhone,
      latitude:        lat,
      longitude:       lng,
    };

    // OTP already verified — retry register with fixed fields
    if (registrationToken) {
      logSignup('registerRestaurant:retry', { fullPhone, restaurantData });
      try {
        const result = await registerRestaurant(restaurantData, registrationToken);
        logSignup('registerRestaurant:retry:success', {
          userId: result.user.id,
          role: result.user.role,
        });
        setRegistrationToken('');
        navigation.navigate('Permissions', {
          accessToken:  result.accessToken,
          refreshToken: result.refreshToken,
          user:         result.user,
        });
      } catch (err: unknown) {
        logSignup('registerRestaurant:retry:error', {
          message: err instanceof Error ? err.message : String(err),
          code: err instanceof ApiError ? err.code : undefined,
          details: err instanceof ApiError ? err.details : undefined,
        });
        if (err instanceof ApiError && err.code === 'VALIDATION_ERROR') {
          const mapped = setFieldErrorsFromApi(err.details);
          if (!mapped) {
            setError(err.message || 'Request could not be processed.');
          }
        } else {
          setError(err instanceof Error ? err.message : 'Registration failed. Try again.');
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    const pendingRegistration = {
      role:           'RESTAURANT' as const,
      restaurantName: restaurantName.trim(),
      uen:            uen.trim(),
      address:        address.trim(),
      contactName:    contactName.trim(),
      email:          trimmedEmail,
      contactPhone:   fullPhone,
      latitude:       lat,
      longitude:      lng,
    };

    logSignup('sendOtp:start', { fullPhone, pendingRegistration });

    try {
      await sendOtp(fullPhone, 'REGISTER');
      logSignup('sendOtp:success', { fullPhone });
      navigation.navigate('Otp', {
        phone: fullPhone,
        purpose: 'REGISTER',
        pendingRegistration,
      });
      logSignup('navigate:Otp', { fullPhone });
    } catch (err: unknown) {
      logSignup('sendOtp:error', {
        fullPhone,
        message: err instanceof Error ? err.message : String(err),
        code: err instanceof ApiError ? err.code : undefined,
        details: err instanceof ApiError ? err.details : undefined,
      });
      if (err instanceof ApiError && err.code === 'VALIDATION_ERROR') {
        const mapped = applyDetailsToSetters(err.details, {
          restaurantName: setRestaurantNameError,
          uen: setUenError,
          address: setAddressError,
          contactName: setContactNameError,
          phone: setMobileError,
          email: setEmailError,
        });
        if (!mapped) setError(err.message || 'Request could not be processed.');
      } else if (err instanceof ApiError && err.code === 'OTP_RATE_LIMITED') {
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

  const phoneFieldError = mobileError || livePhoneError;
  const submitLabel = registrationToken ? 'Complete registration' : 'Send code';

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
          <LogoBadge width={160} />

          <Text style={styles.title}>Register your restaurant</Text>

          <View style={styles.form}>
            <Input
              label="Restaurant name"
              required
              value={restaurantName}
              onChangeText={handleRestaurantNameChange}
              placeholder="Tian Tian Hainanese"
              error={restaurantNameError}
              leftIcon={<Ionicons name="storefront" size={18} color={colors.textMuted} />}
            />
            <Input
              label="UEN (business registration)"
              required
              value={uen}
              onChangeText={handleUenChange}
              placeholder="200912345A"
              maxLength={UEN_MAX_LENGTH}
              error={uenError}
              leftIcon={<Ionicons name="id-card" size={18} color={colors.textMuted} />}
            />
            <View style={styles.addressBlock}>
              <Input
                label="Address"
                required
                value={address}
                onChangeText={handleAddressChange}
                placeholder="443 Joo Chiat Rd, Singapore"
                error={addressError}
                leftIcon={<Ionicons name="location" size={18} color={colors.textMuted} />}
              />
              <TouchableOpacity
                style={styles.pinRow}
                activeOpacity={0.7}
                onPress={() => {
                  logSignup('openMapPin', { lat, lng, address });
                  setOnConfirm((result) => {
                    logSignup('mapPinConfirmed', result);
                    setLat(result.latitude);
                    setLng(result.longitude);
                    setAddress(result.address);
                    setAddressError('');
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
              required
              value={contactName}
              onChangeText={handleContactNameChange}
              placeholder="Manager / owner"
              error={contactNameError}
              leftIcon={<Ionicons name="person" size={18} color={colors.textMuted} />}
            />
            <Input
              label="Mobile number"
              required
              value={phone}
              onChangeText={handlePhoneChange}
              placeholder={isSg ? '91234567' : '1712345678'}
              keyboardType="number-pad"
              maxLength={phoneMaxLength}
              error={phoneFieldError}
              leftSection={
                <CountryPicker
                  selected={country}
                  onSelect={(c) => {
                    setCountry(c);
                    setPhone('');
                    setMobileError('');
                    if (error) setError('');
                  }}
                />
              }
            />
            <Input
              label="Email address"
              required
              value={email}
              onChangeText={handleEmailChange}
              placeholder="contact@restaurant.sg"
              keyboardType="email-address"
              error={emailError}
              leftIcon={<Ionicons name="mail" size={18} color={colors.textMuted} />}
            />
          </View>

          <View style={styles.termsBlock}>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={handleTermsToggle}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkbox,
                  termsAccepted && styles.checkboxChecked,
                  !!termsError && styles.checkboxError,
                ]}
              >
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
                <Text style={styles.requiredMark}> *</Text>
              </Text>
            </TouchableOpacity>
            {termsError ? <Text style={styles.fieldError}>{termsError}</Text> : null}
          </View>

          {error ? (
            <Text style={styles.errorText}>
              {rateLimitSecs > 0 ? `${error} Retry in ${rateLimitSecs}s.` : error}
            </Text>
          ) : null}

          <Button
            label={submitLabel}
            onPress={handleSend}
            loading={loading}
            disabled={loading}
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
  termsBlock: {
    alignSelf: 'stretch',
    gap: spacing.sm,
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
  checkboxError: {
    borderColor: colors.errorRed,
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
  requiredMark: {
    color: colors.errorRed,
  },
  fieldError: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.xs,
    color: colors.errorRed,
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
