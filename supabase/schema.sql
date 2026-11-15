-- ==============================================================================
-- MotoSOS - Schema Khởi Tạo Hệ Thống Cứu Hộ Khẩn Cấp Ban Đêm 24/7 (Supabase)
-- Phiên bản: 1.0 (Production Ready - Chạy 1 lần trong SQL Editor)
-- ==============================================================================

-- Bật extension pgcrypto để sinh UUID ngẫu nhiên nếu chưa có
create extension if not exists "pgcrypto";

-- ==============================================================================
-- 1. BẢNG KỸ THUẬT VIÊN / ĐỐI TÁC CỨU HỘ (mechanics)
-- ==============================================================================
create table if not exists public.mechanics (
  id text primary key,
  name text not null,
  phone text not null,
  license_plate text not null,
  vehicle_model text default 'Honda Wave RSX',
  rating numeric(2, 1) default 4.9,
  completed_rescues int default 120,
  current_lat double precision default 10.7769,
  current_lng double precision default 106.7009,
  status text not null default 'ONLINE' check (status in ('ONLINE', 'BUSY', 'OFFLINE')),
  last_ping_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Index tối ưu truy vấn trạng thái thợ đang online
create index if not exists idx_mechanics_status on public.mechanics(status);
create index if not exists idx_mechanics_coords on public.mechanics(current_lat, current_lng);

-- ==============================================================================
-- 2. BẢNG ĐƠN CỨU HỘ (rescue_orders)
-- ==============================================================================
create table if not exists public.rescue_orders (
  id uuid default gen_random_uuid() primary key,
  customer_id text not null,
  mechanic_id text references public.mechanics(id) on update cascade on delete set null,
  service_type text not null,
  service_name text not null,
  base_price numeric not null,
  final_price numeric not null,
  pickup_address text not null,
  pickup_lat double precision not null,
  pickup_lng double precision not null,
  otp_code text not null,
  status text not null default 'SEARCHING' check (status in ('SEARCHING', 'EN_ROUTE', 'ARRIVED', 'COMPLETED', 'CANCELLED')),
  eta_minutes int default 5,
  cancel_reason text,
  cancel_fee numeric default 0,
  created_at timestamptz default now(),
  cancelled_at timestamptz,
  completed_at timestamptz
);

-- Index tăng tốc truy vấn đơn cứu hộ theo khách hàng và trạng thái
create index if not exists idx_rescue_orders_customer on public.rescue_orders(customer_id, created_at desc);
create index if not exists idx_rescue_orders_status on public.rescue_orders(status);
create index if not exists idx_rescue_orders_mechanic on public.rescue_orders(mechanic_id);

-- ==============================================================================
-- 3. BẢNG TIN NHẮN TRÒ CHUYỆN KHÁCH - THỢ (rescue_messages)
-- ==============================================================================
create table if not exists public.rescue_messages (
  id uuid default gen_random_uuid() primary key,
  order_id uuid not null references public.rescue_orders(id) on delete cascade,
  sender_role text not null check (sender_role in ('customer', 'mechanic')),
  content text not null,
  created_at timestamptz default now()
);

-- Index tìm nhanh lịch sử chat theo mã đơn
create index if not exists idx_rescue_messages_order on public.rescue_messages(order_id, created_at asc);

-- ==============================================================================
-- 4. BẬT FULL REPLICA IDENTITY (Để Supabase Realtime gửi đầy đủ dữ liệu cập nhật)
-- ==============================================================================
alter table public.mechanics replica identity full;
alter table public.rescue_orders replica identity full;
alter table public.rescue_messages replica identity full;

-- ==============================================================================
-- 5. BẬT SUPABASE REALTIME (Tự động thông báo khi có đơn mới, đổi trạng thái, chat)
-- ==============================================================================
do $$
begin
  alter publication supabase_realtime add table public.mechanics;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.rescue_orders;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.rescue_messages;
exception when duplicate_object then null;
end $$;

-- ==============================================================================
-- 6. PHÂN QUYỀN ROW LEVEL SECURITY (RLS) - Cho phép gọi từ Web App & App Thợ
-- ==============================================================================
alter table public.mechanics enable row level security;
alter table public.rescue_orders enable row level security;
alter table public.rescue_messages enable row level security;

-- Xóa các policy cũ nếu có để tránh lỗi khi chạy lại nhiều lần
drop policy if exists "motosos_all_mechanics" on public.mechanics;
drop policy if exists "motosos_all_rescue_orders" on public.rescue_orders;
drop policy if exists "motosos_all_rescue_messages" on public.rescue_messages;

-- Tạo policy mở cho phép ứng dụng khách và thợ tương tác trơn tru
create policy "motosos_all_mechanics" on public.mechanics for all using (true) with check (true);
create policy "motosos_all_rescue_orders" on public.rescue_orders for all using (true) with check (true);
create policy "motosos_all_rescue_messages" on public.rescue_messages for all using (true) with check (true);

-- ==============================================================================
-- 7. STORED PROCEDURE / RPC: Thợ nhận đơn an toàn (Atomic Lock chống tranh chấp)
-- ==============================================================================
create or replace function public.accept_rescue_order(p_order_id uuid, p_mechanic_id text)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_updated int;
begin
  -- Cập nhật đơn chỉ khi trạng thái vẫn đang là SEARCHING (nguyên tử)
  update public.rescue_orders
  set status = 'EN_ROUTE',
      mechanic_id = p_mechanic_id
  where id = p_order_id and status = 'SEARCHING';

  get diagnostics v_updated = row_count;

  if v_updated > 0 then
    -- Đổi trạng thái thợ sang bận
    update public.mechanics
    set status = 'BUSY'
    where id = p_mechanic_id;

    return jsonb_build_object(
      'success', true,
      'order_id', p_order_id,
      'mechanic_id', p_mechanic_id
    );
  else
    -- Ném Exception để Supabase JS SDK nhận diện được lỗi tranh chấp đơn
    raise exception 'Đơn cứu hộ này đã được thợ khác nhận hoặc đã bị hủy!';
  end if;
end;
$$;

-- ==============================================================================
-- 8. STORED PROCEDURE / RPC: Quét kỹ thuật viên gần nhất theo bán kính (Mét)
-- ==============================================================================
create or replace function public.find_nearby_mechanics(
  p_lat double precision,
  p_lng double precision,
  p_radius_meters double precision default 3000
)
returns setof public.mechanics
language sql
security definer
stable
as $$
  select *
  from public.mechanics
  where status = 'ONLINE'
  order by (
    (current_lat - p_lat) * (current_lat - p_lat) + 
    (current_lng - p_lng) * (current_lng - p_lng) * cos(radians(p_lat)) * cos(radians(p_lat))
  ) asc
  limit 10;
$$;

-- ==============================================================================
-- 9. DỮ LIỆU MẪU ĐỐI TÁC CỨU HỘ BAN ĐÊM (Seed Data cho TP.HCM)
-- ==============================================================================
insert into public.mechanics (id, name, phone, license_plate, vehicle_model, rating, completed_rescues, current_lat, current_lng, status)
values
  ('mech-01', 'Nguyễn Minh Tuấn', '0908412739', '59-P2 842.19', 'Honda Future 125', 4.9, 328, 10.7769, 106.7009, 'ONLINE'),
  ('mech-02', 'Trần Hoàng Nam', '0912345678', '59-S3 519.04', 'Yamaha Sirius Fi', 4.8, 195, 10.7725, 106.6980, 'ONLINE'),
  ('mech-03', 'Lê Văn Hùng', '0933112233', '59-T1 629.88', 'Honda Wave RSX', 4.95, 412, 10.7812, 106.7055, 'ONLINE'),
  ('mech-04', 'Đặng Quốc Bảo', '0988776655', '59-N2 731.40', 'Honda Winner X', 4.85, 260, 10.7695, 106.6920, 'ONLINE')
on conflict (id) do update set
  status = excluded.status,
  current_lat = excluded.current_lat,
  current_lng = excluded.current_lng;

-- Thông báo hoàn tất
select 'MotoSOS Supabase schema initialized successfully!' as status;
