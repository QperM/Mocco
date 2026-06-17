-- Mocco 增强：点赞计数、会话预览、Storage、匿名昵称

-- 会话最后一条消息（消息列表预览）
alter table public.conversations
  add column if not exists last_message text,
  add column if not exists last_message_at timestamptz;

-- 点赞数自动维护
create or replace function public.sync_post_likes_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.posts set likes_count = likes_count + 1 where id = NEW.post_id;
  elsif TG_OP = 'DELETE' then
    update public.posts set likes_count = greatest(likes_count - 1, 0) where id = OLD.post_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists post_likes_count_insert on public.post_likes;
create trigger post_likes_count_insert
  after insert on public.post_likes
  for each row execute function public.sync_post_likes_count();

drop trigger if exists post_likes_count_delete on public.post_likes;
create trigger post_likes_count_delete
  after delete on public.post_likes
  for each row execute function public.sync_post_likes_count();

-- 发消息时更新会话预览
create or replace function public.sync_conversation_last_message()
returns trigger as $$
begin
  update public.conversations
  set last_message = NEW.content,
      last_message_at = NEW.created_at
  where id = NEW.conversation_id;
  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists messages_update_conversation on public.messages;
create trigger messages_update_conversation
  after insert on public.messages
  for each row execute function public.sync_conversation_last_message();

-- 修正消息插入策略：必须是会话参与者
drop policy if exists "messages_insert" on public.messages;
create policy "messages_insert" on public.messages
  for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.user_a = auth.uid() or c.user_b = auth.uid())
    )
  );

-- 匿名昵称前缀改为萌壳
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, anonymous_name)
  values (
    new.id,
    '萌壳#' || lpad(floor(random() * 10000)::text, 4, '0')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Storage buckets
insert into storage.buckets (id, name, public)
values
  ('pet-uploads', 'pet-uploads', true),
  ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Storage: 公开读取
drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "pet_uploads_public_read" on storage.objects;
create policy "pet_uploads_public_read" on storage.objects
  for select using (bucket_id = 'pet-uploads');

-- Storage: 登录用户上传到自己的目录
drop policy if exists "avatars_auth_upload" on storage.objects;
create policy "avatars_auth_upload" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "pet_uploads_auth_upload" on storage.objects;
create policy "pet_uploads_auth_upload" on storage.objects
  for insert with check (
    bucket_id = 'pet-uploads'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_auth_update" on storage.objects;
create policy "avatars_auth_update" on storage.objects
  for update using (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Realtime: 可选，在 Dashboard → Database → Publications 中为 posts 开启
