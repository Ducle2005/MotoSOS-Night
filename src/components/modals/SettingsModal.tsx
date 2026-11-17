import { Fingerprint, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { getSecuritySettings, normalizePhoneNumber, saveSecuritySettings } from '../../services/authService';
import { EMERGENCY_CONTACT_KEY } from '../../types/profile';
import { GrabToggle } from '../ui/GrabToggle';
import type { BiometricPinMode } from './BiometricPinModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenBiometric: (mode: BiometricPinMode) => void;
}

export function SettingsModal({ isOpen, onClose, onOpenBiometric }: Props) {
  const [sec, setSec] = useState(getSecuritySettings);
  const [faceEnrolled, setFaceEnrolled] = useState(false);
  const [authOnPurchase, setAuthOnPurchase] = useState(false);
  const [autoGps, setAutoGps] = useState(true);
  const [autoSafeNight, setAutoSafeNight] = useState(true);
  const [emergencyPhone, setEmergencyPhone] = useState('0908412739');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneDraft, setPhoneDraft] = useState('');
  const [mapTheme, setMapTheme] = useState<'grab_light' | 'auto_night'>('auto_night');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return;
    const reload = () => {
      setSec(getSecuritySettings());
      setFaceEnrolled(localStorage.getItem('motosos_face_enrolled') === 'true');
      setAuthOnPurchase(localStorage.getItem('motosos_auth_on_purchase') === 'true');
      setAutoGps(localStorage.getItem('motosos_auto_send_gps') !== 'false');
      setAutoSafeNight(localStorage.getItem('motosos_auto_safe_night') !== 'false');
      const p = localStorage.getItem(EMERGENCY_CONTACT_KEY) || '0908412739';
      setEmergencyPhone(p); setPhoneDraft(p);
      setMapTheme((localStorage.getItem('motosos_map_theme') as any) || 'auto_night');
    };
    reload();
    window.addEventListener('motosos_auth_changed', reload);
    return () => window.removeEventListener('motosos_auth_changed', reload);
  }, [isOpen]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleToggleFace = (enabled: boolean) => {
    const updated = { ...sec, isBiometricEnabled: enabled };
    saveSecuritySettings(updated);
    setSec(updated);
  };

  const handleDisablePin = () => {
    const updated = { ...sec, pinCode: null };
    saveSecuritySettings(updated);
    setSec(updated);
    localStorage.removeItem('motosos_security_pin');
    showToast('Đã tắt mã PIN bảo mật');
  };

  const handleSavePhone = () => {
    const norm = normalizePhoneNumber(phoneDraft);
    if (norm.length >= 10) {
      setEmergencyPhone(norm);
      localStorage.setItem(EMERGENCY_CONTACT_KEY, norm);
      setIsEditingPhone(false);
      showToast('Đã cập nhật số điện thoại khẩn cấp');
    }
  };

  const handleClearCache = () => {
    try {
      const keysToKeep = ['motosos_users_db', 'motosos_current_user', 'motosos_auth_security', 'motosos_security_pin', 'motosos_active_membership', 'motosos_purchased_memberships', 'motosos_user_profile'];
      const preserved: Record<string, string> = {};
      keysToKeep.forEach((k) => { const v = localStorage.getItem(k); if (v) preserved[k] = v; });
      sessionStorage.clear();
      showToast('Đã dọn dẹp bộ nhớ đệm tạm thành công!');
    } catch { showToast('Đã dọn cache'); }
  };

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[999] bg-slate-950/60 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-[430px] max-h-[90vh] bg-white rounded-t-[26px] sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
        <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-slate-100">
          <h2 className="text-lg font-black text-slate-950 tracking-tight">Cài đặt</h2>
          <button type="button" onClick={onClose} aria-label="Đóng" className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
            <X className="h-4 w-4" />
          </button>
        </div>

        {toastMsg && (
          <div className="mx-5 mt-2.5 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-[#13693E] text-center animate-in fade-in">
            {toastMsg}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-5 space-y-5 [&::-webkit-scrollbar]:hidden">
          {/* Nhóm 1: Bảo mật & Đăng nhập */}
          <section className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Bảo mật &amp; Đăng nhập (Grab Security)</h3>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl p-3 bg-slate-50/50 space-y-1">
              <div className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-xs font-bold text-slate-800">Xác thực khuôn mặt (Face ID)</p>
                  <p className="text-[11px] text-slate-500">{faceEnrolled ? 'Đã kích hoạt cảm biến' : 'Chưa quét khuôn mặt'}</p>
                </div>
                <GrabToggle checked={sec.isBiometricEnabled} onChange={(next) => (next && !faceEnrolled ? onOpenBiometric('face') : handleToggleFace(next))} />
              </div>
              <div className="flex items-center justify-between pt-2">
                <button type="button" onClick={() => onOpenBiometric('face')} className="text-xs font-bold text-[#13693E] hover:underline flex items-center gap-1">
                  <Fingerprint className="h-3.5 w-3.5" /><span>Quét lại / Kiểm tra khuôn mặt</span>
                </button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-xs font-bold text-slate-800">Mã PIN bảo mật 6 số</p>
                  <p className="text-[11px] text-slate-500">{sec.pinCode ? 'Đã bật mã PIN 6 số' : 'Chưa đặt mã PIN'}</p>
                </div>
                <div className="flex gap-2">
                  {sec.pinCode ? (
                    <>
                      <button type="button" onClick={() => onOpenBiometric('pin_change')} className="text-xs font-bold text-[#13693E] px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200">Đổi PIN</button>
                      <button type="button" onClick={handleDisablePin} className="text-xs font-bold text-rose-600 px-2 py-1 rounded-lg bg-rose-50 border border-rose-200">Tắt</button>
                    </>
                  ) : (
                    <button type="button" onClick={() => onOpenBiometric('pin_setup')} className="text-xs font-bold text-white px-3 py-1 rounded-lg bg-[#13693E]">Đặt mã PIN</button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-xs font-bold text-slate-800">Xác thực khi mua gói hội viên</p>
                  <p className="text-[11px] text-slate-500">Yêu cầu PIN/Face ID trước khi thanh toán</p>
                </div>
                <GrabToggle checked={authOnPurchase} onChange={(next) => { setAuthOnPurchase(next); localStorage.setItem('motosos_auth_on_purchase', String(next)); }} />
              </div>
            </div>
          </section>

          {/* Nhóm 2: An toàn & Cứu hộ tự động */}
          <section className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">An toàn &amp; Cứu hộ tự động</h3>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl p-3 bg-slate-50/50 space-y-1">
              <div className="flex items-center justify-between py-2.5">
                <div className="pr-2">
                  <p className="text-xs font-bold text-slate-800">Tự động gửi GPS cho người thân</p>
                  <p className="text-[11px] text-slate-500">Đính kèm tọa độ khi kích hoạt cứu hộ khẩn cấp</p>
                </div>
                <GrabToggle checked={autoGps} onChange={(next) => { setAutoGps(next); localStorage.setItem('motosos_auto_send_gps', String(next)); }} />
              </div>

              <div className="flex items-center justify-between py-2.5">
                <div className="pr-2">
                  <p className="text-xs font-bold text-slate-800">Ưu tiên Trạm An Toàn đêm (22h–05h)</p>
                  <p className="text-[11px] text-slate-500">Gợi ý địa điểm có bảo vệ và ánh sáng an toàn</p>
                </div>
                <GrabToggle checked={autoSafeNight} onChange={(next) => { setAutoSafeNight(next); localStorage.setItem('motosos_auto_safe_night', String(next)); }} />
              </div>

              <div className="py-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Số điện thoại khẩn cấp mặc định</p>
                    <p className="text-[11px] text-slate-500 font-mono">{emergencyPhone}</p>
                  </div>
                  <button type="button" onClick={() => setIsEditingPhone(!isEditingPhone)} className="text-xs font-bold text-[#13693E] hover:underline">
                    {isEditingPhone ? 'Đóng' : 'Chỉnh sửa'}
                  </button>
                </div>
                {isEditingPhone && (
                  <div className="mt-2 flex gap-2">
                    <input type="tel" value={phoneDraft} onChange={(e) => setPhoneDraft(e.target.value)} className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold" placeholder="090 123 4567" />
                    <button type="button" onClick={handleSavePhone} className="px-3 py-1.5 rounded-xl bg-[#13693E] text-white text-xs font-bold">Lưu</button>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Nhóm 3: Giao diện & Ứng dụng */}
          <section className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Giao diện &amp; Ứng dụng</h3>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl p-3 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-xs font-bold text-slate-800">Chế độ hiển thị bản đồ</p>
                  <p className="text-[11px] text-slate-500">{mapTheme === 'grab_light' ? 'Sáng chuẩn Grab' : 'Tự động theo giờ đêm'}</p>
                </div>
                <div className="flex rounded-xl bg-slate-200 p-0.5 text-xs font-bold">
                  <button type="button" onClick={() => { setMapTheme('grab_light'); localStorage.setItem('motosos_map_theme', 'grab_light'); }} className={`px-2.5 py-1 rounded-lg ${mapTheme === 'grab_light' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'}`}>Sáng</button>
                  <button type="button" onClick={() => { setMapTheme('auto_night'); localStorage.setItem('motosos_map_theme', 'auto_night'); }} className={`px-2.5 py-1 rounded-lg ${mapTheme === 'auto_night' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'}`}>Tự động</button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <p className="text-xs font-bold text-slate-800">Xóa bộ nhớ đệm tạm (Clear Cache)</p>
                  <p className="text-[11px] text-slate-500">Dọn cache tuyến đường và tìm kiếm tạm</p>
                </div>
                <button type="button" onClick={handleClearCache} className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1 shadow-2xs">
                  <Trash2 className="h-3.5 w-3.5 text-slate-500" /><span>Dọn cache</span>
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>,
    document.body
  );
}
export default SettingsModal;
