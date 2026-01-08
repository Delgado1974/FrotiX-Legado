// ContratoRepository.cs
using System.Linq;
using FrotiX.Data;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;

namespace FrotiX.Repository
    {
    public class ContratoRepository : Repository<Contrato>, IContratoRepository
        {
        private new readonly FrotiXDbContext _db;

        public ContratoRepository(FrotiXDbContext db)
            : base(db)
            {
            _db = db;
            }

        // Status sempre TRUE; status removido da assinatura
        public IQueryable<SelectListItem> GetDropDown(string? tipoContrato = null)
            {
            var temTipo = !string.IsNullOrWhiteSpace(tipoContrato);

            return _db.Set<Contrato>()
                .AsNoTracking()
                .Where(c => c.Status && (!temTipo || c.TipoContrato == tipoContrato))
                // Include é desnecessário: o acesso à nav prop vira JOIN na SQL
                .OrderByDescending(c => c.AnoContrato)
                .ThenByDescending(c => c.NumeroContrato)
                .ThenByDescending(c => c.Fornecedor.DescricaoFornecedor)
                .Select(c => new SelectListItem
                    {
                    Value = c.ContratoId.ToString(),
                    Text = temTipo
                        ? $"{c.AnoContrato}/{c.NumeroContrato} - {c.Fornecedor.DescricaoFornecedor}"
                        : $"{c.AnoContrato}/{c.NumeroContrato} - {c.Fornecedor.DescricaoFornecedor} ({c.TipoContrato})",
                    });
            }
        }
    }


