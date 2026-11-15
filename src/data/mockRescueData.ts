import type {
  GeoCoord,
  IssueOption,
  MechanicInfo,
  RescueActivityItem,
  SafeStation,
  UserLocation,
  VoucherOption,
} from '../types/rescue';

export const DEFAULT_HCMC_COORD: GeoCoord = {
  lat: 10.7769,
  lng: 106.7009,
};

export const FALLBACK_USER_LOCATION: UserLocation = {
  address: 'Trung tâm Quận 1, TP. Hồ Chí Minh',
  district: 'Quận 1, TP.HCM',
  coord: DEFAULT_HCMC_COORD,
  source: 'fallback',
};

export const MOCK_SAFE_STATIONS: SafeStation[] = [
  {
    id: 'mock-station-circle-k',
    name: 'Circle K Lê Thánh Tôn',
    category: 'convenience',
    categoryLabel: 'Cửa hàng tiện lợi 24/7',
    address: '84 Lê Thánh Tôn, P. Bến Nghé, Quận 1',
    walkingDistanceMeters: 185,
    walkingMinutes: 2,
    openHours: 'Mở cửa 24/7',
    amenities: ['Đèn sáng', 'Camera an ninh', 'Ghế ngồi chờ'],
    coord: { lat: 10.7782, lng: 106.7021 },
  },
  {
    id: 'mock-station-familymart',
    name: 'FamilyMart Pasteur',
    category: 'convenience',
    categoryLabel: 'Cửa hàng tiện lợi 24/7',
    address: '158 Pasteur, P. Bến Nghé, Quận 1',
    walkingDistanceMeters: 320,
    walkingMinutes: 4,
    openHours: 'Mở cửa 24/7',
    amenities: ['Đèn sáng', 'Camera an ninh', 'Nước uống'],
    coord: { lat: 10.7796, lng: 106.6994 },
  },
  {
    id: 'mock-station-petrolimex',
    name: 'Cây xăng Petrolimex Hàm Nghi',
    category: 'gas_station',
    categoryLabel: 'Cây xăng 24/7',
    address: '136 Hàm Nghi, P. Bến Thành, Quận 1',
    walkingDistanceMeters: 410,
    walkingMinutes: 5,
    openHours: 'Mở cửa 24/7',
    amenities: ['Trực ban đêm', 'Khu vực thoáng', 'Có mái che'],
    coord: { lat: 10.7718, lng: 106.6991 },
  },
  {
    id: 'mock-station-police',
    name: 'Công an Phường Bến Nghé',
    category: 'police',
    categoryLabel: 'Trực ban 24/7',
    address: '27 Nguyễn Trung Trực, P. Bến Nghé, Quận 1',
    walkingDistanceMeters: 530,
    walkingMinutes: 7,
    openHours: 'Trực ban 24/7',
    amenities: ['An ninh tối đa', 'Bãi đỗ an toàn', 'Hỗ trợ khẩn cấp'],
    coord: { lat: 10.7751, lng: 106.6968 },
  },
];

export const ISSUE_OPTIONS: IssueOption[] = [
  {
    id: 'flat_tire',
    label: 'Lủng lốp',
    subtitle: 'Vá ép tiêu chuẩn tận nơi',
    fixedPrice: 85000,
  },
  {
    id: 'engine_dead',
    label: 'Chết máy',
    subtitle: 'Kiểm tra bugi, hệ thống đánh lửa',
    fixedPrice: 120000,
  },
  {
    id: 'out_of_fuel',
    label: 'Hết xăng',
    subtitle: 'Trọn gói công giao + 2L xăng RON 95',
    fixedPrice: 80000,
  },
  {
    id: 'battery_jump',
    label: 'Kích bình',
    subtitle: 'Kích bình ắc quy & kiểm tra sạc',
    fixedPrice: 90000,
  },
  {
    id: 'other',
    label: 'Sự cố khác',
    subtitle: 'Phí thợ tới kiểm tra & báo giá tại chỗ',
    fixedPrice: 50000,
  },
];

