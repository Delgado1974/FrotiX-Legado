using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FrotiX.Models
{
    [Table("ViagemEstatistica")]
    public class ViagemEstatistica
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public DateTime DataReferencia { get; set; }

        // ========================================
        // ESTATÍSTICAS GERAIS DE VIAGENS
        // ========================================
        public int TotalViagens { get; set; }

        public int ViagensFinalizadas { get; set; }
        public int ViagensEmAndamento { get; set; }
        public int ViagensAgendadas { get; set; }
        public int ViagensCanceladas { get; set; }

        // ========================================
        // CUSTOS GERAIS
        // ========================================
        public decimal CustoTotal { get; set; }

        public decimal CustoMedioPorViagem { get; set; }

        // Custos por Tipo
        public decimal CustoVeiculo { get; set; }

        public decimal CustoMotorista { get; set; }
        public decimal CustoOperador { get; set; }
        public decimal CustoLavador { get; set; }
        public decimal CustoCombustivel { get; set; }

        // ========================================
        // QUILOMETRAGEM
        // ========================================
        public decimal QuilometragemTotal { get; set; }

        public decimal QuilometragemMedia { get; set; }

        // ========================================
        // DADOS AGREGADOS (JSON)
        // ========================================

        [Column(TypeName = "nvarchar(max)")]
        public string ViagensPorStatusJson { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string ViagensPorMotoristaJson { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string ViagensPorVeiculoJson { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string ViagensPorFinalidadeJson { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string ViagensPorRequisitanteJson { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string ViagensPorSetorJson { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string CustosPorMotoristaJson { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string CustosPorVeiculoJson { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string KmPorVeiculoJson { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string CustosPorTipoJson { get; set; }

        // ========================================
        // TIMESTAMPS
        // ========================================
        public DateTime DataCriacao { get; set; }

        public DateTime? DataAtualizacao { get; set; }
    }
}
