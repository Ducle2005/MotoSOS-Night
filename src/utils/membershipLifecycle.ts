export const MEMBERSHIP_SUB_KEY = 'motosos_membership_sub';
export const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export interface MembershipSubscription {
  planId: string;
  subscribedAt: number; // timestamp lúc mua gói
  expiresAt: number;    // subscribedAt + 30 * 24 * 60 * 60 * 1000 (đúng 1 tháng)
  autoRenew: boolean;   // true = đang gia hạn tự động; false = đã hủy gia hạn
  cancelledAt?: number;
  cancelReason?: string;
}

let memorySub: MembershipSubscription | null = null;

export function getMembershipSubscription(currentPlanId = 'priority_247'): MembershipSubscription {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    if (!memorySub) {
      const now = Date.now();
      memorySub = { planId: currentPlanId, subscribedAt: now, expiresAt: now + THIRTY_DAYS_MS, autoRenew: true };
    }
    return memorySub;
  }
  try {
    const raw = localStorage.getItem(MEMBERSHIP_SUB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as MembershipSubscription;
      if (parsed && typeof parsed.expiresAt === 'number') return parsed;
    }
  } catch {}

  const now = Date.now();
  const fallback: MembershipSubscription = {
    planId: currentPlanId,
    subscribedAt: now,
    expiresAt: now + THIRTY_DAYS_MS,
    autoRenew: true,
  };
  saveMembershipSubscription(fallback);
  return fallback;
}

export function saveMembershipSubscription(sub: MembershipSubscription): void {
  memorySub = sub;
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(MEMBERSHIP_SUB_KEY, JSON.stringify(sub));
      window.dispatchEvent(new CustomEvent('motosos_membership_sub_changed', { detail: sub }));
      window.dispatchEvent(new CustomEvent('motosos_membership_changed', { detail: { id: sub.planId } }));
    } catch {}
  }
}

export function recordNewSubscription(planId: string): MembershipSubscription {
  const now = Date.now();
  const newSub: MembershipSubscription = {
    planId,
    subscribedAt: now,
    expiresAt: now + THIRTY_DAYS_MS,
    autoRenew: true,
  };
  saveMembershipSubscription(newSub);
  return newSub;
}

/**
 * Hủy gia hạn gói nhưng bảo lưu 100% quyền lợi đến hết 30 ngày (expiresAt giữ nguyên)
 */
export function cancelSubscriptionAutoRenew(reason = 'Người dùng hủy gia hạn'): MembershipSubscription {
  const current = getMembershipSubscription();
  const updated: MembershipSubscription = {
    ...current,
    autoRenew: false,
    cancelledAt: Date.now(),
    cancelReason: reason,
  };
  saveMembershipSubscription(updated);
  return updated;
}

/**
 * Khôi phục tự động gia hạn 1 chạm
 */
export function reactivateSubscriptionAutoRenew(): MembershipSubscription {
  const current = getMembershipSubscription();
  const updated: MembershipSubscription = {
    ...current,
    autoRenew: true,
    cancelledAt: undefined,
    cancelReason: undefined,
  };
  saveMembershipSubscription(updated);
  return updated;
}

export function getDaysRemaining(expiresAt: number): number {
  const diff = expiresAt - Date.now();
  return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
}

export function isSubscriptionBenefitActive(sub?: MembershipSubscription): boolean {
  if (!sub) return true;
  return Date.now() <= sub.expiresAt;
}

export function formatDateVi(timestamp: number): string {
  try {
    const d = new Date(timestamp);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}/${d.getFullYear()}`;
  } catch {
    return '17/12/2026';
  }
}
