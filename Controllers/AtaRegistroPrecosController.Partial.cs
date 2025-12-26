using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;

namespace FrotiX.Controllers
{
    public partial class AtaRegistroPrecosController : ControllerBase
    {
        /// <summary>
        /// Lista atas filtradas por Status (para dropdown de Nota Fiscal)
        /// </summary>
        /// <param name="status">1 = Ativo, 0 = Inativo</param>
        [Route("ListaAtasPorStatus")]
        [HttpGet]
        public IActionResult ListaAtasPorStatus(int status)
        {
            try
            {
                bool statusBool = status == 1;

                var result = (
                    from a in _unitOfWork.AtaRegistroPrecos.GetAll()
                    where a.Status == statusBool
                    orderby a.AnoAta descending, a.NumeroAta descending
                    select new
                    {
                        value = a.AtaId,
                        text = a.AnoAta + "/" + a.NumeroAta + " - " + a.Objeto
                    }
                ).ToList();

                return Ok(new
                {
                    data = result
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AtaRegistroPrecosController.cs", "ListaAtasPorStatus", error);
                return Ok(new
                {
                    data = new List<object>()
                });
            }
        }
    }
}
