import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './src/store/store';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text, View, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import type { RootState } from './src/store/store';

import { LoginScreen } from './src/auth/LoginScreen';
import { RegisterScreen } from './src/auth/RegisterScreen';
import { OnboardingScreen } from './src/auth/OnboardingScreen';
import { authApi } from './src/auth/authApi';
import { login } from './src/store/authSlice';
import { HomeScreen } from './src/home/HomeScreen';
import { PanicScreen } from './src/home/PanicScreen';
import { EmergencyTypeScreen } from './src/emergency/EmergencyTypeScreen';
import { VideoReportScreen } from './src/emergency/VideoReportScreen';
import { AlertSentScreen } from './src/emergency/AlertSentScreen';
import { ResponderTrackingScreen } from './src/emergency/ResponderTrackingScreen';
import { LocationShareScreen } from './src/location/LocationShareScreen';
import { LiveLocationMap } from './src/location/LiveLocationMap';
import { FamilySafetyScreen } from './src/family/FamilySafetyScreen';
import { BarangayAlertScreen } from './src/barangay/BarangayAlertScreen';
import { EvacuationRouteScreen } from './src/barangay/EvacuationRouteScreen';
import { ProfileScreen } from './src/profile/ProfileScreen';
import { ProfileSettingsScreen } from './src/profile/ProfileSettingsScreen';
import { HouseholdInfoScreen } from './src/profile/HouseholdInfoScreen';
import { HazardMapScreen } from './src/hazard/HazardMapScreen';
import { HazardReportScreen } from './src/hazard/HazardReportScreen';
import { EmergencyKitScreen } from './src/preparedness/EmergencyKitScreen';
import { FirstAidScreen } from './src/preparedness/FirstAidScreen';
import { ResponderHomeScreen } from './src/responder/ResponderHomeScreen';
import { AssignmentScreen } from './src/responder/AssignmentScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabIcon = ({ icon, focused, badge }: { icon: string; focused: boolean; badge?: number }) => (
  <View style={{ alignItems: 'center', justifyContent: 'center' }}>
    <Text style={{ fontSize: 24 }}>{icon}</Text>
    {badge !== undefined && badge > 0 && (
      <View style={{ position: 'absolute', top: -4, right: -8, backgroundColor: '#ef4444', borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }}>
        <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{badge > 9 ? '9+' : badge}</Text>
      </View>
    )}
  </View>
);

const screenOptions = {
  headerStyle: { backgroundColor: '#fff' },
  headerTintColor: '#1f2937',
  headerTitleStyle: { fontWeight: '600' as const },
  headerShadowVisible: false,
};

