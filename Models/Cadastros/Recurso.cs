using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace FrotiX.Models
{
    public class RecursoViewModel
    {
        public Guid RecursoId { get; set; }

        public string? Nome { get; set; }

        public string? NomeMenu { get; set; }

        public string? Descricao { get; set; }

        public double? Ordem { get; set; }

        public Recurso? Recurso { get; set; }
    }

    public class Recurso
    {
        [Key]
        public Guid RecursoId { get; set; }

        //[Required(ErrorMessage = "(O nome do Recurso é obrigatório)")]
        [Display(Name = "Nome do Recurso")]
        public string? Nome { get; set; }

        //[Required(ErrorMessage = "(O nome de Menu do Recurso é obrigatório)")]
        [Display(Name = "Nome de Menu do Recurso")]
        public string? NomeMenu { get; set; }

        [Display(Name = "Descrição do Recurso")]
        public string? Descricao { get; set; }

        //[Required(ErrorMessage = "(A Ordem de aparição do Recurso na lista é obrigatória)")]
        [Display(Name = "Ordem do Recurso")]
        public double? Ordem { get; set; }
    }
}
