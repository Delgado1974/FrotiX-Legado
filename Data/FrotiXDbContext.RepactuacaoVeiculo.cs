using FrotiX.Models;
using Microsoft.EntityFrameworkCore;

namespace FrotiX.Data
{
    public partial class FrotiXDbContext
    {
        public DbSet<RepactuacaoVeiculo> RepactuacaoVeiculo { get; set; }
    }
}
