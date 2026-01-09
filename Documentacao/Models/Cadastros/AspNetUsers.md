# Documentação: AspNetUsers.cs

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

O Model `AspNetUsers` estende `IdentityUser` do ASP.NET Core Identity, representando usuários do sistema FrotiX. Herda todas as funcionalidades de autenticação e autorização do Identity, além de campos customizados específicos do sistema.

**Principais características:**

✅ **Herança de IdentityUser**: Usa sistema de autenticação do ASP.NET Core  
✅ **Campos Customizados**: Adiciona campos específicos do FrotiX  
✅ **Nullable Booleans**: Alguns campos bool do Identity foram alterados para bool?  
✅ **Gestão de Usuários**: Integrado com sistema de controle de acesso  
✅ **Status Ativo/Inativo**: Campo para desativar usuários sem deletar

### Objetivo

O `AspNetUsers` resolve o problema de:
- Gerenciar usuários do sistema
- Autenticação e autorização
- Controle de acesso a recursos
- Manutenção de informações do usuário
- Integração com sistema de permissões

---

## Arquitetura

### Tecnologias Utilizadas

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| ASP.NET Core Identity | 5.0+ | Autenticação e autorização |
| Entity Framework Core | 5.0+ | ORM |
| SQL Server | - | Banco de dados |

### Padrões de Design

- **Inheritance**: Herda de `IdentityUser`
- **Override Properties**: Sobrescreve propriedades do Identity para tornar nullable

---

## Estrutura de Arquivos

### Arquivo Principal
```
Models/Cadastros/AspNetUsers.cs
```

### Arquivos Relacionados
- `Controllers/UsuarioController.cs` - CRUD de usuários
- `Pages/Usuarios/Index.cshtml` - Listagem de usuários
- `Pages/Usuarios/Upsert.cshtml` - Formulário de criação/edição
- `Pages/Usuarios/Recursos.cshtml` - Gestão de permissões
- `Repository/AspNetUsersRepository.cs` - Acesso a dados

---

## Estrutura do Model

```csharp
public class AspNetUsers : IdentityUser
{
    [Key]
    public new string Id { get; set; }

    public new string? UserName { get; set; }
    public new string? NormalizedUserName { get; set; }
    public new string? Email { get; set; }
    public new string? NormalizedEmail { get; set; }

    // MUDANÇAS: bool → bool?
    public new bool? EmailConfirmed { get; set; }

    public new string? PasswordHash { get; set; }
    public new string? SecurityStamp { get; set; }
    public new string? ConcurrencyStamp { get; set; }
    public new string? PhoneNumber { get; set; }

    // MUDANÇAS: bool → bool?
    public new bool? PhoneNumberConfirmed { get; set; }
    public new bool? TwoFactorEnabled { get; set; }
    public new bool? LockoutEnabled { get; set; }
    public new DateTimeOffset? LockoutEnd { get; set; }
    public new int? AccessFailedCount { get; set; }

    // Campos customizados do FrotiX
    public string? NomeCompleto { get; set; }
    public bool? Status { get; set; }
    // ... outros campos customizados
}
```

**Propriedades Principais (herdadas):**

- `Id` (string): Identificador único do usuário
- `UserName` (string?): Nome de usuário para login
- `Email` (string?): Email do usuário
- `EmailConfirmed` (bool?): Se email foi confirmado
- `PasswordHash` (string?): Hash da senha
- `PhoneNumber` (string?): Telefone do usuário
- `LockoutEnabled` (bool?): Se bloqueio de conta está habilitado
- `LockoutEnd` (DateTimeOffset?): Data de término do bloqueio

**Propriedades Customizadas:**

- `NomeCompleto` (string?): Nome completo do usuário
- `Status` (bool?): Se usuário está ativo (true) ou inativo (false)

### Classe: `UsuarioViewModel`

```csharp
public class UsuarioViewModel
{
    public string Id { get; set; }
    public AspNetUsers AspNetUsers { get; set; }
}
```

**Uso**: ViewModel para formulários de usuário.

---

## Mapeamento Model ↔ Banco de Dados

### Tabela: `AspNetUsers`

**Tipo**: Tabela (padrão do ASP.NET Core Identity)

**SQL de Criação** (gerado pelo Identity):
```sql
CREATE TABLE [dbo].[AspNetUsers] (
    [Id] nvarchar(450) NOT NULL PRIMARY KEY,
    [UserName] nvarchar(256) NULL,
    [NormalizedUserName] nvarchar(256) NULL,
    [Email] nvarchar(256) NULL,
    [NormalizedEmail] nvarchar(256) NULL,
    [EmailConfirmed] bit NULL,
    [PasswordHash] nvarchar(max) NULL,
    [SecurityStamp] nvarchar(max) NULL,
    [ConcurrencyStamp] nvarchar(max) NULL,
    [PhoneNumber] nvarchar(max) NULL,
    [PhoneNumberConfirmed] bit NULL,
    [TwoFactorEnabled] bit NULL,
    [LockoutEnd] datetimeoffset NULL,
    [LockoutEnabled] bit NULL,
    [AccessFailedCount] int NULL,
    [NomeCompleto] nvarchar(200) NULL,
    [Status] bit NULL
);
```

