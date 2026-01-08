using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FrotiX.Data;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;

namespace FrotiX.Repository
    {
    public class RecursoRepository : Repository<Recurso>, IRecursoRepository
        {
        private new readonly FrotiXDbContext _db;

        public RecursoRepository(FrotiXDbContext db) : base(db)
            {
            _db = db;
            }

        public IEnumerable<SelectListItem> GetRecursoListForDropDown()
            {
            return _db.Recurso
            .OrderBy(o => o.Nome)
            .Select(i => new SelectListItem()
                {
                Text = i.Nome,
                Value = i.RecursoId.ToString()
                }); ;
            }

        public new void Update(Recurso recurso)
            {
            var objFromDb = _db.Recurso.FirstOrDefault(s => s.RecursoId == recurso.RecursoId);

            _db.Update(recurso);
            _db.SaveChanges();

            }


        }
    }


