import { encryptPayload, safeDecryptAndParse } from '../utils/storageCrypto';
import { saveUserProfile } from '../types/profile';

export interface AuthUser {
  id: string; phone: string; fullName: string; bikeModel: string; licensePlate: string;
  tireType?: 'tubeless' | 'tube'; isGuest?: boolean; vouchers?: string[]; createdAt: number;
}
export interface SecuritySettings { isBiometricEnabled: boolean; pinCode: string | null; }

const DB_KEY = 'motosos_users_db';
const CURRENT_USER_KEY = 'motosos_current_user';
const SECURITY_KEY = 'motosos_auth_security';
const OTP_KEY = 'motosos_temp_otp';
const DEMO_OTP = '482910';

export function normalizePhoneNumber(raw: string): string {
  let clean = raw.replace(/[^\d+]/g, '');
  if (clean.startsWith('+84')) clean = '0' + clean.slice(3);
  else if (clean.startsWith('84') && clean.length >= 11) clean = '0' + clean.slice(2);
  else if (clean.length === 9 && !clean.startsWith('0')) clean = '0' + clean;
  return clean;
}

const SEED_USERS: Record<string, AuthUser> = {
  '0908412739': {
    id: 'usr_seed_01', phone: '0908412739', fullName: 'Nguyễn Hoàng Nam',
    bikeModel: 'Honda Air Blade 160', licensePlate: '59-X2 889.12',
    tireType: 'tubeless', vouchers: ['BANMOI25', 'ANTOAN20'], createdAt: 1700000000000,
  },
};

let memoryDb: Record<string, AuthUser> = { ...SEED_USERS };
let memoryCurrentUser: AuthUser | null = null;
let memorySecurity: SecuritySettings = { isBiometricEnabled: true, pinCode: '123456' };

export function getUsersDb(): Record<string, AuthUser> {
  if (typeof window === 'undefined') return memoryDb;
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) {
    localStorage.setItem(DB_KEY, encryptPayload(JSON.stringify(SEED_USERS)));
    return { ...SEED_USERS };
  }
  return safeDecryptAndParse<Record<string, AuthUser>>(raw, SEED_USERS);
}

function saveUsersDb(db: Record<string, AuthUser>): void {
  memoryDb = db;
  if (typeof window !== 'undefined') localStorage.setItem(DB_KEY, encryptPayload(JSON.stringify(db)));
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === 'undefined') return memoryCurrentUser;
  const raw = localStorage.getItem(CURRENT_USER_KEY);
  if (!raw) return null;
  return safeDecryptAndParse<AuthUser | null>(raw, null);
}

function setCurrentSession(user: AuthUser): void {
  memoryCurrentUser = user;
  if (typeof window === 'undefined') return;
  localStorage.setItem(CURRENT_USER_KEY, encryptPayload(JSON.stringify(user)));
  saveUserProfile({
    fullName: user.fullName, phone: user.phone, bikeModel: user.bikeModel,
    licensePlate: user.licensePlate, tireType: user.tireType || 'tubeless', defaultPayment: 'momo',
  });
  window.dispatchEvent(new CustomEvent('motosos_auth_changed', { detail: user }));
}

export function checkPhoneExists(phone: string): boolean {
  const norm = normalizePhoneNumber(phone);
  return Boolean(getUsersDb()[norm]);
}

export function generateMockOtp(phone: string): string {
  const norm = normalizePhoneNumber(phone);
  const code = norm === '0908412739' ? DEMO_OTP : String(Math.floor(100000 + Math.random() * 900000));
  if (typeof window !== 'undefined') {
    const payload = { phone: norm, code, expiresAt: Date.now() + 60_000 };
    sessionStorage.setItem(OTP_KEY, JSON.stringify(payload));
  }
  return code;
}

