import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList, PendingRegistration } from '../../navigation/AuthStack';
import Button from '../../components/Button';
import {
  verifyOtp,
  sendOtp,
  registerReceiver,
  registerDonor,
  registerRestaurant,
} from '../../services/auth';
import { ApiError, firstDetailMessage } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types';
import LogoBadge from '../../components/LogoBadge';
import { COUNTRIES } from '../../components/CountryPicker';
import { colors, spacing, fontSizes, fontFamilies, lineHeights, letterSpacings, radius } from '../../constants/theme';
import type { RestaurantRegisterDraft, RestaurantRegisterFieldErrors } from '../../navigation/AuthStack';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Otp'>;
  route: RouteProp<AuthStackParamList, 'Otp'>;
};

const CODE_LENGTH    = 4;
const RESEND_SECONDS = 60;

function splitPhone(fullPhone: string): { countryCode: 'SG' | 'BD'; local: string } {
  const sorted = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);
  const match = sorted.find((c) => fullPhone.startsWith(c.dial));
  if (match) {
    return { countryCode: match.code, local: fullPhone.slice(match.dial.length) };
  }
  return { countryCode: 'SG', local: fullPhone.replace(/^\+/, '') };
}

function restaurantFieldErrorsFromDetails(
  details: Record<string, unknown> | undefined,
): RestaurantRegisterFieldErrors {
  return {
    restaurantName: firstDetailMessage(details, 'restaurant_name') || undefined,
    uen:            firstDetailMessage(details, 'uen') || undefined,
    address:        firstDetailMessage(details, 'address') || undefined,
    contactName:    firstDetailMessage(details, 'contact_name') || undefined,
    phone:          firstDetailMessage(details, 'contact_phone') || undefined,
    email:          firstDetailMessage(details, 'contact_email') || undefined,
  };
}

function restaurantDraftFromPending(
  pending: Extract<PendingRegistration, { role: 'RESTAURANT' }>,
): RestaurantRegisterDraft {
  const { countryCode, local } = splitPhone(pending.contactPhone);
  return {
    restaurantName: pending.restaurantName,
    uen:            pending.uen,
    address:        pending.address,
    contactName:    pending.contactName,
    email:          pending.email,
    phone:          local,
    countryCode,
    latitude:       pending.latitude,
    longitude:      pending.longitude,
    termsAccepted:  true,
  };
}

async function autoRegister(
  pending: PendingRegistration,
  token: string,
): Promise<{ accessToken: string; refreshToken: string; user: { id: string; phone: string; role: UserRole } }> {
  if (__DEV__) {
    console.log('[SIGNUP] autoRegister:start', {
      role: pending.role,
      hasToken: Boolean(token),
      pending:
        pending.role === 'RESTAURANT'
          ? {
              restaurantName: pending.restaurantName,
              uen: pending.uen,
              address: pending.address,
              contactName: pending.contactName,
              email: pending.email,
              contactPhone: pending.contactPhone,
              latitude: pending.latitude,
              longitude: pending.longitude,
            }
          : pending.role === 'DONOR'
            ? { displayName: pending.displayName, email: pending.email }
            : { displayName: pending.displayName },
    });
  }
  try {
    let result;
    if (pending.role === 'RECEIVER') {
      result = await registerReceiver(pending.displayName, token);
    } else if (pending.role === 'DONOR') {
      result = await registerDonor(pending.displayName, pending.email, token);
    } else {
      result = await registerRestaurant(
        {
          restaurant_name: pending.restaurantName,
          uen:             pending.uen,
          address:         pending.address,
          contact_name:    pending.contactName,
          contact_email:   pending.email,
          contact_phone:   pending.contactPhone,
          latitude:        pending.latitude,
          longitude:       pending.longitude,
        },
        token,
      );
    }
    if (__DEV__) {
      console.log('[SIGNUP] autoRegister:success', {
        role: result.user.role,
        userId: result.user.id,
        phone: result.user.phone,
      });
    }
    return result;
  } catch (err) {
    if (__DEV__) {
      console.log('[SIGNUP] autoRegister:error', {
        role: pending.role,
        message: err instanceof Error ? err.message : String(err),
        code: err instanceof ApiError ? err.code : undefined,
        details: err instanceof ApiError ? err.details : undefined,
      });
    }
    throw err;
  }
}

