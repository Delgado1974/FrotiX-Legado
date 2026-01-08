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
    public class RepactuacaoTerceirizacaoRepository : Repository<RepactuacaoTerceirizacao>, IRepactuacaoTerceirizacaoRepository
        {
        private new readonly FrotiXDbContext _db;

        public RepactuacaoTerceirizacaoRepository(FrotiXDbContext db) : base(db)
            {
            _db = db;
            }

        public IEnumerable<SelectListItem> GetRepactuacaoTerceirizacaoListForDropDown()
            {
            return _db.RepactuacaoTerceirizacao
                .Select(i => new SelectListItem()
                    {
                    Text = i.ValorEncarregado.ToString(),
                    Value = i.RepactuacaoContratoId.ToString()
                    });
            }

        public new void Update(RepactuacaoTerceirizacao RepactuacaoTerceirizacao)
            {
            var objFromDb = _db.RepactuacaoTerceirizacao.FirstOrDefault(s => s.RepactuacaoTerceirizacaoId == RepactuacaoTerceirizacao.RepactuacaoTerceirizacaoId);

            _db.Update(RepactuacaoTerceirizacao);
            _db.SaveChanges();

            }


        }
    }


