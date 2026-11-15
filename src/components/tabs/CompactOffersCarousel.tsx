import { ArrowRight, Sparkles, Tag } from 'lucide-react';
import {
  CAMPAIGN_BANNERS,
  PARTNER_PERKS,
  type CampaignBannerItem,
  type PartnerPerkItem,
} from '../../data/homePromotions';
import { useSmoothHorizontalWheel } from '../../hooks/useSmoothHorizontalWheel';

interface CompactOffersCarouselProps {
  onSelectCampaignBanner: (banner: CampaignBannerItem) => void;
  onSelectPartnerPerk: (perk: PartnerPerkItem) => void;
}

type CombinedOffer =
  | { kind: 'banner'; data: CampaignBannerItem }
  | { kind: 'perk'; data: PartnerPerkItem };

export function CompactOffersCarousel({
  onSelectCampaignBanner,
  onSelectPartnerPerk,
}: CompactOffersCarouselProps) {
  const { containerRef, isHovered, isDragging, dragHandlers, consumeDidDrag } =
    useSmoothHorizontalWheel();

  const offers: CombinedOffer[] = [
    { kind: 'banner', data: CAMPAIGN_BANNERS[0] },
    { kind: 'banner', data: CAMPAIGN_BANNERS[1] },
    { kind: 'banner', data: CAMPAIGN_BANNERS[2] },
    { kind: 'perk', data: PARTNER_PERKS[0] },
    { kind: 'perk', data: PARTNER_PERKS[2] },
  ];

  return (
    <section aria-label="Ưu đãi & Đặc quyền 24/7" className="mt-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-amber-500" aria-hidden="true" />
          <h2 className="text-sm font-bold tracking-tight text-slate-900">
            Ưu Đãi &amp; Đặc Quyền 24/7
          </h2>
        </div>
        <span
          className={`text-[11px] font-semibold transition-colors duration-200 ${
            isHovered ? 'text-amber-500 font-bold' : 'text-slate-400'
          }`}
        >
          Thành viên
        </span>
      </div>

      <div
        ref={containerRef}
        {...dragHandlers}
        className={`-mx-4 mt-2.5 flex items-stretch gap-2.5 overflow-x-auto overscroll-x-contain px-4 py-1.5 select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {offers.map((item, idx) => {
          const isBanner = item.kind === 'banner';
          const title = item.data.title;
          const tag = isBanner ? item.data.tag : 'ĐẶC QUYỀN';
          const voucher = item.data.voucherId;
          const desc = isBanner ? item.data.ctaLabel : item.data.description;

          return (
            <button
              key={`${item.kind}-${isBanner ? item.data.id : item.data.id}-${idx}`}
              type="button"
              onClick={() => {
                if (consumeDidDrag()) return;
                if (isBanner) onSelectCampaignBanner(item.data);
                else onSelectPartnerPerk(item.data);
              }}
              className="flex w-[225px] shrink-0 flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-3 text-left shadow-xs select-none focus-visible:outline-none transform-gpu transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-[0_12px_26px_-6px_rgba(16,185,129,0.16),0_4px_12px_-2px_rgba(15,23,42,0.06)] active:scale-[0.985]"
            >
              <div>
                <div className="flex items-center justify-between gap-1.5">
                  <span className="rounded-full border border-amber-300/50 bg-amber-400/15 px-2 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wide text-amber-800">
                    {tag}
                  </span>
                  {voucher && (
                    <span className="flex items-center gap-0.5 rounded-md border border-emerald-200/80 bg-emerald-50 px-1.5 py-0.5 font-mono text-[9.5px] font-bold text-emerald-700">
                      <Tag className="h-2.5 w-2.5" />
                      <span>{voucher}</span>
                    </span>
                  )}
                </div>

                <p className="mt-2 line-clamp-1 text-xs font-extrabold text-slate-900">
                  {title}
                </p>
                <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-slate-500">
                  {isBanner ? `Chạm để nhận mã và áp dụng ngay.` : desc}
                </p>
              </div>

              <div className="mt-2.5 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                <span>Áp dụng ưu đãi</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
