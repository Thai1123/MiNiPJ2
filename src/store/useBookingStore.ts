import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  name: string;
}

export interface ZustandBooking {
  id: string;
  roomId: string;
  roomName: string;
  building: string;
  date: string;
  startTime: string;
  endTime: string;
  userId: string;
  createdAt: number;
  status: "active" | "cancelled";
  notificationId?: string | null;
}

interface BookingState {
  user: User | null;
  bookings: ZustandBooking[];
  login: (user: User) => void;
  addBooking: (booking: Omit<ZustandBooking, 'id' | 'createdAt' | 'status'>) => ZustandBooking;
  cancelBooking: (bookingId: string) => void;
  isSlotBooked: (roomId: string, date: string, startTime: string) => boolean;
  getUserBookings: (userId: string) => ZustandBooking[];
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      user: { id: 'user-1', name: 'Văn Thái' },
      bookings: [],
      
      login: (user) => set({ user }),
      
      addBooking: (bookingData) => {
        const newBooking: ZustandBooking = {
          ...bookingData,
          id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
          createdAt: Date.now(),
          status: "active",
        };
        set((state) => ({ bookings: [...state.bookings, newBooking] }));
        return newBooking;
      },
      
      cancelBooking: (bookingId) => {
        set((state) => ({
          bookings: state.bookings.map((b) =>
            b.id === bookingId ? { ...b, status: "cancelled" } : b
          ),
        }));
      },
      
      isSlotBooked: (roomId, date, startTime) => {
        const { bookings } = get();
        return bookings.some(
          (b) =>
            b.roomId === roomId &&
            b.date === date &&
            b.status === "active" &&
            b.startTime === startTime
        );
      },
      
      getUserBookings: (userId) => {
        const { bookings } = get();
        return bookings.filter((b) => b.userId === userId);
      },
    }),
    {
      name: 'vku-study-room-bookings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