const normalizeAuthUser = (user: any) => ({
  id: user?.id,
  email: user?.email || '',
  firstName: user?.firstName || user?.first_name || '',
  lastName: user?.lastName || user?.last_name || '',
  phone: user?.phone || '',
  barangay: user?.barangay || '',
  role: user?.role || 'user',
  createdAt: user?.createdAt || user?.created_at || null,
});

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: { height: 70, paddingBottom: 10, paddingTop: 10, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e7eb' },
      tabBarActiveTintColor: '#ef4444',
      tabBarInactiveTintColor: '#9ca3af',
      tabBarLabelStyle: { fontSize: 12, fontWeight: '500' },
    }}
  >
    <Tab.Screen
      name="HomeTab"
      component={HomeScreen}
      options={{
        tabBarLabel: 'Home',
        tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="Alerts"
      component={BarangayAlertScreen}
      options={{
        tabBarLabel: 'Alerts',
        tabBarIcon: ({ focused }) => <TabIcon icon="🔔" focused={focused} badge={2} />,
      }}
    />
    <Tab.Screen
      name="Family"
      component={FamilySafetyScreen}
      options={{
        tabBarLabel: 'Family',
        tabBarIcon: ({ focused }) => <TabIcon icon="👨‍👩‍👧" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarLabel: 'Profile',
        tabBarIcon: ({ focused }) => <TabIcon icon="👤" focused={focused} />,
      }}
    />
  </Tab.Navigator>
);

const AuthStack = ({ initialRouteName }: { initialRouteName: 'Onboarding' | 'Login' }) => (
  <Stack.Navigator
    initialRouteName={initialRouteName}
    screenOptions={{
      ...screenOptions,
      headerBackTitleVisible: false,
    }}
  >
    <Stack.Screen
      name="Onboarding"
      component={OnboardingScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Login"
      component={LoginScreen}
      options={{ title: 'Sign In' }}
    />
    <Stack.Screen
      name="Register"
      component={RegisterScreen}
      options={{ title: 'Create Account' }}
    />
  </Stack.Navigator>
);

const MainStack = () => (
  <Stack.Navigator
    screenOptions={{
      ...screenOptions,
      headerBackTitleVisible: false,
    }}
  >
    <Stack.Screen
      name="Main"
      component={MainTabs}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="Panic" 
      component={PanicScreen}
      options={{ 
        headerShown: false,
        presentation: 'fullScreenModal',
        animation: 'slide_from_bottom'
      }} 
    />
    <Stack.Screen 
      name="EmergencyType" 
      component={EmergencyTypeScreen}
      options={{ 
        title: 'Select Emergency Type',
        ...screenOptions
      }}
    />
    <Stack.Screen 
      name="VideoReport" 
      component={VideoReportScreen}
      options={{ 
        title: 'Capture Evidence',
        ...screenOptions
      }}
    />
    <Stack.Screen 
      name="AlertSent" 
      component={AlertSentScreen}
      options={{ 
        title: 'Alert Sent',
        ...screenOptions,
        headerBackVisible: false,
      }}
    />
    <Stack.Screen 
      name="ResponderTracking" 
      component={ResponderTrackingScreen}
      options={{ 
        title: 'Track Responders',
        ...screenOptions
      }}
    />
    <Stack.Screen 
      name="LocationShare" 
      component={LocationShareScreen}
      options={{ 
        title: 'Share Location',
        ...screenOptions
      }}
    />
    <Stack.Screen 
      name="LiveLocationMap" 
      component={LiveLocationMap}
      options={{ 
        title: 'Live Map',
        ...screenOptions
      }}
    />
    <Stack.Screen 
      name="FamilySafety" 
      component={FamilySafetyScreen}
      options={{ 
        title: 'Family Safety',
        ...screenOptions
      }}
    />
    <Stack.Screen 
      name="BarangayAlert" 
      component={BarangayAlertScreen}
      options={{ 
        title: 'Barangay Alerts',
        ...screenOptions
      }}
    />
    <Stack.Screen 
      name="EvacuationRoute" 
      component={EvacuationRouteScreen}
      options={{ 
        title: 'Evacuation Routes',
        ...screenOptions
      }}
    />
    <Stack.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{ 
        title: 'Profile',
        ...screenOptions
      }}
    />
    <Stack.Screen 
      name="HouseholdInfo" 
      component={HouseholdInfoScreen}
      options={{ 
        title: 'Household Info',
        ...screenOptions
      }}
    />
    <Stack.Screen
      name="ProfileSettings"
      component={ProfileSettingsScreen}
      options={{
        title: 'Profile Settings',
        ...screenOptions
      }}
    />
    <Stack.Screen 
      name="HazardMap" 
      component={HazardMapScreen}
      options={{ 
        title: 'Hazard Map',
        ...screenOptions
      }}
    />
    <Stack.Screen 
      name="HazardReport" 
      component={HazardReportScreen}
      options={{ 
        title: 'Report Hazard',
        ...screenOptions
      }}
    />
    <Stack.Screen 
      name="EmergencyKit" 
      component={EmergencyKitScreen}
      options={{ 
        title: 'Emergency Kit',
        ...screenOptions
      }}
    />
    <Stack.Screen 
      name="FirstAid" 
      component={FirstAidScreen}
      options={{ 
        title: 'First Aid',
        ...screenOptions
      }}
    />
    <Stack.Screen 
      name="ResponderHome" 
      component={ResponderHomeScreen}
      options={{ 
        title: 'Responder Dashboard',
        ...screenOptions
      }}
    />
    <Stack.Screen 
      name="Assignment" 
      component={AssignmentScreen}
      options={{ 
        title: 'Assignment',
        ...screenOptions
      }}
    />
  </Stack.Navigator>
);

const AppContent = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const [isHydratingAuth, setIsHydratingAuth] = useState(true);
  const [authInitialRoute, setAuthInitialRoute] = useState<'Onboarding' | 'Login'>('Onboarding');

  useEffect(() => {
    let isMounted = true;

    const hydrateAuth = async () => {
      try {
        const rememberedCredentials = await authApi.getRememberedCredentials();
        if (isMounted && rememberedCredentials?.email) {
          setAuthInitialRoute('Login');
        }

        const storedToken = await authApi.getStoredToken();
        if (!storedToken) {
          return;
        }

        const profile = await authApi.getProfile();
        if (!isMounted) {
          return;
        }

        dispatch(login(normalizeAuthUser(profile)));
        setAuthInitialRoute('Login');
      } catch (_error) {
        await authApi.clearSessionToken();
      } finally {
        if (isMounted) {
          setIsHydratingAuth(false);
        }
      }
    };

    hydrateAuth();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  if (isHydratingAuth) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: '#08111d', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text style={{ color: '#f8fafc', fontSize: 18, fontWeight: '700' }}>EmergencyTool</Text>
          <Text style={{ color: '#cbd5e1', fontSize: 14, marginTop: 10 }}>Restoring your saved account...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        {isAuthenticated ? <MainStack /> : <AuthStack initialRouteName={authInitialRoute} />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
