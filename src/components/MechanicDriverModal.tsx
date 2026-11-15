import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, Navigation, Radio, Send, ShieldCheck, UserCheck, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const MOCK_PARTNERS = [
  { id: 'mech-01', name: 'Nguyễn Minh Tuấn', licensePlate: '59-P2 842.19', phone: '0908412739' },
  { id: 'mech-02', name: 'Trần Hoàng Nam', licensePlate: '59-S3 519.04', phone: '0912345678' },
];

export function MechanicDriverModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [partnerId, setPartnerId] = useState(MOCK_PARTNERS[0].id);
  const [isOnline, setIsOnline] = useState(true);
  const [activeOrder, setActiveOrder] = useState<Record<string, unknown> | null>(null);
  const [pendingOrders, setPendingOrders] = useState<Array<Record<string, unknown>>>([]);
  const [simEta, setSimEta] = useState(5);
  const [gpsMode, setGpsMode] = useState<'sim' | 'device'>('sim');
  const [chatInput, setChatInput] = useState('');
  const channelRef = useRef<ReturnType<NonNullable<typeof supabase>['channel']> | null>(null);

  useEffect(() => {
    if (!isOpen || !isOnline || !supabase) return;
    const client = supabase;
    const ping = () => { client.from('mechanics').update({ status: 'ONLINE', last_ping_at: new Date().toISOString() }).eq('id', partnerId).then(); };
    ping();
    const interval = window.setInterval(ping, 20_000);
    return () => window.clearInterval(interval);
  }, [isOpen, isOnline, partnerId]);

  useEffect(() => {
    if (!isOpen || !isOnline || !supabase || activeOrder) return;
    const client = supabase;
    const fetchOrders = async () => {
      const { data } = await client.from('rescue_orders').select('*').eq('status', 'SEARCHING').limit(3);
      if (data) setPendingOrders(data);
    };
    fetchOrders();
    const channel = client.channel('driver_pool')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rescue_orders' }, () => fetchOrders()).subscribe();
    return () => { client.removeChannel(channel); };
  }, [isOpen, isOnline, activeOrder]);

  useEffect(() => {
    if (!activeOrder || !supabase) return;
    const client = supabase;
    const channel = client.channel(`order:${activeOrder.id}`).subscribe();
    channelRef.current = channel;
    const targetLat = Number(activeOrder.pickup_lat) || 10.7769;
    const targetLng = Number(activeOrder.pickup_lng) || 106.7009;
    let curLat = targetLat + 0.008; let curLng = targetLng + 0.008;

    const interval = window.setInterval(() => {
      if (gpsMode === 'sim') {
        curLat += (targetLat - curLat) * 0.12; curLng += (targetLng - curLng) * 0.12;
        setSimEta((prev) => Math.max(1, prev - 0.2));
        channel.send({ type: 'broadcast', event: 'gps_telemetry', payload: { lat: curLat, lng: curLng, etaMinutes: Math.round(simEta) } });
      }
    }, 3000);
    return () => { window.clearInterval(interval); client.removeChannel(channel); };
  }, [activeOrder, gpsMode, simEta]);

  const handleAcceptOrder = async (order: Record<string, unknown>) => {
    if (!supabase) { setActiveOrder(order); setPendingOrders([]); return; }
    const { error } = await supabase.rpc('accept_rescue_order', { p_order_id: order.id, p_mechanic_id: partnerId });
    if (!error) { setActiveOrder({ ...order, status: 'EN_ROUTE' }); setPendingOrders([]); }
    else alert('Đơn này đã được thợ khác nhận!');
  };

  const handleArrived = async () => {
    if (activeOrder && supabase) {
      await supabase.from('rescue_orders').update({ status: 'ARRIVED' }).eq('id', activeOrder.id);
      setActiveOrder((prev) => prev ? { ...prev, status: 'ARRIVED' } : null);
    }
  };

  const handleFinish = async () => {
    if (activeOrder && supabase) {
      await supabase.from('rescue_orders').update({ status: 'COMPLETED', completed_at: new Date().toISOString() }).eq('id', activeOrder.id);
      await supabase.from('mechanics').update({ status: 'ONLINE' }).eq('id', partnerId);
    }
    setActiveOrder(null);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !activeOrder || !supabase) return;
    await supabase.from('rescue_messages').insert({ order_id: activeOrder.id, sender_role: 'mechanic', content: chatInput.trim() });
    setChatInput('');
  };

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/70 p-3 backdrop-blur-xs select-none">
      <div className="flex max-h-[92vh] w-full max-w-[390px] flex-col overflow-hidden rounded-3xl border border-emerald-500/35 bg-[#090D16] text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-400/30">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-black tracking-wide uppercase text-emerald-300">MotoSOS Partner</p>
              <p className="text-[10px] text-slate-400">Ứng dụng dành cho Thợ trực ban</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng" className="rounded-full p-1 text-slate-400 hover:bg-white/10 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs">
          {/* Chọn thợ & Toggle Online */}
          <div className="flex items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/5 p-2.5">
            <select value={partnerId} onChange={(e) => setPartnerId(e.target.value)} className="bg-transparent font-bold text-white outline-none cursor-pointer text-xs">
              {MOCK_PARTNERS.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-white">{p.name} • {p.licensePlate}</option>
              ))}
            </select>
            <button type="button" onClick={() => setIsOnline(!isOnline)} className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 font-extrabold text-[10.5px] transition-colors ${isOnline ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
              <Radio className={`h-3 w-3 ${isOnline ? 'animate-pulse' : ''}`} />
              <span>{isOnline ? 'TRỰC TUYẾN' : 'OFFLINE'}</span>
            </button>
          </div>

          {!activeOrder ? (
            /* Danh sách đơn tìm thợ */
            <div className="space-y-2">
              <p className="font-bold text-slate-400 text-[11px] uppercase tracking-wider">Đơn cứu hộ chờ nhận ({pendingOrders.length})</p>
              {pendingOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 p-6 text-center text-slate-400">
                  <UserCheck className="h-8 w-8 text-slate-500 mb-2 opacity-50" />
                  <p className="font-semibold">Chưa có cuốc cứu hộ mới</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Hệ thống đang quét đơn khách hàng trong 3km...</p>
                </div>
              ) : (
                pendingOrders.map((o) => (
                  <div key={String(o.id)} className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-3 space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="font-extrabold text-white text-xs">{String(o.service_name || 'Cứu hộ')}</span>
                      <span className="font-mono font-black text-emerald-400 text-xs">{Number(o.final_price || 0).toLocaleString()}đ</span>
                    </div>
                    <p className="text-[11px] text-slate-300 truncate">📍 {String(o.pickup_address || '')}</p>
                    <button type="button" onClick={() => handleAcceptOrder(o)} className="w-full rounded-xl bg-emerald-500 py-2 font-black text-slate-950 hover:bg-emerald-400 transition-colors">
                      Nhận đơn ngay (3km)
                    </button>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Đang thực hiện đơn */
            <div className="rounded-2xl border border-amber-400/40 bg-amber-950/20 p-3 space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="rounded-full bg-amber-400/20 border border-amber-400/40 px-2 py-0.5 font-bold text-amber-300 text-[10px]">
                  {activeOrder.status === 'ARRIVED' ? 'ĐÃ TỚI NƠI' : 'ĐANG TỚI ĐIỂM HẸN'}
                </span>
                <span className="font-mono font-bold text-xs text-white">Mã OTP: <span className="text-amber-400 font-extrabold">{String(activeOrder.otp_code || '----')}</span></span>
              </div>
              <p className="text-[11.5px] text-slate-200">📍 {String(activeOrder.pickup_address || '')}</p>

              {/* Chế độ phát GPS */}
              <div className="flex items-center justify-between rounded-xl bg-black/40 p-2 text-[10.5px]">
                <span className="text-slate-400 flex items-center gap-1"><Navigation className="h-3 w-3 text-emerald-400" /> Bắn GPS 3s:</span>
                <div className="flex gap-1">
                  <button type="button" onClick={() => setGpsMode('sim')} className={`px-2 py-0.5 rounded-md ${gpsMode === 'sim' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'}`}>Mô phỏng</button>
                  <button type="button" onClick={() => setGpsMode('device')} className={`px-2 py-0.5 rounded-md ${gpsMode === 'device' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'}`}>GPS thật</button>
                </div>
              </div>

              {/* Chat mini */}
              <div className="flex gap-1 pt-1">
                <input
                  type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Nhắn tin cho khách..."
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white placeholder-slate-500 outline-none"
                />
                <button type="button" onClick={handleSendMessage} className="rounded-xl bg-white/10 px-2.5 text-emerald-400 hover:bg-white/20">
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Nút hành động */}
              <div className="flex gap-2 pt-1">
                {activeOrder.status !== 'ARRIVED' ? (
                  <button type="button" onClick={handleArrived} className="flex-1 rounded-xl bg-amber-400 py-2 font-black text-slate-950 hover:bg-amber-300">
                    Báo đã tới điểm hẹn
                  </button>
                ) : (
                  <button type="button" onClick={handleFinish} className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-emerald-500 py-2 font-black text-slate-950 hover:bg-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Xác nhận & Xong cuốc</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
