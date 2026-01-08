using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FrotiX.Data;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc.Rendering;
using NPOI.SS.Formula.Functions;

namespace FrotiX.Repository
    {
    public class ViewViagensAgendaRepository
        : Repository<ViewViagensAgenda>,
            IViewViagensAgendaRepository
        {
        private new readonly FrotiXDbContext _db;

        public ViewViagensAgendaRepository(FrotiXDbContext db)
            : base(db)
            {
            _db = db;
            }

        public IEnumerable<SelectListItem> GetViewViagensAgendaListForDropDown()
            {
            return _db
                .ViewViagensAgenda.OrderBy(o => o.DataInicial)
                .Select(i => new SelectListItem()
                    {
                    Text = i.DataInicial.ToString(),
                    Value = i.ViagemId.ToString(),
                    });
            }

        public new void Update(ViewViagensAgenda viewViagensAgenda)
            {
            var objFromDb = _db.ViewViagensAgenda.FirstOrDefault(s =>
                s.ViagemId == viewViagensAgenda.ViagemId
            );

            _db.Update(viewViagensAgenda);
            _db.SaveChanges();
            }
        }
    }


