import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useWallet } from '../context/WalletContext';

import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import DashboardScreen from '../screens/DashboardScreen';
import TransferScreen from '../screens/TransferScreen';
import BillsScreen from '../screens/BillsScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TransactionDetailScreen from '../screens/TransactionDetailScreen';
import SupportScreen from '../screens/SupportScreen';
import InvoiceScreen from '../screens/InvoiceScreen'; 

// Elite Modules
import AnalyticsScreen from '../screens/AnalyticsScreen';
import CardScreen from '../screens/CardScreen';
import DeveloperConsoleScreen from '../screens/DeveloperConsoleScreen';
import RewardsScreen from '../screens/RewardsScreen'; // Added Gamification

// Elite Modules (v2)
import SavingsScreen from '../screens/SavingsScreen';
import LoanScreen from '../screens/LoanScreen';
import BeneficiariesScreen from '../screens/BeneficiariesScreen';
import QRPayScreen from '../screens/QRPayScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { borderTopWidth: 1, borderTopColor: '#f0f0f0', height: 60, paddingBottom: 8 },
        tabBarIcon: ({ color, size }) => {
          const icons = {
            DashboardTab: 'home',
            Cards: 'card',
            Insights: 'pie-chart',
            Rewards: 'gift-outline', // Registered Reward Icon
            History: 'time-outline',
            Profile: 'person-outline',
          };
          return <Ionicons name={icons[route.name] || 'ellipse'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="DashboardTab" component={DashboardScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Cards" component={CardScreen} options={{ title: 'Cards' }} />
      <Tab.Screen name="Insights" component={AnalyticsScreen} options={{ title: 'Insights' }} />
      <Tab.Screen name="Rewards" component={RewardsScreen} options={{ title: 'Rewards' }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ title: 'Activity' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="Transfer" component={TransferScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Bills" component={BillsScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Invoice" component={InvoiceScreen} options={{ presentation: 'modal' }} />

      <Stack.Screen name="DeveloperConsole" component={DeveloperConsoleScreen} options={{ presentation: 'modal' }} />

      {/* Elite Modules (v2) */}
      <Stack.Screen name="Savings" component={SavingsScreen} options={{ presentation: 'modal', animation: 'slide_from_right' }} />
      <Stack.Screen name="Loans" component={LoanScreen} options={{ presentation: 'modal', animation: 'slide_from_right' }} />
      <Stack.Screen name="Beneficiaries" component={BeneficiariesScreen} options={{ presentation: 'modal', animation: 'slide_from_right' }} />
      <Stack.Screen name="QRPay" component={QRPayScreen} options={{ presentation: 'modal', animation: 'fade_from_bottom' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ presentation: 'card', animation: 'slide_from_right' }} />

      <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} options={{ presentation: 'transparentModal', animation: 'fade_from_bottom' }} />
      <Stack.Screen name="Support" component={SupportScreen} options={{ presentation: 'card', headerShown: true, title: 'Help & Support', headerTintColor: colors.textDark }} />
    </Stack.Navigator>
  );
}

function AuthStack() {
  const { user } = useWallet();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={user ? 'Login' : 'Signup'}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { loading, onboarded, isAuthenticated } = useWallet();

  if (loading) return <SplashScreen />;
  if (!onboarded) return <OnboardingScreen />;

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

