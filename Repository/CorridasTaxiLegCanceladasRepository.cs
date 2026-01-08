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
    public class CorridasCanceladasTaxiLegRepository : Repository<CorridasCanceladasTaxiLeg>, ICorridasCanceladasTaxiLegRepository
        {
        private new readonly FrotiXDbContext _db;

        public CorridasCanceladasTaxiLegRepository(FrotiXDbContext db) : base(db)
            {
            _db = db;
            }

        public IEnumerable<SelectListItem> GetCorridasCanceladasTaxiLegListForDropDown()
            {
            return _db.CorridasCanceladasTaxiLeg
            .Select(i => new SelectListItem()
                {
                Text = i.MotivoCancelamento,
                Value = i.CorridaCanceladaId.ToString()
                });
            }

        public new void Update(CorridasCanceladasTaxiLeg corridasCanceladasTaxiLeg)
            {
            var objFromDb = _db.CorridasCanceladasTaxiLeg.FirstOrDefault(s => s.CorridaCanceladaId == corridasCanceladasTaxiLeg.CorridaCanceladaId);

            _db.Update(corridasCanceladasTaxiLeg);
            _db.SaveChanges();

            }


        }
    }


