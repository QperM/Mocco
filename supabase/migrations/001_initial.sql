-- Mocco 萌宠匿名社交 - 初始数据库结构

-- 用户资料（匿名）
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  anonymous_name text not null,
  avatar_url text,
  pet_style text not null default 'cat',
  bio text,
  tags text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 用户上传的原始照片
create table public.pet_uploads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- 广场动态
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  images text[] default '{}',
  likes_count int not null default 0,
  created_at timestamptz not null default now()
);

-- 点赞
create table public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

-- 评论
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

-- 会话
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid not null references public.profiles(id) on delete cascade,
  ice_broken boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_a, user_b)
);

-- 消息
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

-- 小游戏会话
create table public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  player_a uuid not null references public.profiles(id) on delete cascade,
  player_b uuid not null references public.profiles(id) on delete cascade,
  game_type text not null default 'rps',
  state jsonb not null default '{}',
  winner_id uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- 启用 RLS
alter table public.profiles enable row level security;
alter table public.pet_uploads enable row level security;
alter table public.posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.comments enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.game_sessions enable row level security;

-- profiles: 所有人可读，仅本人可写
create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- pet_uploads
create policy "pet_uploads_select" on public.pet_uploads for select using (true);
create policy "pet_uploads_insert" on public.pet_uploads for insert with check (auth.uid() = user_id);
create policy "pet_uploads_delete" on public.pet_uploads for delete using (auth.uid() = user_id);

-- posts: 所有人可读，仅本人可写
create policy "posts_select" on public.posts for select using (true);
create policy "posts_insert" on public.posts for insert with check (auth.uid() = user_id);
create policy "posts_update" on public.posts for update using (auth.uid() = user_id);
create policy "posts_delete" on public.posts for delete using (auth.uid() = user_id);

-- post_likes
create policy "post_likes_select" on public.post_likes for select using (true);
create policy "post_likes_insert" on public.post_likes for insert with check (auth.uid() = user_id);
create policy "post_likes_delete" on public.post_likes for delete using (auth.uid() = user_id);

-- comments
create policy "comments_select" on public.comments for select using (true);
create policy "comments_insert" on public.comments for insert with check (auth.uid() = user_id);

-- conversations: 参与者可读
create policy "conversations_select" on public.conversations
  for select using (auth.uid() = user_a or auth.uid() = user_b);
create policy "conversations_insert" on public.conversations
  for insert with check (auth.uid() = user_a or auth.uid() = user_b);

-- messages: 会话参与者可读/写
create policy "messages_select" on public.messages
  for select using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.user_a = auth.uid() or c.user_b = auth.uid())
    )
  );
create policy "messages_insert" on public.messages
  for insert with check (auth.uid() = sender_id);

-- game_sessions
create policy "game_sessions_select" on public.game_sessions
  for select using (auth.uid() = player_a or auth.uid() = player_b);
create policy "game_sessions_insert" on public.game_sessions
  for insert with check (auth.uid() = player_a or auth.uid() = player_b);
create policy "game_sessions_update" on public.game_sessions
  for update using (auth.uid() = player_a or auth.uid() = player_b);

-- Storage buckets（需在 Supabase Dashboard 或通过 CLI 创建）
-- pet-uploads: 用户上传的原始照片
-- avatars: 生成的 2D 萌宠头像

-- 新用户注册时自动创建 profile
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, anonymous_name)
  values (
    new.id,
    '萌宠#' || lpad(floor(random() * 10000)::text, 4, '0')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Realtime: 消息表
alter publication supabase_realtime add table public.messages;
