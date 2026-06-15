// Mock auth responses — exact shape of backend API responses.
// Allows the full registration flow to be tested on device without a backend.
//
// Flow in mock mode:
//   1. Enter any phone number → OTP "sent" (no real SMS)
//   2. Enter any OTP code → treated as new user → goes to RegisterScreen
//   3. Choose role + fill form → registered → land on role tabs
//   4. Tokens stored in SecureStore → subsequent app opens skip auth

import { ApiOtpSendResponse, ApiOtpVerifyNewUser, ApiAuthTokens } from '../types/api';

export const MOCK_OTP_SEND_RESPONSE = (phone: string, purpose: string): ApiOtpSendResponse => ({
  phone,
  purpose,
  expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  message: 'OTP sent successfully. (mock mode — no SMS sent)',
});

// verifyOtp always returns new-user so the registration flow can be tested end-to-end.
export const MOCK_OTP_VERIFY_NEW_USER = (phone: string): ApiOtpVerifyNewUser => ({
  registration_token: 'mock-registration-token-peony',
  phone,
  message: 'Phone verified. Complete registration to continue. (mock mode)',
});

const makeMockTokens = (role: 'RECEIVER' | 'RESTAURANT' | 'DONOR', phone: string): ApiAuthTokens => ({
  access: `mock-access-token-${role.toLowerCase()}`,
  refresh: `mock-refresh-token-${role.toLowerCase()}`,
  user: {
    id: `mock-user-${role.toLowerCase()}-001`,
    phone,
    role,
    is_active: true,
  },
});

export const MOCK_REGISTER_RECEIVER = (phone: string): ApiAuthTokens =>
  makeMockTokens('RECEIVER', phone);

export const MOCK_REGISTER_RESTAURANT = (phone: string): ApiAuthTokens =>
  makeMockTokens('RESTAURANT', phone);

export const MOCK_REGISTER_DONOR = (phone: string): ApiAuthTokens =>
  makeMockTokens('DONOR', phone);
