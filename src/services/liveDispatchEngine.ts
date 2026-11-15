import { getOrCreateCustomerId, supabase } from '../lib/supabaseClient';
import type { MechanicInfo } from '../types/rescue';

export type LiveOrderStatus = 'SEARCHING' | 'EN_ROUTE' | 'ARRIVED' | 'COMPLETED' | 'CANCELLED';

export interface CreateOrderParams {
  serviceType: string;
  serviceName: string;
  basePrice: number;
  finalPrice: number;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
}

export interface LiveOrderCallbacks {
  onStatusChange?: (status: LiveOrderStatus, order: Record<string, unknown>, mechanic?: MechanicInfo | null) => void;
  onMessageReceived?: (message: { id: string; senderRole: 'customer' | 'mechanic'; content: string; createdAt: string }) => void;
  onGpsTelemetry?: (coords: { lat: number; lng: number; etaMinutes: number }) => void;
  onLocationUpdate?: (lat: number, lng: number) => void;
}

export function createGpsInterpolator(onUpdate: (lat: number, lng: number) => void, duration = 3000) {
  let curLat: number | null = null;
  let curLng: number | null = null;
  let rafId: number | null = null;
  let isCancelled = false;

  return {
    pushTarget: (targetLat: number, targetLng: number) => {
      if (curLat === null || curLng === null) {
        curLat = targetLat; curLng = targetLng;
        onUpdate(targetLat, targetLng);
        return;
      }
      if (rafId !== null && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(rafId);
      const startLat = curLat; const startLng = curLng;
      const startMs = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const frame = (now: number) => {
        if (isCancelled) return;
        const progress = Math.min(1, Math.max(0, (now - startMs) / duration));
        curLat = startLat + (targetLat - startLat) * progress;
        curLng = startLng + (targetLng - startLng) * progress;
        onUpdate(curLat, curLng);
        if (progress < 1 && typeof requestAnimationFrame === 'function') rafId = requestAnimationFrame(frame);
      };
      if (typeof requestAnimationFrame === 'function') rafId = requestAnimationFrame(frame);
      else onUpdate(targetLat, targetLng);
    },
    cancel: () => {
      isCancelled = true;
      if (rafId !== null && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(rafId);
    },
  };
}

export function mapDbMechanicToInfo(db: Record<string, unknown>, etaMinutes = 5): MechanicInfo {
  return {
    id: String(db.id || 'mech-default'),
    name: String(db.name || 'Thợ cứu hộ MotoSOS'),
    phone: String(db.phone || '0908412739'),
    licensePlate: String(db.license_plate || '59-P2 842.19'),
    vehicleModel: String(db.vehicle_model || 'Honda Wave RSX'),
    rating: Number(db.rating || 4.9),
    completedRescues: Number(db.completed_rescues || 120),
    etaMinutes,
    distanceKm: Number(db.distance_km || 1.2),
    coord: { lat: Number(db.current_lat || 10.7769), lng: Number(db.current_lng || 106.7009) },
  };
}

export async function createLiveOrder(order: CreateOrderParams) {
  const customerId = await getOrCreateCustomerId();
  const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
  if (!supabase) return { orderId: `mock_${Date.now()}`, otpCode, nearbyMechanicsCount: 3 };

  const { data, error } = await supabase.from('rescue_orders').insert({
    customer_id: customerId, service_type: order.serviceType, service_name: order.serviceName,
    base_price: order.basePrice, final_price: order.finalPrice, pickup_address: order.pickupAddress,
    pickup_lat: order.pickupLat, pickup_lng: order.pickupLng, otp_code: otpCode, status: 'SEARCHING',
  }).select().single();

  if (error || !data) throw error || new Error('Không thể tạo đơn cứu hộ trên Supabase');

  let nearbyMechanicsCount = 0;
  try {
    const rpcRes = await supabase.rpc('find_nearby_mechanics', {
      p_lat: order.pickupLat, p_lng: order.pickupLng, p_radius_meters: 3000,
    });
    nearbyMechanicsCount = Array.isArray(rpcRes.data) ? rpcRes.data.length : 0;
  } catch {}

  const channel = supabase.channel('motosos-dispatch-pool');
  channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      channel.send({
        type: 'broadcast', event: 'new_order',
        payload: { orderId: data.id, customerId, pickupLat: order.pickupLat, pickupLng: order.pickupLng },
      });
    }
  });

  return { orderId: data.id as string, otpCode, nearbyMechanicsCount };
}

