import { useCallback, useEffect, useRef, useState } from 'react';
import { getOrCreateCustomerId, isLiveDispatchEnabled } from '../lib/supabaseClient';
import {
  cancelLiveOrder,
  completeLiveOrder,
  createLiveOrder,
  type CreateOrderParams,
  type LiveOrderStatus,
  rehydrateActiveOrder,
  sendLiveMessage,
  subscribeLiveOrder,
} from '../services/liveDispatchEngine';
import type { GeoCoord, MechanicInfo, TrackingStatus } from '../types/rescue';

export interface LiveRehydrateData {
  orderId: string;
  trackingStatus: TrackingStatus;
  mechanic: MechanicInfo | null;
  otpCode: string;
  etaMinutes: number;
  serviceName: string;
  finalPrice: number;
  pickupAddress: string;
  pickupCoord: GeoCoord;
}

interface UseLiveDispatchProps {
  onStatusChange?: (status: TrackingStatus, mechanic: MechanicInfo | null) => void;
  onLocationUpdate?: (lat: number, lng: number, etaMinutes: number) => void;
  onMessageReceived?: (msg: { id: string; senderRole: 'customer' | 'mechanic'; content: string }) => void;
  onRehydrate?: (data: LiveRehydrateData) => void;
}

export function useLiveDispatch(props: UseLiveDispatchProps = {}) {
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [liveOrderId, setLiveOrderId] = useState<string | null>(null);
  const [liveMechanic, setLiveMechanic] = useState<MechanicInfo | null>(null);
  const [liveOtp, setLiveOtp] = useState<string | null>(null);
  const [liveEta, setLiveEta] = useState<number>(5);
  const [liveCoord, setLiveCoord] = useState<GeoCoord | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  // Tự động phục hồi ca cứu hộ khi F5 / mở lại trình duyệt
  useEffect(() => {
    if (!isLiveDispatchEnabled) return;
    let isSubscribed = true;
    (async () => {
      try {
        const customerId = await getOrCreateCustomerId();
        const active = await rehydrateActiveOrder(customerId);
        if (!isSubscribed || !active?.order) return;

        const order = active.order;
        const statusMap: Record<string, TrackingStatus> = {
          SEARCHING: 'searching', EN_ROUTE: 'accepted', ARRIVED: 'arrived',
        };
        const mappedStatus = statusMap[String(order.status)] || 'searching';
        const eta = Number(order.eta_minutes || 5);
        const otp = String(order.otp_code || '8492');

        setIsLiveMode(true);
        setLiveOrderId(String(order.id));
        setLiveMechanic(active.mechanic);
        setLiveOtp(otp);
        setLiveEta(eta);

        propsRef.current.onRehydrate?.({
          orderId: String(order.id),
          trackingStatus: mappedStatus,
          mechanic: active.mechanic,
          otpCode: otp,
          etaMinutes: eta,
          serviceName: String(order.service_name || 'Cứu hộ xe máy'),
          finalPrice: Number(order.final_price || 0),
          pickupAddress: String(order.pickup_address || ''),
          pickupCoord: { lat: Number(order.pickup_lat || 10.7769), lng: Number(order.pickup_lng || 106.7009) },
        });
      } catch {}
    })();
    return () => { isSubscribed = false; };
  }, []);

  // Lắng nghe Realtime kênh đơn cứu hộ
  useEffect(() => {
    if (!liveOrderId || !isLiveDispatchEnabled) return;
    const unsub = subscribeLiveOrder(liveOrderId, {
      onStatusChange: (status: LiveOrderStatus, _order, mech) => {
        if (mech) setLiveMechanic(mech);
        const mapped: Record<LiveOrderStatus, TrackingStatus> = {
          SEARCHING: 'searching', EN_ROUTE: 'accepted', ARRIVED: 'arrived',
          COMPLETED: 'completed', CANCELLED: 'completed',
        };
        propsRef.current.onStatusChange?.(mapped[status] || 'searching', mech || null);
      },
      onGpsTelemetry: (coords) => {
        setLiveEta(coords.etaMinutes);
      },
      onLocationUpdate: (lat, lng) => {
        setLiveCoord({ lat, lng });
        propsRef.current.onLocationUpdate?.(lat, lng, liveEta);
      },
      onMessageReceived: (msg) => {
        propsRef.current.onMessageReceived?.(msg);
      },
    });
    return () => unsub();
  }, [liveOrderId, liveEta]);

  const startLiveRescue = useCallback(async (params: CreateOrderParams) => {
    if (!isLiveDispatchEnabled) return null;
    const res = await createLiveOrder(params);
    setIsLiveMode(true);
    setLiveOrderId(res.orderId);
    setLiveOtp(res.otpCode);
    return res;
  }, []);

  const cancelLiveRescue = useCallback(async (reason = 'Khách hủy đơn', fee = 0) => {
    if (liveOrderId && isLiveMode) {
      await cancelLiveOrder(liveOrderId, reason, fee);
    }
    setIsLiveMode(false);
    setLiveOrderId(null);
    setLiveMechanic(null);
  }, [liveOrderId, isLiveMode]);

  const completeLiveRescue = useCallback(async () => {
    if (liveOrderId && isLiveMode) {
      await completeLiveOrder(liveOrderId, liveMechanic?.id);
    }
    setIsLiveMode(false);
    setLiveOrderId(null);
    setLiveMechanic(null);
  }, [liveOrderId, isLiveMode, liveMechanic?.id]);

  const sendChatMessage = useCallback(async (content: string) => {
    if (liveOrderId && isLiveMode) {
      await sendLiveMessage(liveOrderId, 'customer', content);
    }
  }, [liveOrderId, isLiveMode]);

  return {
    isLiveDispatchEnabled,
    isLiveMode,
    setIsLiveMode,
    liveOrderId,
    liveMechanic,
    liveOtp,
    liveEta,
    liveCoord,
    startLiveRescue,
    cancelLiveRescue,
    completeLiveRescue,
    sendChatMessage,
  };
}
