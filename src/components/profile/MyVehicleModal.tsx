import { Bike, Check, Disc, ShieldAlert, X } from 'lucide-react';
import { useState } from 'react';
import type { UserProfileData } from '../../types/profile';

interface MyVehicleModalProps {
  isOpen: boolean;
  profile: UserProfileData;
  onSaveVehicle: (data: Pick<UserProfileData, 'bikeModel' | 'licensePlate' | 'tireType'>) => void;
  onClose: () => void;
}

export function MyVehicleModal({
  isOpen,
  profile,
  onSaveVehicle,
  onClose,
}: MyVehicleModalProps) {
  const [bikeModel, setBikeModel] = useState(profile.bikeModel);
  const [licensePlate, setLicensePlate] = useState(profile.licensePlate);
  const [tireType, setTireType] = useState<UserProfileData['tireType']>(profile.tireType || 'tubeless');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveVehicle({ bikeModel, licensePlate, tireType });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Quản lý thông tin xe máy"
      className="fixed inset-0 z-[120] flex items-end justify-center bg-slate-950/60 p-0 sm:items-center sm:p-4"
    >
      <div className="w-full max-w-[430px] rounded-t-[28px] border-t border-slate-100 bg-white p-5 shadow-2xl sm:rounded-[28px] sm:border">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Xe của tôi</h2>
            <p className="text-xs text-slate-500">Giúp thợ cứu hộ chuẩn bị chính xác đồ nghề và phụ tùng</p>
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">Dòng xe / Nhãn hiệu</label>
            <div className="relative">
              <Bike className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={bikeModel}
                onChange={(e) => setBikeModel(e.target.value)}
                placeholder="VD: Honda Air Blade 160, Lead, SH..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">Biển kiểm soát (Biển số xe)</label>
            <input
              type="text"
              required
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
              placeholder="VD: 59-X2 889.12"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-semibold text-slate-900 uppercase focus:border-emerald-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700">Loại lốp xe</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTireType('tubeless')}
                className={`flex items-center gap-2 rounded-xl border p-2.5 text-left transition-all ${
                  tireType === 'tubeless'
                    ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 ring-1 ring-emerald-500'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <Disc className={`h-4 w-4 ${tireType === 'tubeless' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <div>
                  <p className="text-xs font-bold">Lốp không săm</p>
                  <p className="text-[10px] text-slate-500">Vá ép nấm / vá dùi</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTireType('tube')}
                className={`flex items-center gap-2 rounded-xl border p-2.5 text-left transition-all ${
                  tireType === 'tube'
                    ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 ring-1 ring-emerald-500'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <ShieldAlert className={`h-4 w-4 ${tireType === 'tube' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <div>
                  <p className="text-xs font-bold">Lốp có săm</p>
                  <p className="text-[10px] text-slate-500">Vá săm / thay săm</p>
                </div>
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 text-sm font-bold text-white shadow-md shadow-emerald-500/20 transition-all hover:bg-emerald-700 active:scale-[0.98]"
            >
              <Check className="h-4 w-4" />
              <span>Cập nhật xe của tôi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
