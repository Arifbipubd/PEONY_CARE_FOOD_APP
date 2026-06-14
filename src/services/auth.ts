// Auth service — OTP send/verify and role registration.
// Mock mode: simulates OTP flow with fake data.
// Real mode (later): swap mock returns for api.post() calls.

export const sendOtp = async (_phone: string): Promise<void> => {
  // MOCK: pretend OTP was sent successfully
  await new Promise((r) => setTimeout(r, 800));
};

export const verifyOtp = async (
  _phone: string,
  _code: string
): Promise<{ isNewUser: boolean; registrationToken?: string; accessToken?: string; refreshToken?: string }> => {
  // MOCK: code "123456" = existing user, anything else = new user
  await new Promise((r) => setTimeout(r, 800));
  if (_code === '123456') {
    return { isNewUser: false, accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token' };
  }
  return { isNewUser: true, registrationToken: 'mock-registration-token' };
};

export const registerReceiver = async (_displayName: string, _registrationToken: string) => {
  await new Promise((r) => setTimeout(r, 800));
  return { accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token' };
};

export const registerDonor = async (_displayName: string, _registrationToken: string) => {
  await new Promise((r) => setTimeout(r, 800));
  return { accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token' };
};

export const registerRestaurant = async (_data: object, _registrationToken: string) => {
  await new Promise((r) => setTimeout(r, 800));
  return { accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token' };
};

export const logout = async (): Promise<void> => {
  // MOCK: nothing to do
};
