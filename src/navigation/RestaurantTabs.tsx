import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import RestaurantDashboardScreen from '../screens/restaurant/RestaurantDashboardScreen';
import DonationListScreen        from '../screens/restaurant/DonationListScreen';
import DonationDetailScreen      from '../screens/restaurant/DonationDetailScreen';
import PostDonationScreen        from '../screens/restaurant/PostDonationScreen';
import PostDonationSuccessScreen from '../screens/restaurant/PostDonationSuccessScreen';
import TodaysClaimsScreen        from '../screens/restaurant/TodaysClaimsScreen';
import NotificationsScreen       from '../screens/shared/NotificationsScreen';
import RestaurantProfileScreen   from '../screens/restaurant/RestaurantProfileScreen';
import { colors, fontSizes }     from '../constants/theme';
import { useNotificationStore }  from '../store/notificationStore';

export type ProfileStackParamList = {
  RestaurantProfile: undefined;
};

export type RestaurantTabParamList = {
  Home:       undefined;
  Donations:  undefined;
  Alerts:     undefined;
  Profile:    undefined;
};

export type DonationsStackParamList = {
  DonationList:          undefined;
  DonationDetail:        { donationId: string };
  PostDonation:          undefined;
  PostDonationSuccess:   {
    foodName:     string;
    quantity:     number;
    unit:         string;
    category:     string;
    pickupWindow: string;
    donationId:   string;
  };
  TodaysClaims:          undefined;
};

const Tab            = createBottomTabNavigator<RestaurantTabParamList>();
const DonationsStack = createNativeStackNavigator<DonationsStackParamList>();
const ProfileStack   = createNativeStackNavigator<ProfileStackParamList>();

function ProfileNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="RestaurantProfile" component={RestaurantProfileScreen} />
    </ProfileStack.Navigator>
  );
}

function DonationsNavigator() {
  return (
    <DonationsStack.Navigator screenOptions={{ headerShown: false }}>
      <DonationsStack.Screen name="DonationList"   component={DonationListScreen} />
      <DonationsStack.Screen name="DonationDetail" component={DonationDetailScreen} />
      <DonationsStack.Screen name="PostDonation"        component={PostDonationScreen} />
      <DonationsStack.Screen name="PostDonationSuccess" component={PostDonationSuccessScreen} />
      <DonationsStack.Screen name="TodaysClaims"        component={TodaysClaimsScreen} />
    </DonationsStack.Navigator>
  );
}

const TAB_ICONS = {
  Home:      { active: 'home'              as const, inactive: 'home-outline'           as const },
  Donations: { active: 'receipt'           as const, inactive: 'receipt-outline'        as const },
  Alerts:    { active: 'notifications'     as const, inactive: 'notifications-outline'  as const },
  Profile:   { active: 'person'            as const, inactive: 'person-outline'         as const },
};

export default function RestaurantTabs() {
  const { unreadCount } = useNotificationStore();

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
      <Tab.Screen name="Home"      component={RestaurantDashboardScreen} />
      <Tab.Screen
        name="Donations"
        component={DonationsNavigator}
        options={({ route }) => {
          const focused = getFocusedRouteNameFromRoute(route);
          const hideTabBar = focused === 'PostDonation' || focused === 'PostDonationSuccess';
          return {
            tabBarStyle: hideTabBar
              ? { display: 'none' }
              : { borderTopColor: colors.borderDefault },
          };
        }}
      />
      <Tab.Screen
        name="Alerts"
        component={NotificationsScreen}
        options={{
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.accentPrimary, fontSize: fontSizes.xs },
        }}
      />
      <Tab.Screen name="Profile" component={ProfileNavigator} />
    </Tab.Navigator>
  );
}