export function subscribeLiveOrder(orderId: string, callbacks: LiveOrderCallbacks): () => void {
  if (!supabase) return () => {};
  const client = supabase;
  const interpolator = callbacks.onLocationUpdate ? createGpsInterpolator(callbacks.onLocationUpdate) : null;

  const orderChannel = client.channel(`order_sync_${orderId}`)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rescue_orders', filter: `id=eq.${orderId}` },
      async (payload) => {
        const newOrder = payload.new as Record<string, unknown>;
        let mechanicInfo: MechanicInfo | null = null;
        if (newOrder.mechanic_id) {
          const { data: mech } = await client.from('mechanics').select('*').eq('id', newOrder.mechanic_id).maybeSingle();
          if (mech) mechanicInfo = mapDbMechanicToInfo(mech, Number(newOrder.eta_minutes || 5));
        }
        callbacks.onStatusChange?.(newOrder.status as LiveOrderStatus, newOrder, mechanicInfo);
      })
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'rescue_messages', filter: `order_id=eq.${orderId}` },
      (payload) => {
        const msg = payload.new as Record<string, unknown>;
        callbacks.onMessageReceived?.({
          id: String(msg.id), senderRole: msg.sender_role as 'customer' | 'mechanic',
          content: String(msg.content), createdAt: String(msg.created_at),
        });
      })
    .subscribe();

  const teleChannel = client.channel(`order:${orderId}`)
    .on('broadcast', { event: 'gps_telemetry' }, ({ payload }) => {
      const { lat, lng, etaMinutes } = payload as { lat: number; lng: number; etaMinutes: number };
      callbacks.onGpsTelemetry?.({ lat, lng, etaMinutes });
      interpolator?.pushTarget(lat, lng);
    })
    .subscribe();

  return () => {
    interpolator?.cancel();
    client.removeChannel(orderChannel);
    client.removeChannel(teleChannel);
  };
}

export async function rehydrateActiveOrder(customerIdParam?: string) {
  if (!supabase) return null;
  const customerId = customerIdParam || (await getOrCreateCustomerId());
  const { data, error } = await supabase
    .from('rescue_orders')
    .select('*, mechanics(*)')
    .eq('customer_id', customerId)
    .in('status', ['SEARCHING', 'EN_ROUTE', 'ARRIVED'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  const orderData = data as Record<string, unknown>;
  const mechanicData = (orderData.mechanics || orderData.mechanic) as Record<string, unknown> | null;
  const mechanic = mechanicData ? mapDbMechanicToInfo(mechanicData, Number(orderData.eta_minutes || 5)) : null;
  return { order: orderData, mechanic };
}

export async function cancelLiveOrder(orderId: string, cancelReason = 'Khách hủy đơn', cancelFee = 0) {
  if (!supabase) return { success: true };
  const { data: order } = await supabase.from('rescue_orders').select('mechanic_id, status').eq('id', orderId).maybeSingle();
  if (order?.status === 'ARRIVED' || order?.status === 'COMPLETED') {
    return { success: false, error: 'Kỹ thuật viên đã tới điểm hẹn, không thể hủy' };
  }
  const { error } = await supabase.from('rescue_orders').update({
    status: 'CANCELLED', cancel_reason: cancelReason, cancel_fee: cancelFee, cancelled_at: new Date().toISOString(),
  }).eq('id', orderId).in('status', ['SEARCHING', 'ACCEPTED', 'EN_ROUTE']);

  if (order?.mechanic_id) {
    await supabase.from('mechanics').update({ status: 'ONLINE' }).eq('id', order.mechanic_id);
  }
  return { success: !error };
}

export async function completeLiveOrder(orderId: string, mechanicId?: string) {
  if (!supabase) return { success: true };
  const { error } = await supabase.from('rescue_orders').update({
    status: 'COMPLETED', completed_at: new Date().toISOString(),
  }).eq('id', orderId);

  if (mechanicId) {
    await supabase.from('mechanics').update({ status: 'ONLINE' }).eq('id', mechanicId);
  }
  return { success: !error };
}

export async function sendLiveMessage(orderId: string, senderRole: 'customer' | 'mechanic', content: string) {
  if (!supabase) return { id: `msg_${Date.now()}`, orderId, senderRole, content, createdAt: new Date().toISOString() };
  const { data, error } = await supabase.from('rescue_messages').insert({
    order_id: orderId, sender_role: senderRole, content: content.trim(),
  }).select().single();
  if (error) throw error;
  return data;
}
