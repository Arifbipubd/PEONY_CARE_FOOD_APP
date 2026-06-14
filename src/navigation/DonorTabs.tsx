import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import DonorHomeScreen        from '../screens/donor/DonorHomeScreen';
import DonorHistoryScreen     from '../screens/donor/DonorHistoryScreen';
import NotificationsScreen    from '../screens/shared/NotificationsScreen';
import DonorProfileScreen     from '../screens/donor/DonorProfileScreen';
import CreditPreferenceScreen from '../screens/donor/CreditPreferenceScreen';
import { colors, fontSizes }  from '../constants/theme';

const Tab          = createBottomTabNavigator();
const ProfileStack = createNativeStackNavigator();

function ProfileNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="DonorProfile"     component={DonorProfileScreen} />
      <ProfileStack.Screen name="CreditPreference" component={CreditPreferenceScreen} />
    </ProfileStack.Navigator>
  );
}

const TAB_ICONS = {
  Home:    { active: 'home'           as const, inactive: 'home-outline'           as const },
  History: { active: 'time'           as const, inactive: 'time-outline'           as const },
  Alerts:  { active: 'notifications'  as const, inactive: 'notifications-outline'  as const },
  Profile: { active: 'person-circle'  as const, inactive: 'person-circle-outline'  as const },
};

export default function DonorTabs() {
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
      <Tab.Screen name="Home"    component={DonorHomeScreen} />
      <Tab.Screen name="History" component={DonorHistoryScreen} />
      <Tab.Screen name="Alerts"  component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileNavigator} />
    </Tab.Navigator>
  );
}
