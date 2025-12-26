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
    public partial class NotaFiscalController : Controller
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
                Alerta.TratamentoErroComLinha("NotaFiscalController.cs", "NotaFiscalController", error);
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
                Alerta.TratamentoErroComLinha("NotaFiscalController.cs", "Get", error);
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
                        if (empenho != null)
                        {
                            // Ao excluir NF, devolver o valor líquido ao empenho
                            empenho.SaldoFinal = empenho.SaldoFinal + ((objFromDb.ValorNF ?? 0) - (objFromDb.ValorGlosa ?? 0));
                            _unitOfWork.Empenho.Update(empenho);
                        }

                        _unitOfWork.NotaFiscal.Remove(objFromDb);
                        _unitOfWork.Save();
                        return Json(new
                        {
                            success = true,
                            message = "Nota Fiscal removida com sucesso"
                        });
                    }
                }
                return Json(new
                {
                    success = false,
                    message = "Erro ao apagar Nota Fiscal"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("NotaFiscalController.cs", "Delete", error);
                return Json(new
                {
                    success = false,
                    message = "Erro ao apagar Nota Fiscal"
                });
            }
        }

        [Route("GetGlosa")]
        [HttpGet]
        public IActionResult GetGlosa(Guid id)
        {
            try
            {
                var notaFiscal = _unitOfWork.NotaFiscal.GetFirstOrDefault(u =>
                    u.NotaFiscalId == id
                );

                if (notaFiscal == null)
                {
                    return Json(new
                    {
                        success = false,
                        message = "Nota Fiscal não encontrada"
                    });
                }

                return Json(new
                {
                    success = true,
                    notaFiscalId = notaFiscal.NotaFiscalId,
                    numeroNF = notaFiscal.NumeroNF,
                    valorNF = notaFiscal.ValorNF ?? 0,
                    valorGlosa = notaFiscal.ValorGlosa ?? 0,
                    valorGlosaFormatado = (notaFiscal.ValorGlosa ?? 0).ToString("N2"),
                    motivoGlosa = notaFiscal.MotivoGlosa ?? "",
                    temGlosa = (notaFiscal.ValorGlosa ?? 0) > 0
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("NotaFiscalController.cs", "GetGlosa", error);
                return Json(new
                {
                    success = false,
                    message = "Erro ao buscar dados da glosa"
                });
            }
        }

        [Route("Glosa")]
        [HttpPost]
        [Consumes("application/json")]
        public IActionResult Glosa([FromBody] GlosaNota glosanota)
        {
            try
            {
                // Buscar nota fiscal
                var notaFiscal = _unitOfWork.NotaFiscal.GetFirstOrDefault(u =>
                    u.NotaFiscalId == glosanota.NotaFiscalId
                );

                if (notaFiscal == null)
                {
                    return Json(new
                    {
                        success = false,
                        message = "Nota Fiscal não encontrada"
                    });
                }

                // Valor da glosa informada (converter de centavos se necessário)
                var valorGlosaInformada = glosanota.ValorGlosa ?? 0;
                
                // Se o valor parece estar em centavos (muito maior que o valor da NF), dividir por 100
                if (valorGlosaInformada > 100 && valorGlosaInformada > (notaFiscal.ValorNF ?? 0) * 1.5)
                {
                    valorGlosaInformada = valorGlosaInformada / 100;
                }

                // Glosa antiga
                var glosaAntiga = notaFiscal.ValorGlosa ?? 0;

                // Calcular nova glosa baseado no modo
                double novaGlosa;
                if (glosanota.ModoGlosa == "somar")
                {
                    novaGlosa = glosaAntiga + valorGlosaInformada;
                }
                else // substituir
                {
                    novaGlosa = valorGlosaInformada;
                }

                // Validar se glosa não excede o valor da NF
                if (novaGlosa > (notaFiscal.ValorNF ?? 0))
                {
                    return Json(new
                    {
                        success = false,
                        message = $"O valor da glosa (R$ {novaGlosa:N2}) não pode ser maior que o valor da Nota Fiscal (R$ {notaFiscal.ValorNF:N2})"
                    });
                }

                // Calcular diferença para ajustar o saldo do empenho
                // A glosa AUMENTA o saldo (devolve dinheiro ao empenho)
                var diferencaGlosa = novaGlosa - glosaAntiga;

                // Atualizar nota fiscal
                notaFiscal.ValorGlosa = novaGlosa;
                notaFiscal.MotivoGlosa = glosanota.MotivoGlosa;
                _unitOfWork.NotaFiscal.Update(notaFiscal);

                // Atualizar saldo do empenho
                var empenho = _unitOfWork.Empenho.GetFirstOrDefault(u =>
                    u.EmpenhoId == notaFiscal.EmpenhoId
                );

                if (empenho != null)
                {
                    // Glosa aumenta o saldo (devolve o valor ao empenho)
                    empenho.SaldoFinal = empenho.SaldoFinal + diferencaGlosa;
                    _unitOfWork.Empenho.Update(empenho);
                }

                _unitOfWork.Save();

                var mensagem = glosanota.ModoGlosa == "somar"
                    ? $"Glosa somada com sucesso! Valor total: R$ {novaGlosa:N2}"
                    : $"Glosa atualizada com sucesso! Novo valor: R$ {novaGlosa:N2}";

                return Json(new
                {
                    success = true,
                    message = mensagem,
                    novaGlosa = novaGlosa,
                    novaGlosaFormatada = novaGlosa.ToString("N2")
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("NotaFiscalController.cs", "Glosa", error);
                return Json(new
                {
                    success = false,
                    message = "Erro ao realizar glosa: " + error.Message
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
                Alerta.TratamentoErroComLinha("NotaFiscalController.cs", "EmpenhoList", error);
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
                Alerta.TratamentoErroComLinha("NotaFiscalController.cs", "EmpenhoListAta", error);
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
                Alerta.TratamentoErroComLinha("NotaFiscalController.cs", "GetContrato", error);
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
                        nf.NotaFiscalId,
                        nf.NumeroNF,
                        nf.Objeto,
                        nf.TipoNF,
                        DataFormatada = nf.DataEmissao?.ToString("dd/MM/yyyy"),
                        ValorNFFormatado = nf.ValorNF?.ToString("C"),
                        ValorGlosaFormatado = nf.ValorGlosa?.ToString("C"),
                        nf.MotivoGlosa,
                        nf.ContratoId,
                        nf.EmpenhoId,
                    }
                ).ToList();

                return Json(new
                {
                    data = NFList
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("NotaFiscalController.cs", "NFContratos", error);
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
                        nf.NotaFiscalId,
                        nf.NumeroNF,
                        nf.Objeto,
                        nf.TipoNF,
                        DataFormatada = nf.DataEmissao?.ToString("dd/MM/yyyy"),
                        ValorNFFormatado = nf.ValorNF?.ToString("C"),
                        ValorGlosaFormatado = nf.ValorGlosa?.ToString("C"),
                        nf.MotivoGlosa,
                        nf.ContratoId,
                        nf.EmpenhoId,
                    }
                ).ToList();

                return Json(new
                {
                    data = NFList
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("NotaFiscalController.cs", "NFEmpenhos", error);
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
        public Guid NotaFiscalId { get; set; }

        public double? ValorGlosa { get; set; }

        public string? MotivoGlosa { get; set; }

        public string? ModoGlosa { get; set; } // "somar" ou "substituir"
    }
}
