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
    public class viewMultasRepository : Repository<ViewMultas>, IviewMultasRepository
        {
        private new readonly FrotiXDbContext _db;

        public viewMultasRepository(FrotiXDbContext db) : base(db)
            {
            _db = db;
            }

        public IEnumerable<SelectListItem> GetviewMultasListForDropDown()
            {
            return _db.viewMultas
            .OrderBy(o => o.NumInfracao)
            .Select(i => new SelectListItem()
                {
                Text = i.NumInfracao.ToString(),
                Value = i.MultaId.ToString()
                }); ; ;
            }

        public new void Update(ViewMultas viewMultas)
            {
            var objFromDb = _db.viewMultas.FirstOrDefault(s => s.MultaId == viewMultas.MultaId);

            _db.Update(viewMultas);
            _db.SaveChanges();

            }


        }
    }


