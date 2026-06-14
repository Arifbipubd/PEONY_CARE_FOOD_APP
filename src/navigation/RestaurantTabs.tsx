// Restaurant tab navigator — bottom tabs for a logged-in, approved restaurant.

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import RestaurantDashboardScreen from '../screens/restaurant/RestaurantDashboardScreen';
import DonationListScreen        from '../screens/restaurant/DonationListScreen';
import DonationDetailScreen      from '../screens/restaurant/DonationDetailScreen';
import PostDonationScreen        from '../screens/restaurant/PostDonationScreen';
import TodaysClaimsScreen        from '../screens/restaurant/TodaysClaimsScreen';
import NotificationsScreen       from '../screens/shared/NotificationsScreen';
import RestaurantProfileScreen   from '../screens/restaurant/RestaurantProfileScreen';

const Tab         = createBottomTabNavigator();
const ManageStack = createNativeStackNavigator();

function ManageNavigator() {
  return (
    <ManageStack.Navigator screenOptions={{ headerShown: false }}>
      <ManageStack.Screen name="DonationList"   component={DonationListScreen} />
      <ManageStack.Screen name="DonationDetail" component={DonationDetailScreen} />
      <ManageStack.Screen name="PostDonation"   component={PostDonationScreen} />
    </ManageStack.Navigator>
  );
}

export default function RestaurantTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home"    component={RestaurantDashboardScreen} />
      <Tab.Screen name="Manage"  component={ManageNavigator} />
      <Tab.Screen name="Claims"  component={TodaysClaimsScreen} />
      <Tab.Screen name="Alerts"  component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={RestaurantProfileScreen} />
    </Tab.Navigator>
  );
}
