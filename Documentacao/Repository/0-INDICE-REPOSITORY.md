# Índice: Documentação de Repository

> **Última Atualização**: 08/01/2026  
> **Versão**: 1.0

---

## 📋 Status da Documentação

**Total de Arquivos Repository**: ~97 arquivos  
**Total de Arquivos IRepository**: ~91 arquivos  
**Documentados**: 18/188 (9.6%)  
**Status**: ⏳ **Em Progresso**

---

## ✅ Arquivos Base Documentados

### Arquivos Principais

- [x] [`Repository.md`](./Repository.md) - Classe base genérica Repository<T>
- [x] [`IRepository/IRepository.md`](./IRepository/IRepository.md) - Interface base genérica IRepository<T>
- [x] [`UnitOfWork.md`](./UnitOfWork.md) - Orquestrador UnitOfWork (partial)
- [x] [`IRepository/IUnitOfWork.md`](./IRepository/IUnitOfWork.md) - Interface IUnitOfWork (partial)
- [x] [`UnitOfWork.OcorrenciaViagem.md`](./UnitOfWork.OcorrenciaViagem.md) - Extensão para ocorrências
- [x] [`UnitOfWork.RepactuacaoVeiculo.md`](./UnitOfWork.RepactuacaoVeiculo.md) - Extensão para repactuações
- [x] [`IRepository/IUnitOfWork.OcorrenciaViagem.md`](./IRepository/IUnitOfWork.OcorrenciaViagem.md) - Interface parcial ocorrências
- [x] [`IRepository/IUnitOfWork.RepactuacaoVeiculo.md`](./IRepository/IUnitOfWork.RepactuacaoVeiculo.md) - Interface parcial repactuações

### Repositories de Exemplo Documentados

- [x] [`VeiculoRepository.md`](./VeiculoRepository.md) - Repository de veículos
- [x] [`IRepository/IVeiculoRepository.md`](./IRepository/IVeiculoRepository.md) - Interface de veículos
- [x] [`AbastecimentoRepository.md`](./AbastecimentoRepository.md) - Repository de abastecimentos
- [x] [`IRepository/IAbastecimentoRepository.md`](./IRepository/IAbastecimentoRepository.md) - Interface de abastecimentos
- [x] [`ViagemRepository.md`](./ViagemRepository.md) - Repository de viagens
- [x] [`IRepository/IViagemRepository.md`](./IRepository/IViagemRepository.md) - Interface de viagens
- [x] [`ContratoRepository.md`](./ContratoRepository.md) - Repository de contratos
- [x] [`IRepository/IContratoRepository.md`](./IRepository/IContratoRepository.md) - Interface de contratos
- [x] [`MotoristaRepository.md`](./MotoristaRepository.md) - Repository de motoristas
- [x] [`IRepository/IMotoristaRepository.md`](./IRepository/IMotoristaRepository.md) - Interface de motoristas

---

## 📝 Repositories Pendentes de Documentação

### Repositories de Cadastros

- [ ] `AspNetUsersRepository.cs` + `IAspNetUsersRepository.cs`
- [ ] `AtaRegistroPrecosRepository.cs` + `IAtaRegistroPrecosRepository.cs`
- [ ] `CombustivelRepository.cs` + `ICombustivelRepository.cs`
- [ ] `EncarregadoRepository.cs` + `IEncarregadoRepository.cs`
- [ ] `EncarregadoContratoRepository.cs` + `IEncarregadoContratoRepository.cs`
- [ ] `EventoRepository.cs` + `IEventoRepository.cs`
- [ ] `FornecedorRepository.cs` + `IFornecedorRepository.cs`
- [ ] `LavadorRepository.cs` + `ILavadorRepository.cs`
- [ ] `LavadorContratoRepository.cs` + `ILavadorContratoRepository.cs`
- [ ] `MarcaVeiculoRepository.cs` + `IMarcaVeiculoRepository.cs`
- [ ] `ModeloVeiculoRepository.cs` + `IModeloVeiculoRepository.cs`
- [ ] `OperadorRepository.cs` + `IOperadorRepository.cs`
- [ ] `OperadorContratoRepository.cs` + `IOperadorContratoRepository.cs`
- [ ] `OrgaoAutuanteRepository.cs` + `IOrgaoAutuanteRepository.cs`
- [ ] `PlacaBronzeRepository.cs` + `IPlacaBronzeRepository.cs`
- [ ] `RecursoRepository.cs` + `IRecursoRepository.cs`
- [ ] `RequisitanteRepository.cs` + `IRequisitanteRepository.cs`
- [ ] `SecaoPatrimonialRepository.cs` + `ISecaoPatrimonialRepository.cs`
- [ ] `SetorPatrimonialRepository.cs` + `ISetorPatrimonialRepository.cs`
- [ ] `SetorSolicitanteRepository.cs` + `ISetorSolicitanteRepository.cs`
- [ ] `TipoMultaRepository.cs` + `ITipoMultaRepository.cs`
- [ ] `UnidadeRepository.cs` + `IUnidadeRepository.cs`

