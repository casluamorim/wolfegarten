
create table if not exists public.site_content (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

create policy "public reads site content"
on public.site_content for select
to anon, authenticated
using (true);

create policy "admins write site content"
on public.site_content for all
to authenticated
using (has_role(auth.uid(), 'admin'))
with check (has_role(auth.uid(), 'admin'));

alter publication supabase_realtime add table public.site_content;
alter table public.site_content replica identity full;

insert into public.site_content (key, value) values
  ('seo.title', '"Wölfegarten — Convite Exclusivo | Alto padrão em Indaial"'),
  ('seo.description', '"Experiência Wölfegarten: convite exclusivo para o lançamento do mais novo loteamento de altíssimo padrão em Indaial, SC."'),
  ('seo.og_title', '"Experiência Wölfegarten — Convite Exclusivo"'),
  ('seo.og_description', '"Um encontro para quem está pronto para viver e investir em um novo padrão."'),

  ('navbar.cta', '"CONFIRMAR PRESENÇA"'),

  ('hero.eyebrow', '"CONVITE EXCLUSIVO"'),
  ('hero.kicker', '"O ALTO PADRÃO CHEGOU A INDAIAL"'),
  ('hero.title_line1', '"Experiência"'),
  ('hero.title_line2', '"WÖLFEGARTEN"'),
  ('hero.subtitle', '"Um encontro para quem está pronto\npara viver e investir em um novo padrão."'),
  ('hero.cta', '"Confirmar Presença"'),

  ('countdown.eyebrow', '"CONTAGEM REGRESSIVA"'),
  ('countdown.title', '"Para o lançamento oficial"'),
  ('countdown.target_date', '"2026-05-16T10:00:00-03:00"'),

  ('marco.eyebrow', '"UM NOVO MARCO"'),
  ('marco.title', '"Um novo marco\nem Indaial"'),
  ('marco.p1', '"O WOLFEGARTEN nasce para ser mais do que um condomínio. Ele representa uma virada de chave no conceito de viver bem em Indaial."'),
  ('marco.p2', '"Um projeto pensado para quem valoriza segurança, sofisticação e qualidade de vida, onde cada detalhe foi desenhado para elevar o padrão da cidade."'),
  ('marco.quote', '"Aqui, não se trata apenas de morar.\nSe trata de viver uma nova experiência."'),

  ('experience.eyebrow', '"A EXPERIÊNCIA"'),
  ('experience.title', '"Detalhes pensados\npara os sentidos"'),
  ('experience.item1_title', '"Gastronomia"'),
  ('experience.item1_text', '"Experiência assinada por chef renomado."'),
  ('experience.item2_title', '"Espumante & Chopp"'),
  ('experience.item2_text', '"Curadoria exclusiva durante todo o evento."'),
  ('experience.item3_title', '"Test Drive"'),
  ('experience.item3_text', '"Frota de carros seletos à disposição."'),
  ('experience.item4_title', '"Condições Exclusivas"'),
  ('experience.item4_text', '"Oportunidades únicas de aquisição."'),

  ('info.eyebrow', '"INFORMAÇÕES"'),
  ('info.local_title', '"Indaial"'),
  ('info.local_sub', '"Rua Lauro Muller, 159\nCafé Coworking — Indaial, SC"'),
  ('info.date_title', '"16 de Maio"'),
  ('info.date_sub', '"Sábado"'),
  ('info.time_title', '"10h — 16h"'),
  ('info.time_sub', '"Recepção às 10h"'),

  ('vagas.badge', '"VAGAS LIMITADAS"'),
  ('vagas.title', '"Evento exclusivo para\nconvidados selecionados."'),
  ('vagas.sub', '"Sua presença é um privilégio."'),

  ('confirm.eyebrow', '"CONFIRMAÇÃO"'),
  ('confirm.title', '"Confirmar Presença"'),
  ('confirm.subtitle', '"Reserve seu lugar neste encontro exclusivo."'),
  ('confirm.cta', '"Confirmar via WhatsApp"'),
  ('confirm.contact_name', '"SHIRLEI LISSONI"'),
  ('confirm.contact_phone_display', '"(47) 98817-8508"'),

  ('contact.whatsapp', '"5547988178508"'),
  ('contact.instagram', '""'),
  ('contact.facebook', '""'),

  ('footer.city', '"INDAIAL — SANTA CATARINA"'),
  ('footer.phone', '"(47) 98817-8508"'),
  ('footer.realizacao_label', '"REALIZAÇÃO"')
on conflict (key) do nothing;
