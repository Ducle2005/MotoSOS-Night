import { useMemo, useState } from 'react';
import { BatteryCharging, ChevronRight, CircleDot, Clock, Fuel, Wrench, XCircle, Zap } from 'lucide-react';
import type { IssueType, MechanicInfo, RescueReceipt, RescueStep, TrackingStatus } from '../../types/rescue';
import { formatVnd } from '../../utils/pricingAndSimLogic';
import { calculateHistoryStats } from '../../utils/rescueHistoryLogic';
import { RescueReceiptModal } from '../modals/RescueReceiptModal';

interface ActivityTabProps {
  step: RescueStep;
  trackingStatus: TrackingStatus;
  activeIssueLabel: string;
  activePickupAddress: string;
  mechanic: MechanicInfo;
  history: RescueReceipt[];
  onOpenMapTracking: () => void;
  onTriggerDemoAdvance: () => void;
  onStartNewRescue: (issueType?: IssueType) => void;
  onViewLocationOnMap?: (lat: number, lng: number, address: string) => void;
}

function cleanLocation(addr: string): string {
  if (!addr) return 'TP.HCM';
  return (addr.split(',')[0] || '')
    .replace(/\bStreet\b/gi, '')
    .replace(/\b7\d{4}\b/g, '')
    .replace(/,\s*(Vietnam|Việt Nam|Ho Chi Minh City|Saigon)$/gi, '')
    .replace(/\s+/g, ' ').trim() || 'TP.HCM';
}

function getCategoryIcon(issueType?: IssueType, isCancelled?: boolean) {
  if (isCancelled) return <XCircle className="w-5 h-5 text-rose-500" />;
  switch (issueType) {
    case 'flat_tire': return <CircleDot className="w-5 h-5" />;
    case 'engine_dead': return <Zap className="w-5 h-5" />;
    case 'out_of_fuel': return <Fuel className="w-5 h-5" />;
    case 'battery_jump': return <BatteryCharging className="w-5 h-5" />;
    default: return <Wrench className="w-5 h-5" />;
  }
}

