// IContratoRepository.cs
using System.Linq;
using FrotiX.Models;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace FrotiX.Repository.IRepository
    {
    public interface IContratoRepository : IRepository<Contrato>
        {
        // Status é sempre TRUE, sem parâmetro "status"
        IQueryable<SelectListItem> GetDropDown(string? tipoContrato = null);
        }
    }


