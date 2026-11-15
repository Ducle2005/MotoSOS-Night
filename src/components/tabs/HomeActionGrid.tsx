import {
  AlertCircle,
  BatteryCharging,
  Bot,
  CircleDot,
  Fuel,
  Shield,
  Store,
  Zap,
} from 'lucide-react';
import type { IssueType, SafeStationCategory } from '../../types/rescue';

interface HomeActionGridProps {
  onQuickIssueSelect: (issue: IssueType) => void;
  onQuickCategorySelect: (category: SafeStationCategory) => void;
  onQuickSosSelect: () => void;
  onOpenAiChat?: () => void;
  onOpenOffers?: () => void;
}

interface ActionItem {
  id: string;
  label: string;
  icon: typeof CircleDot;
  boxTone: string;
  badge?: { text: string; bg: string };
  action: () => void;
}

export function HomeActionGrid({
  onQuickIssueSelect,
  onQuickCategorySelect,
  onQuickSosSelect,
  onOpenAiChat,
}: HomeActionGridProps) {
  const items: ActionItem[] = [
    // Hàng 1: 4 dịch vụ cứu hộ chính
    {
      id: 'flat_tire', label: 'Lủng lốp', icon: CircleDot,
      boxTone: 'bg-emerald-50 text-[#13693E]',
      action: () => onQuickIssueSelect('flat_tire'),
    },
    {
      id: 'engine_dead', label: 'Chết máy', icon: Zap,
      boxTone: 'bg-emerald-50 text-[#13693E]',
      action: () => onQuickIssueSelect('engine_dead'),
    },
    {
      id: 'out_of_fuel', label: 'Hết xăng', icon: Fuel,
      boxTone: 'bg-emerald-50 text-[#13693E]',
      action: () => onQuickIssueSelect('out_of_fuel'),
    },
    {
      id: 'battery_jump', label: 'Kích bình', icon: BatteryCharging,
      boxTone: 'bg-emerald-50 text-[#13693E]',
      action: () => onQuickIssueSelect('battery_jump'),
    },
    // Hàng 2: 4 tiện ích an toàn & trợ giúp nhanh
    {
      id: 'ai_chat', label: 'Trợ lý AI', icon: Bot,
      boxTone: 'bg-indigo-50 text-indigo-600',
      badge: { text: 'AI', bg: 'bg-orange-500' },
      action: () => onOpenAiChat?.(),
    },
    {
      id: 'convenience', label: 'Trạm 24/7', icon: Store,
      boxTone: 'bg-emerald-50 text-[#13693E]',
      action: () => onQuickCategorySelect('convenience'),
    },
    {
      id: 'police', label: 'Công an', icon: Shield,
      boxTone: 'bg-emerald-50 text-[#13693E]',
      action: () => onQuickCategorySelect('police'),
    },
    {
      id: 'sos', label: 'Gửi SOS', icon: AlertCircle,
      boxTone: 'bg-rose-50 text-rose-600',
      action: onQuickSosSelect,
    },
  ];

  return (
    <section aria-label="Dịch vụ cứu hộ và Trạm An Toàn" className="w-full">
      <div className="grid grid-cols-4 gap-y-3.5 gap-x-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={item.action}
              className="group flex flex-col items-center p-0.5 text-center focus-visible:outline-none"
            >
              <div
                className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center relative transition-transform active:scale-95 shadow-2xs ${item.boxTone}`}
              >
                {item.badge && (
                  <span
                    className={`absolute -top-1 -right-1 rounded-full px-1.5 py-0.2 text-[8.5px] font-bold text-white shadow-xs ${item.badge.bg}`}
                  >
                    {item.badge.text}
                  </span>
                )}
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <span className="mt-1.5 text-[11.5px] font-semibold text-slate-800 text-center leading-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
