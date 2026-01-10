# Padrão: Repositories Específicos

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DO PADRÃO

## Visão Geral

Os repositories específicos do sistema FrotiX seguem um padrão consistente: herdam de `Repository<T>` e implementam interfaces específicas `I{T}Repository`, adicionando métodos customizados quando necessário.

**Total de Repositories**: ~200 arquivos (implementações + interfaces)

**Padrão**: Repository Pattern com Unit of Work

---

## Estrutura Padrão

### Implementação Típica

```csharp
public class {Entidade}Repository : Repository<{Entidade}>, I{Entidade}Repository
{
    private new readonly FrotiXDbContext _db;

    public {Entidade}Repository(FrotiXDbContext db) : base(db)
    {
        _db = db;
    }

    // Métodos específicos opcionais
}
```

### Interface Típica

```csharp
public interface I{Entidade}Repository : IRepository<{Entidade}>
{
    // Métodos específicos opcionais
}
```

---

## Categorias de Repositories

### 1. Repositories de Cadastros Básicos

**Padrão**: Apenas herdam de `Repository<T>`, sem métodos adicionais

**Exemplos**:
- `CombustivelRepository`
- `MarcaVeiculoRepository`
- `ModeloVeiculoRepository`
- `FornecedorRepository`
- `PlacaBronzeRepository`

**Uso**: CRUD padrão via métodos herdados

---

### 2. Repositories com Métodos Específicos

**Padrão**: Adicionam métodos customizados além do CRUD

**Métodos Comuns**:
- `Get{Entidade}ListForDropDown()`: Para dropdowns em views
- `Update()` customizado: Com lógica específica de atualização

**Exemplos**:
- `VeiculoRepository`: `GetVeiculoListForDropDown()`, `Update()` customizado
- `AbastecimentoRepository`: `GetAbastecimentoListForDropDown()`, `Update()` customizado
- `MotoristaRepository`: Métodos específicos para motoristas
- `ViagemRepository`: Métodos específicos para viagens

---

### 3. Repositories de Views

**Padrão**: Repositories para views otimizadas (read-only)

**Características**:
- Apenas leitura (sem `Add`, `Update`, `Remove`)
- Consultas otimizadas
- Dados agregados

**Exemplos**:
- `ViewAbastecimentosRepository`
- `ViewVeiculosRepository`
- `ViewViagensRepository`
- `ViewCustosViagemRepository`
- Mais de 30 views...

**Uso**: Consultas rápidas com dados pré-agregados

---

### 4. Repositories de Relacionamentos

**Padrão**: Repositories para tabelas de relacionamento (chaves compostas)

**Características**:
- Tabelas de junção
- Chaves compostas
- Relacionamentos muitos-para-muitos

**Exemplos**:
- `VeiculoContratoRepository`
- `VeiculoAtaRepository`
- `MotoristaContratoRepository`
- `LavadoresLavagemRepository`

---

## Métodos Comuns Adicionados

### `Get{Entidade}ListForDropDown()`

**Descrição**: Retorna lista para dropdowns em views Razor

**Retorno**: `IEnumerable<SelectListItem>`

**Exemplo**:
```csharp
public IEnumerable<SelectListItem> GetVeiculoListForDropDown()
{
    return _db.Veiculo
        .OrderBy(o => o.Placa)
        .Select(i => new SelectListItem()
        {
            Text = i.Placa,
            Value = i.VeiculoId.ToString()
        });
}
```

**Uso em Views**:
```razor
@Html.DropDownListFor(m => m.VeiculoId, 
    Model.VeiculosList, 
    "Selecione...", 
    new { @class = "form-control" })
```

---

### `Update()` Customizado

**Descrição**: Sobrescreve método `Update()` com lógica específica

**Padrão Típico**:
```csharp
public new void Update({Entidade} entidade)
{
    var objFromDb = _db.{Entidade}
        .FirstOrDefault(s => s.{Entidade}Id == entidade.{Entidade}Id);
    
    _db.Update(entidade);
    _db.SaveChanges(); // ⚠️ ATENÇÃO: Salva imediatamente
}
```

**⚠️ Observação**: Alguns repositories chamam `SaveChanges()` diretamente, o que pode quebrar transações do Unit of Work. Ideal seria apenas marcar como modificado e deixar `UnitOfWork.Save()` persistir.

---

## Repositories Especiais

### `AbastecimentoPendente`

**Tipo**: Repository genérico (`IRepository<AbastecimentoPendente>`)

**Uso**: Não tem repository específico, usa `Repository<T>` diretamente

**Acesso**: `_unitOfWork.AbastecimentoPendente`

---

### Repositories Lazy-Loaded

**Repositories**: Instanciados apenas quando acessados

**Exemplos**:
- `ViagemEstatisticaRepository`
- `VeiculoPadraoViagemRepository`
- `OcorrenciaViagemRepository` (partial)
- `RepactuacaoVeiculoRepository` (partial)

**Motivo**: Economia de memória para repositories pouco usados

---

