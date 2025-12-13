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
    public class ViewMotoristas
    {
        public Guid MotoristaId { get; set; }

        public string? Nome { get; set; }

        public string? MotoristaCondutor { get; set; }

        public string? Ponto { get; set; }

        public string? CNH { get; set; }

        public string? CategoriaCNH { get; set; }

        public string? Celular01 { get; set; }

        public bool Status { get; set; }

        public string? Sigla { get; set; }

        public string? AnoContrato { get; set; }

        public string? NumeroContrato { get; set; }

        public string? DescricaoFornecedor { get; set; }

        public string? NomeCompleto { get; set; }

        public string? TipoCondutor { get; set; }

        public string? EfetivoFerista { get; set; }

        public byte[]? Foto { get; set; }

        public DateTime? DataAlteracao { get; set; }

        public Guid? ContratoId { get; set; }
    }
}
