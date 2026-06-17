-- 萌壳圈动态图片 Storage

insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "post_images_public_read" on storage.objects;
create policy "post_images_public_read" on storage.objects
  for select using (bucket_id = 'post-images');

drop policy if exists "post_images_auth_upload" on storage.objects;
create policy "post_images_auth_upload" on storage.objects
  for insert with check (
    bucket_id = 'post-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "post_images_auth_delete" on storage.objects;
create policy "post_images_auth_delete" on storage.objects
  for delete using (
    bucket_id = 'post-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
