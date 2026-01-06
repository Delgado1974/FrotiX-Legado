# CLAUDE.md - Instruções para o Claude Code

Este arquivo contém instruções e regras específicas do projeto FrotiX para o Claude Code.

## Regras Gerais

### Memorização:
- Quando o usuário disser "memorize", "guarde na memória" ou similar, **adicionar a instrução neste arquivo CLAUDE.md**
- Claude não tem memória persistente entre sessões - este arquivo é a "memória eterna"

## Regras de Git

### Commit e Push:
- Quando o usuário pedir para fazer commit, **sempre fazer push automaticamente** após o commit
- **IMPORTANTE:** Fazer commit/push **APENAS** dos arquivos gerados ou modificados na sessão/janela atual
- **NUNCA** incluir arquivos staged de sessões anteriores - ignorá-los completamente
- Usar `git commit -- <arquivos>` para commitar apenas arquivos específicos da sessão quando necessário

### Commit Automático após Criação/Alteração:
- **SEMPRE** que eu criar ou alterar arquivos, **fazer commit e push automaticamente** para a branch `main` **SEM** esperar o usuário pedir
- Incluir no commit **TODOS** os arquivos criados/modificados na tarefa atual
- Usar mensagem de commit descritiva explicando o que foi feito
- Aplicar esta regra para: criação de páginas, modificação de código, criação de documentação, alterações de CSS, etc.
- **Exceções**: NÃO aplicar se o usuário explicitamente pedir para não commitar

### Commits de Correção de Erros Próprios:
- Quando o commit for para corrigir erros que EU (Claude) gerei no próprio chat, o comentário do commit deve explicar:
  1. **O que eu fiz de errado** (ex: usei nome de propriedade incorreto)
  2. **O que fiz para consertar** (ex: corrigi para o nome correto da propriedade)

## Regras de API/Controllers

### Authorize em Endpoints:
- **NUNCA** usar `[Authorize]` em APIs de Endpoint (Controllers com `[ApiController]`)
- A autenticação/autorização deve ser tratada de outra forma, não via atributo nos endpoints

## Regras de CSS

### Onde colocar alterações de CSS:
- **CSS Local (no arquivo .cshtml da página)**: Quando o estilo será usado em apenas UMA página
- **CSS Global (frotix.css)**: Quando o estilo será usado em MAIS DE UMA página

### Sintaxe de @keyframes em CSHTML:
- Quando `@keyframes` for colocado no CSS dentro de arquivo `.cshtml`, **SEMPRE** escrever como `@@keyframes` (double @)
- O Razor interpreta `@` como código C#, então precisa escapar com `@@`
- Exemplo correto em CSHTML: `@@keyframes minhaAnimacao { ... }`

### Tooltips Padrão FrotiX:
**SEMPRE** usar a classe `tooltip-ftx-azul` para todas as tooltips do sistema.

