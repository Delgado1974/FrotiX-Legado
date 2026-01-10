# Documentação: Repository.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

A classe `Repository<T>` é a implementação genérica base do padrão Repository para Entity Framework Core no sistema FrotiX. Fornece operações CRUD genéricas sem lógica específica de domínio.

**Principais características:**

✅ **Genérico**: Funciona com qualquer entidade (`where T : class`)  
✅ **CRUD Completo**: Create, Read, Update, Delete  
✅ **Suporte a Includes**: Eager loading via string CSV  
✅ **AsNoTracking/AsTracking**: Controle de tracking do EF Core  
✅ **Projeções**: Suporte a DTOs e projeções otimizadas  
✅ **Assíncrono**: Métodos assíncronos para operações I/O  
✅ **Tratamento de Concorrência**: Tratamento de erros de concorrência

---

## Estrutura da Classe

### Herança e Implementação

```csharp
public class Repository<T> : IRepository<T>
    where T : class
```

**Herança**: Implementa `IRepository<T>`  
**Constraint**: `T` deve ser uma classe (entidade EF Core)

---

## Campos Protegidos

### `protected readonly DbContext _db`

**Descrição**: Contexto de banco de dados injetado

**Uso**: Acesso direto ao contexto quando necessário

---

### `protected readonly DbSet<T> dbSet`

**Descrição**: DbSet da entidade genérica

**Uso**: Operações CRUD na entidade

**Inicialização**: `dbSet = _db.Set<T>()` no construtor

---

## Construtor

```csharp
public Repository(DbContext db)
{
    _db = db ?? throw new ArgumentNullException(nameof(db));
    dbSet = _db.Set<T>();
}
```

**Validação**: Lança `ArgumentNullException` se `db` for null

---

## Método Auxiliar Protegido

### `PrepareQuery(...)`

**Descrição**: **MÉTODO CRÍTICO** - Monta query base aplicando filtros, includes e tracking

**Assinatura**:
```csharp
protected IQueryable<T> PrepareQuery(
    Expression<Func<T, bool>> filter = null,
    string includeProperties = null,
    bool asNoTracking = false
)
```

**Funcionalidades**:
1. **Tracking Control**: 
   - Se `asNoTracking == true`: Aplica `AsNoTracking()` (read-only, performance)
   - Se `asNoTracking == false`: Aplica `AsTracking()` (permite persistência)

2. **Filtros**: Aplica `Where(filter)` se fornecido

3. **Eager Loading**: Processa `includeProperties` (CSV):
   ```csharp
   // Exemplo: "MarcaVeiculo,ModeloVeiculo"
   foreach (var inc in includeProperties.Split(','))
   {
       query = query.Include(inc.Trim());
   }
   ```

**Nota Importante**: O DbContext está configurado globalmente como `NoTracking`, então é necessário forçar `AsTracking()` quando `asNoTracking == false` para permitir persistência.

---

## Métodos de Leitura

### `Get(object id)`

**Descrição**: Obtém entidade pela chave primária (chave simples)

**Parâmetros**: `id` - Valor da chave primária

**Retorno**: `T` ou `null` se não encontrado

**Uso**:
```csharp
var veiculo = repository.Get(veiculoId);
```

**Nota**: Não funciona com chaves compostas (usa `Find()` do EF Core)

---

### `GetFirstOrDefault(...)`

**Descrição**: Obtém primeira entidade que satisfaz o filtro

**Assinatura**:
```csharp
T GetFirstOrDefault(
    Expression<Func<T, bool>> filter = null,
    string includeProperties = null
)
```

**Características**:
- Usa `asNoTracking: true` (read-only)
- Tratamento de concorrência: Retorna `null` se erro de "second operation"
- Re-lança outras exceções

**Uso**:
```csharp
var veiculo = repository.GetFirstOrDefault(
    v => v.Placa == "ABC1234",
    "MarcaVeiculo,ModeloVeiculo"
);
```

---

### `GetFirstOrDefaultAsync(...)`

**Descrição**: Versão assíncrona de `GetFirstOrDefault`

**Retorno**: `Task<T>`

**Uso**: Para operações I/O não bloqueantes

---

### `GetAll(...)`

**Descrição**: Retorna conjunto materializado de entidades

**Assinatura**:
```csharp
IEnumerable<T> GetAll(
    Expression<Func<T, bool>> filter = null,
    Func<IQueryable<T>, IOrderedQueryable<T>> orderBy = null,
    string includeProperties = null,
    bool asNoTracking = true
)
```

**Características**:
- Materializa resultado (`ToList()`)
- Suporte a ordenação
- `asNoTracking: true` por padrão (performance)

**Uso**:
```csharp
var veiculos = repository.GetAll(
    filter: v => v.Status == true,
    orderBy: q => q.OrderBy(v => v.Placa),
    includeProperties: "MarcaVeiculo"
);
```

---

### `GetAllAsync(...)`

**Descrição**: Versão assíncrona de `GetAll` com suporte a `Take`

**Assinatura**:
```csharp
Task<IEnumerable<T>> GetAllAsync(
    Expression<Func<T, bool>> filter = null,
    Func<IQueryable<T>, IOrderedQueryable<T>> orderBy = null,
    string includeProperties = null,
    bool asNoTracking = true,
    int? take = null  // ← Adicional
)
```

**Uso**: Para paginação ou limitar resultados

---

## Métodos de Projeção (DTOs)

### `GetAllReduced<TResult>(...)`

**Descrição**: **MÉTODO OTIMIZADO** - Projeta entidades para DTOs e materializa

