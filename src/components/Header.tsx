import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBooking } from '../context/BookingContext';

interface HeaderProps {
  onOpenKiosk?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenKiosk }) => {
  const { currentTime, bookings, rooms } = useBooking();

  const timeString = currentTime.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // Calculate live occupancy stats
  const activeBookingsCount = bookings.filter(
    (b) => b.status === 'active' || b.status === 'checked_in'
  ).length;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Ionicons name="hardware-chip-outline" size={20} color="#FFFFFF" />
          </View>
          <View>
            <View style={styles.brandTitleRow}>
              <Text style={styles.title}>EduSpace</Text>
              <Text style={styles.titleLive}>LIVE</Text>
            </View>
            <Text style={styles.subtitle}>Đặt Phòng Học & Lab Realtime</Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          {onOpenKiosk && (
            <TouchableOpacity
              style={styles.kioskButton}
              onPress={onOpenKiosk}
              activeOpacity={0.8}
            >
              <Ionicons name="tablet-landscape-outline" size={16} color="#0284C7" />
              <Text style={styles.kioskButtonText}>Kiosk Door</Text>
            </TouchableOpacity>
          )}

          <View style={styles.timeBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.timeText}>{timeString}</Text>
          </View>
        </View>
      </View>

      {/* Realtime Status Summary Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <View style={[styles.statusIndicator, { backgroundColor: '#10B981' }]} />
          <Text style={styles.statText}>
            Trống: <Text style={styles.statBold}>{Math.max(0, rooms.length - activeBookingsCount)}</Text>
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <View style={[styles.statusIndicator, { backgroundColor: '#EF4444' }]} />
          <Text style={styles.statText}>
            Đang Dùng: <Text style={styles.statBold}>{activeBookingsCount}</Text>
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <View style={[styles.statusIndicator, { backgroundColor: '#3B82F6' }]} />
          <Text style={styles.statText}>
            Tổng Phòng: <Text style={styles.statBold}>{rooms.length}</Text>
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A',
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.5,
  },
  titleLive: {
    fontSize: 11,
    fontWeight: '800',
    color: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  kioskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(2, 132, 199, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(2, 132, 199, 0.3)',
  },
  kioskButtonText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '600',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  timeText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  statBold: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
  divider: {
    width: 1,
    height: 14,
    backgroundColor: '#334155',
  },
});
