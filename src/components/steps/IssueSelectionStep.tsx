import {
  ArrowLeft,
  BatteryCharging,
  CircleDot,
  Fuel,
  HelpCircle,
  Zap,
} from 'lucide-react';
import type { IssueOption, IssueType } from '../../types/rescue';
import { formatVnd } from '../../utils/pricingAndSimLogic';

interface IssueSelectionStepProps {
  options: IssueOption[];
  selectedIssue: IssueType | null;
  customNote: string;
  onSelectIssue: (issue: IssueType) => void;
  onChangeNote: (note: string) => void;
  onBack: () => void;
  onContinue: () => void;
  onOpenAiChat?: () => void;
}

function getIssueIcon(id: IssueType) {
  if (id === 'flat_tire') return CircleDot;
  if (id === 'engine_dead') return Zap;
  if (id === 'out_of_fuel') return Fuel;
  if (id === 'battery_jump') return BatteryCharging;
  return HelpCircle;
}

function getShortSubtitle(option: IssueOption): string {
  if (option.id === 'flat_tire') return 'Vá ép tiêu chuẩn tận nơi';
  if (option.id === 'engine_dead') return 'Kiểm tra bugi, đánh lửa';
  if (option.id === 'out_of_fuel') return 'Công giao + 2L xăng 95';
  if (option.id === 'battery_jump') return 'Kích bình & đo dòng sạc';
  return 'Thợ tới kiểm tra & báo giá tại chỗ';
}

export function IssueSelectionStep({
  options,
  selectedIssue,
  customNote,
  onSelectIssue,
  onChangeNote,
  onBack,
  onContinue,
  onOpenAiChat,
}: IssueSelectionStepProps) {
  const mainOptions = options.filter((o) => o.id !== 'other');
  const otherOption = options.find((o) => o.id === 'other');
  const selectedOption = options.find((o) => o.id === selectedIssue);
  const selectedPriceText = selectedOption
    ? `${formatVnd(selectedOption.fixedPrice)} →`
    : '→';

  return (
    <div className="flex min-h-0 flex-1 flex-col justify-between">
      {/* Body: AI Banner + Grid 2x2 + Card khác */}
      <div className="flex-1 overflow-y-auto px-4 pt-1 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* 1. Thanh Kỹ Sư AI (Đen Obsidian) */}
        {onOpenAiChat && (
          <div
            role="button"
            tabIndex={0}
            onClick={onOpenAiChat}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onOpenAiChat();
            }}
            className="mb-2.5 flex cursor-pointer items-center justify-between rounded-xl bg-[#090D16] px-3 py-2 text-white shadow-xs transition-transform active:scale-[0.99]"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-emerald-400 font-sans text-[9.5px] font-black text-slate-950">
                AI
              </span>
              <span className="truncate text-[12px] font-medium text-slate-100">
                Chưa rõ xe hỏng gì? Hỏi Kỹ sư AI
              </span>
            </div>
            <span className="shrink-0 text-[11.5px] font-bold text-emerald-400">
              Bắt bệnh ›
            </span>
          </div>
        )}

        {/* 2. Lưới 2x2 cho 4 dịch vụ chính */}
        <div
          className="grid grid-cols-2 gap-2"
          role="radiogroup"
          aria-label="Loại sự cố xe máy"
        >
          {mainOptions.map((option) => {
            const Icon = getIssueIcon(option.id);
            const active = selectedIssue === option.id;

            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onSelectIssue(option.id)}
                className={`flex flex-col justify-between rounded-2xl border p-2.5 text-left transition-all active:scale-[0.98] focus-visible:outline-none ${
                  active
                    ? 'border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-500/30'
                    : 'border-slate-200/80 bg-white hover:border-slate-300'
                }`}
              >
                {/* Hàng trên: Icon + Giá tiền */}
                <div className="mb-1 flex items-center justify-between gap-1">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                      active
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="font-sans text-[13px] font-extrabold tabular-nums text-emerald-600">
                    {formatVnd(option.fixedPrice)}
                  </span>
                </div>

                {/* Hàng dưới: Tên sự cố + Mô tả ngắn */}
                <div>
                  <p className="text-[13px] font-bold leading-tight text-slate-950">
                    {option.label}
                  </p>
                  <p className="mt-0.5 truncate text-[10.5px] text-slate-500">
                    {getShortSubtitle(option)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* 3. Thẻ thứ 5 (Sự cố khác) trải ngang toàn chiều rộng */}
        {otherOption && (
          <button
            type="button"
            role="radio"
            aria-checked={selectedIssue === otherOption.id}
            onClick={() => onSelectIssue(otherOption.id)}
            className={`mt-2 flex w-full items-center justify-between gap-2.5 rounded-2xl border p-2.5 text-left transition-all active:scale-[0.98] focus-visible:outline-none ${
              selectedIssue === otherOption.id
                ? 'border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-500/30'
                : 'border-slate-200/80 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                  selectedIssue === otherOption.id
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                <HelpCircle className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-bold leading-tight text-slate-950">
                  {otherOption.label}
                </p>
                <p className="text-[10.5px] text-slate-500">
                  Thợ tới kiểm tra &amp; báo giá tại chỗ
                </p>
              </div>
            </div>

            <span className="shrink-0 font-sans text-[13px] font-extrabold tabular-nums text-emerald-600">
              {formatVnd(otherOption.fixedPrice)}
            </span>
          </button>
        )}

        {/* Ô nhập ghi chú ngắn gọn khi chọn Sự cố khác */}
        {selectedIssue === 'other' && (
          <div className="mt-2 rounded-xl border border-slate-200/80 bg-slate-50/80 p-2">
            <input
              id="issue-note-input"
              type="text"
              value={customNote}
              onChange={(e) => onChangeNote(e.target.value)}
              placeholder="Mô tả sự cố (ví dụ: đứt sên, kẹt khóa cổ...)"
              className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* 4. Thanh Hành Động Đáy */}
      <div className="shrink-0 border-t border-slate-100 bg-white px-4 py-2.5">
        <div className="flex items-center gap-2">
          {/* Nút Quay lại vuông bo góc */}
          <button
            type="button"
            onClick={onBack}
            aria-label="Quay lại"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </button>

          {/* Nút chính */}
          <button
            type="button"
            disabled={!selectedIssue}
            onClick={onContinue}
            className="flex h-11 flex-1 items-center justify-between rounded-xl bg-[#090D16] px-4 font-bold text-[13px] text-white shadow-lg transition-transform hover:bg-slate-900 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
          >
            <span>Chọn điểm chờ thợ</span>
            <span className="font-extrabold text-emerald-400">
              {selectedPriceText}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
