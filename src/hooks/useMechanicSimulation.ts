import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  ChatMessage,
  GeoCoord,
  GeoJsonLineString,
  RescueStep,
  TrackingStatus,
} from '../types/rescue';
import { fetchMechanicDrivingRoute } from '../utils/osrmApi';
import { buildMechanicAutoReply } from '../utils/pricingAndSimLogic';

interface UseMechanicSimulationArgs {
  step: RescueStep;
  trackingStatus: TrackingStatus;
  mechanicStartCoord: GeoCoord;
  pickupCoord: GeoCoord;
  pickupTitle: string;
  mechanicName: string;
  onMechanicReply?: (replyText: string) => void;
}

export function useMechanicSimulation({
  step,
  trackingStatus,
  mechanicStartCoord,
  pickupCoord,
  pickupTitle,
  mechanicName,
  onMechanicReply,
}: UseMechanicSimulationArgs) {
  const [mechanicRoute, setMechanicRoute] = useState<GeoJsonLineString | null>(null);
  const [routeStartTimeMs, setRouteStartTimeMs] = useState<number | null>(null);
  const [initialEtaMinutes, setInitialEtaMinutes] = useState(5);
  const [liveEtaMinutes, setLiveEtaMinutes] = useState(5);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isMechanicTyping, setIsMechanicTyping] = useState(false);

  const replyTimerRef = useRef<number | null>(null);
  const initializedGreetingRef = useRef(false);
  const fetchedForRouteKeyRef = useRef<string | null>(null);
  const replyCbRef = useRef(onMechanicReply);
  replyCbRef.current = onMechanicReply;

  useEffect(() => {
    return () => {
      if (replyTimerRef.current !== null) {
        window.clearTimeout(replyTimerRef.current);
      }
    };
  }, []);

  // Fetch OSRM driving route once per accepted order (~700-900m away)
  useEffect(() => {
    const isActiveMechanicPhase =
      step === 'tracking' &&
      (trackingStatus === 'accepted' ||
        trackingStatus === 'arrived' ||
        trackingStatus === 'completed');

    if (!isActiveMechanicPhase) {
      fetchedForRouteKeyRef.current = null;
      setMechanicRoute(null);
      setRouteStartTimeMs(null);
      setInitialEtaMinutes(5);
      setLiveEtaMinutes(5);
      setIsMechanicTyping(false);
      setChatMessages([]);
      initializedGreetingRef.current = false;
      if (replyTimerRef.current !== null) {
        window.clearTimeout(replyTimerRef.current);
        replyTimerRef.current = null;
      }
      return;
    }

    if (
      (trackingStatus === 'accepted' || trackingStatus === 'arrived') &&
      !initializedGreetingRef.current
    ) {
      initializedGreetingRef.current = true;
      const shortName = mechanicName.split(' ').pop() || mechanicName;
      setChatMessages([
        {
          id: `msg-init-${Date.now()}`,
          sender: 'mechanic',
          text: `Chào bạn, mình là thợ ${shortName}. Mình đang chạy qua ${pickupTitle}, cần hỗ trợ gì bạn nhắn mình nhé!`,
          timestampLabel: 'Vừa xong',
        },
      ]);
    }

    const routeKey = `${mechanicStartCoord.lat.toFixed(5)},${mechanicStartCoord.lng.toFixed(5)}->${pickupCoord.lat.toFixed(5)},${pickupCoord.lng.toFixed(5)}`;
    if (fetchedForRouteKeyRef.current === routeKey) {
      return;
    }

    const controller = new AbortController();
    fetchMechanicDrivingRoute(mechanicStartCoord, pickupCoord, controller.signal).then(
      (res) => {
        if (controller.signal.aborted) return;
        fetchedForRouteKeyRef.current = routeKey;
        const startEta = Math.max(4, res.durationMinutes);
        setMechanicRoute(res.geometry);
        setInitialEtaMinutes(startEta);
        setLiveEtaMinutes(trackingStatus === 'accepted' ? startEta : 0);
        setRouteStartTimeMs(performance.now());
      },
    );

    return () => controller.abort();
  }, [
    step,
    trackingStatus,
    mechanicStartCoord.lat,
    mechanicStartCoord.lng,
    pickupCoord.lat,
    pickupCoord.lng,
    mechanicName,
    pickupTitle,
  ]);

  const sendChatMessage = useCallback(
    (rawText: string) => {
      const text = rawText.trim();
      if (!text) return;

      const now = new Date();
      const timeLabel = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes(),
      ).padStart(2, '0')}`;

      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg-u-${Date.now()}`,
          sender: 'user',
          text,
          timestampLabel: timeLabel,
        },
      ]);

      setIsMechanicTyping(true);
      if (replyTimerRef.current !== null) {
        window.clearTimeout(replyTimerRef.current);
      }

      const currentEta = liveEtaMinutes;
      replyTimerRef.current = window.setTimeout(() => {
        const replyText = buildMechanicAutoReply(text, pickupTitle, currentEta);
        const replyTime = new Date();
        const replyLabel = `${String(replyTime.getHours()).padStart(2, '0')}:${String(
          replyTime.getMinutes(),
        ).padStart(2, '0')}`;

        setChatMessages((prev) => [
          ...prev,
          {
            id: `msg-m-${Date.now()}`,
            sender: 'mechanic',
            text: replyText,
            timestampLabel: replyLabel,
          },
        ]);
        setIsMechanicTyping(false);
        replyTimerRef.current = null;
        replyCbRef.current?.(replyText);
      }, 1500);
    },
    [liveEtaMinutes, pickupTitle],
  );

  return {
    mechanicRoute,
    routeStartTimeMs,
    initialEtaMinutes,
    liveEtaMinutes,
    setLiveEtaMinutes,
    chatMessages,
    isMechanicTyping,
    sendChatMessage,
  };
}
