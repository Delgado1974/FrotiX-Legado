# Documentação: NavigationController.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Estrutura de Arquivos](#estrutura-de-arquivos)
4. [Endpoints API](#endpoints-api)
5. [Lógica de Negócio](#lógica-de-negócio)
6. [Interconexões](#interconexões)
7. [Exemplos de Uso](#exemplos-de-uso)
8. [Troubleshooting](#troubleshooting)

---

## Visão Geral

O `NavigationController` é um dos controllers mais críticos do sistema FrotiX. Gerencia toda a estrutura de navegação do sistema, incluindo menus hierárquicos, recursos, controle de acesso por usuário, sincronização entre arquivo JSON (`nav.json`) e banco de dados (tabela `Recurso`), e integração com ícones FontAwesome.

**Principais características:**

✅ **Gerenciamento de Navegação**: Cria, atualiza e remove itens de menu  
✅ **Controle de Acesso**: Gerencia permissões por usuário para cada recurso  
✅ **Sincronização JSON ↔ BD**: Mantém sincronização entre `nav.json` e tabela `Recurso`  
✅ **Hierarquia de Menus**: Suporta menus multi-nível com parent-child  
✅ **FontAwesome Integration**: Lista ícones FontAwesome hierarquicamente  
✅ **Cache**: Usa cache em memória para melhor performance  
✅ **Migração de Dados**: Migra dados do JSON para banco de dados

**⚠️ CRÍTICO**: Qualquer alteração neste controller afeta toda a navegação do sistema.

---

## Arquitetura

### Tecnologias Utilizadas

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| ASP.NET Core | 3.1+ | Framework base |
| Entity Framework Core | - | Acesso a dados (Recurso, ControleAcesso) |
| Syncfusion EJ2 | - | TreeView para gestão de navegação |
| JSON | - | Serialização de dados |
| Memory Cache | - | Cache de ícones e páginas |
| FontAwesome 7 Pro | - | Ícones do sistema |

### Padrões de Design

- **API Controller Pattern**: Usa `[ApiController]` e `[Route("api/[controller]")]`
- **Partial Class**: Controller pode ser dividido em múltiplos arquivos
- **Repository Pattern**: Usa `IUnitOfWork` para acesso a dados
- **DTO Pattern**: Usa DTOs para transferência de dados (`RecursoTreeDTO`, `NavigationItemDTO`)
- **Cache Pattern**: Usa `IMemoryCache` para otimização

---

## Estrutura de Arquivos

### Arquivo Principal
```
Controllers/NavigationController.cs
```

### Arquivos Relacionados
- **Pages**: `Pages/Administracao/GestaoRecursosNavegacao.cshtml` - Interface de gestão
- **ViewComponents**: `ViewComponents/NavigationViewComponent.cs` - Renderização do menu
- **Models**: 
  - `Models/RecursoTreeDTO.cs` - DTO para árvore de recursos
  - `Models/NavigationItemDTO.cs` - DTO para itens de navegação
- **JSON**: `nav.json` - Arquivo de configuração de navegação (legado)
- **JSON**: `fontawesome-icons.json` - Ícones FontAwesome traduzidos

---

## Endpoints API

### GET `/api/Navigation/GetTree`

**Descrição**: Retorna estrutura completa do `nav.json` para TreeView (legado)

**Parâmetros**: Nenhum

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "item_0",
      "text": "Menu Principal",
      "title": "Menu Principal",
      "nomeMenu": "menu_principal",
      "href": "/Pages/Home",
      "icon": "fa-duotone fa-home",
      "items": [...]
    }
  ]
}
```

**Quando é chamado**: Raramente usado (legado). Preferir `GetTreeFromDb` ou `GetTreeAdmin`.

---

### POST `/api/Navigation/SaveTree`

**Descrição**: Salva estrutura completa do TreeView e sincroniza com BD (legado)

**Request Body**: `List<NavigationTreeItem>`

**Response**:
```json
{
  "success": true,
  "message": "Navegação salva com sucesso!"
}
```

**Quando é chamado**: Raramente usado (legado). Preferir `SaveTreeToDb`.

---

### GET `/api/Navigation/GetTreeFromDb`

**Descrição**: **ENDPOINT PRINCIPAL** - Retorna árvore de navegação do banco filtrada por usuário logado

**Parâmetros**: Nenhum (usa Claims do usuário)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "guid-recurso-id",
      "text": "Menu Principal",
      "nomeMenu": "menu_principal",
      "icon": "fa-duotone fa-home",
      "href": "/Pages/Home",
      "parentId": null,
      "ordem": 1,
      "nivel": 0,
      "ativo": true,
      "hasChild": true,
      "items": [...]
    }
  ]
}
```

**Lógica**:
1. Busca todos recursos ativos ordenados por `Ordem`
2. Filtra por `ControleAcesso` do usuário logado (`Acesso == true`)
3. Monta árvore hierárquica recursivamente
4. Retorna apenas recursos que o usuário tem permissão

**Quando é chamado**: 
- Ao carregar menu lateral do sistema
- Pelo `NavigationViewComponent` para renderizar navegação

---

### GET `/api/Navigation/GetTreeAdmin`

**Descrição**: Retorna árvore completa para administração (sem filtro de acesso)

**Parâmetros**: Nenhum

**Response**: Mesmo formato de `GetTreeFromDb`, mas sem filtro de usuário

**Quando é chamado**: 
- Pela página `GestaoRecursosNavegacao.cshtml` para edição
- Para visualizar toda estrutura sem restrições de acesso

---

### GET `/api/Navigation/DebugTreeAdmin`

**Descrição**: Endpoint de diagnóstico para problemas na carga da árvore

**Parâmetros**: Nenhum

**Response**:
```json
{
  "success": true,
  "totalRecursosNoBanco": 45,
  "totalRecursosRaiz": 5,
  "totalItensNaArvore": 45,
  "primeiros5Recursos": [...],
  "recursosRaizNomes": ["Menu 1", "Menu 2", ...],
  "arvoreGerada": [...]
}
```

**Quando é chamado**: Para debug e diagnóstico de problemas

---

### POST `/api/Navigation/SaveTreeToDb`

**Descrição**: **ENDPOINT CRÍTICO** - Salva alterações na árvore (reordenação, hierarquia) no banco de dados

**Request Body**: `List<RecursoTreeDTO>` (JSON)

**Response**:
```json
{
  "success": true,
  "message": "Navegação salva com sucesso! (45 registros atualizados)"
}
```

**Lógica Complexa (Estratégia de Duas Fases)**:

1. **FASE 0**: Coleta todas atualizações necessárias recursivamente
   - Calcula `OrdemFinal` baseada na posição na árvore
   - Calcula `Nivel` baseado na profundidade
   - Calcula `ParentId` baseado na hierarquia
   - Previne duplicatas usando `HashSet<Guid>`

2. **FASE 1**: Aplica ordens temporárias negativas
   - Atribui valores únicos negativos (`-1, -2, -3...`)
   - **Objetivo**: Evitar violação de UNIQUE INDEX em `Ordem` durante atualização
   - Salva mudanças

3. **FASE 2**: Aplica valores finais corretos
   - Atribui `OrdemFinal` calculada
   - Atualiza `ParentId`, `Nivel`, `Icon`, `Href`
   - Salva mudanças finais

**⚠️ IMPORTANTE**: Usa estratégia de duas fases para evitar erros de constraint UNIQUE INDEX.

**Quando é chamado**: 
- Quando usuário arrasta itens na TreeView de gestão
- Quando usuário reorganiza hierarquia de menus
- Auto-save após alterações na página de gestão

---

### POST `/api/Navigation/SaveRecurso`

**Descrição**: Adiciona ou atualiza um recurso no banco (para tela unificada)

**Request Body**: `RecursoTreeDTO`

**Response**:
```json
{
  "success": true,
  "recursoId": "guid-recurso-id",
  "message": "Recurso criado com sucesso!"
}
```

**Lógica**:
- Se `Id` existe e é válido, atualiza recurso existente
- Se `Id` é novo ou vazio, cria novo recurso
- Para novos recursos, cria `ControleAcesso` para todos usuários ativos
- Usa `GetNextOrdem()` para garantir unicidade em novos itens

**Quando é chamado**: 
- Ao criar novo item de menu na interface de gestão
- Ao editar propriedades de um recurso existente

---

### POST `/api/Navigation/DeleteRecurso`

**Descrição**: Remove um recurso e seus controles de acesso

**Request Body**: `{ "RecursoId": "guid" }`

**Response**:
```json
{
  "success": true,
  "message": "Recurso removido com sucesso!"
}
```

**Validações**:
- Verifica se recurso tem filhos (não permite exclusão se tiver)
- Remove todos `ControleAcesso` relacionados
- Remove o recurso

**Quando é chamado**: Ao excluir item de menu na interface de gestão

---

### GET `/api/Navigation/GetUsuariosAcesso`

**Descrição**: Retorna lista de usuários com status de acesso para um recurso

**Parâmetros**: `recursoId` (string GUID)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "usuarioId": "guid-usuario-id",
      "nome": "João da Silva",
      "acesso": true
    }
  ]
}
```

**Quando é chamado**: Para exibir e gerenciar permissões de usuários em um recurso

---

### POST `/api/Navigation/UpdateAcesso`

**Descrição**: Atualiza o acesso de um usuário a um recurso

**Request Body**: 
```json
{
  "recursoId": "guid-recurso-id",
  "usuarioId": "guid-usuario-id",
  "acesso": true
}
```

**Response**:
```json
{
  "success": true,
  "message": "Acesso atualizado!"
}
```

**Lógica**:
- Se `ControleAcesso` existe, atualiza
- Se não existe, cria novo registro

**Quando é chamado**: Ao alterar checkbox de permissão na interface de gestão

---

### POST `/api/Navigation/MigrateFromJson`

**Descrição**: Migra dados do `nav.json` para a tabela `Recurso` no banco de dados

**Parâmetros**: Nenhum

**Response**:
```json
{
  "success": true,
  "message": "Migração concluída! 45 recursos criados, 12 atualizados.",
  "criados": 45,
  "atualizados": 12
}
```

**Lógica**:
- Lê arquivo `nav.json`
- Processa itens recursivamente
- Calcula ordem hierárquica: `Pai=1, Filhos=101-199, Netos=10101-10199`
- Cria ou atualiza recursos no banco
- Cria `ControleAcesso` para todos usuários em novos recursos

**Quando é chamado**: 
- Migração inicial de dados
- Sincronização manual de JSON para BD

---

### GET `/api/Navigation/GetIconesFontAwesomeHierarquico`

**Descrição**: Lista ícones FontAwesome 7 Pro Duotone em estrutura hierárquica por categorias

**Parâmetros**: Nenhum

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "cat_arrows",
      "text": "Setas",
      "isCategory": true,
      "hasChild": true,
      "expanded": false,
      "child": [
        {
          "id": "fa-duotone fa-arrow-up",
          "text": "Seta para Cima",
          "name": "arrow-up",
          "parentId": "cat_arrows"
        }
      ]
    }
  ]
}
```

