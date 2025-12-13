using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace FrotiX.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [IgnoreAntiforgeryToken]
    public class NotaFiscalController :Controller
    {
        private readonly IUnitOfWork _unitOfWork;

        public NotaFiscalController(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("NotaFiscalController.cs" , "NotaFiscalController" , error);
            }
        }

        [HttpGet]
        public void Get()
        {
            try
            {
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("NotaFiscalController.cs" , "Get" , error);
            }
        }

        [Route("Delete")]
        [HttpPost]
        public IActionResult Delete(NotaFiscalViewModel model)
        {
            try
            {
                if (model != null && model.NotaFiscalId != Guid.Empty)
                {
                    var objFromDb = _unitOfWork.NotaFiscal.GetFirstOrDefault(u =>
                        u.NotaFiscalId == model.NotaFiscalId
                    );
                    if (objFromDb != null)
                    {
                        var empenho = _unitOfWork.Empenho.GetFirstOrDefault(u =>
                            u.EmpenhoId == objFromDb.EmpenhoId
                        );
                        empenho.SaldoFinal =
                            empenho.SaldoFinal + (objFromDb.ValorNF - objFromDb.ValorGlosa);
                        _unitOfWork.Empenho.Update(empenho);

                        _unitOfWork.NotaFiscal.Remove(objFromDb);
                        _unitOfWork.Save();
                        return Json(
                            new
                            {
                                success = true ,
                                message = "Nota Fiscal removida com sucesso"
                            }
                        );
                    }
                }
                return Json(new
                {
                    success = false ,
                    message = "Erro ao apagar Nota Fiscal"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("NotaFiscalController.cs" , "Delete" , error);
                return Json(new
                {
                    success = false ,
                    message = "Erro ao apagar Nota Fiscal"
                });
            }
        }

        [Route("Glosa")]
        [Consumes("application/json")]
        public IActionResult Glosa([FromBody] GlosaNota glosanota)
        {
            try
            {
                glosanota.ValorGlosa = glosanota.ValorGlosa / 100;

                var notaFiscal = _unitOfWork.NotaFiscal.GetFirstOrDefault(u =>
                    u.NotaFiscalId == glosanota.NotaFiscalId
                );
                notaFiscal.ValorGlosa = glosanota.ValorGlosa;
                _unitOfWork.NotaFiscal.Update(notaFiscal);

                var empenho = _unitOfWork.Empenho.GetFirstOrDefault(u =>
                    u.EmpenhoId == notaFiscal.EmpenhoId
                );
                empenho.SaldoFinal = empenho.SaldoFinal + glosanota.ValorGlosa;
                _unitOfWork.Empenho.Update(empenho);

                _unitOfWork.Save();

                return Json(
                    new
                    {
                        success = true ,
                        message = "Glosa realizada com sucesso" ,
                        type = 0 ,
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("NotaFiscalController.cs" , "Glosa" , error);
                return Json(new
                {
                    success = false ,
                    message = "Erro ao realizar glosa"
                });
            }
        }

        [Route("EmpenhoList")]
        public JsonResult EmpenhoList(Guid id)
        {
            try
            {
                var EmpenhoList = _unitOfWork.Empenho.GetAll().Where(e => e.ContratoId == id);
                EmpenhoList = EmpenhoList.OrderByDescending(e => e.NotaEmpenho).ToList();
                return new JsonResult(new
                {
                    data = EmpenhoList
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("NotaFiscalController.cs" , "EmpenhoList" , error);
                return new JsonResult(new
                {
                    data = new List<object>()
                });
            }
        }

        [Route("EmpenhoListAta")]
        public JsonResult EmpenhoListAta(Guid id)
        {
            try
            {
                var EmpenhoList = _unitOfWork.Empenho.GetAll().Where(e => e.AtaId == id);
                EmpenhoList = EmpenhoList.OrderByDescending(e => e.NotaEmpenho);
                return new JsonResult(new
                {
                    data = EmpenhoList
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("NotaFiscalController.cs" , "EmpenhoListAta" , error);
                return new JsonResult(new
                {
                    data = new List<object>()
                });
            }
        }

        [Route("GetContrato")]
        public JsonResult GetContrato(Guid id)
        {
            try
            {
                var objContrato = _unitOfWork.Contrato.GetAll().Where(c => c.ContratoId == id);
                return new JsonResult(new
                {
                    data = objContrato
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("NotaFiscalController.cs" , "GetContrato" , error);
                return new JsonResult(new
                {
                    data = new List<object>()
                });
            }
        }

        [Route("NFContratos")]
        public IActionResult NFContratos(Guid id)
        {
            try
            {
                var NFList = (
                    from nf in _unitOfWork.NotaFiscal.GetAll()
                    orderby nf.NumeroNF descending
                    where nf.ContratoId == id
                    select new
                    {
                        nf.NotaFiscalId ,
                        nf.NumeroNF ,
                        nf.Objeto ,
                        nf.TipoNF ,
                        DataFormatada = nf.DataEmissao?.ToString("dd/MM/yyyy") ,
                        ValorNFFormatado = nf.ValorNF?.ToString("C") ,
                        ValorGlosaFormatado = nf.ValorGlosa?.ToString("C") ,
                        nf.MotivoGlosa ,
                        nf.ContratoId ,
                        nf.EmpenhoId ,
                    }
                ).ToList();

                return Json(new
                {
                    data = NFList
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("NotaFiscalController.cs" , "NFContratos" , error);
                return Json(new
                {
                    data = new List<object>()
                });
            }
        }

        [Route("NFEmpenhos")]
        public IActionResult NFEmpenhos(Guid id)
        {
            try
            {
                var NFList = (
                    from nf in _unitOfWork.NotaFiscal.GetAll()
                    orderby nf.NumeroNF descending
                    where nf.EmpenhoId == id
                    select new
                    {
                        nf.NotaFiscalId ,
                        nf.NumeroNF ,
                        nf.Objeto ,
                        nf.TipoNF ,
                        DataFormatada = nf.DataEmissao?.ToString("dd/MM/yyyy") ,
                        ValorNFFormatado = nf.ValorNF?.ToString("C") ,
                        ValorGlosaFormatado = nf.ValorGlosa?.ToString("C") ,
                        nf.MotivoGlosa ,
                        nf.ContratoId ,
                        nf.EmpenhoId ,
                    }
                ).ToList();

                return Json(new
                {
                    data = NFList
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("NotaFiscalController.cs" , "NFEmpenhos" , error);
                return Json(new
                {
                    data = new List<object>()
                });
            }
        }
    }

    public class GlosaNota
    {
        [Key]
        public Guid NotaFiscalId
        {
            get; set;
        }

        public double? ValorGlosa
        {
            get; set;
        }

        public string? MotivoGlosa
        {
            get; set;
        }
    }
}
