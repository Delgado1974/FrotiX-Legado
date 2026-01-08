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
    public class ViagensEconomildoRepository : Repository<ViagensEconomildo>, IViagensEconomildoRepository
        {
        private new readonly FrotiXDbContext _db;

        public ViagensEconomildoRepository(FrotiXDbContext db) : base(db)
            {
            _db = db;
            }

        public IEnumerable<SelectListItem> GetViagensEconomildoListForDropDown()
            {
            return _db.ViagensEconomildo
            .Select(i => new SelectListItem()
                {
                Text = i.Data.ToString(),
                Value = i.ViagemEconomildoId.ToString()
                }); ;
            }

        public new void Update(ViagensEconomildo viagensEconomildo)
            {
            var objFromDb = _db.ViagensEconomildo.FirstOrDefault(s => s.ViagemEconomildoId == viagensEconomildo.ViagemEconomildoId);

            _db.Update(viagensEconomildo);
            _db.SaveChanges();

            }


        }
    }


