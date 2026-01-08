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
    public class ViewCustosViagemRepository : Repository<ViewCustosViagem>, IViewCustosViagemRepository
        {
        private new readonly FrotiXDbContext _db;

        public ViewCustosViagemRepository(FrotiXDbContext db) : base(db)
            {
            _db = db;
            }

        public IEnumerable<SelectListItem> GetViewCustosViagemListForDropDown()
            {
            return _db.ViewViagens
            .OrderBy(o => o.DataInicial)
            .Select(i => new SelectListItem()
                {
                Text = i.DataInicial.ToString(),
                Value = i.ViagemId.ToString()
                }); ; ;
            }

        public new void Update(ViewCustosViagem viewCustosViagem)
            {
            var objFromDb = _db.ViewViagens.FirstOrDefault(s => s.ViagemId == viewCustosViagem.ViagemId);

            _db.Update(viewCustosViagem);
            _db.SaveChanges();

            }


        }
    }


