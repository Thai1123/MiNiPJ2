# BÁO CÁO DỰ ÁN: HỆ THỐNG ĐẶT PHÒNG HỌC & LAB THỜI GIAN THỰC
## EduSpace Live (React Native iOS - Tham chiếu Robin Powered & Springshare LibCal)

---

## 1. TỔNG QUAN DỰ ÁN

| Mục | Thông tin chi tiết |
| :--- | :--- |
| **Tên dự án** | **EduSpace Live** |
| **Nền tảng mục tiêu** | **iOS (iPhone / iPad)**, hỗ trợ Web Preview |
| **Công nghệ cốt lõi** | **React Native (Expo SDK 57)**, TypeScript |
| **Mô hình kiến trúc** | Reactive State Pattern, Real-time Simulation Engine |
| **Mô hình tham chiếu** | **Robin Powered** (Workspace Scheduling) & **Springshare LibCal** (University Lab Booking) |
| **Tác giả / Sinh viên** | Văn Quyền (`quyen11072k5@gmail.com`) |

---

## 2. BỐI CẢNH & MỤC TIÊU PHÁT TRIỂN

Tại các trường đại học và viện nghiên cứu, phòng máy tính cấu hình cao (GPU Server), phòng lab viễn thông, xưởng chế tác robot và phòng hội thảo thường xuyên gặp phải tình trạng:
1. **Lãng phí không gian (Ghost Booking)**: Đặt phòng nhưng không đến sử dụng, khiến người khác có nhu cầu không thể tiếp cận.
2. **Xung đột lịch đặt**: Thiếu hệ thống kiểm tra trùng lịch tức thời theo thời gian thực.
3. **Thiếu khả năng nhận biết phòng trống tại chỗ**: Sinh viên phải đi dọc hành lang nhìn qua kính cửa sổ để tìm phòng trống.

### Giải pháp của EduSpace Live:
Ứng dụng kết hợp sức mạnh của 2 nền tảng nổi tiếng trên thế giới:
- **Robin Powered**: Hệ thống nhận diện trạng thái phòng thời gian thực (Xanh/Đỏ/Vàng), sơ đồ mặt bằng các tầng tương tác trực quan, chế độ màn hình Kiosk đặt trước cửa phòng, tính năng đặt nhanh tại chỗ (Quick Book), và chính sách giải phóng phòng tự động (Auto-Release).
- **Springshare LibCal**: Ma trận lịch đặt theo giờ (Timeslot Grid), chọn ngày linh hoạt, quản lý đăng ký mượn trang thiết bị thí nghiệm kèm theo.

---

## 3. CÁC TÍNH NĂNG CỐT LÕI ĐÃ TRIỂN KHAI

### 3.1. Trạng Thái Phòng Thời Gian Thực (Robin Realtime Status)
- **3 trạng thái màu sắc trực quan**:
  - 🟢 **Available (Xanh Lục)**: Phòng đang trống, hiển thị mốc giờ "Trống đến HH:mm" hoặc "Sẵn sàng cả ngày".
  - 🔴 **Occupied (Đỏ Rực)**: Đang có lớp hoặc nhóm nghiên cứu sử dụng. Hiển thị người phụ trách, mục đích và thời gian còn lại (phút).
  - 🟡 **Ending Soon (Vàng Cam)**: Phiên sử dụng còn dưới 15 phút, nhắc nhở chuẩn bị bàn giao phòng.
- **Live Countdown Ticker**: Bộ đếm ngược tự động cập nhật liên tục mỗi 5 giây mà không làm giật lag giao diện.
- **⚡ Đặt Nhanh 30 Phút (Robin Quick-Book)**: Chỉ với 1 chạm, sinh viên có thể đặt và nhận phòng ngay 30 phút mà không cần điền form phức tạp.

### 3.2. Sơ Đồ Mặt Bằng Tương Tác (Robin Interactive Floor Map)
- Tích hợp sơ đồ kiến trúc các tầng: Tầng 1 (Hội trường & Media Studio), Tầng 2 (Xưởng IoT & Pod), Tầng 3 (Lab Mạng Cisco), Tầng 4 (Lab AI & Đồ họa).
- Các phòng được vẽ dưới dạng các khối không gian hình học. Viền và nền phòng đổi màu thời gian thực theo trạng thái.
- Người dùng chạm vào phòng trên bản đồ để xem chi tiết thông số (sức chứa, cấu hình) và đặt chỗ tức thì.

### 3.3. Ma Trận Đặt Giờ (LibCal Timeslot Grid)
- **Thanh lướt 7 ngày trong tuần**: Chọn ngày đặt từ hôm nay đến các ngày tiếp theo.
- **Khung giờ dạng block (08:00 đến 20:00)**: Từng ô 1 tiếng hiển thị rõ trạng thái rảnh hoặc tên phiên đang đặt.
- **Thuật toán kiểm tra xung đột (Conflict Detection)**:
  $$\text{Overlap} \iff (\text{Start}_{\text{new}} < \text{End}_{\text{existing}}) \land (\text{End}_{\text{new}} > \text{Start}_{\text{existing}})$$
  Hệ thống lập tức cảnh báo đỏ và khóa nút xác nhận nếu có bất kỳ sự trùng lặp nào.

