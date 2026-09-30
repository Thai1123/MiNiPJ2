import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Room, Booking } from '../types';
import { useBooking, timeToMinutes } from '../context/BookingContext';
import { TIME_SLOTS, getTodayString } from '../data/mockData';

interface TimeSlotGridProps {
  onOpenBookingModal: (room: Room, date: string, startTime: string, endTime: string) => void;
}

export const TimeSlotGrid: React.FC<TimeSlotGridProps> = ({ onOpenBookingModal }) => {
  const { rooms, bookings, selectedDate, setSelectedDate } = useBooking();
  const [selectedRoomId, setSelectedRoomId] = useState<string>(rooms[0]?.id || 'room-1');
  const [selectedStartSlot, setSelectedStartSlot] = useState<string | null>(null);

  // 7 Days list for LibCal strip
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const weekday = i === 0 ? 'Hôm nay' : i === 1 ? 'Ngày mai' : `Thứ ${d.getDay() + 1 === 1 ? 'CN' : d.getDay() + 1}`;
    const dayMonth = `${d.getDate()}/${d.getMonth() + 1}`;
    return { dateStr, weekday, dayMonth };
  });

  const currentRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0];

  // Bookings for current room and date
  const roomBookings = bookings.filter(
    (b) => b.roomId === selectedRoomId && b.date === selectedDate && b.status !== 'cancelled'
  );

  // Check if a single 1-hour slot is occupied
  const getSlotOccupant = (slot: string): Booking | undefined => {
    const slotStartM = timeToMinutes(slot);
    const slotEndM = slotStartM + 60;

    return roomBookings.find((b) => {
      const bStartM = timeToMinutes(b.startTime);
      const bEndM = timeToMinutes(b.endTime);
      return slotStartM < bEndM && slotEndM > bStartM;
    });
  };

  const handleSlotPress = (slot: string) => {
    const occupant = getSlotOccupant(slot);
    if (occupant) {
      // Slot is taken
      return;
    }

    if (!selectedStartSlot) {
      setSelectedStartSlot(slot);
    } else if (selectedStartSlot === slot) {
      // Toggle off
      setSelectedStartSlot(null);
    } else {
      // Determine start and end
      const s1 = timeToMinutes(selectedStartSlot);
      const s2 = timeToMinutes(slot);
      const startM = Math.min(s1, s2);
      const endM = Math.max(s1, s2) + 60; // Include full hour of end slot

      const startTime = `${String(Math.floor(startM / 60)).padStart(2, '0')}:00`;
      const endTime = `${String(Math.floor(endM / 60)).padStart(2, '0')}:00`;

      // Check if there is any booking in between
      const hasConflict = roomBookings.some((b) => {
        const bStartM = timeToMinutes(b.startTime);
        const bEndM = timeToMinutes(b.endTime);
        return startM < bEndM && endM > bStartM;
      });

      if (hasConflict) {
        setSelectedStartSlot(slot); // reset to single slot
        return;
      }

      // Open booking modal
      onOpenBookingModal(currentRoom, selectedDate, startTime, endTime);
      setSelectedStartSlot(null);
    }
  };

  return (
    <View style={styles.container}>
      {/* LibCal Header Note */}
      <View style={styles.libCalBanner}>
        <Ionicons name="calendar" size={16} color="#38BDF8" />
        <Text style={styles.libCalTitle}>MA TRẬN LỊCH ĐẶT THEO GIỜ (LIBCAL GRID)</Text>
      </View>

      {/* Date Picker Strip */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dateStrip}
      >
        {dates.map((d) => {
          const isSelected = d.dateStr === selectedDate;
          return (
            <TouchableOpacity
              key={d.dateStr}
              style={[styles.dateCard, isSelected && styles.dateCardSelected]}
              onPress={() => {
                setSelectedDate(d.dateStr);
                setSelectedStartSlot(null);
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.dateWeekday, isSelected && styles.dateWeekdaySelected]}>
                {d.weekday}
              </Text>
              <Text style={[styles.dateDayMonth, isSelected && styles.dateDayMonthSelected]}>
                {d.dayMonth}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Room Horizontal Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.roomPills}
      >
        {rooms.map((room) => {
          const isSelected = room.id === selectedRoomId;
          return (
            <TouchableOpacity
              key={room.id}
              style={[styles.roomPill, isSelected && styles.roomPillSelected]}
              onPress={() => {
                setSelectedRoomId(room.id);
                setSelectedStartSlot(null);
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.roomPillCode, isSelected && styles.roomPillCodeSelected]}>
                {room.code}
              </Text>
              <Text
                style={[styles.roomPillName, isSelected && styles.roomPillNameSelected]}
                numberOfLines={1}
              >
                {room.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Time Slot Timeline Grid */}
      <View style={styles.gridContainer}>
        <View style={styles.gridHeader}>
          <Text style={styles.gridHeaderRoom}>
            Lịch ngày: <Text style={{ color: '#38BDF8' }}>{selectedDate}</Text> • {currentRoom.name}
          </Text>
          <Text style={styles.gridHeaderHint}>Chạm slot để chọn khung giờ</Text>
        </View>

        <View style={styles.slotsWrapper}>
          {TIME_SLOTS.map((slot) => {
            const occupant = getSlotOccupant(slot);
            const isTaken = !!occupant;
            const isSelected = selectedStartSlot === slot;

            return (
              <TouchableOpacity
                key={slot}
                style={[
                  styles.slotRow,
                  isTaken ? styles.slotRowTaken : styles.slotRowFree,
                  isSelected && styles.slotRowSelected,
                ]}
                onPress={() => handleSlotPress(slot)}
                activeOpacity={isTaken ? 1 : 0.7}
              >
                <View style={styles.slotTimeCol}>
                  <Text
                    style={[
                      styles.slotTimeText,
                      isSelected && { color: '#FFFFFF' },
                      isTaken && { color: '#F87171' },
                    ]}
                  >
                    {slot}
                  </Text>
                  <Text style={styles.slotDuration}>1h</Text>
                </View>

                <View style={styles.slotStatusCol}>
                  {isTaken ? (
                    <View style={styles.takenInfo}>
                      <View style={styles.takenHeader}>
                        <View style={styles.takenDot} />
                        <Text style={styles.takenName} numberOfLines={1}>
                          {occupant.bookedBy}
                        </Text>
                      </View>
                      <Text style={styles.takenPurpose} numberOfLines={1}>
                        {occupant.purpose} ({occupant.startTime} - {occupant.endTime})
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.freeInfo}>
                      <Text
                        style={[
                          styles.freeText,
                          isSelected && { color: '#FFFFFF', fontWeight: '800' },
                        ]}
                      >
                        {isSelected ? '✓ Đang chọn slot này (Chạm tiếp slot kết thúc)' : 'Trống - Sẵn sàng đặt'}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.slotActionCol}>
                  {isTaken ? (
                    <Ionicons name="lock-closed" size={16} color="#EF4444" />
                  ) : isSelected ? (
                    <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                  ) : (
                    <Ionicons name="add-circle-outline" size={18} color="#10B981" />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedStartSlot && (
          <TouchableOpacity
            style={styles.bookOneSlotBtn}
            onPress={() => {
              const startM = timeToMinutes(selectedStartSlot);
              const endM = startM + 60;
              const endTime = `${String(Math.floor(endM / 60)).padStart(2, '0')}:00`;
              onOpenBookingModal(currentRoom, selectedDate, selectedStartSlot, endTime);
              setSelectedStartSlot(null);
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="flash" size={16} color="#FFFFFF" />
            <Text style={styles.bookOneSlotText}>
              Đặt Khung Giờ {selectedStartSlot} - +1 Giờ Ngay
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  libCalBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  libCalTitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dateStrip: {
    gap: 8,
    paddingBottom: 10,
  },
  dateCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    minWidth: 84,
  },
  dateCardSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#3B82F6',
  },
  dateWeekday: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  dateWeekdaySelected: {
    color: '#BFDBFE',
  },
  dateDayMonth: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F8FAFC',
    marginTop: 2,
  },
  dateDayMonthSelected: {
    color: '#FFFFFF',
  },
  roomPills: {
    gap: 8,
    paddingBottom: 12,
  },
  roomPill: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    maxWidth: 160,
  },
  roomPillSelected: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: '#38BDF8',
  },
  roomPillCode: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
  },
  roomPillCodeSelected: {
    color: '#38BDF8',
  },
  roomPillName: {
    fontSize: 12,
    color: '#CBD5E1',
    fontWeight: '600',
    marginTop: 1,
  },
  roomPillNameSelected: {
    color: '#FFFFFF',
  },
  gridContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  gridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  gridHeaderRoom: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  gridHeaderHint: {
    color: '#94A3B8',
    fontSize: 11,
  },
  slotsWrapper: {
    gap: 6,
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  slotRowFree: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  slotRowTaken: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  slotRowSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#60A5FA',
  },
  slotTimeCol: {
    width: 60,
  },
  slotTimeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#E2E8F0',
  },
  slotDuration: {
    fontSize: 10,
    color: '#64748B',
  },
  slotStatusCol: {
    flex: 1,
    paddingHorizontal: 8,
  },
  freeInfo: {},
  freeText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  takenInfo: {},
  takenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  takenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  takenName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FCA5A5',
  },
  takenPurpose: {
    fontSize: 11,
    color: '#F87171',
    marginTop: 1,
  },
  slotActionCol: {
    width: 24,
    alignItems: 'center',
  },
  bookOneSlotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  bookOneSlotText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
