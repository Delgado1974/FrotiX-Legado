using FrotiX.Data;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using System.Threading.Tasks;

namespace FrotiX.Repository
{
    public partial class UnitOfWork : IUnitOfWork
    {
        private readonly FrotiXDbContext _db;
        private ViagemEstatisticaRepository _viagemEstatisticaRepository;
        private VeiculoPadraoViagemRepository _veiculoPadraoViagemRepository;

        public UnitOfWork(FrotiXDbContext db)
        {
            _db = db;
            Unidade = new UnidadeRepository(_db);
            Combustivel = new CombustivelRepository(_db);
            MarcaVeiculo = new MarcaVeiculoRepository(_db);
            ModeloVeiculo = new ModeloVeiculoRepository(_db);
            Veiculo = new VeiculoRepository(_db);
            Fornecedor = new FornecedorRepository(_db);
            Contrato = new ContratoRepository(_db);
            AtaRegistroPrecos = new AtaRegistroPrecosRepository(_db);
            VeiculoContrato = new VeiculoContratoRepository(_db);
            VeiculoAta = new VeiculoAtaRepository(_db);
            AspNetUsers = new AspNetUsersRepository(_db);
            PlacaBronze = new PlacaBronzeRepository(_db);
            Motorista = new MotoristaRepository(_db);
            MotoristaContrato = new MotoristaContratoRepository(_db);
            SetorSolicitante = new SetorSolicitanteRepository(_db);
            Requisitante = new RequisitanteRepository(_db);
            Operador = new OperadorRepository(_db);
            OperadorContrato = new OperadorContratoRepository(_db);
            Lavador = new LavadorRepository(_db);
            LavadorContrato = new LavadorContratoRepository(_db);
            Empenho = new EmpenhoRepository(_db);
            MovimentacaoEmpenho = new MovimentacaoEmpenhoRepository(_db);
            NotaFiscal = new NotaFiscalRepository(_db);
            Abastecimento = new AbastecimentoRepository(_db);
            Viagem = new ViagemRepository(_db);
            MediaCombustivel = new MediaCombustivelRepository(_db);
            TipoMulta = new TipoMultaRepository(_db);
            OrgaoAutuante = new OrgaoAutuanteRepository(_db);
            CustoMensalItensContrato = new CustoMensalItensContratoRepository(_db);
            RepactuacaoContrato = new RepactuacaoContratoRepository(_db);
            ItemVeiculoContrato = new ItemVeiculoContratoRepository(_db);
            RepactuacaoAta = new RepactuacaoAtaRepository(_db);
            ItemVeiculoAta = new ItemVeiculoAtaRepository(_db);
            EmpenhoMulta = new EmpenhoMultaRepository(_db);
            Multa = new MultaRepository(_db);
            RegistroCupomAbastecimento = new RegistroCupomAbastecimentoRepository(_db);
            Manutencao = new ManutencaoRepository(_db);
            ItensManutencao = new ItensManutencaoRepository(_db);
            Lavagem = new LavagemRepository(_db);
            LavadoresLavagem = new LavadoresLavagemRepository(_db);
            CorridasTaxiLeg = new CorridasTaxiLegRepository(_db);
            CorridasCanceladasTaxiLeg = new CorridasCanceladasTaxiLegRepository(_db);
            MovimentacaoEmpenhoMulta = new MovimentacaoEmpenhoMultaRepository(_db);
            ViagensEconomildo = new ViagensEconomildoRepository(_db);
            Evento = new EventoRepository(_db);
            LotacaoMotorista = new LotacaoMotoristaRepository(_db);
            RepactuacaoTerceirizacao = new RepactuacaoTerceirizacaoRepository(_db);
            RepactuacaoServicos = new RepactuacaoServicosRepository(_db);
            Recurso = new RecursoRepository(_db);
            ControleAcesso = new ControleAcessoRepository(_db);

            Patrimonio = new PatrimonioRepository(_db);
            SetorPatrimonial = new SetorPatrimonialRepository(_db);
            SecaoPatrimonial = new SecaoPatrimonialRepository(_db);
            MovimentacaoPatrimonio = new MovimentacaoPatrimonioRepository(_db);

            ViewEmpenhos = new ViewEmpenhosRepository(_db);
            ViewMotoristas = new ViewMotoristasRepository(_db);
            ViewAbastecimentos = new ViewAbastecimentosRepository(_db);
            ViewVeiculos = new ViewVeiculosRepository(_db);
            ViewMediaConsumo = new ViewMediaConsumoRepository(_db);
            ViewViagens = new ViewViagensRepository(_db);
            ViewSetores = new ViewSetoresRepository(_db);
            ViewRequisitantes = new ViewRequisitantesRepository(_db);
            ViewCustosViagem = new ViewCustosViagemRepository(_db);
            ViewViagensAgenda = new ViewViagensAgendaRepository(_db);
            viewMultas = new viewMultasRepository(_db);
            ViewContratoFornecedor = new ViewContratoFornecedorRepository(_db);
            ViewAtaFornecedor = new ViewAtaFornecedorRepository(_db);
            ViewProcuraFicha = new ViewProcuraFichaRepository(_db);
            ViewManutencao = new ViewManutencaoRepository(_db);
            ViewPendenciasManutencao = new ViewPendenciasManutencaoRepository(_db);
            ViewItensManutencao = new ViewItensManutencaoRepository(_db);
            ViewOcorrencia = new ViewOcorrenciaRepository(_db);
            ViewViagensAgendaTodosMeses = new ViewViagensAgendaTodosMesesRepository(_db);
            ViewLavagem = new ViewLavagemRepository(_db);
            ViewEmpenhoMulta = new ViewEmpenhoMultaRepository(_db);
            ViewFluxoEconomildo = new ViewFluxoEconomildoRepository(_db);
            ViewFluxoEconomildoData = new ViewFluxoEconomildoDataRepository(_db);
            ViewMotoristaFluxo = new ViewMotoristaFluxoRepository(_db);
            ViewLotacoes = new ViewLotacoesRepository(_db);
            ViewLotacaoMotorista = new ViewLotacaoMotoristaRepository(_db);
            ViewNoFichaVistoria = new ViewNoFichaVistoriaRepository(_db);
            ViewExisteItemContrato = new ViewExisteItemContratoRepository(_db);
            ViewEventos = new ViewEventosRepository(_db);
            ViewControleAcesso = new ViewControleAcessoRepository(_db);
            ViewMotoristasViagem = new ViewMotoristasViagemRepository(_db);
            ViewVeiculosManutencao = new ViewVeiculosManutencaoRepository(_db);
            ViewVeiculosManutencaoReserva = new ViewVeiculosManutencaoReservaRepository(_db);
            ViewGlosa = new ViewGlosaRepository(_db);
            ViewPatrimonioConferencia = new ViewPatrimonioConferenciaRepository(_db);

            // Inicialização dos repositórios do sistema de Alertas
            AlertasFrotiX = new AlertasFrotiXRepository(_db);
            AlertasUsuario = new AlertasUsuarioRepository(_db);

            // Repositório genérico para Pendências de Abastecimento
            AbastecimentoPendente = new Repository<AbastecimentoPendente>(_db);
        }

