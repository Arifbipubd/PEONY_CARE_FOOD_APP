import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen             from '../screens/shared/SplashScreen';
import LoginScreen              from '../screens/shared/LoginScreen';
import OtpScreen                from '../screens/shared/OtpScreen';
import ChooseRoleScreen         from '../screens/shared/ChooseRoleScreen';
import ReceiverRegisterScreen   from '../screens/shared/ReceiverRegisterScreen';
import PermissionsScreen        from '../screens/shared/PermissionsScreen';
import TermsPrivacyScreen       from '../screens/receiver/TermsPrivacyScreen';
import DonorRegisterScreen      from '../screens/shared/DonorRegisterScreen';
import RestaurantRegisterScreen from '../screens/shared/RestaurantRegisterScreen';
import { UserRole } from '../types';

export type PendingRegistration =
  | { role: 'RECEIVER'; displayName: string }
  | { role: 'DONOR';    displayName: string; email: string }
  | { role: 'RESTAURANT'; restaurantName: string; uen: string; address: string; contactName: string; email: string };

export type AuthStackParamList = {
  Splash:             undefined;
  ChooseRole:         undefined;
  ReceiverRegister:   undefined;
  DonorRegister:      undefined;
  RestaurantRegister: undefined;
  Login:              undefined;
  Otp: {
    phone:                string;
    purpose:              'LOGIN' | 'REGISTER';
    pendingRegistration?: PendingRegistration;
  };
  Permissions: {
    accessToken:  string;
    refreshToken: string;
    user:         { id: string; phone: string; role: UserRole };
  };
  TermsPrivacy: undefined;
  // Kept only so RegisterScreen.tsx (legacy) still type-checks
  Register: { registrationToken: string; phone: string; role?: 'RECEIVER' | 'DONOR' };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash"             component={SplashScreen} />
      <Stack.Screen name="ChooseRole"         component={ChooseRoleScreen} />
      <Stack.Screen name="ReceiverRegister"   component={ReceiverRegisterScreen} />
      <Stack.Screen name="DonorRegister"      component={DonorRegisterScreen} />
      <Stack.Screen name="RestaurantRegister" component={RestaurantRegisterScreen} />
      <Stack.Screen name="Login"              component={LoginScreen} />
      <Stack.Screen name="Otp"               component={OtpScreen} />
      <Stack.Screen name="Permissions"        component={PermissionsScreen} />
      <Stack.Screen name="TermsPrivacy"       component={TermsPrivacyScreen} />
    </Stack.Navigator>
  );
}
