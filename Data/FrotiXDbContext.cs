using FrotiX.Models;
using FrotiX.Models.Cadastros;
using FrotiX.Models.Estatisticas;
using FrotiX.Models.Views;

using Microsoft.EntityFrameworkCore;

namespace FrotiX.Data
{
    public partial class FrotiXDbContext : DbContext
    {
        public FrotiXDbContext(DbContextOptions<FrotiXDbContext> options)
            : base(options)
        {
            Database.SetCommandTimeout(9000);
        }

        public DbSet<AbastecimentoPendente> AbastecimentoPendente { get; set; }

        public DbSet<Abastecimento> Abastecimento
        {
            get; set;
        }

        public DbSet<AlertasFrotiX> AlertasFrotiX
        {
            get; set;
        }

        public DbSet<AlertasUsuario> AlertasUsuario
        {
            get; set;
        }

        public DbSet<AspNetUsers> AspNetUsers
        {
            get; set;
        }

        public DbSet<AtaRegistroPrecos> AtaRegistroPrecos
        {
            get; set;
        }

        public DbSet<Combustivel> Combustivel
        {
            get; set;
        }

        public DbSet<Contrato> Contrato
        {
            get; set;
        }

        public DbSet<ControleAcesso> ControleAcesso
        {
            get; set;
        }

        public DbSet<CorridasCanceladasTaxiLeg> CorridasCanceladasTaxiLeg
        {
            get; set;
        }

        public DbSet<CorridasTaxiLeg> CorridasTaxiLeg
        {
            get; set;
        }

        public DbSet<CustoMensalItensContrato> CustoMensalItensContrato
        {
            get; set;
        }

        public DbSet<Empenho> Empenho
        {
            get; set;
        }

        public DbSet<EmpenhoMulta> EmpenhoMulta
        {
            get; set;
        }

        // ============================================================
        // ENCARREGADO - NOVO
        // ============================================================
        public DbSet<Encarregado> Encarregado
        {
            get; set;
        }

        public DbSet<EncarregadoContrato> EncarregadoContrato
        {
            get; set;
        }

        public DbSet<Evento> Evento
        {
            get; set;
        }

        public DbSet<Fornecedor> Fornecedor
        {
            get; set;
        }

        public DbSet<ItemVeiculoAta> ItemVeiculoAta
        {
            get; set;
        }

        public DbSet<ItemVeiculoContrato> ItemVeiculoContrato
        {
            get; set;
        }

        public DbSet<ItensManutencao> ItensManutencao
        {
            get; set;
        }

        public DbSet<Lavador> Lavador
        {
            get; set;
        }

        public DbSet<LavadorContrato> LavadorContrato
        {
            get; set;
        }

        public DbSet<LavadoresLavagem> LavadoresLavagem
        {
            get; set;
        }

        public DbSet<Lavagem> Lavagem
        {
            get; set;
        }

        public DbSet<LotacaoMotorista> LotacaoMotorista
        {
            get; set;
        }

        public DbSet<Manutencao> Manutencao
        {
            get; set;
        }

        public DbSet<MarcaVeiculo> MarcaVeiculo
        {
            get; set;
        }

        public DbSet<MediaCombustivel> MediaCombustivel
        {
            get; set;
        }

        public DbSet<ModeloVeiculo> ModeloVeiculo
        {
            get; set;
        }

        public DbSet<Motorista> Motorista
        {
            get; set;
        }

        public DbSet<MotoristaContrato> MotoristaContrato
        {
            get; set;
        }

        public DbSet<MovimentacaoEmpenho> MovimentacaoEmpenho
        {
            get; set;
        }

        public DbSet<MovimentacaoEmpenhoMulta> MovimentacaoEmpenhoMulta
        {
            get; set;
        }

        public DbSet<MovimentacaoPatrimonio> MovimentacaoPatrimonio
        {
            get; set;
        }

        public DbSet<Multa> Multa
        {
            get; set;
        }