        // Repositórios para o sistema de Alertas
        public IAlertasFrotiXRepository AlertasFrotiX
        {
            get; private set;
        }

        public IAlertasUsuarioRepository AlertasUsuario
        {
            get; private set;
        }

        public IAbastecimentoRepository Abastecimento
        {
            get; private set;
        }

        public IRepository<AbastecimentoPendente> AbastecimentoPendente
        {
            get; private set;
        }

        public IAspNetUsersRepository AspNetUsers
        {
            get; private set;
        }

        public IAtaRegistroPrecosRepository AtaRegistroPrecos
        {
            get;
        }

        public ICombustivelRepository Combustivel
        {
            get; private set;
        }

        public IContratoRepository Contrato
        {
            get; private set;
        }

        public IControleAcessoRepository ControleAcesso
        {
            get; private set;
        }

        public ICorridasCanceladasTaxiLegRepository CorridasCanceladasTaxiLeg
        {
            get; private set;
        }

        public ICorridasTaxiLegRepository CorridasTaxiLeg
        {
            get; private set;
        }

        public ICustoMensalItensContratoRepository CustoMensalItensContrato
        {
            get; private set;
        }

        public IEmpenhoRepository Empenho
        {
            get; private set;
        }

        public IEmpenhoMultaRepository EmpenhoMulta
        {
            get; private set;
        }

