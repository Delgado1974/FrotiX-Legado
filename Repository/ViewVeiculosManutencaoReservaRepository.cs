using FrotiX.Data;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc.Rendering;
using System.Collections.Generic;
using System.Linq;

namespace FrotiX.Repository
    {
    public class ViewVeiculosManutencaoReservaRepository : Repository<ViewVeiculosManutencaoReserva>, IViewVeiculosManutencaoReservaRepository
        {
        private new readonly FrotiXDbContext _db;

        public ViewVeiculosManutencaoReservaRepository(FrotiXDbContext db) : base(db)
            {
            _db = db;
            }

        public IEnumerable<SelectListItem> GetViewVeiculosManutencaoReservaListForDropDown()
            {
            return _db.ViewVeiculosManutencaoReserva
            .OrderBy(o => o.Descricao)
            .Select(i => new SelectListItem()
                {
                Text = i.Descricao,
                Value = i.VeiculoId.ToString()
                }); ;
            }

        public new void Update(ViewVeiculosManutencaoReserva viewVeiculosManutencaoReserva)
            {
            var objFromDb = _db.ViewVeiculosManutencaoReserva.FirstOrDefault(s => s.VeiculoId == viewVeiculosManutencaoReserva.VeiculoId);

            _db.Update(viewVeiculosManutencaoReserva);
            _db.SaveChanges();
            }
        }
    }

