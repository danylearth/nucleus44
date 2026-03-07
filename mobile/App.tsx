import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/lib/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import {
  registerForPushNotifications,
  scheduleSupplementReminder,
  addNotificationResponseListener,
  addNotificationReceivedListener,
} from './src/lib/notifications';
import type * as Notifications from 'expo-notifications';

export default function App() {
  const notificationListener = useRef<ReturnType<typeof addNotificationReceivedListener> | null>(null);
  const responseListener = useRef<ReturnType<typeof addNotificationResponseListener> | null>(null);

  useEffect(() => {
    // Register for push notifications
    registerForPushNotifications().then(token => {
      if (token) console.log('Push token:', token);
    });

    // Schedule daily supplement reminders
    scheduleSupplementReminder(9, 0);

    // Listen for notifications while app is open
    notificationListener.current = addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Listen for notification taps
    responseListener.current = addNotificationResponseListener(response => {
      console.log('Notification tapped:', response);
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
