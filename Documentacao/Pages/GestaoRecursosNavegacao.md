# Documentação: Administração - Gestão de Recursos e Navegação

> **Última Atualização**: 11/01/2026
> **Versão Atual**: 1.6

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Interface Unificada](#interface-unificada)
4. [Endpoints API](#endpoints-api)
5. [Frontend](#frontend)
6. [Troubleshooting](#troubleshooting)

---

## Visão Geral

A página **Gestão de Recursos e Navegação** é uma interface administrativa avançada para gerenciar a estrutura de menus, permissões e navegação do sistema FrotiX. Ela centraliza o cadastro de recursos (páginas, grupos) e o controle de acesso por usuário em uma única tela interativa.

### Características Principais

- ✅ **Editor Visual de Árvore (TreeView)**: Visualização hierárquica completa do menu com suporte a Drag & Drop para reordenação.
- ✅ **Seleção Inteligente de Ícones**: Integração com a biblioteca FontAwesome 7 Pro, agrupada por categorias e com busca.
- ✅ **Mapeamento Automático de Páginas**: Varre o sistema de arquivos para listar todas as páginas Razor (.cshtml) disponíveis e gerar URLs automaticamente.
- ✅ **Controle de Acesso Granular**: Permite definir quais usuários podem ver cada item do menu diretamente na tela de propriedades.
- ✅ **Migração de JSON**: Ferramenta para importar a estrutura antiga (`nav.json`) para o banco de dados.

---

## Arquitetura

### Estrutura de Arquivos

```
FrotiX.Site/
├── Pages/
│   └── Administracao/
│       ├── GestaoRecursosNavegacao.cshtml    # View (HTML + CSS + JS inline)
│       └── GestaoRecursosNavegacao.cshtml.cs # PageModel
│
├── Controllers/
│   └── NavigationController.cs               # API de Gestão de Navegação
```

### Tecnologias Utilizadas

| Tecnologia | Uso |
|------------|-----|
| **Syncfusion TreeView** | Exibição e manipulação da hierarquia do menu |
| **Syncfusion DropDownTree** | Seleção hierárquica de Ícones e Páginas |
| **ASP.NET Core API** | Backend para CRUD de recursos e permissões |
| **JSON Migration** | Lógica de importação de arquivos legados |

---

## Interface Unificada

A tela é dividida em duas colunas principais:

### 1. Coluna Esquerda: Estrutura do Menu
- Exibe a árvore completa de navegação.
- Permite arrastar e soltar itens para reordenar ou mudar hierarquia (Drag & Drop).
- Botões para "Novo Item" e "Salvar Ordenação".

### 2. Coluna Direita: Propriedades e Acesso
Card dinâmico que exibe detalhes do item selecionado na árvore.
- **Propriedades**: Nome, NomeMenu (ID único), URL, Ícone, Item Pai, Status Ativo.
- **Controle de Acesso**: Lista de usuários com checkboxes para conceder/revogar acesso.

---

## Endpoints API

O controller `NavigationController` gerencia toda a lógica.

### 1. GET `/api/Navigation/GetTreeAdmin`
Retorna a árvore completa de recursos para administração (sem filtro de acesso).

### 2. POST `/api/Navigation/SaveRecurso`
Cria ou atualiza um recurso individual.
- Criação: Gera novo GUID e associa permissão a todos usuários ativos por padrão.
- Atualização: Modifica propriedades (Nome, Ícone, URL).

**Implementação (`NavigationController.cs`)**:
```csharp
[HttpPost]
[Route("SaveRecurso")]
public IActionResult SaveRecurso([FromBody] RecursoTreeDTO dto)
{
    // ... validação e mapeamento ...
    if (isNew) {
        _unitOfWork.Recurso.Add(recurso);
        CriarControleAcessoParaTodosUsuarios(recurso.RecursoId);
    } else {
        _unitOfWork.Recurso.Update(recurso);
    }
    _unitOfWork.Save();
    return Json(new { success = true });
}
```

### 3. GET `/api/Navigation/GetIconesFontAwesomeHierarquico`
Retorna lista de ícones categorizados para o DropDownTree. Utiliza cache de 24h.

### 4. GET `/api/Navigation/GetPaginasHierarquico`
Retorna lista de páginas do sistema agrupadas por módulo (pasta).
- Varre fisicamente a pasta `Pages/` do servidor.
- Ignora pastas iniciadas com `_` e `Shared`.

**Implementação (`NavigationController.cs`)**:
```csharp
private List<object> LoadPaginasFromFileSystem()
{
    var pagesPath = Path.Combine(_env.ContentRootPath, "Pages");
    var moduleDirs = Directory.GetDirectories(pagesPath)
        // ... filtros ...

    foreach (var moduleDir in moduleDirs) {
        var pageFiles = moduleDir.GetFiles("*.cshtml");
        // ... cria estrutura hierárquica ...
    }
    return result;
}
```

### 5. POST `/api/Navigation/SaveTreeToDb`
Salva a nova ordem e hierarquia após uma operação de Drag & Drop.

### 6. POST `/api/Navigation/UpdateAcesso`
Atualiza a permissão de um usuário específico para um recurso.

---

## Frontend

A página utiliza scripts inline robustos para integrar os componentes Syncfusion.

### Configuração do DropDownTree de Ícones
Utiliza templates customizados para exibir o ícone visualmente na lista e no valor selecionado.

```javascript
// Template para item da lista
ddlIconeObj.itemTemplate = function(data) {
    if (data.isCategory) return '<div>' + data.text + '</div>';
    return '<div style="..."><i class="' + data.id + '"></i><span>' + data.text + '</span></div>';
};

// Evento Select
ddlIconeObj.select = function(args) {
    if (args.nodeData && !args.nodeData.isCategory) {
        var iconClass = args.nodeData.id; // "fa-duotone fa-user"
        document.getElementById('txtIconClass').value = iconClass;
    }
};
```

### Lógica de Drag & Drop (TreeView)
Ao soltar um item, a interface não salva imediatamente no banco. O usuário deve clicar em "Salvar Ordenação" para persistir a nova estrutura.

```javascript
nodeDragStop: function(args) {
    // Atualiza hierarquia visualmente e notifica usuário
    setTimeout(function() {
        treeData = treeObj.fields.dataSource;
        mostrarAlerta('Arraste concluído. Clique em "Salvar Ordenação" para persistir.', 'info');
    }, 200);
}
```

---

## Troubleshooting

### Problema: Ícones não aparecem no DropDown
**Sintoma**: Lista de ícones vazia ou carregando infinitamente.
**Causa**: Arquivo `fontawesome-icons.json` faltando na raiz ou cache corrompido.
**Solução**: Verificar existência do arquivo JSON e reiniciar a aplicação para limpar o MemoryCache.

### Problema: Página não encontrada na lista
**Sintoma**: Uma página recém-criada não aparece no DropDownTree de páginas.
**Causa**: O cache de páginas (`PaginasHierarquicas`) tem duração de 24h.
**Solução**: Reiniciar a aplicação ou aguardar expiração do cache. A página deve estar na pasta `Pages/` e ter extensão `.cshtml`.

### Problema: Erro ao excluir item
**Sintoma**: Mensagem "Não é possível excluir recurso que possui subitens!".
**Causa**: Restrição de integridade.
**Solução**: Excluir ou mover os filhos primeiro antes de excluir o pai.

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [11/01/2026 00:30] - Modal customizado FrotiX para transformação Página→Grupo com 4 opções

**Descrição**:
Criado modal customizado no padrão visual FrotiX para transformação de Página em Grupo, com 4 opções de ação e modal secundário para seleção de grupo destino.

**Funcionalidades implementadas**:
1. **Modal principal** (`mostrarModalTransformacaoPaginaEmGrupo`):
   - Card de aviso em laranja médio com borda branca e fonte branca
   - Lista de itens abaixo da página (máximo 5 + contador)
   - 4 botões nas cores padrão FrotiX:
     - **Subordinar ao Novo Grupo** (Verde Militar #4a5d23)
     - **Subordinar a Outro Grupo** (Marrom #68432C)
     - **Manter Onde Estão** (Azul Petróleo #154c62)
     - **Cancelar Operação** (Vinho #722F37)

2. **Modal secundário** (`mostrarModalSelecionarGrupoDestino`):
   - Aparece por cima do modal principal quando escolhe "Subordinar a Outro Grupo"
   - Dropdown com lista de grupos disponíveis
   - Botões: Confirmar (Verde) e Voltar (Azul Petróleo)
   - Ao cancelar, volta para o modal principal
   - Ao confirmar, fecha ambos e executa a transformação

**Fluxo**:
- Usuário clica no badge Página→Grupo em item com itens abaixo
- Modal principal abre com 4 opções
- Se escolher "Subordinar a Outro Grupo", modal secundário abre por cima
- Usuário pode confirmar ou voltar para escolher outra opção

**Arquivos Afetados**:
- `Pages/Administracao/GestaoRecursosNavegacao.cshtml`
  - Nova função `mostrarModalTransformacaoPaginaEmGrupo()` (linhas ~1985-2175)
  - Nova função `mostrarModalSelecionarGrupoDestino()` (linhas ~2178-2300)
  - Modificada `alternarTipoItem()` para chamar novo modal

**Status**: ✅ **Concluído**

**Responsável**: Claude (AI Assistant)

**Versão**: 1.5

---

## [11/01/2026 00:05] - Substituição inicial de Swal.fire (substituída pela versão 1.5)

**Descrição**:
Versão intermediária que foi substituída pela implementação completa com modal customizado.

**Status**: ⏭️ **Substituída pela versão 1.5**

**Versão**: 1.4

---

## [11/01/2026 18:30] - Aviso de transformação Página→Grupo ao usar seta direita (→)

**Descrição**:
Adicionado aviso de confirmação quando o usuário usa a seta para direita (→) para subordinar uma página a outra página, o que automaticamente transforma a página de cima em Grupo.

**Problema/Necessidade**:
Quando duas páginas estavam uma em cima da outra e o usuário clicava na seta para direita para transformar a de baixo em filho, a página de cima era automaticamente convertida em Grupo (perdendo seu link HTML). Isso acontecia sem aviso prévio, podendo confundir o usuário.

**Solução**:
- Função `moverItemDireita()` agora verifica se o item acima (que será o novo pai) é uma Página
- Se for Página, exibe um modal de confirmação usando `Alerta.Confirmar()` informando:
  - Que a página será transformada em GRUPO
  - Aviso em card laranja de que o link HTML será removido permanentemente
  - Que a página não acessará mais nenhuma funcionalidade diretamente
- Se o usuário confirmar: executa a movimentação normalmente
- Se o usuário cancelar: exibe mensagem informando que nenhuma alteração foi feita
- Criada nova função auxiliar `executarMovimentacaoDireita()` para encapsular a lógica de movimentação
- **Ícones padrão FrotiX**: Botões do modal usam ícones `fa-duotone` com cores padrão (#ff6b35 primary, #6c757d secondary)

**Código do Modal de Aviso**:
```javascript
Alerta.Confirmar(
    'Transformação em Grupo',
    '<div style="text-align: left; padding: 10px;">' +
        '<p>Ao subordinar "Item" como filho de "ItemAcima", ' +
        'a página "ItemAcima" será transformada em GRUPO.</p>' +
        '<div style="background: linear-gradient(135deg, #ff6b35, #e55a2b); ' +
            'color: white; padding: 12px 15px; border-radius: 8px; ' +
            'border: 2px solid rgba(255,255,255,0.5);">' +
            'ATENÇÃO: O link HTML será removido permanentemente!' +
        '</div>' +
        '<p>Deseja prosseguir com esta operação?</p>' +
    '</div>',
    '<i class="fa-duotone fa-check" style="--fa-primary-color:#ff6b35; --fa-secondary-color:#6c757d;"></i> Sim, Transformar em Grupo',
    '<i class="fa-duotone fa-xmark" style="--fa-primary-color:#ff6b35; --fa-secondary-color:#6c757d;"></i> Cancelar'
)
```

**Arquivos Afetados**:
- `Pages/Administracao/GestaoRecursosNavegacao.cshtml`
  - Função `moverItemDireita()` (linhas ~4104-4174) - Adicionada verificação e modal de confirmação
  - Nova função `executarMovimentacaoDireita()` (linhas ~4176-4213) - Lógica de movimentação separada

**Status**: ✅ **Concluído**

**Responsável**: Claude (AI Assistant)

**Versão**: 1.6

---

## [10/01/2026 23:45] - Correção da inversão de ordem do menu lateral após transformação via badge

**Descrição**:
Corrigido problema onde a ordem dos itens do menu lateral era invertida após transformar um item via badge (Grupo ↔ Página).

**Problema**:
A função `salvarPropriedades()` chamava `atualizarNavegacaoLateral()` que fazia `window.location.reload()` ANTES de `salvarArvoreCompleta()` ser executada. Isso causava a inversão da ordem porque a estrutura era recarregada antes de ser salva corretamente.

**Solução**:
- Criada nova função `salvarOrdenacaoAutomaticaSemReload()` que retorna Promise e não faz reload automático
- Modificadas as funções `executarTransformacaoGrupoEmPagina()` e `executarTransformacaoPaginaEmGrupo()` para:
  - Usar `salvarOrdenacaoAutomaticaSemReload()` em vez de `salvarPropriedades().then(() => salvarArvoreCompleta())`
  - Fazer o `window.location.reload()` apenas APÓS o salvamento ser confirmado (com delay de 1.5s)
- Isso garante que a estrutura seja salva completamente antes do reload

**Arquivos Afetados**:
- `Pages/Administracao/GestaoRecursosNavegacao.cshtml`
  - Nova função `salvarOrdenacaoAutomaticaSemReload()` (linhas ~4283-4346)
  - Função `executarTransformacaoGrupoEmPagina()` (linhas ~1996-2014)
  - Função `executarTransformacaoPaginaEmGrupo()` (linhas ~2190-2218)

**Status**: ✅ **Concluído**

**Responsável**: Claude (AI Assistant)

**Versão**: 1.3

---

## [10/01/2026 23:33] - Correção de erro Razor nos comentários JavaScript

**Descrição**:
Corrigido erro de compilação CS0103 causado pelo Razor interpretando `@param` nos comentários JavaScript como código C#.

**Problema**:
Os comentários JSDoc da função `atualizarTreeViewAposMovimento()` usavam `@param` para documentar parâmetros, mas o Razor interpretava o `@` como início de código C#.

**Solução**:
Substituído `@param` por `Param:` nos comentários da função para evitar conflito com sintaxe Razor.

**Arquivos Afetados**:
- `Pages/Administracao/GestaoRecursosNavegacao.cshtml` (linhas 3968-3969)

**Status**: ✅ **Concluído**

**Responsável**: Claude (AI Assistant)

**Versão**: 1.2

---

## [10/01/2026 09:30] - Correção da barra de alterações pendentes após troca de tipo via badge

**Descrição**:
Corrigido problema onde a barra de "alterações pendentes" (confirmar/cancelar) aparecia incorretamente após clicar no badge para alternar entre Grupo e Página, mesmo que a alteração já fosse salva diretamente no banco de dados.

**Problema**:
A função `atualizarTreeViewAposMovimento()` era chamada tanto para movimentos de posição (setas) quanto para transformações de tipo (badge). Em ambos os casos, ela chamava `marcarAlteracoesPendentes()`, mas transformações de tipo já salvam imediatamente no banco e não deveriam exibir a barra de pendências.

**Solução**:
- Adicionado parâmetro opcional `marcarPendentes` na função `atualizarTreeViewAposMovimento(itemIdParaManter, marcarPendentes)` com default `true`
- Nas funções `executarTransformacaoGrupoEmPagina()` e `executarTransformacaoPaginaEmGrupo()`:
  - Passamos `(null, false)` para não marcar pendentes (pois salvam direto no banco)
  - Limpamos a seleção do TreeView e formulário após salvar com sucesso
- Movimentos de posição (setas para cima/baixo/esquerda/direita) continuam marcando pendentes normalmente

**Arquivos Afetados**:
- `Pages/Administracao/GestaoRecursosNavegacao.cshtml`
  - Função `atualizarTreeViewAposMovimento()` (linhas ~3964-4019)
  - Função `executarTransformacaoGrupoEmPagina()` (linhas ~1958-2035)
  - Função `executarTransformacaoPaginaEmGrupo()` (linhas ~2141-2255)

**Status**: ✅ **Concluído**

**Responsável**: Claude (AI Assistant)

**Versão**: 1.1

---

## [06/01/2026] - Criação da Documentação

**Descrição**:
Documentação inicial da página de Gestão de Recursos e Navegação.

**Status**: ✅ **Documentado**

**Responsável**: Claude (AI Assistant)
**Versão**: 1.0
