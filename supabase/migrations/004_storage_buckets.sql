-- 确保 Storage buckets 存在（002 中已定义，此处幂等补全）
insert into storage.buckets (id, name, public)
values
  ('pet-uploads', 'pet-uploads', true),
  ('avatars', 'avatars', true)
on conflict (id) do update set public = excluded.public;
