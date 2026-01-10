# Documentação: IUnitOfWork.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

A interface `IUnitOfWork` define o contrato do padrão Unit of Work para o sistema FrotiX, expondo acesso a todos os repositories e métodos de persistência.

**Principais características:**

✅ **Centralização**: Acesso único a todos os repositories  
✅ **Transações**: Métodos `Save()` e `SaveAsync()`  
✅ **Disposable**: Herda de `IDisposable`  
✅ **Partial Interface**: Dividida em múltiplos arquivos  
✅ **Mais de 100 Repositories**: Expõe todos os repositories do sistema

**Nota**: Esta interface é implementada como `partial interface`, dividida em:
- `IUnitOfWork.cs` (principal)
- `IUnitOfWork.OcorrenciaViagem.cs`
- `IUnitOfWork.RepactuacaoVeiculo.cs`

---

## Estrutura da Interface

### Herança

```csharp
public partial interface IUnitOfWork : IDisposable
```

**Herança**: `IDisposable` para liberação de recursos

---

## Método de Acesso ao DbContext

### `DbContext GetDbContext()`

**Descrição**: Retorna o DbContext para operações avançadas

**Uso**: Para acessar `ChangeTracker`, `Database`, etc.

---

## Repositories Expostos

A interface expõe mais de 100 repositories organizados por categoria:

### Repositories de Cadastros

- `IUnidadeRepository Unidade`
- `ICombustivelRepository Combustivel`
- `IMarcaVeiculoRepository MarcaVeiculo`
- `IModeloVeiculoRepository ModeloVeiculo`
- `IVeiculoRepository Veiculo`
- `IFornecedorRepository Fornecedor`
- `IContratoRepository Contrato`
- `IAtaRegistroPrecosRepository AtaRegistroPrecos`
- `IMotoristaRepository Motorista`
- `IEncarregadoRepository Encarregado`
- `IOperadorRepository Operador`
- `ILavadorRepository Lavador`
- `IRequisitanteRepository Requisitante`
- `ISetorSolicitanteRepository SetorSolicitante`
- `ISetorPatrimonialRepository SetorPatrimonial`
- `ISecaoPatrimonialRepository SecaoPatrimonial`
- `IPatrimonioRepository Patrimonio`
- `IPlacaBronzeRepository PlacaBronze`
- `IAspNetUsersRepository AspNetUsers`
- `IRecursoRepository Recurso`

### Repositories de Operações

- `IViagemRepository Viagem`
- `IViagensEconomildoRepository ViagensEconomildo`
- `IAbastecimentoRepository Abastecimento`
- `ILavagemRepository Lavagem`
- `IManutencaoRepository Manutencao`
- `IMultaRepository Multa`
- `IEmpenhoRepository Empenho`
- `INotaFiscalRepository NotaFiscal`
- `IEventoRepository Evento`
- `IOcorrenciaViagemRepository OcorrenciaViagem` (partial)

### Repositories de Relacionamentos

- `IVeiculoContratoRepository VeiculoContrato`
- `IVeiculoAtaRepository VeiculoAta`
- `IMotoristaContratoRepository MotoristaContrato`
- `IOperadorContratoRepository OperadorContrato`
- `IEncarregadoContratoRepository EncarregadoContrato`
- `ILavadorContratoRepository LavadorContrato`
- `IItemVeiculoContratoRepository ItemVeiculoContrato`
- `IItemVeiculoAtaRepository ItemVeiculoAta`
- `ILavadoresLavagemRepository LavadoresLavagem`
- `ILotacaoMotoristaRepository LotacaoMotorista`

### Repositories de Views

- `IViewAbastecimentosRepository ViewAbastecimentos`
- `IViewVeiculosRepository ViewVeiculos`
- `IViewMotoristasRepository ViewMotoristas`
- `IViewViagensRepository ViewViagens`
- `IViewCustosViagemRepository ViewCustosViagem`
- `IViewManutencaoRepository ViewManutencao`
- `IviewMultasRepository viewMultas`
- `IViewEmpenhosRepository ViewEmpenhos`
- `IViewFluxoEconomildoRepository ViewFluxoEconomildo`
- `IViewLavagemRepository ViewLavagem`
- `IViewEventosRepository ViewEventos`
- `IViewOcorrenciaRepository ViewOcorrencia`
- E mais de 30 outras views...

### Repositories Especiais

- `IRepository<AbastecimentoPendente> AbastecimentoPendente`: Repository genérico
- `IAlertasFrotiXRepository AlertasFrotiX`: Sistema de alertas
- `IAlertasUsuarioRepository AlertasUsuario`: Sistema de alertas
- `IViagemEstatisticaRepository ViagemEstatistica`: Estatísticas de viagens
- `IVeiculoPadraoViagemRepository VeiculoPadraoViagem`: Veículo padrão
- `IRepactuacaoVeiculoRepository RepactuacaoVeiculo`: Repactuações (partial)

---

## Métodos de Persistência

### `void Save()`

**Descrição**: Persiste todas as mudanças no banco de dados

**Uso**: Síncrono, bloqueia thread até completar

---

### `Task SaveAsync()`

**Descrição**: Versão assíncrona de `Save()`

**Retorno**: `Task`

**Uso**: Assíncrono, não bloqueia thread

---

## Extensões Parciais

### `IUnitOfWork.OcorrenciaViagem.cs`

**Repositories Adicionados**:
- `IOcorrenciaViagemRepository OcorrenciaViagem`
- `IViewOcorrenciasViagemRepository ViewOcorrenciasViagem`
- `IViewOcorrenciasAbertasVeiculoRepository ViewOcorrenciasAbertasVeiculo`

---

### `IUnitOfWork.RepactuacaoVeiculo.cs`

**Repositories Adicionados**:
- `IRepactuacaoVeiculoRepository RepactuacaoVeiculo`

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

### Exemplo em Controller

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
        _unitOfWork.Veiculo.Add(veiculo);
        _unitOfWork.Save();
        return Ok();
    }
    
    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var veiculos = await _unitOfWork.ViewVeiculos.GetAllAsync(
            orderBy: q => q.OrderBy(v => v.Placa)
        );
        return Ok(veiculos);
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

**Impacto**: Documentação de referência para contrato Unit of Work

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
