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
    public class ViewManutencaoRepository : Repository<ViewManutencao>, IViewManutencaoRepository
        {
        private new readonly FrotiXDbContext _db;

        public ViewManutencaoRepository(FrotiXDbContext db) : base(db)
            {
            _db = db;
            }

        public IEnumerable<SelectListItem> GetViewManutencaoListForDropDown()
            {
            return _db.ViewManutencao
            .OrderBy(o => o.DataSolicitacao)
            .Select(i => new SelectListItem()
                {
                Text = i.DataSolicitacao.ToString(),
                Value = i.ManutencaoId.ToString()
                }); ; ;
            }

        public new void Update(ViewManutencao viewManutencao)
            {
            var objFromDb = _db.ViewManutencao.FirstOrDefault(s => s.ManutencaoId == viewManutencao.ManutencaoId);

            _db.Update(viewManutencao);
            _db.SaveChanges();

            }


        }
    }


