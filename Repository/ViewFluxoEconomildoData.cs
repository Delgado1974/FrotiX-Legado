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
    public class ViewFluxoEconomildoDataRepository : Repository<ViewFluxoEconomildoData>, IViewFluxoEconomildoDataRepository
        {
        private new readonly FrotiXDbContext _db;

        public ViewFluxoEconomildoDataRepository(FrotiXDbContext db) : base(db)
            {
            _db = db;
            }

        public IEnumerable<SelectListItem> GetViewFluxoEconomildoDataListForDropDown()
            {
            return _db.ViewFluxoEconomildoData
            .OrderBy(o => o.Data)
            .Select(i => new SelectListItem()
                {
                Text = i.Data.ToString(),
                Value = i.ViagemEconomildoId.ToString()
                }); ; ;
            }

        public new void Update(ViewFluxoEconomildoData viewFluxoEconomildoData)
            {
            var objFromDb = _db.ViewFluxoEconomildoData.FirstOrDefault(s => s.ViagemEconomildoId == viewFluxoEconomildoData.ViagemEconomildoId);

            _db.Update(viewFluxoEconomildoData);
            _db.SaveChanges();

            }


        }
    }


