import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  cancelLiveOrder,
  completeLiveOrder,
  createGpsInterpolator,
  createLiveOrder,
  mapDbMechanicToInfo,
  rehydrateActiveOrder,
  sendLiveMessage,
  subscribeLiveOrder,
} from './liveDispatchEngine';

describe('liveDispatchEngine unit tests', () => {
  it('mapDbMechanicToInfo accurately maps database fields to MechanicInfo', () => {
    const dbRecord = {
      id: 'mech-001',
      name: 'Trần Văn Hoàng',
      phone: '0912345678',
      license_plate: '59-S1 999.88',
      vehicle_model: 'Honda Future 125',
      rating: 4.95,
      completed_rescues: 240,
      distance_km: 0.8,
      current_lat: 10.7712,
      current_lng: 106.6987,
    };

    const mapped = mapDbMechanicToInfo(dbRecord, 3);
    assert.strictEqual(mapped.id, 'mech-001');
    assert.strictEqual(mapped.name, 'Trần Văn Hoàng');
    assert.strictEqual(mapped.phone, '0912345678');
    assert.strictEqual(mapped.licensePlate, '59-S1 999.88');
    assert.strictEqual(mapped.vehicleModel, 'Honda Future 125');
    assert.strictEqual(mapped.rating, 4.95);
    assert.strictEqual(mapped.completedRescues, 240);
    assert.strictEqual(mapped.etaMinutes, 3);
    assert.strictEqual(mapped.distanceKm, 0.8);
    assert.strictEqual(mapped.coord.lat, 10.7712);
    assert.strictEqual(mapped.coord.lng, 106.6987);
  });

  it('createGpsInterpolator immediately delivers first position and supports cancellation', () => {
    const received: Array<{ lat: number; lng: number }> = [];
    const interpolator = createGpsInterpolator((lat, lng) => {
      received.push({ lat, lng });
    }, 100);

    interpolator.pushTarget(10.77, 106.70);
    assert.strictEqual(received.length, 1);
    assert.strictEqual(received[0].lat, 10.77);
    assert.strictEqual(received[0].lng, 106.70);

    interpolator.cancel();
    assert.doesNotThrow(() => interpolator.cancel());
  });

  it('createLiveOrder generates valid 4-digit OTP and safe mock fallback when Supabase is null', async () => {
    const order = await createLiveOrder({
      serviceType: 'flat_tire',
      serviceName: 'Lủng lốp xe máy',
      basePrice: 65000,
      finalPrice: 65000,
      pickupAddress: '63 Lý Tự Trọng, Q.1',
      pickupLat: 10.7769,
      pickupLng: 106.7009,
    });

    assert.ok(order.orderId);
    assert.strictEqual(order.otpCode.length, 4);
    assert.ok(/^\d{4}$/.test(order.otpCode));
    assert.ok(typeof order.nearbyMechanicsCount === 'number');
  });

  it('graceful lifecycle execution when Supabase is inactive', async () => {
    const active = await rehydrateActiveOrder('cust_test');
    assert.strictEqual(active, null);

    const cancelled = await cancelLiveOrder('mock_order_123', 'Đổi ý', 0);
    assert.strictEqual(cancelled.success, true);

    const completed = await completeLiveOrder('mock_order_123', 'mech_1');
    assert.strictEqual(completed.success, true);

    const msg = await sendLiveMessage('mock_order_123', 'customer', 'Tôi đang đứng gần cây xăng');
    assert.strictEqual(msg.content, 'Tôi đang đứng gần cây xăng');
    assert.strictEqual(msg.senderRole, 'customer');

    const unsubscribe = subscribeLiveOrder('mock_order_123', {});
    assert.strictEqual(typeof unsubscribe, 'function');
    assert.doesNotThrow(() => unsubscribe());
  });
});
