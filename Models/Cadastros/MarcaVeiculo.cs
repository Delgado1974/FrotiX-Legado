using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace FrotiX.Models
{
    public class MarcaVeiculoViewModel
    {
        public Guid MarcaId { get; set; }
    }

    public class MarcaVeiculo
    {
        [Key]
        public Guid MarcaId { get; set; }

        [StringLength(50, ErrorMessage = "A descrição não pode exceder 50 caracteres")]
        [Required(ErrorMessage = "(A descrição da marca é obrigatória)")]
        [Display(Name = "Marca do Veículo")]
        public string? DescricaoMarca { get; set; }

        [Display(Name = "Ativo/Inativo")]
        public bool Status { get; set; }
    }
}
