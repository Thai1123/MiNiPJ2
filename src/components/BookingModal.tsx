import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Room } from '../types';
import { useBooking, timeToMinutes, minutesToTime } from '../context/BookingContext';

interface BookingModalProps {
  visible: boolean;
  room: Room | null;
  initialDate?: string;
  initialStartTime?: string;
  initialEndTime?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  visible,
  room,
  initialDate,
  initialStartTime,
  initialEndTime,
  onClose,
  onSuccess,
}) => {
  const { selectedDate, isSlotAvailable, createBooking } = useBooking();

  const [date, setDate] = useState<string>(initialDate || selectedDate);
  const [startTime, setStartTime] = useState<string>(initialStartTime || '14:00');
  const [endTime, setEndTime] = useState<string>(initialEndTime || '15:30');
  const [purpose, setPurpose] = useState<string>('Thực hành đồ án tốt nghiệp');
  const [participants, setParticipants] = useState<number>(4);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  useEffect(() => {
    if (initialDate) setDate(initialDate);
    if (initialStartTime) setStartTime(initialStartTime);
    if (initialEndTime) setEndTime(initialEndTime);
  }, [initialDate, initialStartTime, initialEndTime]);

  if (!room) return null;

  // Realtime conflict check
  const isAvailable = isSlotAvailable(room.id, date, startTime, endTime);

  // Quick adjust duration
  const handleQuickDuration = (minutes: number) => {
    const sM = timeToMinutes(startTime);
    const newEndM = sM + minutes;
    setEndTime(minutesToTime(newEndM));
  };

  const handleToggleAddon = (addonName: string) => {
    setSelectedAddons((prev) =>
      prev.includes(addonName) ? prev.filter((a) => a !== addonName) : [...prev, addonName]
    );
  };

  const handleConfirm = () => {
    if (!purpose.trim()) {
      if (Platform.OS === 'web') alert('Vui lòng nhập mục đích sử dụng phòng!');
      else Alert.alert('Lưu ý', 'Vui lòng nhập mục đích sử dụng phòng!');
      return;
    }

    const fullPurpose = selectedAddons.length > 0
      ? `${purpose} (Kèm: ${selectedAddons.join(', ')})`
      : purpose;

    const res = createBooking({
      roomId: room.id,
      date,
      startTime,
      endTime,
      purpose: fullPurpose,
      participants,
      bookedBy: 'Văn Quyền (Bạn)',
      userRole: 'Sinh viên',
    });

    if (!res.success) {
      if (Platform.OS === 'web') alert(res.error || 'Đặt phòng thất bại!');
      else Alert.alert('Xung Đột Lịch', res.error || 'Đặt phòng thất bại!');
      return;
    }

    if (Platform.OS === 'web') {
      alert(`🎉 Đặt phòng thành công tại ${room.name}!\nMã check-in: ${res.booking?.checkInCode}`);
    } else {
      Alert.alert(
        '🎉 Đặt Phòng Thành Công',
        `Phòng: ${room.name}\nGiờ: ${startTime} - ${endTime}\nMã Check-in: ${res.booking?.checkInCode}\n\nVui lòng check-in trong 15 phút đầu!`
      );
    }

    onSuccess();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <View style={styles.codeRow}>
                <Text style={styles.codeBadge}>{room.code}</Text>
                <Text style={styles.roomType}>{room.typeLabel}</Text>
              </View>
              <Text style={styles.roomName}>{room.name}</Text>
              <Text style={styles.buildingText}>{room.building}</Text>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
              <Ionicons name="close" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Realtime Conflict Status Card */}
            <View
              style={[
                styles.statusBanner,
                isAvailable ? styles.statusBannerFree : styles.statusBannerBusy,
              ]}
            >
              <Ionicons
                name={isAvailable ? 'checkmark-circle' : 'alert-circle'}
                size={18}
                color={isAvailable ? '#10B981' : '#EF4444'}
              />
              <Text
                style={[
                  styles.statusBannerText,
                  { color: isAvailable ? '#6EE7B7' : '#FCA5A5' },
                ]}
              >
                {isAvailable
                  ? 'Khung giờ hợp lệ - Không có xung đột lịch!'
                  : 'XUNG ĐỘT: Đã có phiên sử dụng khác trùng khung giờ này!'}
              </Text>
            </View>

            {/* Date and Time Fields */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Ngày đặt</Text>
              <View style={styles.inputBox}>
                <Ionicons name="calendar-outline" size={16} color="#94A3B8" />
                <Text style={styles.inputText}>{date}</Text>
              </View>
            </View>

            {/* Time Range */}
            <View style={styles.timeRow}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>Bắt đầu</Text>
                <TextInput
                  style={styles.timeInput}
                  value={startTime}
                  onChangeText={setStartTime}
                  placeholder="14:00"
                  placeholderTextColor="#64748B"
                />
              </View>
              <View style={styles.timeArrow}>
                <Ionicons name="arrow-forward" size={16} color="#64748B" />
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>Kết thúc</Text>
                <TextInput
                  style={styles.timeInput}
                  value={endTime}
                  onChangeText={setEndTime}
                  placeholder="15:30"
                  placeholderTextColor="#64748B"
                />
              </View>
            </View>

            {/* Quick Duration Pills */}
            <View style={styles.quickPillsRow}>
              {[
                { label: '+30 phút', mins: 30 },
                { label: '+1 tiếng', mins: 60 },
                { label: '+2 tiếng', mins: 120 },
                { label: '+3 tiếng', mins: 180 },
              ].map((p) => (
                <TouchableOpacity
                  key={p.label}
                  style={styles.durationPill}
                  onPress={() => handleQuickDuration(p.mins)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.durationPillText}>{p.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Purpose */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Mục đích sử dụng phòng / đồ án</Text>
              <TextInput
                style={styles.textInput}
                value={purpose}
                onChangeText={setPurpose}
                placeholder="Ví dụ: Luyện mô hình AI, chuẩn bị báo cáo..."
                placeholderTextColor="#64748B"
              />
            </View>

            {/* Participants counter */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Số người tham gia (Tối đa {room.capacity} người)</Text>
              <View style={styles.counterRow}>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => setParticipants((p) => Math.max(1, p - 1))}
                  activeOpacity={0.8}
                >
                  <Ionicons name="remove" size={18} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.counterText}>{participants} người</Text>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => setParticipants((p) => Math.min(room.capacity, p + 1))}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Addons Checklist */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Đăng ký mượn thiết bị bổ sung</Text>
              <View style={styles.addonsList}>
                {[
                  'Micro không dây & Loa trợ giảng',
                  'Bộ kit vi điều khiển / Cáp nạp',
                  'Kính thực tế ảo Meta Quest 3',
                  'Bút cảm ứng bảng vẽ tương tác',
                ].map((addon) => {
                  const isChecked = selectedAddons.includes(addon);
                  return (
                    <TouchableOpacity
                      key={addon}
                      style={[styles.addonItem, isChecked && styles.addonItemChecked]}
                      onPress={() => handleToggleAddon(addon)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={isChecked ? 'checkbox' : 'square-outline'}
                        size={18}
                        color={isChecked ? '#38BDF8' : '#64748B'}
                      />
                      <Text style={[styles.addonText, isChecked && styles.addonTextChecked]}>
                        {addon}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Robin Policy Note */}
            <View style={styles.policyCard}>
              <Ionicons name="information-circle-outline" size={16} color="#38BDF8" />
              <Text style={styles.policyText}>
                <Text style={{ fontWeight: '700', color: '#F8FAFC' }}>Chính sách Robin Auto-Release:</Text>{' '}
                Vui lòng quét QR check-in tại cửa phòng trong vòng 15 phút kể từ giờ bắt đầu. Nếu quá hạn, hệ thống sẽ tự động giải phóng phòng cho người khác.
              </Text>
            </View>
          </ScrollView>

          {/* Footer Submit Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.confirmBtn, !isAvailable && styles.confirmBtnDisabled]}
              onPress={handleConfirm}
              disabled={!isAvailable}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-done" size={18} color="#FFFFFF" />
              <Text style={styles.confirmBtnText}>Xác Nhận Đặt Phòng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: '#334155',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  codeBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  roomType: {
    fontSize: 11,
    color: '#94A3B8',
  },
  roomName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  buildingText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: 18,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  statusBannerFree: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  statusBannerBusy: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  statusBannerText: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  formGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#CBD5E1',
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  inputText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  timeArrow: {
    paddingTop: 16,
  },
  timeInput: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: '#334155',
  },
  quickPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  durationPill: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  durationPillText: {
    fontSize: 11,
    color: '#38BDF8',
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  counterBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterText: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },
  addonsList: {
    gap: 8,
  },
  addonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  addonItemChecked: {
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
  },
  addonText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  addonTextChecked: {
    color: '#F8FAFC',
    fontWeight: '600',
  },
  policyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  policyText: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
    flex: 1,
  },
  footer: {
    padding: 18,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 14,
  },
  confirmBtnDisabled: {
    backgroundColor: '#475569',
    opacity: 0.6,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
