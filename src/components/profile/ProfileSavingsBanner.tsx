interface ProfileSavingsBannerProps {
  totalSaved: number;
}

export function ProfileSavingsBanner({ totalSaved }: ProfileSavingsBannerProps) {
  return (
    <section
      aria-label="Tổng hợp tiết kiệm thành viên"
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#DCFCE7] via-[#E0F2FE] to-[#D1FAE5] p-4 shadow-sm border border-emerald-100/60"
    >
      <div className="relative z-10 max-w-[62%]">
        <p className="text-xs font-semibold text-slate-700">Bạn đã tiết kiệm được</p>
        <p className="mt-1 font-sans text-2xl font-black tracking-tight text-slate-900">
          {totalSaved.toLocaleString('vi-VN')} VNĐ
        </p>
        <p className="mt-1 text-[11px] font-bold text-emerald-800">
          cùng đặc quyền MotoSOS Priority
        </p>
      </div>

      {/* SVG Illustration - Green hills, tree, clouds & scooter */}
      <div className="pointer-events-none absolute right-0 bottom-0 top-0 w-[42%] overflow-hidden">
        <svg viewBox="0 0 160 120" className="h-full w-full object-cover" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="130" cy="25" r="16" fill="#FEF08A" opacity="0.8" />
          <ellipse cx="60" cy="20" rx="22" ry="7" fill="white" opacity="0.85" />
          <ellipse cx="110" cy="30" rx="18" ry="6" fill="white" opacity="0.9" />
          <path d="M10 120 C 50 65, 110 75, 170 120 Z" fill="#86EFAC" opacity="0.6" />
          <path d="M40 120 C 80 80, 130 85, 180 120 Z" fill="#4ADE80" opacity="0.8" />
          <circle cx="125" cy="72" r="12" fill="#22C55E" />
          <rect x="123" y="80" width="4" height="20" fill="#78350F" />
          <circle cx="75" cy="88" r="4" fill="#047857" />
          <circle cx="95" cy="88" r="4" fill="#047857" />
          <path d="M75 88 L85 85 L95 88" stroke="#065F46" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="85" cy="74" r="3.5" fill="#0F172A" />
          <path d="M85 78 L85 85" stroke="#0F172A" strokeWidth="2" />
        </svg>
      </div>
    </section>
  );
}
