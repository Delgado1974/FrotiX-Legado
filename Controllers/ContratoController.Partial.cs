using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;

namespace FrotiX.Controllers
{
    public partial class ContratoController : Controller
    {
        /// <summary>
        /// Lista contratos filtrados por Status (para dropdown de Nota Fiscal)
        /// </summary>
        /// <param name="status">1 = Ativo, 0 = Inativo</param>
        [Route("ListaContratosPorStatus")]
        [HttpGet]
        public IActionResult ListaContratosPorStatus(int status)
        {
            try
            {
                bool statusBool = status == 1;

                var result = (
                    from c in _unitOfWork.Contrato.GetAll()
                    where c.Status == statusBool
                    orderby c.AnoContrato descending, c.NumeroContrato descending
                    select new
                    {
                        value = c.ContratoId,
                        text = c.AnoContrato + "/" + c.NumeroContrato + " - " + c.Objeto
                    }
                ).ToList();

                return Json(new
                {
                    data = result
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ContratoController.cs", "ListaContratosPorStatus", error);
                return Json(new
                {
                    data = new List<object>()
                });
            }
        }
    }
}
