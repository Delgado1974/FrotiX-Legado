using FrotiX.Data;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace FrotiX.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [IgnoreAntiforgeryToken]
    public partial class ContratoController :Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly FrotiXDbContext _db;

        public ContratoController(IUnitOfWork unitOfWork , FrotiXDbContext db)
        {
            try
            {
                _unitOfWork = unitOfWork;
                _db = db;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ContratoController.cs" , "ContratoController" , error);
            }
        }

        [HttpGet]
        public IActionResult Get()
        {
            try
            {
                var result = (
                    from c in _unitOfWork.Contrato.GetAll()
                    join f in _unitOfWork.Fornecedor.GetAll()
                        on c.FornecedorId equals f.FornecedorId
                    orderby c.AnoContrato descending
                    select new
                    {
                        ContratoCompleto = c.AnoContrato + "/" + c.NumeroContrato ,
                        ProcessoCompleto = c.NumeroProcesso
                            + "/"
                            + c.AnoProcesso.ToString().Substring(2 , 2) ,
                        c.Objeto ,
                        f.DescricaoFornecedor ,
                        Periodo = c.DataInicio?.ToString("dd/MM/yy")
                            + " a "
                            + c.DataFim?.ToString("dd/MM/yy") ,
                        ValorFormatado = c.Valor?.ToString("C") ,
                        ValorMensal = (c.Valor / 12)?.ToString("C") ,
                        VigenciaCompleta = c.Vigencia
                            + "ª vigência + "
                            + c.Prorrogacao
                            + " prorrog." ,
                        c.Status ,
                        c.ContratoId ,
                    }
                ).ToList().OrderByDescending(c => c.ContratoCompleto);

                return Json(new
                {
                    data = result
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ContratoController.cs" , "Get" , error);
                return StatusCode(500);
            }
        }

        [Route("Delete")]
        [HttpPost]
        public IActionResult Delete(ContratoViewModel model)
        {
            try
            {
                if (model != null && model.ContratoId != Guid.Empty)
                {
                    var objFromDb = _unitOfWork.Contrato.GetFirstOrDefault(u =>
                        u.ContratoId == model.ContratoId
                    );
                    if (objFromDb != null)
                    {
                        var veiculo = _unitOfWork.Veiculo.GetFirstOrDefault(v =>
                            v.ContratoId == model.ContratoId
                        );
                        if (veiculo != null)
                        {
                            return Json(
                                new
                                {
                                    success = false ,
                                    message = "Existem veículos associados a esse contrato" ,
                                }
                            );
                        }

                        var empenho = _unitOfWork.Empenho.GetFirstOrDefault(u =>
                            u.ContratoId == model.ContratoId
                        );
                        if (empenho != null)
                        {
                            return Json(
                                new
                                {
                                    success = false ,
                                    message = "Existem empenhos associados a esse contrato" ,
                                }
                            );
                        }

                        var objRepactuacao = _unitOfWork.RepactuacaoContrato.GetAll(riv =>
                            riv.ContratoId == model.ContratoId
                        );
                        foreach (var repactuacao in objRepactuacao)
                        {
                            var objItemRepactuacao = _unitOfWork.ItemVeiculoContrato.GetAll(ivc =>
                                ivc.RepactuacaoContratoId == repactuacao.RepactuacaoContratoId
                            );
                            foreach (var itemveiculo in objItemRepactuacao)
                            {
                                _unitOfWork.ItemVeiculoContrato.Remove(itemveiculo);
                            }
                            _unitOfWork.RepactuacaoContrato.Remove(repactuacao);
                        }

                        _unitOfWork.Contrato.Remove(objFromDb);
                        _unitOfWork.Save();
                        return Json(
                            new
                            {
                                success = true ,
                                message = "Contrato removido com sucesso"
                            }
                        );
                    }
                }
                return Json(new
                {
                    success = false ,
                    message = "Erro ao apagar Contrato"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ContratoController.cs" , "Delete" , error);
                return StatusCode(500);
            }
        }

        [Route("UpdateStatusContrato")]
        public JsonResult UpdateStatusContrato(Guid Id)
        {
            try
            {
                if (Id != Guid.Empty)
                {
                    var objFromDb = _unitOfWork.Contrato.GetFirstOrDefault(u => u.ContratoId == Id);
                    string Description = "";
                    int type = 0;

                    if (objFromDb != null)
                    {
                        if (objFromDb.Status == true)
                        {
                            objFromDb.Status = false;
                            Description = string.Format(
                                "Atualizado Status do Contrato [Nome: {0}] (Inativo)" ,
                                objFromDb.AnoContrato + "/" + objFromDb.NumeroContrato
                            );
                            type = 1;
                        }
                        else
                        {
                            objFromDb.Status = true;
                            Description = string.Format(
                                "Atualizado Status do Contrato  [Nome: {0}] (Ativo)" ,
                                objFromDb.AnoContrato + "/" + objFromDb.NumeroContrato
                            );
                            type = 0;
                        }
                        _unitOfWork.Contrato.Update(objFromDb);
                    }
                    return Json(
                        new
                        {
                            success = true ,
                            message = Description ,
                            type = type ,
                        }
                    );
                }
                return Json(new
                {
                    success = false
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "ContratoController.cs" ,
                    "UpdateStatusContrato" ,
                    error
                );
                return new JsonResult(new
                {
                    sucesso = false
                });
            }
        }

        [Route("ListaContratos")]
        public async Task<JsonResult> OnGetListaContratos(string? tipoContrato = "")
        {
            try
            {
                var items = await _unitOfWork
                    .Contrato.GetDropDown(tipoContrato)
                    .ToListAsync();

                return new JsonResult(new
                {
                    data = items
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "ContratoController.cs" ,
                    "OnGetListaContratos" ,
                    error
                );
                return new JsonResult(new
                {
                    sucesso = false
                });
            }
        }

        [Route("ListaContratosVeiculosGlosa")]
        public async Task<JsonResult> ListaContratosVeiculosGlosa(string? tipoContrato = "")
        {
            try
            {
                var contratos = await _db.Set<Contrato>()
                    .AsNoTracking()
                    .Where(c => c.TipoContrato == "Locação" && c.Status)
                    .OrderByDescending(c => c.AnoContrato)
                    .ThenByDescending(c => c.NumeroContrato)
                    .ThenByDescending(c => c.Fornecedor.DescricaoFornecedor)
                    .Select(c => new SelectListItem
                    {
                        Value = c.ContratoId.ToString() ,
                        Text =
                            $"{c.AnoContrato}/{c.NumeroContrato} - {c.Fornecedor.DescricaoFornecedor}" ,
                    })
                    .ToListAsync();

                return new JsonResult(new
                {
                    data = contratos
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "ContratoController.cs" ,
                    "ListaContratosVeiculosGlosa" ,
                    error
                );
                return new JsonResult(new
                {
                    sucesso = false
                });
            }
        }

        [Route("PegaContrato")]
        [HttpGet]
        public IActionResult PegaContrato(Guid id)
        {
            try
            {
                var result = (
                    from c in _unitOfWork.Contrato.GetAll()
                    where c.ContratoId == id
                    select new
                    {
                        c.ContratoLavadores ,
                        c.ContratoMotoristas ,
                        c.ContratoOperadores ,
                        c.TipoContrato ,
                        c.ContratoId ,
                    }
                ).ToList();

                return Json(new
                {
                    data = result
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ContratoController.cs" , "PegaContrato" , error);
                return StatusCode(500);
            }
        }

        [Route("InsereContrato")]
        [HttpPost]
        public JsonResult InsereContrato(Models.Contrato contrato)
        {
            try
            {
                var existeContrato = _unitOfWork.Contrato.GetFirstOrDefault(u =>
                    (u.AnoContrato == contrato.AnoContrato)
                    && (u.NumeroContrato == contrato.NumeroContrato)
                );
                if (existeContrato != null && existeContrato.ContratoId != contrato.ContratoId)
                {
                    return new JsonResult(
                        new
                        {
                            data = "00000000-0000-0000-0000-000000000000" ,
                            message = "Já existe um contrato com esse número" ,
                        }
                    );
                }

                _unitOfWork.Contrato.Add(contrato);

                var objRepactuacao = new RepactuacaoContrato();
                objRepactuacao.DataRepactuacao = contrato.DataInicio;
                objRepactuacao.Descricao = "Valor Inicial";
                objRepactuacao.ContratoId = contrato.ContratoId;
                objRepactuacao.Valor = contrato.Valor;
                _unitOfWork.RepactuacaoContrato.Add(objRepactuacao);

                _unitOfWork.Save();

                return new JsonResult(
                    new
                    {
                        data = objRepactuacao.RepactuacaoContratoId ,
                        message = "Contrato Adicionado com Sucesso" ,
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ContratoController.cs" , "InsereContrato" , error);
                return new JsonResult(new
                {
                    sucesso = false
                });
            }
        }

        [Route("InsereRepactuacao")]
        [HttpPost]
        public JsonResult InsereRepactuacao(RepactuacaoContrato repactuacaoContrato)
        {
            try
            {
                var objRepactuacao = new RepactuacaoContrato();
                objRepactuacao.DataRepactuacao = repactuacaoContrato.DataRepactuacao;
                objRepactuacao.Valor = repactuacaoContrato.Valor;
                objRepactuacao.Descricao = repactuacaoContrato.Descricao;
                objRepactuacao.ContratoId = repactuacaoContrato.ContratoId;
                objRepactuacao.Vigencia = repactuacaoContrato.Vigencia;
                objRepactuacao.Prorrogacao = repactuacaoContrato.Prorrogacao;

                _unitOfWork.RepactuacaoContrato.Add(objRepactuacao);

                var objContrato = _unitOfWork.Contrato.GetFirstOrDefault(c =>
                    c.ContratoId == repactuacaoContrato.ContratoId
                );

                objContrato.Valor = repactuacaoContrato.Valor;
                objContrato.DataRepactuacao = repactuacaoContrato.DataRepactuacao;
                objContrato.Prorrogacao = repactuacaoContrato.Prorrogacao;
                objContrato.Vigencia = repactuacaoContrato.Vigencia;

                _unitOfWork.Contrato.Update(objContrato);

                _unitOfWork.Save();

                return new JsonResult(
                    new
                    {
                        data = objRepactuacao.RepactuacaoContratoId ,
                        message = "Repactuação Adicionada com Sucesso" ,
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ContratoController.cs" , "InsereRepactuacao" , error);
                return new JsonResult(new
                {
                    sucesso = false
                });
            }
        }

        [Route("AtualizaRepactuacao")]
        [HttpPost]
        public JsonResult AtualizaRepactuacao(RepactuacaoContrato repactuacaoContrato)
        {
            try
            {
                _unitOfWork.RepactuacaoContrato.Update(repactuacaoContrato);

                if (repactuacaoContrato.AtualizaContrato == true)
                {
                    var objContrato = _unitOfWork.Contrato.GetFirstOrDefault(c =>
                        c.ContratoId == repactuacaoContrato.ContratoId
                    );

                    objContrato.Valor = repactuacaoContrato.Valor;
                    objContrato.DataRepactuacao = repactuacaoContrato.DataRepactuacao;
                    objContrato.Prorrogacao = repactuacaoContrato.Prorrogacao;
                    objContrato.Vigencia = repactuacaoContrato.Vigencia;

                    _unitOfWork.Contrato.Update(objContrato);
                }

                _unitOfWork.Save();

                return new JsonResult(
                    new
                    {
                        data = repactuacaoContrato.RepactuacaoContratoId ,
                        message = "Repactuação Adicionada com Sucesso" ,
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "ContratoController.cs" ,
                    "AtualizaRepactuacao" ,
                    error
                );
                return new JsonResult(new
                {
                    sucesso = false
                });
            }
        }

        [Route("EditaContrato")]
        [HttpPost]
        public JsonResult EditaContrato(Models.Contrato contrato)
        {
            try
            {
                var existeContrato = _unitOfWork.Contrato.GetFirstOrDefault(u =>
                    (u.AnoContrato == contrato.AnoContrato)
                    && (u.NumeroContrato == contrato.NumeroContrato)
                );
                if (existeContrato != null && existeContrato.ContratoId != contrato.ContratoId)
                {
                    return new JsonResult(
                        new
                        {
                            data = "00000000-0000-0000-0000-000000000000" ,
                            message = "Já existe um contrato com esse número" ,
                        }
                    );
                }

                _unitOfWork.Contrato.Update(contrato);

                _unitOfWork.Save();

                return new JsonResult(
                    new
                    {
                        data = contrato ,
                        message = "Contrato Atualizado com Sucesso"
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ContratoController.cs" , "EditaContrato" , error);
                return new JsonResult(new
                {
                    sucesso = false
                });
            }
        }

        [Route("InsereItemContrato")]
        [HttpPost]
        public JsonResult InsereItemContrato(ItemVeiculoContrato itemveiculo)
        {
            try
            {
                _unitOfWork.ItemVeiculoContrato.Add(itemveiculo);

                _unitOfWork.Save();

                return new JsonResult(
                    new
                    {
                        data = itemveiculo.ItemVeiculoId ,
                        message = "Item Veiculo Contrato adicionado com sucesso" ,
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ContratoController.cs" , "InsereItemContrato" , error);
                return new JsonResult(new
                {
                    sucesso = false
                });
            }
        }

        [Route("AtualizaItemContrato")]
        [HttpPost]
        public JsonResult AtualizaItemContrato(ItemVeiculoContrato itemveiculo)
        {
            try
            {
                if (itemveiculo.ItemVeiculoId == Guid.Empty)
                {
                    var newItemContrato = new ItemVeiculoContrato();
                    newItemContrato.NumItem = itemveiculo.NumItem;
                    newItemContrato.Quantidade = itemveiculo.Quantidade;
                    newItemContrato.Descricao = itemveiculo.Descricao;
                    newItemContrato.ValorUnitario = itemveiculo.ValorUnitario;
                    newItemContrato.RepactuacaoContratoId = itemveiculo.RepactuacaoContratoId;

                    _unitOfWork.ItemVeiculoContrato.Add(newItemContrato);
                }
                else
                {
                    _unitOfWork.ItemVeiculoContrato.Update(itemveiculo);
                }
                _unitOfWork.Save();

                return new JsonResult(
                    new
                    {
                        data = itemveiculo.ItemVeiculoId ,
                        message = "Item Veiculo Contrato adicionado com sucesso" ,
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "ContratoController.cs" ,
                    "AtualizaItemContrato" ,
                    error
                );
                return new JsonResult(new
                {
                    sucesso = false
                });
            }
        }

        [Route("ApagaItemContrato")]
        [HttpPost]
        public JsonResult ApagaItemContrato(ItemVeiculoContrato itemveiculo)
        {
            try
            {
                _unitOfWork.ItemVeiculoContrato.Remove(itemveiculo);

                _unitOfWork.Save();

                return new JsonResult(
                    new
                    {
                        data = itemveiculo.ItemVeiculoId ,
                        message = "Item Veiculo Contrato Eliminado com sucesso" ,
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ContratoController.cs" , "ApagaItemContrato" , error);
                return new JsonResult(new
                {
                    sucesso = false
                });
            }
        }

        [Route("InsereRepactuacaoTerceirizacao")]
        [HttpPost]
        public JsonResult InsereRepactuacaoTerceirizacao(
            RepactuacaoTerceirizacao repactuacaoTerceirizacao
        )
        {
            try
            {
                _unitOfWork.RepactuacaoTerceirizacao.Add(repactuacaoTerceirizacao);

                _unitOfWork.Save();

                return new JsonResult(
                    new
                    {
                        data = repactuacaoTerceirizacao.RepactuacaoTerceirizacaoId ,
                        message = "Repactuação do Contrato adicionada com sucesso" ,
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "ContratoController.cs" ,
                    "InsereRepactuacaoTerceirizacao" ,
                    error
                );
                return new JsonResult(new
                {
                    sucesso = false
                });
            }
        }

        [Route("AtualizaRepactuacaoTerceirizacao")]
        [HttpPost]
        public JsonResult AtualizaRepactuacaoTerceirizacao(
            RepactuacaoTerceirizacao repactuacaoTerceirizacao
        )
        {
            try
            {
                _unitOfWork.RepactuacaoTerceirizacao.Update(repactuacaoTerceirizacao);

                _unitOfWork.Save();

                return new JsonResult(
                    new
                    {
                        data = repactuacaoTerceirizacao.RepactuacaoTerceirizacaoId ,
                        message = "Repactuação do Contrato adicionada com sucesso" ,
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "ContratoController.cs" ,
                    "AtualizaRepactuacaoTerceirizacao" ,
                    error
                );
                return new JsonResult(new
                {
                    sucesso = false
                });
            }
        }

        [Route("InsereRepactuacaoServicos")]
        [HttpPost]
        public JsonResult InsereRepactuacaoServicos(RepactuacaoServicos repactuacaoServicos)
        {
            try
            {
                _unitOfWork.RepactuacaoServicos.Add(repactuacaoServicos);

                _unitOfWork.Save();

                return new JsonResult(
                    new
                    {
                        data = repactuacaoServicos.RepactuacaoServicoId ,
                        message = "Repactuação do Contrato adicionada com sucesso" ,
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "ContratoController.cs" ,
                    "InsereRepactuacaoServicos" ,
                    error
                );
                return new JsonResult(new
                {
                    sucesso = false
                });
            }
        }

        [Route("AtualizaRepactuacaoServicos")]
        [HttpPost]
        public JsonResult AtualizaRepactuacaoServicos(RepactuacaoServicos repactuacaoServicos)
        {
            try
            {
                _unitOfWork.RepactuacaoServicos.Update(repactuacaoServicos);

                _unitOfWork.Save();

                return new JsonResult(
                    new
                    {
                        data = repactuacaoServicos.RepactuacaoServicoId ,
                        message = "Repactuação do Contrato adicionada com sucesso" ,
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "ContratoController.cs" ,
                    "AtualizaRepactuacaoServicos" ,
                    error
                );
                return new JsonResult(new
                {
                    sucesso = false
                });
            }
        }

        [Route("RepactuacaoList")]
        [HttpGet]
        public JsonResult RepactuacaoList(Guid id)
        {
            try
            {
                var RepactuacaoList = (
                    from r in _unitOfWork.RepactuacaoContrato.GetAll()
                    where r.ContratoId == id
                    orderby r.DataRepactuacao descending, r.Prorrogacao descending
                    select new
                    {
                        DataFormatada = r.DataRepactuacao?.ToString("dd/MM/yy"),
                        r.Descricao,
                        r.RepactuacaoContratoId,
                        Valor = r.Valor?.ToString("C"),
                        ValorMensal = (r.Valor / 12)?.ToString("C"),
                        r.Vigencia,
                        r.Prorrogacao,
                        Repactuacao = "("
                            + r.DataRepactuacao?.ToString("dd/MM/yy")
                            + ") "
                            + r.Descricao,
                    }
                ).ToList();

                return new JsonResult(new
                {
                    data = RepactuacaoList
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ContratoController.cs", "RepactuacaoList", error);
                return new JsonResult(new
                {
                    sucesso = false
                });
            }
        }

        [Route("RecuperaTipoContrato")]
        [HttpGet]
        public ActionResult RecuperaTipoContrato(Guid Id)
        {
            try
            {
                var contratoObj = _unitOfWork.Contrato.GetFirstOrDefault(c => c.ContratoId == Id);

                return Json(new
                {
                    data = contratoObj
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "ContratoController.cs" ,
                    "RecuperaTipoContrato" ,
                    error
                );
                return StatusCode(500);
            }
        }

        [Route("RecuperaRepactuacaoTerceirizacao")]
        [HttpGet]
        public ActionResult RecuperaRepactuacaoTerceirizacao(string RepactuacaoContratoId)
        {
            try
            {
                var objRepactuacaoTerceirizacao =
                    _unitOfWork.RepactuacaoTerceirizacao.GetFirstOrDefault(r =>
                        r.RepactuacaoContratoId == Guid.Parse(RepactuacaoContratoId)
                    );

                return Json(new
                {
                    objRepactuacaoTerceirizacao
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "ContratoController.cs" ,
                    "RecuperaRepactuacaoTerceirizacao" ,
                    error
                );
                return StatusCode(500);
            }
        }

        [Route("ExisteItem")]
        [HttpGet]
        public ActionResult ExisteItem(Guid RepactuacaoContratoId)
        {
            try
            {
                var objRepactuacaoLocacao = (
                    from v in _unitOfWork.Veiculo.GetAll()
                    join ivc in _unitOfWork.ItemVeiculoContrato.GetAll()
                        on v.ItemVeiculoId equals ivc.ItemVeiculoId
                    where ivc.RepactuacaoContratoId == RepactuacaoContratoId
                    orderby ivc.NumItem
                    select new
                    {
                        v.VeiculoId
                    }
                ).ToList();

                if (objRepactuacaoLocacao.Count() == 0)
                {
                    return Json(new
                    {
                        existeItem = false
                    });
                }
                else
                {
                    return Json(new
                    {
                        existeItem = true
                    });
                }
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ContratoController.cs" , "ExisteItem" , error);
                return StatusCode(500);
            }
        }

        [Route("ApagaRepactuacao")]
        [HttpGet]
        public JsonResult ApagaRepactuacao(Guid Id)
        {
            try
            {
                try
                {
                    var objRepactuacaoLocacao = _unitOfWork.ItemVeiculoContrato.GetAll(iv =>
                        iv.RepactuacaoContratoId == Id
                    );
                    foreach (var itemLocacao in objRepactuacaoLocacao)
                    {
                        _unitOfWork.ItemVeiculoContrato.Remove(itemLocacao);
                    }

                    var objRepactuacaoTerceirizacao = _unitOfWork.RepactuacaoTerceirizacao.GetAll(
                        rt => rt.RepactuacaoContratoId == Id
                    );
                    foreach (var itemTerceirizacao in objRepactuacaoTerceirizacao)
                    {
                        _unitOfWork.RepactuacaoTerceirizacao.Remove(itemTerceirizacao);
                    }

                    var objRepactuacaoServicos = _unitOfWork.RepactuacaoServicos.GetAll(rs =>
                        rs.RepactuacaoContratoId == Id
                    );
                    foreach (var itemServico in objRepactuacaoServicos)
                    {
                        _unitOfWork.RepactuacaoServicos.Remove(itemServico);
                    }

                    var objRepactuacao = _unitOfWork.RepactuacaoContrato.GetFirstOrDefault(rc =>
                        rc.RepactuacaoContratoId == Id
                    );
                    _unitOfWork.RepactuacaoContrato.Remove(objRepactuacao);

                    _unitOfWork.Save();

                    return new JsonResult(
                        new
                        {
                            success = true ,
                            message = "Repactuação Excluída com Sucesso!"
                        }
                    );
                }
                catch (Exception)
                {
                    return new JsonResult(
                        new
                        {
                            success = false ,
                            message = "Existem Veículos Associados a Essa Repactuação!" ,
                        }
                    );
                }
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ContratoController.cs" , "DeleteOS" , error);
                return new JsonResult(new
                {
                    sucesso = false
                });
            }
        }

        [Route("UltimaRepactuacao")]
        [HttpGet]
        public IActionResult UltimaRepactuacao(Guid contratoId)
        {
            try
            {
                try
                {
                    var objRepactuacao = _unitOfWork
                        .RepactuacaoContrato.GetAll(rc => rc.ContratoId == contratoId)
                        .OrderByDescending(rc => rc.DataRepactuacao)
                        .First();

                    var objRepactuacaoContratoId = objRepactuacao.RepactuacaoContratoId;

                    return Json(objRepactuacaoContratoId);
                }
                catch (Exception)
                {
                    return Json(Guid.Empty);
                }
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ContratoController.cs" , "UltimaRepactuacao" , error);
                return StatusCode(500);
            }
        }

        [Route("RecuperaItensUltimaRepactuacao")]
        [HttpGet]
        public IActionResult RecuperaItensUltimaRepactuacao(Guid repactuacaoContratoId)
        {
            try
            {
                var itens = _unitOfWork.ItemVeiculoContrato.GetAll()
                    .Where(ivc => ivc.RepactuacaoContratoId == repactuacaoContratoId)
                    .ToList();

                var veiculosComItem = _unitOfWork.Veiculo.GetAll()
                    .Where(v => v.ItemVeiculoId != null)
                    .Select(v => v.ItemVeiculoId)
                    .ToList();

                var result = itens
                    .OrderBy(ivc => ivc.NumItem)
                    .Select(ivc => new
                    {
                        ivc.ItemVeiculoId,
                        ivc.RepactuacaoContratoId,
                        ivc.NumItem,
                        ivc.Descricao,
                        ivc.Quantidade,
                        valUnitario = ivc.ValorUnitario?.ToString("C"),
                        valTotal = (ivc.ValorUnitario * ivc.Quantidade)?.ToString("C"),
                        ExisteVeiculo = veiculosComItem.Contains(ivc.ItemVeiculoId)
                    })
                    .ToList();

                return Json(result);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "ContratoController.cs",
                    "RecuperaItensUltimaRepactuacao",
                    error
                );
                return StatusCode(500);
            }
        }

        [Route("ListaItensRepactuacao")]
        [HttpGet]
        public IActionResult ListaItensRepactuacao(Guid repactuacaoContratoId)
        {
            return RecuperaItensUltimaRepactuacao(repactuacaoContratoId);
        }

        [Route("RecuperaRepactuacaoCompleta")]
        [HttpGet]
        public IActionResult RecuperaRepactuacaoCompleta(Guid repactuacaoContratoId)
        {
            try
            {
                var repactuacao = _unitOfWork.RepactuacaoContrato.GetFirstOrDefault(
                    r => r.RepactuacaoContratoId == repactuacaoContratoId
                );

                if (repactuacao == null)
                {
                    return Json(new { success = false, message = "Repactuação não encontrada" });
                }

                var contrato = _unitOfWork.Contrato.GetFirstOrDefault(
                    c => c.ContratoId == repactuacao.ContratoId
                );

                object dadosEspecificos = null;
                var tipoContrato = contrato?.TipoContrato?.ToLower() ?? "";

                if (tipoContrato.Contains("terceiriz"))
                {
                    var terceirizacao = _unitOfWork.RepactuacaoTerceirizacao.GetFirstOrDefault(
                        t => t.RepactuacaoContratoId == repactuacaoContratoId
                    );
                    if (terceirizacao != null)
                    {
                        dadosEspecificos = new
                        {
                            valorEncarregado = terceirizacao.ValorEncarregado,
                            qtdEncarregados = terceirizacao.QtdEncarregados,
                            valorOperador = terceirizacao.ValorOperador,
                            qtdOperadores = terceirizacao.QtdOperadores,
                            valorMotorista = terceirizacao.ValorMotorista,
                            qtdMotoristas = terceirizacao.QtdMotoristas,
                            valorLavador = terceirizacao.ValorLavador,
                            qtdLavadores = terceirizacao.QtdLavadores
                        };
                    }
                }
                else if (tipoContrato.Contains("servic"))
                {
                    var servicos = _unitOfWork.RepactuacaoServicos.GetFirstOrDefault(
                        s => s.RepactuacaoContratoId == repactuacaoContratoId
                    );
                    if (servicos != null)
                    {
                        dadosEspecificos = new { valor = servicos.Valor };
                    }
                }

                return Json(new
                {
                    success = true,
                    repactuacao = new
                    {
                        repactuacao.RepactuacaoContratoId,
                        repactuacao.ContratoId,
                        repactuacao.DataRepactuacao,
                        repactuacao.Descricao,
                        repactuacao.Valor,
                        repactuacao.Vigencia,
                        repactuacao.Prorrogacao
                    },
                    tipoContrato = contrato?.TipoContrato,
                    dadosEspecificos
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ContratoController.cs", "RecuperaRepactuacaoCompleta", error);
                return StatusCode(500);
            }
        }

        [Route("MoverVeiculosRepactuacao")]
        [HttpPost]
        public IActionResult MoverVeiculosRepactuacao([FromBody] MoverVeiculosViewModel model)
        {
            try
            {
                // Buscar a nova repactuação para obter o ContratoId
                var novaRepactuacao = _unitOfWork.RepactuacaoContrato.GetFirstOrDefault(
                    r => r.RepactuacaoContratoId == model.NovaRepactuacaoId
                );

                if (novaRepactuacao == null)
                {
                    return Json(new { success = false, message = "Nova repactuação não encontrada" });
                }

                // Buscar itens da nova repactuação
                var itensNovos = _unitOfWork.ItemVeiculoContrato.GetAll()
                    .Where(ivc => ivc.RepactuacaoContratoId == model.NovaRepactuacaoId)
                    .ToList();

                if (!itensNovos.Any())
                {
                    return Json(new { success = false, message = "Não há itens na nova repactuação" });
                }

                // Buscar TODAS as repactuações do mesmo contrato (exceto a nova)
                var repactuacoesAnteriores = _unitOfWork.RepactuacaoContrato.GetAll()
                    .Where(r => r.ContratoId == novaRepactuacao.ContratoId && 
                                r.RepactuacaoContratoId != model.NovaRepactuacaoId)
                    .Select(r => r.RepactuacaoContratoId)
                    .ToList();

                // Buscar TODOS os itens de TODAS as repactuações anteriores do contrato
                var itensAnteriores = _unitOfWork.ItemVeiculoContrato.GetAll()
                    .Where(ivc => repactuacoesAnteriores.Contains(ivc.RepactuacaoContratoId))
                    .ToList();

                if (!itensAnteriores.Any())
                {
                    return Json(new { success = false, message = "Não há itens nas repactuações anteriores" });
                }

                int veiculosMovidos = 0;

                // Para cada item da nova repactuação, buscar itens correspondentes (mesmo NumItem) 
                // em TODAS as repactuações anteriores
                foreach (var itemNovo in itensNovos)
                {
                    // Buscar todos os itens anteriores com mesmo NumItem
                    var itensCorrespondentes = itensAnteriores
                        .Where(i => i.NumItem == itemNovo.NumItem)
                        .ToList();

                    foreach (var itemAnterior in itensCorrespondentes)
                    {
                        // Buscar veículos que têm ItemVeiculoId do item anterior
                        var veiculos = _unitOfWork.Veiculo.GetAll()
                            .Where(v => v.ItemVeiculoId == itemAnterior.ItemVeiculoId)
                            .ToList();

                        foreach (var veiculo in veiculos)
                        {
                            veiculo.ItemVeiculoId = itemNovo.ItemVeiculoId;
                            _unitOfWork.Veiculo.Update(veiculo);
                            veiculosMovidos++;
                        }
                    }
                }

                if (veiculosMovidos > 0)
                {
                    _unitOfWork.Save();
                    return Json(new
                    {
                        success = true,
                        message = $"{veiculosMovidos} veículo(s) movido(s) para a nova repactuação"
                    });
                }
                else
                {
                    return Json(new { success = false, message = "Nenhum veículo encontrado para mover" });
                }
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ContratoController.cs", "MoverVeiculosRepactuacao", error);
                return StatusCode(500);
            }
        }
    }

    // ViewModel para mover veículos entre repactuações
    public class MoverVeiculosViewModel
    {
        public Guid RepactuacaoAnteriorId { get; set; }
        public Guid NovaRepactuacaoId { get; set; }
    }
}
