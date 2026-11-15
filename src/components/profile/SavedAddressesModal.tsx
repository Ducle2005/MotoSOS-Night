import { Briefcase, Check, GraduationCap, Home, MapPin, Navigation, Plus, X } from 'lucide-react';
import { useState } from 'react';
import type { SavedAddressItem } from '../../types/profile';

interface SavedAddressesModalProps {
  isOpen: boolean;
  addresses: SavedAddressItem[];
  onSelectAddress: (addr: SavedAddressItem) => void;
  onSaveAddresses: (list: SavedAddressItem[]) => void;
  onClose: () => void;
}

const TAG_ICONS = {
  home: Home,
  work: Briefcase,
  school: GraduationCap,
  other: MapPin,
};

export function SavedAddressesModal({
  isOpen,
  addresses,
  onSelectAddress,
  onSaveAddresses,
  onClose,
}: SavedAddressesModalProps) {
  const [list, setList] = useState<SavedAddressItem[]>(addresses);
  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newAddress, setNewAddress] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim() || !newAddress.trim()) return;
    const newItem: SavedAddressItem = {
      id: `addr-${Date.now()}`,
      tag: 'other',
      label: newLabel.trim(),
      address: newAddress.trim(),
      lat: 10.7769,
      lng: 106.7009,
    };
    const updated = [...list, newItem];
    setList(updated);
    onSaveAddresses(updated);
    setIsAdding(false);
    setNewLabel('');
    setNewAddress('');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Địa chỉ đã lưu"
      className="fixed inset-0 z-[120] flex items-end justify-center bg-slate-950/60 p-0 sm:items-center sm:p-4"
    >
      <div className="w-full max-w-[430px] rounded-t-[28px] border-t border-slate-100 bg-white p-5 shadow-2xl sm:rounded-[28px] sm:border">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Địa chỉ đã lưu</h2>
            <p className="text-xs text-slate-500">Chọn nhanh điểm cứu hộ hoặc địa điểm thường lui tới</p>
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

        <div className="mt-4 space-y-2.5 max-h-[300px] overflow-y-auto no-scrollbar">
          {list.map((item) => {
            const Icon = TAG_ICONS[item.tag] || MapPin;
            return (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3 hover:border-emerald-300 transition-colors"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-2xs">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900">{item.label}</p>
                    <p className="truncate text-[11px] text-slate-500">{item.address}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSelectAddress(item);
                    onClose();
                  }}
                  className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 active:scale-95 transition-all"
                >
                  <Navigation className="h-3 w-3" />
                  <span>Chọn</span>
                </button>
              </div>
            );
          })}
        </div>

        {isAdding ? (
          <form onSubmit={handleAdd} className="mt-3.5 space-y-2 rounded-2xl border border-slate-200 bg-white p-3">
            <input
              type="text"
              required
              placeholder="Tên địa điểm (VD: Nhà bạn gái, Quán quen...)"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-500"
            />
            <input
              type="text"
              required
              placeholder="Địa chỉ cụ thể đường, phường, quận..."
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-500"
            />
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="flex-1 rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
              >
                Lưu địa chỉ
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="mt-3.5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 py-2.5 text-xs font-bold text-slate-600 hover:border-emerald-500 hover:text-emerald-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Thêm địa chỉ mới</span>
          </button>
        )}
      </div>
    </div>
  );
}