        public DbSet<NotaFiscal> NotaFiscal
        {
            get; set;
        }

        public DbSet<Operador> Operador
        {
            get; set;
        }

        public DbSet<OperadorContrato> OperadorContrato
        {
            get; set;
        }

        public DbSet<OrgaoAutuante> OrgaoAutuante
        {
            get; set;
        }

        public DbSet<Patrimonio> Patrimonio
        {
            get; set;
        }

        public DbSet<PlacaBronze> PlacaBronze
        {
            get; set;
        }

        public DbSet<Recurso> Recurso
        {
            get; set;
        }

        public DbSet<RegistroCupomAbastecimento> RegistroCupomAbastecimento
        {
            get; set;
        }

        public DbSet<RepactuacaoAta> RepactuacaoAta
        {
            get; set;
        }

        public DbSet<RepactuacaoContrato> RepactuacaoContrato
        {
            get; set;
        }

        public DbSet<RepactuacaoServicos> RepactuacaoServicos
        {
            get; set;
        }

        public DbSet<RepactuacaoTerceirizacao> RepactuacaoTerceirizacao
        {
            get; set;
        }

        public DbSet<Requisitante> Requisitante
        {
            get; set;
        }

        public DbSet<SecaoPatrimonial> SecaoPatrimonial
        {
            get; set;
        }

        public DbSet<SetorPatrimonial> SetorPatrimonial
        {
            get; set;
        }

        public DbSet<SetorSolicitante> SetorSolicitante
        {
            get; set;
        }

        public DbSet<TipoMulta> TipoMulta
        {
            get; set;
        }

        public DbSet<Unidade> Unidade
        {
            get; set;
        }

        public DbSet<Veiculo> Veiculo
        {
            get; set;
        }

        public DbSet<VeiculoAta> VeiculoAta
        {
            get; set;
        }

        public DbSet<VeiculoContrato> VeiculoContrato
        {
            get; set;
        }

        public DbSet<VeiculoPadraoViagem> VeiculoPadraoViagem
        {
            get; set;
        }

        public DbSet<Viagem> Viagem
        {
            get; set;
        }

        public DbSet<ViagensEconomildo> ViagensEconomildo
        {
            get; set;
        }

        public DbSet<ViagemEstatistica> ViagemEstatistica
        {
            get; set;
        }

        public DbSet<ViewAbastecimentos> ViewAbastecimentos
        {
            get; set;
        }

        public DbSet<ViewAtaFornecedor> ViewAtaFornecedor
        {
            get; set;
        }

        public DbSet<ViewContratoFornecedor> ViewContratoFornecedor
        {
            get; set;
        }

        public DbSet<ViewControleAcesso> ViewControleAcesso
        {
            get; set;
        }

        public DbSet<ViewCustosViagem> ViewCustosViagem
        {
            get; set;
        }

        public DbSet<ViewEmpenhoMulta> ViewEmpenhoMulta
        {
            get; set;
        }

        public DbSet<ViewEmpenhos> ViewEmpenhos
        {
            get; set;
        }

        public DbSet<ViewEventos> ViewEventos
        {
            get; set;
        }

        public DbSet<ViewExisteItemContrato> ViewExisteItemContrato
        {
            get; set;
        }

        public DbSet<ViewFluxoEconomildo> ViewFluxoEconomildo
        {
            get; set;
        }

        public DbSet<ViewFluxoEconomildoData> ViewFluxoEconomildoData
        {
            get; set;
        }

        public DbSet<ViewItensManutencao> ViewItensManutencao
        {
            get; set;
        }

        public DbSet<ViewLavagem> ViewLavagem
        {
            get; set;
        }

        public DbSet<ViewLotacaoMotorista> ViewLotacaoMotorista
        {
            get; set;
        }

        public DbSet<ViewLotacoes> ViewLotacoes
        {
            get; set;
        }

