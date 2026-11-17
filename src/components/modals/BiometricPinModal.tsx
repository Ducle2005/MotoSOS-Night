import { Camera, Check, Delete, RefreshCw, ShieldCheck, VideoOff, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { getSecuritySettings, saveSecuritySettings } from '../../services/authService';

export type BiometricPinMode = 'face' | 'pin_setup' | 'pin_change' | 'pin_verify';
interface Props { isOpen: boolean; mode: BiometricPinMode; onClose: () => void; onSuccess?: () => void; }

export function BiometricPinModal({ isOpen, mode, onClose, onSuccess }: Props) {
  const [pin, setPin] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [pinStep, setPinStep] = useState(mode === 'pin_change' ? 0 : 1);
  const [pinError, setPinError] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [cameraError, setCameraError] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = () => {
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
  };

  const startCamera = async () => {
    setCameraError(false); setScanProgress(0);
    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) throw new Error();
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      streamRef.current = s;
      if (videoRef.current) videoRef.current.srcObject = s;
      runScanSimulation();
    } catch { setCameraError(true); }
  };

  const runScanSimulation = () => {
    setScanProgress(0);
    const t = setInterval(() => {
      setScanProgress((p) => {
        if (p >= 100) { clearInterval(t); completeFaceScan(); return 100; }
        return p + 5;
      });
    }, 120);
  };

  const completeFaceScan = () => {
    stopCamera(); setScanSuccess(true);
    if (typeof window !== 'undefined') localStorage.setItem('motosos_face_enrolled', 'true');
    saveSecuritySettings({ ...getSecuritySettings(), isBiometricEnabled: true });
    setTimeout(() => { setScanSuccess(false); onSuccess?.(); onClose(); }, 700);
  };

  useEffect(() => {
    if (!isOpen) { stopCamera(); return; }
    if (mode === 'face') startCamera();
    else { setPin(''); setFirstPin(''); setPinError(null); setPinStep(mode === 'pin_change' ? 0 : 1); }
    return () => stopCamera();
  }, [isOpen, mode]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isOpen || mode === 'face') return;
      if (e.key >= '0' && e.key <= '9') handlePinDigit(e.key);
      else if (e.key === 'Backspace') setPin((p) => p.slice(0, -1));
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, mode, pin, pinStep, firstPin]);

  if (!isOpen || typeof document === 'undefined') return null;

  const handlePinDigit = (d: string) => {
    if (pin.length >= 6) return;
    const next = pin + d; setPin(next); setPinError(null);
    if (next.length === 6) processPin(next);
  };

  const processPin = (entered: string) => {
    const sec = getSecuritySettings();
    const stored = sec.pinCode || (typeof window !== 'undefined' ? localStorage.getItem('motosos_security_pin') : null) || '123456';
    if (mode === 'pin_verify') {
      if (entered === stored) { onSuccess?.(); onClose(); }
      else { setPinError('Mã PIN không đúng, hãy thử lại'); setPin(''); }
      return;
    }
    if (mode === 'pin_change' && pinStep === 0) {
      if (entered === stored) { setPinStep(1); setPin(''); }
      else { setPinError('Mã PIN cũ không chính xác'); setPin(''); }
      return;
    }
    if (pinStep === 1) { setFirstPin(entered); setPinStep(2); setPin(''); return; }
    if (pinStep === 2) {
      if (entered === firstPin) {
        saveSecuritySettings({ ...sec, pinCode: entered });
        if (typeof window !== 'undefined') localStorage.setItem('motosos_security_pin', entered);
        onSuccess?.(); onClose();
      } else {
        setPinError('Mã PIN xác nhận không khớp'); setPin(''); setFirstPin(''); setPinStep(1);
      }
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[1100] bg-slate-950/70 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-[360px] bg-white rounded-3xl p-6 shadow-2xl relative flex flex-col items-center">
        <button type="button" onClick={() => { stopCamera(); onClose(); }} aria-label="Đóng" className="absolute top-4 right-4 h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
          <X className="h-4 w-4" />
        </button>

        {mode === 'face' ? (
          <div className="w-full flex flex-col items-center text-center">
            <h3 className="text-base font-extrabold text-slate-900 mb-1">Xác thực khuôn mặt (Face ID)</h3>
            <p className="text-xs text-slate-500 mb-5">Giữ gương mặt thẳng với vòng quét sinh trắc học</p>
            <div className="w-52 h-52 rounded-full overflow-hidden border-4 border-[#13693E] relative bg-slate-950 flex items-center justify-center shadow-lg">
              {cameraError ? (
                <div className="flex flex-col items-center p-4 text-slate-300">
                  <VideoOff className="h-8 w-8 text-amber-400 mb-2" /><p className="text-xs font-semibold">Không tìm thấy Camera</p>
                </div>
              ) : (<video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />)}
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34D399] animate-bounce" style={{ top: `${scanProgress}%` }} />
              {scanSuccess && (
                <div className="absolute inset-0 bg-[#13693E]/85 flex flex-col items-center justify-center text-white animate-in zoom-in duration-150">
                  <Check className="h-12 w-12" /><span className="text-xs font-bold mt-1">Đã khớp khuôn mặt!</span>
                </div>
              )}
            </div>
            <div className="w-48 mt-4">
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#13693E] transition-all duration-100 rounded-full" style={{ width: `${scanProgress}%` }} />
              </div>
              <p className="text-[11px] font-bold text-slate-500 mt-1">{scanProgress}%</p>
            </div>
            {cameraError && (
              <div className="mt-3 flex gap-2 w-full">
                <button type="button" onClick={startCamera} className="flex-1 py-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 flex items-center justify-center gap-1">
                  <RefreshCw className="h-3.5 w-3.5" /><span>Thử lại</span>
                </button>
                <button type="button" onClick={runScanSimulation} className="flex-1 py-2 rounded-xl bg-[#13693E] text-xs font-bold text-white">Mô phỏng quét</button>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full flex flex-col items-center text-center">
            <div className="h-11 w-11 rounded-2xl bg-[#E6F4EC] text-[#13693E] flex items-center justify-center mb-3"><ShieldCheck className="h-6 w-6" /></div>
            <h3 className="text-base font-extrabold text-slate-900">
              {mode === 'pin_verify' ? 'Nhập mã PIN 6 số' : mode === 'pin_change' && pinStep === 0 ? 'Nhập mã PIN hiện tại' : pinStep === 2 ? 'Xác nhận lại mã PIN' : 'Thiết lập mã PIN mới'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 mb-5">{mode === 'pin_verify' ? 'Nhập mã để bảo vệ giao dịch' : 'Bảo vệ tài khoản và mở khóa nhanh'}</p>
            <div className="flex gap-3 mb-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <span key={i} className={`h-3.5 w-3.5 rounded-full transition-all duration-150 ${i < pin.length ? 'bg-[#13693E] scale-110 shadow-xs' : 'border-2 border-slate-300 bg-white'}`} />
              ))}
            </div>
            {pinError && <p className="text-xs font-bold text-rose-600 mb-3">{pinError}</p>}
            <div className="grid grid-cols-3 gap-2.5 w-full max-w-[280px]">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'del'].map((key, idx) => {
                if (key === '') return <div key={idx} />;
                if (key === 'del') {
                  return (
                    <button key={idx} type="button" onClick={() => setPin((p) => p.slice(0, -1))} className="h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 flex items-center justify-center text-slate-700">
                      <Delete className="h-5 w-5" />
                    </button>
                  );
                }
                return (
                  <button key={idx} type="button" onClick={() => handlePinDigit(String(key))} className="h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-lg font-bold text-slate-900">
                    {key}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
export default BiometricPinModal;
