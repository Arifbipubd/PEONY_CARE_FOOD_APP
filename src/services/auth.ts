import { UserRole } from '../types';

export const sendOtp = async (_phone: string): Promise<void> => {
  await new Promise((r) => setTimeout(r, 800));
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
  await new Promise((r) => setTimeout(r, 800));
  if (code === '123456') {
    return {
      isNewUser: false,
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      user: { id: 'mock-user-1', role: 'RECEIVER', phone },
    };
  }
  return { isNewUser: true, registrationToken: 'mock-reg-token' };
};

export const registerReceiver = async (
  _displayName: string,
  _email: string,
  _registrationToken: string,
  phone: string,
): Promise<{
  accessToken: string;
  refreshToken: string;
  user: { id: string; role: UserRole; phone: string };
}> => {
  await new Promise((r) => setTimeout(r, 800));
  return {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    user: { id: 'mock-receiver-1', role: 'RECEIVER', phone },
  };
};

export const registerDonor = async (
  _displayName: string,
  _email: string,
  _registrationToken: string,
  phone: string,
): Promise<{
  accessToken: string;
  refreshToken: string;
  user: { id: string; role: UserRole; phone: string };
}> => {
  await new Promise((r) => setTimeout(r, 800));
  return {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    user: { id: 'mock-donor-1', role: 'DONOR', phone },
  };
};

export const registerRestaurant = async (
  _data: object,
  _registrationToken: string,
): Promise<void> => {
  await new Promise((r) => setTimeout(r, 800));
};

export const logout = async (): Promise<void> => {};
