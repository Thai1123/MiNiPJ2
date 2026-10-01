import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Handle notifications when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'web') return false;
  
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    return finalStatus === 'granted';
  } catch (error) {
    console.log('Error requesting notification permissions:', error);
    return false;
  }
};

export const scheduleBookingNotification = async (booking: {
  date: string;
  startTime: string;
  roomName: string;
}): Promise<string | null> => {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    return null;
  }

  // Parse YYYY-MM-DD
  const [year, month, day] = booking.date.split('-').map(Number);
  // Parse HH:mm
  const [hour, minute] = booking.startTime.split(':').map(Number);
  
  const triggerDate = new Date(year, month - 1, day, hour, minute);
  // Subtract 15 minutes
  triggerDate.setMinutes(triggerDate.getMinutes() - 15);
  
  // If the target notification time is in the past, do not schedule
  if (triggerDate.getTime() <= Date.now()) {
    return null;
  }

  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "⏰ Sắp đến giờ học",
        body: `Bạn có lịch tại phòng ${booking.roomName} lúc ${booking.startTime}.`,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });
    return notificationId;
  } catch (error) {
    console.log("Error scheduling notification:", error);
    return null;
  }
};

export const cancelBookingNotification = async (notificationId?: string | null) => {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.log("Error canceling notification:", error);
  }
};
