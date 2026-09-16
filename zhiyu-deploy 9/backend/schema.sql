-- ============================================================
--  医美百科 · Supabase 数据库结构（在 Supabase SQL Editor 中运行）
--  运行方法：Supabase 控制台 → SQL Editor → New query → 粘贴全部 → Run
-- ============================================================

-- ---------- 收藏表 ----------
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, project_id)
);

-- ---------- 点赞表 ----------
create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, project_id)
);

-- ---------- 评论表 ----------
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  project_id text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  content text not null check (char_length(content) between 1 and 500),
  created_at timestamptz not null default now()
);

-- ---------- 预约咨询表 ----------
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  project text,
  city text,
  note text,
  status text not null default 'new' check (status in ('new','contacted','done','closed')),
  created_at timestamptz not null default now()
);

-- ============================================================
--  行级安全策略（RLS）：保护数据，前端直接读写数据库也安全
-- ============================================================

-- 开启 RLS
alter table public.favorites enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.appointments enable row level security;

-- 收藏：用户只能操作自己的收藏
drop policy if exists "favorites_select_own" on public.favorites;
create policy "favorites_select_own" on public.favorites
  for select using (auth.uid() = user_id);
drop policy if exists "favorites_insert_own" on public.favorites;
create policy "favorites_insert_own" on public.favorites
  for insert with check (auth.uid() = user_id);
drop policy if exists "favorites_delete_own" on public.favorites;
create policy "favorites_delete_own" on public.favorites
  for delete using (auth.uid() = user_id);

-- 点赞：用户只能操作自己的点赞
drop policy if exists "likes_select_own" on public.likes;
create policy "likes_select_own" on public.likes
  for select using (auth.uid() = user_id);
drop policy if exists "likes_insert_own" on public.likes;
create policy "likes_insert_own" on public.likes
  for insert with check (auth.uid() = user_id);
drop policy if exists "likes_delete_own" on public.likes;
create policy "likes_delete_own" on public.likes
  for delete using (auth.uid() = user_id);

-- 评论：所有人可读，登录用户可发表，用户可删自己的
drop policy if exists "comments_select_all" on public.comments;
create policy "comments_select_all" on public.comments
  for select using (true);
drop policy if exists "comments_insert_auth" on public.comments;
create policy "comments_insert_auth" on public.comments
  for insert with check (auth.uid() = user_id);
drop policy if exists "comments_delete_own" on public.comments;
create policy "comments_delete_own" on public.comments
  for delete using (auth.uid() = user_id);

-- 预约：允许任何人提交（匿名也可以），但禁止通过公开接口读取
drop policy if exists "appointments_insert_anon" on public.appointments;
create policy "appointments_insert_anon" on public.appointments
  for insert with check (true);
drop policy if exists "appointments_no_select" on public.appointments;
create policy "appointments_no_select" on public.appointments
  for select using (false);

-- ---------- 收藏排行视图（Top 榜用） ----------
create or replace view public.favorite_ranking as
  select project_id, count(*) as favorite_count
  from public.favorites
  group by project_id
  order by favorite_count desc;

-- 允许匿名读取排行（只暴露项目 id 和数量，不含用户信息）
drop policy if exists "favorite_ranking_select_all" on public.favorite_ranking;
create policy "favorite_ranking_select_all" on public.favorite_ranking
  for select using (true);

-- 提示：视图 RLS 在 Supabase 中默认继承底层表策略，若排行查不到数据，
-- 请执行：alter view public.favorite_ranking security_invoker = off;
-- 或在 Supabase 控制台将 favorite_ranking 的 RLS 关闭（此视图只含聚合数据，无隐私信息）。

-- ---------- 点赞统计视图（详情页显示赞数） ----------
create or replace view public.likes_count as
  select project_id, count(*) as like_count
  from public.likes
  group by project_id;

-- 允许匿名/登录用户读取聚合视图（只含项目 id 与数量，无隐私）
grant select on public.likes_count to anon, authenticated;
grant select on public.favorite_ranking to anon, authenticated;