**Características do Padrão:**
- **Cor de fundo**: Azul petróleo (#154c62)
- **Texto**: Branco, fonte 0.75rem (letras menores)
- **Borda**: 1px solid rgba(255, 255, 255, 0.3) - branca fina translúcida
- **Border-radius**: 0.5rem (cantos bem arredondados)
- **Sem setas**: `tooltip-arrow` sempre escondido
- **Sombra**: 0 2px 8px rgba(0, 0, 0, 0.25)
- **Padding**: 0.375rem 0.625rem (compacto)

**Como usar em HTML:**
```html
<button data-bs-toggle="tooltip"
        data-bs-custom-class="tooltip-ftx-azul"
        data-bs-placement="top"
        title="Texto da tooltip">
    Botão
</button>
```

**Como usar em JavaScript (Bootstrap):**
```javascript
new bootstrap.Tooltip(elemento, {
    customClass: 'tooltip-ftx-azul'
});
```

**IMPORTANTE:**
- **NUNCA** criar tooltips com estilos diferentes
- **SEMPRE** usar `tooltip-ftx-azul` para manter consistência visual
- A classe está definida globalmente em `frotix.css`

## Regras de Ícones

### Ícone padrão para botões "Voltar à Lista":
- O ícone dos botões "Voltar à Lista" e semelhantes é **sempre**: `fa-duotone fa-rotate-left icon-space icon-rotate-left`
- **NUNCA** alterar este ícone para outro (como fa-arrow-left)

## Regras de Botões

### Botão "Voltar à Lista" - Localização determina a classe:
- **No Header da página** (dentro de `ftx-card-header`, `ftx-card-actions`, ou similar): usar `btn btn-header-orange`
- **No rodapé/corpo do formulário**: usar `btn btn-voltar` (cor marrom #68432C)

## Padrão FrotiX para Páginas de Criação/Atualização (Upsert)

### Estrutura do Header:
- Container: `<div class="ftx-card-header d-flex justify-content-between align-items-center">`
- Título: `<h2 class="titulo-paginas mb-0">` com ícone `fa-duotone` (cor primária laranja #C67750, secundária branca - automático dentro do header)
- Botão "Voltar à Lista": `btn btn-header-orange` com ícone `fa-duotone fa-rotate-left icon-space icon-rotate-left` (gira continuamente)

### Botões de Ação (rodapé do formulário):

#### Botão Criar (novo registro):
- Classe: `btn btn-azul btn-submit-spin`
- Ícone: `fa-duotone fa-floppy-disk icon-space icon-pulse`
- Texto: **"Criar [Objeto]"** (ex: "Criar Viagem", "Criar Operador", "Criar Usuário")
- Comportamento: **pulsa** enquanto visível → **gira** ao clicar (processando)

#### Botão Atualizar (edição):
- Classe: `btn btn-azul btn-submit-spin`
- Ícone: `fa-duotone fa-floppy-disk icon-space icon-pulse`
- Texto: **"Atualizar [Objeto]"** (ex: "Atualizar Viagem", "Atualizar Operador", "Atualizar Usuário")
- Comportamento: **pulsa** enquanto visível → **gira** ao clicar (processando)

#### Botão Cancelar Operação:
- Classe: `btn btn-ftx-fechar`
- Ícone: `fa-duotone fa-circle-xmark icon-space icon-pulse`
- Texto: **"Cancelar Operação"**
- Comportamento: **pulsa** continuamente

### Classes CSS importantes:
| Classe | Descrição |
|--------|-----------|
| `btn-header-orange` | Botão laranja para header com borda preta e outline branco no hover |
| `btn-azul` | Botão azul para ações principais (Criar e Atualizar) |
| `btn-ftx-fechar` | Botão vinho para cancelar operação |
| `icon-pulse` | Animação de pulsação contínua no ícone |
| `icon-spin` | Animação de rotação contínua no ícone |
| `icon-rotate-left` | Animação de rotação anti-horária (para ícone de voltar) |
| `btn-submit-spin` | Classe para ativar spinning no ícone ao clicar no submit |

### JavaScript necessário para spinning ao clicar:
```javascript
document.querySelectorAll('.btn-submit-spin').forEach(function (btn) {
    btn.addEventListener('click', function () {
        const icon = btn.querySelector('i');
        if (icon) {
            icon.classList.remove('icon-pulse');
            icon.classList.add('icon-spin');
        }
    });
});
```

## Padrão FrotiX para Modal de Espera (Loading Overlay)

### SEMPRE usar este padrão para modais de espera/carregamento:
- **Overlay**: Cinza escuro semi-transparente com blur (`ftx-spin-overlay`)
- **Caixa central**: Fundo escuro translúcido com bordas arredondadas (`ftx-spin-box`)
- **Logo**: Logotipo FrotiX pulsando (`ftx-loading-logo`) - **DEVE SEMPRE PULSAR**
- **Barra de progresso**: Barra animada deslizante (`ftx-loading-bar`)
- **Textos**: Título e subtítulo estilizados (`ftx-loading-text`, `ftx-loading-subtext`)

### **IMPORTANTE - Logo deve SEMPRE pulsar**:
- O logo nos modais de espera **SEMPRE deve ter animação de pulse**
- Usar a classe `ftx-loading-logo` que já contém a animação
- A classe define: `animation: ftxLogoPulse 1.5s ease-in-out infinite !important;`
- **NÃO** adicionar estilos inline que possam sobrescrever a animação
- **VERIFICAR** se todos os modais de espera têm o logo pulsando corretamente

### HTML do Modal de Espera padrão:
```html
<div id="meu-loading-overlay" class="ftx-spin-overlay" style="z-index: 999999; cursor: wait; display: none;">
    <div class="ftx-spin-box" style="text-align: center; min-width: 300px;">
        <img src="/images/logo_gota_frotix_transparente.png" alt="FrotiX" class="ftx-loading-logo" style="display: block;" />
        <div class="ftx-loading-bar"></div>
        <div class="ftx-loading-text">Mensagem principal...</div>
        <div class="ftx-loading-subtext">Aguarde, por favor</div>
    </div>
</div>
```

### JavaScript para controlar o Modal de Espera:
```javascript
// Mostrar
function mostrarLoading(mensagem = 'Carregando...') {
    $('#meu-loading-overlay').remove(); // Remove anterior se existir
    const html = `
        <div id="meu-loading-overlay" class="ftx-spin-overlay" style="z-index: 999999; cursor: wait;">
            <div class="ftx-spin-box" style="text-align: center; min-width: 300px;">
                <img src="/images/logo_gota_frotix_transparente.png" alt="FrotiX" class="ftx-loading-logo" style="display: block;" />
                <div class="ftx-loading-bar"></div>
                <div class="ftx-loading-text">${mensagem}</div>
                <div class="ftx-loading-subtext">Aguarde, por favor</div>
            </div>
        </div>
    `;
    $('body').append(html);
}

// Esconder
function esconderLoading() {
    $('#meu-loading-overlay').fadeOut(300, function() { $(this).remove(); });
}
```

### NUNCA usar:
- Spinner Bootstrap genérico (`spinner-border`)
- Fundo branco em modais de loading
- FontAwesome `fa-spinner fa-spin` como indicador principal
- Loading inline na página (sempre usar overlay fullscreen)

## Regras de Gravação de Conversas

### Objetivo:
Documentar **decisões técnicas** e **mudanças no projeto** realizadas em cada sessão de trabalho com o Claude Code.

### Início de cada conversa:
1. **SEMPRE** pedir para o usuário fazer `/rename` para nomear a conversa
2. **Formato do arquivo**: `AAAA.MM.DD-HH.mm - Nome da Conversa.md`
   - Exemplo: `2026.01.06-14.57 - Implementação do Dashboard de Frotas.md`
   - Substituir data/hora pelas atuais do início da conversa
3. **Perguntar**: "Esta é uma conversa nova ou continuação de outra?"
4. **Se for continuação**:
   - Listar as últimas 15 conversas da pasta `Conversas/` para o usuário escolher
   - Permitir opção "Nenhuma delas" se a conversa anterior não estiver na lista
   - Registrar no arquivo qual conversa está sendo continuada

### Local de armazenamento:
- Pasta: **`Conversas/`** na raiz do projeto
- Um arquivo `.md` por sessão de conversa

### Quando gravar:
- **SEMPRE ao final de cada sessão de trabalho**
- Quando o usuário pedir explicitamente "grave a conversa" ou "salve o log"

### Conteúdo obrigatório do registro:

#### 1. Cabeçalho:
```markdown
# [Nome da Conversa]

**Data/Hora de Início**: AAAA-MM-DD HH:mm:ss
**Data/Hora de Término**: AAAA-MM-DD HH:mm:ss
**Duração Total**: X horas Y minutos
**Continuação de**: [Nome do arquivo da conversa anterior] ou "Conversa nova"
```

#### 2. Resumo Executivo:
- Breve descrição do que foi realizado (2-4 parágrafos)
- Principais decisões técnicas tomadas

#### 3. Arquivos Criados/Modificados:
- Lista completa de arquivos alterados
- Para cada arquivo: breve descrição da mudança
- Mensagens de commit associadas

#### 4. Problemas Encontrados e Soluções:
- Erros, bugs, warnings encontrados
- Como foram diagnosticados
- Soluções aplicadas (com código/comandos quando relevante)

#### 5. Decisões Técnicas:
- Escolhas arquiteturais feitas
- Justificativas para as decisões
- Alternativas consideradas (se houver)

#### 6. Tarefas Pendentes (se houver):
- O que ficou para fazer posteriormente
- Sugestões de próximos passos

#### 7. Continuidade:
- Se a conversa pode ter continuação em outro chat, mencionar explicitamente
- Indicar o contexto necessário para continuar

### Exemplo de estrutura de arquivo:
```markdown
# Implementação do Dashboard de Frotas

**Data/Hora de Início**: 2026-01-06 14:30:00
**Data/Hora de Término**: 2026-01-06 16:45:00
**Duração Total**: 2 horas 15 minutos
**Continuação de**: Conversa nova

## Resumo Executivo
Implementado dashboard completo de visualização de frotas com gráficos...

## Arquivos Criados/Modificados
1. `Pages/Dashboard/Frotas.cshtml` - Criada página principal do dashboard
   - Commit: "Adiciona dashboard de frotas com gráficos interativos"

2. `wwwroot/css/frotix.css` - Adicionados estilos para cards de métricas
   - Commit: "Adiciona estilos para cards de dashboard"

## Problemas Encontrados e Soluções
### Erro: Gráfico não renderizando
**Problema**: Chart.js não carregava os dados corretamente...
**Solução**: Ajustado o formato dos dados para...

## Decisões Técnicas
- Escolhido Chart.js para gráficos por ser mais leve que D3.js
- Implementado refresh automático a cada 30 segundos

## Tarefas Pendentes
- Adicionar filtros por período
- Implementar exportação para PDF

## Continuidade
Esta conversa pode ser continuada para implementar as tarefas pendentes.
```
