using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FrotiX.Models.Estatisticas
{
    [Table("HeatmapAbastecimentoMensal")]
    public class HeatmapAbastecimentoMensal
    {
        [Key]
        public Guid Id { get; set; }

        public int Ano { get; set; }

        public int Mes { get; set; }

        /// <summary>
        /// NULL = todos os veículos
        /// </summary>
        public Guid? VeiculoId { get; set; }

        /// <summary>
        /// NULL = todos os tipos
        /// </summary>
        [StringLength(100)]
        public string? TipoVeiculo { get; set; }

        /// <summary>
        /// 0=Domingo, 1=Segunda, ... 6=Sábado
        /// </summary>
        public int DiaSemana { get; set; }

        /// <summary>
        /// 0-23
        /// </summary>
        public int Hora { get; set; }

        public int TotalAbastecimentos { get; set; }

        public decimal ValorTotal { get; set; }

        public DateTime DataAtualizacao { get; set; }
    }
}
