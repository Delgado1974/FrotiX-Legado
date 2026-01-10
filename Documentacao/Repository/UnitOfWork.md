# Documentação: UnitOfWork.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

A classe `UnitOfWork` é o orquestrador central do padrão Repository/UnitOfWork no sistema FrotiX. Gerencia todos os repositories, coordena transações e fornece acesso unificado aos dados.

**Principais características:**

✅ **Centralização**: Um único ponto de acesso a todos os repositories  
✅ **Gerenciamento de Transações**: Coordena `SaveChanges()`  
✅ **Lazy Loading de Repositories**: Repositories específicos são instanciados sob demanda  
✅ **Disposable**: Implementa `IDisposable` para liberação de recursos  
✅ **Partial Class**: Dividido em múltiplos arquivos para organização

**Nota**: Esta classe é implementada como `partial class`, dividida em:
- `UnitOfWork.cs` (principal)
- `UnitOfWork.OcorrenciaViagem.cs`
- `UnitOfWork.RepactuacaoVeiculo.cs`

---

## Estrutura da Classe

### Herança e Implementação

```csharp
public partial class UnitOfWork : IUnitOfWork
```

**Herança**: Implementa `IUnitOfWork`  
**Padrão**: Partial class para organização

---

## Campos Privados

### `private new readonly FrotiXDbContext _db`

**Descrição**: Contexto de banco de dados principal

**Nota**: Usa `new` para ocultar campo da classe base (se houver)

---

### `private ViagemEstatisticaRepository _viagemEstatisticaRepository`

**Descrição**: Repository lazy-loaded para estatísticas de viagens

**Uso**: Instanciado sob demanda na propriedade `ViagemEstatistica`

---

### `private VeiculoPadraoViagemRepository _veiculoPadraoViagemRepository`

**Descrição**: Repository lazy-loaded para veículo padrão de viagens

**Uso**: Instanciado sob demanda na propriedade `VeiculoPadraoViagem`

---

## Construtor

```csharp
public UnitOfWork(FrotiXDbContext db)
{
    _db = db;
    // Inicializa todos os repositories...
}
```

**Inicialização**: Instancia todos os repositories no construtor

**Repositories Inicializados** (mais de 80):
- Cadastros: `Veiculo`, `Motorista`, `Contrato`, `AtaRegistroPrecos`, etc.
- Operações: `Viagem`, `Abastecimento`, `Manutencao`, `Multa`, etc.
- Views: `ViewVeiculos`, `ViewViagens`, `ViewAbastecimentos`, etc.
- Relacionamentos: `VeiculoContrato`, `MotoristaContrato`, etc.

---

## Propriedades de Repositories

### Repositories de Cadastros

```csharp
public IVeiculoRepository Veiculo { get; private set; }
public IMotoristaRepository Motorista { get; private set; }
public IContratoRepository Contrato { get; private set; }
public IAtaRegistroPrecosRepository AtaRegistroPrecos { get; private set; }
// ... e muitos outros
```

**Padrão**: Propriedades `get; private set;` inicializadas no construtor

---

### Repositories de Views

```csharp
public IViewVeiculosRepository ViewVeiculos { get; private set; }
public IViewViagensRepository ViewViagens { get; private set; }
public IViewAbastecimentosRepository ViewAbastecimentos { get; private set; }
// ... e muitos outros
```

**Uso**: Para consultas otimizadas em views do banco

---

### Repositories Lazy-Loaded

#### `ViagemEstatistica`

```csharp
public IViagemEstatisticaRepository ViagemEstatistica
{
    get
    {
        if (_viagemEstatisticaRepository == null)
        {
            _viagemEstatisticaRepository = new ViagemEstatisticaRepository(_db);
        }
        return _viagemEstatisticaRepository;
    }
}
```

**Motivo**: Instanciado sob demanda para otimização

---

#### `VeiculoPadraoViagem`

```csharp
public IVeiculoPadraoViagemRepository VeiculoPadraoViagem
{
    get
    {
        if (_veiculoPadraoViagemRepository == null)
        {
            _veiculoPadraoViagemRepository = new VeiculoPadraoViagemRepository(_db);
        }
        return _veiculoPadraoViagemRepository;
    }
}
```

---

## Métodos Principais

### `GetDbContext()`

**Descrição**: Retorna o DbContext para operações avançadas

**Retorno**: `DbContext`

**Uso**: Para acessar `ChangeTracker`, `Database`, etc.

**Exemplo**:
```csharp
var dbContext = unitOfWork.GetDbContext();
var entries = dbContext.ChangeTracker.Entries();
```

