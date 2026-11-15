import { MapPin } from 'lucide-react';

interface CenterPinOverlayProps {
  isDragging: boolean;
}

export function CenterPinOverlay({ isDragging }: CenterPinOverlayProps) {
  return (
    <div
      aria-hidden="true"
      data-testid="center-pin-overlay"
      className="pointer-events-none absolute inset-x-0 top-0 z-20 flex h-[66%] items-center justify-center"
    >
      <div className="relative flex -translate-y-6 flex-col items-center">
        <div
          className={`flex flex-col items-center transition-transform duration-200 ease-out ${
            isDragging ? '-translate-y-2.5 scale-105' : 'translate-y-0 scale-100'
          }`}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-amber-500 text-white shadow-xl shadow-amber-500/35 ring-4 ring-amber-500/20">
            <MapPin className="h-5 w-5 fill-white/20" />
          </div>
          <div className="-mt-0.5 h-3.5 w-1 rounded-b-full bg-amber-600 shadow-sm" />
        </div>
        <span
          className={`mt-0.5 h-2.5 w-2.5 rounded-full bg-amber-600/45 ring-4 ring-amber-500/20 transition-transform duration-200 ${
            isDragging ? 'scale-125 opacity-60' : 'scale-100 opacity-95'
          }`}
        />
      </div>
    </div>
  );
}
