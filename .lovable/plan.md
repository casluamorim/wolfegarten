# Plano — Player progressivo, Galeria/Vídeos, troca de fase e SEO

Tudo continua sem quebrar o site público atual. Mudanças visíveis ao público são apenas o player do Hero (sem flicker) e a chave automática de fase quando a data chegar. Galeria/Vídeos novos ficam preparados mas só aparecem quando o admin ativar.

---

## 1. Player progressivo e sem flicker (`src/components/Hero.tsx` + novo `src/components/SmartVideo.tsx`)

Criar `<SmartVideo />` reutilizável com:

- `preload="metadata"` por padrão, `preload="auto"` apenas quando `IntersectionObserver` confirma que o vídeo está visível e a conexão é boa (`navigator.connection.effectiveType` ∈ {`4g`}, sem `saveData`).
- Em conexões `2g/3g/saveData`: NÃO carrega o vídeo, mantém só o poster (imagem). Mostra botão "Reproduzir vídeo" se quiser tocar manualmente.
- Source list ordenada: `webm` (se houver), depois `mp4_720`, depois `mp4_1080`, depois fallback `video_url`. Usa `<source>` múltiplos para o navegador escolher.
- Troca poster→vídeo via crossfade (já parcialmente feito): só remove o poster após `onCanPlay` (não `onLoadedData`) + 1 RAF, evita "piscar" no Safari.
- `onError` em qualquer source → mantém poster permanentemente (fallback gracioso, sem tela preta).
- Respeita `prefers-reduced-motion`: não autoplay, mostra controles.

Hero passa a usar `<SmartVideo />`. Mesma API: `videoSrc`, `poster`, `mobileSrc`, `variants`.

## 2. Galeria e Vídeos da Fase 2 (preparação, sem quebrar o atual)

Novos componentes (usados apenas nas rotas `/admin/preview/*` por enquanto):

- `src/components/phase2/GalleryGrid.tsx` — masonry responsivo lendo `media_library` filtrado por `tag = 'galeria'`. Lazy-load com `loading="lazy"` + `decoding="async"`. Lightbox simples (sem dependência nova: dialog do shadcn já existe).
- `src/components/phase2/VideoGallery.tsx` — grid de cards de vídeo, cada card usa `<SmartVideo />` em modo "click-to-play" (poster + ícone play; só carrega ao clicar). Thumb = `poster_path` da `media_library` (gerado automaticamente no upload via `video-poster.ts`, já implementado).

Regras de reprodução:
- Apenas 1 vídeo toca por vez (gerencia via contexto leve `VideoPlaybackContext`).
- Pausa automática ao sair do viewport.
- Mute por padrão; botão de som por card.

Painel: `MediaLibrary.tsx` ganha campo `tags` editável (já existe na schema). Admin marca vídeos/imagens como `galeria`, `videos`, `infraestrutura`, etc.

## 3. Troca automática Fase 1 → Fase 2

Hoje `launch.phase` é um texto manual. Adicionar lógica determinística em runtime:

- Hook novo `src/hooks/use-launch-phase.ts`:
  ```
  effectivePhase = 
    launch.auto_switch === 'true' && now >= launch.target_date ? 'live'
    : launch.phase ?? 'pre-launch'
  ```
  Recalcula a cada minuto via `setInterval` (sem reload).
- `Confirm.tsx`, `Navbar.tsx`, `Hero.tsx`, `Footer.tsx` consomem `useLaunchPhase()`:
  - `pre-launch` → comportamento atual (Confirmar Presença)
  - `live` → CTA "Agendar uma Visita", textos de `phase2.*`, links de menu para `/empreendimento`, `/galeria`, etc.
- `SimulationPanel.tsx` ganha botão "Simular agora como Fase 2" para o admin pré-visualizar (apenas via query string `?simulate=live`, não persiste).

Quando `effectivePhase === 'live'`, as rotas `/admin/preview/*` passam a ser promovidas para rotas públicas espelho (`/empreendimento`, `/galeria`, etc.) — criar essas rotas reais agora, mas com guard: se `phase !== 'live'`, redirecionar para `/`.

## 4. SEO por página + sitemap + robots

Cada rota da Fase 2 (`/empreendimento`, `/infraestrutura`, `/lazer`, `/masterplan`, `/galeria`, `/videos`, `/localizacao`, `/contato`) com `head()` próprio lendo de `site_content`:

```
phase2.{page}.seo_title
phase2.{page}.seo_description
phase2.{page}.og_image
```

- `<title>`, `meta description`, `og:title`, `og:description`, `og:image`, `twitter:card=summary_large_image`, `twitter:image`.
- Hero/cover de cada página alimenta automaticamente `og:image` quando `og_image` estiver vazio.

**robots.txt dinâmico** (`src/routes/robots[.]txt.tsx`):
- Se `effectivePhase !== 'live'`: `User-agent: *\nDisallow: /` (bloqueia indexação total do pré-lançamento).
- Se `live`: `Allow: /` + referência ao sitemap.

**sitemap.xml dinâmico** (`src/routes/sitemap[.]xml.tsx`):
- Se `pre-launch`: apenas `/`.
- Se `live`: `/` + todas as páginas Fase 2 com `lastmod` lido de `site_content.updated_at`.

Root route: meta `robots` adicional via `head()` lendo `site_content` (como reforço caso bots ignorem robots.txt no preview).

## Arquivos

**Novos:**
- `src/components/SmartVideo.tsx`
- `src/components/phase2/GalleryGrid.tsx`
- `src/components/phase2/VideoGallery.tsx`
- `src/components/phase2/VideoPlaybackContext.tsx`
- `src/hooks/use-launch-phase.ts`
- `src/routes/robots[.]txt.tsx`
- `src/routes/sitemap[.]xml.tsx`
- `src/routes/empreendimento.tsx`, `infraestrutura.tsx`, `lazer.tsx`, `masterplan.tsx`, `galeria.tsx`, `videos.tsx`, `localizacao.tsx`, `contato.tsx` (com guard de fase)

**Editar:**
- `src/components/Hero.tsx` (usa SmartVideo)
- `src/components/Navbar.tsx`, `Confirm.tsx`, `Footer.tsx` (usam useLaunchPhase)
- `src/components/admin/SimulationPanel.tsx` (botão simular Fase 2)
- `src/routes/__root.tsx` (meta robots dinâmica)
- `src/routes/admin.preview.$page.tsx` (passa a renderizar os mesmos componentes das rotas públicas)

## Fora de escopo
- Transcoding real multi-bitrate (HLS) — continua exigindo Cloudflare Stream/mux. SmartVideo já está pronto pra isso quando integrar.
- CDN customizada — Lovable Storage já entrega via CDN.

Posso seguir?