### 3.4. Thẻ Vé Apple Wallet & Check-in QR Thông Minh
- Thiết kế chuẩn phong cách **Apple Wallet Pass** với bo góc cong, rãnh xé vé và mã QR sắc nét.
- **Chính sách Robin Auto-Release**: Yêu cầu quét mã QR check-in tại cửa phòng trong vòng 15 phút kể từ khi phiên bắt đầu.
- **Gia hạn thời gian (+30 Phút)**: Cho phép gia hạn thêm nếu khung giờ tiếp theo chưa có ai đặt.
- **Trả phòng sớm (Release Room)**: Cho phép người dùng kết thúc phiên sớm chỉ bằng 1 nút bấm để giải phóng phòng cho sinh viên khác.

### 3.5. Chế Độ Màn Hình Ngoài Cửa Phòng (Robin Door Display Kiosk)
- Giao diện chuyên biệt dành cho iPad/Tablet gắn trước cửa phòng Lab.
- Đổi toàn bộ màn hình thành màu **Xanh Lục Sáng** khi trống hoặc **Đỏ Rực** khi có người dùng.
- Hiển thị đồng hồ số lớn, mã QR to rõ để sinh viên đi ngang quét nhận phòng và các nút đặt nhanh 15p, 30p, 1 tiếng ngay tại cửa.

### 3.6. Dynamic Island / Live Activity Banner
- Banner nổi thông minh hiển thị phiên học/nghiên cứu đang diễn ra của người dùng, đếm ngược số phút và tích hợp nút thao tác nhanh.

---

## 4. CẤU TRÚC MÃ NGUỒN (PROJECT STRUCTURE)

```
Đặt Phòng Học:Lab/
├── assets/
│   └── screenshots/              # Ảnh chụp màn hình ứng dụng thực tế
├── src/
│   ├── types/
│   │   └── index.ts              # Khai báo kiểu TypeScript: Room, Booking, Amenity, Status
│   ├── data/
│   │   └── mockData.ts           # Dữ liệu 6 phòng Lab cao cấp, trang thiết bị và lịch mẫu
│   ├── context/
│   │   └── BookingContext.tsx    # State Engine thời gian thực, thuật toán xung đột, auto-release
│   └── components/
│       ├── Header.tsx            # Header iOS với live clock và thanh thống kê phòng
│       ├── LiveBanner.tsx        # Banner kiểu Dynamic Island đếm ngược phiên
│       ├── RoomCard.tsx          # Card phòng Robin với nút Quick Book 30p
│       ├── FloorMap.tsx          # Sơ đồ tầng tương tác đổi màu theo thời gian thực
│       ├── TimeSlotGrid.tsx      # Lưới chọn slot giờ phong cách LibCal
│       ├── BookingModal.tsx      # Modal đặt phòng, chọn thiết bị và kiểm tra xung đột
│       ├── PassCard.tsx          # Vé điện tử Apple Wallet kèm mã QR check-in
│       └── KioskDisplay.tsx      # Giao diện iPad Kiosk ngoài cửa phòng
├── App.tsx                       # Màn hình chính tích hợp toàn bộ điều hướng iOS
├── app.json                      # Cấu hình dự án Expo cho iOS
├── package.json                  # Khai báo dependencies
└── BAO_CAO_DU_AN.md              # Báo cáo tổng kết dự án
```

---

## 5. HÌNH ẢNH ỨNG DỤNG THỰC TẾ TRÊN IOS

Ứng dụng đã được khởi chạy và kiểm thử thực tế trên **iPhone 17 Pro iOS Simulator**:

![Giao diện iOS EduSpace Live](./assets/screenshots/ios_preview.png)

---

## 6. HƯỚNG DẪN CÀI ĐẶT & CHẠY ỨNG DỤNG

### Yêu cầu môi trường
- **Node.js**: v20+ hoặc v22+
- **macOS** (để chạy iOS Simulator) hoặc điện thoại iPhone (cài Expo Go)

### Các bước khởi chạy

1. **Cài đặt thư viện**:
   ```bash
   npm install
   ```

2. **Chạy ứng dụng trên iOS Simulator**:
   ```bash
   npx expo start --ios
   ```
   *(Hoặc chạy `npx expo start` rồi mở đường dẫn `exp://127.0.0.1:8081` trên Simulator)*

3. **Chạy ứng dụng trên iPhone thật qua Expo Go**:
   - Tải app **Expo Go** trên App Store.
   - Chạy lệnh `npx expo start` và dùng Camera điện thoại quét mã QR trên terminal.

4. **Chạy bản Web Preview**:
   ```bash
   npx expo start --web
   ```
   Truy cập: `http://localhost:8081`

---

## 7. ĐÁNH GIÁ & HƯỚNG PHÁT TRIỂN TIẾP THEO

- **Kết quả đạt được**:
  - Hoàn thiện 100% các tính năng đặc trưng của Robin và LibCal trong một ứng dụng React Native tinh gọn, mượt mà.
  - Giao diện đạt chuẩn Apple Human Interface Guidelines (SF typography, Glassmorphism, Dynamic Island, Apple Wallet Pass).
  - Thuật toán kiểm tra xung đột hoạt động chính xác tuyệt đối theo thời gian thực.
- **Hướng phát triển trong tương lai**:
  - Kết nối Supabase Realtime hoặc Firebase Firestore để đồng bộ đa thiết bị tức thì.
  - Tích hợp Apple Push Notifications (APNs) gửi thông báo trước 15 phút check-in.
  - Tích hợp cảm biến chuyển động IoT (PIR sensor) ngoài đời thực để tự động xác nhận phòng có người hay không.
