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
    public class ViewMotoristasRepository : Repository<ViewMotoristas>, IViewMotoristasRepository
        {
        private new readonly FrotiXDbContext _db;

        public ViewMotoristasRepository(FrotiXDbContext db) : base(db)
            {
            _db = db;
            }

        public IEnumerable<SelectListItem> GetViewMotoristasListForDropDown()
            {
            return _db.ViewMotoristas
            .OrderBy(o => o.Nome)
            .Select(i => new SelectListItem()
                {
                Text = i.Nome,
                Value = i.MotoristaId.ToString()
                }); ;
            }

        public new void Update(ViewMotoristas viewMotoristas)
            {
            var objFromDb = _db.ViewMotoristas.FirstOrDefault(s => s.MotoristaId == viewMotoristas.MotoristaId);

            _db.Update(viewMotoristas);
            _db.SaveChanges();

            }


        }
    }