---

### `Save()`

**Descrição**: **MÉTODO CRÍTICO** - Persiste todas as mudanças no banco de dados

**Implementação**:
```csharp
public void Save()
{
    _db.SaveChanges();
}
```

**Uso**: Após operações de escrita (Add, Update, Remove)

**Exemplo**:
```csharp
unitOfWork.Veiculo.Add(novoVeiculo);
unitOfWork.Motorista.Update(motorista);
unitOfWork.Save(); // Persiste tudo em uma transação
```

**Comportamento**: 
- Executa `SaveChanges()` em uma única transação
- Se uma operação falhar, todas são revertidas (rollback)

---

### `SaveAsync()`

**Descrição**: Versão assíncrona de `Save`

**Retorno**: `Task`

**Uso**: Para operações não bloqueantes

---

### `Dispose()`

**Descrição**: Libera recursos do DbContext

**Implementação**:
```csharp
public void Dispose()
{
    _db.Dispose();
}
```

**Uso**: Chamado automaticamente em `using` ou pelo container DI

---

## Interconexões

### Quem Usa Esta Classe

- **Todos os Controllers**: Via injeção de dependência (`IUnitOfWork`)
- **Services**: Para operações de negócio
- **Startup.cs/Program.cs**: Configuração de DI

### O Que Esta Classe Usa

- **FrotiX.Data**: `FrotiXDbContext`
- **FrotiX.Repository.IRepository**: Interfaces de repositories
- **Todos os Repositories**: Instancia e gerencia

---

## Configuração de Dependency Injection

### Startup.cs ou Program.cs

```csharp
services.AddScoped<IUnitOfWork, UnitOfWork>(provider =>
{
    var dbContext = provider.GetRequiredService<FrotiXDbContext>();
    return new UnitOfWork(dbContext);
});
```

**Escopo**: `Scoped` - Uma instância por requisição HTTP

**Vantagens**:
- Compartilha mesma transação em uma requisição
- Libera recursos automaticamente ao final da requisição

---

## Padrão de Uso

### Exemplo 1: Operação Simples

```csharp
public class VeiculoController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public VeiculoController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public IActionResult Get(Guid id)
    {
        var veiculo = _unitOfWork.Veiculo.Get(id);
        return Ok(veiculo);
    }
}
```

### Exemplo 2: Operação com Múltiplas Entidades

```csharp
public IActionResult CriarViagemCompleta([FromBody] ViagemDTO dto)
{
    // Criar viagem
    var viagem = new Viagem { /* ... */ };
    _unitOfWork.Viagem.Add(viagem);

    // Criar ocorrências
    foreach (var ocorrenciaDto in dto.Ocorrencias)
    {
        var ocorrencia = new OcorrenciaViagem { /* ... */ };
        _unitOfWork.OcorrenciaViagem.Add(ocorrencia);
    }

    // Persistir tudo em uma transação
    _unitOfWork.Save(); // Se qualquer operação falhar, todas são revertidas

    return Ok();
}
```

### Exemplo 3: Consulta com View

```csharp
public IActionResult ListarAbastecimentos(DateTime dataInicio, DateTime dataFim)
{
    var abastecimentos = _unitOfWork.ViewAbastecimentos.GetAll(
        filter: a => a.DataHora >= dataInicio && a.DataHora <= dataFim,
        orderBy: q => q.OrderByDescending(a => a.DataHora)
    );

    return Ok(abastecimentos);
}
```

---

## Observações Importantes

### Transações

⚠️ **CRÍTICO**: `Save()` executa todas as mudanças em uma única transação

**Vantagem**: Atomicidade - tudo ou nada

**Desvantagem**: Se uma operação falhar, todas são revertidas

**Solução**: Use `TransactionScope` para transações mais complexas se necessário

---

### Escopo de Instância

⚠️ **Scoped**: Uma instância por requisição HTTP

**Implicação**: 
- Compartilha mesma transação em uma requisição
- Não compartilha entre requisições diferentes

---

### Lazy Loading de Repositories

⚠️ **Apenas 2 Repositories**: `ViagemEstatistica` e `VeiculoPadraoViagem`

**Motivo**: Otimização - instanciados apenas quando necessários

**Demais Repositories**: Instanciados no construtor (eager initialization)

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do UnitOfWork

**Arquivos Afetados**:
- `Repository/UnitOfWork.cs`
- `Repository/UnitOfWork.OcorrenciaViagem.cs`
- `Repository/UnitOfWork.RepactuacaoVeiculo.cs`

**Impacto**: Documentação de referência para orquestração de repositories

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
