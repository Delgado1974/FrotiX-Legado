#nullable enable
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FrotiX.Models
{
    public class EncarregadoContratoViewModel
    {
        public Guid EncarregadoId { get; set; }
        public Guid ContratoId { get; set; }
        public EncarregadoContrato? EncarregadoContrato { get; set; }
    }

    public class EncarregadoContrato
    {
        // 2 Foreign Keys as Primary Key (Chave Composta)
        // ===============================================
        [Key, Column(Order = 0)]
        public Guid EncarregadoId { get; set; }

        [Key, Column(Order = 1)]
        public Guid ContratoId { get; set; }
    }
}
