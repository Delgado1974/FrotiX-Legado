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
    public class PlacaBronzeRepository : Repository<PlacaBronze>, IPlacaBronzeRepository
    {
        private new readonly FrotiXDbContext _db;

        public PlacaBronzeRepository(FrotiXDbContext db)
            : base(db)
        {
            _db = db;
        }

        public IEnumerable<SelectListItem> GetPlacaBronzeListForDropDown()
        {
            return _db
                .PlacaBronze.Where(e => e.Status == true) // Mudança aqui
                .OrderBy(o => o.DescricaoPlaca)
                .Select(i => new SelectListItem()
                {
                    Text = i.DescricaoPlaca,
                    Value = i.PlacaBronzeId.ToString(),
                });
        }

        public new void Update(PlacaBronze placaBronze)
        {
            var objFromDb = _db.PlacaBronze.FirstOrDefault(s =>
                s.PlacaBronzeId == placaBronze.PlacaBronzeId
            );

            _db.Update(placaBronze);
            _db.SaveChanges();
        }
    }
}
