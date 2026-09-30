import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Room } from '../types';
import { useBooking } from '../context/BookingContext';

interface RoomCardProps {
  room: Room;
  onOpenBookingModal: (room: Room) => void;
  onOpenKioskRoom: (room: Room) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({
  room,
  onOpenBookingModal,
  onOpenKioskRoom,
}) => {
  const { getRoomStatus, quickBook } = useBooking();
  const roomStatus = getRoomStatus(room.id);

  const isAvailable = roomStatus.status === 'available';
  const isEndingSoon = roomStatus.status === 'ending_soon';
  const isOccupied = roomStatus.status === 'occupied';

  const handleQuickBook = () => {
    const res = quickBook(room.id, 30);
    if (!res.success) {
      if (Platform.OS === 'web') {
        alert(res.error || 'Không thể đặt nhanh lúc này');
      } else {
        Alert.alert('Không thể đặt nhanh', res.error);
      }
    } else {
      if (Platform.OS === 'web') {
        alert(`⚡ Đã đặt nhanh thành công 30 phút tại ${room.name}!`);
      } else {
        Alert.alert('⚡ Đặt Nhanh Thành Công', `Bạn có 30 phút sử dụng phòng ${room.name} bắt đầu từ bây giờ.`);
      }
    }
  };

  return (
    <View style={styles.cardContainer}>
      {/* Room Image with Realtime Status Badge */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: room.imageUrl }} style={styles.image} resizeMode="cover" />
        <LinearGradient
          colors={['rgba(15, 23, 42, 0.2)', 'rgba(15, 23, 42, 0.95)']}
          style={styles.gradient}
        />

        {/* Top Badges */}
        <View style={styles.topBadgesRow}>
          <View style={styles.codeBadge}>
            <Text style={styles.codeText}>{room.code}</Text>
          </View>

          {/* Realtime Status Badge */}
          <View
            style={[
              styles.statusBadge,
              isAvailable && styles.statusBadgeAvailable,
              isEndingSoon && styles.statusBadgeEnding,
              isOccupied && styles.statusBadgeOccupied,
            ]}
          >
            <View
              style={[
                styles.statusDot,
                isAvailable && { backgroundColor: '#10B981' },
                isEndingSoon && { backgroundColor: '#F59E0B' },
                isOccupied && { backgroundColor: '#EF4444' },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                isAvailable && { color: '#6EE7B7' },
                isEndingSoon && { color: '#FCD34D' },
                isOccupied && { color: '#FCA5A5' },
              ]}
            >
              {isAvailable
                ? roomStatus.freeUntil
                  ? `TRỐNG ĐẾN ${roomStatus.freeUntil}`
                  : 'SẴN SÀNG CẢ NGÀY'
                : isEndingSoon
                ? `CÒN ${roomStatus.minutesLeft} PHÚT`
                : `ĐANG DÙNG (CÒN ${roomStatus.minutesLeft}P)`}
            </Text>
          </View>
        </View>

        {/* Room Info on bottom of image */}
        <View style={styles.imageBottomContent}>
          <Text style={styles.roomType}>{room.typeLabel}</Text>
          <Text style={styles.roomName}>{room.name}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="business-outline" size={13} color="#94A3B8" />
              <Text style={styles.metaText}>{room.building} - Tầng {room.floor}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={13} color="#94A3B8" />
              <Text style={styles.metaText}>{room.capacity} chỗ</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Card Body */}
      <View style={styles.cardBody}>
        {/* If occupied, show who is currently using it */}
        {roomStatus.currentBooking && (
          <View style={styles.currentOccupantBox}>
            <View style={styles.occupantHeader}>
              <Ionicons name="person-circle-outline" size={16} color="#F87171" />
              <Text style={styles.occupantLabel}>Phiên hiện tại ({roomStatus.currentBooking.startTime} - {roomStatus.currentBooking.endTime}):</Text>
            </View>
            <Text style={styles.occupantName} numberOfLines={1}>
              {roomStatus.currentBooking.bookedBy}
            </Text>
            <Text style={styles.occupantPurpose} numberOfLines={1}>
              Mục đích: {roomStatus.currentBooking.purpose}
            </Text>
          </View>
        )}

        {/* Amenities Chips */}
        <View style={styles.amenitiesRow}>
          {room.amenities.map((item) => (
            <View key={item.id} style={styles.amenityChip}>
              <Ionicons name="sparkles" size={10} color="#38BDF8" />
              <Text style={styles.amenityText}>{item.name}</Text>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          {isAvailable && (
            <TouchableOpacity
              style={styles.quickBookBtn}
              onPress={handleQuickBook}
              activeOpacity={0.8}
            >
              <Ionicons name="flash" size={15} color="#FFFFFF" />
              <Text style={styles.quickBookText}>Đặt Nhanh 30p</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.scheduleBtn, isAvailable ? { flex: 1 } : { flex: 2 }]}
            onPress={() => onOpenBookingModal(room)}
            activeOpacity={0.8}
          >
            <Ionicons name="calendar-outline" size={15} color="#FFFFFF" />
            <Text style={styles.scheduleBtnText}>Lịch Chi Tiết</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.kioskBtn}
            onPress={() => onOpenKioskRoom(room)}
            activeOpacity={0.8}
          >
            <Ionicons name="tablet-landscape-outline" size={16} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  imageContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    ...StyleSheet.absoluteFill,
  },
  topBadgesRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  codeText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusBadgeAvailable: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: 'rgba(16, 185, 129, 0.5)',
  },
  statusBadgeEnding: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: 'rgba(245, 158, 11, 0.5)',
  },
  statusBadgeOccupied: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  imageBottomContent: {
    position: 'absolute',
    bottom: 12,
    left: 14,
    right: 14,
  },
  roomType: {
    fontSize: 11,
    color: '#38BDF8',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  roomName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
    letterSpacing: -0.3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#CBD5E1',
  },
  cardBody: {
    padding: 14,
  },
  currentOccupantBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  occupantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  occupantLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FCA5A5',
  },
  occupantName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FEE2E2',
  },
  occupantPurpose: {
    fontSize: 11,
    color: '#F87171',
    marginTop: 2,
  },
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  amenityText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quickBookBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#10B981',
    paddingVertical: 10,
    borderRadius: 12,
  },
  quickBookText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  scheduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: 12,
  },
  scheduleBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  kioskBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