        public IEventoRepository Evento
        {
            get; private set;
        }

        public IFornecedorRepository Fornecedor
        {
            get; private set;
        }

        public IItemVeiculoAtaRepository ItemVeiculoAta
        {
            get; private set;
        }

        public IItemVeiculoContratoRepository ItemVeiculoContrato
        {
            get; private set;
        }

        public IItensManutencaoRepository ItensManutencao
        {
            get; private set;
        }

        public ILavadorRepository Lavador
        {
            get; private set;
        }

        public ILavadorContratoRepository LavadorContrato
        {
            get; private set;
        }

        public ILavadoresLavagemRepository LavadoresLavagem
        {
            get; private set;
        }

        public ILavagemRepository Lavagem
        {
            get; private set;
        }

        public ILotacaoMotoristaRepository LotacaoMotorista
        {
            get; private set;
        }

        public IManutencaoRepository Manutencao
        {
            get; private set;
        }

        public IMarcaVeiculoRepository MarcaVeiculo
        {
            get; private set;
        }

        public IMediaCombustivelRepository MediaCombustivel
        {
            get; private set;
        }

        public IModeloVeiculoRepository ModeloVeiculo
        {
            get; private set;
        }

        public IMotoristaRepository Motorista
        {
            get; private set;
        }

        public IMotoristaContratoRepository MotoristaContrato
        {
            get; private set;
        }

        public IMovimentacaoEmpenhoRepository MovimentacaoEmpenho
        {
            get; private set;
        }

        public IMovimentacaoEmpenhoMultaRepository MovimentacaoEmpenhoMulta
        {
            get; private set;
        }

        public IMovimentacaoPatrimonioRepository MovimentacaoPatrimonio
        {
            get; private set;
        }

        public IMultaRepository Multa
        {
            get; private set;
        }

        public INotaFiscalRepository NotaFiscal
        {
            get; private set;
        }

        public IOperadorRepository Operador
        {
            get; private set;
        }

        public IOperadorContratoRepository OperadorContrato
        {
            get; private set;
        }

        public IOrgaoAutuanteRepository OrgaoAutuante
        {
            get; private set;
        }

        public IPatrimonioRepository Patrimonio
        {
            get; private set;
        }

        public IPlacaBronzeRepository PlacaBronze
        {
            get; private set;
        }

        public IRecursoRepository Recurso
        {
            get; private set;
        }

        public IRegistroCupomAbastecimentoRepository RegistroCupomAbastecimento
        {
            get; private set;
        }

        public IRepactuacaoAtaRepository RepactuacaoAta
        {
            get; private set;
        }

        public IRepactuacaoContratoRepository RepactuacaoContrato
        {
            get; private set;
        }

        public IRepactuacaoServicosRepository RepactuacaoServicos
        {
            get; private set;
        }

        public IRepactuacaoTerceirizacaoRepository RepactuacaoTerceirizacao
        {
            get; private set;
        }

        public IRequisitanteRepository Requisitante
        {
            get; private set;
        }

        public ISecaoPatrimonialRepository SecaoPatrimonial
        {
            get; private set;
        }

        public ISetorPatrimonialRepository SetorPatrimonial
        {
            get; private set;
        }

        public ISetorSolicitanteRepository SetorSolicitante
        {
            get; private set;
        }

        public ITipoMultaRepository TipoMulta
        {
            get; private set;
        }

        public IUnidadeRepository Unidade
        {
            get; private set;
        }

        public IVeiculoRepository Veiculo
        {
            get; private set;
        }

