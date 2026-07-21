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
import RestaurantProfileScreen         from '../screens/restaurant/RestaurantProfileScreen';
import RestaurantDeleteAccountScreen   from '../screens/restaurant/RestaurantDeleteAccountScreen';
import RestaurantExportDataScreen      from '../screens/restaurant/RestaurantExportDataScreen';
import RestaurantHelpFaqScreen         from '../screens/restaurant/RestaurantHelpFaqScreen';
import RestaurantTermsPrivacyScreen    from '../screens/restaurant/RestaurantTermsPrivacyScreen';
import RestaurantPublicPageScreen           from '../screens/restaurant/RestaurantPublicPageScreen';
import EditRestaurantDetailsScreen          from '../screens/restaurant/EditRestaurantDetailsScreen';
import RestaurantLocationScreen             from '../screens/restaurant/RestaurantLocationScreen';
import MenuPhotosScreen                     from '../screens/restaurant/MenuPhotosScreen';
import RestaurantAnalyticsScreen            from '../screens/restaurant/RestaurantAnalyticsScreen';
import { colors, fontSizes }     from '../constants/theme';
import { useNotificationStore }  from '../store/notificationStore';

export type ProfileStackParamList = {
  RestaurantProfile:          undefined;
  RestaurantDeleteAccount:    undefined;
  RestaurantExportData:       undefined;
  RestaurantHelpFaq:          undefined;
  RestaurantTermsPrivacy:     undefined;
  RestaurantPublicPage:       undefined;
  EditRestaurantDetails:      undefined;
  RestaurantLocation:         { latitude: number; longitude: number; address: string };
  MenuPhotos:                 undefined;
  RestaurantAnalytics:        undefined;
  TodaysClaims:               undefined;
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
    foodName:             string;
    quantity:             number;
    unit:                 string;
    category:             string;
    pickupWindow:         string;
    donationId:           string;
    estimatedReachLabel?: string;
  };
};

const Tab            = createBottomTabNavigator<RestaurantTabParamList>();
const DonationsStack = createNativeStackNavigator<DonationsStackParamList>();
const ProfileStack   = createNativeStackNavigator<ProfileStackParamList>();

function ProfileNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="RestaurantProfile"       component={RestaurantProfileScreen} />
      <ProfileStack.Screen name="RestaurantDeleteAccount" component={RestaurantDeleteAccountScreen} />
      <ProfileStack.Screen name="RestaurantExportData"    component={RestaurantExportDataScreen} />
      <ProfileStack.Screen name="RestaurantHelpFaq"       component={RestaurantHelpFaqScreen} />
      <ProfileStack.Screen name="RestaurantTermsPrivacy"  component={RestaurantTermsPrivacyScreen} />
      <ProfileStack.Screen name="RestaurantPublicPage"    component={RestaurantPublicPageScreen} />
      <ProfileStack.Screen name="EditRestaurantDetails"   component={EditRestaurantDetailsScreen} />
      <ProfileStack.Screen name="RestaurantLocation"      component={RestaurantLocationScreen} />
      <ProfileStack.Screen name="MenuPhotos"              component={MenuPhotosScreen} />
      <ProfileStack.Screen name="RestaurantAnalytics"     component={RestaurantAnalyticsScreen} />
      <ProfileStack.Screen name="TodaysClaims"            component={TodaysClaimsScreen} />
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
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            (navigation as any).navigate('Donations', { screen: 'DonationList' });
          },
        })}
      />
      <Tab.Screen
        name="Alerts"
        component={NotificationsScreen}
        options={{
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.accentPrimary, fontSize: fontSizes.xs },
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            (navigation as any).navigate('Profile', { screen: 'RestaurantProfile' });
          },
        })}
      />
    </Tab.Navigator>
  );
}
