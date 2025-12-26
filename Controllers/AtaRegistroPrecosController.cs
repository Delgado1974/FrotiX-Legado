using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;

namespace FrotiX.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public partial class AtaRegistroPrecosController :ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public AtaRegistroPrecosController(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "AtaRegistroPrecosController.cs" ,
                    "AtaRegistroPrecosController" ,
                    error
                );
            }
        }

        [HttpGet]
        public IActionResult Get()
        {
            try
            {
                var result = (
                    from a in _unitOfWork.AtaRegistroPrecos.GetAll()
                    join f in _unitOfWork.Fornecedor.GetAll()
                        on a.FornecedorId equals f.FornecedorId
                    orderby a.AnoAta descending
                    select new
                    {
                        AtaCompleta = a.AnoAta + "/" + a.NumeroAta ,
                        ProcessoCompleto = a.NumeroProcesso
                            + "/"
                            + a.AnoProcesso.ToString().Substring(2 , 2) ,
                        a.Objeto ,
                        f.DescricaoFornecedor ,
                        Periodo = a.DataInicio?.ToString("dd/MM/yy")
                            + " a "
                            + a.DataFim?.ToString("dd/MM/yy") ,
                        ValorFormatado = a.Valor?.ToString("C") ,
                        a.Status ,
                        a.AtaId ,
                    }
                ).ToList();

                return Ok(new
                {
                    data = result
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AtaRegistroPrecosController.cs" , "Get" , error);
                return StatusCode(500);
            }
        }

        [Route("Delete")]
        [HttpPost]
        public IActionResult Delete(AtaRegistroPrecosViewModel model)
        {
            try
            {
                if (model != null && model.AtaId != Guid.Empty)
                {
                    var objFromDb = _unitOfWork.AtaRegistroPrecos.GetFirstOrDefault(u =>
                        u.AtaId == model.AtaId
                    );
                    if (objFromDb != null)
                    {
                        var veiculo = _unitOfWork.VeiculoAta.GetFirstOrDefault(u =>
                            u.AtaId == model.AtaId
                        );
                        if (veiculo != null)
                        {
                            return Ok(
                                new
                                {
                                    success = false ,
                                    message = "Existem veículos associados a essa Ata" ,
                                }
                            );
                        }

                        var objRepactuacao = _unitOfWork.RepactuacaoAta.GetAll(riv =>
                            riv.AtaId == model.AtaId
                        );
                        foreach (var repactuacao in objRepactuacao)
                        {
                            var objItemRepactuacao = _unitOfWork.ItemVeiculoAta.GetAll(iva =>
                                iva.RepactuacaoAtaId == repactuacao.RepactuacaoAtaId
                            );
                            foreach (var itemveiculo in objItemRepactuacao)
                            {
                                _unitOfWork.ItemVeiculoAta.Remove(itemveiculo);
                            }
                            _unitOfWork.RepactuacaoAta.Remove(repactuacao);
                        }

                        _unitOfWork.AtaRegistroPrecos.Remove(objFromDb);
                        _unitOfWork.Save();
                        return Ok(new
                        {
                            success = true ,
                            message = "Ata removida com sucesso"
                        });
                    }
                }
                return Ok(new
                {
                    success = false ,
                    message = "Erro ao apagar Ata"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AtaRegistroPrecosController.cs" , "Delete" , error);
                return StatusCode(500);
            }
        }

        [Route("UpdateStatusAta")]
        [HttpPost]
        public IActionResult UpdateStatusAta(Guid Id)
        {
            try
            {
                if (Id != Guid.Empty)
                {
                    var objFromDb = _unitOfWork.AtaRegistroPrecos.GetFirstOrDefault(u =>
                        u.AtaId == Id
                    );
                    string Description = string.Empty;
                    int type = 0;

                    if (objFromDb != null)
                    {
                        if (objFromDb.Status == true)
                        {
                            objFromDb.Status = false;
                            Description = string.Format(
                                "Atualizado Status da Ata [Nome: {0}] (Inativo)" ,
                                objFromDb.AnoAta + "/" + objFromDb.NumeroAta
                            );
                            type = 1;
                        }
                        else
                        {
                            objFromDb.Status = true;
                            Description = string.Format(
                                "Atualizado Status da Ata  [Nome: {0}] (Ativo)" ,
                                objFromDb.AnoAta + "/" + objFromDb.NumeroAta
                            );
                            type = 0;
                        }

                        _unitOfWork.AtaRegistroPrecos.Update(objFromDb);
                        _unitOfWork.Save();
                    }
                    return Ok(
                        new
                        {
                            success = true ,
                            message = Description ,
                            type ,
                        }
                    );
                }
                return Ok(new
                {
                    success = false
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "AtaRegistroPrecosController.cs" ,
                    "UpdateStatusAta" ,
                    error
                );
                return StatusCode(500);
            }
        }

        [Route("InsereAta")]
        [HttpPost]
        public IActionResult InsereAta(AtaRegistroPrecos ata)
        {
            try
            {
                var existeAta = _unitOfWork.AtaRegistroPrecos.GetFirstOrDefault(u =>
                    (u.AnoAta == ata.AnoAta) && (u.NumeroAta == ata.NumeroAta)
                );
                if (existeAta != null && existeAta.AtaId != ata.AtaId)
                {
                    return Ok(
                        new
                        {
                            success = false ,
                            data = "00000000-0000-0000-0000-000000000000" ,
                            message = "Já existe uma ata com esse número!" ,
                        }
                    );
                }

                _unitOfWork.AtaRegistroPrecos.Add(ata);

                var objRepactuacao = new RepactuacaoAta();
                objRepactuacao.DataRepactuacao = ata.DataInicio;
                objRepactuacao.Descricao = "Valor Inicial";
                objRepactuacao.AtaId = ata.AtaId;
                _unitOfWork.RepactuacaoAta.Add(objRepactuacao);

                _unitOfWork.Save();

                return Ok(
                    new
                    {
                        data = objRepactuacao.RepactuacaoAtaId ,
                        message = "Ata Adicionada com Sucesso" ,
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AtaRegistroPrecosController.cs" , "InsereAta" , error);
                return StatusCode(500);
            }
        }

        [Route("EditaAta")]
        [HttpPost]
        public IActionResult EditaAta(AtaRegistroPrecos ata)
        {
            try
            {
                var existeAta = _unitOfWork.AtaRegistroPrecos.GetFirstOrDefault(u =>
                    (u.AnoAta == ata.AnoAta) && (u.NumeroAta == ata.NumeroAta)
                );
                if (existeAta != null && existeAta.AtaId != ata.AtaId)
                {
                    return Ok(
                        new
                        {
                            data = "00000000-0000-0000-0000-000000000000" ,
                            message = "Já existe uma Ata com esse número" ,
                        }
                    );
                }

                _unitOfWork.AtaRegistroPrecos.Update(ata);
                _unitOfWork.Save();

                return Ok(new
                {
                    data = ata ,
                    message = "Ata Atualizada com Sucesso"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AtaRegistroPrecosController.cs" , "EditaAta" , error);
                return StatusCode(500);
            }
        }

        [Route("InsereItemAta")]
        [HttpPost]
        public IActionResult InsereItemAta(ItemVeiculoAta itemveiculo)
        {
            try
            {
                _unitOfWork.ItemVeiculoAta.Add(itemveiculo);
                _unitOfWork.Save();

                return Ok(
                    new
                    {
                        data = itemveiculo.ItemVeiculoAtaId ,
                        message = "Item Veiculo Ata adicionado com sucesso" ,
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "AtaRegistroPrecosController.cs" ,
                    "InsereItemAta" ,
                    error
                );
                return StatusCode(500);
            }
        }

        [Route("RepactuacaoList")]
        [HttpGet]
        public IActionResult RepactuacaoList(Guid id)
        {
            try
            {
                var RepactuacoList = (
                    from r in _unitOfWork.RepactuacaoAta.GetAll()
                    where r.AtaId == id
                    orderby r.DataRepactuacao
                    select new
                    {
                        r.RepactuacaoAtaId ,
                        Repactuacao = "("
                            + r.DataRepactuacao?.ToString("dd/MM/yy")
                            + ") "
                            + r.Descricao ,
                    }
                ).ToList();

                return Ok(new
                {
                    data = RepactuacoList
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "AtaRegistroPrecosController.cs" ,
                    "RepactuacaoList" ,
                    error
                );
                return StatusCode(500);
            }
        }

        [Route("ListaAtas")]
        [HttpGet]
        public IActionResult OnGetListaAtas(string id)
        {
            try
            {
                var AtaList = _unitOfWork.AtaRegistroPrecos.GetAtaListForDropDown(
                    Convert.ToInt32(id)
                );
                return Ok(new
                {
                    data = AtaList
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "AtaRegistroPrecosController.cs" ,
                    "OnGetListaAtas" ,
                    error
                );
                return StatusCode(500);
            }
        }
    }
}
