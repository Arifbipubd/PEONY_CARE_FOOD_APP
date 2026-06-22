// Root navigator — the top-level router of the entire app.
// Logic:
//   No accessToken → show AuthStack (login/register flow)
//   Token + role RECEIVER   → show ReceiverTabs
//   Token + role DONOR      → show DonorTabs
//   Token + role RESTAURANT + isApproved false → show ApprovalPendingScreen
//   Token + role RESTAURANT + isApproved true  → show RestaurantTabs

import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import { useAuthStore } from '../store/authStore';

import AuthStack    from './AuthStack';
import ReceiverTabs from './ReceiverTabs';
// import DonorTabs             from './DonorTabs';
// import RestaurantTabs        from './RestaurantTabs';
// import ApprovalPendingScreen from '../screens/restaurant/ApprovalPendingScreen';

export default function RootNavigator() {
  const { accessToken, user, isApproved, isHydrated } = useAuthStore();

  const renderApp = () => {
    // Wait for SecureStore tokens to load before routing
    if (!isHydrated) return <View style={{ flex: 1 }} />;

    if (!accessToken || !user) return <AuthStack />;

    return <ReceiverTabs />;
    // if (user.role === 'RECEIVER')   return <ReceiverTabs />;
    // if (user.role === 'DONOR')      return <DonorTabs />;
    // // RESTAURANT
    // if (!isApproved) return <ApprovalPendingScreen />;
    // return <RestaurantTabs />;
  };

  return (
    <NavigationContainer>
      {renderApp()}
    </NavigationContainer>
  );
}
