using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FrotiX.Models;

namespace FrotiX.Repository.IRepository
{
    public interface IVeiculoPadraoViagemRepository : IRepository<VeiculoPadraoViagem>
    {
        void Update(VeiculoPadraoViagem veiculoPadraoViagem);
    }
}
