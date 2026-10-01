import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { ZustandBooking } from '../store/useBookingStore';

interface BookingQRModalProps {
  visible: boolean;
  booking: ZustandBooking | null;
  onClose: () => void;
}

export const BookingQRModal: React.FC<BookingQRModalProps> = ({ visible, booking, onClose }) => {
  if (!booking) return null;

  const qrData = JSON.stringify({
    bookingId: booking.id,
    roomId: booking.roomId,
    roomName: booking.roomName,
    date: booking.date,
    startTime: booking.startTime,
    endTime: booking.endTime,
    userId: booking.userId,
  });

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.8}>
            <Ionicons name="close" size={24} color="#94A3B8" />
          </TouchableOpacity>

          <Text style={styles.modalTitle}>Mã QR Check-in</Text>
          <Text style={styles.modalSubtitle}>Quét mã này tại cửa phòng để nhận phòng</Text>

          <View style={styles.qrContainer}>
            <QRCode
              value={qrData}
              size={200}
              color="#0F172A"
              backgroundColor="#FFFFFF"
            />
          </View>

          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mã vé:</Text>
              <Text style={styles.infoValue}>{booking.id.toUpperCase()}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Người đặt:</Text>
              <Text style={styles.infoValue}>Văn Thái</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phòng:</Text>
              <Text style={styles.infoValue}>{booking.roomName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ngày:</Text>
              <Text style={styles.infoValue}>{booking.date}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Thời gian:</Text>
              <Text style={styles.infoValue}>{booking.startTime} - {booking.endTime}</Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 17, 32, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#334155',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 4,
  },
  modalSubtitle: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  qrContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 24,
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
});
