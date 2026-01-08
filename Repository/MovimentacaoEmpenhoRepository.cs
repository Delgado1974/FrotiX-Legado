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
    public class MovimentacaoEmpenhoRepository : Repository<MovimentacaoEmpenho>, IMovimentacaoEmpenhoRepository
        {
        private new readonly FrotiXDbContext _db;

        public MovimentacaoEmpenhoRepository(FrotiXDbContext db) : base(db)
            {
            _db = db;
            }

        public IEnumerable<SelectListItem> GetMovimentacaoEmpenhoListForDropDown()
            {
            return _db.MovimentacaoEmpenho
            .Join(_db.Empenho, movimentacaoempenho => movimentacaoempenho.EmpenhoId, empenho => empenho.EmpenhoId, (movimentacaoempenho, empenho) => new { movimentacaoempenho, empenho })
            .OrderBy(o => o.movimentacaoempenho.DataMovimentacao)
            .Select(i => new SelectListItem()
                {
                Text = i.movimentacaoempenho.DataMovimentacao + "(" + i.movimentacaoempenho.Valor + ")",
                Value = i.movimentacaoempenho.MovimentacaoId.ToString()
                });
            }

        public new void Update(MovimentacaoEmpenho movimentacaoempenho)
            {
            var objFromDb = _db.MovimentacaoEmpenho.FirstOrDefault(s => s.MovimentacaoId == movimentacaoempenho.MovimentacaoId);

            _db.Update(movimentacaoempenho);
            _db.SaveChanges();

            }
        }
    }


