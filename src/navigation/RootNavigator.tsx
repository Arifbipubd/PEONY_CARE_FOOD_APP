import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import { useAuthStore } from '../store/authStore';

import AuthStack    from './AuthStack';
import ReceiverTabs from './ReceiverTabs';
import RestaurantTabs from './RestaurantTabs';

export default function RootNavigator() {
  const { accessToken, user, isHydrated } = useAuthStore();

  const renderApp = () => {
    if (!isHydrated) return <View style={{ flex: 1 }} />;
    if (!accessToken || !user || user.role === 'DONOR') return <AuthStack />;
    if (user.role === 'RECEIVER') return <ReceiverTabs />;
    return <RestaurantTabs />;
  };

  return (
    <NavigationContainer>
      {renderApp()}
    </NavigationContainer>
  );
}
