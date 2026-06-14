import { UserRole } from '../types';

export const sendOtp = async (_email: string): Promise<void> => {
  await new Promise((r) => setTimeout(r, 800));
};

export const verifyOtp = async (
  email: string,
  code: string,
): Promise<{
  isNewUser: boolean;
  registrationToken?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: { id: string; role: UserRole; phone: string };
}> => {
  await new Promise((r) => setTimeout(r, 800));
  void code;
  return {
    isNewUser: false,
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    user: { id: 'mock-user-1', role: 'RECEIVER', phone: email },
  };
};

export const registerReceiver = async (
  _name: string,
  _email: string,
  _registrationToken: string,
): Promise<{
  accessToken: string;
  refreshToken: string;
  user: { id: string; role: UserRole; phone: string };
}> => {
  await new Promise((r) => setTimeout(r, 800));
  return {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    user: { id: 'mock-receiver-1', role: 'RECEIVER', phone: _email },
  };
};

export const registerDonor = async (
  _name: string,
  _email: string,
  _registrationToken: string,
): Promise<{
  accessToken: string;
  refreshToken: string;
  user: { id: string; role: UserRole; phone: string };
}> => {
  await new Promise((r) => setTimeout(r, 800));
  return {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    user: { id: 'mock-donor-1', role: 'DONOR', phone: _email },
  };
};

export const registerRestaurant = async (
  _data: object,
  _registrationToken: string,
): Promise<void> => {
  await new Promise((r) => setTimeout(r, 800));
};

export const logout = async (): Promise<void> => {};
