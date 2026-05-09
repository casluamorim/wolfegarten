-- Tabela de logos livres (parceiros / realização / patrocinadores)
CREATE TABLE IF NOT EXISTS public.partner_logos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path text NOT NULL,
  alt text,
  link text,
  placement text NOT NULL DEFAULT 'footer',
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.partner_logos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public reads partner logos"
  ON public.partner_logos FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "admins write partner logos"
  ON public.partner_logos FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

ALTER PUBLICATION supabase_realtime ADD TABLE public.partner_logos;

-- Configurações padrão do painel (não sobrescreve valores existentes)
INSERT INTO public.site_content (key, value) VALUES
  ('launch.phase', '"pre"'::jsonb),
  ('launch.auto_switch', 'true'::jsonb),
  ('social.instagram', '""'::jsonb),
  ('social.facebook', '""'::jsonb),
  ('social.linkedin', '""'::jsonb),
  ('social.youtube', '""'::jsonb),
  ('contact.whatsapp', '"5547988178508"'::jsonb),
  ('contact.email', '""'::jsonb),
  ('contact.phone', '"(47) 98817-8508"'::jsonb),
  ('contact.address', '"Indaial — Santa Catarina"'::jsonb),
  ('analytics.ga4_id', '""'::jsonb),
  ('analytics.meta_pixel_id', '""'::jsonb),
  ('logos.cols_desktop', '"3"'::jsonb),
  ('logos.cols_mobile', '"2"'::jsonb),
  ('logos.height', '"40"'::jsonb),
  ('logos.gap', '"48"'::jsonb),
  ('institutional.razao_social', '""'::jsonb),
  ('institutional.cnpj', '""'::jsonb)
ON CONFLICT (key) DO NOTHING;