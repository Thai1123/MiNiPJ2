import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Room } from '../types';
import { useBooking } from '../context/BookingContext';

interface KioskDisplayProps {
  visible: boolean;
  initialRoom?: Room | null;
  onClose: () => void;
}

export const KioskDisplay: React.FC<KioskDisplayProps> = ({
  visible,
  initialRoom,
  onClose,
}) => {
  const { rooms, getRoomStatus, quickBook, currentTime, endBookingEarly, extendBooking } = useBooking();
  const [selectedRoomId, setSelectedRoomId] = useState<string>(
    initialRoom ? initialRoom.id : rooms[0]?.id || 'room-1'
  );

  const room = rooms.find((r) => r.id === selectedRoomId) || rooms[0];
  const roomStatus = getRoomStatus(room.id);

  const isAvailable = roomStatus.status === 'available';
  const isEnding = roomStatus.status === 'ending_soon';
  const isOccupied = roomStatus.status === 'occupied';

  const timeString = currentTime.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const dateString = currentTime.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleQuick = (mins: number) => {
    const res = quickBook(room.id, mins);
    if (!res.success) {
      if (Platform.OS === 'web') alert(res.error);
      else Alert.alert('Lỗi Đặt Kiosk', res.error);
    } else {
      if (Platform.OS === 'web') alert(`Đã đặt tức thì ${mins} phút tại ${room.name}!`);
      else Alert.alert('Đã Đặt Thành Công', `Bạn có ${mins} phút sử dụng phòng bắt đầu từ bây giờ.`);
    }
  };

  const handleEndEarly = () => {
    if (roomStatus.currentBooking) {
      endBookingEarly(roomStatus.currentBooking.id);
      if (Platform.OS === 'web') alert('Đã trả phòng và giải phóng cửa phòng!');
      else Alert.alert('Đã Trả Phòng', 'Phòng đã sẵn sàng cho người tiếp theo.');
    }
  };

  const handleExtend = () => {
    if (roomStatus.currentBooking) {
      const res = extendBooking(roomStatus.currentBooking.id, 15);
      if (Platform.OS === 'web') alert(res.message);
      else Alert.alert('Gia hạn Kiosk', res.message);
    }
  };

  if (!visible) return null;

  const bgThemeColor = isAvailable
    ? '#064E3B' // Emerald dark
    : isEnding
    ? '#78350F' // Amber dark
    : '#7F1D1D'; // Crimson dark

  const accentColor = isAvailable
    ? '#10B981'
    : isEnding
    ? '#F59E0B'
    : '#EF4444';

  return (
    <Modal visible={visible} animationType="fade" transparent={false}>
      <SafeAreaView style={[styles.kioskRoot, { backgroundColor: bgThemeColor }]}>
        {/* Top Kiosk Bar */}
        <View style={styles.kioskTopBar}>
          <View style={styles.kioskBrand}>
            <Ionicons name="hardware-chip-outline" size={20} color="#FFFFFF" />
            <Text style={styles.kioskBrandText}>ROBIN DOOR DISPLAY • EDUSPACE</Text>
          </View>

          {/* Switch room on tablet */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roomSelector}>
            {rooms.map((r) => (
              <TouchableOpacity
                key={r.id}
                style={[
                  styles.roomTab,
                  r.id === selectedRoomId && styles.roomTabActive,
                ]}
                onPress={() => setSelectedRoomId(r.id)}
              >
                <Text
                  style={[
                    styles.roomTabText,
                    r.id === selectedRoomId && styles.roomTabTextActive,
                  ]}
                >
                  {r.code}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.exitBtn} onPress={onClose} activeOpacity={0.8}>
            <Ionicons name="close" size={20} color="#FFFFFF" />
            <Text style={styles.exitText}>Thoát Kiosk</Text>
          </TouchableOpacity>
        </View>

        {/* Main Tablet Canvas */}
        <View style={styles.mainCanvas}>
          {/* Left Column: Room Identity & Live Status */}
          <View style={styles.leftCol}>
            <View style={styles.roomHeader}>
              <View style={[styles.codePill, { backgroundColor: accentColor }]}>
                <Text style={styles.codeText}>{room.code}</Text>
              </View>
              <Text style={styles.roomName}>{room.name}</Text>
              <Text style={styles.roomSub}>
                {room.building} • Sức chứa: {room.capacity} chỗ ngồi
              </Text>
            </View>

            {/* Massive Status Title */}
            <View style={styles.statusDisplayBox}>
              <View style={[styles.pulseCircle, { backgroundColor: accentColor }]} />
              <View>
                <Text style={[styles.statusHugeText, { color: accentColor }]}>
                  {isAvailable
                    ? 'AVAILABLE / SẴN SÀNG'
                    : isEnding
                    ? 'ENDING SOON / SẮP HẾT'
                    : 'IN USE / ĐANG SỬ DỤNG'}
                </Text>
                <Text style={styles.statusSubDetail}>
                  {isAvailable
                    ? roomStatus.freeUntil
                      ? `Phòng đang trống đến ${roomStatus.freeUntil}`
                      : 'Trống cả ngày - Có thể đặt dùng ngay'
                    : `Thời gian còn lại: ${roomStatus.minutesLeft} phút`}
                </Text>
              </View>
            </View>

            {/* Active Meeting Info (If occupied) */}
            {roomStatus.currentBooking && (
              <View style={styles.meetingInfoCard}>
                <Text style={styles.meetingCardLabel}>PHIÊN ĐANG DIỄN RA</Text>
                <Text style={styles.meetingName}>
                  {roomStatus.currentBooking.purpose}
                </Text>
                <Text style={styles.meetingLeader}>
                  Người đặt: {roomStatus.currentBooking.bookedBy} ({roomStatus.currentBooking.userRole})
                </Text>
                <Text style={styles.meetingHours}>
                  Khung giờ: {roomStatus.currentBooking.startTime} - {roomStatus.currentBooking.endTime}
                </Text>

                <View style={styles.inUseActions}>
                  <TouchableOpacity
                    style={styles.extendKioskBtn}
                    onPress={handleExtend}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="add" size={16} color="#FFFFFF" />
                    <Text style={styles.extendKioskText}>Gia Hạn 15p</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.releaseKioskBtn}
                    onPress={handleEndEarly}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="exit" size={16} color="#FFFFFF" />
                    <Text style={styles.releaseKioskText}>Kết Thúc Sớm</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Available Quick Book Buttons (If free) */}
            {isAvailable && (
              <View style={styles.quickBookSection}>
                <Text style={styles.quickSectionTitle}>⚡ ĐẶT NHANH TỨC THÌ TẠI CỬA PHÒNG (ROBIN BOOK)</Text>
                <View style={styles.quickButtonsGrid}>
                  <TouchableOpacity
                    style={[styles.kioskQuickBtn, { backgroundColor: '#10B981' }]}
                    onPress={() => handleQuick(15)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="flash" size={18} color="#FFFFFF" />
                    <Text style={styles.kioskQuickBtnText}>Dùng 15 phút</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.kioskQuickBtn, { backgroundColor: '#059669' }]}
                    onPress={() => handleQuick(30)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="time" size={18} color="#FFFFFF" />
                    <Text style={styles.kioskQuickBtnText}>Dùng 30 phút</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.kioskQuickBtn, { backgroundColor: '#047857' }]}
                    onPress={() => handleQuick(60)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="hourglass" size={18} color="#FFFFFF" />
                    <Text style={styles.kioskQuickBtnText}>Dùng 1 tiếng</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Right Column: Large Clock & QR Scan */}
          <View style={styles.rightCol}>
            <View style={styles.clockCard}>
              <Text style={styles.clockTime}>{timeString}</Text>
              <Text style={styles.clockDate}>{dateString}</Text>
            </View>

            {/* QR Scan Station */}
            <View style={styles.qrStation}>
              <View style={styles.qrFrame}>
                <Ionicons name="qr-code" size={130} color="#0F172A" />
              </View>
              <Text style={styles.qrTitle}>QUÉT ĐỂ CHECK-IN HOẶC ĐẶT PHÒNG</Text>
              <Text style={styles.qrHint}>
                Mở app trên điện thoại của bạn và quét mã QR này để nhận phòng
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  kioskRoot: {
    flex: 1,
  },
  kioskTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  kioskBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  kioskBrandText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  roomSelector: {
    maxWidth: 320,
    marginHorizontal: 12,
  },
  roomTab: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 6,
  },
  roomTabActive: {
    backgroundColor: '#FFFFFF',
  },
  roomTabText: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '700',
  },
  roomTabTextActive: {
    color: '#0F172A',
  },
  exitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  exitText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  mainCanvas: {
    flex: 1,
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    padding: 24,
    gap: 24,
  },
  leftCol: {
    flex: 1.4,
    justifyContent: 'space-between',
  },
  roomHeader: {},
  codePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  codeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  roomName: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  roomSub: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  statusDisplayBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginVertical: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  pulseCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  statusHugeText: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  statusSubDetail: {
    fontSize: 13,
    color: '#E2E8F0',
    marginTop: 2,
  },
  meetingInfoCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  meetingCardLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 0.5,
  },
  meetingName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 4,
  },
  meetingLeader: {
    fontSize: 13,
    color: '#F87171',
    marginTop: 2,
  },
  meetingHours: {
    fontSize: 12,
    color: '#CBD5E1',
    marginTop: 2,
  },
  inUseActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  extendKioskBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(56, 189, 248, 0.3)',
    borderWidth: 1,
    borderColor: '#38BDF8',
    paddingVertical: 10,
    borderRadius: 10,
  },
  extendKioskText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  releaseKioskBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.4)',
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingVertical: 10,
    borderRadius: 10,
  },
  releaseKioskText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  quickBookSection: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  quickButtonsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  kioskQuickBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  kioskQuickBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  rightCol: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clockCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  clockTime: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
  },
  clockDate: {
    fontSize: 13,
    color: '#CBD5E1',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  qrStation: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  qrFrame: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  qrTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  qrHint: {
    fontSize: 11,
    color: '#CBD5E1',
    textAlign: 'center',
    marginTop: 4,
  },
});
