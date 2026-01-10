# Documentação: Repository.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

A classe `Repository<T>` é a implementação genérica base de repositório para Entity Framework Core, fornecendo operações CRUD padrão sem lógica específica de domínio.

**Principais características:**

✅ **Genérico**: Funciona com qualquer entidade (`where T : class`)  
✅ **CRUD Completo**: Create, Read, Update, Delete  
✅ **Suporte a Includes**: Carregamento eager de relacionamentos  
✅ **Tracking Control**: Controle explícito de `AsTracking`/`AsNoTracking`  
✅ **Projeções**: Suporte a `GetAllReduced` para DTOs  
✅ **Async Support**: Métodos assíncronos disponíveis  
✅ **Tratamento de Concorrência**: Trata erros de "second operation"

---

## Estrutura da Classe

### Herança e Constraints

```csharp
public class Repository<T> : IRepository<T>
    where T : class
```

**Interface**: Implementa `IRepository<T>`  
**Constraint**: `T` deve ser uma classe (entidade do EF Core)

---

## Campos Protegidos

### `protected readonly DbContext _db`

**Descrição**: Contexto de banco de dados injetado

**Uso**: Acesso ao contexto para operações avançadas

---

### `protected readonly DbSet<T> dbSet`

**Descrição**: DbSet da entidade genérica

**Uso**: Operações CRUD na entidade

**Inicialização**: `_db.Set<T>()` no construtor

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

**Lógica**:
1. **Tracking**: Se `asNoTracking == true`, usa `AsNoTracking()`, senão `AsTracking()`
   - **Nota Importante**: DbContext está configurado globalmente como NoTracking
   - Para permitir persistência, força `AsTracking()` quando necessário
2. **Filtro**: Aplica `Where(filter)` se fornecido
3. **Includes**: Processa `includeProperties` (CSV) e aplica `.Include()` para cada propriedade

**Exemplo de Includes**:
```csharp
// includeProperties = "MarcaVeiculo,ModeloVeiculo"
// Resulta em:
query.Include("MarcaVeiculo").Include("ModeloVeiculo")
```

**Retorno**: `IQueryable<T>` pronto para uso

---

## Métodos de Leitura

### `Get(object id)`

**Descrição**: Obtém entidade pela chave primária

**Parâmetros**: `id` - Chave primária (simples)

**Retorno**: `T` ou `null` se não encontrado

**Uso**:
```csharp
var veiculo = repository.Get(veiculoId);
```

---

### `GetFirstOrDefault(...)`

**Descrição**: Obtém primeira entidade que satisfaz o filtro

**Parâmetros**:
- `filter`: Expressão lambda de filtro (opcional)
- `includeProperties`: Propriedades para incluir via `.Include()` (CSV, opcional)

**Retorno**: `T` ou `null`

**Tracking**: Sempre usa `AsNoTracking` (read-only)

**Tratamento de Erros**:
- Captura `InvalidOperationException` com mensagem "second operation"
- Retorna `null` em caso de erro de concorrência
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

**Parâmetros**: Mesmos de `GetFirstOrDefault`

**Retorno**: `Task<T>`

**Uso**:
```csharp
var veiculo = await repository.GetFirstOrDefaultAsync(
    v => v.Placa == "ABC1234"
);
```

---

### `GetAll(...)`

**Descrição**: Retorna conjunto materializado de entidades

**Parâmetros**:
- `filter`: Expressão lambda de filtro (opcional)
- `orderBy`: Função de ordenação (opcional)
- `includeProperties`: Propriedades para incluir (CSV, opcional)
- `asNoTracking`: Se `true`, não rastreia mudanças (padrão: `true`)

**Retorno**: `IEnumerable<T>` materializado (`.ToList()`)

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

**Descrição**: Versão assíncrona de `GetAll`

**Parâmetros Adicionais**:
- `take`: Limite de registros (opcional)

**Retorno**: `Task<IEnumerable<T>>`

**Uso**:
```csharp
var veiculos = await repository.GetAllAsync(
    filter: v => v.Status == true,
    orderBy: q => q.OrderBy(v => v.Placa),
    take: 100
);
```

---

## Métodos de Projeção (DTOs)

