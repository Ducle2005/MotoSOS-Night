import { Loader2, LocateFixed, MapPin, Search, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import type { ActiveLocation, LocationSuggestion } from '../../types/rescue';
import { fetchAddressAutocomplete } from '../../utils/geocodeApi';
import { formatGpsAccuracyBadge } from '../../utils/gpsWatcher';
import { LocationSuggestionList } from './LocationSuggestionList';

interface LocationSearchModalProps {
  isOpen: boolean;
  activeLocation: ActiveLocation;
  isLocatingGps: boolean;
  onSelectSuggestion: (suggestion: LocationSuggestion) => void;
  onUseCurrentGps: () => Promise<void>;
  onStartMapPinPicker: () => void;
  onClose: () => void;
}

export function LocationSearchModal({
  isOpen, activeLocation, isLocatingGps,
  onSelectSuggestion, onUseCurrentGps, onStartMapPinPicker, onClose,
}: LocationSearchModalProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 90);
    return () => window.clearTimeout(focusTimer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    setIsSearching(true);
    const debounceTimer = window.setTimeout(() => {
      fetchAddressAutocomplete(
        trimmed,
        { lat: activeLocation.lat, lng: activeLocation.lng },
        controller.signal,
      )
        .then((items) => {
          if (!controller.signal.aborted) {
            setSuggestions(items);
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setIsSearching(false);
          }
        });
    }, 300);

    return () => {
      window.clearTimeout(debounceTimer);
      controller.abort();
    };
  }, [isOpen, query, activeLocation.lat, activeLocation.lng]);

  const accuracyBadge = formatGpsAccuracyBadge(activeLocation.accuracyMeters);

  const handleUseGpsClick = async () => {
    await onUseCurrentGps();
    onClose();
  };

  const handlePinOnMapClick = () => {
    onClose();
    onStartMapPinPicker();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Tìm kiếm địa điểm gặp sự cố"
          className="absolute inset-0 z-50 flex flex-col justify-end"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 360, damping: 34 }}
            className="relative z-10 flex h-[88dvh] flex-col rounded-t-3xl bg-white shadow-2xl"
          >
            <div className="flex shrink-0 justify-center pt-2.5 pb-1" aria-hidden="true">
              <div className="h-1 w-10 rounded-full bg-slate-200" />
            </div>

            <div className="flex shrink-0 items-center justify-between px-5 pt-1 pb-3">
              <div>
                <h2 className="text-base font-extrabold tracking-tight text-slate-900">
                  Chọn vị trí sự cố
                </h2>
                <p className="text-xs text-slate-500">
                  Tìm tên đường, giao lộ hoặc sử dụng GPS thực tế
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Đóng tìm kiếm địa điểm"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {/* Google Maps-style search input */}
            <div className="shrink-0 px-5 pb-3">
              <div className="flex h-12 items-center gap-2.5 rounded-2xl border border-slate-200 bg-slate-50/90 px-3.5 transition-colors focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/20">
                <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Nhập tên đường, địa điểm, quận..."
                  aria-label="Nhập địa chỉ cần tìm"
                  className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
                {isSearching && (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-emerald-500" aria-hidden="true" />
                )}
                {query.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      setSuggestions([]);
                      inputRef.current?.focus();
                    }}
                    aria-label="Xóa từ khóa"
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200/80 text-slate-600 hover:bg-slate-300"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>

            {/* High-accuracy GPS & Direct Map Pin quick rows */}
            <div className="shrink-0 space-y-2 border-y border-slate-100 px-5 py-2.5">
              <button
                type="button"
                data-testid="use-current-gps-btn"
                onClick={handleUseGpsClick}
                disabled={isLocatingGps}
                className="flex w-full items-center gap-3 rounded-2xl bg-emerald-50/80 px-3.5 py-2.5 text-left transition-colors hover:bg-emerald-50 active:scale-[0.99] disabled:opacity-75"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm shadow-emerald-500/30">
                  {isLocatingGps ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <LocateFixed className="h-4 w-4" aria-hidden="true" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="text-sm font-bold text-emerald-900">
                      {isLocatingGps ? 'Đang khóa tọa độ GPS chính xác...' : 'Sử dụng vị trí hiện tại của bạn'}
                    </p>
                    {!isLocatingGps && accuracyBadge && (
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 font-sans text-[10px] font-bold tabular-nums text-emerald-700">
                        {accuracyBadge}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-emerald-700/85">
                    {isLocatingGps
                      ? 'Thu thập tín hiệu vệ tinh có sai số nhỏ nhất'
                      : activeLocation.isCurrentGPS
                        ? activeLocation.address
                        : 'Định vị lại qua GPS của thiết bị'}
                  </p>
                </div>
              </button>

              <button
                type="button"
                data-testid="open-map-pin-picker-btn"
                onClick={handlePinOnMapClick}
                className="flex w-full items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-3.5 py-2 text-left transition-colors hover:border-amber-300 hover:bg-amber-50/40 active:scale-[0.99]"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-600">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900">Chọn trực tiếp trên bản đồ</p>
                  <p className="truncate text-[11px] text-slate-500">Kéo ghim tâm bản đồ tới chính xác vị trí xe hỏng</p>
                </div>
              </button>
            </div>

            {/* Autocomplete suggestions list */}
            <div className="flex-1 overflow-y-auto px-5 py-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <LocationSuggestionList
                query={query}
                isSearching={isSearching}
                suggestions={suggestions}
                onSelectSuggestion={(item) => {
                  onSelectSuggestion(item);
                  onClose();
                }}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
