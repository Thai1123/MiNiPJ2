import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Room } from '../types';
import { useBooking } from '../context/BookingContext';

interface RoomDetailScreenProps {
  room: Room;
  onBack: () => void;
  onBook: (room: Room) => void;
}

export const RoomDetailScreen: React.FC<RoomDetailScreenProps> = ({
  room,
  onBack,
  onBook,
}) => {
  const { getRoomStatus } = useBooking();
  const roomStatus = getRoomStatus(room.id);
  const isAvailable = roomStatus.status === 'available';
  const isEndingSoon = roomStatus.status === 'ending_soon';
  const isOccupied = roomStatus.status === 'occupied';

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi Tiết Phòng</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Large Image */}
        <Image
          source={{ uri: room.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Room Info */}
        <View style={styles.infoContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.roomName}>{room.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: room.color + '20' }]}>
              <Text style={[styles.statusText, { color: room.color }]}>
                {room.typeLabel}
              </Text>
            </View>
          </View>
          
          <Text style={styles.roomCode}>{room.code}</Text>

          {/* Current Status */}
          <View style={[
            styles.currentStatusBox,
            isAvailable && styles.statusBoxAvailable,
            isEndingSoon && styles.statusBoxEnding,
            isOccupied && styles.statusBoxOccupied
          ]}>
            <View style={styles.statusHeaderRow}>
              <View style={[
                styles.statusDot,
                isAvailable && { backgroundColor: '#10B981' },
                isEndingSoon && { backgroundColor: '#F59E0B' },
                isOccupied && { backgroundColor: '#EF4444' }
              ]} />
              <Text style={[
                styles.currentStatusText,
                isAvailable && { color: '#6EE7B7' },
                isEndingSoon && { color: '#FCD34D' },
                isOccupied && { color: '#FCA5A5' }
              ]}>
                {isAvailable ? 'Sẵn sàng sử dụng' : isEndingSoon ? 'Sắp hết giờ sử dụng' : 'Đang có người dùng'}
              </Text>
            </View>
            <Text style={styles.statusSubText}>
              {isAvailable
                ? (roomStatus.freeUntil ? `Trống đến ${roomStatus.freeUntil}` : 'Trống cả ngày')
                : `Còn lại ${roomStatus.minutesLeft} phút`}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="business-outline" size={16} color="#94A3B8" />
              <Text style={styles.metaText}>{room.building}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="layers-outline" size={16} color="#94A3B8" />
              <Text style={styles.metaText}>Tầng {room.floor}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={16} color="#94A3B8" />
              <Text style={styles.metaText}>{room.capacity} chỗ</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Mô tả</Text>
          <Text style={styles.description}>{room.description}</Text>

          <Text style={styles.sectionTitle}>Trang bị (Equipment)</Text>
          <View style={styles.amenitiesContainer}>
            {room.amenities.map((amenity) => (
              <View key={amenity.id} style={styles.amenityItem}>
                <Ionicons name={amenity.icon as any} size={18} color="#38BDF8" />
                <Text style={styles.amenityText}>{amenity.name}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => onBook(room)}
          activeOpacity={0.8}
        >
          <Text style={styles.bookButtonText}>Đặt phòng</Text>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  image: {
    width: '100%',
    height: 240,
  },
  infoContainer: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  roomName: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  roomCode: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  currentStatusBox: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
  },
  statusBoxAvailable: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  statusBoxEnding: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  statusBoxOccupied: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  statusHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  currentStatusText: {
    fontSize: 15,
    fontWeight: '700',
  },
  statusSubText: {
    color: '#F8FAFC',
    fontSize: 13,
    marginLeft: 16,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '500',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 12,
  },
  description: {
    color: '#94A3B8',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 24,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  amenityText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '500',
  },
  bottomBar: {
    padding: 16,
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  bookButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
