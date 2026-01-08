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
    public class ViewLotacoesRepository : Repository<ViewLotacoes>, IViewLotacoesRepository
        {
        private new readonly FrotiXDbContext _db;

        public ViewLotacoesRepository(FrotiXDbContext db) : base(db)
            {
            _db = db;
            }

        }
    }


