import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BookingProvider, useBooking } from './src/context/BookingContext';
import { Header } from './src/components/Header';
import { LiveBanner } from './src/components/LiveBanner';
import { RoomCard } from './src/components/RoomCard';
import { FloorMap } from './src/components/FloorMap';
import { TimeSlotGrid } from './src/components/TimeSlotGrid';
import { BookingModal } from './src/components/BookingModal';
import { PassCard } from './src/components/PassCard';
import { KioskDisplay } from './src/components/KioskDisplay';
import { Room } from './src/types';

type TabType = 'rooms' | 'schedule' | 'passes';
type ViewMode = 'list' | 'map';

const MainScreen: React.FC = () => {
  const { rooms, bookings } = useBooking();

  // Navigation State
  const [activeTab, setActiveTab] = useState<TabType>('rooms');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Modals
  const [bookingModalVisible, setBookingModalVisible] = useState<boolean>(false);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Room | null>(null);
  const [modalDate, setModalDate] = useState<string | undefined>(undefined);
  const [modalStartTime, setModalStartTime] = useState<string | undefined>(undefined);
  const [modalEndTime, setModalEndTime] = useState<string | undefined>(undefined);

  // Kiosk Modal
  const [kioskVisible, setKioskVisible] = useState<boolean>(false);
  const [kioskRoom, setKioskRoom] = useState<Room | null>(null);

  // Open booking modal
  const handleOpenBooking = (
    room: Room,
    date?: string,
    startTime?: string,
    endTime?: string
  ) => {
    setSelectedRoomForBooking(room);
    setModalDate(date);
    setModalStartTime(startTime);
    setModalEndTime(endTime);
    setBookingModalVisible(true);
  };

  const handleOpenKiosk = (room?: Room) => {
    setKioskRoom(room || null);
    setKioskVisible(true);
  };

  // Filter rooms
  const filteredRooms = rooms.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.building.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedFilter === 'computer') return r.type === 'computer_lab';
    if (selectedFilter === 'science') return r.type === 'science_lab';
    if (selectedFilter === 'seminar') return r.type === 'seminar';
    if (selectedFilter === 'pod') return r.type === 'study_pod' || r.type === 'media_studio';

    return true;
  });

  // Filter My Bookings
  const myBookings = bookings.filter((b) => b.bookedBy.includes('Văn Quyền'));

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* App Header with Live Ticker */}
      <Header onOpenKiosk={() => handleOpenKiosk()} />

      {/* Live Activity Floating Banner */}
      <LiveBanner onPressBooking={() => setActiveTab('passes')} />

      {/* Main Content Area */}
      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={styles.mainScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* TAB 1: ROBIN ROOMS & FLOOR MAP */}
        {activeTab === 'rooms' && (
          <View>
            {/* View Switcher: List vs Floor Map */}
            <View style={styles.viewSwitcherRow}>
              <View style={styles.segmentedControl}>
                <TouchableOpacity
                  style={[styles.segmentBtn, viewMode === 'list' && styles.segmentBtnActive]}
                  onPress={() => setViewMode('list')}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="grid-outline"
                    size={14}
                    color={viewMode === 'list' ? '#FFFFFF' : '#94A3B8'}
                  />
                  <Text
                    style={[
                      styles.segmentText,
                      viewMode === 'list' && styles.segmentTextActive,
                    ]}
                  >
                    Danh Sách Thẻ
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.segmentBtn, viewMode === 'map' && styles.segmentBtnActive]}
                  onPress={() => setViewMode('map')}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="map-outline"
                    size={14}
                    color={viewMode === 'map' ? '#FFFFFF' : '#94A3B8'}
                  />
                  <Text
                    style={[
                      styles.segmentText,
                      viewMode === 'map' && styles.segmentTextActive,
                    ]}
                  >
                    Sơ Đồ Mặt Bằng (Robin)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* If Floor Map View */}
            {viewMode === 'map' ? (
              <FloorMap onSelectRoom={(room) => handleOpenBooking(room)} />
            ) : (
              /* If List View: Search, Filter pills, and Room Cards */
              <View>
                {/* Search Bar */}
                <View style={styles.searchBar}>
                  <Ionicons name="search-outline" size={18} color="#94A3B8" />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm phòng theo tên, mã (LAB-401), tòa nhà..."
                    placeholderTextColor="#64748B"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                      <Ionicons name="close-circle" size={16} color="#94A3B8" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Filter Pills */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.filterPills}
                >
                  {[
                    { key: 'all', label: 'Tất cả phòng' },
                    { key: 'computer', label: '💻 Lab Máy Tính / AI' },
                    { key: 'science', label: '🤖 Lab Robotics & IoT' },
                    { key: 'seminar', label: '🎤 Hội Trường' },
                    { key: 'pod', label: '🎙️ Media Studio & Pod' },
                  ].map((f) => (
                    <TouchableOpacity
                      key={f.key}
                      style={[
                        styles.filterChip,
                        selectedFilter === f.key && styles.filterChipActive,
                      ]}
                      onPress={() => setSelectedFilter(f.key)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          selectedFilter === f.key && styles.filterChipTextActive,
                        ]}
                      >
                        {f.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Room Cards List */}
                {filteredRooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    onOpenBookingModal={(r) => handleOpenBooking(r)}
                    onOpenKioskRoom={(r) => handleOpenKiosk(r)}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* TAB 2: LIBCAL SCHEDULE GRID */}
        {activeTab === 'schedule' && (
          <TimeSlotGrid
            onOpenBookingModal={(r, date, start, end) =>
              handleOpenBooking(r, date, start, end)
            }
          />
        )}

        {/* TAB 3: MY PASSES & QR CHECK-IN */}
        {activeTab === 'passes' && (
          <View>
            <View style={styles.passesHeader}>
              <Text style={styles.passesTitle}>VÉ ĐẶT PHÒNG CỦA BẠN</Text>
              <Text style={styles.passesSubtitle}>
                Tổng cộng {myBookings.length} lịch đặt (Đưa mã QR trước cửa để check-in)
              </Text>
            </View>

            {myBookings.length === 0 ? (
              <View style={styles.emptyPasses}>
                <Ionicons name="ticket-outline" size={48} color="#475569" />
                <Text style={styles.emptyTitle}>Chưa có vé đặt nào</Text>
                <Text style={styles.emptyDesc}>
                  Hãy chọn một phòng Lab ở tab "Phòng Lab" hoặc chọn giờ ở tab "Lịch Đặt" để tạo vé ngay!
                </Text>
                <TouchableOpacity
                  style={styles.exploreBtn}
                  onPress={() => setActiveTab('rooms')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.exploreBtnText}>Khám Phá Phòng Lab</Text>
                </TouchableOpacity>
              </View>
            ) : (
              myBookings.map((booking) => (
                <PassCard key={booking.id} booking={booking} />
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Bottom iOS Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('rooms')}
          activeOpacity={0.8}
        >
          <Ionicons
            name={activeTab === 'rooms' ? 'business' : 'business-outline'}
            size={22}
            color={activeTab === 'rooms' ? '#38BDF8' : '#94A3B8'}
          />
          <Text
            style={[
              styles.navText,
              activeTab === 'rooms' && styles.navTextActive,
            ]}
          >
            Phòng Lab
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('schedule')}
          activeOpacity={0.8}
        >
          <Ionicons
            name={activeTab === 'schedule' ? 'calendar' : 'calendar-outline'}
            size={22}
            color={activeTab === 'schedule' ? '#38BDF8' : '#94A3B8'}
          />
          <Text
            style={[
              styles.navText,
              activeTab === 'schedule' && styles.navTextActive,
            ]}
          >
            Lịch Giờ
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('passes')}
          activeOpacity={0.8}
        >
          <View style={styles.passBadgeContainer}>
            <Ionicons
              name={activeTab === 'passes' ? 'ticket' : 'ticket-outline'}
              size={22}
              color={activeTab === 'passes' ? '#38BDF8' : '#94A3B8'}
            />
            {myBookings.length > 0 && (
              <View style={styles.navBadge}>
                <Text style={styles.navBadgeText}>{myBookings.length}</Text>
              </View>
            )}
          </View>
          <Text
            style={[
              styles.navText,
              activeTab === 'passes' && styles.navTextActive,
            ]}
          >
            Vé Của Tôi
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleOpenKiosk()}
          activeOpacity={0.8}
        >
          <Ionicons
            name="tablet-landscape-outline"
            size={22}
            color="#A855F7"
          />
          <Text style={[styles.navText, { color: '#C084FC' }]}>
            Kiosk Cửa
          </Text>
        </TouchableOpacity>
      </View>

      {/* Booking Form Modal */}
      <BookingModal
        visible={bookingModalVisible}
        room={selectedRoomForBooking}
        initialDate={modalDate}
        initialStartTime={modalStartTime}
        initialEndTime={modalEndTime}
        onClose={() => setBookingModalVisible(false)}
        onSuccess={() => setActiveTab('passes')}
      />

      {/* Robin Door Kiosk Modal */}
      <KioskDisplay
        visible={kioskVisible}
        initialRoom={kioskRoom}
        onClose={() => setKioskVisible(false)}
      />
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <BookingProvider>
        <MainScreen />
      </BookingProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0B1120',
  },
  mainScroll: {
    flex: 1,
  },
  mainScrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  viewSwitcherRow: {
    marginBottom: 14,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
  },
  segmentBtnActive: {
    backgroundColor: '#2563EB',
  },
  segmentText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
  },
  filterPills: {
    gap: 8,
    paddingBottom: 14,
  },
  filterChip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterChipActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: '#38BDF8',
  },
  filterChipText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#38BDF8',
    fontWeight: '700',
  },
  passesHeader: {
    marginBottom: 14,
  },
  passesTitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  passesSubtitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  emptyPasses: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    marginTop: 10,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 12,
  },
  emptyDesc: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 18,
  },
  exploreBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
  },
  navText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
  },
  navTextActive: {
    color: '#38BDF8',
    fontWeight: '700',
  },
  passBadgeContainer: {
    position: 'relative',
  },
  navBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#EF4444',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
});
