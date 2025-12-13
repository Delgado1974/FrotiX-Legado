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
    public class ViewControleAcesso
        {

        public string? UsuarioId { get; set; }

        public Guid RecursoId { get; set; }

        public bool Acesso { get; set; }

        public string? Nome { get; set; }

        public string? Descricao { get; set; }

        public double? Ordem { get; set; }

        public string? NomeCompleto { get; set; }

        public string? IDS { get; set; }

        }
    }


