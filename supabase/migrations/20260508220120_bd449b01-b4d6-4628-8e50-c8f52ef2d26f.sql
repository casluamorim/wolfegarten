
revoke execute on function public.has_role(uuid, public.app_role) from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop policy if exists "public read site-assets" on storage.objects;
create policy "public read individual site-assets" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'site-assets');
-- Note: listing requires a different permission; this policy still allows direct public URL fetches by path.
