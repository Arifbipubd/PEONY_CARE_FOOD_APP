// Root navigator — the top-level router of the entire app.
// Logic:
//   No accessToken → show AuthStack (login/register flow)
//   Token + role RECEIVER   → show ReceiverTabs
//   Token + role DONOR      → show DonorTabs
//   Token + role RESTAURANT + isApproved false → show ApprovalPendingScreen
//   Token + role RESTAURANT + isApproved true  → show RestaurantTabs

import { useState, useEffect } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import { useAuthStore } from '../store/authStore';
import { getApprovalStatus } from '../services/restaurant';

import AuthStack             from './AuthStack';
import ReceiverTabs          from './ReceiverTabs';
import DonorTabs             from './DonorTabs';
import RestaurantTabs        from './RestaurantTabs';
import ApprovalPendingScreen from '../screens/restaurant/ApprovalPendingScreen';

export default function RootNavigator() {
  const { accessToken, user, isApproved, isHydrated, setApproved } = useAuthStore();
  const [approvalChecked, setApprovalChecked] = useState(false);

  // After SecureStore hydrates, re-verify approval status from the backend
  // so a stale cached false never blocks an already-approved restaurant.
  useEffect(() => {
    if (!isHydrated) return;

    if (!accessToken || user?.role !== 'RESTAURANT') {
      setApprovalChecked(true);
      return;
    }

    getApprovalStatus()
      .then(({ isApproved: approved }) => setApproved(approved))
      .catch(() => {})
      .finally(() => setApprovalChecked(true));
  }, [isHydrated]); // eslint-disable-line react-hooks/exhaustive-deps

  const renderApp = () => {
    // Hold on blank screen until SecureStore has loaded AND approval is checked
    if (!isHydrated || (user?.role === 'RESTAURANT' && accessToken && !approvalChecked)) {
      return <View style={{ flex: 1 }} />;
    }

    if (!accessToken || !user) return <AuthStack />;

    if (user.role === 'RECEIVER') return <ReceiverTabs />;
    if (user.role === 'DONOR')    return <DonorTabs />;

    // RESTAURANT
    if (!isApproved) return <ApprovalPendingScreen />;
    return <RestaurantTabs />;
  };

  return (
    <NavigationContainer>
      {renderApp()}
    </NavigationContainer>
  );
}
