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
    public class ViewAbastecimentosRepository : Repository<ViewAbastecimentos>, IViewAbastecimentosRepository
        {
        private new readonly FrotiXDbContext _db;

        public ViewAbastecimentosRepository(FrotiXDbContext db) : base(db)
            {
            _db = db;
            }

        public IEnumerable<SelectListItem> GetViewAbastecimentosListForDropDown()
            {
            return _db.ViewAbastecimentos
            .OrderBy(o => o.Nome)
            .Select(i => new SelectListItem()
                {
                Text = i.Nome,
                Value = i.MotoristaId.ToString()
                }); ;
            }

        public new void Update(ViewAbastecimentos viewAbastecimentos)
            {
            var objFromDb = _db.ViewAbastecimentos.FirstOrDefault(s => s.AbastecimentoId == viewAbastecimentos.AbastecimentoId);

            _db.Update(viewAbastecimentos);
            _db.SaveChanges();

            }


        }
    }


