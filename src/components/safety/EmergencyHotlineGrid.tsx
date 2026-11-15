import { Flame, Headphones, Plus, Shield } from 'lucide-react';

const HOTLINES = [
  { id: 'motosos', label: 'Tổng đài', phone: '1900 636812', tel: '1900636812', icon: Headphones, color: 'text-[#13693E]' },
  { id: 'police', label: 'Cảnh sát', phone: '113', tel: '113', icon: Shield, color: 'text-indigo-600' },
  { id: 'ambulance', label: 'Cấp cứu', phone: '115', tel: '115', icon: Plus, color: 'text-rose-600' },
  { id: 'fire', label: 'Cứu nạn', phone: '114', tel: '114', icon: Flame, color: 'text-amber-600' },
];

export function EmergencyHotlineGrid() {
  return (
    <div className="px-4 mt-3 grid grid-cols-4 gap-2">
      {HOTLINES.map((h) => {
        const Icon = h.icon;
        return (
          <a
            key={h.id}
            href={`tel:${h.tel}`}
            data-testid={`hotline-${h.id}`}
            className="rounded-2xl bg-[#F6F8F7] hover:bg-[#E6F4EC] border border-slate-200/70 py-2.5 px-1 flex flex-col items-center text-center transition-colors active:scale-95 shadow-2xs"
          >
            <Icon className={`w-4 h-4 ${h.color}`} />
            <span className="text-[10.5px] font-extrabold text-slate-950 mt-1.5 tracking-tight">{h.phone}</span>
            <span className="text-[10px] text-slate-500 mt-0.5">{h.label}</span>
          </a>
        );
      })}
    </div>
  );
}
