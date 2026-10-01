import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Room } from '../types';
import { useBookingStore, ZustandBooking } from '../store/useBookingStore';
import { BookingQRModal } from '../components/BookingQRModal';
import { scheduleBookingNotification } from '../utils/notifications';

interface BookingScreenProps {
  room: Room;
  onBack: () => void;
}

const TIME_SLOTS = [
  { id: '1', start: '07:30', end: '09:30', label: '07:30 - 09:30' },
  { id: '2', start: '09:30', end: '11:30', label: '09:30 - 11:30' },
  { id: '3', start: '13:00', end: '15:00', label: '13:00 - 15:00' },
  { id: '4', start: '15:00', end: '17:00', label: '15:00 - 17:00' },
];

interface DateItem {
  iso: string;
  label: string;
  dayOfWeek: string;
}

export const BookingScreen: React.FC<BookingScreenProps> = ({ room, onBack }) => {
  const isSlotBookedStore = useBookingStore(state => state.isSlotBooked);
  const addBooking = useBookingStore(state => state.addBooking);
  const user = useBookingStore(state => state.user);
  const bookings = useBookingStore(state => state.bookings); // trigger re-render on new bookings
  
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [successBooking, setSuccessBooking] = useState<ZustandBooking | null>(null);
  const [qrModalVisible, setQrModalVisible] = useState<boolean>(false);

  // Generate 7 days
  const dates = useMemo<DateItem[]>(() => {
    const list: DateItem[] = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const dateStr = String(d.getDate()).padStart(2, '0');
      const isoString = `${year}-${month}-${dateStr}`;
      
      let label = `${dateStr}/${month}`;
      if (i === 0) label = 'Hôm nay';
      else if (i === 1) label = 'Ngày mai';

      list.push({
        iso: isoString,
        label,
        dayOfWeek: d.toLocaleDateString('vi-VN', { weekday: 'short' }),
      });
    }
    return list;
  }, []);

  // Set today as default selected date if empty
  if (!selectedDate && dates.length > 0) {
    setSelectedDate(dates[0].iso);
  }

  const isSlotBooked = (slotStart: string) => {
    return isSlotBookedStore(room.id, selectedDate, slotStart);
  };

  const handleConfirm = async () => {
    const slot = TIME_SLOTS.find(s => s.id === selectedSlotId);
    if (!slot) return;
    
    // Conflict Engine: Re-check before booking
    const isConflict = isSlotBookedStore(room.id, selectedDate, slot.start);
    if (isConflict) {
      const errorMsg = 'Khung giờ này vừa được người khác đặt.';
      if (Platform.OS === 'web') {
        alert(errorMsg);
      } else {
        Alert.alert('Lỗi', errorMsg);
      }
      setSelectedSlotId('');
      return;
    }

    // Simulate a logged in user if none exists
    const currentUserId = user?.id || 'user-1';
    
    // Schedule notification
    const notificationId = await scheduleBookingNotification({
      date: selectedDate,
      startTime: slot.start,
      roomName: room.name,
    });
    
    const newBooking = addBooking({
      roomId: room.id,
      roomName: room.name,
      building: room.building,
      date: selectedDate,
      startTime: slot.start,
      endTime: slot.end,
      userId: currentUserId,
      notificationId: notificationId,
    });

    setSuccessBooking(newBooking);
  };

  const isFormValid = selectedDate !== '' && selectedSlotId !== '';

  if (successBooking) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi Tiết Vé Đặt</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.successContent}>
          <View style={styles.successIconCircle}>
            <Ionicons name="checkmark" size={48} color="#10B981" />
          </View>
          <Text style={styles.successTitle}>Đặt phòng thành công 🎉</Text>

          {/* Booking Pass */}
          <View style={styles.passCard}>
            <Text style={styles.passHeader}>THÔNG TIN VÉ ĐẶT</Text>
            
            <View style={styles.passRow}>
              <Text style={styles.passLabel}>Mã vé</Text>
              <Text style={styles.passValue}>{successBooking.id.toUpperCase()}</Text>
            </View>
            <View style={styles.passRow}>
              <Text style={styles.passLabel}>Phòng</Text>
              <Text style={styles.passValue}>{successBooking.roomName}</Text>
            </View>
            <View style={styles.passRow}>
              <Text style={styles.passLabel}>Tòa nhà</Text>
              <Text style={styles.passValue}>{successBooking.building}</Text>
            </View>
            <View style={styles.passRow}>
              <Text style={styles.passLabel}>Ngày</Text>
              <Text style={styles.passValue}>{successBooking.date}</Text>
            </View>
            <View style={styles.passRow}>
              <Text style={styles.passLabel}>Giờ bắt đầu</Text>
              <Text style={styles.passValue}>{successBooking.startTime}</Text>
            </View>
            <View style={styles.passRow}>
              <Text style={styles.passLabel}>Giờ kết thúc</Text>
              <Text style={styles.passValue}>{successBooking.endTime}</Text>
            </View>
            <View style={styles.passRow}>
              <Text style={styles.passLabel}>Người đặt</Text>
              <Text style={styles.passValue}>{user?.name || 'Văn Thái'}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.qrButton}
            onPress={() => setQrModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="qr-code-outline" size={20} color="#FFFFFF" />
            <Text style={styles.qrButtonText}>Hiển thị QR Check-in</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.returnButton}
            onPress={onBack}
            activeOpacity={0.8}
          >
            <Text style={styles.returnButtonText}>Về màn hình chính</Text>
          </TouchableOpacity>
        </View>

        <BookingQRModal
          visible={qrModalVisible}
          booking={successBooking}
          onClose={() => setQrModalVisible(false)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đặt Phòng {room.code}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Room Info summary */}
        <View style={styles.roomSummary}>
          <Text style={styles.roomName}>{room.name}</Text>
          <Text style={styles.roomMeta}>
            {room.building} - Tầng {room.floor} - {room.capacity} chỗ
          </Text>
        </View>

        {/* Date Selector */}
        <Text style={styles.sectionTitle}>Chọn ngày</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll} contentContainerStyle={styles.dateScrollContent}>
          {dates.map((d) => {
            const isSelected = d.iso === selectedDate;
            return (
              <TouchableOpacity
                key={d.iso}
                style={[
                  styles.dateCard,
                  isSelected && styles.dateCardSelected
                ]}
                onPress={() => {
                  setSelectedDate(d.iso);
                  setSelectedSlotId(''); // reset slot when changing date
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.dateDay, isSelected && styles.textSelected]}>
                  {d.dayOfWeek}
                </Text>
                <Text style={[styles.dateLabel, isSelected && styles.textSelected]}>
                  {d.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Time Slots */}
        <Text style={styles.sectionTitle}>Chọn khung giờ</Text>
        <View style={styles.slotsContainer}>
          {TIME_SLOTS.map((slot) => {
            const booked = isSlotBooked(slot.start);
            const isSelected = selectedSlotId === slot.id;
            
            let statusText = 'Sẵn sàng';
            let cardStyle = styles.slotCardAvailable;
            let textStyle = styles.slotTextAvailable;

            if (booked) {
              statusText = 'Đã đặt';
              cardStyle = styles.slotCardBooked;
              textStyle = styles.slotTextBooked;
            } else if (isSelected) {
              statusText = 'Đang chọn';
              cardStyle = styles.slotCardSelected;
              textStyle = styles.slotTextSelected;
            }

            return (
              <TouchableOpacity
                key={slot.id}
                style={[styles.slotCard, cardStyle]}
                disabled={booked}
                activeOpacity={0.8}
                onPress={() => setSelectedSlotId(slot.id)}
              >
                <View style={styles.slotTimeRow}>
                  <Ionicons 
                    name={booked ? "lock-closed" : isSelected ? "checkmark-circle" : "time-outline"} 
                    size={18} 
                    color={booked ? '#94A3B8' : isSelected ? '#FFFFFF' : '#38BDF8'} 
                  />
                  <Text style={[styles.slotTime, textStyle]}>{slot.label}</Text>
                </View>
                <Text style={[styles.slotStatus, textStyle]}>{statusText}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.confirmButton, !isFormValid && styles.confirmButtonDisabled]}
          onPress={handleConfirm}
          disabled={!isFormValid}
          activeOpacity={0.8}
        >
          <Text style={[styles.confirmButtonText, !isFormValid && styles.confirmButtonTextDisabled]}>
            Xác nhận đặt phòng
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0B1120',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  roomSummary: {
    padding: 16,
    backgroundColor: '#1E293B',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  roomName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  roomMeta: {
    color: '#94A3B8',
    fontSize: 14,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 16,
    marginBottom: 12,
    marginTop: 8,
  },
  dateScroll: {
    flexGrow: 0,
    marginBottom: 24,
  },
  dateScrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  dateCard: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  dateCardSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#3B82F6',
  },
  dateDay: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  dateLabel: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '700',
  },
  textSelected: {
    color: '#FFFFFF',
  },
  slotsContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  slotCardAvailable: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  slotCardSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#3B82F6',
  },
  slotCardBooked: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    opacity: 0.6,
  },
  slotTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  slotTime: {
    fontSize: 16,
    fontWeight: '700',
  },
  slotStatus: {
    fontSize: 13,
    fontWeight: '600',
  },
  slotTextAvailable: {
    color: '#38BDF8',
  },
  slotTextSelected: {
    color: '#FFFFFF',
  },
  slotTextBooked: {
    color: '#94A3B8',
  },
  bottomBar: {
    padding: 16,
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  confirmButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#334155',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  confirmButtonTextDisabled: {
    color: '#94A3B8',
  },
  successContent: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    color: '#10B981',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 24,
  },
  passCard: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 24,
  },
  passHeader: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 16,
    textAlign: 'center',
  },
  passRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  passLabel: {
    color: '#94A3B8',
    fontSize: 14,
  },
  passValue: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#38BDF8',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  qrButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  returnButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  returnButtonText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '600',
  },
});
