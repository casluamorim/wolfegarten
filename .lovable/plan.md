# Plano — Mídia Central, Vídeos Nativos, Logos Flexíveis e Fase 2

Tudo será desenvolvido sem quebrar o site público atual. As mudanças visuais já existentes na home permanecem; novas páginas da Fase 2 ficam apenas no painel + rota `/admin/preview` até o lançamento.

---

## 1. Biblioteca de Mídia Central (nova aba "Mídia")

Tabela única `media_library` (substitui referências soltas a URLs):

```
media_library
- id, kind ('image' | 'video' | 'logo' | 'render')
- storage_path, mime, bytes, width, height, duration
- poster_path (vídeos)
- variants jsonb  → { mobile, hls, webm, mp4_720, mp4_1080 }
- alt, tags text[], created_at
```

Nova aba "Mídia" no admin com:
- Grid visual premium (preview de imagem ou thumbnail de vídeo)
- Filtros por tipo (Imagens / Vídeos / Logos / Renders) + busca por alt/tags
- Drag-and-drop de upload (imagens, vídeos, renders) — uma única zona
- Imagens convertidas em WebP no client (já existe `img-to-webp`)
- Vídeos enviados direto ao bucket `site-assets/videos/` (até 2GB)
- Modal de detalhe: alt, tags, substituição, exclusão

## 2. Upload e Processamento de Vídeo

- Upload direto via Supabase Storage (chunked) — sem YouTube
- **Poster automático**: gerado no client com `<video>` + `canvas` no primeiro frame (sem servidor)
- **Versão mobile**: client-side via `MediaRecorder` quando viável; caso contrário usa o mesmo arquivo com `preload="metadata"` (transcoding pesado real exigiria worker dedicado — fora do escopo agora; deixo um campo `video_url_mobile` opcional para upload manual de versão leve)
- HLS real e transcoding multi-bitrate exigem infra externa (mux/cloudflare-stream). **Recomendação:** usar entrega via `<video>` com `preload="metadata"` + poster + `range requests` do Storage (já suportado). Adicionar HLS depois com Cloudflare Stream se precisar.

> Vou anotar isso no painel: "para vídeos >200MB recomenda-se compressão prévia ou ativar Cloudflare Stream".

## 3. Correção do Hero

Problema atual: imagem renderiza junto com vídeo.

Correção em `Hero.tsx`:
- Se houver `video_url`: renderiza somente `<video>` com `poster={image}`
- Imagem fica como poster nativo do `<video>` (desaparece automaticamente quando o vídeo dá play)
- Estado `videoReady` controla fade-out de qualquer fallback
- Botão "ATIVAR SOM / SILENCIAR" já existe; manter
- `autoplay muted loop playsInline` mantidos

## 4. Seletor de Mídia nas Seções

Substituir os campos de URL pura por `<MediaPicker />` que:
- Lista a biblioteca filtrada
- Permite alternar Imagem / Vídeo
- Salva `media_id` no `site_content` (com fallback para URL legada)

Aplicado em: Hero, Experience cards, Marco, futuras Galerias.

## 5. Logos — Centralização e Colunas Independentes

Schema:
```
ALTER TABLE partner_logos: já tem category
site_content keys novas:
  logos.realizacao.cols_desktop / cols_mobile / height / gap / align
  logos.apoio.cols_desktop / cols_mobile / height / gap / align
```

`Footer.tsx` renderiza dois grids separados, cada um com:
- `display: grid; grid-template-columns: repeat(N, minmax(0,1fr))`
- `justify-content: center; place-items: center`
- Wrapper `mx-auto max-w-fit` quando logos < cols (centraliza naturalmente)
- Responsivo: cols_mobile no breakpoint < md

Painel `LogosPanel.tsx` ganha bloco de configuração por categoria (cols/height/gap).

## 6. Estrutura Interna da Fase 2

Criar rotas internas (não linkadas no menu público até `launch.phase === 'live'`):

```
/admin/preview/empreendimento
/admin/preview/infraestrutura
/admin/preview/lazer
/admin/preview/masterplan
/admin/preview/galeria
/admin/preview/videos
/admin/preview/localizacao
/admin/preview/contato
```

Cada uma com componentes prontos lendo de `site_content` (chaves `phase2.*`). Visíveis apenas no preview do admin.

`Confirm.tsx` e `Navbar.tsx` já leem de `site_content` — adicionar lógica:
```
if (launchPhase === 'live') {
  cta = "Agendar uma Visita"
  title = phase2.confirm.title
  ...
}
```

Toggle automático via `launch.auto_switch` + `launch.target_date` (já existe via SimulationPanel).

## 7. Migração SQL

Uma migration cria:
- Tabela `media_library` + RLS (público lê, admin escreve) + Realtime
- Chaves novas em `site_content` (logos config + phase2.*)

## Arquivos a criar/editar

**Novos:**
- `src/components/admin/MediaLibrary.tsx`
- `src/components/admin/MediaPicker.tsx`
- `src/hooks/use-media-library.ts`
- `src/lib/video-poster.ts` (gera poster client-side)
- `src/routes/admin.preview.$page.tsx` (preview Fase 2)
- `supabase/migrations/...media_library.sql`

**Editar:**
- `src/components/Hero.tsx` (priorizar vídeo)
- `src/components/Footer.tsx` (grids centralizados, cols por categoria)
- `src/components/admin/LogosPanel.tsx` (config por categoria)
- `src/components/admin/ContentEditor.tsx` (MediaPicker no Hero)
- `src/routes/admin.index.tsx` (aba Mídia substitui upload por libraria central)

## Fora de escopo (transparência)
- HLS real e transcoding multi-bitrate em background: precisaria Cloudflare Stream / mux.com. Posso integrar depois se quiser.
- Páginas da Fase 2: estrutura/skeleton + edição via CMS. Conteúdo final (textos, galerias) você preenche pelo painel quando tiver.

Posso seguir?