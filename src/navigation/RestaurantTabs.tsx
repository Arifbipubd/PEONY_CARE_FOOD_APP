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

const TAB_ICONS = {
  Home:    { active: 'home'          as const, inactive: 'home-outline'          as const },
  Manage:  { active: 'restaurant'   as const, inactive: 'restaurant-outline'    as const },
  Claims:  { active: 'receipt'      as const, inactive: 'receipt-outline'       as const },
  Alerts:  { active: 'notifications' as const, inactive: 'notifications-outline' as const },
  Profile: { active: 'person-circle' as const, inactive: 'person-circle-outline' as const },
};

export default function RestaurantTabs() {
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
      <Tab.Screen name="Home"    component={RestaurantDashboardScreen} />
      <Tab.Screen name="Manage"  component={ManageNavigator} />
      <Tab.Screen name="Claims"  component={TodaysClaimsScreen} />
      <Tab.Screen name="Alerts"  component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={RestaurantProfileScreen} />
    </Tab.Navigator>
  );
}
