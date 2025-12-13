namespace FrotiX.Repository.IRepository
{
    public partial interface IUnitOfWork
    {
        IOcorrenciaViagemRepository OcorrenciaViagem { get; }
        IViewOcorrenciasViagemRepository ViewOcorrenciasViagem { get; }
        IViewOcorrenciasAbertasVeiculoRepository ViewOcorrenciasAbertasVeiculo { get; }
    }
}
