using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FrotiX.Models.Estatisticas
{
    [Table("RankingMotoristasMensal")]
    public class RankingMotoristasMensal
    {
        [Key]
        public Guid Id { get; set; }

        public int Ano { get; set; }

        public int Mes { get; set; }

        [StringLength(50)]
        public string TipoRanking { get; set; } // 'VIAGENS', 'KM', 'HORAS', 'ABASTECIMENTOS', 'MULTAS', 'PERFORMANCE'

        public int Posicao { get; set; }

        public Guid MotoristaId { get; set; }

        [StringLength(200)]
        public string NomeMotorista { get; set; }

        [StringLength(50)]
        public string TipoMotorista { get; set; } // Efetivo/Ferista/Cobertura

        // Valores conforme o tipo de ranking
        public decimal ValorPrincipal { get; set; } // Viagens/KM/Horas/etc

        public decimal ValorSecundario { get; set; } // KM (para performance), Valor (para multas)

        public decimal ValorTerciario { get; set; } // Horas (para performance)

        public int ValorQuaternario { get; set; } // Multas (para performance)

        // Controle
        public DateTime DataAtualizacao { get; set; }

        // Navegação
        [ForeignKey("MotoristaId")]
        public virtual FrotiX.Models.Motorista Motorista { get; set; }
    }
}
