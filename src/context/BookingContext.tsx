import React, { createContext, useContext, useState, useEffect } from 'react';
import { Room, Booking, RoomStatus } from '../types';
import { INITIAL_ROOMS, INITIAL_BOOKINGS, getTodayString } from '../data/mockData';

interface RoomRealtimeState {
  status: RoomStatus;
  currentBooking?: Booking;
  nextBooking?: Booking;
  minutesLeft?: number;
  freeUntil?: string;
}

interface BookingContextType {
  rooms: Room[];
  bookings: Booking[];
  currentTime: Date;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  getRoomStatus: (roomId: string, customDate?: string) => RoomRealtimeState;
  isSlotAvailable: (roomId: string, date: string, startTime: string, endTime: string, excludeBookingId?: string) => boolean;
  createBooking: (data: {
    roomId: string;
    date: string;
    startTime: string;
    endTime: string;
    purpose: string;
    participants: number;
    bookedBy?: string;
    userRole?: string;
  }) => { success: boolean; error?: string; booking?: Booking };
  quickBook: (roomId: string, durationMinutes: number) => { success: boolean; error?: string };
  checkIn: (bookingId: string) => void;
  endBookingEarly: (bookingId: string) => void;
  extendBooking: (bookingId: string, extraMinutes: number) => { success: boolean; message: string };
  cancelBooking: (bookingId: string) => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

// Helper to convert "HH:mm" to minutes from 00:00
export const timeToMinutes = (timeStr: string): number => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

// Helper to convert minutes to "HH:mm"
export const minutesToTime = (minutes: number): string => {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rooms] = useState<Room[]>(INITIAL_ROOMS);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString(0));

  // Live Clock Tick every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Format current HH:mm
  const currentHH = String(currentTime.getHours()).padStart(2, '0');
  const currentMM = String(currentTime.getMinutes()).padStart(2, '0');
  const currentHMStr = `${currentHH}:${currentMM}`;
  const currentMinutesNow = currentTime.getHours() * 60 + currentTime.getMinutes();
  const todayStr = getTodayString(0);

  // Check if slot overlaps with existing non-cancelled bookings
  const isSlotAvailable = (
    roomId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeBookingId?: string
  ): boolean => {
    const startM = timeToMinutes(startTime);
    const endM = timeToMinutes(endTime);

    if (startM >= endM) return false;

    const conflict = bookings.find((b) => {
      if (b.roomId !== roomId || b.date !== date || b.status === 'cancelled') return false;
      if (excludeBookingId && b.id === excludeBookingId) return false;

      const bStartM = timeToMinutes(b.startTime);
      const bEndM = timeToMinutes(b.endTime);

      // Overlap condition: start < bEnd AND end > bStart
      return startM < bEndM && endM > bStartM;
    });

    return !conflict;
  };

  // Get Room Status in real-time
  const getRoomStatus = (roomId: string, customDate?: string): RoomRealtimeState => {
    const checkDate = customDate || todayStr;
    const isToday = checkDate === todayStr;

    // Filter bookings for this room & date
    const roomBookings = bookings
      .filter((b) => b.roomId === roomId && b.date === checkDate && b.status !== 'cancelled')
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

    if (!isToday) {
      // For future/past dates, show status based on first booking
      if (roomBookings.length > 0) {
        return {
          status: 'occupied',
          nextBooking: roomBookings[0],
        };
      }
      return { status: 'available' };
    }

    // For today: check current time vs bookings
    const activeBooking = roomBookings.find((b) => {
      const bStartM = timeToMinutes(b.startTime);
      const bEndM = timeToMinutes(b.endTime);
      return currentMinutesNow >= bStartM && currentMinutesNow < bEndM;
    });

    const upcomingBookings = roomBookings.filter((b) => {
      const bStartM = timeToMinutes(b.startTime);
      return bStartM > currentMinutesNow;
    });

    const nextBooking = upcomingBookings[0];

    if (activeBooking) {
      const bEndM = timeToMinutes(activeBooking.endTime);
      const minutesLeft = Math.max(0, bEndM - currentMinutesNow);
      const status: RoomStatus = minutesLeft <= 15 ? 'ending_soon' : 'occupied';

      return {
        status,
        currentBooking: activeBooking,
        nextBooking,
        minutesLeft,
      };
    }

    // Room is available now. Find when it's booked next
    let freeUntil: string | undefined;
    if (nextBooking) {
      freeUntil = nextBooking.startTime;
    }

    return {
      status: 'available',
      nextBooking,
      freeUntil,
    };
  };

  // Create standard booking (LibCal style)
  const createBooking = (data: {
    roomId: string;
    date: string;
    startTime: string;
    endTime: string;
    purpose: string;
    participants: number;
    bookedBy?: string;
    userRole?: string;
  }) => {
    const targetRoom = rooms.find((r) => r.id === data.roomId);
    if (!targetRoom) return { success: false, error: 'Không tìm thấy phòng.' };

    const available = isSlotAvailable(data.roomId, data.date, data.startTime, data.endTime);
    if (!available) {
      return { success: false, error: 'Khung giờ này đã có người đặt trước. Vui lòng chọn khung giờ khác!' };
    }

    const randomCode = `${targetRoom.code.split('-')[0]}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBooking: Booking = {
      id: `book-${Date.now()}`,
      roomId: data.roomId,
      roomName: targetRoom.name,
      roomCode: targetRoom.code,
      building: targetRoom.building,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      bookedBy: data.bookedBy || 'Văn Quyền (Bạn)',
      userRole: data.userRole || 'Sinh viên',
      purpose: data.purpose || 'Học tập & Thực hành nhóm',
      participants: data.participants || 1,
      status: 'active',
      checkInCode: randomCode,
      createdAt: new Date().toISOString(),
    };

    setBookings((prev) => [newBooking, ...prev]);
    return { success: true, booking: newBooking };
  };

  // Quick Book (Robin Instant Book 15/30/60m)
  const quickBook = (roomId: string, durationMinutes: number) => {
    const targetRoom = rooms.find((r) => r.id === roomId);
    if (!targetRoom) return { success: false, error: 'Không tìm thấy phòng' };

    const startMinutes = currentMinutesNow;
    const endMinutes = currentMinutesNow + durationMinutes;

    const startTime = minutesToTime(startMinutes);
    const endTime = minutesToTime(endMinutes);

    const available = isSlotAvailable(roomId, todayStr, startTime, endTime);
    if (!available) {
      return {
        success: false,
        error: `Phòng không còn đủ ${durationMinutes} phút trống liên tục ngay lúc này!`,
      };
    }

    const newBooking: Booking = {
      id: `quick-${Date.now()}`,
      roomId: targetRoom.id,
      roomName: targetRoom.name,
      roomCode: targetRoom.code,
      building: targetRoom.building,
      date: todayStr,
      startTime,
      endTime,
      bookedBy: 'Văn Quyền (Bạn)',
      userRole: 'Đặt nhanh tại chỗ',
      purpose: `Đặt nhanh Robin (${durationMinutes} phút) làm việc tức thì`,
      participants: 2,
      status: 'checked_in', // Quick book is checked in automatically
      checkInCode: `QK-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
    };

    setBookings((prev) => [newBooking, ...prev]);
    return { success: true };
  };

  // Check-In QR scan
  const checkIn = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'checked_in' } : b))
    );
  };

  // Release room early (Robin End Early feature)
  const endBookingEarly = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          // Truncate end time to current time
          return {
            ...b,
            endTime: currentHMStr,
            status: 'completed',
          };
        }
        return b;
      })
    );
  };

  // Extend booking (if next slot free)
  const extendBooking = (bookingId: string, extraMinutes: number) => {
    const target = bookings.find((b) => b.id === bookingId);
    if (!target) return { success: false, message: 'Không tìm thấy lịch đặt' };

    const currentEndM = timeToMinutes(target.endTime);
    const newEndM = currentEndM + extraMinutes;
    const newEndTime = minutesToTime(newEndM);

    const available = isSlotAvailable(
      target.roomId,
      target.date,
      target.endTime,
      newEndTime,
      target.id
    );

    if (!available) {
      return { success: false, message: 'Không thể gia hạn vì khung giờ tiếp theo đã có người đặt!' };
    }

    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, endTime: newEndTime } : b))
    );

    return { success: true, message: `Đã gia hạn thành công thêm ${extraMinutes} phút!` };
  };

  const cancelBooking = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
    );
  };

  return (
    <BookingContext.Provider
      value={{
        rooms,
        bookings,
        currentTime,
        selectedDate,
        setSelectedDate,
        getRoomStatus,
        isSlotAvailable,
        createBooking,
        quickBook,
        checkIn,
        endBookingEarly,
        extendBooking,
        cancelBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = (): BookingContextType => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
