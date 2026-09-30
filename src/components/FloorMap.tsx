import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Room } from '../types';
import { useBooking } from '../context/BookingContext';

interface FloorMapProps {
  onSelectRoom: (room: Room) => void;
}

export const FloorMap: React.FC<FloorMapProps> = ({ onSelectRoom }) => {
  const { rooms, getRoomStatus } = useBooking();
  const [selectedFloor, setSelectedFloor] = useState<number>(4);
  const [activeRoomId, setActiveRoomId] = useState<string | null>('room-1');

  // Filter rooms for selected floor or building
  const floorRooms = rooms.filter((r) => r.floor === selectedFloor);
  const activeRoom = rooms.find((r) => r.id === activeRoomId) || floorRooms[0];

  return (
    <View style={styles.container}>
      {/* Floor Selector Tabs */}
      <View style={styles.floorTabsRow}>
        {[
          { floor: 4, name: 'Tầng 4 - Lab AI & Đồ Họa' },
          { floor: 3, name: 'Tầng 3 - Lab Mạng Cisco' },
          { floor: 2, name: 'Tầng 2 - Xưởng IoT & Pod' },
          { floor: 1, name: 'Tầng 1 - Hội Trường & Media' },
        ].map((item) => (
          <TouchableOpacity
            key={item.floor}
            style={[
              styles.floorTab,
              selectedFloor === item.floor && styles.floorTabActive,
            ]}
            onPress={() => {
              setSelectedFloor(item.floor);
              const firstInFloor = rooms.find((r) => r.floor === item.floor);
              if (firstInFloor) setActiveRoomId(firstInFloor.id);
            }}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.floorTabText,
                selectedFloor === item.floor && styles.floorTabTextActive,
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Map Canvas Visual Box */}
      <View style={styles.mapCanvas}>
        {/* Blueprint Grid Lines & Header */}
        <View style={styles.blueprintHeader}>
          <View style={styles.compassRow}>
            <Ionicons name="compass-outline" size={14} color="#64748B" />
            <Text style={styles.blueprintTitle}>
              SƠ ĐỒ MẶT BẰNG ROBIN - TẦNG {selectedFloor}
            </Text>
          </View>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.legendText}>Trống</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.legendText}>Đang dùng</Text>
            </View>
          </View>
        </View>

        {/* Corridor & Architectural zones */}
        <View style={styles.floorPlanArea}>
          {/* Main Corridor Hallway */}
          <View style={styles.hallway}>
            <Text style={styles.hallwayText}>◄ HÀNH LANG CHÍNH TẦNG {selectedFloor} ►</Text>
          </View>

          {/* Elevator & Stairs block */}
          <View style={styles.serviceCore}>
            <Ionicons name="swap-vertical" size={14} color="#64748B" />
            <Text style={styles.serviceText}>THANG MÁY & CẦU THANG</Text>
          </View>

          {/* Rooms on this floor */}
          {floorRooms.map((room, index) => {
            const status = getRoomStatus(room.id);
            const isAvail = status.status === 'available';
            const isEnding = status.status === 'ending_soon';
            const isSelected = activeRoomId === room.id;

            return (
              <TouchableOpacity
                key={room.id}
                style={[
                  styles.roomZone,
                  {
                    backgroundColor: isAvail
                      ? 'rgba(16, 185, 129, 0.15)'
                      : isEnding
                      ? 'rgba(245, 158, 11, 0.2)'
                      : 'rgba(239, 68, 68, 0.2)',
                    borderColor: isSelected
                      ? '#38BDF8'
                      : isAvail
                      ? '#10B981'
                      : isEnding
                      ? '#F59E0B'
                      : '#EF4444',
                    borderWidth: isSelected ? 2.5 : 1.5,
                  },
                ]}
                activeOpacity={0.8}
                onPress={() => setActiveRoomId(room.id)}
              >
                <View style={styles.roomZoneHeader}>
                  <Text style={styles.roomZoneCode}>{room.code}</Text>
                  <View
                    style={[
                      styles.zoneStatusDot,
                      {
                        backgroundColor: isAvail
                          ? '#10B981'
                          : isEnding
                          ? '#F59E0B'
                          : '#EF4444',
                      },
                    ]}
                  />
                </View>

                <Text style={styles.roomZoneName} numberOfLines={2}>
                  {room.name}
                </Text>

                <View style={styles.zoneFooter}>
                  <Text style={styles.zoneCapacity}>👥 {room.capacity} chỗ</Text>
                  <Text
                    style={[
                      styles.zoneStatusText,
                      {
                        color: isAvail
                          ? '#6EE7B7'
                          : isEnding
                          ? '#FCD34D'
                          : '#FCA5A5',
                      },
                    ]}
                  >
                    {isAvail
                      ? 'Sẵn sàng'
                      : isEnding
                      ? `Còn ${status.minutesLeft}p`
                      : 'Đang dùng'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Selected Room Quick Action Card */}
      {activeRoom && (
        <View style={styles.activeRoomCard}>
          <View style={styles.activeCardHeader}>
            <View>
              <View style={styles.activeCodeRow}>
                <Text style={styles.activeCode}>{activeRoom.code}</Text>
                <Text style={styles.activeType}>{activeRoom.typeLabel}</Text>
              </View>
              <Text style={styles.activeName}>{activeRoom.name}</Text>
              <Text style={styles.activeBuilding}>{activeRoom.building}</Text>
            </View>

            <TouchableOpacity
              style={styles.openDetailBtn}
              onPress={() => onSelectRoom(activeRoom)}
              activeOpacity={0.8}
            >
              <Text style={styles.openDetailText}>Chọn Phòng Này</Text>
              <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  floorTabsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  floorTab: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  floorTabActive: {
    backgroundColor: '#2563EB',
    borderColor: '#3B82F6',
  },
  floorTabText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  floorTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  mapCanvas: {
    backgroundColor: '#0A0F1D',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  blueprintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  compassRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  blueprintTitle: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  legendRow: {
    flexDirection: 'row',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    color: '#94A3B8',
    fontSize: 10,
  },
  floorPlanArea: {
    minHeight: 220,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 12,
    gap: 10,
  },
  hallway: {
    backgroundColor: '#1E293B',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#475569',
  },
  hallwayText: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '700',
    letterSpacing: 1,
  },
  serviceCore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    paddingVertical: 5,
    borderRadius: 6,
  },
  serviceText: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '700',
  },
  roomZone: {
    borderRadius: 12,
    padding: 12,
  },
  roomZoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomZoneCode: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  zoneStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  roomZoneName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 3,
  },
  zoneFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  zoneCapacity: {
    fontSize: 11,
    color: '#CBD5E1',
  },
  zoneStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  activeRoomCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  activeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeCode: {
    fontSize: 12,
    fontWeight: '800',
    color: '#38BDF8',
  },
  activeType: {
    fontSize: 11,
    color: '#94A3B8',
  },
  activeName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
  activeBuilding: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  openDetailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#0284C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  openDetailText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
