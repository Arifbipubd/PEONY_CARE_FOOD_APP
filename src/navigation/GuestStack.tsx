import { NavigatorScreenParams } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ReceiverHomeScreen   from '../screens/receiver/ReceiverHomeScreen';
import FoodDetailScreen     from '../screens/receiver/FoodDetailScreen';
import RestaurantPageScreen from '../screens/receiver/RestaurantPageScreen';
import AuthStack, { AuthStackParamList } from './AuthStack';

export type GuestStackParamList = {
  ReceiverHome:   undefined;
  FoodDetail:     { foodId: string };
  RestaurantPage: { restaurantId: string; distanceKm?: number };
  Auth:           NavigatorScreenParams<AuthStackParamList>;
};

const Stack = createNativeStackNavigator<GuestStackParamList>();

export default function GuestStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ReceiverHome"   component={ReceiverHomeScreen} />
      <Stack.Screen name="FoodDetail"     component={FoodDetailScreen} />
      <Stack.Screen name="RestaurantPage" component={RestaurantPageScreen} />
      <Stack.Screen name="Auth"           component={AuthStack} />
    </Stack.Navigator>
  );
}
