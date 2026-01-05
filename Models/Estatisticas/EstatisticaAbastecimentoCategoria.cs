using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FrotiX.Models.Estatisticas
{
    [Table("EstatisticaAbastecimentoCategoria")]
    public class EstatisticaAbastecimentoCategoria
    {
        [Key]
        public Guid Id { get; set; }

        public int Ano { get; set; }

        public int Mes { get; set; }

        [StringLength(100)]
        public string Categoria { get; set; } = string.Empty;

        public int TotalAbastecimentos { get; set; }

        public decimal ValorTotal { get; set; }

        public decimal LitrosTotal { get; set; }

        public DateTime DataAtualizacao { get; set; }
    }
}
