using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;

namespace FrotiX.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [IgnoreAntiforgeryToken]
    public class GridAtaController :Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        public static List<ItensVeiculoAta> veiculo = new List<ItensVeiculoAta>();

        public class objItem
        {
            Guid RepactuacaoAtaId
            {
                get; set;
            }
        }

        public GridAtaController(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("GridAtaController.cs" , "GridAtaController" , error);
            }
        }

        [Route("DataSourceAta")]
        [HttpGet]
        public IActionResult DataSourceAta()
        {
            try
            {
                var veiculo = ItensVeiculoAta.GetAllRecords(_unitOfWork);

                return Json(veiculo);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("GridAtaController.cs" , "DataSourceAta" , error);
                return View(); // padronizado
            }
        }
    }

    public class ItensVeiculoAta
    {
        public static List<ItensVeiculoAta> veiculo = new List<ItensVeiculoAta>();

        public ItensVeiculoAta(
            int numitem ,
            string descricao ,
            int quantidade ,
            double valorunitario ,
            double valortotal ,
            Guid repactuacaoId
        )
        {
            try
            {
                this.numitem = numitem;
                this.descricao = descricao;
                this.quantidade = quantidade;
                this.valorunitario = valorunitario;
                this.valortotal = valortotal;
                this.repactuacaoId = repactuacaoId;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("GridAtaController.cs" , "ItensVeiculoAta" , error);
            }
        }

        public static List<ItensVeiculoAta> GetAllRecords(IUnitOfWork _unitOfWork)
        {
            try
            {
                var objItemVeiculos = _unitOfWork.ItemVeiculoAta.GetAll().OrderBy(o => o.NumItem);

                veiculo.Clear();

                foreach (var item in objItemVeiculos)
                {
                    veiculo.Add(
                        new ItensVeiculoAta(
                            (int)item.NumItem ,
                            item.Descricao ,
                            (int)item.Quantidade ,
                            (double)item.ValorUnitario ,
                            (double)(item.Quantidade * item.ValorUnitario) ,
                            item.RepactuacaoAtaId
                        )
                    );
                }

                return veiculo;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("GridAtaController.cs" , "GetAllRecords" , error);
                return default(List<ItensVeiculoAta>); // padronizado
            }
        }

        public int? numitem
        {
            get; set;
        }
        public string descricao
        {
            get; set;
        }
        public int? quantidade
        {
            get; set;
        }
        public double? valorunitario
        {
            get; set;
        }
        public double? valortotal
        {
            get; set;
        }
        public Guid repactuacaoId
        {
            get; set;
        }
    }
}