export function ActivityTab({
  step, trackingStatus, activeIssueLabel, history,
  onOpenMapTracking, onStartNewRescue, onViewLocationOnMap,
}: ActivityTabProps) {
  const [selectedReceipt, setSelectedReceipt] = useState<RescueReceipt | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'completed' | 'cancelled'>('all');

  const stats = useMemo(() => calculateHistoryStats(history), [history]);
  const isActiveRescue = step === 'tracking' && (trackingStatus === 'accepted' || trackingStatus === 'arrived' || trackingStatus === 'repairing');

  const completedCount = useMemo(() => {
    return history.filter((r) => !r.serviceName.toLowerCase().includes('hủy')).length;
  }, [history]);

  const filteredHistory = useMemo(() => {
    return history.filter((r) => {
      const isCancelled = r.serviceName.toLowerCase().includes('hủy');
      if (filterTab === 'completed') return !isCancelled;
      if (filterTab === 'cancelled') return isCancelled;
      return true;
    });
  }, [history, filterTab]);

  return (
    <div className="relative flex-1 overflow-y-auto bg-white pb-24 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* 1. Header Trắng Tinh Gọn & Thanh Thống Kê Mảnh */}
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-md">
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <h1 className="text-[20px] font-extrabold text-slate-950 tracking-tight">Hoạt động</h1>
          <button
            type="button"
            onClick={() => onStartNewRescue()}
            className="bg-[#E6F4EC] hover:bg-[#D5ECDF] text-[#13693E] text-xs font-bold px-3 py-1.5 rounded-full transition-transform active:scale-95"
          >
            Gọi thợ mới
          </button>
        </div>

        {/* Dải thống kê tóm tắt 1 dòng */}
        <div className="mx-4 mt-1 mb-2.5 px-3.5 py-2 rounded-2xl bg-[#F4F8F6] border border-emerald-600/10 flex items-center justify-between text-xs">
          <span className="text-slate-600">
            Đã hoàn thành <strong className="text-slate-950">{completedCount} chuyến</strong>
          </span>
          <span className="text-slate-600">
            Tiết kiệm <strong className="text-[#13693E]">{formatVnd(stats.totalSavedAmount)}</strong>
          </span>
        </div>

        {/* Thanh tab lọc trạng thái kiểu Grab */}
        <div className="px-4 border-b border-slate-100 flex items-center gap-6 text-[13px]">
          {(['all', 'completed', 'cancelled'] as const).map((tab) => {
            const labels = { all: 'Tất cả', completed: 'Hoàn thành', cancelled: 'Đã hủy' };
            const isSelected = filterTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setFilterTab(tab)}
                className={`pb-2.5 relative transition-colors ${isSelected ? 'font-bold text-[#13693E]' : 'font-medium text-slate-500 hover:text-slate-800'}`}
              >
                <span>{labels[tab]}</span>
                {isSelected && <span className="absolute bottom-0 inset-x-0 h-[2.5px] bg-[#13693E] rounded-full" />}
              </button>
            );
          })}
        </div>
      </header>

      {/* 2. Chuyến Đang Diễn Ra (Nếu có) */}
      {isActiveRescue && (
        <div className="mx-4 mt-3 p-3 rounded-2xl bg-[#E6F4EC] border border-[#13693E]/25 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-600" />
            </span>
            <p className="text-[12.5px] font-bold text-slate-900 truncate">
              Đang cứu hộ • {activeIssueLabel || 'Sửa xe khẩn cấp'}
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenMapTracking}
            className="inline-flex items-center text-xs font-bold text-[#13693E] hover:underline shrink-0"
          >
            Theo dõi ›
          </button>
        </div>
      )}

      {/* 3. Danh Sách Lịch Sử Dạng Phẳng Chuẩn Grab */}
      <section className="mt-1">
        {filteredHistory.length === 0 ? (
          <div className="py-14 text-center px-4">
            <Clock className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-[13px] font-bold text-slate-700">Chưa có chuyến nào</p>
            <p className="mt-0.5 text-xs text-slate-400">Các hoạt động cứu hộ sẽ được lưu tự động tại đây.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredHistory.map((receipt) => {
              const isCancelled = receipt.serviceName.toLowerCase().includes('hủy');
              return (
                <div
                  key={receipt.id}
                  onClick={() => setSelectedReceipt(receipt)}
                  className="w-full px-4 py-3 flex items-start gap-3 text-left hover:bg-slate-50/90 active:bg-slate-100/70 transition-colors cursor-pointer select-none"
                >
                  {/* Cột trái — Icon tròn phân loại */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    isCancelled ? 'bg-slate-100 text-slate-500' : 'bg-[#E6F4EC] text-[#13693E]'
                  }`}>
                    {getCategoryIcon(receipt.issueType, isCancelled)}
                  </div>

                  {/* Cột giữa — Thông tin gọn 3 dòng sắc nét */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] font-bold text-slate-950 truncate">
                      {isCancelled
                        ? `Hủy • ${receipt.serviceName.replace(/^hủy:?\s*/i, '') || 'Cứu hộ'}`
                        : `${receipt.serviceName} • ${cleanLocation(receipt.locationAddress)}`}
                    </p>
                    <p className="text-[11.5px] text-slate-500 mt-0.5 truncate flex items-center gap-1.5">
                      <span>{receipt.completedAt}</span>
                      <span>•</span>
                      <span className={isCancelled ? 'text-rose-500 font-medium' : 'text-[#13693E] font-medium'}>
                        {isCancelled ? 'Đã hủy' : 'Hoàn thành'}
                      </span>
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartNewRescue(receipt.issueType);
                      }}
                      className="inline-flex items-center text-[12px] font-bold text-[#13693E] mt-1 hover:underline"
                    >
                      Đặt lại ›
                    </button>
                  </div>

                  {/* Cột phải — Giá tiền & Mã ưu đãi */}
                  <div className="text-right shrink-0 flex flex-col items-end">
                    <p className="text-[13.5px] font-extrabold text-slate-950">
                      {formatVnd(receipt.finalPrice)}
                    </p>
                    {receipt.discountAmount > 0 && (
                      <span className="text-[10.5px] font-semibold text-[#13693E] mt-0.5">
                        -{formatVnd(receipt.discountAmount)}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-300 ml-auto mt-1" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Modal Biên Lai Chi Tiết */}
      <RescueReceiptModal
        receipt={selectedReceipt}
        isOpen={selectedReceipt !== null}
        onClose={() => setSelectedReceipt(null)}
        onReorder={(receipt) => {
          setSelectedReceipt(null);
          onStartNewRescue(receipt.issueType);
        }}
        onViewOnMap={(receipt) => {
          setSelectedReceipt(null);
          if (onViewLocationOnMap) onViewLocationOnMap(receipt.lat, receipt.lng, receipt.locationAddress);
          else onOpenMapTracking();
        }}
      />
    </div>
  );
}