export function verifyOtpAndLogin(phone: string, otp: string): { success: boolean; isNewUser: boolean; user?: AuthUser; message?: string } {
  const norm = normalizePhoneNumber(phone);
  const cleanOtp = otp.trim();
  let storedOtp: { phone: string; code: string; expiresAt: number } | null = null;
  if (typeof window !== 'undefined') {
    try { storedOtp = JSON.parse(sessionStorage.getItem(OTP_KEY) || 'null'); } catch {}
  }
  const isMatch = cleanOtp === DEMO_OTP || (storedOtp && storedOtp.phone === norm && storedOtp.code === cleanOtp);
  if (!isMatch) return { success: false, isNewUser: false, message: 'Mã OTP không chính xác. Hãy nhập mã gợi ý hoặc thử lại.' };
  if (storedOtp && storedOtp.code === cleanOtp && Date.now() > storedOtp.expiresAt && cleanOtp !== DEMO_OTP) {
    return { success: false, isNewUser: false, message: 'Mã OTP đã hết hạn (60s). Vui lòng gửi lại mã.' };
  }
  const db = getUsersDb();
  const existing = db[norm];
  if (existing) {
    setCurrentSession(existing);
    return { success: true, isNewUser: false, user: existing };
  }
  return { success: true, isNewUser: true };
}

export function completeRegistration(data: { phone: string; fullName: string; bikeModel: string; licensePlate: string }): AuthUser {
  const norm = normalizePhoneNumber(data.phone);
  const db = getUsersDb();
  const newUser: AuthUser = {
    id: `usr_${Date.now()}`, phone: norm, fullName: data.fullName.trim() || 'Người dùng MotoSOS',
    bikeModel: data.bikeModel.trim() || 'Xe tay ga', licensePlate: data.licensePlate.trim().toUpperCase() || '59-X1 888.99',
    tireType: 'tubeless', vouchers: ['BANMOI25', 'ANTOAN20'], createdAt: Date.now(),
  };
  db[norm] = newUser;
  saveUsersDb(db);
  setCurrentSession(newUser);
  return newUser;
}

export function loginWithGoogleDemo(): AuthUser {
  const googleUser: AuthUser = {
    id: 'usr_google_demo', phone: '0908123456', fullName: 'Lê Việt Đức',
    bikeModel: 'Honda SH 150i', licensePlate: '59-A1 999.88',
    tireType: 'tubeless', vouchers: ['BANMOI25', 'ANTOAN20'], createdAt: Date.now(),
  };
  const db = getUsersDb();
  db['0908123456'] = googleUser;
  saveUsersDb(db);
  setCurrentSession(googleUser);
  return googleUser;
}

export function loginAsGuest(): AuthUser {
  const guestUser: AuthUser = {
    id: 'usr_guest', phone: '0900000000', fullName: 'Khách Trải Nghiệm',
    bikeModel: 'Xe tay ga', licensePlate: 'Chưa đăng ký', isGuest: true,
    tireType: 'tubeless', vouchers: ['BANMOI25'], createdAt: Date.now(),
  };
  setCurrentSession(guestUser);
  return guestUser;
}

export function logoutUser(): void {
  memoryCurrentUser = null;
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CURRENT_USER_KEY);
  window.dispatchEvent(new CustomEvent('motosos_auth_changed', { detail: null }));
}

export function getSecuritySettings(): SecuritySettings {
  if (typeof window === 'undefined') return memorySecurity;
  const raw = localStorage.getItem(SECURITY_KEY);
  return safeDecryptAndParse<SecuritySettings>(raw, memorySecurity);
}

export function saveSecuritySettings(settings: SecuritySettings): void {
  memorySecurity = settings;
  if (typeof window !== 'undefined') {
    localStorage.setItem(SECURITY_KEY, encryptPayload(JSON.stringify(settings)));
    window.dispatchEvent(new CustomEvent('motosos_auth_changed', { detail: getCurrentUser() }));
  }
}

export function verifySecurityPin(pin: string): boolean {
  const s = getSecuritySettings();
  return s.pinCode === pin.trim();
}

export function quickUnlockWithSecurity(): AuthUser | null {
  const lastUser = getCurrentUser() || getUsersDb()['0908412739'] || null;
  if (lastUser) setCurrentSession(lastUser);
  return lastUser;
}
