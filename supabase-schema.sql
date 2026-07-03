-- ================================================================
--  포트폴리오 Analytics 스키마
--  Supabase → SQL Editor에서 전체 실행
-- ================================================================

-- 페이지 뷰 테이블
create table if not exists pv (
  id          bigserial primary key,
  created_at  timestamptz default now(),
  page        text,
  sid         text,
  device      text,
  referrer    text,
  is_return   boolean default false,
  is_own      boolean default false,
  utm_source  text,
  utm_medium  text,
  utm_campaign text
);

-- 이벤트 테이블 (스크롤 + 클릭 + 체류시간)
create table if not exists ev (
  id          bigserial primary key,
  created_at  timestamptz default now(),
  sid         text,
  page        text,
  type        text,      -- 'scroll' | 'click' | 'duration'
  val         integer,   -- scroll: 25/50/75/100 / duration: 초
  label       text,
  href        text,
  is_own      boolean default false
);

-- ── RLS 활성화 ──
alter table pv enable row level security;
alter table ev enable row level security;

-- 기존 policy 제거 후 재생성
drop policy if exists "anon insert pv" on pv;
drop policy if exists "anon insert ev" on ev;
drop policy if exists "service select pv" on pv;
drop policy if exists "service select ev" on ev;

create policy "anon insert pv" on pv
  for insert to anon with check (true);

create policy "anon insert ev" on ev
  for insert to anon with check (true);

create policy "service select pv" on pv
  for select to service_role using (true);

create policy "service select ev" on ev
  for select to service_role using (true);

-- 조회 성능용 인덱스
create index if not exists pv_created_at_idx on pv (created_at desc);
create index if not exists ev_created_at_idx on ev (created_at desc);
create index if not exists pv_page_idx on pv (page);
create index if not exists ev_type_idx on ev (type);

-- ── 기존 테이블에 UTM 컬럼 추가 (이미 테이블이 있는 경우) ──
alter table pv add column if not exists utm_source   text;
alter table pv add column if not exists utm_medium   text;
alter table pv add column if not exists utm_campaign text;
