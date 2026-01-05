using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FrotiX.Models.Estatisticas
{
    [Table("EvolucaoViagensDiaria")]
    public class EvolucaoViagensDiaria
    {
        [Key]
        public Guid Id { get; set; }

        [Column(TypeName = "date")]
        public DateTime Data { get; set; }

        public Guid? MotoristaId { get; set; } // NULL = todos os motoristas

        public int TotalViagens { get; set; }

        public decimal KmTotal { get; set; }

        public int MinutosTotais { get; set; }

        // Controle
        public DateTime DataAtualizacao { get; set; }

        // Navegação
        [ForeignKey("MotoristaId")]
        public virtual FrotiX.Models.Motorista Motorista { get; set; }
    }
}