## Padrão de Nomenclatura

### Implementação
- `{Entidade}Repository.cs`
- Namespace: `FrotiX.Repository`

### Interface
- `I{Entidade}Repository.cs`
- Namespace: `FrotiX.Repository.IRepository`

### Exemplos
- `VeiculoRepository` → `IVeiculoRepository`
- `MotoristaRepository` → `IMotoristaRepository`
- `ViewAbastecimentosRepository` → `IViewAbastecimentosRepository`

---

## Lista Completa de Repositories

### Cadastros (~40 repositories)
- Unidade, Combustivel, MarcaVeiculo, ModeloVeiculo
- Veiculo, Motorista, Encarregado, Operador, Lavador
- Contrato, AtaRegistroPrecos, Fornecedor
- Requisitante, SetorSolicitante
- SetorPatrimonial, SecaoPatrimonial, Patrimonio
- PlacaBronze, AspNetUsers, Recurso
- E outros...

### Operações (~20 repositories)
- Viagem, ViagensEconomildo, Abastecimento
- Lavagem, Manutencao, Multa
- Empenho, NotaFiscal, Evento
- OcorrenciaViagem, ViagemEstatistica
- E outros...

### Relacionamentos (~15 repositories)
- VeiculoContrato, VeiculoAta
- MotoristaContrato, OperadorContrato
- EncarregadoContrato, LavadorContrato
- ItemVeiculoContrato, ItemVeiculoAta
- LavadoresLavagem, LotacaoMotorista
- E outros...

### Views (~35 repositories)
- ViewAbastecimentos, ViewVeiculos, ViewMotoristas
- ViewViagens, ViewCustosViagem
- ViewManutencao, ViewMultas, ViewEmpenhos
- ViewFluxoEconomildo, ViewLavagem
- ViewEventos, ViewOcorrencia
- E muitos outros...

### Especiais (~10 repositories)
- AlertasFrotiX, AlertasUsuario
- RepactuacaoContrato, RepactuacaoAta
- RepactuacaoServicos, RepactuacaoTerceirizacao
- RepactuacaoVeiculo
- CorridasTaxiLeg, CorridasCanceladasTaxiLeg
- E outros...

---

## Interconexões

### Quem Usa os Repositories

- **Controllers**: Via `IUnitOfWork`
- **Services**: Para operações de negócio
- **Helpers**: Para listas compartilhadas

### O Que os Repositories Usam

- **FrotiX.Data**: `FrotiXDbContext`
- **FrotiX.Models**: Modelos de entidades
- **Repository<T>**: Classe base genérica

---

## Boas Práticas

### ✅ Recomendado

1. **Herdar de `Repository<T>`**: Reutiliza código comum
2. **Implementar Interface Específica**: Facilita testes e DI
3. **Métodos Específicos**: Adicionar apenas quando necessário
4. **Usar UnitOfWork.Save()**: Não chamar `SaveChanges()` diretamente

### ❌ Evitar

1. **Lógica de Negócio**: Repositories devem apenas acessar dados
2. **SaveChanges() Direto**: Quebra transações do Unit of Work
3. **Dependências Desnecessárias**: Manter repositories simples

---

## Exemplo Completo

### Interface

```csharp
public interface IVeiculoRepository : IRepository<Veiculo>
{
    IEnumerable<SelectListItem> GetVeiculoListForDropDown();
    void Update(Veiculo veiculo);
}
```

### Implementação

```csharp
public class VeiculoRepository : Repository<Veiculo>, IVeiculoRepository
{
    private new readonly FrotiXDbContext _db;

    public VeiculoRepository(FrotiXDbContext db) : base(db)
    {
        _db = db;
    }

    public IEnumerable<SelectListItem> GetVeiculoListForDropDown()
    {
        return _db.Veiculo
            .OrderBy(o => o.Placa)
            .Select(i => new SelectListItem()
            {
                Text = i.Placa,
                Value = i.VeiculoId.ToString()
            });
    }

    public new void Update(Veiculo veiculo)
    {
        var objFromDb = _db.Veiculo
            .FirstOrDefault(s => s.VeiculoId == veiculo.VeiculoId);
        
        _db.Update(veiculo);
        // ⚠️ Ideal seria remover SaveChanges() e usar UnitOfWork.Save()
        _db.SaveChanges();
    }
}
```

### Uso em Controller

```csharp
public class VeiculoController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    
    public VeiculoController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }
    
    public IActionResult Listar()
    {
        var veiculos = _unitOfWork.Veiculo.GetAll(
            orderBy: q => q.OrderBy(v => v.Placa)
        );
        return Ok(veiculos);
    }
    
    public IActionResult Dropdown()
    {
        var dropdown = _unitOfWork.Veiculo.GetVeiculoListForDropDown();
        return Json(dropdown);
    }
}
```

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação do padrão de repositories específicos

**Arquivos Afetados**:
- Todos os repositories específicos (~200 arquivos)

**Impacto**: Documentação de referência para padrão Repository

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
