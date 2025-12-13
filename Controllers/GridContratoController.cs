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
    public class GridContratoController :Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        public static List<ItensVeiculo> veiculo = new List<ItensVeiculo>();

        public class objItem
        {
            Guid RepactuacaoContratoId
            {
                get; set;
            }
        }

        public GridContratoController(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "GridContratoController.cs" ,
                    "GridContratoController" ,
                    error
                );
            }
        }

        [Route("DataSource")]
        [HttpGet]
        public IActionResult DataSource()
        {
            try
            {
                var veiculo = ItensVeiculo.GetAllRecords(_unitOfWork);

                return Json(veiculo);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("GridContratoController.cs" , "DataSource" , error);
                return View(); // padronizado
            }
        }
    }

    public class ItensVeiculo
    {
        public static List<ItensVeiculo> veiculo = new List<ItensVeiculo>();

        public ItensVeiculo(
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
                Alerta.TratamentoErroComLinha("GridContratoController.cs" , "ItensVeiculo" , error);
            }
        }

        public static List<ItensVeiculo> GetAllRecords(IUnitOfWork _unitOfWork)
        {
            try
            {
                var objItemVeiculos = _unitOfWork
                    .ItemVeiculoContrato.GetAll()
                    .OrderBy(o => o.NumItem);

                veiculo.Clear();

                foreach (var item in objItemVeiculos)
                {
                    veiculo.Add(
                        new ItensVeiculo(
                            (int)item.NumItem ,
                            item.Descricao ,
                            (int)item.Quantidade ,
                            (double)item.ValorUnitario ,
                            (double)(item.Quantidade * item.ValorUnitario) ,
                            item.RepactuacaoContratoId
                        )
                    );
                }

                return veiculo;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("GridContratoController.cs" , "GetAllRecords" , error);
                return default(List<ItensVeiculo>); // padronizado
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
