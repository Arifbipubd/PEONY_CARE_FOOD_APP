import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserRole } from '../types';
import { api, logApiCatch } from './api';

export const sendOtp = async (phone: string, purpose: 'LOGIN' | 'REGISTER'): Promise<void> => {
  if (__DEV__) console.log('[AUTH] sendOtp', { phone, purpose });
  try {
    await api.post('/auth/otp/send/', { phone, purpose });
  } catch (err) {
    logApiCatch('sendOtp', err);
    throw err;
  }
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
  if (__DEV__) console.log('[AUTH] verifyOtp', { phone, codeLength: code.length });
  try {
    const res = await api.post('/auth/otp/verify/', { phone, code });
    const data = res.data.data;
    if (data.registration_token) {
      if (__DEV__) console.log('[AUTH] verifyOtp → new user (registration token received)');
      return { isNewUser: true, registrationToken: data.registration_token };
    }
    if (__DEV__) console.log('[AUTH] verifyOtp → existing user login');
    return {
      isNewUser: false,
      accessToken: data.access,
      refreshToken: data.refresh,
      user: { id: data.user.id, role: data.user.role as UserRole, phone: data.user.phone },
    };
  } catch (err) {
    logApiCatch('verifyOtp', err);
    throw err;
  }
};

export const registerReceiver = async (
  displayName: string,
  registrationToken: string,
  latitude?: number | null,
  longitude?: number | null,
): Promise<{
  accessToken: string;
  refreshToken: string;
  user: { id: string; role: UserRole; phone: string };
}> => {
  const storedName = await AsyncStorage.getItem('peony_pending_name');
  const display_name = storedName ?? displayName;

  const res = await api.post(
    '/auth/register/receiver/',
    { display_name, latitude: latitude ?? 0, longitude: longitude ?? 0 },
    { headers: { 'Registration-Token': registrationToken } },
  );
  await AsyncStorage.removeItem('peony_pending_name');
  const data = res.data.data;
  return {
    accessToken: data.access,
    refreshToken: data.refresh,
    user: { id: data.user.id, role: data.user.role as UserRole, phone: data.user.phone },
  };
};

export const registerDonor = async (
  displayName: string,
  email: string,
  registrationToken: string,
): Promise<{
  accessToken: string;
  refreshToken: string;
  user: { id: string; role: UserRole; phone: string };
}> => {
  if (__DEV__) {
    console.log('[AUTH] registerDonor', {
      display_name: displayName,
      contact_email: email,
      hasRegistrationToken: Boolean(registrationToken),
    });
  }

  try {
    const res = await api.post(
      '/auth/register/donor/',
      { display_name: displayName, contact_email: email },
      { headers: { 'Registration-Token': registrationToken } },
    );
    const data = res.data.data;
    return {
      accessToken: data.access,
      refreshToken: data.refresh,
      user: { id: data.user.id, role: data.user.role as UserRole, phone: data.user.phone },
    };
  } catch (err) {
    logApiCatch('registerDonor', err);
    throw err;
  }
};

export const registerRestaurant = async (
  restaurantData: {
    restaurant_name: string;
    uen: string;
    address: string;
    contact_name: string;
    contact_email: string;
    contact_phone?: string;
    latitude: number;
    longitude: number;
  },
  registrationToken: string,
): Promise<{
  accessToken: string;
  refreshToken: string;
  user: { id: string; role: UserRole; phone: string };
}> => {
  if (__DEV__) {
    console.log('[AUTH] registerRestaurant', {
      ...restaurantData,
      hasRegistrationToken: Boolean(registrationToken),
    });
  }

  try {
    const res = await api.post(
      '/auth/register/restaurant/',
      restaurantData,
      { headers: { 'Registration-Token': registrationToken } },
    );
    const data = res.data.data;
    return {
      accessToken: data.access,
      refreshToken: data.refresh,
      user: { id: data.user.id, role: data.user.role as UserRole, phone: data.user.phone },
    };
  } catch (err) {
    logApiCatch('registerRestaurant', err);
    throw err;
  }
};

export const logout = async (refreshToken: string): Promise<void> => {
  await api.post('/auth/logout/', { refresh: refreshToken });
};
