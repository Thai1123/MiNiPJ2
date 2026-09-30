export type RoomType = 'computer_lab' | 'science_lab' | 'seminar' | 'media_studio' | 'study_pod';

export type RoomStatus = 'available' | 'occupied' | 'ending_soon';

export interface Amenity {
  id: string;
  name: string;
  icon: string;
}

export interface Room {
  id: string;
  code: string;
  name: string;
  building: string;
  floor: number;
  capacity: number;
  type: RoomType;
  typeLabel: string;
  description: string;
  amenities: Amenity[];
  imageUrl: string;
  color: string;
  mapCoords: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

export type BookingStatus = 'active' | 'upcoming' | 'checked_in' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  roomId: string;
  roomName: string;
  roomCode: string;
  building: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm e.g. "14:00"
  endTime: string; // HH:mm e.g. "15:30"
  bookedBy: string;
  userRole: string; // e.g. "Sinh viên", "Giảng viên", "Nghiên cứu sinh"
  purpose: string;
  participants: number;
  status: BookingStatus;
  checkInCode: string;
  createdAt: string;
}

export interface DaySchedule {
  date: string; // YYYY-MM-DD
  label: string; // e.g. "Hôm nay", "T.Năm, 24/09"
}
