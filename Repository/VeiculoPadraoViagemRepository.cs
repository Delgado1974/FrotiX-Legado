using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FrotiX.Data;
using FrotiX.Models;
using FrotiX.Repository.IRepository;

namespace FrotiX.Repository
{
    public class VeiculoPadraoViagemRepository : Repository<VeiculoPadraoViagem>, IVeiculoPadraoViagemRepository
    {
        private new readonly FrotiXDbContext _db;

        public VeiculoPadraoViagemRepository(FrotiXDbContext db) : base(db)
        {
            _db = db;
        }

        public new void Update(VeiculoPadraoViagem veiculoPadraoViagem)
        {
            var objFromDb = _db.VeiculoPadraoViagem.FirstOrDefault(s => s.VeiculoId == veiculoPadraoViagem.VeiculoId);

            if (objFromDb != null)
            {
                objFromDb.TipoUso = veiculoPadraoViagem.TipoUso;
                objFromDb.TotalViagens = veiculoPadraoViagem.TotalViagens;
                objFromDb.MediaDuracaoMinutos = veiculoPadraoViagem.MediaDuracaoMinutos;
                objFromDb.MediaKmPorViagem = veiculoPadraoViagem.MediaKmPorViagem;
                objFromDb.MediaKmPorDia = veiculoPadraoViagem.MediaKmPorDia;
                objFromDb.MediaKmEntreAbastecimentos = veiculoPadraoViagem.MediaKmEntreAbastecimentos;
                objFromDb.MediaDiasEntreAbastecimentos = veiculoPadraoViagem.MediaDiasEntreAbastecimentos;
                objFromDb.TotalAbastecimentosAnalisados = veiculoPadraoViagem.TotalAbastecimentosAnalisados;
                objFromDb.DataAtualizacao = DateTime.Now;

                _db.SaveChanges();
            }
        }
    }
}
