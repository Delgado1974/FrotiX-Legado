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
    public class ViewMotoristaFluxoRepository : Repository<ViewMotoristaFluxo>, IViewMotoristaFluxoRepository
        {
        private new readonly FrotiXDbContext _db;

        public ViewMotoristaFluxoRepository(FrotiXDbContext db) : base(db)
            {
            _db = db;
            }

        public IEnumerable<SelectListItem> GetViewMotoristaFluxoListForDropDown()
            {
            return _db.ViewMotoristaFluxo
            .OrderBy(o => o.NomeMotorista)
            .Select(i => new SelectListItem()
                {
                Text = i.NomeMotorista.ToString(),
                Value = i.NomeMotorista.ToString()
                }); ; ;
            }

        public new void Update(ViewMotoristaFluxo viewMotoristaFluxo)
            {
            var objFromDb = _db.ViewMotoristaFluxo.FirstOrDefault(s => s.NomeMotorista == viewMotoristaFluxo.NomeMotorista);

            _db.Update(viewMotoristaFluxo);
            _db.SaveChanges();

            }


        }
    }


