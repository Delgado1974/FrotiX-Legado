using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using FrotiX.Services;
using FrotiX.Validations;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace FrotiX.Models
{
    public class VeiculoAtaViewModel
    {
        public Guid VeiculoId { get; set; }
        public Guid AtaId { get; set; }
        public VeiculoAta? VeiculoAta { get; set; }
    }

    public class VeiculoAta
    {
        //2 Foreign Keys as Primary Key
        //=============================
        [Key, Column(Order = 0)]
        public Guid VeiculoId { get; set; }

        [Key, Column(Order = 1)]
        public Guid AtaId { get; set; }
    }
}
