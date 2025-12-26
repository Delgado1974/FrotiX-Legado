using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;

namespace FrotiX.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [IgnoreAntiforgeryToken]
    public class EmpenhoController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;

        public EmpenhoController(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("EmpenhoController.cs", "EmpenhoController", error);
            }
        }

        [HttpGet]
        public IActionResult Get(Guid Id, string instrumento)
        {
            try
            {
                if (instrumento == "contrato")
                {
                    var result = (
                        from ve in _unitOfWork.ViewEmpenhos.GetAll()
                        where ve.ContratoId == Id
                        select new
                        {
                            ve.EmpenhoId,
                            ve.NotaEmpenho,
                            VigenciaInicialFormatada = ve.VigenciaInicial?.ToString("dd/MM/yyyy"),
                            VigenciaFinalFormatada = ve.VigenciaFinal?.ToString("dd/MM/yyyy"),
                            SaldoInicialFormatado = ve.SaldoInicial?.ToString("C"),
                            SaldoFinalFormatado = ve.SaldoFinal?.ToString("C"),
                            SaldoMovimentacaoFormatado = ve.SaldoMovimentacao?.ToString("C"),
                            SaldoNFFormatado = ve.Movimentacoes != 0
                                ? (ve.SaldoNotas / ve.Movimentacoes)?.ToString("C")
                                : ve.SaldoNotas?.ToString("C"),
                        }
                    ).ToList();
                    return Json(new
                    {
                        data = result
                    });
                }
                else
                {
                    var result = (
                        from ve in _unitOfWork.ViewEmpenhos.GetAll()
                        where ve.AtaId == Id
                        select new
                        {
                            ve.EmpenhoId,
                            ve.NotaEmpenho,
                            ve.AnoVigencia,
                            SaldoInicialFormatado = ve.SaldoInicial?.ToString("C"),
                            SaldoFinalFormatado = ve.SaldoFinal?.ToString("C"),
                            SaldoMovimentacaoFormatado = ve.SaldoMovimentacao?.ToString("C"),
                            SaldoNFFormatado = ve.Movimentacoes != 0
                                ? (ve.SaldoNotas / ve.Movimentacoes)?.ToString("C")
                                : ve.SaldoNotas?.ToString("C"),
                        }
                    ).ToList();
                    return Json(new
                    {
                        data = result
                    });
                }
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("EmpenhoController.cs", "Get", error);
                return StatusCode(500);
            }
        }

        [Route("Delete")]
        [HttpPost]
        public IActionResult Delete(EmpenhoViewModel model)
        {
            try
            {
                if (model != null && model.EmpenhoId != Guid.Empty)
                {
                    var objFromDb = _unitOfWork.Empenho.GetFirstOrDefault(u =>
                        u.EmpenhoId == model.EmpenhoId
                    );
                    if (objFromDb != null)
                    {
                        var notas = _unitOfWork.NotaFiscal.GetFirstOrDefault(u =>
                            u.EmpenhoId == model.EmpenhoId
                        );
                        if (notas != null)
                        {
                            return Json(
                                new
                                {
                                    success = false,
                                    message = "Existem notas associadas a esse empenho",
                                }
                            );
                        }

                        var movimentacao = _unitOfWork.MovimentacaoEmpenho.GetFirstOrDefault(u =>
                            u.EmpenhoId == model.EmpenhoId
                        );
                        if (movimentacao != null)
                        {
                            return Json(
                                new
                                {
                                    success = false,
                                    message = "Existem movimentações associadas a esse empenho",
                                }
                            );
                        }

                        _unitOfWork.Empenho.Remove(objFromDb);
                        _unitOfWork.Save();
                        return Json(
                            new
                            {
                                success = true,
                                message = "Empenho removido com sucesso"
                            }
                        );
                    }
                }
                return Json(new
                {
                    success = false,
                    message = "Erro ao apagar Empenho"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("EmpenhoController.cs", "Delete", error);
                return StatusCode(500);
            }
        }

        [Route("Aporte")]
        [HttpPost]
        [Consumes("application/json")]
        public IActionResult Aporte([FromBody] MovimentacaoEmpenho movimentacao)
        {
            try
            {
                // Valor já vem correto do frontend (sem divisão por 100)
                _unitOfWork.MovimentacaoEmpenho.Add(movimentacao);

                var empenho = _unitOfWork.Empenho.GetFirstOrDefault(u =>
                    u.EmpenhoId == movimentacao.EmpenhoId
                );
                empenho.SaldoFinal = empenho.SaldoFinal + movimentacao.Valor;
                _unitOfWork.Empenho.Update(empenho);

                _unitOfWork.Save();

                return Json(
                    new
                    {
                        success = true,
                        message = "Aporte realizado com sucesso",
                        type = 0,
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("EmpenhoController.cs", "Aporte", error);
                return StatusCode(500);
            }
        }

        [Route("EditarAporte")]
        [HttpPost]
        [Consumes("application/json")]
        public IActionResult EditarAporte([FromBody] MovimentacaoEmpenho movimentacao)
        {
            try
            {
                var movimentacaoDb = _unitOfWork.MovimentacaoEmpenho.GetFirstOrDefault(u =>
                    u.MovimentacaoId == movimentacao.MovimentacaoId
                );

                var valorAnterior = movimentacaoDb.Valor;

                // Valor já vem correto do frontend (sem divisão por 100)
                _unitOfWork.MovimentacaoEmpenho.Update(movimentacao);

                var empenho = _unitOfWork.Empenho.GetFirstOrDefault(u =>
                    u.EmpenhoId == movimentacao.EmpenhoId
                );
                empenho.SaldoFinal = empenho.SaldoFinal - valorAnterior + movimentacao.Valor;
                _unitOfWork.Empenho.Update(empenho);

                _unitOfWork.Save();

                return Json(
                    new
                    {
                        success = true,
                        message = "Aporte editado com sucesso",
                        type = 0,
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("EmpenhoController.cs", "EditarAporte", error);
                return StatusCode(500);
            }
        }

        [Route("EditarAnulacao")]
        [HttpPost]
        [Consumes("application/json")]
        public IActionResult EditarAnulacao([FromBody] MovimentacaoEmpenho movimentacao)
        {
            try
            {
                var movimentacaoDb = _unitOfWork.MovimentacaoEmpenho.GetFirstOrDefault(u =>
                    u.MovimentacaoId == movimentacao.MovimentacaoId
                );

                var valorAnterior = movimentacaoDb.Valor;

                // Valor já vem correto do frontend (sem divisão por 100)
                _unitOfWork.MovimentacaoEmpenho.Update(movimentacao);

                var empenho = _unitOfWork.Empenho.GetFirstOrDefault(u =>
                    u.EmpenhoId == movimentacao.EmpenhoId
                );
                empenho.SaldoFinal = empenho.SaldoFinal + valorAnterior - movimentacao.Valor;
                _unitOfWork.Empenho.Update(empenho);

                _unitOfWork.Save();

                return Json(
                    new
                    {
                        success = true,
                        message = "Anulação editada com sucesso",
                        type = 0,
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("EmpenhoController.cs", "EditarAnulacao", error);
                return StatusCode(500);
            }
        }

        [Route("DeleteMovimentacao")]
        [HttpPost]
        public IActionResult DeleteMovimentacao([FromBody] DeleteMovimentacaoWrapperViewModel model)
        {
            try
            {
                if (model.mEmpenho != null && model.mEmpenho.MovimentacaoId != Guid.Empty)
                {
                    var objFromDb = _unitOfWork.MovimentacaoEmpenho.GetFirstOrDefault(u =>
                        u.MovimentacaoId == model.mEmpenho.MovimentacaoId
                    );
                    if (objFromDb != null)
                    {
                        var empenho = _unitOfWork.Empenho.GetFirstOrDefault(u =>
                            u.EmpenhoId == objFromDb.EmpenhoId
                        );

                        if (objFromDb.TipoMovimentacao == "A")
                        {
                            empenho.SaldoFinal = empenho.SaldoFinal - objFromDb.Valor;
                        }
                        else
                        {
                            empenho.SaldoFinal = empenho.SaldoFinal + objFromDb.Valor;
                        }
                        _unitOfWork.Empenho.Update(empenho);

                        _unitOfWork.MovimentacaoEmpenho.Remove(objFromDb);
                        _unitOfWork.Save();
                        return Json(
                            new
                            {
                                success = true,
                                message = "Movimentação removida com sucesso"
                            }
                        );
                    }
                }
                else if (
                    model.mEmpenhoMulta != null
                    && model.mEmpenhoMulta.MovimentacaoId != Guid.Empty
                )
                {
                    var objFromDb = _unitOfWork.MovimentacaoEmpenhoMulta.GetFirstOrDefault(u =>
                        u.MovimentacaoId == model.mEmpenhoMulta.MovimentacaoId
                    );
                    if (objFromDb != null)
                    {
                        var empenhoMulta = _unitOfWork.EmpenhoMulta.GetFirstOrDefault(u =>
                            u.EmpenhoMultaId == objFromDb.EmpenhoMultaId
                        );

                        if (objFromDb.TipoMovimentacao == "A")
                        {
                            empenhoMulta.SaldoAtual = empenhoMulta.SaldoAtual - objFromDb.Valor;
                        }
                        else
                        {
                            empenhoMulta.SaldoAtual = empenhoMulta.SaldoAtual + objFromDb.Valor;
                        }
                        _unitOfWork.EmpenhoMulta.Update(empenhoMulta);

                        _unitOfWork.MovimentacaoEmpenhoMulta.Remove(objFromDb);
                        _unitOfWork.Save();
                        return Json(
                            new
                            {
                                success = true,
                                message = "Movimentação removida com sucesso"
                            }
                        );
                    }
                }
                return Json(new
                {
                    success = false,
                    message = "Erro ao apagar Movimentação"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("EmpenhoController.cs", "DeleteMovimentacao", error);
                return StatusCode(500);
            }
        }

        [Route("Anulacao")]
        [HttpPost]
        [Consumes("application/json")]
        public IActionResult Anulacao([FromBody] MovimentacaoEmpenho movimentacao)
        {
            try
            {
                // Valor já vem correto do frontend (sem divisão por 100)
                // Multiplica por -1 para tornar negativo (é uma anulação/redução)
                movimentacao.Valor = movimentacao.Valor * -1;
                _unitOfWork.MovimentacaoEmpenho.Add(movimentacao);

                var empenho = _unitOfWork.Empenho.GetFirstOrDefault(u =>
                    u.EmpenhoId == movimentacao.EmpenhoId
                );
                empenho.SaldoFinal = empenho.SaldoFinal + movimentacao.Valor;
                _unitOfWork.Empenho.Update(empenho);

                _unitOfWork.Save();

                return Json(
                    new
                    {
                        success = true,
                        message = "Anulação realizada com sucesso",
                        type = 0,
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("EmpenhoController.cs", "Anulacao", error);
                return StatusCode(500);
            }
        }

        [Route("ListaAporte")]
        [HttpGet]
        public IActionResult ListaAporte(Guid Id)
        {
            try
            {
                var result = (
                    from p in _unitOfWork.MovimentacaoEmpenho.GetAll()
                    where p.TipoMovimentacao == "A"
                    orderby p.DataMovimentacao descending
                    where p.EmpenhoId == Id
                    select new
                    {
                        p.MovimentacaoId,
                        DataFormatada = p.DataMovimentacao?.ToString("dd/MM/yyyy"),
                        p.Descricao,
                        ValorFormatado = p.Valor?.ToString("C"),
                        ValorOriginal = p.Valor,
                    }
                ).ToList();

                return Json(new
                {
                    data = result
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("EmpenhoController.cs", "ListaAporte", error);
                return StatusCode(500);
            }
        }

        [Route("ListaAnulacao")]
        [HttpGet]
        public IActionResult ListaAnulacao(Guid Id)
        {
            try
            {
                var result = (
                    from p in _unitOfWork.MovimentacaoEmpenho.GetAll()
                    where p.TipoMovimentacao == "G"
                    orderby p.DataMovimentacao descending
                    where p.EmpenhoId == Id
                    select new
                    {
                        p.MovimentacaoId,
                        DataFormatada = p.DataMovimentacao?.ToString("dd/MM/yyyy"),
                        p.Descricao,
                        ValorFormatado = p.Valor?.ToString("C"),
                        ValorOriginal = p.Valor,
                    }
                ).ToList();

                return Json(new
                {
                    data = result
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("EmpenhoController.cs", "ListaAnulacao", error);
                return StatusCode(500);
            }
        }

        [Route("SaldoNotas")]
        [HttpGet]
        public IActionResult SaldoNotas(Guid Id)
        {
            try
            {
                var notas = _unitOfWork.NotaFiscal.GetAll(u => u.EmpenhoId == Id);

                double totalnotas = 0;

                foreach (var nota in notas)
                {
                    totalnotas = (double)(totalnotas + (nota.ValorNF - nota.ValorGlosa));
                }
                return Json(new
                {
                    saldonotas = totalnotas
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("EmpenhoController.cs", "SaldoNotas", error);
                return StatusCode(500);
            }
        }

        [Route("InsereEmpenho")]
        [HttpPost]
        [Consumes("application/json")]
        public JsonResult InsereEmpenho([FromBody] Empenho empenho)
        {
            try
            {
                // Validação básica
                if (empenho == null)
                {
                    return new JsonResult(new
                    {
                        success = false,
                        message = "Dados do empenho não recebidos"
                    });
                }

                // Verifica duplicidade
                var existeEmpenho = _unitOfWork.Empenho.GetFirstOrDefault(u =>
                    u.NotaEmpenho == empenho.NotaEmpenho
                );
                if (existeEmpenho != null)
                {
                    return new JsonResult(
                        new
                        {
                            success = false,
                            message = "Já existe um empenho com esse número"
                        }
                    );
                }

                // Limpa GUIDs vazios para null
                if (empenho.AtaId == Guid.Empty)
                {
                    empenho.AtaId = null;
                }

                if (empenho.ContratoId == Guid.Empty)
                {
                    empenho.ContratoId = null;
                }

                // Gera novo ID se não veio preenchido
                if (empenho.EmpenhoId == Guid.Empty)
                {
                    empenho.EmpenhoId = Guid.NewGuid();
                }

                _unitOfWork.Empenho.Add(empenho);
                _unitOfWork.Save();

                return new JsonResult(
                    new
                    {
                        success = true,
                        message = "Empenho Adicionado com Sucesso",
                        empenhoId = empenho.EmpenhoId
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("EmpenhoController.cs", "InsereEmpenho", error);
                return new JsonResult(new
                {
                    success = false,
                    message = "Erro ao inserir empenho: " + error.Message
                });
            }
        }

        [Route("EditaEmpenho")]
        [HttpPost]
        [Consumes("application/json")]
        public JsonResult EditaEmpenho([FromBody] Empenho empenho)
        {
            try
            {
                // Validação básica
                if (empenho == null || empenho.EmpenhoId == Guid.Empty)
                {
                    return new JsonResult(new
                    {
                        success = false,
                        message = "Dados do empenho inválidos"
                    });
                }

                // Verifica duplicidade (excluindo o próprio registro)
                var existeEmpenho = _unitOfWork.Empenho.GetFirstOrDefault(u =>
                    u.NotaEmpenho == empenho.NotaEmpenho &&
                    u.EmpenhoId != empenho.EmpenhoId
                );
                if (existeEmpenho != null)
                {
                    return new JsonResult(
                        new
                        {
                            success = false,
                            message = "Já existe outro empenho com esse número"
                        }
                    );
                }

                // Limpa GUIDs vazios para null
                if (empenho.AtaId == Guid.Empty)
                {
                    empenho.AtaId = null;
                }

                if (empenho.ContratoId == Guid.Empty)
                {
                    empenho.ContratoId = null;
                }

                _unitOfWork.Empenho.Update(empenho);
                _unitOfWork.Save();

                return new JsonResult(
                    new
                    {
                        success = true,
                        message = "Empenho Alterado com Sucesso"
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("EmpenhoController.cs", "EditaEmpenho", error);
                return new JsonResult(new
                {
                    success = false,
                    message = "Erro ao editar empenho: " + error.Message
                });
            }
        }
    }
}
