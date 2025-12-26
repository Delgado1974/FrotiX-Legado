using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;

namespace FrotiX.Controllers
{
    public partial class NotaFiscalController : Controller
    {
        [Route("Insere")]
        [HttpPost]
        [Consumes("application/json")]
        public IActionResult Insere([FromBody] NotaFiscal model)
        {
            try
            {
                if (model == null)
                {
                    return Json(new { success = false, message = "Dados inválidos" });
                }

                // Validações básicas
                if (model.NumeroNF == null || model.NumeroNF == 0)
                {
                    return Json(new { success = false, message = "O número da Nota Fiscal é obrigatório" });
                }

                if (model.EmpenhoId == null || model.EmpenhoId == Guid.Empty)
                {
                    return Json(new { success = false, message = "O Empenho é obrigatório" });
                }

                if (model.ValorNF == null || model.ValorNF == 0)
                {
                    return Json(new { success = false, message = "O valor da Nota Fiscal é obrigatório" });
                }

                // Gerar novo ID
                model.NotaFiscalId = Guid.NewGuid();

                // Inicializar ValorGlosa se null
                if (model.ValorGlosa == null)
                {
                    model.ValorGlosa = 0;
                }

                // Atualizar saldo do empenho
                var empenho = _unitOfWork.Empenho.GetFirstOrDefault(e => e.EmpenhoId == model.EmpenhoId);
                if (empenho != null)
                {
                    empenho.SaldoFinal = empenho.SaldoFinal - (model.ValorNF - model.ValorGlosa);
                    _unitOfWork.Empenho.Update(empenho);
                }

                _unitOfWork.NotaFiscal.Add(model);
                _unitOfWork.Save();

                return Json(new
                {
                    success = true,
                    message = "Nota Fiscal cadastrada com sucesso!",
                    notaFiscalId = model.NotaFiscalId
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("NotaFiscalController.cs", "Insere", error);
                return Json(new
                {
                    success = false,
                    message = "Erro ao cadastrar Nota Fiscal: " + error.Message
                });
            }
        }

        [Route("Edita")]
        [HttpPost]
        [Consumes("application/json")]
        public IActionResult Edita([FromBody] NotaFiscal model)
        {
            try
            {
                if (model == null || model.NotaFiscalId == Guid.Empty)
                {
                    return Json(new { success = false, message = "Dados inválidos" });
                }

                // Validações básicas
                if (model.NumeroNF == null || model.NumeroNF == 0)
                {
                    return Json(new { success = false, message = "O número da Nota Fiscal é obrigatório" });
                }

                if (model.EmpenhoId == null || model.EmpenhoId == Guid.Empty)
                {
                    return Json(new { success = false, message = "O Empenho é obrigatório" });
                }

                if (model.ValorNF == null || model.ValorNF == 0)
                {
                    return Json(new { success = false, message = "O valor da Nota Fiscal é obrigatório" });
                }

                // Buscar nota fiscal existente
                var objFromDb = _unitOfWork.NotaFiscal.GetFirstOrDefault(u =>
                    u.NotaFiscalId == model.NotaFiscalId
                );

                if (objFromDb == null)
                {
                    return Json(new { success = false, message = "Nota Fiscal não encontrada" });
                }

                // Calcular diferença de valor para ajustar saldo do empenho
                var valorAntigoLiquido = (objFromDb.ValorNF ?? 0) - (objFromDb.ValorGlosa ?? 0);
                var valorNovoLiquido = (model.ValorNF ?? 0) - (model.ValorGlosa ?? 0);
                var diferencaValor = valorNovoLiquido - valorAntigoLiquido;

                // Atualizar saldo do empenho (se mudou)
                if (diferencaValor != 0)
                {
                    // Se mudou o empenho, reverter no antigo e aplicar no novo
                    if (objFromDb.EmpenhoId != model.EmpenhoId)
                    {
                        // Reverter no empenho antigo
                        var empenhoAntigo = _unitOfWork.Empenho.GetFirstOrDefault(e => e.EmpenhoId == objFromDb.EmpenhoId);
                        if (empenhoAntigo != null)
                        {
                            empenhoAntigo.SaldoFinal = empenhoAntigo.SaldoFinal + valorAntigoLiquido;
                            _unitOfWork.Empenho.Update(empenhoAntigo);
                        }

                        // Aplicar no novo empenho
                        var empenhoNovo = _unitOfWork.Empenho.GetFirstOrDefault(e => e.EmpenhoId == model.EmpenhoId);
                        if (empenhoNovo != null)
                        {
                            empenhoNovo.SaldoFinal = empenhoNovo.SaldoFinal - valorNovoLiquido;
                            _unitOfWork.Empenho.Update(empenhoNovo);
                        }
                    }
                    else
                    {
                        // Mesmo empenho, só ajustar a diferença
                        var empenho = _unitOfWork.Empenho.GetFirstOrDefault(e => e.EmpenhoId == model.EmpenhoId);
                        if (empenho != null)
                        {
                            empenho.SaldoFinal = empenho.SaldoFinal - diferencaValor;
                            _unitOfWork.Empenho.Update(empenho);
                        }
                    }
                }
                else if (objFromDb.EmpenhoId != model.EmpenhoId)
                {
                    // Valor não mudou mas empenho mudou
                    var empenhoAntigo = _unitOfWork.Empenho.GetFirstOrDefault(e => e.EmpenhoId == objFromDb.EmpenhoId);
                    if (empenhoAntigo != null)
                    {
                        empenhoAntigo.SaldoFinal = empenhoAntigo.SaldoFinal + valorAntigoLiquido;
                        _unitOfWork.Empenho.Update(empenhoAntigo);
                    }

                    var empenhoNovo = _unitOfWork.Empenho.GetFirstOrDefault(e => e.EmpenhoId == model.EmpenhoId);
                    if (empenhoNovo != null)
                    {
                        empenhoNovo.SaldoFinal = empenhoNovo.SaldoFinal - valorNovoLiquido;
                        _unitOfWork.Empenho.Update(empenhoNovo);
                    }
                }

                // Atualizar campos
                objFromDb.NumeroNF = model.NumeroNF;
                objFromDb.DataEmissao = model.DataEmissao;
                objFromDb.TipoNF = model.TipoNF;
                objFromDb.MesReferencia = model.MesReferencia;
                objFromDb.AnoReferencia = model.AnoReferencia;
                objFromDb.ValorNF = model.ValorNF;
                objFromDb.ValorGlosa = model.ValorGlosa ?? 0;
                objFromDb.Objeto = model.Objeto;
                objFromDb.MotivoGlosa = model.MotivoGlosa;
                objFromDb.EmpenhoId = model.EmpenhoId;
                objFromDb.ContratoId = model.ContratoId;
                objFromDb.AtaId = model.AtaId;

                _unitOfWork.NotaFiscal.Update(objFromDb);
                _unitOfWork.Save();

                return Json(new
                {
                    success = true,
                    message = "Nota Fiscal atualizada com sucesso!"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("NotaFiscalController.cs", "Edita", error);
                return Json(new
                {
                    success = false,
                    message = "Erro ao atualizar Nota Fiscal: " + error.Message
                });
            }
        }
    }
}
