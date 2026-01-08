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
    public class RegistroCupomAbastecimentoRepository : Repository<RegistroCupomAbastecimento>, IRegistroCupomAbastecimentoRepository
        {
        private new readonly FrotiXDbContext _db;

        public RegistroCupomAbastecimentoRepository(FrotiXDbContext db) : base(db)
            {
            _db = db;
            }

        public IEnumerable<SelectListItem> GetRegistroCupomAbastecimentoListForDropDown()
            {
            return _db.RegistroCupomAbastecimento
                .OrderBy(o => o.DataRegistro)
                .Select(i => new SelectListItem()
                    {
                    Text = i.RegistroPDF,
                    Value = i.RegistroCupomId.ToString()
                    });
            }

        public new void Update(RegistroCupomAbastecimento registroCupomAbastecimento)
            {
            var objFromDb = _db.RegistroCupomAbastecimento.FirstOrDefault(s => s.RegistroCupomId == registroCupomAbastecimento.RegistroCupomId);

            _db.Update(registroCupomAbastecimento);
            _db.SaveChanges();

            }


        }
    }


