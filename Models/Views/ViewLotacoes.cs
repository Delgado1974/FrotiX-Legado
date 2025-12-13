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
    public class ViewLotacoes
        {

        public Guid LotacaoMotoristaId { get; set; }

        public Guid MotoristaId { get; set; }

        public Guid UnidadeId { get; set; }

        public string? NomeCategoria { get; set; }

        public string? Unidade { get; set; }

        public string? Motorista { get; set; }

        public string? DataInicio { get; set; }

        public bool Lotado { get; set; }
        }
    }


