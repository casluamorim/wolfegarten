
create table if not exists public.site_galleries (
  id uuid primary key default gen_random_uuid(),
  asset_key text not null,
  storage_path text not null,
  sort_order int not null default 0,
  active boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists site_galleries_key_idx on public.site_galleries (asset_key, sort_order);

alter table public.site_galleries enable row level security;

create policy "public reads galleries"
on public.site_galleries for select
to anon, authenticated
using (true);

create policy "admins write galleries"
on public.site_galleries for all
to authenticated
using (has_role(auth.uid(), 'admin'))
with check (has_role(auth.uid(), 'admin'));

alter publication supabase_realtime add table public.site_galleries;
alter table public.site_galleries replica identity full;

insert into public.site_content (key, value) values
  ('launch.date', '"2026-05-16T10:00:00-03:00"'),
  ('launch.mode', '"auto"'),
  ('section.countdown.visible', 'true'),
  ('section.marco.visible', 'true'),
  ('section.experience.visible', 'true'),
  ('section.info.visible', 'true'),
  ('section.vagas.visible', 'true'),
  ('section.confirm.visible', 'true'),
  ('section.institucional.visible', 'true'),
  ('institucional.eyebrow', '"O EMPREENDIMENTO"'),
  ('institucional.title', '"Wölfegarten"'),
  ('institucional.text', '"Um loteamento fechado de altíssimo padrão em Indaial, projetado para quem busca segurança, sofisticação e qualidade de vida."')
on conflict (key) do nothing;
