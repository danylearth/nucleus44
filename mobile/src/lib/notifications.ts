import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

/**
 * Register for push notifications and save the token to the user's profile.
 */
export async function registerForPushNotifications(userId?: string): Promise<string | null> {
    if (!Device.isDevice) {
        console.log('Push notifications only work on physical devices');
        return null;
    }

    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;

    if (existing !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('Push notification permission denied');
        return null;
    }

    try {
        const tokenObj = await Notifications.getExpoPushTokenAsync();
        const token = tokenObj.data;

        if (userId) {
            await supabase.from('profiles').update({ push_token: token }).eq('id', userId);
        }

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'Default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
            });
        }

        return token;
    } catch (e) {
        console.log('Push token error:', e);
        return null;
    }
}

/**
 * Schedule a local notification
 */
export async function scheduleLocalNotification(
    title: string,
    body: string,
    trigger: Notifications.NotificationTriggerInput
) {
    return Notifications.scheduleNotificationAsync({
        content: { title, body, sound: true },
        trigger,
    });
}

/**
 * Schedule daily supplement reminder
 */
export async function scheduleSupplementReminder(hour: number = 9, minute: number = 0) {
    await Notifications.cancelAllScheduledNotificationsAsync();

    await scheduleLocalNotification(
        '💊 Time for supplements',
        "Don't forget to take your morning supplements!",
        { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute },
    );

    await scheduleLocalNotification(
        '💊 Evening supplements',
        'Have you taken your evening supplements?',
        { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 21, minute: 0 },
    );
}

/**
 * Listen for notification taps
 */
export function addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
) {
    return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Listen for incoming notifications while app is open
 */
export function addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
) {
    return Notifications.addNotificationReceivedListener(callback);
}
