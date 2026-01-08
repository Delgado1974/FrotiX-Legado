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
    public class ViewExisteItemContratoRepository : Repository<ViewExisteItemContrato>, IViewExisteItemContratoRepository
        {
        private new readonly FrotiXDbContext _db;

        public ViewExisteItemContratoRepository(FrotiXDbContext db) : base(db)
            {
            _db = db;
            }

        public IEnumerable<SelectListItem> GetViewExisteItemContratoListForDropDown()
            {
            return _db.ViewExisteItemContrato
            .OrderBy(o => o.NumItem)
            .Select(i => new SelectListItem()
                {
                Text = i.Descricao.ToString(),
                Value = i.NumItem.ToString()
                }); ; ;
            }

        public new void Update(ViewExisteItemContrato viewExisteItemContrato)
            {
            var objFromDb = _db.ViewExisteItemContrato.FirstOrDefault(v => v.RepactuacaoContratoId == viewExisteItemContrato.RepactuacaoContratoId);

            _db.Update(viewExisteItemContrato);
            _db.SaveChanges();

            }


        }
    }


