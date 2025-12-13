using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using FrotiX.Validations;
using Microsoft.AspNetCore.Mvc.Rendering;
using NPOI.DDF;

namespace FrotiX.Models
{
    public class MultaViewModel
    {
        public Guid MultaId
        {
            get; set;
        }

        public Guid? OrgaoAutuanteId
        {
            get; set;
        }

        public Multa? Multa
        {
            get; set;
        }

        public double? ValorPago
        {
            get; set;
        }

        public DateTime? DataPagamento
        {
            get; set;
        }

        public string? FormaPagamento
        {
            get; set;
        }

        public string? ComprovantePDF
        {
            get; set;
        }

        public IEnumerable<SelectListItem>? MotoristaList
        {
            get; set;
        }

        public IEnumerable<SelectListItem>? VeiculoList
        {
            get; set;
        }

        public IEnumerable<SelectListItem>? OrgaoList
        {
            get; set;
        }

        public IEnumerable<SelectListItem>? TipoMultaList
        {
            get; set;
        }

        public IEnumerable<SelectListItem>? EmpenhoList
        {
            get; set;
        }
    }

    public class Multa
    {
        [Key]
        public Guid MultaId
        {
            get; set;
        }

        [Required(ErrorMessage = "(O número da Infração é obrigatório)")]
        [Display(Name = "Nº da Infração")]
        public string? NumInfracao
        {
            get; set;
        }

        [Required(ErrorMessage = "(A data é obrigatória)")]
        [Display(Name = "Data Infração")]
        public DateTime? Data
        {
            get; set;
        }

        [Required(ErrorMessage = "(A hora é obrigatória)")]
        [Display(Name = "Hora")]
        public DateTime? Hora
        {
            get; set;
        }

        [Required(ErrorMessage = "(A localização é obrigatória)")]
        [Display(Name = "Localização da Infração")]
        public string? Localizacao
        {
            get; set;
        }

        [Display(Name = "Data de Vencimento")]
        public DateTime? Vencimento
        {
            get; set;
        }

        [DataType(DataType.Currency)]
        [Display(Name = "Valor Até Vencimento")]
        public double? ValorAteVencimento
        {
            get; set;
        }

        [ValidaZero(ErrorMessage = "(O valor após o vencimento é obrigatório)")]
        [Required(ErrorMessage = "(O valor após o vencimento é obrigatório)")]
        [DataType(DataType.Currency)]
        [Display(Name = "Valor Após Vencimento")]
        public double? ValorPosVencimento
        {
            get; set;
        }

        public string? Observacao
        {
            get; set;
        }

        public string? AutuacaoPDF
        {
            get; set;
        }

        public string? PenalidadePDF
        {
            get; set;
        }

        public string? ComprovantePDF
        {
            get; set;
        }

        public string? ProcessoEdocPDF
        {
            get; set;
        }

        public string? OutrosDocumentosPDF
        {
            get; set;
        }

        // ✅ CORRIGIDO: Campos Boolean agora são nullable
        public bool? Paga
        {
            get; set;
        }

        public bool? EnviadaSecle
        {
            get; set;
        }

        public string? Fase
        {
            get; set;
        }

        [Display(Name = "Processo eDoc")]
        public string? ProcessoEDoc
        {
            get; set;
        }

        public string? Status
        {
            get; set;
        }

        [Display(Name = "Nº Ficha Vistoria da Viagem")]
        public int? NoFichaVistoria
        {
            get; set;
        }

        [Required(ErrorMessage = "(A data da notificação é obrigatória)")]
        [Display(Name = "Data Notificação")]
        public DateTime? DataNotificacao
        {
            get; set;
        }

        [Required(ErrorMessage = "(A data limite do recurso é obrigatória)")]
        [Display(Name = "Data Limite Reconhecimento")]
        public DateTime? DataLimite
        {
            get; set;
        }

        public double? ValorPago
        {
            get; set;
        }

        public DateTime? DataPagamento
        {
            get; set;
        }

        public string? FormaPagamento
        {
            get; set;
        }

        public Guid? ContratoVeiculoId
        {
            get; set;
        }

        public Guid? ContratoMotoristaId
        {
            get; set;
        }

        [Display(Name = "Motorista")]
        public Guid? MotoristaId
        {
            get; set;
        }

        [ForeignKey("MotoristaId")]
        public virtual Motorista? Motorista
        {
            get; set;
        }

        [Display(Name = "Veí­culo")]
        public Guid? VeiculoId
        {
            get; set;
        }

        [ForeignKey("VeiculoId")]
        public virtual Veiculo? Veiculo
        {
            get; set;
        }

        [Display(Name = "Órgão Autuante")]
        public Guid? OrgaoAutuanteId
        {
            get; set;
        }

        [ForeignKey("OrgaoAutuanteId")]
        public virtual OrgaoAutuante? OrgaoAutuante
        {
            get; set;
        }

        [Display(Name = "Infração")]
        public Guid? TipoMultaId
        {
            get; set;
        }

        [ForeignKey("TipoMultaId")]
        public virtual TipoMulta? TipoMulta
        {
            get; set;
        }

        [Display(Name = "Empenho")]
        public Guid? EmpenhoMultaId
        {
            get; set;
        }

        [ForeignKey("EmpenhoMultaId")]
        public virtual EmpenhoMulta? EmpenhoMulta
        {
            get; set;
        }

        public Guid? AtaVeiculoId
        {
            get; set;
        }
    }
}
