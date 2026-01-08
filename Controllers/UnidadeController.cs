using AspNetCoreHero.ToastNotification.Abstractions;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;

namespace FrotiX.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UnidadeController :Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly INotyfService _notyf;

        public UnidadeController(IUnitOfWork unitOfWork , INotyfService notyf)
        {
            try
            {
                _unitOfWork = unitOfWork;
                _notyf = notyf;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("UnidadeController.cs" , "UnidadeController" , error);
            }
        }

        [HttpGet]
        public IActionResult Get()
        {
            try
            {
                return Json(new
                {
                    data = _unitOfWork.Unidade.GetAll()
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("UnidadeController.cs" , "Get" , error);
                return Json(new
                {
                    success = false ,
                    message = "Erro ao carregar dados"
                });
            }
        }

        [Route("Delete")]
        [HttpPost]
        public IActionResult Delete(UnidadeViewModel model)
        {
            try
            {
                if (model != null && model.UnidadeId != Guid.Empty)
                {
                    var objFromDb = _unitOfWork.Unidade.GetFirstOrDefault(u =>
                        u.UnidadeId == model.UnidadeId
                    );
                    if (objFromDb != null)
                    {
                        var veiculo = _unitOfWork.Veiculo.GetFirstOrDefault(u =>
                            u.UnidadeId == model.UnidadeId
                        );
                        if (veiculo != null)
                        {
                            return Json(
                                new
                                {
                                    success = false ,
                                    message = "Existem veículos associados a essa unidade" ,
                                }
                            );
                        }
                        _unitOfWork.Unidade.Remove(objFromDb);
                        _unitOfWork.Save();
                        return Json(
                            new
                            {
                                success = true ,
                                message = "Unidade removida com sucesso"
                            }
                        );
                    }
                }
                return Json(new
                {
                    success = false ,
                    message = "Erro ao apagar Unidade"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("UnidadeController.cs" , "Delete" , error);
                return Json(new
                {
                    success = false ,
                    message = "Erro ao deletar unidade"
                });
            }
        }

        [Route("UpdateStatus")]
        public JsonResult UpdateStatus(Guid Id)
        {
            try
            {
                if (Id != Guid.Empty)
                {
                    var objFromDb = _unitOfWork.Unidade.GetFirstOrDefault(u => u.UnidadeId == Id);
                    string Description = "";
                    int type = 0;

                    if (objFromDb != null)
                    {
                        if (objFromDb.Status == true)
                        {
                            objFromDb.Status = false;
                            Description = string.Format(
                                "Atualizado Status da Unidade [Nome: {0}] (Inativo)" ,
                                objFromDb.Descricao
                            );
                            type = 1;
                        }
                        else
                        {
                            objFromDb.Status = true;
                            Description = string.Format(
                                "Atualizado Status da Unidade  [Nome: {0}] (Ativo)" ,
                                objFromDb.Descricao
                            );
                            type = 0;
                        }
                        _unitOfWork.Unidade.Update(objFromDb);
                    }
                    return Json(
                        new
                        {
                            success = true ,
                            //message = Description ,
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
                Alerta.TratamentoErroComLinha("UnidadeController.cs" , "UpdateStatus" , error);
                return new JsonResult(new
                {
                    success = false
                });
            }
        }

        [HttpGet]
        [Route("ListaLotacao")]
        public IActionResult ListaLotacao(string motoristaId)
        {
            try
            {
                var result = _unitOfWork.ViewLotacaoMotorista.GetAll(lm => lm.MotoristaId == Guid.Empty);

                if (motoristaId != null)
                {
                    result = _unitOfWork.ViewLotacaoMotorista.GetAll(lm =>
                        lm.MotoristaId == Guid.Parse(motoristaId)
                    );
                }

                return Json(new
                {
                    data = result
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("UnidadeController.cs" , "ListaLotacao" , error);
                return Json(new
                {
                    success = false ,
                    message = "Erro ao listar lotações"
                });
            }
        }

        [HttpGet]
        [Route("LotaMotorista")]
        public IActionResult LotaMotorista(
            string MotoristaId ,
            string UnidadeId ,
            string DataInicio ,
            string DataFim ,
            bool Lotado ,
            string Motivo
        )
        {
            try
            {
                var existeLotacao = _unitOfWork.LotacaoMotorista.GetFirstOrDefault(lm =>
                    (lm.MotoristaId == Guid.Parse(MotoristaId))
                    && (lm.UnidadeId == Guid.Parse(UnidadeId))
                    && lm.DataInicio.ToString() == DataInicio
                );
                if (existeLotacao != null)
                {
                    _notyf.Error("Já existe uma lotação com essas informações!" , 3);
                    return new JsonResult(new
                    {
                        data = "00000000-0000-0000-0000-000000000000"
                    });
                }

                var objLotacaoMotorista = new LotacaoMotorista();
                objLotacaoMotorista.MotoristaId = Guid.Parse(MotoristaId);
                objLotacaoMotorista.UnidadeId = Guid.Parse(UnidadeId);
                objLotacaoMotorista.DataInicio = DateTime.Parse(DataInicio);
                if (DataFim != null)
                {
                    objLotacaoMotorista.DataFim = DateTime.Parse(DataFim);
                }
                objLotacaoMotorista.Lotado = Lotado;
                objLotacaoMotorista.Motivo = Motivo;

                _unitOfWork.LotacaoMotorista.Add(objLotacaoMotorista);

                var obJMotorista = _unitOfWork.Motorista.GetFirstOrDefault(m =>
                    m.MotoristaId == Guid.Parse(MotoristaId)
                );
                obJMotorista.UnidadeId = Guid.Parse(UnidadeId);
                _unitOfWork.Motorista.Update(obJMotorista);

                _unitOfWork.Save();

                return new JsonResult(
                    new
                    {
                        data = MotoristaId ,
                        message = "Lotação Adicionada com Sucesso" ,
                        lotacaoId = objLotacaoMotorista.LotacaoMotoristaId ,
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("UnidadeController.cs" , "LotaMotorista" , error);
                return Json(new
                {
                    success = false ,
                    message = "Erro ao lotar motorista"
                });
            }
        }

        [HttpGet]
        [Route("EditaLotacao")]
        public IActionResult EditaLotacao(
            string LotacaoId ,
            string MotoristaId ,
            string UnidadeId ,
            string DataInicio ,
            string DataFim ,
            bool Lotado ,
            string Motivo
        )
        {
            try
            {
                var objLotacaoMotorista = _unitOfWork.LotacaoMotorista.GetFirstOrDefault(lm =>
                    (lm.LotacaoMotoristaId == Guid.Parse(LotacaoId))
                );
                objLotacaoMotorista.MotoristaId = Guid.Parse(MotoristaId);
                objLotacaoMotorista.UnidadeId = Guid.Parse(UnidadeId);
                objLotacaoMotorista.DataInicio = DateTime.Parse(DataInicio);
                if (DataFim != null)
                {
                    objLotacaoMotorista.DataFim = DateTime.Parse(DataFim);
                }
                else
                {
                    objLotacaoMotorista.DataFim = null;
                }
                objLotacaoMotorista.Lotado = Lotado;
                objLotacaoMotorista.Motivo = Motivo;
                _unitOfWork.LotacaoMotorista.Update(objLotacaoMotorista);

                var obJMotorista = _unitOfWork.Motorista.GetFirstOrDefault(m =>
                    m.MotoristaId == Guid.Parse(MotoristaId)
                );
                obJMotorista.UnidadeId = Guid.Parse(UnidadeId);
                _unitOfWork.Motorista.Update(obJMotorista);

                _unitOfWork.Save();

                return new JsonResult(
                    new
                    {
                        data = MotoristaId ,
                        message = "Lotação Alterada com Sucesso"
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("UnidadeController.cs" , "EditaLotacao" , error);
                return Json(new
                {
                    success = false ,
                    message = "Erro ao editar lotação"
                });
            }
        }

        [Route("DeleteLotacao")]
        [HttpGet]
        public IActionResult DeleteLotacao(string Id)
        {
            try
            {
                var objFromDb = _unitOfWork.LotacaoMotorista.GetFirstOrDefault(u =>
                    u.LotacaoMotoristaId == Guid.Parse(Id)
                );
                var motoristaId = objFromDb.MotoristaId;
                _unitOfWork.LotacaoMotorista.Remove(objFromDb);
                _unitOfWork.Save();

                var obJMotorista = _unitOfWork.Motorista.GetFirstOrDefault(m =>
                    m.MotoristaId == motoristaId
                );
                obJMotorista.UnidadeId = Guid.Empty;
                _unitOfWork.Motorista.Update(obJMotorista);

                return Json(
                    new
                    {
                        success = true ,
                        message = "Lotação removida com sucesso" ,
                        motoristaId = motoristaId ,
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("UnidadeController.cs" , "DeleteLotacao" , error);
                return Json(new
                {
                    success = false ,
                    message = "Erro ao deletar lotação"
                });
            }
        }

        [HttpGet]
        [Route("AtualizaMotoristaLotacaoAtual")]
        public IActionResult AtualizaMotoristaLotacaoAtual(
            string MotoristaId ,
            string UnidadeAtualId ,
            string UnidadeNovaId ,
            string DataFimLotacaoAnterior ,
            string DataInicioNovoMotivo ,
            string MotivoLotacaoAtual
        )
        {
            try
            {
                if (UnidadeNovaId == null)
                {
                    var obJMotorista = _unitOfWork.Motorista.GetFirstOrDefault(m =>
                        m.MotoristaId == Guid.Parse(MotoristaId)
                    );
                    obJMotorista.UnidadeId = Guid.Empty;
                    _unitOfWork.Motorista.Update(obJMotorista);

                    var obJLotacao = _unitOfWork.LotacaoMotorista.GetFirstOrDefault(lm =>
                        lm.UnidadeId == Guid.Parse(UnidadeAtualId)
                    );
                    obJLotacao.Lotado = false;
                    obJLotacao.DataFim = DateTime.Parse(DataFimLotacaoAnterior);
                    _unitOfWork.LotacaoMotorista.Update(obJLotacao);
                }
                else if (UnidadeAtualId != UnidadeNovaId)
                {
                    var obJMotorista = _unitOfWork.Motorista.GetFirstOrDefault(m =>
                        m.MotoristaId == Guid.Parse(MotoristaId)
                    );
                    obJMotorista.UnidadeId = Guid.Parse(UnidadeNovaId);
                    _unitOfWork.Motorista.Update(obJMotorista);

                    var obJLotacao = _unitOfWork.LotacaoMotorista.GetFirstOrDefault(lm =>
                        lm.UnidadeId == Guid.Parse(UnidadeAtualId)
                    );
                    obJLotacao.Lotado = false;
                    obJLotacao.DataFim = DateTime.Parse(DataFimLotacaoAnterior);
                    _unitOfWork.LotacaoMotorista.Update(obJLotacao);

                    var objLotacaoMotorista = new LotacaoMotorista();
                    objLotacaoMotorista.MotoristaId = Guid.Parse(MotoristaId);
                    objLotacaoMotorista.UnidadeId = Guid.Parse(UnidadeNovaId);
                    objLotacaoMotorista.DataInicio = DateTime.Parse(DataInicioNovoMotivo);
                    objLotacaoMotorista.Lotado = true;
                    objLotacaoMotorista.Motivo = MotivoLotacaoAtual;
                    _unitOfWork.LotacaoMotorista.Update(objLotacaoMotorista);
                }

                _unitOfWork.Save();

                return new JsonResult(
                    new
                    {
                        data = MotoristaId ,
                        message = "Remoção feita com Sucesso"
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "UnidadeController.cs" ,
                    "AtualizaMotoristaLotacaoAtual" ,
                    error
                );
                return Json(new
                {
                    success = false ,
                    message = "Erro ao atualizar lotação"
                });
            }
        }

        [HttpGet]
        [Route("AlocaMotoristaCobertura")]
        public IActionResult AlocaMotoristaCobertura(
            string MotoristaId ,
            string MotoristaCoberturaId ,
            string DataFimLotacao ,
            string DataInicioLotacao ,
            string DataInicioCobertura ,
            string DataFimCobertura ,
            string UnidadeId
        )
        {
            try
            {
                // Desabilita Motorista Atual da Sua Locacao
                var objMotoristaAtual = _unitOfWork.LotacaoMotorista.GetFirstOrDefault(lm =>
                    (lm.MotoristaId == Guid.Parse(MotoristaId) && lm.Lotado == true)
                );
                if (objMotoristaAtual != null)
                {
                    objMotoristaAtual.DataFim = DateTime.Parse(DataFimLotacao);
                    objMotoristaAtual.Lotado = false;
                    objMotoristaAtual.Motivo = "Férias";
                    if (MotoristaCoberturaId != null)
                    {
                        objMotoristaAtual.MotoristaCoberturaId = Guid.Parse(MotoristaCoberturaId);
                    }
                    _unitOfWork.LotacaoMotorista.Update(objMotoristaAtual);
                }

                // Insere Motorista Atual em Nova Locacao
                var objMotoristaLotacaoNova = new LotacaoMotorista();
                objMotoristaLotacaoNova.MotoristaId = Guid.Parse(MotoristaId);
                objMotoristaLotacaoNova.DataInicio = DateTime.Parse(DataInicioLotacao);
                objMotoristaLotacaoNova.DataFim = DateTime.Parse(DataFimLotacao);
                objMotoristaLotacaoNova.Lotado = true;
                objMotoristaLotacaoNova.Motivo = "Férias";
                if (MotoristaCoberturaId != null)
                {
                    objMotoristaAtual.MotoristaCoberturaId = Guid.Parse(MotoristaCoberturaId);
                }
                _unitOfWork.LotacaoMotorista.Add(objMotoristaLotacaoNova);

                // Remove Motorista Cobertura da Lotação Atual
                if (MotoristaCoberturaId != null)
                {
                    var objCobertura = _unitOfWork.LotacaoMotorista.GetFirstOrDefault(lm =>
                        (lm.MotoristaId == Guid.Parse(MotoristaCoberturaId) && lm.Lotado == true)
                    );
                    if (objCobertura != null)
                    {
                        objCobertura.DataFim = DateTime.Parse(DataInicioCobertura);
                        objCobertura.Lotado = false;
                        _unitOfWork.LotacaoMotorista.Update(objCobertura);
                    }
                }

                // Aloca Motorista em Nova Lotação
                if (MotoristaCoberturaId != null)
                {
                    var objLotacaoMotorista = new LotacaoMotorista();
                    objLotacaoMotorista.MotoristaId = Guid.Parse(MotoristaCoberturaId);
                    objLotacaoMotorista.UnidadeId = Guid.Parse(UnidadeId);
                    objLotacaoMotorista.DataInicio = DateTime.Parse(DataInicioCobertura);
                    objLotacaoMotorista.DataFim = DateTime.Parse(DataFimCobertura);
                    objLotacaoMotorista.Lotado = true;
                    objLotacaoMotorista.Motivo = "Cobertura";
                    _unitOfWork.LotacaoMotorista.Add(objLotacaoMotorista);
                }

                _unitOfWork.Save();

                return new JsonResult(
                    new
                    {
                        data = MotoristaId ,
                        message = "Remoção feita com Sucesso"
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "UnidadeController.cs" ,
                    "AlocaMotoristaCobertura" ,
                    error
                );
                return Json(new
                {
                    success = false ,
                    message = "Erro ao alocar motorista cobertura"
                });
            }
        }

        [HttpGet]
        [Route("ListaLotacoes")]
        public IActionResult ListaLotacoes(string categoriaId)
        {
            try
            {
                var result = _unitOfWork
                    .ViewLotacoes.GetAll()
                    .OrderBy(vl => vl.NomeCategoria)
                    .ThenBy(vl => vl.Unidade)
                    .ToList();

                if (categoriaId != null)
                {
                    result = _unitOfWork
                        .ViewLotacoes.GetAll(vl => vl.NomeCategoria == categoriaId)
                        .OrderBy(O => O.NomeCategoria)
                        .ThenBy(vl => vl.Unidade)
                        .ToList();
                }

                return Json(new
                {
                    data = result
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("UnidadeController.cs" , "ListaLotacoes" , error);
                return Json(new
                {
                    success = false ,
                    message = "Erro ao listar lotações"
                });
            }
        }

        private void DesativarLotacoes(string motoristaId , Guid lotacaoAtualId)
        {
            try
            {
                var lotacoesAnteriores = _unitOfWork.LotacaoMotorista.GetAll(lm =>
                    lm.MotoristaId == Guid.Parse(motoristaId)
                    && lm.Lotado == true
                );
                foreach (var lotacao in lotacoesAnteriores)
                {
                    if (lotacao.LotacaoMotoristaId == lotacaoAtualId)
                    {
                        continue;
                    }
                    else
                    {
                        lotacao.Lotado = false;
                        _unitOfWork.LotacaoMotorista.Update(lotacao);
                    }
                }
                _unitOfWork.Save();
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("UnidadeController.cs" , "DesativarLotacoes" , error);
                return;
            }
        }

        [HttpGet]
        [Route("RemoveLotacoes")]
        public IActionResult RemoveLotacoes(string motoristaId , Guid lotacaoAtualId)
        {
            try
            {
                DesativarLotacoes(motoristaId , lotacaoAtualId);
                return new JsonResult(new
                {
                    success = true
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("UnidadeController.cs" , "RemoveLotacoes" , error);
                return Json(new
                {
                    success = false ,
                    message = "Erro ao remover lotações"
                });
            }
        }
    }
}
