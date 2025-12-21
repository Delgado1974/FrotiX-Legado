using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FrotiX.Models
{
    public class AgendamentoViagem
    {
        public string? CombustivelFinal { get; set; }
        public string? CombustivelInicial { get; set; }

        [NotMapped]
        public bool CriarViagemFechada { get; set; }

        public DateTime? DataAgendamento { get; set; }
        public DateTime? DataCancelamento { get; set; }
        public DateTime? DataCriacao { get; set; }

        [NotMapped]
        public List<DateTime>? DataEspecifica { get; set; }

        public DateTime? DataFinal { get; set; }
        public DateTime? DataFinalizacao { get; set; }
        public DateTime? DataFinalRecorrencia { get; set; }
        public DateTime? DataInicial { get; set; }
        public List<DateTime>? DatasSelecionadas { get; set; }
        public string? Descricao { get; set; }
        public string? Destino { get; set; }
        public int? DiaMesRecorrencia { get; set; }

        [NotMapped]
        public DateTime? EditarAPartirData { get; set; }

        [NotMapped]
        public bool editarTodosRecorrentes { get; set; }

        public Guid? EventoId { get; set; }
        public string? Finalidade { get; set; }
        public bool FoiAgendamento { get; set; }
        public bool? Friday { get; set; }
        public DateTime? HoraFim { get; set; }
        public DateTime? HoraInicio { get; set; }
        public string? Intervalo { get; set; }
        public int? KmAtual { get; set; }
        public int? KmFinal { get; set; }
        public int? KmInicial { get; set; }
        public bool? Monday { get; set; }
        public Guid? MotoristaId { get; set; }
        public int? NoFichaVistoria { get; set; }

        [NotMapped]
        public bool OperacaoBemSucedida { get; set; }

        public string? Origem { get; set; }
        public string? RamalRequisitante { get; set; }
        public Guid? RecorrenciaViagemId { get; set; }
        public string? Recorrente { get; set; }
        public Guid? RequisitanteId { get; set; }
        public bool? Saturday { get; set; }
        public Guid? SetorSolicitanteId { get; set; }
        public string? Status { get; set; }
        public bool StatusAgendamento { get; set; }
        public bool? Sunday { get; set; }
        public bool? Thursday { get; set; }
        public bool? Tuesday { get; set; }
        public string? UsuarioIdAgendamento { get; set; }
        public string? UsuarioIdCancelamento { get; set; }
        public string? UsuarioIdCriacao { get; set; }
        public string? UsuarioIdFinalizacao { get; set; }
        public Guid? VeiculoId { get; set; }
        public Guid ViagemId { get; set; }
        public bool? Wednesday { get; set; }
    }

    public class AjusteViagem
    {
        [NotMapped]
        public IFormFile? ArquivoFoto { get; set; }

        public DateTime? DataFinal { get; set; }
        public DateTime? DataInicial { get; set; }
        public Guid? EventoId { get; set; }
        public string? Finalidade { get; set; }
        public DateTime? HoraFim { get; set; }
        public DateTime? HoraInicial { get; set; }
        public int? KmFinal { get; set; }
        public int? KmInicial { get; set; }
        public Guid? MotoristaId { get; set; }
        public int? NoFichaVistoria { get; set; }
        public Guid? SetorSolicitanteId { get; set; }
        public Guid? VeiculoId { get; set; }
        public Guid ViagemId { get; set; }
    }

    /// <summary>
    /// DTO para finalização de viagem - campos de ocorrência removidos (agora usa tabela OcorrenciaViagem)
    /// </summary>
    public class FinalizacaoViagem
    {
        [NotMapped]
        public IFormFile? ArquivoFoto { get; set; }

        public string? CombustivelFinal { get; set; }
        public DateTime? DataFinal { get; set; }
        public string? Descricao { get; set; }
        public DateTime? HoraFim { get; set; }
        public int? KmFinal { get; set; }
        public string? StatusCartaoAbastecimento { get; set; }
        public string? StatusDocumento { get; set; }
        public Guid ViagemId { get; set; }

        // ✅ NOVO: Lista de ocorrências múltiplas
        public List<OcorrenciaFinalizacaoDTO>? Ocorrencias { get; set; }
    }

    /// <summary>
    /// DTO para cada ocorrência enviada na finalização
    /// </summary>
    public class OcorrenciaFinalizacaoDTO
    {
        public string? Resumo { get; set; }
        public string? Descricao { get; set; }
        public string? ImagemOcorrencia { get; set; }
    }

    public class ProcuraViagemViewModel
    {
        public string? Data { get; set; }
        public string? Hora { get; set; }
        public int? NoFichaVistoria { get; set; }
        public Guid? VeiculoId { get; set; }
        public Viagem? Viagem { get; set; }
    }

    /// <summary>
    /// Entidade Viagem - campos de ocorrência removidos (agora usa tabela OcorrenciaViagem)
    /// </summary>
    public class Viagem
    {
        [NotMapped]
        public IFormFile? ArquivoFoto { get; set; }

        [Display(Name = "Combustível Final")]
        public string? CombustivelFinal { get; set; }

        [Display(Name = "Combustível Inicial")]
        public string? CombustivelInicial { get; set; }

        public double? CustoCombustivel { get; set; }
        public double? CustoLavador { get; set; }
        public double? CustoMotorista { get; set; }
        public double? CustoOperador { get; set; }
        public double? CustoVeiculo { get; set; }

        public DateTime? DataAgendamento { get; set; }
        public DateTime? DataCancelamento { get; set; }
        public DateTime? DataCriacao { get; set; }

        [Display(Name = "Data Final")]
        public DateTime? DataFinal { get; set; }

        public DateTime? DataFinalizacao { get; set; }
        public DateTime? DataFinalRecorrencia { get; set; }

        [DataType(DataType.DateTime)]
        [Display(Name = "Data Inicial")]
        public DateTime? DataInicial { get; set; }

        [Display(Name = "Descrição")]
        public string? Descricao { get; set; }

        public string? DescricaoSemFormato { get; set; }

        public byte[]? DescricaoViagemImagem { get; set; }
        public byte[]? DescricaoViagemWord { get; set; }

        [Display(Name = "Destino")]
        public string? Destino { get; set; }

        public int? DiaMesRecorrencia { get; set; }

        [NotMapped]
        public DateTime? EditarAPartirData { get; set; }

        [NotMapped]
        public bool? editarTodosRecorrentes { get; set; }

        [ForeignKey("EventoId")]
        public virtual Evento? Evento { get; set; }

        [Display(Name = "Evento")]
        public Guid? EventoId { get; set; }

        public byte[]? FichaVistoria { get; set; }

        [Display(Name = "Finalidade")]
        public string? Finalidade { get; set; }

        public bool? FoiAgendamento { get; set; }
        public bool? Friday { get; set; }

        [DataType(DataType.DateTime)]
        [Display(Name = "Hora Fim")]
        public DateTime? HoraFim { get; set; }

        [DataType(DataType.DateTime)]
        [Display(Name = "Hora de Início")]
        public DateTime? HoraInicio { get; set; }

        public string? Intervalo { get; set; }

        [Display(Name = "Km Atual")]
        public int? KmAtual { get; set; }

        [Display(Name = "Km Final")]
        public int? KmFinal { get; set; }

        [Display(Name = "Km Inicial")]
        public int? KmInicial { get; set; }

        /// <summary>
        /// KM Rodado calculado (KmFinal - KmInicial)
        /// </summary>
        [Display(Name = "Km Rodado")]
        public int? KmRodado { get; set; }

        public int? Minutos { get; set; }
        public bool? Monday { get; set; }

        [ForeignKey("MotoristaId")]
        public virtual Motorista? Motorista { get; set; }

        [Display(Name = "Motorista")]
        public Guid? MotoristaId { get; set; }

        [Display(Name = "Nº Ficha Vistoria")]
        public int? NoFichaVistoria { get; set; }

        [Display(Name = "Nome do Evento")]
        public string? NomeEvento { get; set; }

        [NotMapped]
        public bool? OperacaoBemSucedida { get; set; }

        [Display(Name = "Origem")]
        public string? Origem { get; set; }

        [Display(Name = "Ramal")]
        public string? RamalRequisitante { get; set; }

        public Guid? RecorrenciaViagemId { get; set; }
        public string? Recorrente { get; set; }

        [ForeignKey("RequisitanteId")]
        public virtual Requisitante? Requisitante { get; set; }

        [Display(Name = "Usuário Requisitante")]
        public Guid? RequisitanteId { get; set; }

        public bool? Saturday { get; set; }

        [ForeignKey("SetorSolicitanteId")]
        public virtual SetorSolicitante? SetorSolicitante { get; set; }

        [Display(Name = "Setor Solicitante")]
        public Guid? SetorSolicitanteId { get; set; }

        public string? Status { get; set; }
        public bool? StatusAgendamento { get; set; }
        public string? StatusCartaoAbastecimento { get; set; }
        public string? StatusCartaoAbastecimentoFinal { get; set; }
        public string? StatusDocumento { get; set; }
        public string? StatusDocumentoFinal { get; set; }

        public bool? Sunday { get; set; }
        public bool? Thursday { get; set; }
        public bool? Tuesday { get; set; }
        public string? UsuarioIdAgendamento { get; set; }
        public string? UsuarioIdCancelamento { get; set; }
        public string? UsuarioIdCriacao { get; set; }
        public string? UsuarioIdFinalizacao { get; set; }

        [ForeignKey("VeiculoId")]
        public virtual Veiculo? Veiculo { get; set; }

        [Display(Name = "Veículo")]
        public Guid? VeiculoId { get; set; }

        [Key]
        public Guid ViagemId { get; set; }

        public bool? Wednesday { get; set; }

        // ===== CINTA E TABLET (TODOS BIT/BOOL) =====
        [Display(Name = "Cinta Entregue")]
        public bool? CintaEntregue { get; set; }

        [Display(Name = "Cinta Devolvida")]
        public bool? CintaDevolvida { get; set; }

        [Display(Name = "Tablet Entregue")]
        public bool? TabletEntregue { get; set; }

        [Display(Name = "Tablet Devolvido")]
        public bool? TabletDevolvido { get; set; }

        // ===== VISTORIADORES =====
        [Display(Name = "Vistoriador Inicial")]
        public string? VistoriadorInicialId { get; set; }

        [Display(Name = "Vistoriador Final")]
        public string? VistoriadorFinalId { get; set; }

        public string? Rubrica { get; set; }
        public string? RubricaFinal { get; set; }

        // ================================================================
        // CAMPOS DE NORMALIZAÇÃO (Dashboard Administração)
        // ================================================================

        /// <summary>
        /// Indica se a viagem passou por processo de normalização
        /// </summary>
        [Display(Name = "Foi Normalizada")]
        public bool? FoiNormalizada { get; set; }

        /// <summary>
        /// Tipo de normalização aplicada (DATA_INVERTIDA, KM_INVERTIDO, KM_ESTIMADO_ABASTECIMENTO, etc.)
        /// </summary>
        [StringLength(500)]
        [Display(Name = "Tipo de Normalização")]
        public string? TipoNormalizacao { get; set; }

        /// <summary>
        /// Data em que a normalização foi aplicada
        /// </summary>
        [Display(Name = "Data da Normalização")]
        public DateTime? DataNormalizacao { get; set; }

        /// <summary>
        /// KM Rodado após normalização (quando aplicável)
        /// </summary>
        [Display(Name = "Km Rodado Normalizado")]
        public int? KmRodadoNormalizado { get; set; }

        /// <summary>
        /// Data inicial após normalização (quando datas foram invertidas)
        /// </summary>
        [Display(Name = "Data Inicial Normalizada")]
        public DateTime? DataInicialNormalizada { get; set; }

        /// <summary>
        /// Data final após normalização (quando datas foram invertidas)
        /// </summary>
        [Display(Name = "Data Final Normalizada")]
        public DateTime? DataFinalNormalizada { get; set; }

        /// <summary>
        /// Hora de início normalizada (TIME no SQL Server)
        /// </summary>
        [Display(Name = "Hora Início Normalizada")]
        public TimeSpan? HoraInicioNormalizada { get; set; }

        /// <summary>
        /// Hora fim normalizada (TIME no SQL Server)
        /// </summary>
        [Display(Name = "Hora Fim Normalizada")]
        public TimeSpan? HoraFimNormalizada { get; set; }

        /// <summary>
        /// Minutos calculados após normalização
        /// </summary>
        [Display(Name = "Minutos Normalizado")]
        public int? MinutosNormalizado { get; set; }

        /// <summary>
        /// KM Inicial após normalização
        /// </summary>
        [Display(Name = "Km Inicial Normalizado")]
        public int? KmInicialNormalizado { get; set; }

        /// <summary>
        /// KM Final após normalização
        /// </summary>
        [Display(Name = "Km Final Normalizado")]
        public int? KmFinalNormalizado { get; set; }

        // ================================================================

        public void AtualizarDados(AgendamentoViagem? viagem)
        {
            if (viagem != null)
            {
                this.DataInicial = viagem.DataInicial;
                this.HoraInicio = viagem.HoraInicio;
                this.Finalidade = viagem.Finalidade;
                this.Origem = viagem.Origem;
                this.Destino = viagem.Destino;
                this.MotoristaId = viagem.MotoristaId;
                this.VeiculoId = viagem.VeiculoId;
                this.RequisitanteId = viagem.RequisitanteId;
                this.RamalRequisitante = viagem.RamalRequisitante;
                this.SetorSolicitanteId = viagem.SetorSolicitanteId ?? Guid.Empty;
                this.Descricao = viagem.Descricao;
                this.StatusAgendamento = viagem.StatusAgendamento;
                this.FoiAgendamento = viagem.FoiAgendamento;
                this.Status = viagem.Status;
                this.DataFinal = viagem.DataFinal;
                this.HoraFim = viagem.HoraFim;
                this.NoFichaVistoria = viagem.NoFichaVistoria;
                this.EventoId = viagem.EventoId;
                this.KmAtual = viagem.KmAtual ?? 0;
                this.KmInicial = viagem.KmInicial ?? 0;
                this.KmFinal = viagem.KmFinal ?? 0;
                this.CombustivelInicial = viagem.CombustivelInicial;
                this.CombustivelFinal = viagem.CombustivelFinal;
                this.UsuarioIdCriacao = viagem.UsuarioIdCriacao;
                this.DataCriacao = viagem.DataCriacao;
                this.UsuarioIdFinalizacao = viagem.UsuarioIdFinalizacao;
                this.DataFinalizacao = viagem.DataFinalizacao;
                this.Recorrente = viagem.Recorrente;
                this.RecorrenciaViagemId = viagem.RecorrenciaViagemId;
                this.Intervalo = viagem.Intervalo;
                this.DataFinalRecorrencia = viagem.DataFinalRecorrencia;
                this.Monday = viagem.Monday;
                this.Tuesday = viagem.Tuesday;
                this.Wednesday = viagem.Wednesday;
                this.Thursday = viagem.Thursday;
                this.Friday = viagem.Friday;
                this.Saturday = viagem.Saturday;
                this.Sunday = viagem.Sunday;
                this.DiaMesRecorrencia = viagem.DiaMesRecorrencia;
                this.editarTodosRecorrentes = viagem.editarTodosRecorrentes;
                this.EditarAPartirData = viagem.EditarAPartirData;
            }
        }
    }

    public class ViagemID
    {
        public Guid ViagemId { get; set; }
    }

    public class ViagemViewModel
    {
        public DateTime? DataCancelamento { get; set; }
        public string? DataFinalizacao { get; set; }
        public byte[]? FichaVistoria { get; set; }
        public string? HoraFinalizacao { get; set; }
        public string? NomeUsuarioAgendamento { get; set; }
        public string? NomeUsuarioCancelamento { get; set; }
        public string? NomeUsuarioCriacao { get; set; }
        public string? NomeUsuarioFinalizacao { get; set; }
        public string? UsuarioIdCancelamento { get; set; }
        public Viagem? Viagem { get; set; }
        public Guid ViagemId { get; set; }
    }
}
