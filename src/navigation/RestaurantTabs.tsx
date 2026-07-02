import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import RestaurantDashboardScreen from '../screens/restaurant/RestaurantDashboardScreen';
import DonationListScreen        from '../screens/restaurant/DonationListScreen';
import DonationDetailScreen      from '../screens/restaurant/DonationDetailScreen';
import PostDonationScreen        from '../screens/restaurant/PostDonationScreen';
import TodaysClaimsScreen        from '../screens/restaurant/TodaysClaimsScreen';
import NotificationsScreen       from '../screens/shared/NotificationsScreen';
import RestaurantProfileScreen   from '../screens/restaurant/RestaurantProfileScreen';
import { colors, fontSizes }     from '../constants/theme';
import { useNotificationStore }  from '../store/notificationStore';

export type RestaurantTabParamList = {
  Home:       undefined;
  Donations:  undefined;
  Alerts:     undefined;
  Profile:    undefined;
};

export type DonationsStackParamList = {
  DonationList:   undefined;
  DonationDetail: { donationId: string };
  PostDonation:   undefined;
  TodaysClaims:   undefined;
};

const Tab            = createBottomTabNavigator<RestaurantTabParamList>();
const DonationsStack = createNativeStackNavigator<DonationsStackParamList>();

function DonationsNavigator() {
  return (
    <DonationsStack.Navigator screenOptions={{ headerShown: false }}>
      <DonationsStack.Screen name="DonationList"   component={DonationListScreen} />
      <DonationsStack.Screen name="DonationDetail" component={DonationDetailScreen} />
      <DonationsStack.Screen name="PostDonation"   component={PostDonationScreen} />
      <DonationsStack.Screen name="TodaysClaims"   component={TodaysClaimsScreen} />
    </DonationsStack.Navigator>
  );
}

const TAB_ICONS = {
  Home:      { active: 'home'           as const, inactive: 'home-outline'           as const },
  Donations: { active: 'restaurant'     as const, inactive: 'restaurant-outline'     as const },
  Alerts:    { active: 'notifications'  as const, inactive: 'notifications-outline'  as const },
  Profile:   { active: 'person-circle'  as const, inactive: 'person-circle-outline'  as const },
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
      <Tab.Screen name="Donations" component={DonationsNavigator} />
      <Tab.Screen
        name="Alerts"
        component={NotificationsScreen}
        options={{
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.accentPrimary, fontSize: fontSizes.xs },
        }}
      />
      <Tab.Screen name="Profile" component={RestaurantProfileScreen} />
    </Tab.Navigator>
  );
}
