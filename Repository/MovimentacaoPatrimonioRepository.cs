using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FrotiX.Data;
using FrotiX.Models;
using FrotiX.Models.Cadastros;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace FrotiX.Repository
    {
    public class MovimentacaoPatrimonioRepository : Repository<MovimentacaoPatrimonio>, IMovimentacaoPatrimonioRepository
        {
        private new readonly FrotiXDbContext _db;

        public MovimentacaoPatrimonioRepository(FrotiXDbContext db) : base(db)
            {
            _db = db;
            }

        public IEnumerable<SelectListItem> GetMovimentacaoPatrimonioListForDropDown()
            {
            return _db.MovimentacaoPatrimonio
            .OrderBy(o => o.PatrimonioId)
            .Select(i => new SelectListItem()
                {
                Text = i.DataMovimentacao.ToString(),
                Value = i.MovimentacaoPatrimonioId.ToString()
                }); ;
            }

        public new void Update(MovimentacaoPatrimonio movimentacaoPatrimonio)
            {
            var objFromDb = _db.MovimentacaoPatrimonio.FirstOrDefault(s => s.MovimentacaoPatrimonioId == movimentacaoPatrimonio.MovimentacaoPatrimonioId);

            _db.Update(movimentacaoPatrimonio);
            _db.SaveChanges();

            }


        }
    }


