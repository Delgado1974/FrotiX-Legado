using FrotiX.Data;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc.Rendering;
using System.Collections.Generic;
using System.Linq;

namespace FrotiX.Repository
    {
    public class ViewVeiculosManutencaoRepository : Repository<ViewVeiculosManutencao>, IViewVeiculosManutencaoRepository
        {
        private new readonly FrotiXDbContext _db;

        public ViewVeiculosManutencaoRepository(FrotiXDbContext db) : base(db)
            {
            _db = db;
            }

        public IEnumerable<SelectListItem> GetViewVeiculosManutencaoListForDropDown()
            {
            return _db.ViewVeiculosManutencao
            .OrderBy(o => o.Descricao)
            .Select(i => new SelectListItem()
                {
                Text = i.Descricao,
                Value = i.VeiculoId.ToString()
                }); ;
            }

        public new void Update(ViewVeiculosManutencao viewVeiculosManutencao)
            {
            var objFromDb = _db.ViewVeiculosManutencao.FirstOrDefault(s => s.VeiculoId == viewVeiculosManutencao.VeiculoId);

            _db.Update(viewVeiculosManutencao);
            _db.SaveChanges();
            }
        }
    }

