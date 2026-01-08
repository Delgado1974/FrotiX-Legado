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
    public class FornecedorRepository : Repository<Fornecedor>, IFornecedorRepository
        {
        private new readonly FrotiXDbContext _db;

        public FornecedorRepository(FrotiXDbContext db) : base(db)
            {
            _db = db;
            }

        public IEnumerable<SelectListItem> GetFornecedorListForDropDown()
            {

            return _db.Fornecedor
            .OrderBy(o => o.DescricaoFornecedor)
            .Select(i => new SelectListItem()
                {
                Text = i.DescricaoFornecedor,
                Value = i.FornecedorId.ToString()
                }); ;
            }

        public new void Update(Fornecedor fornecedor)
            {
            var objFromDb = _db.Fornecedor.FirstOrDefault(s => s.FornecedorId == fornecedor.FornecedorId);

            _db.Update(fornecedor);
            _db.SaveChanges();

            }


        }
    }