### Repositories de Operações

- [ ] `LavagemRepository.cs` + `ILavagemRepository.cs`
- [ ] `LavadoresLavagemRepository.cs` + `ILavadoresLavagemRepository.cs`
- [ ] `ManutencaoRepository.cs` + `IManutencaoRepository.cs`
- [ ] `MultaRepository.cs` + `IMultaRepository.cs`
- [ ] `NotaFiscalRepository.cs` + `INotaFiscalRepository.cs`
- [ ] `OcorrenciaViagemRepository.cs` + `IOcorrenciaViagemRepository.cs`
- [ ] `ViagensEconomildoRepository.cs` + `IViagensEconomildoRepository.cs`
- [ ] `ViagemEstatisticaRepository.cs` + `IViagemEstatisticaRepository.cs`
- [ ] `VeiculoPadraoViagemRepository.cs` + `IVeiculoPadraoViagemRepository.cs`

### Repositories de Relacionamentos

- [ ] `ItemVeiculoAtaRepository.cs` + `IItemVeiculoAtaRepository.cs`
- [ ] `ItemVeiculoContratoRepository.cs` + `IItemVeiculoContratoRepository.cs`
- [ ] `LotacaoMotoristaRepository.cs` + `ILotacaoMotoristaRepository.cs`
- [ ] `MotoristaContratoRepository.cs` + `IMotoristaContratoRepository.cs`
- [ ] `VeiculoAtaRepository.cs` + `IVeiculoAtaRepository.cs`
- [ ] `VeiculoContratoRepository.cs` + `IVeiculoContratoRepository.cs`

### Repositories de Financeiro

- [ ] `EmpenhoRepository.cs` + `IEmpenhoRepository.cs`
- [ ] `EmpenhoMultaRepository.cs` + `IEmpenhoMultaRepository.cs`
- [ ] `MovimentacaoEmpenhoRepository.cs` + `IMovimentacaoEmpenhoRepository.cs`
- [ ] `MovimentacaoEmpenhoMultaRepository.cs` + `IMovimentacaoEmpenhoMultaRepository.cs`
- [ ] `CustoMensalItensContratoRepository.cs` + `ICustoMensalItensContratoRepository.cs`
- [ ] `MediaCombustivelRepository.cs` + `IMediaCombustivelRepository.cs`
- [ ] `RegistroCupomAbastecimentoRepository.cs` + `IRegistroCupomAbastecimentoRepository.cs`

### Repositories de Repactuações

- [ ] `RepactuacaoAtaRepository.cs` + `IRepactuacaoAtaRepository.cs`
- [ ] `RepactuacaoContratoRepository.cs` + `IRepactuacaoContratoRepository.cs`
- [ ] `RepactuacaoServicosRepository.cs` + `IRepactuacaoServicosRepository.cs`
- [ ] `RepactuacaoTerceirizacaoRepository.cs` + `IRepactuacaoTerceirizacaoRepository.cs`
- [ ] `RepactuacaoVeiculoRepository.cs` + `IRepactuacaoVeiculoRepository.cs`

### Repositories de Patrimônio

- [ ] `PatrimonioRepository.cs` + `IPatrimonioRepository.cs`
- [ ] `MovimentacaoPatrimonioRepository.cs` + `IMovimentacaoPatrimonioRepository.cs`

### Repositories de Alertas

- [ ] `AlertasFrotiXRepository.cs` + `IAlertasFrotiXRepository.cs`
- [ ] `AlertasUsuarioRepository.cs` + `IAlertasUsuarioRepository.cs`

### Repositories de Controle de Acesso

- [ ] `ControleAcessoRepository.cs` + `IControleAcessoRepository.cs`

### Repositories de Táxi Legal

- [ ] `CorridasTaxiLegRepository.cs` + `ICorridasTaxiLegRepository.cs`
- [ ] `CorridasTaxiLegCanceladasRepository.cs` + `ICorridasTaxiLegCanceladasRepository.cs`

### Repositories de Manutenção

- [ ] `ItensManutencaoRepository.cs` + `IItensManutencaoRepository.cs`

### Repositories de Views

