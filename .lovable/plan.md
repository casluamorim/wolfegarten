# Plano — Fase 2 Editável, Home Premium e Menu Refinado

## 1. Editor completo da Fase 2 no painel admin

Hoje `admin.preview.$page.tsx` só renderiza. Vou transformar a aba **Preview / Fase 2** em editor real, espelhando o `ContentEditor` do site público.

- Refatorar `src/routes/admin.preview.$page.tsx` em layout split:
  - **Esquerda**: árvore de seções da página (Hero, Conceito, Vídeo, Renders, Galeria, Diferenciais, Infraestrutura, Lazer, Localização, Masterplan, CTA, Contato, SEO).
  - **Direita**: preview ao vivo da página Fase 2 renderizado pelos mesmos componentes públicos, lendo do `site_content` com prefixo `phase2.<page>.<section>.*`.
- Cada seção edita: textos, títulos, subtítulos, descrições, botões/CTA, **tipo de mídia** (imagem|vídeo) + `MediaPicker`, background, ordem.
- Aba dedicada de **SEO** por página (`phase2.<page>.seo.title|description|og_image|og_type`).
- Aba **Menu** edita itens primários e secundários (`phase2.menu.primary[]`, `phase2.menu.secondary[]`).
- Aba **Formulário de contato** edita campos visíveis e textos.
- Toda escrita usa `site_content` (já existe RLS admin). Nada novo no schema.

**Isolamento público**: o `useLaunchPhase` já controla `pre-launch | live`. Vou garantir que:
- Rotas Fase 2 (`/empreendimento`, `/galeria`, etc.) só montam quando `phase === "live"`; em `pre-launch` redirecionam para `/`.
- `robots.txt` e `sitemap.xml` continuam bloqueando Fase 2 em `pre-launch` (já implementado, só revisar).
- Editor admin força `?simulate=live` internamente para o iframe de preview, sem afetar produção.

## 2. Home da Fase 2 — landing premium

Criar `src/components/phase2/HomePhase2.tsx` que substitui o conteúdo da rota `/` quando `phase === "live"`. Estrutura:

```
1. HeroPhase2          imagem premium + overlay + tipografia + CTA (SEM vídeo)
2. VideoIntro          vídeo institucional cinematográfico (SmartVideo)
3. Conceito            texto + mídia flexível (img|vídeo)
4. Diferenciais        grid 3-4 cards com ícones
5. RendersGrid         galeria 3D (bento/masonry)
6. Infraestrutura      seção visual + mídia
7. Lazer               carrossel premium
8. Masterplan          imagem grande zoomável + legenda
9. Localizacao         mapa + destaques
10. GaleriaPreview     grid + link "ver galeria completa"
11. CTAVisita          bloco escuro fullbleed + botão "Agendar visita"
12. ContatoCompacto    formulário curto (nome, email, telefone, msg)
```

Cada bloco lê de `phase2.home.<section>.*` no `site_content`. Componentes reutilizáveis em `src/components/phase2/blocks/`.

## 3. Hero sem vídeo

Editar `Hero.tsx` (Fase 1 atual continua igual) e novo `HeroPhase2.tsx`:
- Apenas `<img>` premium com `loading="eager"` + `fetchpriority="high"`.
- Overlay duplo (gradient + radial) já existente.
- Tipografia serif cinematográfica.
- CTA único elegante.
- Sem `<video>`, sem `SmartVideo`, sem toggle de som.
- Vídeo migra para a seção `VideoIntro` logo abaixo (autoplay muted + botão som, usando `SmartVideo` já existente).

## 4. Mídia flexível em qualquer seção

Criar componente `<FlexibleMedia phase2Key="phase2.home.conceito" />`:
- Lê `<key>.media_type` (`"image" | "video"`).
- Se `image`: lê `<key>.image_url` + alt.
- Se `video`: lê `<key>.video_url`, `video_poster`, `video_autoplay`, `video_loop` e usa `SmartVideo`.
- Editor admin mostra select "Tipo de mídia" + `MediaPicker` filtrado pelo tipo.

Aplicado em: Conceito, Diferenciais (background), Infraestrutura, Lazer, Masterplan, Localização, CTA, e qualquer bloco futuro.

## 5. Menu superior minimalista + overlay premium

Editar `Navbar.tsx`:
- Desktop visível: **Home, Empreendimento, Infraestrutura, Contato** + ícone "Menu" (hamburger fino dourado).
- Mobile: logo + ícone Menu (sem itens visíveis).
- CTA "Agendar Visita" continua como botão dourado discreto à direita.

Criar `src/components/phase2/MenuOverlay.tsx`:
- Overlay fullscreen, fundo escuro com blur, fade + slide-in.
- Lista vertical de **todos** os links (primários + secundários: Áreas de Lazer, Masterplan, Galeria, Vídeos, Localização, Experiência, Diferenciais) em tipografia grande serif.
- Botão fechar (X) no topo direito.
- Footer com redes sociais e contato.
- `prefers-reduced-motion` respeitado.
- Bloqueia scroll do body enquanto aberto.

Itens vêm de `phase2.menu.primary[]` e `phase2.menu.secondary[]` (editáveis no admin), com defaults sensatos.

## 6. Seed de conteúdo Fase 2

Migration leve: inserir defaults `phase2.home.*`, `phase2.menu.*`, `phase2.<page>.seo.*` em `site_content` via `INSERT ... ON CONFLICT DO NOTHING`. Sem mudança de schema.

## Detalhes técnicos

- Sem mudança em `media_library`, `partner_logos`, `site_assets`.
- Reusa: `SmartVideo`, `MediaPicker`, `MediaLibrary`, `useSiteContent`, `useLaunchPhase`, `Phase2Page`.
- Rotas Fase 2 existentes (`/empreendimento`, `/galeria`, etc.) ganham guard: `if (phase !== "live") redirect("/")`.
- `index.tsx` passa a renderizar `<HomePhase1 />` ou `<HomePhase2 />` via `useLaunchPhase()`.
- SEO por página continua via `head()` do TanStack, lendo defaults do `site_content` quando o admin sobrescrever.

## Fora de escopo

- Transcoding HLS multi-bitrate real (Lovable Storage entrega via CDN; player já é adaptativo).
- Drag-and-drop de reordenação de **seções** dentro do editor (reordenação fica em itens de menu/galeria onde já existe).
- Mapa interativo real em Localização (placeholder com imagem + endereço, hook para Google Maps fica para depois).
