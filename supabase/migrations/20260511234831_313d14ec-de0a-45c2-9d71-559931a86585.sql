
-- Biblioteca de Mídia
create table if not exists public.media_library (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('image','video','logo','render')),
  storage_path text not null,
  mime text,
  bytes bigint,
  width int,
  height int,
  duration numeric,
  poster_path text,
  variants jsonb not null default '{}'::jsonb,
  alt text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.media_library enable row level security;

create policy "public reads media library"
on public.media_library for select to anon, authenticated using (true);

create policy "admins write media library"
on public.media_library for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

alter publication supabase_realtime add table public.media_library;

create index if not exists media_library_kind_idx on public.media_library(kind);
create index if not exists media_library_created_idx on public.media_library(created_at desc);

-- Configuração de layout por categoria de logos
insert into public.site_content (key, value) values
  ('logos.realizacao.cols_desktop', to_jsonb('3'::text)),
  ('logos.realizacao.cols_mobile',  to_jsonb('2'::text)),
  ('logos.realizacao.height',       to_jsonb('48'::text)),
  ('logos.realizacao.gap',          to_jsonb('48'::text)),
  ('logos.apoio.cols_desktop',      to_jsonb('4'::text)),
  ('logos.apoio.cols_mobile',       to_jsonb('2'::text)),
  ('logos.apoio.height',            to_jsonb('36'::text)),
  ('logos.apoio.gap',               to_jsonb('40'::text)),
  ('logos.realizacao_label',        to_jsonb('REALIZAÇÃO'::text)),
  ('logos.apoio_label',             to_jsonb('APOIO'::text))
on conflict (key) do nothing;

-- Conteúdo Fase 2 (institucional pós-lançamento)
insert into public.site_content (key, value) values
  ('phase2.hero.title_line1', to_jsonb('Wölfegarten'::text)),
  ('phase2.hero.title_line2', to_jsonb('Indaial'::text)),
  ('phase2.hero.subtitle',    to_jsonb('Um novo padrão de viver. Alto padrão, natureza e exclusividade.'::text)),
  ('phase2.hero.cta',         to_jsonb('Agendar uma Visita'::text)),
  ('phase2.empreendimento.title', to_jsonb('O Empreendimento'::text)),
  ('phase2.empreendimento.text',  to_jsonb('Conceito arquitetônico exclusivo, integrado à natureza de Indaial.'::text)),
  ('phase2.infraestrutura.title', to_jsonb('Infraestrutura'::text)),
  ('phase2.infraestrutura.text',  to_jsonb('Tecnologia, segurança e conforto em cada detalhe.'::text)),
  ('phase2.lazer.title',          to_jsonb('Áreas de Lazer'::text)),
  ('phase2.lazer.text',           to_jsonb('Espaços pensados para todas as gerações.'::text)),
  ('phase2.masterplan.title',     to_jsonb('Masterplan'::text)),
  ('phase2.galeria.title',        to_jsonb('Galeria'::text)),
  ('phase2.localizacao.title',    to_jsonb('Localização'::text)),
  ('phase2.localizacao.text',     to_jsonb('No coração de Indaial, com fácil acesso a tudo.'::text)),
  ('phase2.contato.title',        to_jsonb('Agende sua Visita'::text)),
  ('phase2.contato.subtitle',     to_jsonb('Nossa equipe está pronta para apresentar o empreendimento.'::text)),
  ('phase2.confirm.cta',          to_jsonb('Agendar uma Visita'::text)),
  ('phase2.confirm.title',        to_jsonb('Saiba Mais'::text))
on conflict (key) do nothing;