export default function OtpScreen({ navigation, route }: Props) {
  const { phone, purpose, pendingRegistration } = route.params;
  const { setAuth } = useAuthStore();

  const [code, setCode]             = useState('');
  const [focused, setFocused]       = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [seconds, setSeconds]       = useState(RESEND_SECONDS);
  const [rateLimitSecs, setRateLimitSecs] = useState(0);
  const inputRef = useRef<TextInput>(null);

  // The box that shows the cursor: next empty slot, capped at last box
  const activeIndex = Math.min(code.length, CODE_LENGTH - 1);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

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

  async function handleVerify() {
    if (code.length < CODE_LENGTH) { setError('Enter all 4 digits'); return; }
    setLoading(true);
    setError('');
    if (__DEV__) {
      console.log('[SIGNUP] otp:verify:start', {
        phone,
        purpose,
        codeLength: code.length,
        hasPendingRegistration: Boolean(pendingRegistration),
        pendingRole: pendingRegistration?.role,
      });
    }
    try {
      const result = await verifyOtp(phone, code);
      if (__DEV__) {
        console.log('[SIGNUP] otp:verify:result', {
          isNewUser: result.isNewUser,
          hasAccessToken: Boolean(result.accessToken),
          hasRefreshToken: Boolean(result.refreshToken),
          hasRegistrationToken: Boolean(result.registrationToken),
          hasUser: Boolean(result.user),
          userId: result.user?.id,
          role: result.user?.role,
          hasPendingRegistration: Boolean(pendingRegistration),
          purpose,
          fullResult: result,
        });
      }

      if (!result.isNewUser && result.accessToken && result.refreshToken && result.user) {
        if (__DEV__) console.log('[SIGNUP] otp:login:existingUser');
        setAuth(result.accessToken, result.refreshToken, result.user);
        return;
      }

      if (result.isNewUser && result.registrationToken && pendingRegistration) {
        try {
          const reg = await autoRegister(pendingRegistration, result.registrationToken);
          if (__DEV__) console.log('[SIGNUP] otp:navigate:Permissions', { role: reg.user.role });
          navigation.navigate('Permissions', {
            accessToken:  reg.accessToken,
            refreshToken: reg.refreshToken,
            user:         reg.user as { id: string; phone: string; role: UserRole },
          });
          return;
        } catch (regErr: unknown) {
          if (
            regErr instanceof ApiError &&
            regErr.code === 'VALIDATION_ERROR' &&
            pendingRegistration.role === 'RESTAURANT'
          ) {
            const fieldErrors = restaurantFieldErrorsFromDetails(regErr.details);
            if (__DEV__) {
              console.log('[SIGNUP] otp:register:validation → RestaurantRegister', {
                fieldErrors,
                details: regErr.details,
              });
            }
            navigation.navigate('RestaurantRegister', {
              draft: restaurantDraftFromPending(pendingRegistration),
              fieldErrors,
              registrationToken: result.registrationToken,
              fullPhone: phone,
            });
            return;
          }
          throw regErr;
        }
      }

      // LOGIN with no account: backend may return a registration token instead of USER_NOT_FOUND.
      if (purpose === 'LOGIN' && result.isNewUser) {
        if (__DEV__) {
          console.log('[SIGNUP] otp:verify:noAccount', {
            hasRegistrationToken: Boolean(result.registrationToken),
            hasPendingRegistration: Boolean(pendingRegistration),
          });
        }
        setError('No active account found for this phone number.');
        return;
      }

      if (__DEV__) {
        console.log('[SIGNUP] otp:unexpected', {
          isNewUser: result.isNewUser,
          hasRegistrationToken: Boolean(result.registrationToken),
          hasAccessToken: Boolean(result.accessToken),
          hasRefreshToken: Boolean(result.refreshToken),
          hasUser: Boolean(result.user),
          hasPendingRegistration: Boolean(pendingRegistration),
          purpose,
          result,
        });
      }
      setError('Unexpected response. Please try again.');
    } catch (err: unknown) {
      if (__DEV__) {
        console.error('[SIGNUP] otp:verify:error', {
          name: err instanceof Error ? err.name : typeof err,
          message: err instanceof Error ? err.message : String(err),
          code: err instanceof ApiError ? err.code : undefined,
          details: err instanceof ApiError ? err.details : undefined,
          err,
        });
      }
      if (err instanceof ApiError) {
        setError(err.message || 'Invalid code. Please try again.');
        return;
      }
      setError(err instanceof Error ? err.message : 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (seconds > 0) return;
    try {
      await sendOtp(phone, purpose);
      setSeconds(RESEND_SECONDS);
      setCode('');
      inputRef.current?.focus();
    } catch (err: unknown) {
      if (err instanceof ApiError && err.code === 'OTP_RATE_LIMITED') {
        const secs = (err.details?.retry_after_seconds as number) ?? 60;
        setRateLimitSecs(secs);
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to resend. Try again.');
      }
    }
  }

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <SafeAreaView style={styles.screen}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
      </TouchableOpacity>

      <View style={styles.body}>
        <LogoBadge width={160} />

        <Text style={styles.title}>Check your inbox</Text>
        <Text style={styles.subtitle}>
          Sent to <Text style={styles.phoneBold}>{phone}</Text>
        </Text>

        {/* Tap anywhere on the row to bring up the keyboard */}
        <TouchableOpacity
          style={styles.codeRow}
          activeOpacity={1}
          onPress={() => inputRef.current?.focus()}
        >
          {Array(CODE_LENGTH).fill(null).map((_, i) => {
            const char = code[i];
            const isActive = focused && i === activeIndex;
            return (
              <View
                key={i}
                style={[
                  styles.digitBox,
                  isActive ? styles.digitBoxActive : null,
                ]}
              >
                <Text style={styles.digitText}>{char ?? ''}</Text>
              </View>
            );
          })}
        </TouchableOpacity>

        {/* Single hidden input — captures all typing and backspaces */}
        <TextInput
          ref={inputRef}
          value={code}
          onChangeText={(t) => { setCode(t.replace(/\D/g, '').slice(0, CODE_LENGTH)); setError(''); }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          keyboardType="number-pad"
          maxLength={CODE_LENGTH}
          style={styles.hiddenInput}
          caretHidden
          autoFocus
        />

        {error ? (
          <Text style={styles.error}>
            {rateLimitSecs > 0 ? `${error} Retry in ${rateLimitSecs}s.` : error}
          </Text>
        ) : null}

        <TouchableOpacity onPress={handleResend} disabled={seconds > 0}>
          <Text style={styles.resendText}>
            Didn't get the code?{' '}
            <Text style={[styles.resendLink, seconds > 0 && styles.resendDisabled]}>
              {seconds > 0 ? `Resend in ${formatTime(seconds)}` : 'Resend now'}
            </Text>
          </Text>
        </TouchableOpacity>

        <Button
          label="Verify & continue"
          onPress={handleVerify}
          loading={loading}
          disabled={code.length < CODE_LENGTH}
          size="sm"
        />
      </View>
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
  body: {
    flex: 1,
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.lg,
    alignItems: 'center',
    gap: spacing.lg,
  },
  title: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['2xl'],
    lineHeight: lineHeights.subheading,
    letterSpacing: letterSpacings.subheading,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fontFamilies.regular,
    fontSize: 14,
    color: colors.textMuted,
  },
  phoneBold: {
    fontFamily: fontFamilies.semiBold,
    color: colors.textPrimary,
  },
  codeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  digitBox: {
    width: 52,
    height: 56,
    borderRadius: radius.input,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  digitBoxActive: {
    borderColor: colors.accentPrimary,
    backgroundColor: colors.surface,
  },
  digitText: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['2xl'],
    color: colors.textPrimary,
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  error: {
    fontSize: fontSizes.sm,
    color: colors.errorRed,
  },
  resendText: {
    fontFamily: fontFamilies.regular,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
  resendLink: {
    fontFamily: fontFamilies.semiBold,
    color: colors.accentPrimary,
  },
  resendDisabled: {
    color: colors.textMuted,
  },
});
