import { UserRole } from '../types';
import {
  MOCK_REGISTER_RECEIVER,
  MOCK_REGISTER_RESTAURANT,
  MOCK_REGISTER_DONOR,
} from '../mock/auth';
import { api } from './api';

export const sendOtp = async (phone: string, purpose: 'LOGIN' | 'REGISTER'): Promise<void> => {
  await api.post('/auth/otp/send/', { phone, purpose });
};

export const verifyOtp = async (
  phone: string,
  code: string,
): Promise<{
  isNewUser: boolean;
  registrationToken?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: { id: string; role: UserRole; phone: string };
}> => {
  const res = await api.post('/auth/otp/verify/', { phone, code });
  const data = res.data.data;
  if (data.registration_token) {
    return { isNewUser: true, registrationToken: data.registration_token };
  }
  return {
    isNewUser: false,
    accessToken: data.access,
    refreshToken: data.refresh,
    user: { id: data.user.id, role: data.user.role as UserRole, phone: data.user.phone },
  };
};

export const registerReceiver = async (
  displayName: string,
  _registrationToken: string,
): Promise<{
  accessToken: string;
  refreshToken: string;
  user: { id: string; role: UserRole; phone: string };
}> => {
  // MOCK:
  await new Promise((r) => setTimeout(r, 800));
  const data = MOCK_REGISTER_RECEIVER('+6500000000');
  return {
    accessToken: data.access,
    refreshToken: data.refresh,
    user: { id: data.user.id, role: data.user.role as UserRole, phone: data.user.phone },
  };
  /* REAL API:
  const res = await api.post(
    '/auth/register/receiver/',
    { display_name: displayName },
    { headers: { 'Registration-Token': _registrationToken } },
  );
  const data = res.data.data;
  return {
    accessToken: data.access,
    refreshToken: data.refresh,
    user: { id: data.user.id, role: data.user.role as UserRole, phone: data.user.phone },
  };
  */
};

export const registerDonor = async (
  displayName: string,
  email: string,
  _registrationToken: string,
): Promise<{
  accessToken: string;
  refreshToken: string;
  user: { id: string; role: UserRole; phone: string };
}> => {
  // MOCK:
  await new Promise((r) => setTimeout(r, 800));
  const data = MOCK_REGISTER_DONOR('+6500000000');
  return {
    accessToken: data.access,
    refreshToken: data.refresh,
    user: { id: data.user.id, role: data.user.role as UserRole, phone: data.user.phone },
  };
  /* REAL API:
  const res = await api.post(
    '/auth/register/donor/',
    { display_name: displayName, contact_email: email },
    { headers: { 'Registration-Token': _registrationToken } },
  );
  const data = res.data.data;
  return {
    accessToken: data.access,
    refreshToken: data.refresh,
    user: { id: data.user.id, role: data.user.role as UserRole, phone: data.user.phone },
  };
  */
};

export const registerRestaurant = async (
  restaurantData: {
    restaurant_name: string;
    uen: string;
    address: string;
    contact_name: string;
    contact_email: string;
  },
  _registrationToken: string,
): Promise<{
  accessToken: string;
  refreshToken: string;
  user: { id: string; role: UserRole; phone: string };
}> => {
  // MOCK:
  await new Promise((r) => setTimeout(r, 800));
  const data = MOCK_REGISTER_RESTAURANT('+6500000000');
  return {
    accessToken: data.access,
    refreshToken: data.refresh,
    user: { id: data.user.id, role: data.user.role as UserRole, phone: data.user.phone },
  };
  /* REAL API:
  const res = await api.post(
    '/auth/register/restaurant/',
    restaurantData,
    { headers: { 'Registration-Token': _registrationToken } },
  );
  const data = res.data.data;
  return {
    accessToken: data.access,
    refreshToken: data.refresh,
    user: { id: data.user.id, role: data.user.role as UserRole, phone: data.user.phone },
  };
  */
};

export const logout = async (_refreshToken: string): Promise<void> => {
  // MOCK: no-op — auth store clears tokens on the screen side
  await new Promise((r) => setTimeout(r, 300));
  return;
  /* REAL API:
  await api.post('/auth/logout/', { refresh: _refreshToken });
  */
};
