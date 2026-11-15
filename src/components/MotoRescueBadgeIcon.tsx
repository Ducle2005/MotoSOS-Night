import { MessageSquareHeart, Navigation, ShieldAlert, ShieldCheck, Sparkles } from 'lucide-react';

export type MotoRescueBadgeVariant =
  | 'dispatch'
  | 'en_route'
  | 'verified'
  | 'promo'
  | 'sos'
  | 'chat';

interface MotoRescueBadgeIconProps {
  variant?: MotoRescueBadgeVariant;
  className?: string;
}

export function resolveBadgeVariant(type?: string, title?: string): MotoRescueBadgeVariant {
  if (type === 'promo') return 'promo';
  if (type === 'safety' || type === 'sos') return 'sos';
  if (type === 'chat') return 'chat';
  const t = (title || '').toLowerCase();
  if (t.includes('tới') || t.includes('di chuyển') || t.includes('đang đến')) return 'en_route';
  if (t.includes('hoàn tất') || t.includes('xác thực') || t.includes('đã tới')) return 'verified';
  return 'dispatch';
}

export function MotoRescueBadgeIcon({
  variant = 'dispatch',
  className = 'h-5 w-5',
}: MotoRescueBadgeIconProps) {
  switch (variant) {
    case 'en_route':
      return <Navigation className={className} aria-hidden="true" />;
    case 'verified':
      return <ShieldCheck className={className} aria-hidden="true" />;
    case 'promo':
      return <Sparkles className={className} aria-hidden="true" />;
    case 'chat':
      return <MessageSquareHeart className={className} aria-hidden="true" />;
    case 'sos':
      return <ShieldAlert className={className} aria-hidden="true" />;
    case 'dispatch':
    default:
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path d="M12 2l7 3v6c0 5.5-3.8 10.3-7 11.5C8.8 21.3 5 16.5 5 11V5l7-3z" />
          <path
            d="M12.5 6.5L8.5 12h3.2L10.5 17.5 15.5 11h-3.2L13.5 6.5z"
            fill="currentColor"
            stroke="none"
          />
        </svg>
      );
  }
}
