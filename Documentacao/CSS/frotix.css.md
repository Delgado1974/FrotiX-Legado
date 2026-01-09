# Documentação: frotix.css - Estilos Globais do Sistema FrotiX

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0  
> **Padrão**: FrotiX Simplificado

---

## Objetivos

O arquivo **frotix.css** é a folha de estilos global do sistema FrotiX, contendo todas as classes utilitárias, componentes reutilizáveis, animações e padrões visuais seguidos em toda a aplicação.

**Principais funcionalidades:**
- ✅ **Variáveis CSS** globais (cores, tamanhos, espaçamentos)
- ✅ **Header de Card** padrão (`.ftx-card-header`) com gradiente animado
- ✅ **Botões** padronizados (laranja header, ação, cores temáticas)
- ✅ **Badges de status** (ativo/inativo) com cores e animações
- ✅ **Formulários** (altura padrão 38px, centralização vertical)
- ✅ **Tooltips** Syncfusion customizados (sem setas, tema azul)
- ✅ **Tabelas** com avatares, ações e espaçamento
- ✅ **Animações** (ripple, pulse, spin, fade, slide)
- ✅ **Spinner global** com logo FrotiX
- ✅ **Responsividade** para mobile

---

## Arquivos Envolvidos

1. **wwwroot/css/frotix.css** - Arquivo principal (4036 linhas)
2. **Pages/Shared/_Head.cshtml** - Carregamento global do CSS
3. **wwwroot/js/frotix.js** - JavaScript complementar (spinner, ripple)

---

## 1. Variáveis CSS Globais

### Problema
Centralizar valores de cores, tamanhos e espaçamentos para facilitar manutenção e garantir consistência visual.

### Solução
Usar CSS Custom Properties (`:root`) para definir variáveis reutilizáveis em todo o sistema.

### Código

```css
:root {
    /* Motor do Glow (botões) */
    --glow-ring: 1px;
    --glow-spread: 4px;
    --glow-depth: 8px;
    
    /* Paleta para Status (centralizado no Global) */
    --status-active-bg: #22c55e; /* Verde "ok" */
    --status-active-bg-hover: #16a34a;
    --status-active-shadow: rgba(34,197,94,.45);
    --status-inactive-bg: #2F4F4F; /* Cinza tema */
    --status-inactive-bg-hover: #253A3A;
    --status-inactive-shadow: rgba(47,79,79,.45);
    
    /* Botões em tabela */
    --ftx-icon-btn: 28px;
    --ftx-badge-font: .72rem;
    --ftx-badge-pad-v: .18rem; /* vertical */
    --ftx-badge-pad-h: .50rem; /* horizontal */
    --ftx-badge-radius: .65rem;
    --ftx-avatar: 32px;
    --ftx-action-icon: .90rem;
    
    /* Altura padrão dos controles de formulário */
    --ftx-input-height: 38px;
}
```

**✅ Comentários:**
- Variáveis começam com `--` (sintaxe CSS Custom Properties)
- Valores podem ser sobrescritos em componentes específicos
- Facilita temas dark/light futuros

---

## 2. Header de Card Padrão (ftx-card-header)

### Problema
Criar header consistente para todas as páginas com título, ícone e botões de ação, seguindo identidade visual FrotiX.

### Solução
Classe `.ftx-card-header` com gradiente animado, título estilizado e área de ações flexível.

### Código

```css
/* Container do Header do Card */
.ftx-card-header {
    background: linear-gradient(135deg, #325d88 0%, #2a4d73 25%, #3d6f9e 50%, #2a4d73 75%, #325d88 100%);
    background-size: 400% 400%;
    animation: ftxHeaderGradientShift 8s ease infinite;
    padding: 1.25rem 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
    border-radius: 10px 10px 0 0;
}

/* Título do Header */
.ftx-card-header .titulo-paginas {
    font-family: 'Outfit', sans-serif !important;
    font-weight: 900 !important;
    font-size: 1.925rem !important;
    color: #ffffff !important;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* Ícone Duotone - Branco/Laranja */
.ftx-card-header .titulo-paginas i.fa-duotone::before {
    color: #ffffff !important;
}
.ftx-card-header .titulo-paginas i.fa-duotone::after {
    color: #C67750 !important;
}
```

**✅ Comentários:**
- Gradiente animado cria efeito de movimento sutil
- Ícones Font Awesome Duotone com cores específicas
- Responsivo: empilha verticalmente em mobile

---

## 3. Botão Laranja do Header

### Problema
Botão de ação principal no header deve ser destacado e seguir padrão visual específico.