**Mapeamento Model ↔ Banco**:

| Campo no Model | Campo no Banco | Tipo SQL | Tipo C# | Nullable | Descrição |
|----------------|----------------|----------|---------|----------|-----------|
| `Id` | `Id` | `nvarchar(450)` | `string` | ❌ | Chave primária |
| `UserName` | `UserName` | `nvarchar(256)` | `string?` | ✅ | Nome de usuário |
| `Email` | `Email` | `nvarchar(256)` | `string?` | ✅ | Email |
| `EmailConfirmed` | `EmailConfirmed` | `bit` | `bool?` | ✅ | Email confirmado |
| `PasswordHash` | `PasswordHash` | `nvarchar(max)` | `string?` | ✅ | Hash da senha |
| `Status` | `Status` | `bit` | `bool?` | ✅ | Ativo/Inativo |

**Chaves e Índices**:
- **PK**: `Id` (CLUSTERED)
- **IX**: `IX_AspNetUsers_Email` (Email)
- **IX**: `IX_AspNetUsers_NormalizedUserName` (NormalizedUserName)

**Tabelas Relacionadas**:
- `AspNetUserRoles` - Roles do usuário
- `AspNetUserClaims` - Claims do usuário
- `AspNetUserLogins` - Logins externos
- `ControleAcesso` - Permissões customizadas do FrotiX

---

## Interconexões

### Quem Chama Este Arquivo

#### 1. **UsuarioController.Get()** → Lista Usuários

**Quando**: Página de listagem de usuários  
**Por quê**: Retornar todos os usuários ativos

```csharp
[HttpGet]
public IActionResult Get()
{
    var usuarios = _unitOfWork.AspNetUsers
        .GetAll(u => u.Status == true)
        .OrderBy(u => u.NomeCompleto ?? u.UserName)
        .ToList();
    
    return Ok(new { data = usuarios });
}
```

#### 2. **NavigationController.GetUsuariosAcesso()** → Lista Usuários para Permissões

**Quando**: Página de gestão de recursos precisa listar usuários  
**Por quê**: Exibir usuários para conceder/revogar permissões

```csharp
var usuarios = _unitOfWork.AspNetUsers
    .GetAll(u => u.Status == true)
    .OrderBy(u => u.NomeCompleto)
    .Select(u => new {
        UsuarioId = u.Id,
        Nome = u.NomeCompleto ?? u.UserName,
        Acesso = _unitOfWork.ControleAcesso
            .GetFirstOrDefault(ca => ca.UsuarioId == u.Id && ca.RecursoId == recId)?.Acesso ?? false
    })
    .ToList();
```

### O Que Este Arquivo Usa

- **IdentityUser**: Classe base do ASP.NET Core Identity
- **ControleAcesso**: Sistema de permissões customizado

---

## Lógica de Negócio

### Status Ativo/Inativo

Usuários inativos não podem fazer login:

```csharp
// No login
var user = await _userManager.FindByNameAsync(username);
if (user == null || user.Status != true)
{
    return Unauthorized("Usuário inativo ou não encontrado");
}
```

### Nome Completo vs UserName

Sistema prioriza `NomeCompleto` para exibição:

```csharp
var nomeExibicao = usuario.NomeCompleto ?? usuario.UserName ?? "Sem nome";
```

---

## Exemplos de Uso

### Cenário 1: Criar Novo Usuário

**Situação**: Administrador cria novo usuário

**Código**:
```csharp
var user = new AspNetUsers
{
    Id = Guid.NewGuid().ToString(),
    UserName = "joao.silva",
    Email = "joao.silva@camara.leg.br",
    NomeCompleto = "João da Silva",
    Status = true,
    EmailConfirmed = true
};

var result = await _userManager.CreateAsync(user, "Senha123!");
```

**Resultado**: Usuário criado e pode fazer login

---

## Troubleshooting

### Problema: Usuário não consegue fazer login

**Sintoma**: Login falha mesmo com credenciais corretas

**Causa Possível**: `Status = false` ou `LockoutEnabled = true`

**Solução**: Verificar campos `Status` e `LockoutEnd`

---

## Notas Importantes

1. **Herança**: Herda de `IdentityUser`, não criar tabela manualmente
2. **Nullable**: Alguns campos bool foram alterados para bool? (diferente do padrão Identity)
3. **Status**: Campo customizado para ativar/desativar usuários
4. **Permissões**: Usa `ControleAcesso` além de Roles do Identity

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação de documentação extensiva do modelo `AspNetUsers`

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
