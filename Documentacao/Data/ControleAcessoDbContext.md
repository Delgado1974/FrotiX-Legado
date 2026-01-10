# Documentação: ControleAcessoDbContext.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `ControleAcessoDbContext` é um contexto de banco de dados especializado para gerenciamento de controle de acesso e recursos do sistema, incluindo hierarquia de recursos e permissões de usuários.

**Principais características:**

✅ **Chaves Compostas**: Suporte a tabelas com múltiplas chaves primárias  
✅ **Hierarquia de Recursos**: Auto-relacionamento para estrutura de menu/recursos  
✅ **Timeout Estendido**: Timeout de 9000 segundos (150 minutos) para operações longas  
✅ **Delete Restrict**: Previne exclusão em cascata de recursos

---

## Estrutura da Classe

### Herança

```csharp
public class ControleAcessoDbContext : DbContext
```

**Herança**: `DbContext` padrão do Entity Framework Core

---

## Configurações Especiais

### Timeout Estendido

```csharp
Database.SetCommandTimeout(9000); // 150 minutos
```

**Motivo**: Operações de controle de acesso podem ser complexas e demoradas, especialmente em sistemas com muitos recursos e usuários.

---

## DbSets Expostos

### `DbSet<Recurso> Recurso`

**Descrição**: Tabela de recursos do sistema (itens de menu, funcionalidades)

**Características**:
- Suporta hierarquia (parent-child)
- Usado para construção de menus dinâmicos
- Relacionado com `ControleAcesso` para permissões

---

### `DbSet<ControleAcesso> ControleAcesso`

**Descrição**: Tabela de permissões de usuários sobre recursos

**Chave Composta**: `(UsuarioId, RecursoId)`

**Uso**: Define quais recursos cada usuário pode acessar

---

## Configurações de Modelo (`OnModelCreating`)

### Chave Composta em ControleAcesso

```csharp
modelBuilder.Entity<ControleAcesso>()
    .HasKey(ca => new { ca.UsuarioId, ca.RecursoId });
```

**Motivo**: Um usuário pode ter múltiplas permissões, e um recurso pode ser acessado por múltiplos usuários. A chave composta garante unicidade da combinação.

---

### Hierarquia de Recursos (Auto-relacionamento)

```csharp
modelBuilder.Entity<Recurso>()
    .HasOne(r => r.Parent)
    .WithMany(r => r.Children)
    .HasForeignKey(r => r.ParentId)
    .OnDelete(DeleteBehavior.Restrict);
```

**Estrutura**:
- `Recurso.Parent`: Recurso pai (opcional, null para raiz)
- `Recurso.Children`: Lista de recursos filhos
- `Recurso.ParentId`: Foreign key para o recurso pai

**DeleteBehavior.Restrict**: **CRÍTICO** - Impede exclusão de um recurso que tenha filhos, evitando quebra da hierarquia.

**Exemplo de Hierarquia**:
```
- Dashboard (raiz)
  - Dashboard Viagens (filho)
  - Dashboard Veículos (filho)
- Cadastros (raiz)
  - Veículos (filho)
    - Listar Veículos (neto)
    - Cadastrar Veículo (neto)
```

---

## Interconexões

### Quem Usa Este Contexto

- **NavigationController**: Para construção de menus e verificação de permissões
- **RecursoController**: CRUD de recursos
- **Sistema de Autorização**: Verificação de acesso a funcionalidades

### O Que Este Contexto Usa

- **FrotiX.Models.Recurso**: Modelo de recurso
- **FrotiX.Models.ControleAcesso**: Modelo de controle de acesso

---

## Casos de Uso

### 1. Construção de Menu Dinâmico

```csharp
var recursosRaiz = context.Recurso
    .Where(r => r.ParentId == null)
    .Include(r => r.Children)
    .ToList();
```

### 2. Verificação de Permissão

```csharp
var temAcesso = context.ControleAcesso
    .Any(ca => ca.UsuarioId == userId && ca.RecursoId == recursoId);
```

### 3. Listagem de Recursos com Hierarquia

```csharp
var recursosComFilhos = context.Recurso
    .Include(r => r.Children)
    .Where(r => r.Status == true)
    .ToList();
```

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do ControleAcessoDbContext

**Arquivos Afetados**:
- `Data/ControleAcessoDbContext.cs`

**Impacto**: Documentação de referência para controle de acesso

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
