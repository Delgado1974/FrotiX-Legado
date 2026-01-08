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
    public class ItemVeiculoContratoRepository : Repository<ItemVeiculoContrato>, IItemVeiculoContratoRepository
        {
        private new readonly FrotiXDbContext _db;

        public ItemVeiculoContratoRepository(FrotiXDbContext db) : base(db)
            {
            _db = db;
            }

        public IEnumerable<SelectListItem> GetItemVeiculoContratoListForDropDown()
            {
            return _db.ItemVeiculoContrato
                .OrderBy(o => o.Descricao)
                .Select(i => new SelectListItem()
                    {
                    Text = i.Descricao,
                    Value = i.ItemVeiculoId.ToString()
                    });
            }

        public new void Update(ItemVeiculoContrato itemveiculocontrato)
            {
            var objFromDb = _db.ItemVeiculoContrato.FirstOrDefault(s => s.ItemVeiculoId == itemveiculocontrato.ItemVeiculoId);

            _db.Update(itemveiculocontrato);
            _db.SaveChanges();

            }


        }
    }


