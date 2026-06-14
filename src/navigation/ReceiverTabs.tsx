// Receiver tab navigator — bottom tabs shown to a logged-in receiver.
// Each tab has its own stack so you can push detail screens on top.

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ReceiverHomeScreen    from '../screens/receiver/ReceiverHomeScreen';
import FoodDetailScreen      from '../screens/receiver/FoodDetailScreen';
import RestaurantPageScreen  from '../screens/receiver/RestaurantPageScreen';
import QrScannerScreen       from '../screens/receiver/QrScannerScreen';
import ClaimSuccessScreen    from '../screens/receiver/ClaimSuccessScreen';
import ReceiverHistoryScreen from '../screens/receiver/ReceiverHistoryScreen';
import NotificationsScreen   from '../screens/shared/NotificationsScreen';
import ReceiverProfileScreen from '../screens/receiver/ReceiverProfileScreen';
import LocationSettingsScreen from '../screens/receiver/LocationSettingsScreen';

const Tab   = createBottomTabNavigator();
const HomeStack    = createNativeStackNavigator();
const ScanStack    = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

function HomeNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="ReceiverHome"   component={ReceiverHomeScreen} />
      <HomeStack.Screen name="FoodDetail"     component={FoodDetailScreen} />
      <HomeStack.Screen name="RestaurantPage" component={RestaurantPageScreen} />
    </HomeStack.Navigator>
  );
}

function ScanNavigator() {
  return (
    <ScanStack.Navigator screenOptions={{ headerShown: false }}>
      <ScanStack.Screen name="QrScanner"    component={QrScannerScreen} />
      <ScanStack.Screen name="ClaimSuccess" component={ClaimSuccessScreen} />
    </ScanStack.Navigator>
  );
}

function ProfileNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ReceiverProfile"   component={ReceiverProfileScreen} />
      <ProfileStack.Screen name="LocationSettings"  component={LocationSettingsScreen} />
    </ProfileStack.Navigator>
  );
}

export default function ReceiverTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home"    component={HomeNavigator} />
      <Tab.Screen name="Scan"    component={ScanNavigator} />
      <Tab.Screen name="Alerts"  component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileNavigator} />
    </Tab.Navigator>
  );
}