**Cache**: Resultado é cacheado por 24 horas

**Quando é chamado**: Para popular dropdown de seleção de ícones na interface de gestão

---

### GET `/api/Navigation/GetPaginasHierarquico`

**Descrição**: Retorna lista de páginas do sistema organizadas por módulo

**Parâmetros**: Nenhum

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "module_Veiculo",
      "text": "Veículos",
      "isCategory": true,
      "hasChild": true,
      "child": [
        {
          "id": "page_Veiculo_Index",
          "text": "Index",
          "displayText": "(Veículos) Index",
          "paginaRef": "veiculo_index.html",
          "parentId": "module_Veiculo"
        }
      ]
    }
  ]
}
```

**Cache**: Resultado é cacheado por 24 horas

**Quando é chamado**: Para popular dropdown de seleção de páginas na interface de gestão

---

## Lógica de Negócio

### Método: `MontarArvoreRecursiva()`

Monta árvore hierárquica recursivamente a partir de lista de recursos:

```csharp
private List<RecursoTreeDTO> MontarArvoreRecursiva(List<Recurso> recursos, Guid? parentId)
{
    return recursos
        .Where(r => 
            (parentId == null && r.ParentId == null) || 
            (parentId != null && r.ParentId == parentId)
        )
        .OrderBy(r => r.Ordem)
        .Select(r =>
        {
            var dto = RecursoTreeDTO.FromRecurso(r);
            dto.Items = MontarArvoreRecursiva(recursos, r.RecursoId);
            dto.HasChild = dto.Items != null && dto.Items.Any();
            return dto;
        })
        .ToList();
}
```

**Lógica**:
- Filtra recursos por `ParentId`
- Ordena por `Ordem`
- Processa filhos recursivamente
- Marca `HasChild` baseado em existência de filhos

---

### Método: `ColetarAtualizacoes()`

Coleta todas atualizações necessárias recursivamente (previne duplicatas):

```csharp
private void ColetarAtualizacoes(
    List<RecursoTreeDTO> items, 
    Guid? parentId, 
    int nivel, 
    double ordemBase, 
    List<RecursoUpdate> updates, 
    HashSet<Guid> processedIds)
{
    for (int i = 0; i < items.Count; i++)
    {
        var item = items[i];
        double ordemAtual = ordemBase + i + 1;
        
        if (Guid.TryParse(item.Id, out var recursoId))
        {
            // ✅ Verifica se já foi processado (previne duplicatas)
            if (processedIds.Contains(recursoId))
            {
                continue; // Ignora duplicatas
            }
            
            processedIds.Add(recursoId);
            
            updates.Add(new RecursoUpdate
            {
                RecursoId = recursoId,
                ParentId = parentId,
                Nivel = nivel,
                OrdemFinal = ordemAtual,
                Icon = item.Icon,
                Href = item.Href
            });
            
            // Processa filhos recursivamente
            if (item.Items?.Any() == true)
            {
                double ordemBaseFilhos = ordemAtual * 100;
                ColetarAtualizacoes(item.Items, recursoId, nivel + 1, ordemBaseFilhos, updates, processedIds);
            }
        }
    }
}
```

**Lógica**:
- Calcula ordem hierárquica: `Pai=1, Filhos=101-199, Netos=10101-10199`
- Previne processamento duplicado usando `HashSet<Guid>`
- Coleta todas atualizações antes de aplicar

---

### Método: `CriarControleAcessoParaTodosUsuarios()`

Cria registros de `ControleAcesso` para todos usuários ativos ao criar novo recurso:

```csharp
private void CriarControleAcessoParaTodosUsuarios(Guid recursoId)
{
    var usuarios = _unitOfWork.AspNetUsers.GetAll(u => u.Status == true);
    
    foreach (var usuario in usuarios)
    {
        var controleExistente = _unitOfWork.ControleAcesso.GetFirstOrDefault(ca =>
            ca.UsuarioId == usuario.Id && ca.RecursoId == recursoId);
        
        if (controleExistente == null)
        {
            var novoControle = new ControleAcesso
            {
                UsuarioId = usuario.Id,
                RecursoId = recursoId,
                Acesso = true  // Por padrão, concede acesso
            };
            _unitOfWork.ControleAcesso.Add(novoControle);
        }
    }
}
```

**⚠️ IMPORTANTE**: 
- Deve ser chamado **DEPOIS** de salvar o recurso no banco
- Garante que `RecursoId` existe antes de criar `ControleAcesso`

---

### Método: `GetNextOrdem()`

Obtém próxima ordem disponível para recursos:

```csharp
private double GetNextOrdem()
{
    var recursos = _unitOfWork.Recurso.GetAll().ToList();
    if (!recursos.Any()) return 1;
    return recursos.Max(r => r.Ordem) + 1;
}
```

**Uso**: Garante unicidade ao criar novos recursos

---

## Interconexões

### Quem Chama Este Controller

#### Página de Gestão (`Pages/Administracao/GestaoRecursosNavegacao.cshtml`)

**Principais chamadas**:
- `GetTreeAdmin()` - Carrega árvore completa
- `SaveTreeToDb()` - Salva alterações (auto-save e manual)
- `SaveRecurso()` - Cria/atualiza recurso individual
- `DeleteRecurso()` - Remove recurso
- `GetUsuariosAcesso()` - Lista permissões
- `UpdateAcesso()` - Atualiza permissão
- `GetIconesFontAwesomeHierarquico()` - Lista ícones
- `GetPaginasHierarquico()` - Lista páginas

#### ViewComponent (`ViewComponents/NavigationViewComponent.cs`)

**Chamadas**:
- Usa lógica similar a `GetTreeFromDb()` para renderizar menu lateral

### O Que Este Controller Chama

- **`_unitOfWork.Recurso`**: CRUD de recursos
- **`_unitOfWork.ControleAcesso`**: Gerenciamento de permissões
- **`_unitOfWork.AspNetUsers`**: Lista de usuários
- **`_cache`**: Cache de ícones e páginas
- **`System.IO.File`**: Leitura/escrita de `nav.json` e `fontawesome-icons.json`

---

## Exemplos de Uso

### Exemplo 1: Carregar Árvore de Navegação

**JavaScript**:
```javascript
fetch('/api/Navigation/GetTreeAdmin')
    .then(r => r.json())
    .then(result => {
        if (result.success && result.data) {
            // Renderiza TreeView Syncfusion
            treeView.dataSource = result.data;
        }
    });
