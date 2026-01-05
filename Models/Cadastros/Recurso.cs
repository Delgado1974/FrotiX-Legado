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

        [Required(ErrorMessage = "O nome do Recurso é obrigatório")]
        [Display(Name = "Nome do Recurso")]
        public string Nome { get; set; } = string.Empty;

        [Required(ErrorMessage = "O nome de Menu do Recurso é obrigatório")]
        [Display(Name = "Nome de Menu do Recurso")]
        public string NomeMenu { get; set; } = string.Empty;

        [Display(Name = "Descrição do Recurso")]
        public string? Descricao { get; set; }

        [Required(ErrorMessage = "A Ordem é obrigatória")]
        [Display(Name = "Ordem do Recurso")]
        public double Ordem { get; set; }

        // ====== CAMPOS PARA NAVEGAÇÃO HIERÁRQUICA ======

        [Display(Name = "Recurso Pai")]
        public Guid? ParentId { get; set; }

        [Required(ErrorMessage = "O ícone é obrigatório")]
        [Display(Name = "Ícone FontAwesome")]
        public string Icon { get; set; } = "fa-duotone fa-folder";

        [Required(ErrorMessage = "A URL é obrigatória")]
        [Display(Name = "URL da Página")]
        public string Href { get; set; } = "javascript:void(0);";

        [Display(Name = "Ativo no Menu")]
        public bool Ativo { get; set; } = true;

        [Display(Name = "Nível na Hierarquia")]
        public int Nivel { get; set; } = 0;

        [Display(Name = "Tem Filhos")]
        public bool HasChild { get; set; } = false;

        // Navegação EF Core
        public virtual Recurso? Parent { get; set; }
        public virtual ICollection<Recurso> Children { get; set; } = new List<Recurso>();
    }
}