        public IVeiculoAtaRepository VeiculoAta
        {
            get;
        }

        public IVeiculoContratoRepository VeiculoContrato
        {
            get; private set;
        }

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

        public IViagemRepository Viagem
        {
            get; private set;
        }

        public IViagensEconomildoRepository ViagensEconomildo
        {
            get; private set;
        }

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

        public IViewAbastecimentosRepository ViewAbastecimentos
        {
            get; private set;
        }

        public IViewAtaFornecedorRepository ViewAtaFornecedor
        {
            get; private set;
        }

        public IViewContratoFornecedorRepository ViewContratoFornecedor
        {
            get; private set;
        }

        public IViewControleAcessoRepository ViewControleAcesso
        {
            get; private set;
        }

        public IViewCustosViagemRepository ViewCustosViagem
        {
            get; private set;
        }

        public IViewEmpenhoMultaRepository ViewEmpenhoMulta
        {
            get; private set;
        }

        public IViewEmpenhosRepository ViewEmpenhos
        {
            get; private set;
        }

        public IViewEventosRepository ViewEventos
        {
            get; private set;
        }

        public IViewExisteItemContratoRepository ViewExisteItemContrato
        {
            get; private set;
        }

        public IViewFluxoEconomildoRepository ViewFluxoEconomildo
        {
            get; private set;
        }

        public IViewFluxoEconomildoDataRepository ViewFluxoEconomildoData
        {
            get; private set;
        }

        public IViewItensManutencaoRepository ViewItensManutencao
        {
            get; private set;
        }

        public IViewLavagemRepository ViewLavagem
        {
            get; private set;
        }

        public IViewLotacaoMotoristaRepository ViewLotacaoMotorista
        {
            get; private set;
        }

        public IViewLotacoesRepository ViewLotacoes
        {
            get; private set;
        }

        public IViewManutencaoRepository ViewManutencao
        {
            get; private set;
        }

        public IViewMediaConsumoRepository ViewMediaConsumo
        {
            get; private set;
        }

        public IViewMotoristaFluxoRepository ViewMotoristaFluxo
        {
            get; private set;
        }

        public IViewMotoristasRepository ViewMotoristas
        {
            get; private set;
        }

        public IViewMotoristasViagemRepository ViewMotoristasViagem
        {
            get; private set;
        }

        public IviewMultasRepository viewMultas
        {
            get; private set;
        }

        public IViewNoFichaVistoriaRepository ViewNoFichaVistoria
        {
            get; private set;
        }

        public IViewOcorrenciaRepository ViewOcorrencia
        {
            get; private set;
        }

        public IViewPatrimonioConferenciaRepository ViewPatrimonioConferencia
        {
            get; private set;
        }

        public IViewPendenciasManutencaoRepository ViewPendenciasManutencao
        {
            get; private set;
        }

        public IViewProcuraFichaRepository ViewProcuraFicha
        {
            get; private set;
        }

        public IViewRequisitantesRepository ViewRequisitantes
        {
            get; private set;
        }

        public IViewSetoresRepository ViewSetores
        {
            get; private set;
        }

        public IViewVeiculosRepository ViewVeiculos
        {
            get; private set;
        }

        public IViewVeiculosManutencaoRepository ViewVeiculosManutencao
        {
            get; private set;
        }

        public IViewVeiculosManutencaoReservaRepository ViewVeiculosManutencaoReserva
        {
            get; private set;
        }

        public IViewViagensRepository ViewViagens
        {
            get; private set;
        }

        public IViewViagensAgendaRepository ViewViagensAgenda
        {
            get; private set;
        }

        public IViewViagensAgendaTodosMesesRepository ViewViagensAgendaTodosMeses
        {
            get; private set;
        }

        public IViewGlosaRepository ViewGlosa
        {
            get; private set;
        }

        public void Dispose()
        {
            _db.Dispose();
        }

        public void Save()
        {
            _db.SaveChanges();
        }

        public async Task SaveAsync()
        {
            await _db.SaveChangesAsync();
        }
    }
}
