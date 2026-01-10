# Documentação: UnitOfWork.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

A classe `UnitOfWork` é o padrão Unit of Work implementado para o sistema FrotiX, centralizando acesso a todos os repositories e gerenciando transações de banco de dados.

**Principais características:**

✅ **Centralização**: Acesso único a todos os repositories  
✅ **Transações**: Gerencia `SaveChanges()` e `SaveChangesAsync()`  
✅ **Lazy Loading**: Alguns repositories são instanciados sob demanda  
✅ **Disposable**: Implementa `IDisposable` para liberação de recursos  
✅ **Partial Class**: Dividido em múltiplos arquivos para organização

**Nota**: Esta classe é implementada como `partial class`, dividida em:
- `UnitOfWork.cs` (principal)
- `UnitOfWork.OcorrenciaViagem.cs`
- `UnitOfWork.RepactuacaoVeiculo.cs`

---

## Estrutura da Classe

### Herança e Interface

```csharp
public partial class UnitOfWork : IUnitOfWork
```

**Interface**: Implementa `IUnitOfWork` que expõe todos os repositories

---

## Campos Privados

### `private new readonly FrotiXDbContext _db`

**Descrição**: Contexto de banco de dados principal

**Nota**: Usa `new` para ocultar campo da classe base (se houver)

---

### `private ViagemEstatisticaRepository _viagemEstatisticaRepository`

**Descrição**: Repository lazy-loaded para estatísticas de viagens

**Uso**: Instanciado apenas quando acessado pela primeira vez

---

### `private VeiculoPadraoViagemRepository _veiculoPadraoViagemRepository`

**Descrição**: Repository lazy-loaded para veículo padrão de viagens

**Uso**: Instanciado apenas quando acessado pela primeira vez

---

## Construtor

```csharp
public UnitOfWork(FrotiXDbContext db)
{
    _db = db;
    // Inicializa TODOS os repositories
    Unidade = new UnidadeRepository(_db);
    Combustivel = new CombustivelRepository(_db);
    // ... mais de 100 repositories inicializados
}
```

**Inicialização**: Instancia todos os repositories no construtor

**Total de Repositories**: Mais de 100 repositories diferentes

---

## Repositories Expostos

### Repositories de Cadastros

- `Unidade`, `Combustivel`, `MarcaVeiculo`, `ModeloVeiculo`
- `Veiculo`, `Fornecedor`, `Contrato`, `AtaRegistroPrecos`
- `Motorista`, `Encarregado`, `Operador`, `Lavador`
- `Requisitante`, `SetorSolicitante`
- `SetorPatrimonial`, `SecaoPatrimonial`, `Patrimonio`
- `PlacaBronze`, `AspNetUsers`, `Recurso`

### Repositories de Operações

- `Viagem`, `ViagensEconomildo`, `Abastecimento`
- `Lavagem`, `Manutencao`, `Multa`
- `Empenho`, `NotaFiscal`, `Evento`
- `OcorrenciaViagem` (lazy-loaded)

### Repositories de Relacionamentos

- `VeiculoContrato`, `VeiculoAta`
- `MotoristaContrato`, `OperadorContrato`
- `EncarregadoContrato`, `LavadorContrato`
- `ItemVeiculoContrato`, `ItemVeiculoAta`
- `LavadoresLavagem`, `LotacaoMotorista`

### Repositories de Views

- `ViewAbastecimentos`, `ViewVeiculos`, `ViewMotoristas`
- `ViewViagens`, `ViewCustosViagem`
- `ViewManutencao`, `ViewMultas`, `ViewEmpenhos`
- `ViewFluxoEconomildo`, `ViewLavagem`
- `ViewEventos`, `ViewOcorrencia`
- E mais de 30 outras views...

### Repositories Especiais

- `AbastecimentoPendente`: Repository genérico (`IRepository<AbastecimentoPendente>`)
- `AlertasFrotiX`, `AlertasUsuario`: Sistema de alertas
- `ViagemEstatistica`: Lazy-loaded
- `VeiculoPadraoViagem`: Lazy-loaded
- `RepactuacaoVeiculo`: Lazy-loaded (partial)

---

## Propriedades Lazy-Loaded

### `ViagemEstatistica`

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

**Motivo**: Repository usado menos frequentemente, economiza memória

---

### `VeiculoPadraoViagem`

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

**Motivo**: Repository usado menos frequentemente

---

## Métodos de Persistência

### `Save()`

**Descrição**: Persiste todas as mudanças no banco de dados

**Implementação**:
```csharp
public void Save()
{
    _db.SaveChanges();
}
```

