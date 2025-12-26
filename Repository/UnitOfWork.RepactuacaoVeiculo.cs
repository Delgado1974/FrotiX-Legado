using FrotiX.Data;
using FrotiX.Repository.IRepository;

namespace FrotiX.Repository
{
    public partial class UnitOfWork
    {
        private IRepactuacaoVeiculoRepository _repactuacaoVeiculo;

        public IRepactuacaoVeiculoRepository RepactuacaoVeiculo
        {
            get
            {
                if (_repactuacaoVeiculo == null)
                {
                    _repactuacaoVeiculo = new RepactuacaoVeiculoRepository(_db);
                }
                return _repactuacaoVeiculo;
            }
        }
    }
}
