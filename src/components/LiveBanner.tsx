import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBooking, timeToMinutes } from '../context/BookingContext';
import { getTodayString } from '../data/mockData';

interface LiveBannerProps {
  onPressBooking?: (bookingId: string) => void;
}

export const LiveBanner: React.FC<LiveBannerProps> = ({ onPressBooking }) => {
  const { bookings, currentTime, checkIn, endBookingEarly } = useBooking();
  const todayStr = getTodayString(0);
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

  // Find user's current or upcoming booking for today
  const myTodayBookings = bookings.filter(
    (b) =>
      b.date === todayStr &&
      b.bookedBy.includes('Văn Quyền') &&
      b.status !== 'cancelled' &&
      b.status !== 'completed'
  );

  // Active now: start <= now < end
  const activeBooking = myTodayBookings.find((b) => {
    const s = timeToMinutes(b.startTime);
    const e = timeToMinutes(b.endTime);
    return currentMinutes >= s && currentMinutes < e;
  });

  // Upcoming in next 45 minutes
  const upcomingBooking = myTodayBookings.find((b) => {
    const s = timeToMinutes(b.startTime);
    return s > currentMinutes && s - currentMinutes <= 45;
  });

  const targetBooking = activeBooking || upcomingBooking;
  if (!targetBooking) return null;

  const isCurrent = !!activeBooking;
  const endMinutes = timeToMinutes(targetBooking.endTime);
  const minutesLeft = Math.max(0, endMinutes - currentMinutes);
  const startMinutes = timeToMinutes(targetBooking.startTime);
  const minutesUntilStart = Math.max(0, startMinutes - currentMinutes);

  const handleCheckIn = () => {
    checkIn(targetBooking.id);
    if (Platform.OS === 'web') {
      alert(`Đã Check-in thành công tại ${targetBooking.roomCode}!`);
    } else {
      Alert.alert('Check-in Thành Công', `Bạn đã nhận phòng ${targetBooking.roomCode}. Chúc bạn học tập hiệu quả!`);
    }
  };

  const handleEndEarly = () => {
    const doEnd = () => {
      endBookingEarly(targetBooking.id);
      if (Platform.OS === 'web') {
        alert(`Đã trả phòng sớm ${targetBooking.roomCode}. Cảm ơn bạn đã giải phóng phòng!`);
      } else {
        Alert.alert('Đã Trả Phòng Sớm', `Phòng ${targetBooking.roomCode} đã được giải phóng cho sinh viên khác.`);
      }
    };

    if (Platform.OS === 'web') {
      if (confirm(`Bạn muốn trả phòng sớm tại ${targetBooking.roomCode} để nhường cho người khác?`)) {
        doEnd();
      }
    } else {
      Alert.alert(
        'Xác Nhận Trả Phòng',
        `Bạn có chắc chắn muốn kết thúc sớm và trả phòng ${targetBooking.roomCode}?`,
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Trả Phòng Sớm', style: 'destructive', onPress: doEnd },
        ]
      );
    }
  };

  return (
    <View style={styles.outerContainer}>
      <TouchableOpacity
        style={[
          styles.container,
          isCurrent ? styles.activeContainer : styles.upcomingContainer,
        ]}
        activeOpacity={0.9}
        onPress={() => onPressBooking?.(targetBooking.id)}
      >
        <View style={styles.leftCol}>
          <View
            style={[
              styles.iconBadge,
              { backgroundColor: isCurrent ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)' },
            ]}
          >
            <Ionicons
              name={isCurrent ? 'radio-outline' : 'alarm-outline'}
              size={18}
              color={isCurrent ? '#EF4444' : '#F59E0B'}
            />
          </View>
          <View style={styles.infoWrapper}>
            <View style={styles.headerRow}>
              <Text style={styles.tagText}>
                {isCurrent ? 'LIVE ACTIVITY' : 'SẮP BẮT ĐẦU'}
              </Text>
              <Text style={styles.roomCode}>{targetBooking.roomCode}</Text>
            </View>
            <Text style={styles.titleText} numberOfLines={1}>
              {targetBooking.roomName}
            </Text>
            <Text style={styles.timerSubText}>
              {isCurrent
                ? `Thời gian còn lại: ${minutesLeft} phút (${targetBooking.startTime} - ${targetBooking.endTime})`
                : `Bắt đầu sau ${minutesUntilStart} phút (${targetBooking.startTime})`}
            </Text>
          </View>
        </View>

        <View style={styles.actionsCol}>
          {targetBooking.status !== 'checked_in' && (
            <TouchableOpacity
              style={styles.actionBtnCheckIn}
              onPress={handleCheckIn}
              activeOpacity={0.8}
            >
              <Ionicons name="qr-code-outline" size={14} color="#FFFFFF" />
              <Text style={styles.actionBtnText}>Check-in</Text>
            </TouchableOpacity>
          )}

          {isCurrent && (
            <TouchableOpacity
              style={styles.actionBtnRelease}
              onPress={handleEndEarly}
              activeOpacity={0.8}
            >
              <Ionicons name="exit-outline" size={14} color="#EF4444" />
              <Text style={styles.actionBtnReleaseText}>Trả sớm</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: '#0F172A',
  },
  container: {
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  activeContainer: {
    backgroundColor: '#1E1B2E',
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  upcomingContainer: {
    backgroundColor: '#261D1A',
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoWrapper: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  roomCode: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    overflow: 'hidden',
  },
  titleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 2,
  },
  timerSubText: {
    fontSize: 11,
    color: '#CBD5E1',
    marginTop: 2,
  },
  actionsCol: {
    flexDirection: 'column',
    gap: 6,
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  actionBtnCheckIn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  actionBtnRelease: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  actionBtnReleaseText: {
    color: '#F87171',
    fontSize: 10,
    fontWeight: '600',
  },
});
