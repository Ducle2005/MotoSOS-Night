import { ChevronRight, Fingerprint, KeyRound, Shield, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';
import {
  type AuthUser,
  generateMockOtp,
  getSecuritySettings,
  loginAsGuest,
  loginWithGoogleDemo,
  normalizePhoneNumber,
  quickUnlockWithSecurity,
  verifySecurityPin,
} from '../../services/authService';
import { OtpAndProfileStep } from './OtpAndProfileStep';

interface AuthScreenProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export function AuthScreen({ onLoginSuccess }: AuthScreenProps) {
  const [phone, setPhone] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const security = getSecuritySettings();
  const rawDigits = phone.replace(/\D/g, '');
  const isValidPhone = rawDigits.length >= 9 && rawDigits.length <= 11;

  const handleContinueWithPhone = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isValidPhone) return;
    const norm = normalizePhoneNumber(phone);
    generateMockOtp(norm);
    setShowOtp(true);
  };

  const handleUnlockSecurity = () => {
    if (security.isBiometricEnabled) {
      const u = quickUnlockWithSecurity();
      if (u) onLoginSuccess(u);
    } else setShowPinModal(true);
  };

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifySecurityPin(pinInput)) {
      setShowPinModal(false);
      const u = quickUnlockWithSecurity();
      if (u) onLoginSuccess(u);
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  if (showOtp) {
    return (
      <div className="min-h-[100dvh] w-full max-w-[430px] mx-auto bg-white shadow-2xl">
        <OtpAndProfileStep
          phone={normalizePhoneNumber(phone)}
          onBack={() => setShowOtp(false)}
          onSuccess={onLoginSuccess}
        />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] w-full max-w-[430px] mx-auto bg-white flex flex-col justify-between overflow-y-auto [&::-webkit-scrollbar]:hidden">
      {/* 1. Phần trên (Hero Brand Header) */}
      <section className="bg-gradient-to-b from-[#E6F4EC] via-[#F4FBF7] to-white pt-10 pb-6 px-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-[#13693E] text-white shadow-md shadow-emerald-800/20">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#13693E]">MotoSOS 24/7</span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sẵn sàng cứu hộ đêm</span>
            </div>
          </div>
        </div>
        <h1 className="text-[24px] font-extrabold text-slate-950 tracking-tight leading-tight">
          Cứu hộ xe máy 24/7<br />trong tầm tay
        </h1>
        <p className="mt-2 text-[13px] font-medium text-slate-600">
          Có mặt sau 15 phút • Minh bạch giá chuẩn Grab
        </p>
      </section>

      {/* 2. Phần giữa (Khung nhập Số điện thoại thông minh) */}
      <section className="px-6 py-2 space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">Số điện thoại của bạn</label>
          <div className="rounded-2xl border-2 border-slate-200 focus-within:border-[#13693E] p-1.5 flex items-center gap-2 transition-all bg-white shadow-xs">
            <div className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 font-bold text-slate-800 text-sm shrink-0">
              <span className="flex h-3.5 w-5 overflow-hidden rounded-[2px] bg-[#DA251D] items-center justify-center text-[9px] text-[#FFFF00]">★</span>
              <span>+84</span>
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="090 412 739"
              className="flex-1 text-[16px] font-bold text-slate-900 tracking-wide tabular-nums outline-none placeholder:text-slate-400 placeholder:font-normal"
            />
            {phone && (
              <button type="button" onClick={() => setPhone('')} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <button
          type="button"
          disabled={!isValidPhone}
          onClick={handleContinueWithPhone}
          className="w-full py-3.5 rounded-2xl bg-[#13693E] hover:bg-[#0F5C36] disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold text-[14.5px] transition-all active:scale-[0.99] shadow-md shadow-emerald-900/10 flex items-center justify-center gap-2"
        >
          <span>Tiếp tục</span>
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Mở khóa nhanh bằng Sinh trắc học / PIN */}
        {(security.isBiometricEnabled || security.pinCode) && (
          <button
            type="button"
            onClick={handleUnlockSecurity}
            className="w-full py-2.5 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
          >
            {security.isBiometricEnabled ? <Fingerprint className="h-4 w-4 text-[#13693E]" /> : <KeyRound className="h-4 w-4 text-[#13693E]" />}
            <span>Mở khóa bằng {security.isBiometricEnabled ? 'Face ID / Vân tay' : 'Mã PIN 6 số'}</span>
          </button>
        )}
      </section>

      {/* 3. Phần dưới (Tùy chọn đăng nhập nhanh & Điều khoản) */}
      <section className="px-6 pb-6 pt-2 space-y-3">
        <div className="relative flex items-center justify-center my-1">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider absolute">hoặc tiếp tục với</span>
        </div>

        {/* Google Demo Login */}
        <button
          type="button"
          onClick={() => onLoginSuccess(loginWithGoogleDemo())}
          className="w-full py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-[13px] flex items-center justify-center gap-2.5 transition-all active:scale-[0.99] shadow-2xs"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Tiếp tục với tài khoản Google</span>
        </button>

        {/* Guest Mode */}
        <button
          type="button"
          onClick={() => onLoginSuccess(loginAsGuest())}
          className="w-full py-2 text-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          Trải nghiệm trước không cần đăng nhập (Chế độ Khách)
        </button>

        <p className="pt-2 text-center text-[10.5px] leading-relaxed text-slate-400">
          Bằng việc tiếp tục, bạn đồng ý với <span className="underline text-slate-600">Điều khoản dịch vụ</span> &amp; <span className="underline text-slate-600">Chính sách bảo mật</span> cứu hộ MotoSOS.
        </p>
      </section>

      {/* Modal nhập PIN dự phòng */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <form onSubmit={handleVerifyPin} className="w-full max-w-xs bg-white rounded-2xl p-5 shadow-2xl text-center space-y-3">
            <h3 className="text-base font-extrabold text-slate-900">Nhập mã PIN 6 số</h3>
            <p className="text-xs text-slate-500">Mã PIN mặc định: 123456</p>
            <input
              type="password"
              maxLength={6}
              autoFocus
              value={pinInput}
              onChange={(e) => { setPinInput(e.target.value.replace(/\D/g, '')); setPinError(false); }}
              className="w-full text-center tracking-widest text-2xl font-bold py-2 rounded-xl border-2 border-slate-200 focus:border-[#13693E] outline-none"
            />
            {pinError && <p className="text-xs font-bold text-rose-600">Mã PIN không đúng, hãy thử lại</p>}
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setShowPinModal(false)} className="flex-1 py-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-700">Hủy</button>
              <button type="submit" disabled={pinInput.length !== 6} className="flex-1 py-2 rounded-xl bg-[#13693E] text-xs font-bold text-white disabled:opacity-50">Xác nhận</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
export default AuthScreen;
