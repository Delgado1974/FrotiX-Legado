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
    public class ControleAcessoRepository : Repository<ControleAcesso>, IControleAcessoRepository
        {
        private new readonly FrotiXDbContext _db;

        public ControleAcessoRepository(FrotiXDbContext db) : base(db)
            {
            _db = db;
            }

        public IEnumerable<SelectListItem> GetControleAcessoListForDropDown()
            {
            return _db.ControleAcesso
            .Select(i => new SelectListItem()
                {
                Text = i.RecursoId.ToString(),
                Value = i.UsuarioId.ToString()
                }); ;
            }

        public new void Update(ControleAcesso controleAcesso)
            {
            var objFromDb = _db.ControleAcesso.FirstOrDefault(s => s.RecursoId == controleAcesso.RecursoId);

            _db.Update(controleAcesso);
            _db.SaveChanges();

            }


        }
    }


