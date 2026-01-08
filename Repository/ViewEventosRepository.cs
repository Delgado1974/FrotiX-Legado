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
    public class ViewEventosRepository : Repository<ViewEventos>, IViewEventosRepository
        {
        private new readonly FrotiXDbContext _db;

        public ViewEventosRepository(FrotiXDbContext db) : base(db)
            {
            _db = db;
            }

        public IEnumerable<SelectListItem> GetViewEventosListForDropDown()
            {
            return _db.ViewEventos
            .OrderBy(o => o.DataInicial)
            .Select(i => new SelectListItem()
                {
                Text = i.DataInicial.ToString(),
                Value = i.EventoId.ToString()
                }); ; ;
            }

        public new void Update(ViewEventos viewEventos)
            {
            var objFromDb = _db.ViewEventos.FirstOrDefault(s => s.EventoId == viewEventos.EventoId);

            _db.Update(viewEventos);
            _db.SaveChanges();

            }


        }
    }


