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
    public class ViewLavagem
        {

        public Guid LavagemId { get; set; }

        public Guid MotoristaId { get; set; }

        public Guid VeiculoId { get; set; }

        public string? LavadoresId { get; set; }

        public string? Data { get; set; }

        public string? HorarioInicio { get; set; }

        public string? HorarioFim { get; set; }

        public int? DuracaoMinutos { get; set; }

        public string? Lavadores { get; set; }

        public string? DescricaoVeiculo { get; set; }

        public string? Nome { get; set; }

        }
    }


