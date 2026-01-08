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
    public class VeiculoRepository : Repository<Veiculo>, IVeiculoRepository
        {
        private new readonly FrotiXDbContext _db;

        public VeiculoRepository(FrotiXDbContext db) : base(db)
            {
            _db = db;
            }

        public IEnumerable<SelectListItem> GetVeiculoListForDropDown()
            {
            return _db.Veiculo
            .OrderBy(o => o.Placa)
            .Select(i => new SelectListItem()
                {
                Text = i.Placa,
                Value = i.VeiculoId.ToString()
                }); ;
            }

        public new void Update(Veiculo veiculo)
            {
            var objFromDb = _db.Veiculo.FirstOrDefault(s => s.VeiculoId == veiculo.VeiculoId);

            _db.Update(veiculo);
            _db.SaveChanges();

            }


        }
    }


