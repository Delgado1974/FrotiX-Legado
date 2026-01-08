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
    public class ViewAtaFornecedorRepository : Repository<ViewAtaFornecedor>, IViewAtaFornecedorRepository
        {
        private new readonly FrotiXDbContext _db;

        public ViewAtaFornecedorRepository(FrotiXDbContext db) : base(db)
            {
            _db = db;
            }

        public IEnumerable<SelectListItem> GetViewAtaFornecedorListForDropDown()
            {
            return _db.ViewAtaFornecedor
            .OrderBy(o => o.AtaVeiculo)
            .Select(i => new SelectListItem()
                {
                Text = i.AtaVeiculo.ToString(),
                Value = i.AtaId.ToString()
                }); ; ;
            }

        public new void Update(ViewAtaFornecedor viewAtaFornecedor)
            {
            var objFromDb = _db.ViewAtaFornecedor.FirstOrDefault(s => s.AtaId == viewAtaFornecedor.AtaId);

            _db.Update(viewAtaFornecedor);
            _db.SaveChanges();

            }


        }
    }


