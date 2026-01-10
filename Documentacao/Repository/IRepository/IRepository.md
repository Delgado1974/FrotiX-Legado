# Documentação: IRepository.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

A interface `IRepository<T>` define o contrato genérico para repositórios no sistema FrotiX, mantendo apenas operações genéricas sem acoplamento a tipos específicos do domínio.

**Principais características:**

✅ **Contrato Genérico**: Define operações CRUD genéricas  
✅ **Sem Lógica de Domínio**: Apenas operações de acesso a dados  
✅ **Suporte a Projeções**: DTOs e queries otimizadas  
✅ **Assíncrono**: Métodos assíncronos para I/O não bloqueante

---

## Estrutura da Interface

### Definição

```csharp
public interface IRepository<T>
    where T : class
```

**Constraint**: `T` deve ser uma classe (entidade EF Core)

---

## Métodos de Leitura

### `Get(object id)`

**Descrição**: Obtém uma entidade pela chave primária (chave simples)

**Retorno**: `T` ou `null` se não encontrado

**Limitação**: Não suporta chaves compostas

---

### `GetFirstOrDefault(...)`

**Descrição**: Obtém a primeira entidade que satisfaz o filtro

**Assinatura**:
```csharp
T GetFirstOrDefault(
    Expression<Func<T, bool>> filter = null,
    string includeProperties = null
)
```

**Parâmetros**:
- `filter`: Expressão lambda para filtro (opcional)
- `includeProperties`: String CSV de propriedades para eager loading (opcional)

---

### `GetFirstOrDefaultAsync(...)`

**Descrição**: Versão assíncrona de `GetFirstOrDefault`

**Retorno**: `Task<T>`

---

### `GetAll(...)`

**Descrição**: Retorna um conjunto materializado de entidades

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
- Suporte a filtros, ordenação e includes
- `asNoTracking: true` por padrão (performance)

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
    int? take = null
)
```

**Parâmetro Adicional**: `take` - Limita número de resultados

---

## Métodos de Projeção

### `GetAllReduced<TResult>(...)`

**Descrição**: Versão materializada para projeções (compat com páginas antigas)

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

**Características**:
- Projeta entidade para DTO/objeto leve
- Materializa resultado (`ToList()`)
- Otimiza transferência de dados

**Uso Típico**: Para listagens em grids/dropdowns

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
- Não materializa até execução explícita

**Uso Típico**: Para queries complexas com múltiplas operações

---

## Métodos de Escrita

### `Add(T entity)`

**Descrição**: Adiciona a entidade ao contexto

**Comportamento**: Não persiste no banco (precisa chamar `Save()`)

---

### `AddAsync(T entity)`

**Descrição**: Adiciona a entidade ao contexto (assíncrono)

**Retorno**: `Task`

---

### `Update(T entity)`

**Descrição**: Atualiza a entidade no contexto

**Comportamento**: Marca entidade como modificada (precisa chamar `Save()`)

---

### `Remove(object id)`

**Descrição**: Remove a entidade pela chave (chave simples)

**Comportamento**: Busca entidade antes de remover

---

### `Remove(T entity)`

**Descrição**: Remove a entidade informada

**Comportamento**: Marca entidade para exclusão (precisa chamar `Save()`)

---

## Interconexões

### Quem Implementa Esta Interface

- **Repository<T>**: Implementação base genérica
- **Repositories Específicos**: Herdam de `Repository<T>` e implementam interfaces específicas

### O Que Esta Interface Define

- **Contrato Padrão**: Operações CRUD genéricas
- **Padrão Repository**: Abstração de acesso a dados

---

## Padrão de Implementação

### Repositories Específicos

Repositories específicos herdam de `Repository<T>` e implementam interfaces específicas:

```csharp
public interface IVeiculoRepository : IRepository<Veiculo>
{
    // Métodos específicos de Veiculo
    IEnumerable<SelectListItem> GetVeiculoListForDropDown();
    void Update(Veiculo veiculo);
}

public class VeiculoRepository : Repository<Veiculo>, IVeiculoRepository
{
    // Implementação específica
}
```

---

## Exemplos de Uso

### Exemplo 1: Leitura Simples

```csharp
var veiculo = unitOfWork.Veiculo.Get(veiculoId);
```

### Exemplo 2: Leitura com Filtro e Includes

```csharp
var veiculo = unitOfWork.Veiculo.GetFirstOrDefault(
    v => v.Placa == "ABC1234",
    "MarcaVeiculo,ModeloVeiculo"
);
```

### Exemplo 3: Listagem com Projeção

```csharp
var veiculos = unitOfWork.Veiculo.GetAllReduced(
    selector: v => new { v.VeiculoId, v.Placa, v.Status },
    filter: v => v.Status == true,
    orderBy: q => q.OrderBy(v => v.Placa)
);
```

### Exemplo 4: Escrita

```csharp
var veiculo = new Veiculo { Placa = "ABC1234" };
unitOfWork.Veiculo.Add(veiculo);
unitOfWork.Save();
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
