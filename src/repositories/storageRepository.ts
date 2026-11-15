import {
  DEFAULT_SAVED_ADDRESSES,
  DEFAULT_USER_PROFILE,
  type SavedAddressItem,
  type UserProfileData,
} from '../types/profile';
import type { RescueReceipt } from '../types/rescue';
import { DEFAULT_RESCUE_HISTORY } from '../utils/rescueHistoryLogic';
import { encryptPayload, safeDecryptAndParse } from '../utils/storageCrypto';

export interface IProfileRepository {
  getProfile(): UserProfileData;
  saveProfile(profile: UserProfileData): void;
  getEmergencyContact(): string;
  saveEmergencyContact(phone: string): void;
}

export interface IHistoryRepository {
  getHistory(): RescueReceipt[];
  saveHistory(items: RescueReceipt[]): void;
  addReceipt(item: RescueReceipt): RescueReceipt[];
  getPendingCancelFee(): number;
  savePendingCancelFee(amount: number): void;
}

export interface IAddressRepository {
  getSavedAddresses(): SavedAddressItem[];
  saveAddresses(items: SavedAddressItem[]): void;
}

const STORAGE_KEYS = {
  PROFILE: 'motosos_user_profile',
  HISTORY: 'motosos_rescue_history',
  EMERGENCY_CONTACT: 'motosos_emergency_contact',
  ADDRESSES: 'motosos_saved_addresses',
  CANCEL_FEE: 'motosos_pending_cancel_fee',
} as const;

export class LocalStorageAdapter
  implements IProfileRepository, IHistoryRepository, IAddressRepository
{
  private isStorageAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.localStorage;
  }

  // --- IProfileRepository ---
  getProfile(): UserProfileData {
    if (!this.isStorageAvailable()) return DEFAULT_USER_PROFILE;
    const raw = window.localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) {
      this.saveProfile(DEFAULT_USER_PROFILE);
      return DEFAULT_USER_PROFILE;
    }
    const parsed = safeDecryptAndParse<UserProfileData>(raw, DEFAULT_USER_PROFILE);
    return { ...DEFAULT_USER_PROFILE, ...parsed };
  }

  saveProfile(profile: UserProfileData): void {
    if (!this.isStorageAvailable()) return;
    try {
      const encrypted = encryptPayload(JSON.stringify(profile));
      window.localStorage.setItem(STORAGE_KEYS.PROFILE, encrypted);
    } catch {}
  }

  getEmergencyContact(): string {
    if (!this.isStorageAvailable()) return '+84 912 345 678';
    const raw = window.localStorage.getItem(STORAGE_KEYS.EMERGENCY_CONTACT);
    if (!raw) return '+84 912 345 678';
    return safeDecryptAndParse<string>(raw, raw.replace(/^"|"$/g, ''));
  }

  saveEmergencyContact(phone: string): void {
    if (!this.isStorageAvailable()) return;
    try {
      const encrypted = encryptPayload(JSON.stringify(phone.trim()));
      window.localStorage.setItem(STORAGE_KEYS.EMERGENCY_CONTACT, encrypted);
    } catch {}
  }

  // --- IHistoryRepository ---
  getHistory(): RescueReceipt[] {
    if (!this.isStorageAvailable()) return DEFAULT_RESCUE_HISTORY;
    const raw = window.localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!raw) {
      this.saveHistory(DEFAULT_RESCUE_HISTORY);
      return DEFAULT_RESCUE_HISTORY;
    }
    const parsed = safeDecryptAndParse<RescueReceipt[]>(raw, DEFAULT_RESCUE_HISTORY);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_RESCUE_HISTORY;
  }

  saveHistory(items: RescueReceipt[]): void {
    if (!this.isStorageAvailable()) return;
    try {
      const encrypted = encryptPayload(JSON.stringify(items));
      window.localStorage.setItem(STORAGE_KEYS.HISTORY, encrypted);
    } catch {}
  }

  addReceipt(item: RescueReceipt): RescueReceipt[] {
    const current = this.getHistory();
    const next = [item, ...current];
    this.saveHistory(next);
    return next;
  }

  getPendingCancelFee(): number {
    if (!this.isStorageAvailable()) return 0;
    const raw = window.localStorage.getItem(STORAGE_KEYS.CANCEL_FEE);
    if (!raw) return 0;
    return safeDecryptAndParse<number>(raw, 0);
  }

  savePendingCancelFee(amount: number): void {
    if (!this.isStorageAvailable()) return;
    try {
      const encrypted = encryptPayload(JSON.stringify(Math.max(0, amount)));
      window.localStorage.setItem(STORAGE_KEYS.CANCEL_FEE, encrypted);
    } catch {}
  }

  // --- IAddressRepository ---
  getSavedAddresses(): SavedAddressItem[] {
    if (!this.isStorageAvailable()) return DEFAULT_SAVED_ADDRESSES;
    const raw = window.localStorage.getItem(STORAGE_KEYS.ADDRESSES);
    if (!raw) {
      this.saveAddresses(DEFAULT_SAVED_ADDRESSES);
      return DEFAULT_SAVED_ADDRESSES;
    }
    const parsed = safeDecryptAndParse<SavedAddressItem[]>(raw, DEFAULT_SAVED_ADDRESSES);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SAVED_ADDRESSES;
  }

  saveAddresses(items: SavedAddressItem[]): void {
    if (!this.isStorageAvailable()) return;
    try {
      const encrypted = encryptPayload(JSON.stringify(items));
      window.localStorage.setItem(STORAGE_KEYS.ADDRESSES, encrypted);
    } catch {}
  }
}

// Singleton instances for easy cloud backend substitution (Supabase/Firebase/REST API)
export const profileRepo: IProfileRepository = new LocalStorageAdapter();
export const historyRepo: IHistoryRepository = new LocalStorageAdapter();
export const addressRepo: IAddressRepository = new LocalStorageAdapter();
