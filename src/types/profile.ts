export interface UserProfileData {
  fullName: string;
  phone: string;
  bikeModel: string;
  licensePlate: string;
  tireType: 'tubeless' | 'tube';
  defaultPayment: 'cash' | 'momo' | 'zalopay' | 'bank_qr';
}

export const PROFILE_STORAGE_KEY = 'motosos_user_profile';
export const SAVED_ADDRESSES_STORAGE_KEY = 'motosos_saved_addresses';
export const EMERGENCY_CONTACT_KEY = 'motosos_emergency_contact';

export const DEFAULT_USER_PROFILE: UserProfileData = {
  fullName: 'Nguyễn Hoàng Nam',
  phone: '+84 908 412 739',
  bikeModel: 'Honda Air Blade 160',
  licensePlate: '59-X2 889.12',
  tireType: 'tubeless',
  defaultPayment: 'momo',
};

export interface SavedAddressItem {
  id: string;
  tag: 'home' | 'work' | 'school' | 'other';
  label: string;
  address: string;
  lat: number;
  lng: number;
}

export const DEFAULT_SAVED_ADDRESSES: SavedAddressItem[] = [
  {
    id: 'addr-home',
    tag: 'home',
    label: 'Nhà riêng',
    address: '63 Đường Lý Tự Trọng, P. Bến Nghé, Quận 1',
    lat: 10.7769,
    lng: 106.7009,
  },
  {
    id: 'addr-work',
    tag: 'work',
    label: 'Công ty',
    address: 'Tòa nhà Bitexco, 2 Hải Triều, P. Bến Nghé, Quận 1',
    lat: 10.7716,
    lng: 106.7044,
  },
  {
    id: 'addr-school',
    tag: 'school',
    label: 'Trường học',
    address: 'Đại học Khoa học Tự nhiên, 227 Nguyễn Văn Cừ, Quận 5',
    lat: 10.7628,
    lng: 106.6825,
  },
];

import { encryptPayload, safeDecryptAndParse } from '../utils/storageCrypto';

export function loadUserProfile(): UserProfileData {
  if (typeof window === 'undefined' || !window.localStorage) return DEFAULT_USER_PROFILE;
  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) {
      saveUserProfile(DEFAULT_USER_PROFILE);
      return DEFAULT_USER_PROFILE;
    }
    const parsed = safeDecryptAndParse<UserProfileData>(raw, DEFAULT_USER_PROFILE);
    return { ...DEFAULT_USER_PROFILE, ...parsed };
  } catch {
    return DEFAULT_USER_PROFILE;
  }
}

export function saveUserProfile(data: UserProfileData): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const encrypted = encryptPayload(JSON.stringify(data));
    window.localStorage.setItem(PROFILE_STORAGE_KEY, encrypted);
  } catch {}
}

export function loadSavedAddresses(): SavedAddressItem[] {
  if (typeof window === 'undefined' || !window.localStorage) return DEFAULT_SAVED_ADDRESSES;
  try {
    const raw = window.localStorage.getItem(SAVED_ADDRESSES_STORAGE_KEY);
    if (!raw) {
      saveSavedAddresses(DEFAULT_SAVED_ADDRESSES);
      return DEFAULT_SAVED_ADDRESSES;
    }
    const parsed = safeDecryptAndParse<SavedAddressItem[]>(raw, DEFAULT_SAVED_ADDRESSES);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SAVED_ADDRESSES;
  } catch {
    return DEFAULT_SAVED_ADDRESSES;
  }
}

export function saveSavedAddresses(list: SavedAddressItem[]): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const encrypted = encryptPayload(JSON.stringify(list));
    window.localStorage.setItem(SAVED_ADDRESSES_STORAGE_KEY, encrypted);
  } catch {}
}