        public DbSet<ViewManutencao> ViewManutencao
        {
            get; set;
        }

        public DbSet<ViewMediaConsumo> ViewMediaConsumo
        {
            get; set;
        }

        public DbSet<ViewMotoristaFluxo> ViewMotoristaFluxo
        {
            get; set;
        }

        public DbSet<ViewMotoristas> ViewMotoristas
        {
            get; set;
        }

        public DbSet<ViewMotoristasViagem> ViewMotoristasViagem
        {
            get; set;
        }

        public DbSet<ViewMultas> viewMultas
        {
            get; set;
        }

        public DbSet<ViewNoFichaVistoria> ViewNoFichaVistoria
        {
            get; set;
        }

        public DbSet<ViewOcorrencia> ViewOcorrencia
        {
            get; set;
        }

        public DbSet<ViewPatrimonioConferencia> ViewPatrimonioConferencia
        {
            get; set;
        }

        public DbSet<ViewPendenciasManutencao> ViewPendenciasManutencao
        {
            get; set;
        }

        public DbSet<ViewProcuraFicha> ViewProcuraFicha
        {
            get; set;
        }

        public DbSet<ViewRequisitantes> ViewRequisitantes
        {
            get; set;
        }

        public DbSet<ViewSetores> ViewSetores
        {
            get; set;
        }

        public DbSet<ViewVeiculos> ViewVeiculos
        {
            get; set;
        }

        public DbSet<ViewVeiculosManutencao> ViewVeiculosManutencao
        {
            get; set;
        }

        public DbSet<ViewVeiculosManutencaoReserva> ViewVeiculosManutencaoReserva
        {
            get; set;
        }

        public DbSet<ViewViagens> ViewViagens
        {
            get; set;
        }

        public DbSet<ViewViagensAgenda> ViewViagensAgenda
        {
            get; set;
        }

        public DbSet<ViewViagensAgendaTodosMeses> ViewViagensAgendaTodosMeses
        {
            get; set;
        }

        public DbSet<ViewGlosa> ViewGlosa
        {
            get; set;
        }

        // ================================================================
        // TABELAS ESTATÍSTICAS - Dashboard Motoristas
        // ================================================================
        public DbSet<EstatisticaMotoristasMensal> EstatisticaMotoristasMensal { get; set; }
        public DbSet<EstatisticaGeralMensal> EstatisticaGeralMensal { get; set; }
        public DbSet<RankingMotoristasMensal> RankingMotoristasMensal { get; set; }
        public DbSet<HeatmapViagensMensal> HeatmapViagensMensal { get; set; }
        public DbSet<EvolucaoViagensDiaria> EvolucaoViagensDiaria { get; set; }

        // ================================================================
        // TABELAS ESTATÍSTICAS - Dashboard Abastecimentos
        // ================================================================
        public DbSet<EstatisticaAbastecimentoMensal> EstatisticaAbastecimentoMensal { get; set; }
        public DbSet<EstatisticaAbastecimentoCombustivel> EstatisticaAbastecimentoCombustivel { get; set; }
        public DbSet<EstatisticaAbastecimentoCategoria> EstatisticaAbastecimentoCategoria { get; set; }
        public DbSet<EstatisticaAbastecimentoTipoVeiculo> EstatisticaAbastecimentoTipoVeiculo { get; set; }
        public DbSet<EstatisticaAbastecimentoVeiculo> EstatisticaAbastecimentoVeiculo { get; set; }
        public DbSet<EstatisticaAbastecimentoVeiculoMensal> EstatisticaAbastecimentoVeiculoMensal { get; set; }
        public DbSet<HeatmapAbastecimentoMensal> HeatmapAbastecimentoMensal { get; set; }
        public DbSet<AnosDisponiveisAbastecimento> AnosDisponiveisAbastecimento { get; set; }