**Assinatura**:
```csharp
IEnumerable<TResult> GetAllReduced<TResult>(
    Expression<Func<T, TResult>> selector,
    Expression<Func<T, bool>> filter = null,
    Func<IQueryable<T>, IOrderedQueryable<T>> orderBy = null,
    string includeProperties = null,
    bool asNoTracking = true
)
```

**Vantagens**:
- Reduz dados transferidos (apenas campos necessários)
- Melhora performance (menos dados do banco)
- Materializa resultado (`ToList()`)

**Uso**:
```csharp
var veiculosLeves = repository.GetAllReduced(
    selector: v => new { v.VeiculoId, v.Placa, v.Status },
    filter: v => v.Status == true,
    orderBy: q => q.OrderBy(v => v.Placa)
);
```

---

### `GetAllReducedIQueryable<TResult>(...)`

**Descrição**: Retorna `IQueryable` projetado sem materializar

**Assinatura**:
```csharp
IQueryable<TResult> GetAllReducedIQueryable<TResult>(
    Expression<Func<T, TResult>> selector,
    Expression<Func<T, bool>> filter = null,
    Func<IQueryable<T>, IOrderedQueryable<T>> orderBy = null,
    string includeProperties = null,
    bool asNoTracking = true
)
```

**Vantagens**:
- Permite composição adicional de queries
- EF Core traduz para SQL parametrizado
- Não materializa até execução

**Uso**:
```csharp
var query = repository.GetAllReducedIQueryable(
    selector: v => new { v.VeiculoId, v.Placa }
);

// Composição adicional
var resultado = query
    .Where(v => v.Placa.Contains("ABC"))
    .Take(10)
    .ToList();
```

---

## Métodos de Escrita

### `Add(T entity)`

**Descrição**: Adiciona entidade ao contexto

**Validação**: Lança `ArgumentNullException` se `entity` for null

**Uso**:
```csharp
var novoVeiculo = new Veiculo { Placa = "ABC1234" };
repository.Add(novoVeiculo);
unitOfWork.Save(); // Persiste no banco
```

---

### `AddAsync(T entity)`

**Descrição**: Versão assíncrona de `Add`

**Retorno**: `Task`

---

### `Update(T entity)`

**Descrição**: Atualiza entidade no contexto

**Nota**: Usa `new` para ocultar método da classe base

**Validação**: Lança `ArgumentNullException` se `entity` for null

**Uso**:
```csharp
veiculo.Placa = "XYZ5678";
repository.Update(veiculo);
unitOfWork.Save();
```

---

### `Remove(object id)`

**Descrição**: Remove entidade pela chave primária

**Comportamento**: 
- Retorna silenciosamente se `id` for null
- Busca entidade com `Find()` antes de remover

**Uso**:
```csharp
repository.Remove(veiculoId);
unitOfWork.Save();
```

---

### `Remove(T entity)`

**Descrição**: Remove entidade informada

**Comportamento**: Retorna silenciosamente se `entity` for null

**Uso**:
```csharp
repository.Remove(veiculo);
unitOfWork.Save();
```

---

## Interconexões

### Quem Usa Esta Classe

- **Todos os Repositories Específicos**: Herdam de `Repository<T>`
- **UnitOfWork**: Instancia repositories específicos

### O Que Esta Classe Usa

- **Microsoft.EntityFrameworkCore**: `DbContext`, `DbSet<T>`
- **System.Linq**: `IQueryable<T>`, `Expression<Func<>>`
- **FrotiX.Repository.IRepository**: `IRepository<T>`

---

## Padrão de Uso

### Exemplo Completo

```csharp
// 1. Injeção via UnitOfWork
var unitOfWork = serviceProvider.GetRequiredService<IUnitOfWork>();

// 2. Leitura com includes
var veiculo = unitOfWork.Veiculo.GetFirstOrDefault(
    v => v.VeiculoId == id,
    "MarcaVeiculo,ModeloVeiculo"
);

// 3. Listagem com filtros
var veiculosAtivos = unitOfWork.Veiculo.GetAll(
    filter: v => v.Status == true,
    orderBy: q => q.OrderBy(v => v.Placa)
);

// 4. Projeção otimizada
var veiculosLeves = unitOfWork.Veiculo.GetAllReduced(
    selector: v => new { v.VeiculoId, v.Placa },
    filter: v => v.Status == true
);

// 5. Escrita
var novoVeiculo = new Veiculo { Placa = "ABC1234" };
unitOfWork.Veiculo.Add(novoVeiculo);
unitOfWork.Save();
```

---

## Observações Importantes

### Tracking vs NoTracking

⚠️ **Padrão**: `asNoTracking: true` por padrão em leituras

**Motivo**: Performance - não rastreia mudanças em entidades read-only

**Quando usar `asNoTracking: false`**:
- Quando precisa atualizar a entidade depois
- Quando precisa acessar propriedades de navegação lazy-loaded

---

### Includes (Eager Loading)

⚠️ **Formato**: String CSV separada por vírgula

**Exemplo**: `"MarcaVeiculo,ModeloVeiculo,Unidade"`

**Performance**: Use apenas quando necessário - includes aumentam complexidade da query

---

### Tratamento de Concorrência

⚠️ **Erro "second operation"**: Retorna `null` silenciosamente

**Motivo**: Evita quebra de fluxo em casos de concorrência

**Recomendação**: Verificar `null` após chamadas a `GetFirstOrDefault`

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do Repository

**Arquivos Afetados**:
- `Repository/Repository.cs`

**Impacto**: Documentação de referência para padrão Repository genérico

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
