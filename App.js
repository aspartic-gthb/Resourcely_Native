import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { initDatabase } from './src/database/DatabaseHelper';
import { ThemeProvider } from './src/theme/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';

// 📱 Main Application Component
// This is the starting point of our entire Resourcely App!
export default function App() {
  // 💾 State to keep track of whether our local database is ready to go
  const [dbInitialized, setDbInitialized] = useState(false);

  // 🔄 useEffect Hook
  // This runs exactly once when the app starts up.
  useEffect(() => {
    const setup = async () => {
      try {
        // We need to make sure our SQLite database is created and ready
        await initDatabase();
        setDbInitialized(true); // Boom! Database is ready.
      } catch (e) {
        console.error("Failed to initialize database", e);
      }
    };
    setup();
  }, []);

  // ⏳ Loading Screen
  // If the database is still getting set up, show a friendly loading message.
  if (!dbInitialized) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // 🎉 App UI
  // Once everything is loaded, we wrap our app in a few 'Providers':
  // 1. ThemeProvider: Knows if we are in Dark Mode or Light Mode.
  // 2. AuthProvider: Keeps track of who is logged in.
  // 3. AppNavigator: Handles all the screens and menus.
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}

// 🎨 Styles for our base App component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
