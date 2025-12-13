using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using FrotiX.Services;
using FrotiX.Validations;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace FrotiX.Models
{
    public class ViewCustosViagem
    {
        public Guid ViagemId { get; set; }

        public Guid? MotoristaId { get; set; }

        public Guid? VeiculoId { get; set; }

        public Guid? SetorSolicitanteId { get; set; }

        public int? NoFichaVistoria { get; set; }

        public string? DataInicial { get; set; }

        public string? DataFinal { get; set; }

        public string? HoraInicio { get; set; }

        public string? HoraFim { get; set; }

        public string? Finalidade { get; set; }

        public int? KmInicial { get; set; }

        public int? KmFinal { get; set; }

        public int? Quilometragem { get; set; }

        public string? Status { get; set; }

        public string? DescricaoVeiculo { get; set; }

        public string? NomeMotorista { get; set; }

        public string? CustoMotorista { get; set; }

        public string? CustoVeiculo { get; set; }

        public string? CustoCombustivel { get; set; }

        public bool StatusAgendamento { get; set; }

        public long? RowNum { get; set; }

        [NotMapped]
        public IFormFile FotoUpload { get; set; }
    }
}
