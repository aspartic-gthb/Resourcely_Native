import React, { useContext } from 'react';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../theme/ThemeContext';

import HomeScreen from '../screens/HomeScreen';
import AddEditResourceScreen from '../screens/AddEditResourceScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import TimetableScreen from '../screens/TimetableScreen';
import TasksScreen from '../screens/TasksScreen';
import PomodoroScreen from '../screens/PomodoroScreen';

import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import { AuthContext } from '../context/AuthContext';
import { View, ActivityIndicator } from 'react-native';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

const CustomDrawerContent = (props) => {
  const { colors } = useContext(ThemeContext);
  const { logout } = useContext(AuthContext);

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1, justifyContent: 'space-between' }}>
      <View>
        <DrawerItemList {...props} />
      </View>
      <View style={{ paddingBottom: 24 }}>
        <DrawerItem 
          label="Sign Out"
          icon={({ color }) => <Ionicons name="log-out-outline" size={22} color={color} />}
          onPress={() => {
            logout().catch(e => console.error(e));
          }}
          activeTintColor={colors.primary}
          inactiveTintColor={colors.textSecondary}
        />
      </View>
    </DrawerContentScrollView>
  );
};

const DrawerNavigator = () => {
  const { colors, isDarkMode } = useContext(ThemeContext);

  return (
    <Drawer.Navigator 
      initialRouteName="Study Vault"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveBackgroundColor: isDarkMode ? '#374151' : '#eef2ff',
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.textSecondary,
        drawerStyle: { backgroundColor: colors.background[0] },
      }}
    >
      <Drawer.Screen 
        name="Study Vault" 
        component={HomeScreen} 
        options={{ drawerIcon: ({ color }) => <Ionicons name="library-outline" size={22} color={color} /> }} 
      />
      <Drawer.Screen 
        name="Attendance" 
        component={AttendanceScreen} 
        options={{ drawerIcon: ({ color }) => <Ionicons name="checkmark-done-outline" size={22} color={color} /> }} 
      />
      <Drawer.Screen 
        name="Timetable" 
        component={TimetableScreen} 
        options={{ drawerIcon: ({ color }) => <Ionicons name="calendar-outline" size={22} color={color} /> }} 
      />
      <Drawer.Screen 
        name="Tasks" 
        component={TasksScreen} 
        options={{ drawerIcon: ({ color }) => <Ionicons name="list-outline" size={22} color={color} /> }} 
      />
      <Drawer.Screen 
        name="Pomodoro" 
        component={PomodoroScreen} 
        options={{ drawerIcon: ({ color }) => <Ionicons name="timer-outline" size={22} color={color} /> }} 
      />
    </Drawer.Navigator>
  );
};

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="SignUp" component={SignUpScreen} />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const { colors } = useContext(ThemeContext);
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background[0] }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {user ? (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="DrawerRoot" component={DrawerNavigator} />
            <Stack.Screen 
              name="AddEditResource" 
              component={AddEditResourceScreen} 
              options={{ 
                headerShown: true, 
                title: 'Resource Details',
                headerStyle: { backgroundColor: colors.background[1] },
                headerTintColor: colors.text,
                headerShadowVisible: false,
              }} 
            />
          </Stack.Navigator>
        ) : (
          <AuthStack />
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default AppNavigator;
