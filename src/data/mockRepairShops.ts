import type { GeoCoord } from '../types/rescue';

export interface MockRepairShopSeed {
  id: string;
  name: string;
  address: string;
  phone: string;
  openingHoursRaw: string | null;
  coord: GeoCoord;
}

export const MOCK_REPAIR_SHOPS_SEED: MockRepairShopSeed[] = [
  {
    id: 'shop-anh-tuan-247',
    name: 'Tiệm Sửa Xe Anh Tuấn 24/7',
    address: '42 Lý Tự Trọng, Q.1',
    phone: '0903 712 458',
    openingHoursRaw: '24/7',
    coord: { lat: 10.7779, lng: 106.7029 },
  },
  {
    id: 'shop-minh-phat-dem',
    name: 'Cứu Hộ & Sửa Xe Minh Phát',
    address: '118 Pasteur, Q.1',
    phone: '0938 645 219',
    openingHoursRaw: '24/7',
    coord: { lat: 10.7791, lng: 106.6982 },
  },
  {
    id: 'shop-hong-phuc',
    name: 'Sửa Xe Tay Ga Hồng Phúc',
    address: '65 Nguyễn Du, Q.1',
    phone: '0918 334 890',
    openingHoursRaw: null,
    coord: { lat: 10.7785, lng: 106.6976 },
  },
  {
    id: 'shop-thanh-dat-day',
    name: 'Tiệm Sửa Xe Thành Đạt',
    address: '214 Hai Bà Trưng, Q.1',
    phone: '0909 551 204',
    openingHoursRaw: 'Mo-Su 07:00-21:30',
    coord: { lat: 10.7834, lng: 106.6974 },
  },
  {
    id: 'shop-quoc-bao-day',
    name: 'Head & Sửa Xe Quốc Bảo',
    address: '91 Lê Lợi, Q.1',
    phone: '0902 889 112',
    openingHoursRaw: 'Mo-Sa 07:30-20:00',
    coord: { lat: 10.7734, lng: 106.6997 },
  },
];
