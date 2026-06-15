import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import ReceiverHomeScreen     from '../screens/receiver/ReceiverHomeScreen';
import FoodDetailScreen       from '../screens/receiver/FoodDetailScreen';
import RestaurantPageScreen   from '../screens/receiver/RestaurantPageScreen';
import QrScannerScreen        from '../screens/receiver/QrScannerScreen';
import ClaimSuccessScreen     from '../screens/receiver/ClaimSuccessScreen';
import NotificationsScreen    from '../screens/shared/NotificationsScreen';
import ReceiverProfileScreen  from '../screens/receiver/ReceiverProfileScreen';
import LocationSettingsScreen from '../screens/receiver/LocationSettingsScreen';
import { colors, fontSizes }  from '../constants/theme';

export type HomeStackParamList = {
  ReceiverHome: undefined;
  FoodDetail: { foodId: string };
  RestaurantPage: { restaurantId: string; distanceKm?: number };
};

export type ScanStackParamList = {
  QrScanner: undefined;
  ClaimSuccess: undefined;
};

export type ProfileStackParamList = {
  ReceiverProfile: undefined;
  LocationSettings: undefined;
};

const Tab          = createBottomTabNavigator();
const HomeStack    = createNativeStackNavigator<HomeStackParamList>();
const ScanStack    = createNativeStackNavigator<ScanStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

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
      <ProfileStack.Screen name="ReceiverProfile"  component={ReceiverProfileScreen} />
      <ProfileStack.Screen name="LocationSettings" component={LocationSettingsScreen} />
    </ProfileStack.Navigator>
  );
}

const TAB_ICONS = {
  Home:    { active: 'home'              as const, inactive: 'home-outline'              as const },
  Scan:    { active: 'qr-code'          as const, inactive: 'qr-code-outline'           as const },
  Alerts:  { active: 'notifications'    as const, inactive: 'notifications-outline'     as const },
  Profile: { active: 'person-circle'    as const, inactive: 'person-circle-outline'     as const },
};

export default function ReceiverTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accentPrimary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: fontSizes.xs },
        tabBarStyle: { borderTopColor: colors.borderDefault },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name as keyof typeof TAB_ICONS];
          if (!icons) return null;
          return <Ionicons name={focused ? icons.active : icons.inactive} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home"    component={HomeNavigator} />
      <Tab.Screen name="Scan"    component={ScanNavigator} />
      <Tab.Screen name="Alerts"  component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileNavigator} />
    </Tab.Navigator>
  );
}