        // Recurso para tabelas com múltiplas chaves primárias
        //====================================================
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // ================================================================
            // CONFIGURAÇÃO DE TABELAS COM TRIGGERS
            // ================================================================
            // IMPORTANTE: Tabelas com triggers DEVEM ter:
            //   1. HasTrigger("nome_do_trigger") - declara o trigger
            //   2. UseSqlOutputClause(false) - CRÍTICO para evitar erro:
            //      "A tabela de destino da instrução DML não pode ter
            //       gatilhos habilitados se a instrução contém uma
            //       cláusula OUTPUT sem cláusula INTO"
            // ================================================================

            // Motorista - tem trigger trg_Motorista_FillNulls_OnChange
            modelBuilder.Entity<Motorista>(entity =>
            {
                entity.ToTable(tb =>
                {
                    tb.HasTrigger("trg_Motorista_FillNulls_OnChange");
                    tb.UseSqlOutputClause(false); // CRÍTICO: evita erro OUTPUT com trigger
                });
            });

            // Viagem - tem trigger tr_Viagem_CalculaCustos
            modelBuilder.Entity<Viagem>(entity =>
            {
                entity.ToTable(tb =>
                {
                    tb.HasTrigger("tr_Viagem_CalculaCustos");
                    tb.UseSqlOutputClause(false); // CRÍTICO: evita erro OUTPUT com trigger
                });
            });

            // Abastecimento - tem trigger(s) que causam erro com OUTPUT clause
            modelBuilder.Entity<Abastecimento>(entity =>
            {
                entity.ToTable(tb =>
                {
                    tb.HasTrigger("trg_Abastecimento_AtualizarEstatisticas");
                    tb.UseSqlOutputClause(false); // CRÍTICO: evita erro OUTPUT com trigger
                });
            });

            // AbastecimentoPendente - desabilita OUTPUT clause por segurança
            modelBuilder.Entity<AbastecimentoPendente>(entity =>
            {
                entity.ToTable(tb =>
                {
                    tb.UseSqlOutputClause(false); // Evita erro se houver triggers
                });
            });

            // Veiculo - desabilita OUTPUT clause (tabela atualizada durante importação)
            modelBuilder.Entity<Veiculo>(entity =>
            {
                entity.ToTable(tb =>
                {
                    tb.UseSqlOutputClause(false); // Evita erro se houver triggers
                });
            });

            // Requisitante - tem trigger
            modelBuilder.Entity<Requisitante>(entity =>
            {
                entity.ToTable(tb =>
                {
                    tb.HasTrigger("TriggerRequisitante");
                    tb.UseSqlOutputClause(false); // CRÍTICO: evita erro OUTPUT com trigger
                });
            });