- [ ] `ViewAbastecimentosRepository.cs` + `IViewAbastecimentosRepository.cs`
- [ ] `ViewAtaFornecedorRepository.cs` + `IViewAtaFornecedorRepository.cs`
- [ ] `ViewContratoFornecedorRepository.cs` + `IViewContratoFornecedorRepository.cs`
- [ ] `ViewControleAcessoRepository.cs` + `IViewControleAcessoRepository.cs`
- [ ] `ViewCustosViagemRepository.cs` + `IViewCustosViagemRepository.cs`
- [ ] `ViewEmpenhoMultaRepository.cs` + `IViewEmpenhoMultaRepository.cs`
- [ ] `ViewEmpenhosRepository.cs` + `IViewEmpenhosRepository.cs`
- [ ] `ViewEventosRepository.cs` + `IViewEventosRepository.cs`
- [ ] `ViewExisteItemContratoRepository.cs` + `IViewExisteItemContratoRepository.cs`
- [ ] `ViewFluxoEconomildo.cs` + `IViewFluxoEconomildoRepository.cs`
- [ ] `ViewFluxoEconomildoData.cs` + `IViewFluxoEconomildoDataRepository.cs`
- [ ] `ViewGlosaRepository.cs` + `IViewGlosaRepository.cs`
- [ ] `ViewItensManutencaoRepository.cs` + `IViewItensManutencaoRepository.cs`
- [ ] `ViewLavagemRepository.cs` + `IViewLavagemRepository.cs`
- [ ] `ViewLotacaoMotoristaRepository.cs` + `IViewLotacaoMotoristaRepository.cs`
- [ ] `ViewLotacoesRepository.cs` + `IViewLotacoesRepository.cs`
- [ ] `ViewManutencaoRepository.cs` + `IViewManutencaoRepository.cs`
- [ ] `ViewMediaConsumoRepository.cs` + `IViewMediaConsumoRepository.cs`
- [ ] `ViewMotoristaFluxo.cs` + `IViewMotoristaFluxoRepository.cs`
- [ ] `ViewMotoristasRepository.cs` + `IViewMotoristasRepository.cs`
- [ ] `ViewMotoristasViagemRepository.cs` + `IViewMotoristasViagemRepository.cs`
- [ ] `ViewMultasRepository.cs` + `IViewMultasRepository.cs`
- [ ] `ViewNoFichaVistoriaRepository.cs` + `IViewNoFichaVistoriaRepository.cs`
- [ ] `ViewOcorrencia.cs` + `IViewOcorrenciaRepository.cs`
- [ ] `ViewOcorrenciasAbertasVeiculoRepository.cs` + `IViewOcorrenciasAbertasVeiculoRepository.cs`
- [ ] `ViewOcorrenciasViagemRepository.cs` + `IViewOcorrenciasViagemRepository.cs`
- [ ] `ViewPatrimonioConferenciaRepository.cs` + `IViewPatrimonioConferenciaRepository.cs`
- [ ] `ViewPendenciasManutencaoRepository.cs` + `IViewPendenciasManutencaoRepository.cs`
- [ ] `ViewProcuraFichaRepository.cs` + `IViewProcuraFichaRepository.cs`
- [ ] `ViewRequisitantesRepository.cs` + `IViewRequisitantesRepository.cs`
- [ ] `ViewSetoresRepository.cs` + `IViewSetoresRepository.cs`
- [ ] `ViewVeiculosManutencaoRepository.cs` + `IViewVeiculosManutencaoRepository.cs`
- [ ] `ViewVeiculosManutencaoReservaRepository.cs` + `IViewVeiculosManutencaoReservaRepository.cs`
- [ ] `ViewVeiculosRepository.cs` + `IViewVeiculosRepository.cs`
- [ ] `ViewViagensAgendaRepository.cs` + `IViewViagensAgendaRepository.cs`
- [ ] `ViewViagensAgendaTodosMesesRepository.cs` + `IViewViagensAgendaTodosMesesRepository.cs`
- [ ] `ViewViagensRepository.cs` + `IViewViagensRepository.cs`

---

## 📊 Estatísticas por Categoria

| Categoria | Total | Documentados | Pendentes |
|-----------|-------|--------------|-----------|
| Arquivos Base | 8 | 8 | 0 |
| Repositories de Exemplo | 10 | 10 | 0 |
| Cadastros | ~44 | 0 | ~44 |
| Operações | ~18 | 0 | ~18 |
| Relacionamentos | ~12 | 0 | ~12 |
| Financeiro | ~14 | 0 | ~14 |
| Repactuações | ~10 | 0 | ~10 |
| Patrimônio | ~4 | 0 | ~4 |
| Alertas | ~4 | 0 | ~4 |
| Controle de Acesso | ~2 | 0 | ~2 |
| Táxi Legal | ~4 | 0 | ~4 |
| Manutenção | ~2 | 0 | ~2 |
| Views | ~60 | 0 | ~60 |
| **TOTAL** | **~188** | **18** | **~170** |

---

## 🔄 Próximos Passos

1. ✅ Documentar arquivos base (Repository, IRepository, UnitOfWork, IUnitOfWork)
2. ✅ Documentar repositories de exemplo (Veiculo, Abastecimento, Viagem, Contrato, Motorista)
3. ⏳ Documentar repositories de cadastros principais
4. ⏳ Documentar repositories de operações principais
5. ⏳ Documentar repositories de views principais
6. ⏳ Documentar repositories restantes

---

**Última atualização**: 08/01/2026  
**Versão**: 1.0