export const VOUCHER_OPTIONS: VoucherOption[] = [
  {
    id: 'ANTOAN20',
    code: 'ANTOAN20',
    title: 'Giảm 20.000đ',
    description: 'Áp dụng khi chọn điểm chờ tại Trạm An Toàn 24/7',
    discountAmount: 20000,
    requiresSafeStation: true,
  },
  {
    id: 'DEMKHUYA15',
    code: 'DEMKHUYA15',
    title: 'Giảm 15.000đ',
    description: 'Áp dụng cho mọi đơn cứu hộ đêm',
    discountAmount: 15000,
    requiresSafeStation: false,
  },
  {
    id: 'BANMOI25',
    code: 'BANMOI25',
    title: 'Giảm 25.000đ',
    description: 'Ưu đãi thành viên mới MotoSOS',
    discountAmount: 25000,
    requiresSafeStation: false,
  },
];

export const QUICK_CHAT_SUGGESTIONS: string[] = [
  'Mình đang đứng ở Trạm An Toàn sáng đèn',
  'Xe mình dựng ngay trước cửa',
  'Bạn chạy tới gần chưa?',
];

export const MOCK_MECHANIC: MechanicInfo = {
  id: 'mech-nguyen-minh-tuan',
  name: 'Nguyễn Minh Tuấn',
  phone: '0909 888 999',
  licensePlate: '59-P2 842.19',
  vehicleModel: 'Honda Winner X · Đồ nghề đầy đủ',
  rating: 4.9,
  completedRescues: 318,
  etaMinutes: 6,
  distanceKm: 1.3,
  coord: { lat: 10.7687, lng: 106.7094 },
};

export const SAFETY_BANNER_SLIDES = [
  {
    id: 'safe-station',
    badge: 'Khuyến nghị an toàn 24/7',
    title: 'Đêm khuya xe hỏng? Dắt xe tới Trạm An Toàn gần nhất để chờ thợ',
    cta: 'Xem tuyến đi bộ',
  },
  {
    id: 'transparent-price',
    badge: 'Minh bạch chi phí',
    title: 'Thợ MotoSOS luôn báo giá trọn gói trước khi sửa, không phụ thu ẩn',
    cta: 'Gọi cứu hộ ngay',
  },
  {
    id: 'night-escort',
    badge: 'Giám sát hành trình',
    title: 'Theo dõi vị trí thợ theo thời gian thực và xác nhận biển số khi đón',
    cta: 'Mở bản đồ trực tuyến',
  },
];

export const INITIAL_ACTIVITY_HISTORY: RescueActivityItem[] = [
  {
    id: 'act-101',
    issueLabel: 'Lủng lốp',
    pickupAddress: 'Circle K · 84 Lê Thánh Tôn, Quận 1',
    mechanicName: 'Trần Văn Hùng',
    licensePlate: '59-H1 612.88',
    timestampLabel: '23:15 · Hôm qua',
    priceLabel: '65.000đ',
    status: 'completed',
  },
  {
    id: 'act-102',
    issueLabel: 'Kích bình',
    pickupAddress: 'Petrolimex Hàm Nghi, Quận 1',
    mechanicName: 'Nguyễn Minh Tuấn',
    licensePlate: '59-P2 842.19',
    timestampLabel: '21:40 · 3 ngày trước',
    priceLabel: '75.000đ',
    status: 'completed',
  },
];

export const EMERGENCY_CONTACTS = [
  { label: 'Tổng đài MotoSOS 24/7', phone: '1900 636 812', note: 'Hỗ trợ điều phối khẩn cấp' },
  { label: 'Cảnh sát 113', phone: '113', note: 'Khẩn cấp an ninh trật tự' },
  { label: 'Cấp cứu 115', phone: '115', note: 'Hỗ trợ y tế khẩn cấp' },
];
