-- 1) Aumentar limite do bucket e permitir vídeos
update storage.buckets
  set file_size_limit = 2147483648,  -- 2 GB
      allowed_mime_types = array[
        'image/png','image/jpeg','image/jpg','image/webp','image/svg+xml','image/avif',
        'video/mp4','video/quicktime','video/webm','video/x-m4v'
      ]
where id = 'site-assets';

-- 2) Categoria nas logos
alter table public.partner_logos
  add column if not exists category text not null default 'realizacao';

-- normalizar
update public.partner_logos
  set category = case when category in ('realizacao','apoio') then category else 'realizacao' end;

-- 3) Sementes de configuração (social + hero video)
insert into public.site_content(key, value) values
  ('social.tiktok', to_jsonb(''::text)),
  ('social.whatsapp', to_jsonb(''::text)),
  ('hero.video_url', to_jsonb(''::text)),
  ('hero.video_url_mobile', to_jsonb(''::text)),
  ('hero.video_poster', to_jsonb(''::text)),
  ('hero.video_autoplay', to_jsonb('true'::text)),
  ('hero.video_loop', to_jsonb('true'::text)),
  ('logos.realizacao_label', to_jsonb('REALIZAÇÃO'::text)),
  ('logos.apoio_label', to_jsonb('APOIO'::text))
on conflict (key) do nothing;