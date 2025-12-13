using System;
using FrotiX.Models; // ViewGlosaModel
using FrotiX.Repository.IRepository;

namespace FrotiX.Repository.IRepository
    {
    /// <summary>
    /// Repositório para a projeção ViewGlosa (view/keyless).
    /// Mantém apenas as operações genéricas herdadas.
    /// </summary>
    public interface IViewGlosaRepository : IRepository<ViewGlosa>
        {
        // Se precisar, adicione métodos específicos de leitura/consulta aqui.
        }
    }


