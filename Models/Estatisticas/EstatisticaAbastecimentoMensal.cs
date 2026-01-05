using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FrotiX.Models.Estatisticas
{
    [Table("EstatisticaAbastecimentoMensal")]
    public class EstatisticaAbastecimentoMensal
    {
        [Key]
        public Guid Id { get; set; }

        public int Ano { get; set; }

        public int Mes { get; set; }

        public int TotalAbastecimentos { get; set; }

        public decimal ValorTotal { get; set; }

        public decimal LitrosTotal { get; set; }

        public DateTime DataAtualizacao { get; set; }
    }
}