**Uso**:
```csharp
_unitOfWork.Veiculo.Add(veiculo);
_unitOfWork.Motorista.Add(motorista);
_unitOfWork.Save(); // Persiste tudo em uma transação
```

**Transação**: Todas as mudanças são commitadas juntas (atomicidade)

---

### `SaveAsync()`

**Descrição**: Versão assíncrona de `Save()`

**Implementação**:
```csharp
public async Task SaveAsync()
{
    await _db.SaveChangesAsync();
}
```

**Uso**:
```csharp
await _unitOfWork.Veiculo.AddAsync(veiculo);
await _unitOfWork.SaveAsync();
```

---

## Método de Acesso ao DbContext

### `GetDbContext()`

**Descrição**: Retorna o DbContext para operações avançadas

**Implementação**:
```csharp
public DbContext GetDbContext() => _db;
```

**Uso**: Para acessar `ChangeTracker`, `Database`, etc.

**Exemplo**:
```csharp
var context = _unitOfWork.GetDbContext();
var entries = context.ChangeTracker.Entries()
    .Where(e => e.State == EntityState.Modified)
    .ToList();
```

---

## Método Dispose

### `Dispose()`

**Descrição**: Libera recursos do DbContext

**Implementação**:
```csharp
public void Dispose()
{
    _db.Dispose();
}
```

**Uso**: Chamado automaticamente em `using` ou manualmente

**Exemplo**:
```csharp
using (var unitOfWork = serviceProvider.GetService<IUnitOfWork>())
{
    // operações
    unitOfWork.Save();
} // Dispose() chamado automaticamente
```

---

## Extensões Parciais

### `UnitOfWork.OcorrenciaViagem.cs`

**Repositories Adicionados**:
- `OcorrenciaViagem` (lazy-loaded)
- `ViewOcorrenciasViagem` (lazy-loaded)
- `ViewOcorrenciasAbertasVeiculo` (lazy-loaded)

---

### `UnitOfWork.RepactuacaoVeiculo.cs`

**Repositories Adicionados**:
- `RepactuacaoVeiculo` (lazy-loaded)

---

## Interconexões

### Quem Usa Esta Classe

- **Todos os Controllers**: Via injeção de dependência `IUnitOfWork`
- **Services**: Para operações de negócio
- **Startup.cs/Program.cs**: Configuração de DI

### O Que Esta Classe Usa

- **FrotiX.Data**: `FrotiXDbContext`
- **FrotiX.Repository.IRepository**: Todas as interfaces de repositories
- **Todos os Repositories**: Instancia todos os repositories específicos

---

## Configuração de Dependency Injection

### Startup.cs ou Program.cs

```csharp
services.AddScoped<IUnitOfWork, UnitOfWork>();
services.AddDbContext<FrotiXDbContext>(options =>
    options.UseSqlServer(connectionString));
```

**Lifetime**: `Scoped` - Uma instância por requisição HTTP

**Vantagem**: Todas as operações em uma requisição compartilham o mesmo contexto

---

## Padrão de Uso

### Exemplo Completo

```csharp
public class VeiculoController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    
    public VeiculoController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }
    
    [HttpPost]
    public IActionResult Criar([FromBody] Veiculo veiculo)
    {
        // Adiciona veículo
        _unitOfWork.Veiculo.Add(veiculo);
        
        // Adiciona relacionamento com contrato
        var veiculoContrato = new VeiculoContrato 
        { 
            VeiculoId = veiculo.VeiculoId,
            ContratoId = contratoId 
        };
        _unitOfWork.VeiculoContrato.Add(veiculoContrato);
        
        // Persiste tudo em uma transação
        _unitOfWork.Save();
        
        return Ok();
    }
    
    [HttpGet]
    public IActionResult Listar()
    {
        var veiculos = _unitOfWork.ViewVeiculos.GetAll(
            orderBy: q => q.OrderBy(v => v.Placa)
        );
        
        return Ok(veiculos);
    }
}
```

---

## Vantagens do Padrão Unit of Work

1. **Transações Atômicas**: Múltiplas operações em uma única transação
2. **Consistência**: Garante que todas as mudanças são commitadas juntas
3. **Reversibilidade**: Se uma operação falhar, todas são revertidas
4. **Performance**: Uma única chamada `SaveChanges()` para múltiplas operações
5. **Simplicidade**: Controllers não precisam gerenciar transações manualmente

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do UnitOfWork

**Arquivos Afetados**:
- `Repository/UnitOfWork.cs`
- `Repository/UnitOfWork.OcorrenciaViagem.cs`
- `Repository/UnitOfWork.RepactuacaoVeiculo.cs`

**Impacto**: Documentação de referência para padrão Unit of Work

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
