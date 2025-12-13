using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace FrotiX.Models
{
    public class OrgaoAutuante
    {
        [Key]
        public Guid OrgaoAutuanteId { get; set; }

        [StringLength(50, ErrorMessage = "A sigla não pode exceder 100 caracteres")]
        [Required(ErrorMessage = "(A sigla do órgão é obrigatória)")]
        [Display(Name = "Sigla")]
        public string? Sigla { get; set; }

        [StringLength(100, ErrorMessage = "A descrição não pode exceder 100 caracteres")]
        [Required(ErrorMessage = "(o nome do órgão é obrigatória)")]
        [Display(Name = "Nome")]
        public string? Nome { get; set; }
    }
}