            // ================================================================
            // CONFIGURAÇÃO VeiculoPadraoViagem
            // ================================================================
            modelBuilder.Entity<VeiculoPadraoViagem>(entity =>
            {
                entity.HasKey(e => e.VeiculoId);
                entity.HasOne(e => e.Veiculo)
                    .WithOne()
                    .HasForeignKey<VeiculoPadraoViagem>(e => e.VeiculoId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // ================================================================
            // CHAVES COMPOSTAS
            // ================================================================
            modelBuilder
                .Entity<VeiculoContrato>()
                .HasKey(vc => new { vc.VeiculoId , vc.ContratoId });

            modelBuilder
                .Entity<VeiculoAta>()
                .HasKey(va => new { va.VeiculoId , va.AtaId });

            modelBuilder
                .Entity<MotoristaContrato>()
                .HasKey(mc => new { mc.MotoristaId , mc.ContratoId });

            modelBuilder
                .Entity<OperadorContrato>()
                .HasKey(oc => new { oc.OperadorId , oc.ContratoId });

            // ============================================================
            // ENCARREGADO CONTRATO - NOVO (Chave Composta)
            // ============================================================
            modelBuilder
                .Entity<EncarregadoContrato>()
                .HasKey(ec => new { ec.EncarregadoId , ec.ContratoId });

            modelBuilder
                .Entity<LavadorContrato>()
                .HasKey(lc => new { lc.LavadorId , lc.ContratoId });

            modelBuilder
                .Entity<MediaCombustivel>()
                .HasKey(mc => new
                {
                    mc.NotaFiscalId ,
                    mc.CombustivelId ,
                    mc.Ano ,
                    mc.Mes ,
                });

            modelBuilder
                .Entity<CustoMensalItensContrato>()
                .HasKey(cmic => new
                {
                    cmic.NotaFiscalId ,
                    cmic.Ano ,
                    cmic.Mes ,
                });

            modelBuilder
                .Entity<LavadoresLavagem>()
                .HasKey(ll => new { ll.LavagemId , ll.LavadorId });

            modelBuilder
                .Entity<ControleAcesso>()
                .HasKey(ca => new { ca.UsuarioId , ca.RecursoId });

            modelBuilder
                .Entity<ViewMotoristasViagem>()
                .HasKey(vm => new { vm.MotoristaId });

            modelBuilder
                .Entity<ViewVeiculosManutencao>()
                .HasKey(vm => new { vm.VeiculoId });

            modelBuilder
                .Entity<ViewVeiculosManutencaoReserva>()
                .HasKey(vm => new { vm.VeiculoId });

            // ================================================================
            // VIEWS SEM CHAVE (HasNoKey)
            // ================================================================
            modelBuilder.Entity<ViewEmpenhos>().HasNoKey();
            modelBuilder.Entity<ViewMotoristas>().HasNoKey();
            modelBuilder.Entity<ViewAbastecimentos>().HasNoKey();
            modelBuilder.Entity<ViewVeiculos>().HasNoKey();
            modelBuilder.Entity<ViewMediaConsumo>().HasNoKey();
            modelBuilder.Entity<ViewViagens>().HasNoKey();
            modelBuilder.Entity<ViewSetores>().HasNoKey();
            modelBuilder.Entity<ViewRequisitantes>().HasNoKey();
            modelBuilder.Entity<ViewCustosViagem>().HasNoKey();
            modelBuilder.Entity<ViewViagensAgenda>().HasNoKey();
            modelBuilder.Entity<ViewMultas>().HasNoKey();
            modelBuilder.Entity<ViewContratoFornecedor>().HasNoKey();
            modelBuilder.Entity<ViewAtaFornecedor>().HasNoKey();
            modelBuilder.Entity<ViewProcuraFicha>().HasNoKey();
            modelBuilder.Entity<ViewManutencao>().HasNoKey();
            modelBuilder.Entity<ViewPendenciasManutencao>().HasNoKey();
            modelBuilder.Entity<ViewItensManutencao>().HasNoKey();
            modelBuilder.Entity<ViewOcorrencia>().HasNoKey();
            modelBuilder.Entity<ViewViagensAgendaTodosMeses>().HasNoKey();
            modelBuilder.Entity<ViewLavagem>().HasNoKey();
            modelBuilder.Entity<ViewEmpenhoMulta>().HasNoKey();
            modelBuilder.Entity<ViewFluxoEconomildo>().HasNoKey();
            modelBuilder.Entity<ViewFluxoEconomildoData>().HasNoKey();
            modelBuilder.Entity<ViewMotoristaFluxo>().HasNoKey();
            modelBuilder.Entity<ViewLotacoes>().HasNoKey();
            modelBuilder.Entity<ViewLotacaoMotorista>().HasNoKey();
            modelBuilder.Entity<ViewNoFichaVistoria>().HasNoKey();
            modelBuilder.Entity<ViewExisteItemContrato>().HasNoKey();
            modelBuilder.Entity<ViewEventos>().HasNoKey();
            modelBuilder.Entity<ViewControleAcesso>().HasNoKey();
            modelBuilder.Entity<ViewGlosa>().HasNoKey();
            modelBuilder.Entity<ViewPatrimonioConferencia>().HasNoKey();
        }
    }
}
