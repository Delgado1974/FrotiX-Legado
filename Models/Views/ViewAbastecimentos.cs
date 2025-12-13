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
    public class ViewAbastecimentos
        {

        public Guid AbastecimentoId { get; set; }

        public DateTime? DataHora { get; set; }

        public String? Data { get; set; }

        public String? Hora { get; set; }

        public string? Placa { get; set; }

        public string? TipoVeiculo { get; set; }

        public string? Nome { get; set; }

        public string? MotoristaCondutor { get; set; }

        public string? TipoCombustivel { get; set; }

        public string? Sigla { get; set; }

        public string? Litros { get; set; }

        public string? ValorUnitario { get; set; }

        public string? ValorTotal { get; set; }

        public string? Consumo { get; set; }

        public decimal? ConsumoGeral { get; set; }

        public int KmRodado { get; set; }

        public Guid VeiculoId { get; set; }

        public Guid CombustivelId { get; set; }

        public Guid UnidadeId { get; set; }

        public Guid MotoristaId { get; set; }

        }
    }


