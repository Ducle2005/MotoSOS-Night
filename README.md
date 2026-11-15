# 🛵 MotoSOS — Cứu Hộ Xe Máy & Mạng Lưới Trạm An Toàn 24/7

> **Nền tảng cứu hộ xe máy khẩn cấp ban đêm và điều hướng tới các Trạm An Toàn (Cây xăng, Cửa hàng tiện lợi 24/7, Đồn Công an) với hiệu năng bản đồ WebGL 120fps và định vị thời gian thực.**

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![MapLibre GL](https://img.shields.io/badge/MapLibre_GL-WebGL_120fps-blue?logo=mapbox&logoColor=white)](https://maplibre.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Realtime_Dispatch-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Tests](https://img.shields.io/badge/Unit_Tests-114_Passed-success)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🌟 Điểm nổi bật & Tính năng cốt lõi

### 1. Bản đồ GPU Siêu Tốc (MapLibre GL WebGL 120fps)
* **Khởi tạo tức thì (< 50ms):** Sử dụng cơ chế **Keep-Alive** (giữ sống canvas WebGL xuyên suốt các tab, tự động `resize()` qua `requestAnimationFrame`) giúp chuyển tab không tốn thời gian tải lại.
* **Bộ Icon Vector Retina độc quyền:** Render trực tiếp trên GPU qua HTML5 Canvas 2D (`pixelRatio: 2`) cho 4 nhóm địa điểm:
  * 🔧 **Tiệm sửa xe:** Xanh dương `#1D63ED` kèm chấm xanh báo thợ đang trực tuyến.
  * ⛽ **Cây xăng:** Cam hổ phách `#F59E0B` nhận diện nhanh trong đêm.
  * 🛡️ **Đồn Công an:** Tím chàm `#4338CA` hỗ trợ bảo vệ an ninh khẩn cấp.
  * 🏪 **Cửa hàng 24/7:** Xanh ngọc `#10B981` (Circle K, FamilyMart, GS25) làm trạm dừng an toàn.
* **Lọc tức thì trong 1ms:** Toàn bộ điểm lưu trữ trên một nguồn `GeoJSON Source` duy nhất, thay đổi bộ lọc chip cập nhật GPU tức thì.

### 2. Điều Phối Thợ Realtime (Supabase Live Dispatch & GPS 60fps)
* **Kênh WebSocket thời gian thực:** Kết nối giữa App Khách và App Thợ qua Supabase Realtime Channels.
* **Thuật toán nội suy GPS 60fps:** Tích hợp bộ nội suy tuyến tính góc quay (bearing) và khoảng cách qua `requestAnimationFrame`, xe thợ lăn bánh mượt mà theo từng mét đường thực tế, loại bỏ hoàn toàn hiện tượng giật cục.

### 3. Tìm Tuyến Đường Thông Minh (OSRM Engine)
* Tự động tính toán lộ trình xe máy và người đi bộ tối ưu nhất qua máy chủ Open Source Routing Machine.
* **Stale-While-Revalidate Cache:** Lưu đệm tuyến đường theo cặp tọa độ trong Memory Map, nạp lại lộ trình đã đi chỉ mất `< 5ms`.
* **Chế độ Ngoại tuyến (Offline Mode):** Tự động chuyển sang la bàn dẫn hướng và đường đi nội suy cục bộ khi mất kết nối mạng.

### 4. Trợ Lý AI Chẩn Đoán Xe Máy (Gemini AI Mechanic)
* Phân tích triệu chứng hỏng xe thông minh (chết máy ngập nước, hết ắc-quy, đứt dây curoa, thủng lốp).
* Đưa ra lời khuyên xử lý an toàn tại chỗ trước khi thợ cứu hộ có mặt.

### 5. An Toàn Dữ Liệu & Mã Hóa Cục Bộ
* Tích hợp tầng mã hóa `storageCrypto` (AES-based) bảo vệ toàn bộ lịch sử cứu hộ, thông tin cá nhân và địa chỉ đã lưu trong `localStorage`.

---

## 🏗️ Kiến Trúc Hệ Thống (System Architecture)

```
┌─────────────────────────────────────────────────────────────┐
│                       CLIENT (React 19)                     │
│   ┌─────────────────────┐       ┌───────────────────────┐   │
│   │ MapLibre WebGL      │       │ State & Orchestration │   │
│   │ (120fps Canvas GPU) │       │ (RescueOrderState)    │   │
│   └──────────▲──────────┘       └───────────▲───────────┘   │
└──────────────┼──────────────────────────────┼───────────────┘
               │                              │
    ┌──────────┴──────────┐       ┌───────────┴───────────┐
    │  Location & Routing │       │    Backend Services   │
    │  • OSRM Engine      │       │  • Supabase Realtime  │
    │  • CARTO Positron   │       │  • PostGIS RPC        │
    │  • Geoapify Places  │       │  • Google Gemini AI   │
    └─────────────────────┘       └───────────────────────┘
```

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

| Hạng mục | Công nghệ |
| :--- | :--- |
| **Giao diện & Logic** | React 19, TypeScript, Tailwind CSS, Lucide Icons |
| **Bản đồ & Đồ họa** | MapLibre GL JS, WebGL, HTML5 Canvas 2D, OpenStreetMap |
| **Định tuyến** | OSRM (Open Source Routing Machine) |
| **Cơ sở dữ liệu & Realtime** | Supabase (PostgreSQL, PostGIS, Realtime Channels) |
| **Trí tuệ nhân tạo** | Google Gemini API (`@google/genai`) |
| **Bảo mật** | Custom AES storage encryption (`storageCrypto`) |
| **Kiểm thử** | Node Test Runner (`tsx --test`), 114 test cases |

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Cục Bộ

### Yêu cầu môi trường
* **Node.js** >= 20.x
* **npm** hoặc **bun**

### 1. Clone dự án
```bash
git clone https://github.com/Ducle2005/MotoSOS-Night.git
cd MotoSOS-Night
```

### 2. Cài đặt thư viện
```bash
npm install
```

### 3. Cấu hình biến môi trường
Tạo file `.env` từ file mẫu:
```bash
cp .env.example .env
```
Điền các API keys cần thiết (Gemini API, Geoapify, Supabase URL & Anon Key).

### 4. Khởi chạy ứng dụng
```bash
npm run dev
```
Mở trình duyệt tại: `http://localhost:3000/`

---

## 🧪 Chạy Kiểm Thử (Unit Tests)

Dự án đi kèm bộ 114 test cases kiểm thử logic cứu hộ, tính giá, định vị GPS, giải mã token và mã hóa dữ liệu:

```bash
# Kiểm tra TypeScript type-safe
npm run lint

# Chạy toàn bộ 114 unit test
npx tsx --test src/**/*.test.ts

# Build bản production
npm run build
```

---

## 📄 Bản Quyền
Dự án được phân phối dưới giấy phép **MIT License**.
