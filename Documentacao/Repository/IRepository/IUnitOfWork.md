# Documentação: IUnitOfWork.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

A interface `IUnitOfWork` define o contrato para o padrão UnitOfWork no sistema FrotiX, fornecendo acesso a todos os repositories e métodos de persistência.

**Principais características:**

✅ **Contrato Unificado**: Define acesso a todos os repositories  
✅ **Partial Interface**: Dividida em múltiplos arquivos  
✅ **Disposable**: Herda de `IDisposable`  
✅ **Métodos de Persistência**: `Save()` e `SaveAsync()`

**Nota**: Esta interface é implementada como `partial interface`, dividida em:
- `IUnitOfWork.cs` (principal)
- `IUnitOfWork.OcorrenciaViagem.cs`
- `IUnitOfWork.RepactuacaoVeiculo.cs`

---

## Estrutura da Interface

### Definição

```csharp
public partial interface IUnitOfWork : IDisposable
```

**Herança**: `IDisposable` - Para liberação de recursos

---

## Método Principal

### `GetDbContext()`

**Descrição**: Retorna o DbContext para operações avançadas

**Retorno**: `DbContext`

**Uso**: Para acessar `ChangeTracker`, `Database`, operações SQL brutas, etc.

---

## Propriedades de Repositories

### Repositories de Cadastros

```csharp
IVeiculoRepository Veiculo { get; }
IMotoristaRepository Motorista { get; }
IContratoRepository Contrato { get; }
IAtaRegistroPrecosRepository AtaRegistroPrecos { get; }
ICombustivelRepository Combustivel { get; }
IUnidadeRepository Unidade { get; }
// ... e muitos outros
```

**Total**: Mais de 50 repositories de cadastros e operações

---

### Repositories de Views

```csharp
IViewVeiculosRepository ViewVeiculos { get; }
IViewViagensRepository ViewViagens { get; }
IViewAbastecimentosRepository ViewAbastecimentos { get; }
IViewMotoristasRepository ViewMotoristas { get; }
// ... e muitos outros
```

**Total**: Mais de 30 repositories de views

---

### Repositories Especiais

#### `IRepository<AbastecimentoPendente> AbastecimentoPendente`

**Descrição**: Repository genérico para pendências de abastecimento

**Tipo**: `IRepository<T>` genérico (não tem interface específica)

---

## Métodos de Persistência

### `Save()`

**Descrição**: Persiste todas as mudanças no banco de dados

**Comportamento**: Executa `SaveChanges()` em uma única transação

---

### `SaveAsync()`

**Descrição**: Versão assíncrona de `Save`

**Retorno**: `Task`

---

## Interconexões

### Quem Implementa Esta Interface

- **UnitOfWork**: Implementação principal

### Quem Usa Esta Interface

- **Todos os Controllers**: Via injeção de dependência
- **Services**: Para operações de negócio
- **Startup.cs/Program.cs**: Configuração de DI

---

## Padrão de Uso

### Exemplo: Injeção em Controller

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

    public IActionResult Create([FromBody] Veiculo veiculo)
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

**Descrição**: Criação da documentação completa do IUnitOfWork

**Arquivos Afetados**:
- `Repository/IRepository/IUnitOfWork.cs`
- `Repository/IRepository/IUnitOfWork.OcorrenciaViagem.cs`
- `Repository/IRepository/IUnitOfWork.RepactuacaoVeiculo.cs`

**Impacto**: Documentação de referência para contrato UnitOfWork

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