### Solução
Botão com fundo marrom (#A0522D), borda preta fina + outline branco de 2px, e animações de hover.

### Código

```css
.btn-header-orange,
.btn-fundo-laranja {
    background-color: #A0522D !important;
    color: #fff !important;
    border: 1px solid #333 !important; /* Borda preta fina */
    border-radius: 8px;
    padding: 0.5rem 1.25rem;
    font-family: 'Outfit', sans-serif !important;
    font-weight: 600;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.8), /* Borda branca 2px */
                0 0 12px rgba(160, 82, 45, 0.4) !important;
}

.btn-header-orange:hover {
    background-color: #8B4513 !important;
    transform: translateY(-2px);
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 1),
                0 0 20px rgba(160, 82, 45, 0.6) !important;
}
```

**✅ Comentários:**
- `box-shadow` duplo cria efeito de borda branca externa
- Hover eleva botão (`translateY(-2px)`)
- Glow aumenta no hover para feedback visual

---

## 4. Badges de Status

### Problema
Badges de status (Ativo/Inativo) devem ser clicáveis, visíveis e seguir paleta de cores padrão.

### Solução
Classes `.badge-ativo` e `.badge-inativo` usando variáveis CSS, com hover e transições suaves.

### Código

```css
.badge-ativo {
    background-color: var(--status-active-bg) !important;
    color: #fff !important;
    padding: var(--ftx-badge-pad-v) var(--ftx-badge-pad-h);
    border-radius: var(--ftx-badge-radius);
    font-size: var(--ftx-badge-font);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px var(--status-active-shadow);
}

.badge-ativo:hover {
    background-color: var(--status-active-bg-hover) !important;
    transform: scale(1.05);
}

.badge-inativo {
    background-color: var(--status-inactive-bg) !important;
    color: #fff !important;
    /* ... mesmo padrão ... */
}
```

**✅ Comentários:**
- Usa variáveis CSS para fácil manutenção
- Hover com `scale(1.05)` para feedback tátil
- Cursor pointer indica interatividade

---

## 5. Controles de Formulário (Altura Padrão 38px)

### Problema
Garantir altura uniforme em todos os controles de formulário (inputs, selects, Syncfusion) para alinhamento visual.

### Solução
Aplicar altura padrão via variável CSS e ajustar padding/line-height para centralização vertical.

### Código

```css
.form-control,
.form-select,
.e-ddl.e-input-group,
.e-dropdowntree .e-input-group {
    height: var(--ftx-input-height) !important;
    min-height: var(--ftx-input-height) !important;
    padding: 0.375rem 0.75rem !important;
    font-size: 0.875rem !important;
    border-radius: 0.375rem;
}

/* Selects nativos - centralização com line-height */
.form-select,
select.form-control {
    line-height: 38px !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
}

/* Syncfusion - centralização com flexbox */
.e-input-group.e-control-wrapper {
    height: var(--ftx-input-height) !important;
    display: flex !important;
    align-items: center !important;
}
```

**✅ Comentários:**
- `!important` garante que sobrescreve estilos de bibliotecas externas
- Diferentes técnicas para diferentes tipos de controle (line-height vs flexbox)
- Textarea tem altura auto (pode crescer)

---

## 6. Tooltips Syncfusion Customizados

### Problema
Tooltips padrão do Syncfusion têm setas e cores que não seguem design FrotiX.

### Solução
Sobrescrever estilos do Syncfusion com gradiente azul, sem setas, e bordas arredondadas.

### Código

```css
.e-tooltip-wrap {
    background: linear-gradient(135deg, #3D5771 0%, #4a6b8a 100%) !important;
    color: #ffffff !important;
    border: none !important;
    border-radius: 6px !important;
    padding: 6px 12px !important;
    font-size: 12px !important;
    box-shadow: 0 3px 12px rgba(61, 87, 113, 0.35) !important;
    z-index: 99999 !important;
}

/* Ocultar setas */
.e-tooltip-wrap .e-arrow-tip,
.e-tooltip-wrap .e-arrow-tip-outer,
.e-tooltip-wrap .e-arrow-tip-inner {
    display: none !important;
}
```

**✅ Comentários:**
- Gradiente azul seguindo paleta FrotiX
- `z-index` alto garante que aparece sobre outros elementos
- Setas removidas via `display: none`

---

## 7. Botões de Ação em Tabelas (btn-icon-28)

### Problema
Botões de ação em tabelas devem ser pequenos, quadrados, com ícones centralizados e cores temáticas.

### Solução
Classe `.btn-icon-28` com tamanho fixo (28x28px), gradientes por função (editar=azul, excluir=vinho, etc).

### Código

```css
.btn-icon-28,
.ftx-btn-acao {
    width: var(--ftx-icon-btn);
    height: var(--ftx-icon-btn);
    min-width: var(--ftx-icon-btn);
    min-height: var(--ftx-icon-btn);
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-icon-28.btn-azul {
    background: linear-gradient(135deg, #3D5771 0%, #2d4559 100%) !important;
}

.btn-icon-28.btn-vinho {
    background: linear-gradient(135deg, #561D2D 0%, #3d1520 100%) !important;
}

.btn-icon-28.btn-verde {
    background: linear-gradient(135deg, #27ae60 0%, #219a52 100%) !important;
}
```

**✅ Comentários:**
- Tamanho fixo evita "pulos" ao trocar ícones
- Gradientes criam profundidade visual
- Hover com animação `buttonWiggle` para feedback

---

## 8. Animações

### Problema
Fornecer animações suaves e consistentes para feedback visual em interações.

### Solução
Keyframes reutilizáveis para diferentes tipos de animação (spin, pulse, fade, slide, ripple).

### Código

```css
/* Spinner */
@keyframes ftxspin {
    to { transform: rotate(360deg); }
}

/* Pulse (ícones) */
@keyframes pulseIcon {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.2); }
}

/* Fade In */
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

/* Ripple */
@keyframes ftxRippleAnim {
    from { transform: scale(0); opacity: 1; }
    to { transform: scale(2); opacity: 0; }
}

/* Button Wiggle */
@keyframes buttonWiggle {
    0% { transform: translateY(0) rotate(0deg); }
    25% { transform: translateY(-2px) rotate(-1deg); }
    50% { transform: translateY(-3px) rotate(0deg); }
    75% { transform: translateY(-2px) rotate(1deg); }
    100% { transform: translateY(0) rotate(0deg); }
}
```

**✅ Comentários:**
- Animações leves (duração curta) para não distrair
- `transform` é mais performático que mudanças de posição/tamanho
- Ripple usa `scale` + `opacity` para efeito de onda

---

## 9. Spinner Global

### Problema
Exibir indicador de carregamento consistente em toda a aplicação.

### Solução
Overlay fixo com logo FrotiX pulsante e barra de progresso animada.

### Código

```css
.ftx-spin-overlay {
    position: fixed;
    inset: 0;
    z-index: 50000;
    background: rgba(14,14,18,.82);
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: saturate(120%) blur(2px);
}

.ftx-spin-box {
    text-align: center;
    padding: 28px 32px;
    border-radius: 16px;
    background: rgba(30,30,40,.35);
    border: 1px solid rgba(255,255,255,.08);
    color: #fff;
    min-width: 260px;
    box-shadow: 0 8px 30px rgba(0,0,0,.35);
}

.ftx-loading-logo {
    animation: pulseIcon 1.5s ease-in-out infinite;
}
```

**✅ Comentários:**
- `inset: 0` é equivalente a `top: 0; right: 0; bottom: 0; left: 0`
- `backdrop-filter` cria efeito de blur no fundo
- Logo pulsa para indicar atividade

---

## 10. Responsividade

### Problema
Garantir que componentes funcionem bem em dispositivos móveis.

### Solução
Media queries para ajustar layout, tamanhos de fonte e espaçamentos em telas pequenas.

### Código

```css
@media (max-width: 768px) {
    .ftx-card-header {
        flex-direction: column;
        text-align: center;
        padding: 1rem;
    }
    
    .ftx-card-header .titulo-paginas {
        font-size: 1.5rem !important;
        justify-content: center;
    }
    
    .btn-header-orange {
        width: 100%;
        justify-content: center;
    }
}
```

**✅ Comentários:**
- Breakpoint em 768px (tablets e abaixo)
- Header empilha verticalmente
- Botões ocupam largura total em mobile

---

## Estrutura do Arquivo

O arquivo está organizado em seções principais:

1. **Variáveis CSS** (`:root`)
2. **Reset e Base** (`*`, `body`, `html`)
3. **Controles de Formulário** (altura padrão, centralização)
4. **Animações** (keyframes)
5. **Spinner Global** (`.ftx-spin-overlay`)
6. **Header de Card** (`.ftx-card-header`)
7. **Botões** (header laranja, ação, cores)
8. **Badges** (status, contadores)
9. **Formulários** (labels, required, validação)
10. **SweetAlert2** (customizações)
11. **Tooltips** (Syncfusion customizados)
12. **Tabelas** (avatares, ações, espaçamento)
13. **Dropdowns** (motorista com foto)
14. **Responsividade** (media queries)

---

## Troubleshooting

**Estilos não aplicam:** Verificar ordem de carregamento (frotix.css deve vir após Bootstrap/Syncfusion)  
**Altura de inputs inconsistente:** Verificar se variável `--ftx-input-height` está definida  
**Tooltips com setas:** Verificar se regras de `display: none` para `.e-arrow-tip` estão aplicadas  
**Gradiente do header não anima:** Verificar se `animation: ftxHeaderGradientShift` está presente

---

## Referências

- **JavaScript Complementar:** `wwwroot/js/frotix.js`
- **Carregamento:** `Pages/Shared/_Head.cshtml`
- **Fonte:** Google Fonts - Outfit

---

## Changelog

**08/01/2026** - Versão 2.0 (Padrão FrotiX Simplificado)
- Documentação completa criada
- Todas as seções principais documentadas
- Exemplos de uso adicionados
