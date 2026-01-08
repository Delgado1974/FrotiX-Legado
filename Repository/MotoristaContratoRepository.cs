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
    public class MotoristaContratoRepository : Repository<MotoristaContrato>, IMotoristaContratoRepository
        {
        private new readonly FrotiXDbContext _db;

        public MotoristaContratoRepository(FrotiXDbContext db) : base(db)
            {
            _db = db;
            }

        public IEnumerable<SelectListItem> GetMotoristaContratoListForDropDown()
            {
            return _db.MotoristaContrato.Select(i => new SelectListItem()
                {
                //Text = i.Placa,
                //Value = i.VeiculoId.ToString()
                }); ;
            }

        public new void Update(MotoristaContrato motoristaContrato)
            {
            var objFromDb = _db.MotoristaContrato.FirstOrDefault(s => (s.MotoristaId == motoristaContrato.MotoristaId) && (s.ContratoId == motoristaContrato.ContratoId));

            _db.Update(motoristaContrato);
            _db.SaveChanges();

            }


        }
    }


