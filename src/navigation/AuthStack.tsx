// Auth stack — the screens a user sees before they are logged in.
// Flow: Splash → Login → OTP → Register

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen      from '../screens/shared/SplashScreen';
import LoginScreen       from '../screens/shared/LoginScreen';
import OtpScreen         from '../screens/shared/OtpScreen';
import RegisterScreen    from '../screens/shared/RegisterScreen';

export type AuthStackParamList = {
  Splash:   undefined;
  Login:    undefined;
  Otp:      { phone: string };
  Register: { registrationToken: string; phone: string };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash"    component={SplashScreen} />
      <Stack.Screen name="Login"     component={LoginScreen} />
      <Stack.Screen name="Otp"       component={OtpScreen} />
      <Stack.Screen name="Register"  component={RegisterScreen} />
    </Stack.Navigator>
  );
}
