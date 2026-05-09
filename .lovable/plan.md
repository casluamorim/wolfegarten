# Plano de evolução — sem quebrar o site público

## Princípio nº 1: site público intocável

Tudo que está no ar hoje (`/`) continua exibindo a versão de pré-lançamento. Nada da Fase 2 vaza para o público até a data oficial — ou até o admin liberar manualmente.

Estratégia:
- A renderização da home continua exatamente como está (Hero → Countdown → Marco → Experience → Info → Vagas → Confirm → Footer).
- A versão institucional da Fase 2 será desenvolvida em **componentes/rotas separadas**, nunca substituindo os atuais.
- A troca acontece via uma flag no `site_content` (`launch.phase` = `pre` | `live`) + verificação de data. Por padrão fica `pre`. Só muda quando o admin explicitamente liberar OU quando a data oficial chegar e a flag `auto_switch` estiver ativa.

## 1. Ambiente de simulação / preview interno

- Nova rota privada: `/admin/preview` (exige login admin).
- Reutiliza os mesmos componentes do site, mas envolvidos num `SimulationProvider` que injeta uma data simulada e força `phase = live` ou `pre`.
- Toggle no painel: **"Ativar modo simulação"** + campo datetime **"Simular data e horário"**.
- A simulação grava só em `localStorage` do admin — nunca toca no banco e nunca afeta visitantes.
- Botões: "Ver como pré-lançamento", "Ver como pós-lançamento", "Ver na data X".

## 2. Simulador de data no painel

- Componente `SimulationBar` no topo do `/admin` quando ativo.
- Mostra a data simulada e link "Abrir preview com essa data".
- Não substitui `Date.now()` globalmente; só passa via contexto para os componentes que dependem de data (Countdown, lógica de fase).

## 3. Reorganização do painel (`/admin`)

Abas finais:

| Aba | Conteúdo |
|---|---|
| **Editar Site** | Textos, títulos, botões, contador, menus, SEO por seção |
| **Mídia** | Biblioteca única de imagens/renders/vídeos, com seleção de "onde usar" |
| **Logos & Parceiros** | Logo principal (única identificada) + lista livre de logos |
| **Configurações** | Redes sociais, WhatsApp, contatos, links, SEO global, Analytics, Meta Pixel, favicon, dados institucionais |
| **Leads** | (mantém) CRM + export CSV |
| **Preview / Simulação** | Modo simulação + visualização Fase 1 / Fase 2 |

## 4. Sistema de Mídia unificado

Nova tabela `media_library`:
- `id`, `storage_path`, `title`, `tags[]`, `width`, `height`, `mime`, `created_at`
- Upload drag-and-drop, compressão automática no client (canvas → webp quando possível).
- Cada "slot" do site (hero, info, experience, etc.) vira um **seletor de mídia** que aponta para um `media_id` — não mais URL solta.
- Lazy loading + `loading="lazy"` + `decoding="async"` em todas as `<img>`.

## 5. Logos livres (sem categoria fixa)

- Mantém apenas `logo-main` como chave reservada (header).
- Todas as outras logos vão para uma tabela `partner_logos`:
  - `id`, `storage_path`, `link`, `sort_order`, `active`, `placement` (`footer` | `hero` | `section` | `all`)
- Painel mostra grid com drag-and-drop para reordenar, toggle ativo/inativo, botão remover.
- Configurações globais do bloco de logos: `cols_desktop`, `cols_mobile`, `logo_height`, `gap`.
- Atualização em tempo real no site público via Realtime (já temos a infra).

## 6. Aba Configurações

Campos no `site_content` (chaves novas):
- `social.instagram`, `social.facebook`, `social.linkedin`, `social.youtube`
- `contact.whatsapp`, `contact.email`, `contact.phone`, `contact.address`
- `seo.global_title`, `seo.global_description`, `seo.favicon`, `seo.og_default`
- `analytics.ga4_id`, `analytics.meta_pixel_id`
- `institutional.cnpj`, `institutional.razao_social`

Os scripts de GA4 e Meta Pixel são injetados condicionalmente quando os IDs estiverem preenchidos.

## 7. Responsividade premium mobile

Passo focado em frontend (sem mexer em lógica):
- Tipografia fluida com `clamp()` em headings e parágrafos.
- Reduzir paddings verticais em mobile: `py-28 md:py-40` → `py-16 md:py-32` em todas as seções pesadas.
- Hero: ajustar altura (`min-h-screen` → `min-h-[88svh]` no mobile, evita barra de URL cortando).
- Countdown: reduzir tamanho dos números no mobile e tightening do gap.
- Confirm form: inputs maiores no mobile (`h-12`), labels mais legíveis.
- `prefers-reduced-motion` respeitado nas animações.
- `loading="lazy"` + `decoding="async"` em todas as imagens não-hero.

## 8. Performance

- Confirmar que rotas admin já estão code-split (estão, são `.tsx` separados).
- Imagens do hero/finais convertidas para `.webp` no upload.
- `<link rel="preload">` apenas para o hero crítico.
- Sem mudar o build setup; só ajustes pontuais.

## Ordem de execução (entregas incrementais, cada uma sem quebrar o site)

1. **Migração DB**: novas chaves em `site_content` (configurações, social), tabelas `media_library` e `partner_logos`. Sem remover nada antigo.
2. **SimulationProvider + Preview**: nova rota `/admin/preview`, contexto isolado.
3. **Reorganização do painel** em 6 abas, mantendo todo o editor existente.
4. **Mídia unificada**: nova aba; assets antigos continuam funcionando até serem migrados.
5. **Logos livres**: nova UI de logos + atualização do `Footer` para ler de `partner_logos`.
6. **Aba Configurações** com injeção de Analytics/Pixel.
7. **Polimento mobile**: ajustes de spacing/tipografia nos componentes públicos.

Cada passo é commit isolado. Se algo der ruim em um passo, os anteriores continuam funcionando.

## Detalhes técnicos (referência interna)

```text
site_content (JSONB)
├── launch.phase            "pre" | "live"
├── launch.auto_switch      boolean
├── social.*                strings
├── contact.*               strings
├── analytics.ga4_id        string
├── analytics.meta_pixel_id string
└── logos.layout            { cols_desktop, cols_mobile, height, gap }

media_library
  id uuid PK, storage_path text, title text, tags text[],
  width int, height int, mime text, created_at timestamptz

partner_logos
  id uuid PK, storage_path text, link text, sort_order int,
  active bool, placement text, created_at timestamptz
```

Realtime já está habilitado em `site_content`; adicionar para `partner_logos` para atualização instantânea.

## O que NÃO está no escopo deste plano (fica para depois)

- Páginas institucionais completas da Fase 2 (Masterplan, Galeria, Plantas, Localização, Tour 3D). Vamos só **preparar a estrutura** e ambiente de preview; o conteúdo dessas páginas entra num próximo ciclo.
- Vídeos: a coluna existe na biblioteca de mídia, mas o player de vídeo no site fica para a Fase 2.