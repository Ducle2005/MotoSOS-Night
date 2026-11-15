import { Clock, Home, Map, ShieldCheck, User } from 'lucide-react';
import { motion } from 'motion/react';
import type { AppTab } from '../types/rescue';

interface BottomNavBarProps {
  activeTab: AppTab;
  hasActiveOrder: boolean;
  onSelectTab: (tab: AppTab) => void;
}

const NAV_ITEMS: Array<{
  id: AppTab;
  label: string;
  icon: typeof Home;
}> = [
  { id: 'home', label: 'Trang chủ', icon: Home },
  { id: 'map', label: 'Bản đồ', icon: Map },
  { id: 'activity', label: 'Hoạt động', icon: Clock },
  { id: 'safety', label: 'An toàn', icon: ShieldCheck },
  { id: 'profile', label: 'Tài khoản', icon: User },
];

export function BottomNavBar({
  activeTab,
  hasActiveOrder,
  onSelectTab,
}: BottomNavBarProps) {
  return (
    <nav
      aria-label="Điều hướng chính"
      className="absolute inset-x-0 bottom-0 z-30 grid h-16 grid-cols-5 items-center border-t border-slate-200/80 bg-white px-1 shadow-[0_-2px_10px_rgba(0,0,0,0.04)]"
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = activeTab === item.id;
        return (
          <motion.button
            key={item.id}
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={() => onSelectTab(item.id)}
            aria-current={active ? 'page' : undefined}
            className={`relative flex min-h-[48px] flex-col items-center justify-center gap-0.5 rounded-xl transition-colors focus-visible:outline-none ${
              active ? 'text-[#13693E]' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            {active && (
              <motion.span
                layoutId="navIndicator"
                transition={{ type: 'spring', stiffness: 460, damping: 34 }}
                className="absolute top-0 h-[3px] w-7 rounded-full bg-[#13693E]"
              />
            )}

            <span className="relative">
              <Icon
                className="h-5 w-5"
                strokeWidth={active ? 2.4 : 1.9}
                aria-hidden="true"
              />
              {item.id === 'activity' && hasActiveOrder && (
                <span
                  aria-label="Đang có đơn cứu hộ"
                  className="absolute -top-0.5 -right-1 h-2 w-2 rounded-full bg-[#13693E] ring-2 ring-white"
                />
              )}
            </span>
            <span
              className={`text-[10.5px] tracking-tight whitespace-nowrap ${
                active ? 'font-extrabold text-[#13693E]' : 'font-medium text-slate-500'
              }`}
            >
              {item.label}
            </span>
          </motion.button>
        );
      })}
    </nav>
  );
}
