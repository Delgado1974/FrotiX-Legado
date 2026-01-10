# Documentação: IRepository.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

A interface `IRepository<T>` define o contrato genérico de repositório para entidades Entity Framework Core, mantendo apenas operações genéricas sem acoplamento a tipos do domínio.

**Principais características:**

✅ **Genérico**: Funciona com qualquer entidade (`where T : class`)  
✅ **CRUD Completo**: Define operações Create, Read, Update, Delete  
✅ **Suporte a Includes**: Carregamento eager de relacionamentos  
✅ **Tracking Control**: Controle de `AsTracking`/`AsNoTracking`  
✅ **Projeções**: Suporte a DTOs via `GetAllReduced`  
✅ **Async Support**: Métodos assíncronos disponíveis

---

## Estrutura da Interface

### Constraints

```csharp
public interface IRepository<T>
    where T : class
```

**Constraint**: `T` deve ser uma classe (entidade do EF Core)

---

## Métodos de Leitura

### `T Get(object id)`

**Descrição**: Obtém uma entidade pela chave primária (chave simples)

**Parâmetros**: `id` - Chave primária

**Retorno**: `T` ou `null` se não encontrado

---

### `T GetFirstOrDefault(Expression<Func<T, bool>> filter = null, string includeProperties = null)`

**Descrição**: Obtém a primeira entidade que satisfaz o filtro

**Parâmetros**:
- `filter`: Expressão lambda de filtro (opcional)
- `includeProperties`: Propriedades para incluir via `.Include()` (CSV, opcional)

**Retorno**: `T` ou `null`

---

### `Task<T> GetFirstOrDefaultAsync(Expression<Func<T, bool>> filter = null, string includeProperties = null)`

**Descrição**: Versão assíncrona de `GetFirstOrDefault`

**Retorno**: `Task<T>`

---

### `IEnumerable<T> GetAll(...)`

**Descrição**: Retorna um conjunto materializado de entidades

**Parâmetros**:
- `filter`: Expressão lambda de filtro (opcional)
- `orderBy`: Função de ordenação (opcional)
- `includeProperties`: Propriedades para incluir (CSV, opcional)
- `asNoTracking`: Se `true`, não rastreia mudanças (padrão: `true`)

**Retorno**: `IEnumerable<T>` materializado

---

### `Task<IEnumerable<T>> GetAllAsync(...)`

**Descrição**: Versão assíncrona de `GetAll`

**Parâmetros Adicionais**:
- `take`: Limite de registros (opcional)

**Retorno**: `Task<IEnumerable<T>>`

---

## Métodos de Projeção (DTOs)

### `IEnumerable<TResult> GetAllReduced<TResult>(...)`

**Descrição**: Versão materializada para projeção em DTOs

**Parâmetros**:
- `selector`: Expressão lambda de projeção (obrigatório)
- `filter`: Filtro (opcional)
- `orderBy`: Ordenação (opcional)
- `includeProperties`: Includes (opcional)
- `asNoTracking`: Tracking (padrão: `true`)

**Retorno**: `IEnumerable<TResult>` materializado (`.ToList()`)

**Uso**: Compatível com código legado que espera lista materializada

---

### `IQueryable<TResult> GetAllReducedIQueryable<TResult>(...)`

**Descrição**: Retorna `IQueryable` projetado sem materializar

**Parâmetros**: Mesmos de `GetAllReduced`

**Retorno**: `IQueryable<TResult>` (não materializado)

**Vantagens**:
- Permite composição adicional de queries
- EF Core traduz para SQL parametrizado
- Lazy evaluation

---

## Métodos de Escrita

### `void Add(T entity)`

**Descrição**: Adiciona a entidade ao contexto

**Parâmetros**: `entity` - Entidade a adicionar

---

### `Task AddAsync(T entity)`

**Descrição**: Versão assíncrona de `Add`

**Retorno**: `Task`

---

### `void Update(T entity)`

**Descrição**: Atualiza a entidade no contexto

**Parâmetros**: `entity` - Entidade a atualizar

---

### `void Remove(object id)`

**Descrição**: Remove a entidade pela chave (chave simples)

**Parâmetros**: `id` - Chave primária

---

### `void Remove(T entity)`

**Descrição**: Remove a entidade informada

**Parâmetros**: `entity` - Entidade a remover

---

## Interconexões

### Quem Implementa Esta Interface

- **Repository<T>**: Implementação genérica base
- **Repositories Específicos**: Podem herdar de `Repository<T>` e implementar métodos adicionais

### O Que Esta Interface Define

- **Contrato Padrão**: Operações CRUD genéricas
- **Separação de Responsabilidades**: Separa acesso a dados de lógica de negócio
- **Testabilidade**: Facilita criação de mocks para testes

---

## Padrão de Implementação

### Implementação Genérica

```csharp
public class Repository<T> : IRepository<T> where T : class
{
    // Implementação de todos os métodos
}
```

### Uso em Repositories Específicos

```csharp
public interface IVeiculoRepository : IRepository<Veiculo>
{
    // Métodos específicos adicionais
    Veiculo GetByPlaca(string placa);
}

public class VeiculoRepository : Repository<Veiculo>, IVeiculoRepository
{
    public VeiculoRepository(DbContext db) : base(db) { }
    
    public Veiculo GetByPlaca(string placa)
    {
        return GetFirstOrDefault(v => v.Placa == placa);
    }
}
```

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do IRepository

**Arquivos Afetados**:
- `Repository/IRepository/IRepository.cs`

**Impacto**: Documentação de referência para contrato de repositório

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
