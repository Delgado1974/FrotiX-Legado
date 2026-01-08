# CLAUDE.md - Instruções para o Claude Code

Este arquivo contém instruções e regras específicas do projeto FrotiX para o Claude Code.

## Regras Gerais

### Memorização:
- Quando o usuário disser "memorize", "guarde na memória" ou similar, **adicionar a instrução neste arquivo CLAUDE.md**
- Claude não tem memória persistente entre sessões - este arquivo é a "memória eterna"

### Sistema de Alertas SweetAlert:
**SEMPRE** usar o sistema customizado de alertas SweetAlert (alerta.js e sweetalert_interop.js) para comunicação com o usuário.

**NUNCA** usar alertas nativos do JavaScript (`alert()`, `confirm()`, `prompt()`).

**Funções disponíveis:**
- `Alerta.Confirmar(titulo, texto, confirm, cancel)` - retorna `Promise<boolean>`
  - Exemplo: `Alerta.Confirmar("Confirmar ação", "Deseja continuar?", "Sim", "Não").then(result => { ... })`
- `Alerta.Erro(titulo, texto, confirm)` - mostra erro
- `Alerta.Sucesso(titulo, texto, confirm)` - mostra sucesso
- `Alerta.Warning(titulo, texto, confirm)` - mostra aviso
- `Alerta.Info(titulo, texto, confirm)` - mostra informação
- `Alerta.TratamentoErroComLinha(arquivo, metodo, erro)` - para erros em try-catch

**Importante:**
- Todas essas funções retornam **Promises**
- Sempre usar `.then()` ou `await` para processar resultados
- `Alerta.Confirmar()` retorna `true` se usuário confirmou, `false` se cancelou

### Try-Catch Obrigatório:
**TODAS** as funções JavaScript e C# devem ter blocos try-catch.

**JavaScript:**
```javascript
function minhaFuncao() {
    try {
        // código
    } catch (erro) {
        Alerta.TratamentoErroComLinha("meuArquivo.js", "minhaFuncao", erro);
    }
}
```

**C#:**
```csharp
public IActionResult MinhaAction() {
    try {
        // código
    } catch (Exception error) {
        Alerta.TratamentoErroComLinha("MeuController.cs", "MinhaAction", error);
        return Json(new { success = false, message = error.Message });
    }
}
```

**Regra:**
- **NUNCA** deixar função sem try-catch
- **SEMPRE** usar `Alerta.TratamentoErroComLinha()` no bloco catch
- No C#, sempre retornar `{ success: false, message }` em caso de erro

## Regras de Git

### Branch Principal (main):
- **PREFERÊNCIA:** O usuário prefere que todos os commits e pushes sejam feitos diretamente para a branch `main`.
- **LIMITAÇÃO TÉCNICA:** A ferramenta de submissão do Claude pode criar automaticamente uma branch temporária (ex: `doc-veiculo-module-12345`) mesmo quando solicitado `branch_name="main"`.
- **AÇÃO:** Sempre tentar submeter para a `main`. Se a ferramenta gerar uma branch diferente, informar IMEDIATAMENTE o usuário com o comando exato para fazer o pull daquela branch específica.

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

### Estilo de Ícones FontAwesome - SEMPRE Duotone:
- **TODOS** os ícones do sistema FrotiX **DEVEM** usar o estilo **`fa-duotone`**
- **NUNCA** usar outros estilos como `fa-regular`, `fa-solid`, `fa-light`, `fa-thin`, `fa-brands`
- Aplicável a:
  - Ícones de navegação (nav.json)
  - Ícones em botões
  - Ícones em cards e headers
  - Ícones em listas e tabelas
  - Ícones em qualquer componente da interface

**Exemplos corretos:**
- ✅ `fa-duotone fa-home`
- ✅ `fa-duotone fa-car`
- ✅ `fa-duotone fa-user`

