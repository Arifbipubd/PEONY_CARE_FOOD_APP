import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserRole } from '../types';
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
  registrationToken: string,
): Promise<{
  accessToken: string;
  refreshToken: string;
  user: { id: string; role: UserRole; phone: string };
}> => {
  const storedName = await AsyncStorage.getItem('peony_pending_name');
  const display_name = storedName ?? displayName;

  const res = await api.post(
    '/auth/register/receiver/',
    { display_name, latitude: 1.3521, longitude: 103.8198 },
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
};

export const registerRestaurant = async (
  restaurantData: {
    restaurant_name: string;
    uen: string;
    address: string;
    contact_name: string;
    contact_email: string;
  },
  registrationToken: string,
): Promise<{
  accessToken: string;
  refreshToken: string;
  user: { id: string; role: UserRole; phone: string };
}> => {
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
};

export const logout = async (refreshToken: string): Promise<void> => {
  await api.post('/auth/logout/', { refresh: refreshToken });
};
