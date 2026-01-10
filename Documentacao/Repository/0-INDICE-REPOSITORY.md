# Índice: Documentação de Repository

> **Última Atualização**: 08/01/2026  
> **Versão**: 1.0

---

## 📋 Status da Documentação

**Total de Arquivos**: ~207 arquivos  
**Documentados (Principais)**: 4/207  
**Padrão Documentado**: ✅ Sim

---

## ✅ Arquivos Base Documentados

- [x] [`Repository.md`](./Repository.md) - Classe base genérica de repositório
- [x] [`UnitOfWork.md`](./UnitOfWork.md) - Padrão Unit of Work (principal + extensões)
- [x] [`PADRAO-REPOSITORIES-ESPECIFICOS.md`](./PADRAO-REPOSITORIES-ESPECIFICOS.md) - Padrão dos repositories específicos
- [x] [`IRepository/IRepository.md`](./IRepository/IRepository.md) - Interface base genérica
- [x] [`IRepository/IUnitOfWork.md`](./IRepository/IUnitOfWork.md) - Interface Unit of Work (principal + extensões)

---

## 📝 Repositories Específicos

**Total**: ~200 repositories específicos seguindo o padrão documentado em `PADRAO-REPOSITORIES-ESPECIFICOS.md`

### Categorias

#### Cadastros (~40 repositories)
- CombustivelRepository, MarcaVeiculoRepository, ModeloVeiculoRepository
- VeiculoRepository, MotoristaRepository, EncarregadoRepository
- OperadorRepository, LavadorRepository
- ContratoRepository, AtaRegistroPrecosRepository
- FornecedorRepository, RequisitanteRepository
- SetorSolicitanteRepository, SetorPatrimonialRepository
- SecaoPatrimonialRepository, PatrimonioRepository
- PlacaBronzeRepository, AspNetUsersRepository, RecursoRepository
- E outros...

#### Operações (~20 repositories)
- ViagemRepository, ViagensEconomildoRepository
- AbastecimentoRepository, LavagemRepository
- ManutencaoRepository, MultaRepository
- EmpenhoRepository, NotaFiscalRepository
- EventoRepository, OcorrenciaViagemRepository
- ViagemEstatisticaRepository
- E outros...

#### Relacionamentos (~15 repositories)
- VeiculoContratoRepository, VeiculoAtaRepository
- MotoristaContratoRepository, OperadorContratoRepository
- EncarregadoContratoRepository, LavadorContratoRepository
- ItemVeiculoContratoRepository, ItemVeiculoAtaRepository
- LavadoresLavagemRepository, LotacaoMotoristaRepository
- E outros...

#### Views (~35 repositories)
- ViewAbastecimentosRepository, ViewVeiculosRepository
- ViewMotoristasRepository, ViewViagensRepository
- ViewCustosViagemRepository, ViewManutencaoRepository
- ViewMultasRepository, ViewEmpenhosRepository
- ViewFluxoEconomildoRepository, ViewLavagemRepository
- ViewEventosRepository, ViewOcorrenciaRepository
- E muitos outros...

#### Especiais (~10 repositories)
- AlertasFrotiXRepository, AlertasUsuarioRepository
- RepactuacaoContratoRepository, RepactuacaoAtaRepository
- RepactuacaoServicosRepository, RepactuacaoTerceirizacaoRepository
- RepactuacaoVeiculoRepository
- CorridasTaxiLegRepository, CorridasCanceladasTaxiLegRepository
- E outros...

---

## 📚 Documentação de Referência

Para entender como os repositories específicos funcionam, consulte:
- [`PADRAO-REPOSITORIES-ESPECIFICOS.md`](./PADRAO-REPOSITORIES-ESPECIFICOS.md) - Padrão completo
- [`Repository.md`](./Repository.md) - Métodos disponíveis na classe base
- [`IRepository/IRepository.md`](./IRepository/IRepository.md) - Contrato base

---

**Última atualização**: 08/01/2026  
**Versão**: 1.0
