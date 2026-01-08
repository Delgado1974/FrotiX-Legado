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
    public class ViewOcorrenciaRepository : Repository<ViewOcorrencia>, IViewOcorrenciaRepository
        {
        private new readonly FrotiXDbContext _db;

        public ViewOcorrenciaRepository(FrotiXDbContext db) : base(db)
            {
            _db = db;
            }

        public IEnumerable<SelectListItem> GetViewOcorrenciaListForDropDown()
            {
            return _db.ViewOcorrencia
            .OrderBy(o => o.DataInicial)
            .Select(i => new SelectListItem()
                {
                Text = i.DataInicial.ToString(),
                Value = i.ViagemId.ToString()
                }); ; ;
            }

        public new void Update(ViewOcorrencia viewOcorrencia)
            {
            var objFromDb = _db.ViewOcorrencia.FirstOrDefault(s => s.ViagemId == viewOcorrencia.ViagemId);

            _db.Update(viewOcorrencia);
            _db.SaveChanges();

            }


        }
    }


