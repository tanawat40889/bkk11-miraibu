-- ตัวกลางรีโมทออนไลน์ของ BKK11-Miraibu (Supabase)
-- รันครั้งเดียวในโปรเจคใหม่ที่ใช้เฉพาะงานนี้ (SQL editor หรือ apply_migration)
-- ตารางปิดไม่ให้เข้าตรงๆ (RLS เปิด ไม่มี policy) ใช้ผ่านฟังก์ชัน RPC เท่านั้น

create table if not exists public.miraibu_rooms (
  code      text primary key check (code ~ '^[A-Z0-9]{4,16}$'),
  state     jsonb,                      -- สถานะล่าสุดที่จอใหญ่ส่งมา
  state_t   timestamptz,                -- เวลาที่จอใหญ่ส่งล่าสุด
  remote_t  timestamptz,                -- เวลาที่มือถือรีโมทดึงสถานะล่าสุด (บอกว่ามีรีโมทเชื่อมอยู่)
  created_at timestamptz not null default now()
);

create table if not exists public.miraibu_cmds (
  id         bigint generated always as identity primary key,
  room       text not null references public.miraibu_rooms(code) on delete cascade,
  cmd        text not null,
  arg        jsonb,
  created_at timestamptz not null default now()
);
create index if not exists miraibu_cmds_room_id on public.miraibu_cmds (room, id);

alter table public.miraibu_rooms enable row level security;
alter table public.miraibu_cmds  enable row level security;
revoke all on public.miraibu_rooms, public.miraibu_cmds from anon, authenticated;

-- จอใหญ่ส่งสถานะ
create or replace function public.miraibu_post_state(p_room text, p_state jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_room !~ '^[A-Z0-9]{4,16}$' then raise exception 'bad room'; end if;
  if pg_column_size(p_state) > 16384 then raise exception 'state too large'; end if;
  insert into miraibu_rooms (code, state, state_t) values (p_room, p_state, now())
  on conflict (code) do update set state = excluded.state, state_t = now();
end $$;

-- มือถือดึงสถานะ (และถือว่ารีโมทเชื่อมอยู่)
create or replace function public.miraibu_get_state(p_room text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare r miraibu_rooms;
begin
  if p_room !~ '^[A-Z0-9]{4,16}$' then raise exception 'bad room'; end if;
  update miraibu_rooms set remote_t = now() where code = p_room returning * into r;
  if not found then return jsonb_build_object('age', null, 'state', null); end if;
  return jsonb_build_object(
    'age', case when r.state_t is null then null else extract(epoch from now() - r.state_t) end,
    'state', r.state);
end $$;

-- มือถือส่งคำสั่ง
create or replace function public.miraibu_post_cmd(p_room text, p_cmd text, p_arg jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_room !~ '^[A-Z0-9]{4,16}$' then raise exception 'bad room'; end if;
  if length(p_cmd) > 32 or pg_column_size(p_arg) > 2048 then raise exception 'too large'; end if;
  insert into miraibu_rooms (code) values (p_room) on conflict do nothing;
  insert into miraibu_cmds (room, cmd, arg) values (p_room, p_cmd, p_arg);
  -- เก็บแค่คำสั่งล่าสุด 50 รายการต่อห้อง และกวาดห้องที่ร้างเกิน 2 วัน
  delete from miraibu_cmds where room = p_room and id < (select max(id) - 50 from miraibu_cmds where room = p_room);
  delete from miraibu_rooms where created_at < now() - interval '2 days' and coalesce(state_t, created_at) < now() - interval '2 days' and code <> p_room;
end $$;

-- จอใหญ่ดึงคำสั่งใหม่ (และเวลาที่มีมือถือเชื่อมล่าสุด)
create or replace function public.miraibu_get_cmds(p_room text, p_since bigint)
returns jsonb language plpgsql security definer set search_path = public as $$
declare rt timestamptz; mx bigint; list jsonb;
begin
  if p_room !~ '^[A-Z0-9]{4,16}$' then raise exception 'bad room'; end if;
  select remote_t into rt from miraibu_rooms where code = p_room;
  select coalesce(max(id), 0) into mx from miraibu_cmds where room = p_room;
  select coalesce(jsonb_agg(jsonb_build_object('id', id, 'cmd', cmd, 'arg', arg) order by id), '[]'::jsonb)
    into list from miraibu_cmds where room = p_room and id > p_since;
  return jsonb_build_object(
    'last', mx,
    'remote', case when rt is null then null else extract(epoch from now() - rt) end,
    'cmds', list);
end $$;

revoke all on function public.miraibu_post_state(text, jsonb), public.miraibu_get_state(text),
  public.miraibu_post_cmd(text, text, jsonb), public.miraibu_get_cmds(text, bigint) from public;
grant execute on function public.miraibu_post_state(text, jsonb), public.miraibu_get_state(text),
  public.miraibu_post_cmd(text, text, jsonb), public.miraibu_get_cmds(text, bigint) to anon, authenticated;
