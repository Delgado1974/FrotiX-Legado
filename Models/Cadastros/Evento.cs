using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Rendering;
using FrotiX.Services;
using FrotiX.Validations;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace FrotiX.Models
    {
    public class Evento
        {

        public class EventoViewModel
            {
            public Guid EventoId { get; set; }

            public string? Nome { get; set; }

            public string? Descricao { get; set; }

            public int? QtdParticipantes { get; set; }

            public DateTime? DataInicial { get; set; }

            public DateTime? DataFinal { get; set; }

            public string? Status { get; set; }

            public Guid SetorSolicitanteId { get; set; }

            public Guid RequisitanteId { get; set; }

            public Evento Evento { get; set; }
            }


        [Key]
        public Guid EventoId { get; set; }

        [StringLength(200, ErrorMessage = "o Nome não pode exceder 200 caracteres")]
        [Display(Name = "Nome do Evento")]
        [Required]
        public string? Nome { get; set; }

        [StringLength(300, ErrorMessage = "a Descrição não pode exceder 300 caracteres")]
        [Display(Name = "Descrição")]
        [Required]
        public string? Descricao { get; set; }

        [Display(Name = "Quantidade de Participantes")]
        [Required]
        public int? QtdParticipantes { get; set; }

        [Display(Name = "Data Inicial")]
        [Required]
        public DateTime? DataInicial { get; set; }

        [DataType(DataType.DateTime)]
        [Display(Name = "Data Final")]
        [Required]
        public DateTime? DataFinal { get; set; }

        [Display(Name = "Ativo/Inativo")]
        [Required]
        public string? Status { get; set; }

        [Display(Name = "Setor Solicitante")]
        [Required]
        public Guid SetorSolicitanteId { get; set; }

        [ForeignKey("SetorSolicitanteId")]
        public virtual SetorSolicitante SetorSolicitante { get; set; }

        [Display(Name = "Usuário Solicitante")]
        [Required]
        public Guid RequisitanteId { get; set; }

        [ForeignKey("RequisitanteId")]
        public virtual Requisitante Requisitante { get; set; }

        }
    }