**Exemplos incorretos:**
- ❌ `fa-regular fa-home`
- ❌ `fa-solid fa-car`
- ❌ `fa-light fa-user`

**Razão**: O estilo duotone mantém consistência visual em todo o sistema, com cores primárias e secundárias automaticamente aplicadas conforme o contexto (header, sidebar, etc.).

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
1. **PRIMEIRO**: Perguntar se é uma **conversa nova** ou **continuação** de outra
2. **Se for CONTINUAÇÃO**:
   - Listar as últimas 15 conversas da pasta `Conversas/` para o usuário escolher
   - Permitir opção "Nenhuma delas" se a conversa anterior não estiver na lista
   - Registrar no arquivo qual conversa está sendo continuada
3. **Se for NOVA**:
   - Pedir apenas o **nome da conversa** (usuário fornece sem data/hora)
   - Exemplo: Usuário diz: "Implementação do Dashboard de Frotas"
   - EU (Claude) acrescento data/hora no formato: `AAAA.MM.DD-HH.mm - [Nome].md`
   - Exemplo final do arquivo: `2026.01.06-14.57 - Implementação do Dashboard de Frotas.md`

### Local de armazenamento:
- Pasta: **`Conversas/`** na raiz do projeto
- Um arquivo `.md` por sessão de conversa

### Quando gravar:
- **AUTOMATICAMENTE e INCREMENTALMENTE** durante toda a sessão:
  - **No início**: Criar arquivo com cabeçalho e hora de início (após `/rename` e pergunta sobre continuação)
  - **Durante a sessão**: Atualizar o arquivo automaticamente a cada marco importante:
    - Quando criar ou modificar arquivos
    - Quando resolver problemas ou corrigir erros
    - Quando tomar decisões técnicas importantes
    - Quando fazer commits
  - **Ao final**: Adicionar hora de término, duração e resumo executivo final
- Quando o usuário pedir explicitamente "grave a conversa", "atualize a conversa" ou "salve o log"

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

2. `wwwroot/css/frotix.css` - Adicionados estilos para cards de dashboard"

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

## Sistema de Documentação de Funcionalidades

### Objetivo:
Documentar **cada página/funcionalidade do FrotiX Web** de forma completa e padronizada, facilitando manutenção, referência futura e onboarding de novos desenvolvedores.

### Local de Armazenamento:
- Pasta: **`Documentacao/`** na raiz do projeto
- Um arquivo `.md` por funcionalidade/página

### Nomenclatura de Arquivos:
- Formato: **`Funcionalidade - [Módulo] - [Página].md`**
- Exemplos:
  - `Funcionalidade - Abastecimento - Dashboard.md`
  - `Funcionalidade - Abastecimento - Gestao.md`
  - `Funcionalidade - Abastecimento - Importacao.md`
  - `Funcionalidade - Abastecimento - Pendencias.md`
  - `Funcionalidade - Veiculo - Upsert.md`
  - `Funcionalidade - Patrimonio - Index.md`

### Quando Documentar:
1. **Novas funcionalidades**: Sempre que criar uma nova página/módulo
2. **Alterações significativas**: Quando modificar comportamento, adicionar features ou corrigir bugs importantes
3. **Solicitação do usuário**: Quando o usuário pedir documentação de uma página específica

### Quando Atualizar:
- **SEMPRE** que uma funcionalidade documentada for alterada:
  1. Atualizar as seções relevantes da **PARTE 1**
  2. Adicionar nova entrada no **LOG de Modificações (PARTE 2)** no topo (ordem decrescente)
  3. Atualizar **data de última atualização** e **incrementar versão** se necessário

### Estrutura Obrigatória do Arquivo:

#### Cabeçalho:
```markdown
# Documentação: [Nome da Funcionalidade]

> **Última Atualização**: DD/MM/AAAA
> **Versão Atual**: X.Y

---
```

#### Divisão em DUAS PARTES:

**PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE**
- Documentação técnica completa e detalhada
- Atualizada conforme a funcionalidade evolui

**PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES**
- Histórico cronológico de mudanças
- Ordem **DECRESCENTE** (mais recente primeiro)
- Formato: `## [Data/Hora] - Título da Modificação`

---

### PARTE 1 - Seções Obrigatórias:

#### 1. Índice
```markdown
## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Funcionalidades Específicas](#funcionalidades-específicas)
4. [Endpoints API](#endpoints-api)
5. [Frontend](#frontend)
6. [Validações](#validações)
7. [Troubleshooting](#troubleshooting)
```

#### 2. Visão Geral
- Descrição clara do que a funcionalidade faz
- **Características Principais** (lista com checkmarks ✅)
- Informações gerais sobre os dados exibidos/manipulados
- Exemplo de tabela descritiva quando aplicável

#### 3. Arquitetura
- **Estrutura de Arquivos**: Diagrama em texto mostrando organização
  ```
  FrotiX.Site/
  ├── Pages/
  │   └── [Módulo]/
  │       └── [Página].cshtml
  ├── Controllers/
  │   └── [Controller].cs
  └── wwwroot/
      ├── css/
      └── js/
  ```
- **Tecnologias Utilizadas**: Tabela com tecnologia e uso
- **Padrão Arquitetônico**: Explicação do padrão usado (MVC, MVVM, etc.)

#### 4. Funcionalidades Específicas
- Detalhar **TODAS** as funcionalidades da página
- Para cada funcionalidade:
  - Descrição clara
  - Localização no código
  - Exemplo de código quando relevante
  - Como funciona (passo a passo se necessário)

#### 5. Endpoints API (se houver)
- Documentar **TODOS** os endpoints usados pela página
- Para cada endpoint:
  - Método HTTP e rota
  - Descrição
  - Parâmetros (query, body, header)
  - Response (com exemplo JSON)
  - Erros possíveis
  - **INCLUIR CÓDIGO**: Copiar trechos reais do código do Controller

#### 6. Frontend
- **Estrutura HTML**: Componentes principais da página
- **JavaScript**: Funções importantes, eventos, ciclo de vida
  - **INCLUIR CÓDIGO**: Copiar trechos reais do JS (AJAX, EventListeners, Datatables)
- **CSS/Estilos**: Classes importantes, animações, temas
- **Modais**: Estrutura de modais usados
- **Componentes**: DropDowns, DataTables, Charts, etc.

