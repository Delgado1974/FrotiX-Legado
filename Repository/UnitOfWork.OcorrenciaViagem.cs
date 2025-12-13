using FrotiX.Data;
using FrotiX.Repository.IRepository;

namespace FrotiX.Repository
{
    public partial class UnitOfWork
    {
        private IOcorrenciaViagemRepository? _ocorrenciaViagem;
        private IViewOcorrenciasViagemRepository? _viewOcorrenciasViagem;
        private IViewOcorrenciasAbertasVeiculoRepository? _viewOcorrenciasAbertasVeiculo;

        public IOcorrenciaViagemRepository OcorrenciaViagem
        {
            get
            {
                if (_ocorrenciaViagem == null)
                    _ocorrenciaViagem = new OcorrenciaViagemRepository(_db);
                return _ocorrenciaViagem;
            }
        }

        public IViewOcorrenciasViagemRepository ViewOcorrenciasViagem
        {
            get
            {
                if (_viewOcorrenciasViagem == null)
                    _viewOcorrenciasViagem = new ViewOcorrenciasViagemRepository(_db);
                return _viewOcorrenciasViagem;
            }
        }

        public IViewOcorrenciasAbertasVeiculoRepository ViewOcorrenciasAbertasVeiculo
        {
            get
            {
                if (_viewOcorrenciasAbertasVeiculo == null)
                    _viewOcorrenciasAbertasVeiculo = new ViewOcorrenciasAbertasVeiculoRepository(_db);
                return _viewOcorrenciasAbertasVeiculo;
            }
        }
    }
}
