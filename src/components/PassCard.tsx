import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Booking } from '../types';
import { useBooking, timeToMinutes } from '../context/BookingContext';

interface PassCardProps {
  booking: Booking;
}

export const PassCard: React.FC<PassCardProps> = ({ booking }) => {
  const { checkIn, endBookingEarly, extendBooking, cancelBooking, currentTime } = useBooking();
  const [showQRModal, setShowQRModal] = useState<boolean>(false);

  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const startMinutes = timeToMinutes(booking.startTime);
  const endMinutes = timeToMinutes(booking.endTime);
  const isNow = currentMinutes >= startMinutes && currentMinutes < endMinutes;

  const handleCheckIn = () => {
    checkIn(booking.id);
    if (Platform.OS === 'web') alert(`Đã check-in thành công phòng ${booking.roomCode}!`);
    else Alert.alert('Check-in Thành Công', `Bạn đã nhận phòng ${booking.roomCode}.`);
  };

  const handleExtend = () => {
    const res = extendBooking(booking.id, 30);
    if (!res.success) {
      if (Platform.OS === 'web') alert(res.message);
      else Alert.alert('Không Thể Gia Hạn', res.message);
    } else {
      if (Platform.OS === 'web') alert(res.message);
      else Alert.alert('Gia Hạn Thành Công', res.message);
    }
  };

  const handleEndEarly = () => {
    const doEnd = () => {
      endBookingEarly(booking.id);
      if (Platform.OS === 'web') alert(`Đã trả phòng sớm ${booking.roomCode}. Cảm ơn bạn!`);
      else Alert.alert('Đã Trả Phòng Sớm', `Phòng ${booking.roomCode} đã được giải phóng.`);
    };

    if (Platform.OS === 'web') {
      if (confirm(`Bạn muốn trả phòng sớm tại ${booking.roomCode}?`)) doEnd();
    } else {
      Alert.alert(
        'Xác Nhận Trả Phòng Sớm',
        `Bạn có chắc chắn muốn trả phòng ${booking.roomCode} để giải phóng cho sinh viên khác?`,
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Trả Phòng Sớm', style: 'destructive', onPress: doEnd },
        ]
      );
    }
  };

  const handleCancel = () => {
    const doCancel = () => {
      cancelBooking(booking.id);
      if (Platform.OS === 'web') alert('Đã hủy lịch đặt phòng.');
      else Alert.alert('Đã Hủy', 'Lịch đặt phòng đã được hủy.');
    };

    if (Platform.OS === 'web') {
      if (confirm('Bạn có chắc muốn hủy lịch đặt này?')) doCancel();
    } else {
      Alert.alert(
        'Hủy Lịch Đặt',
        'Bạn có chắc chắn muốn hủy lịch đặt phòng này?',
        [
          { text: 'Không', style: 'cancel' },
          { text: 'Hủy Lịch', style: 'destructive', onPress: doCancel },
        ]
      );
    }
  };

  return (
    <View style={styles.cardWrapper}>
      {/* Top Pass Section */}
      <View style={styles.passTop}>
        <View style={styles.passHeader}>
          <View>
            <Text style={styles.passTypeTag}>THẺ VÀO PHÒNG HỌC / LAB</Text>
            <Text style={styles.roomCode}>{booking.roomCode}</Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              booking.status === 'checked_in' && styles.statusBadgeActive,
              booking.status === 'active' && styles.statusBadgePending,
              booking.status === 'upcoming' && styles.statusBadgeUpcoming,
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                booking.status === 'checked_in' && { color: '#6EE7B7' },
                booking.status === 'active' && { color: '#FCD34D' },
                booking.status === 'upcoming' && { color: '#93C5FD' },
              ]}
            >
              {booking.status === 'checked_in'
                ? 'ĐÃ CHECK-IN'
                : booking.status === 'active'
                ? 'CHỜ CHECK-IN'
                : 'SẮP TỚI'}
            </Text>
          </View>
        </View>

        <Text style={styles.roomName}>{booking.roomName}</Text>
        <Text style={styles.buildingText}>{booking.building}</Text>

        {/* Date & Time Row */}
        <View style={styles.scheduleRow}>
          <View style={styles.scheduleItem}>
            <Text style={styles.scheduleLabel}>NGÀY SỬ DỤNG</Text>
            <Text style={styles.scheduleValue}>{booking.date}</Text>
          </View>
          <View style={styles.scheduleItem}>
            <Text style={styles.scheduleLabel}>KHUNG GIỜ</Text>
            <Text style={styles.scheduleValue}>
              {booking.startTime} - {booking.endTime}
            </Text>
          </View>
          <View style={styles.scheduleItem}>
            <Text style={styles.scheduleLabel}>SỐ NGƯỜI</Text>
            <Text style={styles.scheduleValue}>{booking.participants} bạn</Text>
          </View>
        </View>

        <View style={styles.purposeBox}>
          <Text style={styles.purposeLabel}>Mục đích:</Text>
          <Text style={styles.purposeValue} numberOfLines={2}>
            {booking.purpose}
          </Text>
        </View>
      </View>

      {/* Perforated Divider Line with Cutout Notches (Apple Wallet Style) */}
      <View style={styles.dividerWrapper}>
        <View style={styles.leftNotch} />
        <View style={styles.perforatedLine} />
        <View style={styles.rightNotch} />
      </View>

      {/* Bottom Pass Section (QR & Actions) */}
      <View style={styles.passBottom}>
        <View style={styles.qrRow}>
          <TouchableOpacity
            style={styles.qrBox}
            onPress={() => setShowQRModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="qr-code" size={44} color="#0F172A" />
            <Text style={styles.qrTapHint}>Chạm phóng to</Text>
          </TouchableOpacity>

          <View style={styles.qrCodeDetails}>
            <Text style={styles.codeLabel}>MÃ VÉ CHECK-IN</Text>
            <Text style={styles.codeString}>{booking.checkInCode}</Text>
            <Text style={styles.codeSub}>Quét tại tablet ngoài cửa lab</Text>
          </View>
        </View>

        {/* Quick Action Buttons */}
        <View style={styles.actionsRow}>
          {booking.status !== 'checked_in' && (
            <TouchableOpacity
              style={styles.checkInBtn}
              onPress={handleCheckIn}
              activeOpacity={0.8}
            >
              <Ionicons name="scan-outline" size={15} color="#FFFFFF" />
              <Text style={styles.actionBtnText}>Check-in Ngay</Text>
            </TouchableOpacity>
          )}

          {isNow && (
            <TouchableOpacity
              style={styles.extendBtn}
              onPress={handleExtend}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle-outline" size={15} color="#38BDF8" />
              <Text style={styles.extendBtnText}>+30 Phút</Text>
            </TouchableOpacity>
          )}

          {isNow && (
            <TouchableOpacity
              style={styles.releaseBtn}
              onPress={handleEndEarly}
              activeOpacity={0.8}
            >
              <Ionicons name="exit-outline" size={15} color="#EF4444" />
              <Text style={styles.releaseBtnText}>Trả Phòng Sớm</Text>
            </TouchableOpacity>
          )}

          {!isNow && booking.status !== 'completed' && (
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={handleCancel}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelBtnText}>Hủy Vé</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Big QR Code Modal */}
      <Modal visible={showQRModal} transparent animationType="fade">
        <View style={styles.qrModalOverlay}>
          <View style={styles.qrModalContent}>
            <Text style={styles.qrModalTitle}>MÃ QR VÀO PHÒNG</Text>
            <Text style={styles.qrModalRoom}>{booking.roomCode} - {booking.roomName}</Text>
            <View style={styles.largeQRPlaceholder}>
              <Ionicons name="qr-code" size={160} color="#0F172A" />
            </View>
            <Text style={styles.qrModalCode}>{booking.checkInCode}</Text>
            <Text style={styles.qrModalHint}>Đưa mã này trước camera của kiosk cửa phòng</Text>

            <TouchableOpacity
              style={styles.closeQRBtn}
              onPress={() => setShowQRModal(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.closeQRText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  passTop: {
    padding: 16,
    backgroundColor: '#1E293B',
  },
  passHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  passTypeTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  roomCode: {
    fontSize: 22,
    fontWeight: '900',
    color: '#38BDF8',
    letterSpacing: -0.5,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusBadgeActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10B981',
  },
  statusBadgePending: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: '#F59E0B',
  },
  statusBadgeUpcoming: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: '#3B82F6',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  roomName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 2,
  },
  buildingText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  scheduleItem: {},
  scheduleLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 2,
  },
  scheduleValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#E2E8F0',
  },
  purposeBox: {
    marginTop: 10,
  },
  purposeLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  purposeValue: {
    fontSize: 12,
    color: '#CBD5E1',
    marginTop: 2,
  },
  dividerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 24,
    backgroundColor: '#1E293B',
    position: 'relative',
  },
  leftNotch: {
    width: 16,
    height: 24,
    backgroundColor: '#0F172A',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  perforatedLine: {
    flex: 1,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#334155',
  },
  rightNotch: {
    width: 16,
    height: 24,
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  passBottom: {
    padding: 16,
    backgroundColor: '#1E293B',
  },
  qrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 14,
  },
  qrBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrTapHint: {
    fontSize: 8,
    color: '#475569',
    fontWeight: '700',
    marginTop: 2,
  },
  qrCodeDetails: {
    flex: 1,
  },
  codeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  codeString: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  codeSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  checkInBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#10B981',
    paddingVertical: 10,
    borderRadius: 10,
  },
  extendBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: '#38BDF8',
    paddingVertical: 10,
    borderRadius: 10,
  },
  extendBtnText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
  },
  releaseBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingVertical: 10,
    borderRadius: 10,
  },
  releaseBtnText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  qrModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  qrModalContent: {
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: '#334155',
  },
  qrModalTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  qrModalRoom: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 4,
    marginBottom: 16,
  },
  largeQRPlaceholder: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrModalCode: {
    fontSize: 20,
    fontWeight: '900',
    color: '#38BDF8',
    letterSpacing: 2,
    marginTop: 16,
  },
  qrModalHint: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  closeQRBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 12,
  },
  closeQRText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
