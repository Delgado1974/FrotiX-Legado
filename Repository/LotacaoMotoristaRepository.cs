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
    public class LotacaoMotoristaRepository : Repository<LotacaoMotorista>, ILotacaoMotoristaRepository
        {
        private new readonly FrotiXDbContext _db;

        public LotacaoMotoristaRepository(FrotiXDbContext db) : base(db)
            {
            _db = db;
            }

        public IEnumerable<SelectListItem> GetLotacaoMotoristaListForDropDown()
            {
            return _db.LotacaoMotorista
                .Select(i => new SelectListItem()
                    {
                    });
            }

        public new void Update(LotacaoMotorista lotacaoMotorista)
            {
            var objFromDb = _db.LotacaoMotorista.FirstOrDefault(lm => lm.LotacaoMotoristaId == lotacaoMotorista.LotacaoMotoristaId);

            _db.Update(lotacaoMotorista);
            _db.SaveChanges();

            }


        }
    }


