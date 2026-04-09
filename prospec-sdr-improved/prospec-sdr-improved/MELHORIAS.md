# Melhorias Aplicadas – Prospec SDR (Cobreflex)

## Identidade Visual Mantida
- Cor primária `#0B1F33` preservada em todos os componentes
- Acento `emerald-500/600` mantido como destaque
- Paleta estendida com variações `#0e2a45`, `#143656`

---

## Novos Arquivos

| Arquivo | Descrição |
|---|---|
| `src/hooks/useAuth.ts` | Hook compartilhado auth + role, elimina duplicação em todas as páginas |
| `src/utils/businessDays.ts` | Funções utilitárias `getBusinessDays` e `getBusinessDaysPassed` — antes duplicadas em `metas` e `tv-meta` |

---

## Componentes Melhorados

### `Sidebar.tsx`
- Toggle pill flutuante (`-right-3`) mais elegante
- Active state com dot verde + fundo sutil
- Tooltip nos itens quando recolhido
- Botão de logout isolado no footer com hover vermelho
- Logo com gradiente emerald + subtítulo "CRM SDR"

### `Header.tsx`
- Avatar com iniciais do e-mail
- Saudação dinâmica (Bom dia / Boa tarde / Boa noite)
- Botão de notificações (placeholder)
- Removida duplicação do logout (já está na Sidebar)

### `StatsCard.tsx`
- Tipagem forte com `LucideIcon`
- Sistema de accent colors: `blue`, `emerald`, `amber`, `rose`, `default`
- Suporte a `trend` com seta direcional
- Hover lift animation via `.card-hover`

### `LeadsChart.tsx`
- Migrado de `LineChart` para `AreaChart` com gradiente
- Tooltip customizado com tema dark
- Axes sem bordas, visual mais limpo
- Linha de meta diária (goal / 22 dias úteis)

### `NewLeadModal.tsx` e `NewIntecModal.tsx`
- Design unificado com `rounded-2xl`
- Labels com `uppercase tracking-wide`
- Inputs com `focus:ring` consistente
- Botão de fechar com ícone X

---

## Páginas Melhoradas

### `login/page.tsx`
- Fundo `#0B1F33` com grid pattern sutil
- Blobs de luz decorativos (emerald + blue)
- Inputs glassmorphism `bg-white/8`
- Botão com ícone ArrowRight animado

### `dashboard/page.tsx`
- Usa `useAuth` hook — sem useEffect duplicado
- `StatsCard` com ícones e accents por métrica
- Barra de progresso de meta com cores dinâmicas (verde/amarelo/vermelho)
- Header com data formatada em PT-BR
- Filtro de SDR com ícone Filter

### `leads/page.tsx`
- **Search bar** por nome, e-mail, vendedor
- **Paginação** com 20 itens por página
- **Skeleton loading** com efeito shimmer
- Status badges com cores e sem dropdown no corpo da tabela (usa select estilizado)
- Botão "Novo Lead" no topo

### `intec/page.tsx`
- Cards de resumo: total em cotações, total ganho, registros em aberto
- Status badges com ícones (TrendingUp, TrendingDown, Minus)
- Skeleton loading
- Acesso disponível para todos os usuários autenticados (era falta de controle)

### `metas/page.tsx`
- Usa `businessDays` utils (sem duplicação)
- Barra de progresso animada
- Card de projeção com borda colorida (verde/vermelho)
- Botão de remover venda com ícone Trash2
- Tela de acesso negado com ícone e mensagem

### `meta-mensal/page.tsx`
- Mostra meta atual do SDR selecionado
- Feedback visual "Meta salva!" no botão
- Proteção de acesso (ADMIN only)

### `relatorios/page.tsx`
- Usa `useAuth` hook
- Empty state com ícone Sparkles
- Loading state com spinner
- Labels uppercase para todos os controles

### `tv-meta/page.tsx`
- Usa `businessDays` utils (sem duplicação)
- Grid pattern sutil no fundo
- Blob de luz emerald
- Logo Cobreflex no cabeçalho
- Timestamp de última atualização
- Bordas coloridas no card de projeção

---

## Backend

### `app.module.ts`
- `FirebaseAuthGuard` e `FirebaseService` agora registrados no módulo
- `AppController` e `AppService` incluídos

### `roles.guard.ts`
- `ForbiddenException` com mensagem em PT-BR
- Guard retorna `true` para rotas sem roles definidas (antes lançava erro)

---

## globals.css
- Fontes: **Syne** (display/títulos) + **DM Sans** (corpo)
- CSS variables da paleta Cobreflex
- Scrollbar customizada
- Animação `fadeSlideUp` + classe `.page-enter`
- Classe `.shimmer` para skeleton loading
- Classe `.card-hover` para lift effect

---

## tailwind.config.js
- `fontFamily.sans` → DM Sans
- `fontFamily.display` → Syne
- `colors.cobreflex` → paleta completa 500–900
- `boxShadow.card`, `.card-md`, `.card-lg` → shadows semânticas
