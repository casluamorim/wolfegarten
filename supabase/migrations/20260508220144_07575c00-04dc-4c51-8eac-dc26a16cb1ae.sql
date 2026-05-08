
drop policy if exists "public read individual site-assets" on storage.objects;
create policy "admins list site-assets" on storage.objects
  for select to authenticated
  using (bucket_id = 'site-assets' and public.has_role(auth.uid(), 'admin'));
