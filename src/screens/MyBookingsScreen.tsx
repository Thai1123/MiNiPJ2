import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBookingStore, ZustandBooking } from '../store/useBookingStore';
import { BookingQRModal } from '../components/BookingQRModal';
import { cancelBookingNotification } from '../utils/notifications';

export const MyBookingsScreen: React.FC = () => {
  const user = useBookingStore(state => state.user);
  const bookings = useBookingStore(state => state.bookings);
  const cancelBooking = useBookingStore(state => state.cancelBooking);
  
  const currentUserId = user?.id || 'user-1';
  
  // Filter active bookings for the current user
  const activeBookings = bookings.filter(b => b.userId === currentUserId && b.status === 'active');
  
  const [selectedBooking, setSelectedBooking] = useState<ZustandBooking | null>(null);
  const [qrModalVisible, setQrModalVisible] = useState<boolean>(false);

  const handleCancel = (booking: ZustandBooking) => {
    if (Platform.OS === 'web') {
      const confirm = window.confirm('Bạn có chắc chắn muốn hủy đặt phòng này?');
      if (confirm) {
        cancelBooking(booking.id);
        if (booking.notificationId) {
          cancelBookingNotification(booking.notificationId);
        }
      }
    } else {
      Alert.alert(
        'Hủy đặt phòng',
        'Bạn có chắc chắn muốn hủy lịch đặt phòng này?',
        [
          { text: 'Không', style: 'cancel' },
          { 
            text: 'Có, Hủy', 
            style: 'destructive',
            onPress: () => {
              cancelBooking(booking.id);
              if (booking.notificationId) {
                cancelBookingNotification(booking.notificationId);
              }
            }
          }
        ]
      );
    }
  };

  const handleShowQR = (booking: ZustandBooking) => {
    setSelectedBooking(booking);
    setQrModalVisible(true);
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>LỊCH ĐẶT CỦA TÔI</Text>
        <Text style={styles.headerSubtitle}>
          {user?.name || 'Văn Thái'}
          {activeBookings.length > 0
            ? ` • ${activeBookings.length} lịch đặt`
            : ' • Chưa có lịch đặt phòng'}
        </Text>
      </View>

      {activeBookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="ticket-outline" size={48} color="#475569" />
          <Text style={styles.emptyText}>Bạn chưa có lịch đặt phòng.</Text>
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {activeBookings.map(booking => (
            <View key={booking.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.roomInfo}>
                  <Text style={styles.roomName}>{booking.roomName}</Text>
                  <Text style={styles.buildingText}>{booking.building}</Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>Active</Text>
                </View>
              </View>

              <View style={styles.timeInfoBox}>
                <Ionicons name="calendar-outline" size={16} color="#38BDF8" />
                <Text style={styles.timeText}>
                  {booking.date}  |  {booking.startTime} - {booking.endTime}
                </Text>
              </View>

              <View style={styles.actionsRow}>
                <TouchableOpacity 
                  style={styles.cancelBtn} 
                  onPress={() => handleCancel(booking)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="close-circle-outline" size={16} color="#F87171" />
                  <Text style={styles.cancelBtnText}>Hủy đặt phòng</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.qrBtn} 
                  onPress={() => handleShowQR(booking)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="qr-code" size={16} color="#FFFFFF" />
                  <Text style={styles.qrBtnText}>Xem QR</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <BookingQRModal
        visible={qrModalVisible}
        booking={selectedBooking}
        onClose={() => setQrModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  emptyContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    marginTop: 10,
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 12,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    gap: 16,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  buildingText: {
    color: '#94A3B8',
    fontSize: 13,
  },
  statusBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  statusText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  timeInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  timeText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  cancelBtnText: {
    color: '#FCA5A5',
    fontSize: 14,
    fontWeight: '600',
  },
  qrBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: 10,
  },
  qrBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
