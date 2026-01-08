using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FrotiX.Data;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace FrotiX.Repository
    {
    public class ViewMediaConsumoRepository : Repository<ViewMediaConsumo>, IViewMediaConsumoRepository
        {
        private new readonly FrotiXDbContext _db;

        public ViewMediaConsumoRepository(FrotiXDbContext db) : base(db)
            {
            _db = db;
            }

        public IEnumerable<SelectListItem> GetViewMediaConsumoListForDropDown()
            {
            return _db.ViewMediaConsumo
            .OrderBy(o => o.ConsumoGeral)
            .Select(i => new SelectListItem()
                {
                Text = i.ConsumoGeral.ToString(),
                Value = i.VeiculoId.ToString()
                }); ; ;
            }

        public new void Update(ViewMediaConsumo viewMediaConsumo)
            {
            var objFromDb = _db.ViewMediaConsumo.FirstOrDefault(s => s.VeiculoId == viewMediaConsumo.VeiculoId);

            _db.Update(viewMediaConsumo);
            _db.SaveChanges();

            }


        }
    }


