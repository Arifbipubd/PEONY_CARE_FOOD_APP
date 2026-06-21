import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Claim } from '../types';
import ReceiverHomeScreen     from '../screens/receiver/ReceiverHomeScreen';
import FoodDetailScreen       from '../screens/receiver/FoodDetailScreen';
import RestaurantPageScreen   from '../screens/receiver/RestaurantPageScreen';
import QrScannerScreen        from '../screens/receiver/QrScannerScreen';
import ClaimSuccessScreen     from '../screens/receiver/ClaimSuccessScreen';
import FoodUnavailableScreen  from '../screens/receiver/FoodUnavailableScreen';
import DailyLimitScreen       from '../screens/receiver/DailyLimitScreen';
import ScanErrorScreen        from '../screens/receiver/ScanErrorScreen';
import OfflineErrorScreen     from '../screens/receiver/OfflineErrorScreen';
import ServerErrorScreen      from '../screens/receiver/ServerErrorScreen';
import ReceiverHistoryScreen  from '../screens/receiver/ReceiverHistoryScreen';
import NotificationsScreen    from '../screens/shared/NotificationsScreen';
import ReceiverProfileScreen  from '../screens/receiver/ReceiverProfileScreen';
import LocationSettingsScreen from '../screens/receiver/LocationSettingsScreen';
import { colors, fontSizes }  from '../constants/theme';

export type HomeStackParamList = {
  ReceiverHome:    undefined;
  FoodDetail:      { foodId: string };
  RestaurantPage:  { restaurantId: string; distanceKm?: number };
  QrScanner:       undefined;
  ClaimSuccess:    { claim: Claim };
  FoodUnavailable: undefined;
  DailyLimit:      { resetsAt: string };
  ScanError:       undefined;
  OfflineError:    undefined;
  ServerError:     { errorRef?: string };
};

export type HistoryStackParamList = {
  ReceiverHistory: undefined;
};

export type ProfileStackParamList = {
  ReceiverProfile:  undefined;
  LocationSettings: undefined;
};

const Tab          = createBottomTabNavigator();
const HomeStack    = createNativeStackNavigator<HomeStackParamList>();
const HistoryStack = createNativeStackNavigator<HistoryStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

function HomeNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="ReceiverHome"    component={ReceiverHomeScreen} />
      <HomeStack.Screen name="FoodDetail"      component={FoodDetailScreen} />
      <HomeStack.Screen name="RestaurantPage"  component={RestaurantPageScreen} />
      <HomeStack.Screen name="QrScanner"       component={QrScannerScreen} />
      <HomeStack.Screen name="ClaimSuccess"    component={ClaimSuccessScreen} />
      <HomeStack.Screen name="FoodUnavailable" component={FoodUnavailableScreen} />
      <HomeStack.Screen name="DailyLimit"      component={DailyLimitScreen} />
      <HomeStack.Screen name="ScanError"       component={ScanErrorScreen} />
      <HomeStack.Screen name="OfflineError"    component={OfflineErrorScreen} />
      <HomeStack.Screen name="ServerError"     component={ServerErrorScreen} />
    </HomeStack.Navigator>
  );
}

function HistoryNavigator() {
  return (
    <HistoryStack.Navigator screenOptions={{ headerShown: false }}>
      <HistoryStack.Screen name="ReceiverHistory" component={ReceiverHistoryScreen} />
    </HistoryStack.Navigator>
  );
}

function ProfileNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ReceiverProfile"  component={ReceiverProfileScreen} />
      <ProfileStack.Screen name="LocationSettings" component={LocationSettingsScreen} />
    </ProfileStack.Navigator>
  );
}

const TAB_ICONS = {
  Home:    { active: 'home'           as const, inactive: 'home-outline'           as const },
  Alerts:  { active: 'notifications'  as const, inactive: 'notifications-outline'  as const },
  Profile: { active: 'person-circle'  as const, inactive: 'person-circle-outline'  as const },
};

export default function ReceiverTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor:   colors.accentPrimary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: fontSizes.xs },
        tabBarStyle: { borderTopColor: colors.borderDefault },
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'History') {
            return <MaterialCommunityIcons name="history" size={size} color={color} />;
          }
          const icons = TAB_ICONS[route.name as keyof typeof TAB_ICONS];
          if (!icons) return null;
          return <Ionicons name={focused ? icons.active : icons.inactive} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home"    component={HomeNavigator} />
      <Tab.Screen name="History" component={HistoryNavigator} />
      <Tab.Screen name="Alerts"  component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileNavigator} />
    </Tab.Navigator>
  );
}
