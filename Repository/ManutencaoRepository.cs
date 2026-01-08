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
    public class ManutencaoRepository : Repository<Manutencao>, IManutencaoRepository
        {
        private new readonly FrotiXDbContext _db;

        public ManutencaoRepository(FrotiXDbContext db) : base(db)
            {
            _db = db;
            }

        public IEnumerable<SelectListItem> GetManutencaoListForDropDown()
            {
            return _db.Manutencao
            .OrderBy(o => o.ResumoOS)
            .Select(i => new SelectListItem()
                {
                Text = i.ResumoOS,
                Value = i.ManutencaoId.ToString()
                }); ;
            }

        public new void Update(Manutencao manutencao)
            {
            var objFromDb = _db.Manutencao.FirstOrDefault(s => s.ManutencaoId == manutencao.ManutencaoId);

            _db.Update(manutencao);
            _db.SaveChanges();

            }


        }
    }


