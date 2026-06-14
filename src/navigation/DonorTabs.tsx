// Donor tab navigator — bottom tabs shown to a logged-in donor.

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DonorHomeScreen       from '../screens/donor/DonorHomeScreen';
import DonorHistoryScreen    from '../screens/donor/DonorHistoryScreen';
import NotificationsScreen   from '../screens/shared/NotificationsScreen';
import DonorProfileScreen    from '../screens/donor/DonorProfileScreen';
import CreditPreferenceScreen from '../screens/donor/CreditPreferenceScreen';

const Tab          = createBottomTabNavigator();
const ProfileStack = createNativeStackNavigator();

function ProfileNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="DonorProfile"      component={DonorProfileScreen} />
      <ProfileStack.Screen name="CreditPreference"  component={CreditPreferenceScreen} />
    </ProfileStack.Navigator>
  );
}

export default function DonorTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home"    component={DonorHomeScreen} />
      <Tab.Screen name="History" component={DonorHistoryScreen} />
      <Tab.Screen name="Alerts"  component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileNavigator} />
    </Tab.Navigator>
  );
}