#### 7. Validações
- Listar **TODAS** as validações aplicadas
- Para cada validação:
  - Campo/dado validado
  - Regra de validação
  - Mensagem de erro
  - **INCLUIR CÓDIGO**: Copiar trecho da validação (C# ou JS)

#### 8. Troubleshooting
- Listar problemas comuns e suas soluções
- Para cada problema:
  - Título claro do problema
  - **Sintomas**: Como o problema se manifesta
  - **Causas Possíveis**: Por que acontece
  - **Solução**: Como resolver (passo a passo)
  - Código de exemplo quando relevante

---

### Nível de Detalhe Esperado (IMPORTANTE):

- **TRECHOS DE CÓDIGO REAIS**: Não apenas descreva o que o código faz, **copie o bloco de código** relevante.
  - Exemplo incorreto: "O Javascript inicializa a DataTable com a URL da API".
  - Exemplo correto:
    ```javascript
    $('#tblAbastecimentos').DataTable({
        ajax: { url: "/api/abastecimento", type: "GET" },
        columns: [ ... ]
    });
    ```
- **Documentar estrutura HTML completa** dos componentes principais (Modais, Tabelas, Forms)
- **Documentar endpoints API** com request/response completos e código do Controller
- **Documentar validações** com o código exato (if/else, DataAnnotation)

---

## Memória (Projeto): Padrão de Documentação FrotiX (`Documentacao/`)

Esta seção consolida o que foi observado nos arquivos reais de `Documentacao/*.md` e serve como checklist prático para criar/atualizar documentação.

### Onde fica / como nomear
- **Pasta**: `Documentacao/`
- **1 arquivo por funcionalidade/página** (ou por “módulo” quando fizer sentido: ex. `Contrato.md`, `Fornecedor.md`, `Unidade.md`, `Requisitante.md`)
- **Nome padrão**: `Funcionalidade - [Módulo] - [Página].md`
  - Exemplos comuns:
    - `Funcionalidade - Veiculo - Index.md`, `Funcionalidade - Veiculo - Upsert.md`, `Funcionalidade - Veiculo - Dashboard.md`
    - `Funcionalidade - Abastecimento - Importacao.md`, `... - Pendencias.md`, `... - Dashboard.md`
    - `Funcionalidade - Administracao - [Ferramenta].md`

### Estrutura obrigatória (template “ouro”)
- **Cabeçalho**:
  - `# Documentação: <Nome>`
  - `> Última Atualização: DD/MM/AAAA`
  - `> Versão Atual: X.Y`
  - Separador `---`
- **PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE**
  - Índice com âncoras
  - Visão geral com ✅ “Características Principais”
  - Arquitetura: árvore de arquivos, tecnologias, e (quando aplicável) padrão (MVC/Razor Pages/API)
  - Seções específicas conforme o tipo da página:
    - **Listagens (Index)**: tabela/grid, filtros, DataTables, renderers, ações (editar/excluir/status), modais.
    - **Formulários (Upsert)**: seções do formulário, bindings, validações, uploads, regras por status (readonly), JS principal.
    - **Dashboards**: abas, filtros (ano/mês/período), KPIs, gráficos (Syncfusion/Chart.js), overlays de loading, performance.
    - **Jobs/Backoffice (batch)**: execução, progresso (polling/cache), riscos (timeout/IIS), troubleshooting.
    - **Agenda/Calendário**: FullCalendar, modal unificado, recorrência, conflitos.
  - **Endpoints API (quando houver)**:
    - Listar todos os endpoints usados pela tela
    - Descrever rota/método/parâmetros e incluir exemplos de request/response
    - **Incluir trechos reais do Controller**
  - **Frontend**
    - HTML principal (cards/tabelas/modais)
    - JavaScript (funções críticas, eventos, inicialização)
    - CSS (classes importantes, animações; lembrar: `@@keyframes` quando em `.cshtml`)
  - **Validações**
    - Lista completa de regras e, quando relevante, o código exato (C#/JS)
  - **Troubleshooting**
    - Problema → sintoma → causa → solução (com trechos de código/comandos quando útil)
- **PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES**
  - Entradas em ordem **decrescente**: `## [DD/MM/AAAA HH:mm] - Título`
  - Descrever: problema → causa → solução → arquivos afetados → commits (quando existirem) → status

### Regras e padrões recorrentes observados
- **Trecho de código real > descrição genérica**: quando documentar um comportamento importante, copiar o bloco do código.
- **Padrão de alertas**: o projeto padroniza comunicação por `Alerta.*` (SweetAlert custom) e toast (`AppToast.show(...)`).
- **Try-catch**: JS e C# com `try/catch` e `Alerta.TratamentoErroComLinha("Arquivo", "Metodo", erro)`.
- **Consistência visual**:
  - Ícones sempre `fa-duotone`
  - Botões e overlays seguem padrões FrotiX (ex.: logo pulsante no loading overlay)
- **Documentar “discrepâncias”**: quando JS e Controller divergirem (rota antiga/novo endpoint), registrar a nota explicitamente e apontar o código-fonte considerado.

### Observação importante (dívida técnica de documentação)
- Alguns arquivos estão em formato mais “antigo/sintético” (ex.: docs de `AtaRegistroPrecos` sem PARTE 1/2 completas). Idealmente, padronizar esses arquivos no modelo atual quando o módulo for tocado novamente.
