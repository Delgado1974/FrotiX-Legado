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
    public class CombustivelRepository : Repository<Combustivel>, ICombustivelRepository
        {
        private new readonly FrotiXDbContext _db;

        public CombustivelRepository(FrotiXDbContext db) : base(db)
            {
            _db = db;
            }

        public IEnumerable<SelectListItem> GetCombustivelListForDropDown()
            {
            return _db.Combustivel
                .Where(e => e.Status)
                .OrderBy(o => o.Descricao)
                .Select(i => new SelectListItem()
                    {
                    Text = i.Descricao,
                    Value = i.CombustivelId.ToString()
                    });
            }

        public new void Update(Combustivel combustivel)
            {
            var objFromDb = _db.Combustivel.FirstOrDefault(s => s.CombustivelId == combustivel.CombustivelId);

            _db.Update(combustivel);
            _db.SaveChanges();

            }


        }
    }


