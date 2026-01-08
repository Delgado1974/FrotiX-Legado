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
    public class ViewViagensAgendaTodosMesesRepository : Repository<ViewViagensAgendaTodosMeses>, IViewViagensAgendaTodosMesesRepository
        {
        private new readonly FrotiXDbContext _db;

        public ViewViagensAgendaTodosMesesRepository(FrotiXDbContext db) : base(db)
            {
            _db = db;
            }

        public IEnumerable<SelectListItem> GetViewViagensAgendaTodosMesesListForDropDown()
            {
            return _db.ViewViagensAgendaTodosMeses
            .OrderBy(o => o.DataInicial)
            .Select(i => new SelectListItem()
                {
                Text = i.DataInicial.ToString(),
                Value = i.ViagemId.ToString()
                });
            }

        public new void Update(ViewViagensAgendaTodosMeses viewViagensAgendaTodosMeses)
            {
            var objFromDb = _db.ViewViagensAgendaTodosMeses.FirstOrDefault(s => s.ViagemId == viewViagensAgendaTodosMeses.ViagemId);

            _db.Update(viewViagensAgendaTodosMeses);
            _db.SaveChanges();

            }


        }
    }


