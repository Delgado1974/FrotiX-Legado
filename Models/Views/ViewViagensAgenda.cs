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

namespace FrotiX.Models
    {
    public class ViewViagensAgenda
        {

        public Guid ViagemId { get; set; }

        public string? Descricao { get; set; }

        public DateTime? DataInicial { get; set; }

        public DateTime? HoraInicio { get; set; }

        public string? Status { get; set; }

        public bool StatusAgendamento { get; set; }

        public bool FoiAgendamento { get; set; }

        public string? Finalidade { get; set; }

        public string? NomeEvento { get; set; }

        public Guid VeiculoId { get; set; }

        public Guid MotoristaId { get; set; }

        public Guid EventoId { get; set; }

        public string? Titulo { get; set; }

        public DateTime? Start { get; set; }

        public DateTime? End { get; set; }

        public DateTime? DataFinal { get; set; }

        public DateTime? HoraFim { get; set; }

        public string? CorEvento { get; set; }

        public string? CorTexto { get; set; }

        public string? DescricaoEvento { get; set; }

        public string? DescricaoMontada { get; set; }

        }
    }


