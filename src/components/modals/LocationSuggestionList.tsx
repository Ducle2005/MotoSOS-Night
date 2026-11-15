import { Loader2, MapPin } from 'lucide-react';
import type { LocationSuggestion } from '../../types/rescue';
import { formatSuggestionDistance } from '../../utils/geocodeApi';

interface LocationSuggestionListProps {
  query: string;
  isSearching: boolean;
  suggestions: LocationSuggestion[];
  onSelectSuggestion: (item: LocationSuggestion) => void;
}

export function LocationSuggestionList({
  query,
  isSearching,
  suggestions,
  onSelectSuggestion,
}: LocationSuggestionListProps) {
  const trimmed = query.trim();

  if (trimmed.length < 2) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-5 text-center text-xs text-slate-500">
        Nhập ít nhất 2 ký tự (ví dụ: <span className="font-semibold text-slate-700">Chợ Bến Thành</span>, <span className="font-semibold text-slate-700">Nguyễn Huệ</span>) để xem gợi ý địa điểm.
      </div>
    );
  }

  if (isSearching && suggestions.length === 0) {
    return (
      <div className="flex items-center justify-center gap-2 py-8 text-xs font-medium text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin text-emerald-500" aria-hidden="true" />
        <span>Đang tìm địa điểm tại Việt Nam...</span>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-6 text-center text-xs text-slate-500">
        Không tìm thấy địa chỉ phù hợp với &ldquo;{trimmed}&rdquo;. Hãy thử tên đường hoặc địa danh khác.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-slate-100" role="listbox" aria-label="Gợi ý địa điểm">
      {suggestions.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            onClick={() => onSelectSuggestion(item)}
            className="flex w-full items-center justify-between gap-3 py-3 text-left transition-colors hover:bg-slate-50 active:bg-slate-100"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                <MapPin className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900">{item.addressLine1}</p>
                <p className="mt-0.5 truncate text-xs text-slate-500">{item.addressLine2}</p>
              </div>
            </div>
            <span className="shrink-0 font-sans text-xs font-semibold tabular-nums text-slate-500 whitespace-nowrap">
              {formatSuggestionDistance(item.distanceMeters)}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
