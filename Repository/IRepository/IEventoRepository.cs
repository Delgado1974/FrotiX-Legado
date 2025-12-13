using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FrotiX.Models;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace FrotiX.Repository.IRepository
    {
    public interface IEventoRepository : IRepository<Evento>
        {

        IEnumerable<SelectListItem> GetEventoListForDropDown();

        void Update(Evento evento);

        /// <summary>
        /// Lista eventos com paginação e otimização
        /// </summary>
        Task<(List<EventoListDto> eventos, int totalItems)> GetEventosPaginadoAsync(
            int page ,
            int pageSize ,
            string filtroStatus = null
        );

    }
    }


