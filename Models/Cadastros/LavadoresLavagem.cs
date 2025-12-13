using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using FrotiX.Validations;
using Microsoft.AspNetCore.Http;

namespace FrotiX.Models
{
    public class LavadoresLavagem
    {
        [Key, Column(Order = 0)]
        public Guid LavagemId { get; set; }

        [ForeignKey("LavagemId")]
        public virtual Lavagem? Lavagem { get; set; }

        [Key, Column(Order = 1)]
        public Guid LavadorId { get; set; }

        [ForeignKey("LavadorId")]
        public virtual Lavador? Lavador { get; set; }
    }
}
