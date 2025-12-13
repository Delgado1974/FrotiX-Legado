using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace FrotiX.Models
    {
    public class CombustivelViewModel
        {
        public Guid CombustivelId { get; set; }
        }

    public class Combustivel
        {

        [Key]
        public Guid CombustivelId { get; set; }

        [StringLength(50, ErrorMessage = "O combustível não pode exceder 50 caracteres")]
        [Required(ErrorMessage = "(O tipo de combustível é obrigatório)")]
        [Display(Name = "Tipo de Combustível")]
        public string Descricao { get; set; }

        [Display(Name = "Ativo/Inativo")]
        public bool Status { get; set; }

        }

    public class MediaCombustivel
        {

        [Key, Column(Order = 0)]
        public Guid NotaFiscalId { get; set; }

        [Key, Column(Order = 1)]
        public Guid CombustivelId { get; set; }

        [Key, Column(Order = 2)]
        public int Ano { get; set; }

        [Key, Column(Order = 3)]
        public int Mes { get; set; }

        public double PrecoMedio { get; set; }

        }

    }


