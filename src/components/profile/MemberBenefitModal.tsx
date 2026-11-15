import { Award, Check, Clock, Crown, ShieldCheck, Sparkles, Wrench, X } from 'lucide-react';

interface MemberBenefitModalProps {
  isOpen: boolean;
  type: 'membership' | 'tier';
  onClose: () => void;
}

const MEMBERSHIP_BENEFITS = [
  {
    icon: Wrench,
    title: 'Miễn phí vá lốp khẩn cấp',
    desc: 'Hỗ trợ vá lốp lưu động miễn phí không giới hạn số lần tại hiện trường.',
  },
  {
    icon: Clock,
    title: 'Ưu tiên điều phối thợ ban đêm',
    desc: 'Thợ cứu hộ có mặt trong 10-15 phút, ưu tiên vượt trội vào khung giờ 22:00 - 05:00.',
  },
  {
    icon: ShieldCheck,
    title: 'Trợ cấp xe kéo về Trạm An Toàn',
    desc: 'Nếu xe không thể khắc phục tại chỗ, miễn phí đưa về Trạm An Toàn 24/7 gần nhất.',
  },
];

const TIER_PROGRESS = [
  { tier: 'Hạng Bạc', points: '0 - 99 điểm', active: true, done: true },
  { tier: 'Hạng Vàng', points: '100 - 249 điểm', active: true, done: true },
  { tier: 'Hạng Bạch Kim', points: '250 - 499 điểm (Hiện tại: 320 điểm)', active: true, isCurrent: true },
  { tier: 'Hạng Kim Cương', points: '500+ điểm', active: false },
];

export function MemberBenefitModal({
  isOpen,
  type,
  onClose,
}: MemberBenefitModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={type === 'membership' ? 'Gói hội viên Priority' : 'Hạng thành viên Bạch Kim'}
      className="fixed inset-0 z-[120] flex items-end justify-center bg-slate-950/60 p-0 sm:items-center sm:p-4"
    >
      <div className="w-full max-w-[430px] rounded-t-[28px] border-t border-slate-100 bg-white p-5 shadow-2xl sm:rounded-[28px] sm:border">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${
              type === 'membership' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
            }`}>
              {type === 'membership' ? <Sparkles className="h-4 w-4" /> : <Crown className="h-4 w-4" />}
            </span>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                {type === 'membership' ? 'Gói hội viên Priority 24/7' : 'Hạng thành viên Bạch Kim'}
              </h2>
              <p className="text-xs text-slate-500">
                {type === 'membership' ? 'Đặc quyền cứu hộ & lá chắn đêm khuya' : 'Tích lũy 320 điểm sau các lần cứu hộ'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {type === 'membership' ? (
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 p-4 text-white shadow-md">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wider">
                  Active Member
                </span>
                <span className="text-xs font-semibold text-emerald-100">Hạn: 12/2027</span>
              </div>
              <h3 className="mt-2 text-lg font-black tracking-tight">MotoSOS Priority Shield</h3>
              <p className="text-xs text-emerald-100">Bảo vệ toàn diện trên mọi nẻo đường TP.HCM</p>
            </div>

            <div className="space-y-2 pt-1">
              {MEMBERSHIP_BENEFITS.map((b, i) => {
                const Icon = b.icon;
                return (
                  <div key={i} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{b.title}</p>
                      <p className="text-[11px] text-slate-500">{b.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-600" />
                <span className="text-sm font-bold text-amber-900">320 / 500 điểm</span>
              </div>
              <p className="mt-1 text-xs text-amber-800">
                Còn 180 điểm nữa để thăng hạng <strong>Kim Cương</strong> và nhận ưu đãi giảm 35.000đ mọi chuyến cứu hộ.
              </p>
              <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-amber-200/60">
                <div className="h-full w-[64%] rounded-full bg-amber-500 transition-all duration-500" />
              </div>
            </div>

            <div className="space-y-2">
              {TIER_PROGRESS.map((t, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between rounded-xl border p-2.5 text-xs ${
                    t.isCurrent
                      ? 'border-amber-400 bg-amber-50 font-bold text-amber-950'
                      : t.done
                        ? 'border-slate-100 bg-slate-50 text-slate-700'
                        : 'border-slate-100 text-slate-400 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {t.done ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : t.isCurrent ? (
                      <Crown className="h-4 w-4 text-amber-600" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-slate-300" />
                    )}
                    <span>{t.tier}</span>
                  </div>
                  <span className="font-sans text-[11px] font-semibold">{t.points}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-[42px] w-full items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
