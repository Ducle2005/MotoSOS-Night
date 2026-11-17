import { Award, Bell, Check, ChevronRight, Copy, FileText, MapPin, Settings, ShieldCheck, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface ProfileGroupSectionsProps {
  onOpenMembership: () => void;
  onOpenTier: () => void;
  onNavigateToActivity: () => void;
  onOpenAddresses: () => void;
  onOpenNotifications: () => void;
  onOpenSettings?: () => void;
  onOpenTerms?: () => void;
  activePlanName?: string;
  unreadCount?: number;
  isProtected?: boolean;
}

export function ProfileGroupSections({
  onOpenMembership,
  onOpenTier,
  onNavigateToActivity,
  onOpenAddresses,
  onOpenNotifications,
  onOpenSettings,
  onOpenTerms,
  activePlanName,
  unreadCount,
  isProtected,
}: ProfileGroupSectionsProps) {
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyInviteCode = () => {
    try {
      if (navigator.clipboard) navigator.clipboard.writeText('BANMOI25');
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {}
  };

  return (
    <>
      {/* Thẻ Nhóm 1 — Hạng thành viên & Ưu đãi */}
      <section className="rounded-2xl border border-slate-100/90 bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-[14px] font-bold text-slate-900">Hạng thành viên &amp; Ưu đãi</h2>
        <div className="divide-y divide-slate-100">
          <button
            type="button"
            onClick={onOpenMembership}
            className="flex w-full items-center justify-between py-3 text-left hover:bg-slate-50/50"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-800">Gói hội viên</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10.5px] font-bold text-emerald-700 border border-emerald-200/80">
                {activePlanName || 'Priority 24/7'}
              </span>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </div>
          </button>

          <button
            type="button"
            onClick={onOpenTier}
            className="flex w-full items-center justify-between py-3 text-left hover:bg-slate-50/50"
          >
            <div className="flex items-center gap-3">
              <Award className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-bold text-slate-800">Hạng thành viên</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-500">
                Hạng Bạch Kim • 320 điểm
              </span>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </div>
          </button>

          <div className="flex w-full items-center justify-between py-3 text-left">
            <div className="flex items-center gap-3">
              <Copy className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-bold text-slate-800">Giới thiệu bạn bè</span>
            </div>
            <button
              type="button"
              onClick={handleCopyInviteCode}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 active:scale-95 transition-all"
            >
              {copiedCode ? <Check className="h-3 w-3 text-emerald-600" /> : null}
              <span>{copiedCode ? 'Đã sao chép!' : 'Mã: BANMOI25'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Thẻ Nhóm 2 — Thông tin cá nhân */}
      <section className="rounded-2xl border border-slate-100/90 bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-[14px] font-bold text-slate-900">Thông tin cá nhân</h2>
        <div className="divide-y divide-slate-100">
          <button
            type="button"
            onClick={onNavigateToActivity}
            className="flex w-full items-center justify-between py-3 text-left hover:bg-slate-50/50"
          >
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-slate-600" />
              <span className="text-xs font-bold text-slate-800">Thông tin hoá đơn</span>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </button>

          <button
            type="button"
            onClick={onOpenAddresses}
            className="flex w-full items-center justify-between py-3 text-left hover:bg-slate-50/50"
          >
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-slate-600" />
              <span className="text-xs font-bold text-slate-800">Địa chỉ đã lưu</span>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </button>

          <button
            type="button"
            onClick={onOpenNotifications}
            className="flex w-full items-center justify-between py-3 text-left hover:bg-slate-50/50"
          >
            <div className="flex items-center gap-3">
              <Bell className="h-4 w-4 text-slate-600" />
              <span className="text-xs font-bold text-slate-800">Thông báo</span>
            </div>
            <div className="flex items-center gap-1.5">
              {unreadCount && unreadCount > 0 ? (
                <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-extrabold text-rose-600 border border-rose-200">
                  {unreadCount} mới
                </span>
              ) : null}
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </div>
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="flex w-full items-center justify-between py-3 text-left hover:bg-slate-50/50"
          >
            <div className="flex items-center gap-3">
              <Settings className="h-4 w-4 text-slate-600" />
              <span className="text-xs font-bold text-slate-800">Cài đặt</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                isProtected ? 'bg-emerald-50 text-[#13693E] border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'
              }`}>
                {isProtected ? 'Đã bảo vệ' : 'Thiết lập'}
              </span>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </div>
          </button>

          <button
            type="button"
            onClick={onOpenTerms}
            className="flex w-full items-center justify-between py-3 text-left hover:bg-slate-50/50"
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-800">Điều khoản &amp; Chính sách bảo mật</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                Đã mã hóa dữ liệu
              </span>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </div>
          </button>
        </div>
      </section>
    </>
  );
}
