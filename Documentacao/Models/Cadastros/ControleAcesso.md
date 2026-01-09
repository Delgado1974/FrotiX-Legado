# Documentação: ControleAcesso.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Estrutura de Arquivos](#estrutura-de-arquivos)
4. [Estrutura do Model](#estrutura-do-model)
5. [Mapeamento Model ↔ Banco de Dados](#mapeamento-model--banco-de-dados)
6. [Interconexões](#interconexões)
7. [Lógica de Negócio](#lógica-de-negócio)
8. [Exemplos de Uso](#exemplos-de-uso)
9. [Troubleshooting](#troubleshooting)

---

## Visão Geral

O Model `ControleAcesso` representa a tabela de relacionamento N-N entre Usuários (`AspNetUsers`) e Recursos (`Recurso`), controlando quais usuários têm acesso a quais recursos do sistema. É a base do sistema de permissões customizado do FrotiX.

**Principais características:**

✅ **Chave Composta**: PK composta por `UsuarioId` + `RecursoId`  
✅ **Permissão Booleana**: Campo `Acesso` (true/false)  
✅ **Granularidade**: Controle por recurso individual  
✅ **Integração com Menu**: Filtra itens do menu baseado em permissões  
✅ **Gestão Visual**: Interface para conceder/revogar permissões

### Objetivo

O `ControleAcesso` resolve o problema de:
- Controlar acesso granular a recursos do sistema
- Filtrar menu baseado em permissões do usuário
- Gerenciar permissões de forma visual
- Integrar com sistema de navegação
- Permitir gestão de acesso sem usar apenas Roles do Identity

---

## Arquitetura

### Tecnologias Utilizadas

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Entity Framework Core | 5.0+ | ORM |
| ASP.NET Core Identity | 5.0+ | Integração com usuários |

### Padrões de Design

- **Many-to-Many**: Relacionamento N-N entre Usuários e Recursos
- **Composite Key**: Chave primária composta
- **Permission Pattern**: Padrão de controle de acesso

---

## Estrutura de Arquivos

### Arquivo Principal
```
Models/Cadastros/ControleAcesso.cs
```

### Arquivos Relacionados
- `Repository/ControleAcessoRepository.cs` - Acesso a dados
- `Controllers/NavigationController.cs` - Gestão de permissões
- `Controllers/UsuarioController.cs` - Permissões por usuário
- `Pages/Usuarios/Recursos.cshtml` - Interface de gestão
- `Pages/Administracao/GestaoRecursosNavegacao.cshtml` - Gestão de recursos
- `Models/Views/ViewControleAcesso.cs` - View consolidada
- `Models/NavigationModel.cs` - Usa para filtrar menu

---

## Estrutura do Model

```csharp
public class ControleAcesso
{
    [Key, Column(Order = 0)]
    public String UsuarioId { get; set; }

    [Key, Column(Order = 1)]
    public Guid RecursoId { get; set; }

    public bool Acesso { get; set; }
}
```

**Propriedades:**

- `UsuarioId` (string): ID do usuário (FK para AspNetUsers.Id)
- `RecursoId` (Guid): ID do recurso (FK para Recurso.RecursoId)
- `Acesso` (bool): Se usuário tem acesso (true) ou não (false)

**Chave Composta**: `UsuarioId` + `RecursoId` formam a chave primária.

---

## Mapeamento Model ↔ Banco de Dados

### Tabela: `ControleAcesso`

**Tipo**: Tabela de relacionamento N-N

**SQL de Criação**:
```sql
CREATE TABLE [dbo].[ControleAcesso] (
    [UsuarioId] nvarchar(450) NOT NULL,
    [RecursoId] uniqueidentifier NOT NULL,
    [Acesso] bit NOT NULL DEFAULT 0,
    CONSTRAINT [PK_ControleAcesso] PRIMARY KEY ([UsuarioId], [RecursoId]),
    CONSTRAINT [FK_ControleAcesso_AspNetUsers] FOREIGN KEY ([UsuarioId]) 
        REFERENCES [AspNetUsers]([Id]),
    CONSTRAINT [FK_ControleAcesso_Recurso] FOREIGN KEY ([RecursoId]) 
        REFERENCES [Recurso]([RecursoId])
);
```

**Mapeamento Model ↔ Banco**:

| Campo no Model | Campo no Banco | Tipo SQL | Tipo C# | Nullable | Descrição |
|----------------|----------------|----------|---------|----------|-----------|
| `UsuarioId` | `UsuarioId` | `nvarchar(450)` | `string` | ❌ | FK Usuário (PK composta) |
| `RecursoId` | `RecursoId` | `uniqueidentifier` | `Guid` | ❌ | FK Recurso (PK composta) |
| `Acesso` | `Acesso` | `bit` | `bool` | ❌ | Permissão (true/false) |

**Chaves e Índices**:
- **PK**: `UsuarioId` + `RecursoId` (COMPOSITE, CLUSTERED)
- **FK**: `UsuarioId` → `AspNetUsers(Id)`
- **FK**: `RecursoId` → `Recurso(RecursoId)`
- **IX**: `IX_ControleAcesso_UsuarioId` (UsuarioId) - Para consultas por usuário
- **IX**: `IX_ControleAcesso_RecursoId` (RecursoId) - Para consultas por recurso

**Tabelas Relacionadas**:
- `AspNetUsers` - Usuários do sistema
- `Recurso` - Recursos/menus do sistema

---

## Interconexões

### Quem Chama Este Arquivo

#### 1. **NavigationModel.FillProperties()** → Filtra Menu por Permissões

**Quando**: Menu é construído  
**Por quê**: Exibir apenas itens que usuário tem permissão

```csharp
var objControleAcesso = _currentUnitOfWork.ControleAcesso.GetFirstOrDefault(
    ca => ca.UsuarioId == userId && ca.RecursoId == recursoId
);

if (objControleAcesso != null && objControleAcesso.Acesso)
{
    // Item tem permissão, adiciona ao menu
    result.Add(item);
}
```

#### 2. **NavigationController.UpdateAcesso()** → Concede/Revoga Permissão

**Quando**: Administrador altera permissão  
**Por quê**: Atualizar acesso de usuário a recurso

```csharp
[HttpPost]
[Route("UpdateAcesso")]
public IActionResult UpdateAcesso([FromBody] UpdateAcessoRequest request)
{
    var controle = _unitOfWork.ControleAcesso.GetFirstOrDefault(ca =>
        ca.UsuarioId == request.UsuarioId && ca.RecursoId == recursoId);

    if (controle == null)
    {
        // Cria novo registro
        controle = new ControleAcesso
        {
            UsuarioId = request.UsuarioId,
            RecursoId = recursoId,
            Acesso = request.Acesso
        };
        _unitOfWork.ControleAcesso.Add(controle);
    }
    else
    {
        // Atualiza existente
        controle.Acesso = request.Acesso;
        _unitOfWork.ControleAcesso.Update(controle);
    }
    
    _unitOfWork.Save();
    return Ok(new { success = true });
}
```

#### 3. **UsuarioController.GetRecursos()** → Lista Permissões do Usuário

**Quando**: Página de recursos do usuário  
**Por quê**: Exibir todos os recursos e permissões

```csharp
var recursos = _unitOfWork.Recurso.GetAll()
    .Select(r => new {
        RecursoId = r.RecursoId,
        Nome = r.Nome,
        Acesso = _unitOfWork.ControleAcesso
            .GetFirstOrDefault(ca => ca.UsuarioId == usuarioId && ca.RecursoId == r.RecursoId)?.Acesso ?? false
    })
    .ToList();
```

### O Que Este Arquivo Usa

- **AspNetUsers**: Usuários do sistema
- **Recurso**: Recursos/menus do sistema

### Fluxo de Dados

```
Usuário acessa sistema
    ↓
NavigationModel.BuildNavigation()
    ↓
Para cada item do menu:
    ↓
ControleAcesso.GetFirstOrDefault(UsuarioId, RecursoId)
    ↓
Se Acesso == true:
    ↓
Item aparece no menu
    ↓
Se Acesso == false ou NULL:
    ↓
Item não aparece
```

---

## Lógica de Negócio

### Comportamento Padrão (NULL)

Se não existe registro em `ControleAcesso`, o comportamento padrão é:
- **Menu**: Item NÃO aparece (deny by default)
- **Acesso**: Negado até que seja explicitamente concedido

```csharp
var acesso = _unitOfWork.ControleAcesso
    .GetFirstOrDefault(ca => ca.UsuarioId == userId && ca.RecursoId == recursoId)?.Acesso ?? false;
```

### Concessão de Permissão

Quando administrador concede permissão:
1. Verifica se registro existe
2. Se não existe, cria com `Acesso = true`
3. Se existe, atualiza `Acesso = true`

### Revogação de Permissão

Quando administrador revoga permissão:
1. Verifica se registro existe
2. Atualiza `Acesso = false`
3. Ou deleta registro (opcional)

---

## Exemplos de Uso

### Cenário 1: Verificar Permissão

**Situação**: Verificar se usuário tem acesso a um recurso

**Código**:
```csharp
public bool UsuarioTemAcesso(string usuarioId, Guid recursoId)
{
    var controle = _unitOfWork.ControleAcesso.GetFirstOrDefault(ca =>
        ca.UsuarioId == usuarioId && ca.RecursoId == recursoId);
    
    return controle?.Acesso ?? false;
}
```

**Resultado**: Retorna true se tem acesso, false caso contrário

### Cenário 2: Conceder Permissão em Lote

**Situação**: Conceder acesso a múltiplos recursos para um usuário

**Código**:
```csharp
var recursosIds = new[] { recursoId1, recursoId2, recursoId3 };

foreach (var recursoId in recursosIds)
{
    var controle = _unitOfWork.ControleAcesso.GetFirstOrDefault(ca =>
        ca.UsuarioId == usuarioId && ca.RecursoId == recursoId);
    
    if (controle == null)
    {
        _unitOfWork.ControleAcesso.Add(new ControleAcesso
        {
            UsuarioId = usuarioId,
            RecursoId = recursoId,
            Acesso = true
        });
    }
    else
    {
        controle.Acesso = true;
        _unitOfWork.ControleAcesso.Update(controle);
    }
}

_unitOfWork.Save();
```

**Resultado**: Usuário tem acesso aos recursos especificados

---

## Troubleshooting

### Problema: Usuário não vê itens no menu

**Sintoma**: Menu está vazio mesmo com recursos cadastrados

**Causa**: Não existe registro em `ControleAcesso` com `Acesso = true`

**Solução**: 
1. Verificar se recurso existe
2. Criar registro em `ControleAcesso` com `Acesso = true`
3. Verificar se `NavigationModel` está consultando corretamente

---

## Notas Importantes

1. **Deny by Default**: Sem registro = sem acesso
2. **Chave Composta**: Não pode ter dois registros com mesmo UsuarioId + RecursoId
3. **Performance**: Índices em UsuarioId e RecursoId são essenciais
4. **Integração**: Usado pelo `NavigationModel` para filtrar menu

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação de documentação extensiva do modelo `ControleAcesso`

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
