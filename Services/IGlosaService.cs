using System;
using System.Collections.Generic;

namespace FrotiX.Services
    {
    public interface IGlosaService
        {
        IEnumerable<GlosaResumoItemDto> ListarResumo(Guid contratoId, int mes, int ano);
        IEnumerable<GlosaDetalheItemDto> ListarDetalhes(Guid contratoId, int mes, int ano);
        }
    }