```

---

### Exemplo 2: Salvar Alterações na Árvore

**JavaScript**:
```javascript
// Extrai itens da TreeView
var items = extrairItensDoTreeView(treeView.dataSource, null, 0);

// Envia para backend
fetch('/api/Navigation/SaveTreeToDb', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(items)
})
.then(r => r.json())
.then(result => {
    if (result.success) {
        alert('Navegação salva com sucesso!');
    }
});
```

---

### Exemplo 3: Criar Novo Recurso

**JavaScript**:
```javascript
var novoRecurso = {
    text: "Novo Menu",
    nomeMenu: "novo_menu",
    icon: "fa-duotone fa-folder",
    href: "/Pages/Novo",
    nivel: 0,
    ativo: true,
    hasChild: false
};

fetch('/api/Navigation/SaveRecurso', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(novoRecurso)
})
.then(r => r.json())
.then(result => {
    if (result.success) {
        console.log('Recurso criado:', result.recursoId);
        // Recarrega árvore
        carregarArvore();
    }
});
```

---

## Troubleshooting

### Problema: Árvore não carrega (GetTreeAdmin retorna vazio)

**Causa**: Nenhum recurso no banco ou todos inativos

**Solução**:
1. Verificar se existem recursos em `Recurso` com `Ativo = true`
2. Verificar se `Ordem` está configurada corretamente
3. Usar `DebugTreeAdmin` para diagnóstico

---

### Problema: Erro "UNIQUE INDEX violation" ao salvar árvore

**Causa**: Estratégia de duas fases não foi aplicada corretamente

**Solução**:
1. Verificar se `SaveTreeToDb` está usando estratégia de duas fases
2. Verificar se `ColetarAtualizacoes` previne duplicatas
3. Verificar logs do console para ver quantas atualizações foram coletadas

---

### Problema: Usuário não vê menus mesmo tendo permissão

**Causa**: `ControleAcesso` não foi criado ou `Acesso = false`

**Solução**:
1. Verificar se `ControleAcesso` existe para usuário e recurso
2. Verificar se `Acesso = true`
3. Verificar se recurso está `Ativo = true`
4. Verificar se `GetTreeFromDb` está filtrando corretamente

---

### Problema: Migração do JSON falha

**Causa**: Arquivo `nav.json` não existe ou formato inválido

**Solução**:
1. Verificar se `nav.json` existe na raiz do projeto
2. Verificar formato JSON válido
3. Verificar se `NavigationBuilder.FromJson()` consegue parsear

---

## Notas Importantes

1. **Estratégia de Duas Fases**: `SaveTreeToDb` usa duas fases para evitar violação de UNIQUE INDEX
2. **Cache**: Ícones e páginas são cacheados por 24 horas
3. **Migração**: `MigrateFromJson` deve ser executada apenas uma vez (migração inicial)
4. **Controle de Acesso**: Novos recursos recebem acesso para todos usuários por padrão
5. **Ordem Hierárquica**: Usa sistema decimal: `Pai=1, Filhos=101-199, Netos=10101-10199`

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do NavigationController

**Arquivos Afetados**:
- `Controllers/NavigationController.cs`

**Impacto**: Documentação de referência para gerenciamento de navegação e recursos

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
