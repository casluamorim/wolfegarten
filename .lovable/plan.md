
# Wölfegarten — Site Premium + CMS de alto padrão

Escopo gigantesco. Proponho dividir em **5 entregas sequenciais**, cada uma testável e publicável. Antes de começar preciso de confirmação no escopo e em algumas decisões técnicas.

---

## Entrega 1 — Encerrar Fase 1 e consolidar Fase 2 como site oficial

- Remover do site público: `Countdown`, `Confirm`, `Vagas`, `Marco`, `Experience`, `Info` (Fase 1), `LoadingScreen` antigo, hook `use-launch-phase`, rota `?simulate=live`, lógica de transição.
- `src/routes/index.tsx` passa a renderizar **somente** `HomePhase2`.
- Apagar `admin.preview.$page.tsx` (preview de Fase 2) — vira editor real (Entrega 2).
- Migrar conteúdo seedado de `phase2.home.*` para chaves estáveis `home.*` no `site_content`.
- Novo `LoadingScreen` premium (logo + fade 0.8–1.5s).
- Robots/sitemap deixam de depender de fase: indexação ligada sempre.

## Entrega 2 — Páginas internas premium + blocos de conteúdo

- Rotas refinadas: `/empreendimento`, `/infraestrutura`, `/lazer`, `/masterplan`, `/galeria`, `/videos`, `/localizacao`, `/contato`, + sub-páginas `/infraestrutura/academia`, `/infraestrutura/piscina`.
- Toda página interna no padrão: Hero → conteúdo próprio → galeria/vídeo → CTA + formulário + mapa central de vendas + WhatsApp contextual.
- **Sistema de blocos reutilizáveis** (sem drag-and-drop visual nesta entrega — render por JSON ordenado no CMS; drag-and-drop fica como Entrega 6 opcional):
  - Blocos: `hero`, `text_media`, `video_full`, `gallery`, `diferenciais_cards`, `cta`, `map_form`, `lifestyle`, `timeline`, `stats`, `masterplan`, `carousel`.
  - Tabela `page_blocks (page_slug, order, type, data jsonb, visible, desktop_variant, mobile_variant)`.
  - Renderer único `<BlockRenderer/>` no público.
- WhatsApp contextual por página (mensagem editável no CMS).
- Sticky CTA mobile (Agendar visita + WhatsApp).

## Entrega 3 — Biblioteca de mídia + categorias + mídia flexível + mobile/desktop

- Reaproveita `media_library` existente. Adiciona:
  - `media_categories` (CRUD, ordenável).
  - `media_library.category_id`, `featured boolean` (destaque automático nos heros/carrosséis).
  - `mobile_variant_id` por bloco para versão mobile distinta.
- Upload otimizado: PNG/JPG → WEBP (desktop/tablet/mobile/thumb) via Worker (sharp não roda em Workers → uso de **canvas no client** já existente em `img-to-webp.ts`).
- **Vídeos**: upload direto ao Storage (`site-assets`), poster automático no client (`video-poster.ts` já existe). **Transcoding multi-bitrate real (HLS) NÃO entra** — exige serviço externo (Cloudflare Stream / Mux). Ver pergunta abaixo.
- Picker visual com filtros, busca, tags, categoria.

## Entrega 4 — Painel admin premium (dashboard + nova IA + CRM)

- Novo `/admin` = Dashboard: leads do dia, últimos leads, cliques WhatsApp, visitas, formulários, páginas top, atalhos rápidos, agenda de follow-up.
- Menu lateral reorganizado: Dashboard · Editar Site · Páginas · Mídia · Galerias · Menus · Leads · Central de Vendas · Logos & Parceiros · SEO · Rodapé · Configurações · Usuários.
- **CRM de Leads**: tabela `leads` ganha `status` (novo|contato|visita|negociacao|convertido|perdido), `notes`, `next_followup`. Funil Kanban.
- **Analytics**: tabela `site_events` (page_view, whatsapp_click, form_submit, origin). Dashboard agrega. Mapa de calor — fora de escopo (custoso); fica como "fase futura".
- Central de Vendas como recurso editável (endereço, telefone, WhatsApp, Maps embed, horários).
- Rodapé premium 100% editável.
- Controle de visibilidade por seção/bloco (toggle `visible`).
- SEO por página com preview Google/Open Graph.

## Entrega 5 — Menu premium overlay + acabamentos

- Refazer `Navbar` + `MenuOverlay` no padrão luxury internacional:
  - Topo limpo: Home · Empreendimento · Infraestrutura · Contato + hamburger dourado.
  - Overlay fullscreen: esquerda mídia premium, direita links gigantes serifados, rodapé com WhatsApp/contato/redes.
  - Microinterações, hover refinado, `prefers-reduced-motion`.
- Pacote final: revisão visual, performance, SEO, sitemap dinâmico cobrindo todas páginas + sub-páginas.

---

## Detalhes técnicos

- **Stack**: continua TanStack Start + Lovable Cloud (Supabase). Sem novas dependências externas pesadas.
- **Banco** — novas tabelas/migrations:
  - `page_blocks`, `media_categories`, `central_vendas` (singleton), `site_events`, `lead_followups`.
  - `leads`: adicionar `status`, `source`, `notes`, `next_followup`, `page_origin`.
  - `media_library`: `category_id`, `featured`, `mobile_variant_id`.
  - Todas com RLS: leitura pública onde faz sentido (blocos visíveis, mídia, central), escrita só `admin`.
- **Storage**: bucket `site-assets` já existe (público). Tudo continua ali.
- **WhatsApp contextual**: configurado por bloco/página em `site_content` (`whatsapp.<slug>.message`).
- **Performance vídeo**: continua `SmartVideo` (connection-aware, poster→video crossfade). Para vídeos >100MB recomendo Cloudflare Stream — ver pergunta 2.

## Fora de escopo (proponho deixar para depois)

- HLS multi-bitrate real (depende de provedor externo pago).
- Drag-and-drop visual de blocos (entrego ordenação por número/setas; DnD vira Entrega 6).
- Mapa de calor de cliques.
- A/B testing de heros.

## Perguntas antes de começar

1. **Posso seguir nessa ordem (Entrega 1 → 5), fazendo uma de cada vez com você aprovando entre elas?** Tentar tudo de uma vez vira um patch impossível de revisar.
2. **Vídeos pesados (>100MB, multi-bitrate real)**: aceito usar **Cloudflare Stream** (serviço pago externo, melhor experiência) ou ficamos só com upload direto no Storage + `SmartVideo` (sem HLS, mas grátis e já funciona)?
3. **Drag-and-drop visual de blocos** é obrigatório agora ou posso entregar primeiro a ordenação por setas/número (muito mais rápido) e o DnD depois?
4. **Posso remover dados de Fase 1 do banco** (`site_content` com chaves antigas tipo `confirm.*`, `countdown.*`, `vagas.*`) ou prefere manter como histórico?

Responde com 1/2/3/4 e eu começo pela Entrega 1.
