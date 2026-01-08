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
    public class SetorSolicitanteRepository : Repository<SetorSolicitante>, ISetorSolicitanteRepository
        {
        private new readonly FrotiXDbContext _db;

        public SetorSolicitanteRepository(FrotiXDbContext db) : base(db)
            {
            _db = db;
            }

        public IEnumerable<SelectListItem> GetSetorSolicitanteListForDropDown()
            {
            return _db.SetorSolicitante
            .OrderBy(o => o.Nome)
            .Select(i => new SelectListItem()
                {
                Text = i.Nome,
                Value = i.SetorSolicitanteId.ToString()
                }); ;
            }

        public new void Update(SetorSolicitante setorSolicitante)
            {
            var objFromDb = _db.SetorSolicitante.FirstOrDefault(s => s.SetorSolicitanteId == setorSolicitante.SetorSolicitanteId);

            _db.Update(setorSolicitante);
            _db.SaveChanges();

            }


        }
    }


