using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FrotiX.Models.Estatisticas
{
    [Table("EstatisticaAbastecimentoCombustivel")]
    public class EstatisticaAbastecimentoCombustivel
    {
        [Key]
        public Guid Id { get; set; }

        public int Ano { get; set; }

        public int Mes { get; set; }

        [StringLength(100)]
        public string TipoCombustivel { get; set; } = string.Empty;

        public int TotalAbastecimentos { get; set; }

        public decimal ValorTotal { get; set; }

        public decimal LitrosTotal { get; set; }

        public decimal MediaValorLitro { get; set; }

        public DateTime DataAtualizacao { get; set; }
    }
}