### `GetAllReduced<TResult>(...)`

**Descrição**: **MÉTODO OTIMIZADO** - Projeta entidades para DTOs e materializa

**Parâmetros**:
- `selector`: Expressão lambda de projeção (obrigatório)
- `filter`: Filtro (opcional)
- `orderBy`: Ordenação (opcional)
- `includeProperties`: Includes (opcional)
- `asNoTracking`: Tracking (padrão: `true`)

**Retorno**: `IEnumerable<TResult>` materializado

**Vantagens**:
- Reduz dados transferidos (apenas campos necessários)
- Melhora performance em consultas grandes
- Compatível com código legado

**Uso**:
```csharp
var veiculosDTO = repository.GetAllReduced(
    selector: v => new { v.VeiculoId, v.Placa, v.MarcaVeiculo.DescricaoMarca },
    filter: v => v.Status == true,
    orderBy: q => q.OrderBy(v => v.Placa)
);
```

---

### `GetAllReducedIQueryable<TResult>(...)`

**Descrição**: Retorna `IQueryable` projetado sem materializar

**Parâmetros**: Mesmos de `GetAllReduced`

**Retorno**: `IQueryable<TResult>` (não materializado)

**Vantagens**:
- Permite composição adicional de queries
- EF Core traduz para SQL parametrizado
- Lazy evaluation

**Uso**:
```csharp
var query = repository.GetAllReducedIQueryable(
    selector: v => new { v.VeiculoId, v.Placa }
);

// Pode adicionar mais filtros depois
var resultado = query
    .Where(v => v.Placa.StartsWith("ABC"))
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
var veiculo = new Veiculo { Placa = "ABC1234" };
repository.Add(veiculo);
unitOfWork.Save(); // Persiste no banco
```

---

### `AddAsync(T entity)`

**Descrição**: Versão assíncrona de `Add`

**Retorno**: `Task`

**Uso**:
```csharp
await repository.AddAsync(veiculo);
await unitOfWork.SaveAsync();
```

---

### `Update(T entity)`

**Descrição**: Marca entidade como modificada no contexto

**Validação**: Lança `ArgumentNullException` se `entity` for null

**Nota**: Usa `new` para ocultar método da classe base

**Uso**:
```csharp
veiculo.Placa = "XYZ5678";
repository.Update(veiculo);
unitOfWork.Save();
```

---

### `Remove(object id)`

**Descrição**: Remove entidade pela chave primária

**Parâmetros**: `id` - Chave primária

**Lógica**: Busca entidade com `Find()` e remove se encontrada

**Uso**:
```csharp
repository.Remove(veiculoId);
unitOfWork.Save();
```

---

### `Remove(T entity)`

**Descrição**: Remove entidade informada

**Parâmetros**: `entity` - Entidade a remover

**Uso**:
```csharp
repository.Remove(veiculo);
unitOfWork.Save();
```

---

## Interconexões

### Quem Usa Esta Classe

- **Todos os Repositories Específicos**: Herdam ou usam como base
- **UnitOfWork**: Instancia repositories genéricos quando necessário
- **Controllers**: Via `IUnitOfWork` que expõe repositories

### O Que Esta Classe Usa

- **Microsoft.EntityFrameworkCore**: `DbContext`, `DbSet`, `IQueryable`
- **System.Linq.Expressions**: `Expression<Func<T, bool>>`
- **FrotiX.Repository.IRepository**: `IRepository<T>`

---

## Padrão de Uso

### Exemplo Completo

```csharp
// Injeção via UnitOfWork
public class MeuController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    
    public MeuController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }
    
    public IActionResult ListarVeiculos()
    {
        var veiculos = _unitOfWork.Veiculo.GetAll(
            filter: v => v.Status == true,
            orderBy: q => q.OrderBy(v => v.Placa),
            includeProperties: "MarcaVeiculo,ModeloVeiculo"
        );
        
        return Ok(veiculos);
    }
    
    public IActionResult CriarVeiculo([FromBody] Veiculo veiculo)
    {
        _unitOfWork.Veiculo.Add(veiculo);
        _unitOfWork.Save();
        
        return Ok();
    }
}
```

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
