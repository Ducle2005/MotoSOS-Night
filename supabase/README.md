# Hướng Dẫn Khởi Tạo Supabase Cho MotoSOS

Tài liệu này hướng dẫn bạn kích hoạt tính năng **Live Dispatch (Điều phối thực tế)** của MotoSOS thông qua Supabase chỉ trong 2 phút.

---

## 1. Tạo Project Supabase

1. Truy cập [https://supabase.com](https://supabase.com) và đăng nhập (hoặc đăng ký tài khoản miễn phí).
2. Nhấn **New Project**.
3. Đặt tên: `MotoSOS` (hoặc tên tùy thích).
4. Chọn mật khẩu cơ sở dữ liệu và khu vực gần Việt Nam nhất (ví dụ: `Singapore - ap-southeast-1`).
5. Chờ ~1 phút để Supabase chuẩn bị cụm cơ sở dữ liệu.

---

## 2. Chạy Script Khởi Tạo Database (1 Click)

1. Trên menu bên trái của Supabase Dashboard, nhấp vào **SQL Editor** (biểu tượng `>_`).
2. Mở file [schema.sql](schema.sql) trong thư mục này, sao chép toàn bộ nội dung.
3. Dán vào khung SQL Editor của Supabase.
4. Nhấn nút **Run** (hoặc tổ hợp phím `Ctrl + Enter` / `Cmd + Enter`).
5. Kết quả trả về dòng:
   ```text
   MotoSOS Supabase schema initialized successfully!
   ```

Script này tự động tạo:
* Bảng `mechanics`: Danh sách kỹ thuật viên cứu hộ kèm dữ liệu mẫu tọa độ Quận 1, TP.HCM.
* Bảng `rescue_orders`: Quản lý các cuốc cứu hộ và trạng thái vòng đời.
* Bảng `rescue_messages`: Lưu tin nhắn trò chuyện 2 chiều giữa khách và thợ.
* Bật **Supabase Realtime**: Đẩy thay đổi đơn và chat tức thì qua WebSockets.
* 2 hàm RPC: `accept_rescue_order` (Atomic Lock chống tranh chấp đơn giữa các thợ) và `find_nearby_mechanics` (quét thợ gần nhất).

---

## 3. Lấy Khóa API và Cấu hình vào File `.env`

1. Trên Supabase Dashboard, vào **Project Settings** (biểu tượng bánh răng ở góc dưới bên trái) -> **API**.
2. Sao chép 2 giá trị:
   * **Project URL**: Ví dụ `https://xyzcompany.supabase.co`
   * **Project API Keys (`anon` / `public`)**: Dãy token JWT công khai.
3. Mở file `.env` ở thư mục gốc dự án MotoSOS và thêm vào:

```env
VITE_SUPABASE_URL="https://xyzcompany.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
VITE_DISPATCH_MODE="live"
```

---

## 4. Kiểm tra trên Giao diện MotoSOS

1. Mở ứng dụng MotoSOS trên trình duyệt (`http://localhost:3000`).
2. Nhấn nút **App Thợ** ở góc phải trên cùng Header để mở ứng dụng dành cho thợ:
   - Thợ sẽ tự động gửi tín hiệu Online và ping heartbeat 20s/lần vào Supabase.
3. Ở màn hình chính, đặt 1 đơn cứu hộ (ví dụ: "Lủng lốp"):
   - Đơn sẽ xuất hiện ngay lập tức trên màn hình "App Thợ".
   - Thợ bấm **Nhận đơn** -> Hệ thống khóa đơn nguyên tử và bắt đầu phát sóng vị trí GPS thợ di chuyển về app khách hàng.
   - Hai bên có thể nhắn tin trực tiếp và xác nhận khi thợ tới nơi (`ARRIVED`) hoặc hoàn thành (`COMPLETED`).
