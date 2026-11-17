import { ArrowLeft, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { type AuthUser, completeRegistration, generateMockOtp, verifyOtpAndLogin } from '../../services/authService';

interface Props { phone: string; onBack: () => void; onSuccess: (user: AuthUser) => void; }
const BIKE_TYPES = ['Xe tay ga', 'Xe số', 'Xe côn tay', 'Xe điện'];
const DEMO_CODE = '482910';

export function OtpAndProfileStep({ phone, onBack, onSuccess }: Props) {
  const [subStep, setSubStep] = useState<'otp' | 'profile'>('otp');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [sec, setSec] = useState(59);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [bikeModel, setBikeModel] = useState('Xe tay ga');
  const [licensePlate, setLicensePlate] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (subStep !== 'otp' || sec <= 0) return;
    const t = setInterval(() => setSec((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [subStep, sec]);

  const submitOtp = (code: string) => {
    setErr(null); setLoading(true);
    setTimeout(() => {
      const res = verifyOtpAndLogin(phone, code);
      setLoading(false);
      if (res.success) res.isNewUser ? setSubStep('profile') : res.user && onSuccess(res.user);
      else setErr(res.message || 'Mã xác thực không đúng');
    }, 280);
  };

  const handleOtpChange = (i: number, val: string) => {
    const char = val.slice(-1).replace(/\D/g, '');
    const next = [...otp]; next[i] = char; setOtp(next);
    if (char && i < 5) inputRefs.current[i + 1]?.focus();
    if (next.every(Boolean)) submitOtp(next.join(''));
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputRefs.current[i - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = [...otp];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setOtp(next);
    pasted.length === 6 ? submitOtp(pasted) : inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !licensePlate.trim()) return;
    onSuccess(completeRegistration({ phone, fullName, bikeModel, licensePlate }));
  };

  return (
    <div className="flex min-h-[100dvh] flex-col justify-between bg-white px-5 py-6">
      <div>
        <div className="flex items-center justify-between pb-4">
          <button type="button" onClick={subStep === 'profile' ? () => setSubStep('otp') : onBack} className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="text-xs font-bold text-slate-400">{subStep === 'otp' ? 'Bước 2/2: Xác thực' : 'Bước 2B: Hồ sơ xe 15s'}</span>
        </div>

        {subStep === 'otp' ? (
          <div className="mt-2 space-y-6">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-950">Nhập mã xác thực OTP</h1>
              <p className="mt-1 text-sm text-slate-500">Mã 6 chữ số đã gửi đến số <span className="font-bold text-slate-900">{phone}</span></p>
            </div>
            <button type="button" onClick={() => { setOtp(DEMO_CODE.split('')); submitOtp(DEMO_CODE); }} className="flex w-full items-center justify-between rounded-xl border border-emerald-200 bg-[#E6F4EC] px-3.5 py-2.5 text-left text-xs text-[#13693E] hover:bg-emerald-100/70 transition-all active:scale-[0.99]">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 shrink-0 text-[#13693E]" />
                <span className="font-semibold">Mã OTP thử nghiệm: <strong className="font-extrabold">{DEMO_CODE}</strong></span>
              </div>
              <span className="font-bold text-[11px] underline">Bấm điền nhanh</span>
            </button>
            <div>
              <div className="flex justify-between gap-2" onPaste={handlePaste}>
                {otp.map((d, i) => (
                  <input key={i} ref={(el) => { inputRefs.current[i] = el; }} type="tel" maxLength={1} value={d} autoFocus={i === 0}
                    onChange={(e) => handleOtpChange(i, e.target.value)} onKeyDown={(e) => handleKeyDown(i, e)}
                    className={`h-12 w-11 rounded-xl border-2 text-center text-lg font-extrabold transition-all outline-none ${
                      d ? 'border-[#13693E] bg-emerald-50/30 text-slate-950' : 'border-slate-200 bg-white text-slate-900 focus:border-[#13693E]'
                    }`}
                  />
                ))}
              </div>
              {err && <p className="mt-2 text-xs font-semibold text-rose-600">{err}</p>}
            </div>
            <div className="pt-2 text-center text-xs text-slate-500">
              {sec > 0 ? (<p>Gửi lại mã sau <span className="font-bold text-slate-800">{sec}s</span></p>) : (
                <button type="button" onClick={() => { generateMockOtp(phone); setSec(59); setErr(null); }} className="font-bold text-[#13693E] hover:underline">Gửi lại mã OTP</button>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleComplete} className="mt-2 space-y-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-950">Hoàn tất hồ sơ xe</h1>
              <p className="mt-1 text-sm text-slate-500">15 giây thiết lập để kỹ thuật viên cứu hộ nhận diện chính xác</p>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 p-2.5 border border-amber-200 text-xs text-amber-900">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>Tặng ngay voucher chào bạn mới <strong>BANMOI25</strong> (Giảm 25.000đ)!</span>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">Họ và tên</label>
              <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ví dụ: Lê Việt Đức" className="w-full rounded-xl border-2 border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-[#13693E] outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">Dòng xe đang đi</label>
              <div className="grid grid-cols-2 gap-2">
                {BIKE_TYPES.map((t) => (
                  <button key={t} type="button" onClick={() => setBikeModel(t)} className={`rounded-xl py-2 px-3 text-xs font-bold border-2 transition-all ${bikeModel === t ? 'border-[#13693E] bg-[#E6F4EC] text-[#13693E]' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'}`}>{t}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">Biển số xe</label>
              <input type="text" required value={licensePlate} onChange={(e) => setLicensePlate(e.target.value)} placeholder="Ví dụ: 59-X1 888.99" className="w-full rounded-xl border-2 border-slate-200 px-3.5 py-2.5 text-sm font-bold uppercase tracking-wider text-slate-900 focus:border-[#13693E] outline-none" />
            </div>
            <button type="submit" disabled={!fullName.trim() || !licensePlate.trim()} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#13693E] py-3.5 text-[14.5px] font-extrabold text-white shadow-md hover:bg-[#0F5C36] disabled:bg-slate-200 disabled:text-slate-400 active:scale-[0.99] transition-all">
              <span>Hoàn tất &amp; Vào MotoSOS</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </form>
        )}
      </div>

      {subStep === 'otp' && (
        <div className="pt-6">
          <button type="button" disabled={otp.some((c) => !c) || loading} onClick={() => submitOtp(otp.join(''))} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#13693E] py-3.5 text-[14.5px] font-extrabold text-white shadow-md hover:bg-[#0F5C36] disabled:bg-slate-200 disabled:text-slate-400 active:scale-[0.99] transition-all">
            <span>{loading ? 'Đang xác thực...' : 'Xác thực OTP'}</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
export default OtpAndProfileStep;
