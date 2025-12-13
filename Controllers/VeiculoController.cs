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
    public class VeiculoController :Controller
    {
        private readonly IUnitOfWork _unitOfWork;

        public VeiculoController(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("VeiculoController.cs" , "VeiculoController" , error);
            }
        }

        [HttpGet]
        public IActionResult Get()
        {
            try
            {
                var objVeiculos = _unitOfWork
                    .ViewVeiculos.GetAllReduced(selector: vv => new
                    {
                        vv.VeiculoId ,
                        vv.Placa ,
                        vv.Quilometragem ,
                        vv.MarcaModelo ,
                        vv.Sigla ,
                        vv.Descricao ,
                        vv.Consumo ,
                        vv.OrigemVeiculo ,
                        vv.DataAlteracao ,
                        vv.NomeCompleto ,
                        vv.VeiculoReserva ,
                        vv.Status ,
                        vv.CombustivelId ,
                    })
                    .ToList();

                return Json(new
                {
                    data = objVeiculos
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("VeiculoController.cs" , "Get" , error);
                return Json(new
                {
                    success = false ,
                    message = "Erro ao carregar dados"
                });
            }
        }

        [Route("Delete")]
        [HttpPost]
        public IActionResult Delete(VeiculoViewModel model)
        {
            try
            {
                if (model != null && model.VeiculoId != Guid.Empty)
                {
                    var objFromDb = _unitOfWork.Veiculo.GetFirstOrDefault(u =>
                        u.VeiculoId == model.VeiculoId
                    );
                    if (objFromDb != null)
                    {
                        var veiculoContrato = _unitOfWork.VeiculoContrato.GetFirstOrDefault(u =>
                            u.VeiculoId == model.VeiculoId
                        );
                        if (veiculoContrato != null)
                        {
                            return Json(
                                new
                                {
                                    success = false ,
                                    message = "Não foi possível remover o veículo. Ele está associado a um ou mais contratos!" ,
                                }
                            );
                        }

                        var objViagem = _unitOfWork.Viagem.GetFirstOrDefault(u =>
                            u.VeiculoId == model.VeiculoId
                        );
                        if (objViagem != null)
                        {
                            return Json(
                                new
                                {
                                    success = false ,
                                    message = "Não foi possível remover o veículo. Ele está associado a uma ou mais viagens!" ,
                                }
                            );
                        }

                        _unitOfWork.Veiculo.Remove(objFromDb);
                        _unitOfWork.Save();
                        return Json(
                            new
                            {
                                success = true ,
                                message = "Veículo removido com sucesso"
                            }
                        );
                    }
                }
                return Json(new
                {
                    success = false ,
                    message = "Erro ao apagar veículo"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("VeiculoController.cs" , "Delete" , error);
                return Json(new
                {
                    success = false ,
                    message = "Erro ao deletar veículo"
                });
            }
        }

        [Route("UpdateStatusVeiculo")]
        public JsonResult UpdateStatusVeiculo(Guid Id)
        {
            try
            {
                if (Id != Guid.Empty)
                {
                    var objFromDb = _unitOfWork.Veiculo.GetFirstOrDefault(u => u.VeiculoId == Id);
                    string Description = "";
                    int type = 0;

                    if (objFromDb != null)
                    {
                        if (objFromDb.Status == true)
                        {
                            objFromDb.Status = false;
                            Description = string.Format(
                                "Atualizado Status do Veículo [Nome: {0}] (Inativo)" ,
                                objFromDb.Placa
                            );
                            type = 1;
                        }
                        else
                        {
                            objFromDb.Status = true;
                            Description = string.Format(
                                "Atualizado Status do Veículo  [Nome: {0}] (Ativo)" ,
                                objFromDb.Placa
                            );
                            type = 0;
                        }
                        _unitOfWork.Veiculo.Update(objFromDb);
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
                Alerta.TratamentoErroComLinha("VeiculoController.cs" , "UpdateStatusVeiculo" , error);
                return new JsonResult(new
                {
                    success = false
                });
            }
        }

        [HttpGet]
        [Route("VeiculoContratos")]
        public IActionResult VeiculoContratos(Guid Id)
        {
            try
            {
                var result = (
                    from v in _unitOfWork.Veiculo.GetAll()
                    join vc in _unitOfWork.VeiculoContrato.GetAll()
                        on v.VeiculoId equals vc.VeiculoId
                    join m in _unitOfWork.ModeloVeiculo.GetAll() on v.ModeloId equals m.ModeloId
                    join ma in _unitOfWork.MarcaVeiculo.GetAll() on v.MarcaId equals ma.MarcaId
                    join u in _unitOfWork.Unidade.GetAll()
                        on v.UnidadeId equals u.UnidadeId
                        into ud
                    from udResult in ud.DefaultIfEmpty()
                    join c in _unitOfWork.Combustivel.GetAll()
                        on v.CombustivelId equals c.CombustivelId
                    where vc.ContratoId == Id
                    select new
                    {
                        v.VeiculoId ,
                        v.Placa ,
                        MarcaModelo = ma.DescricaoMarca + "/" + m.DescricaoModelo ,
                        Sigla = udResult != null ? udResult.Sigla : "" ,
                        CombustivelDescricao = c.Descricao ,
                        v.Status ,
                    }
                ).ToList();

                return Json(new
                {
                    data = result
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("VeiculoController.cs" , "VeiculoContratos" , error);
                return Json(new
                {
                    success = false ,
                    message = "Erro ao carregar contratos"
                });
            }
        }

        [HttpGet]
        [Route("GlosaVeiculoContratos")]
        public IActionResult GlosaVeiculoContratos(Guid Id)
        {
            try
            {
                var rows = (
                    from b in _unitOfWork.Manutencao.GetAll()
                    join v in _unitOfWork.Veiculo.GetAll() on b.VeiculoId equals v.VeiculoId
                    join vc in _unitOfWork.VeiculoContrato.GetAll()
                        on v.VeiculoId equals vc.VeiculoId
                    join m in _unitOfWork.ModeloVeiculo.GetAll() on v.ModeloId equals m.ModeloId
                    join ma in _unitOfWork.MarcaVeiculo.GetAll() on v.MarcaId equals ma.MarcaId
                    join c in _unitOfWork.Combustivel.GetAll()
                        on v.CombustivelId equals c.CombustivelId
                    join u in _unitOfWork.Unidade.GetAll()
                        on v.UnidadeId equals u.UnidadeId
                        into ud
                    from udResult in ud.DefaultIfEmpty()
                    join ivc0 in _unitOfWork.ItemVeiculoContrato.GetAll()
                        on v.ItemVeiculoId equals ivc0.ItemVeiculoId
                        into ivcg
                    from ivc in ivcg.DefaultIfEmpty()
                    where
                        vc.ContratoId == Id
                        && v.Status == true
                        && b.DataDevolucao != null
                        && b.DataDevolucao.Value.Date > b.DataSolicitacao.Value.Date
                    orderby v.Placa
                    select new
                    {
                        b.ManutencaoId ,
                        b.NumOS ,
                        b.ResumoOS ,
                        b.DataSolicitacao ,
                        b.DataRecolhimento ,
                        b.DataRecebimentoReserva ,
                        b.DataDevolucaoReserva ,
                        b.DataEntrega ,
                        b.DataDevolucao ,
                        b.ReservaEnviado ,
                        b.StatusOS ,
                        v.VeiculoId ,
                        v.Placa ,
                        v.Status ,
                        CombustivelDescricao = c.Descricao ,
                        MarcaDescricao = ma.DescricaoMarca ,
                        ModeloDescricao = m.DescricaoModelo ,
                        Sigla = udResult != null ? udResult.Sigla : null ,
                        NumItem = (int?)ivc.NumItem ,
                    }
                ).ToList();

                var result = rows.Select(x => new
                {
                    x.ManutencaoId ,
                    x.NumOS ,
                    x.ResumoOS ,
                    DescricaoVeiculo = x.MarcaDescricao + "/" + x.ModeloDescricao ,
                    StatusOS = x.StatusOS ,
                    DataSolicitacao = x.DataSolicitacao.Value.ToString("dd/MM/yyyy") ,
                    DataRecolhimento = x.DataRecolhimento.HasValue
                            ? x.DataRecolhimento.Value.ToString("dd/MM/yyyy")
                            : "" ,
                    DataRecebimentoReserva = x.DataRecebimentoReserva.HasValue
                            ? x.DataRecebimentoReserva.Value.ToString("dd/MM/yyyy")
                            : "" ,
                    DataDevolucaoReserva = x.DataDevolucaoReserva.HasValue
                            ? x.DataDevolucaoReserva.Value.ToString("dd/MM/yyyy")
                            : "" ,
                    DataEntrega = x.DataEntrega.HasValue
                            ? x.DataEntrega.Value.ToString("dd/MM/yyyy")
                            : "" ,
                    DataSolicitacaoRaw = x.DataSolicitacao ,
                    DataDevolucaoRaw = x.DataDevolucao ,
                    Reserva = x.ReservaEnviado == true ? "Enviado"
                        : x.ReservaEnviado == false ? "Ausente"
                        : "" ,
                    DataDevolucao = x.DataDevolucao ,
                    DiasGlosa = x.DataDevolucao == null
                            ? 1
                            : (
                                x.DataEntrega != null
                                    ? (x.DataDevolucao.Value - x.DataEntrega.Value).Days
                                    : (x.DataDevolucao.Value - x.DataSolicitacao.Value).Days
                            ) ,
                    Dias = x.DataDevolucao == null
                            ? 0
                            : (x.DataDevolucao.Value.Date - x.DataSolicitacao.Value.Date).Days ,
                    x.VeiculoId ,
                    x.Placa ,
                    MarcaModelo = x.MarcaDescricao + "/" + x.ModeloDescricao ,
                    Sigla = x.Sigla ?? "" ,
                    x.CombustivelDescricao ,
                    x.Status ,
                    Habilitado = (x.StatusOS == "Fechada" || x.StatusOS == "Cancelada")
                            ? ""
                            : "data-toggle='modal' data-target='#modalManutencao'" ,
                    Icon = (x.StatusOS == "Fechada" || x.StatusOS == "Cancelada")
                            ? "fa-regular fa-lock"
                            : "far fa-flag-checkered" ,
                    NumItem = x.NumItem ,
                    HabilitadoEditar = (
                            x.StatusOS == "Fechada" || x.StatusOS == "Cancelada"
                        )
                            ? "disabled"
                            : "" ,
                    OpacityEditar = (x.StatusOS == "Fechada" || x.StatusOS == "Cancelada")
                            ? "opacity:0.3; pointer-events:none;"
                            : "opacity:1;" ,
                    OpacityTooltipEditarEditar = (
                            x.StatusOS == "Fechada" || x.StatusOS == "Cancelada"
                        )
                            ? "Visualizar Manutenção"
                            : "Edita a Ordem de Serviço!" ,
                    HabilitadoBaixar = (
                            x.StatusOS == "Fechada" || x.StatusOS == "Cancelada"
                        )
                            ? "disabled"
                            : "" ,
                    ModalBaixarAttrs = (
                            x.StatusOS == "Fechada" || x.StatusOS == "Cancelada"
                        )
                            ? ""
                            : "data-toggle='modal' data-target='#modalManutencao'" ,
                    OpacityBaixar = (x.StatusOS == "Fechada" || x.StatusOS == "Cancelada")
                            ? "opacity:0.3; pointer-events:none;"
                            : "opacity:1;" ,
                    Tooltip = (x.StatusOS == "Fechada" || x.StatusOS == "Cancelada")
                            ? "Desabilitado"
                            : "Fecha a Ordem de Serviço!" ,
                    HabilitadoCancelar = (
                            x.StatusOS == "Fechada" || x.StatusOS == "Cancelada"
                        )
                            ? "disabled"
                            : "" ,
                    OpacityCancelar = (x.StatusOS == "Fechada" || x.StatusOS == "Cancelada")
                            ? "opacity:0.3; pointer-events:none;"
                            : "opacity:1;" ,
                    TooltipCancelar = x.StatusOS == "Cancelada" ? "Manutenção Cancelada"
                        : x.StatusOS == "Fechada" ? "OS Fechada/Baixada"
                        : "Cancelar Manutenção" ,
                })
                    .ToList();

                return Json(new
                {
                    data = result
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "VeiculoController.cs" ,
                    "GlosaVeiculoContratos" ,
                    error
                );
                return Json(new
                {
                    success = false ,
                    message = "Erro ao carregar glosa"
                });
            }
        }

        [HttpGet]
        [Route("VeiculoContratosGlosa")]
        public IActionResult VeiculosDoContrato(Guid id)
        {
            try
            {
                var manutencoes = _unitOfWork.Manutencao.GetAll();
                var veiculosElegiveis = new HashSet<Guid>(
                    manutencoes
                        .Where(m =>
                            m.VeiculoId.HasValue
                            && m.DataSolicitacao.HasValue
                            && m.DataDevolucao.HasValue
                            && (m.DataDevolucao.Value.Date - m.DataSolicitacao.Value.Date).TotalDays
                                > 0
                        )
                        .Select(m => m.VeiculoId.Value)
                        .Distinct()
                );

                var veiculosContrato = _unitOfWork
                    .VeiculoContrato.GetAll()
                    .Where(vc => vc.ContratoId == id);

                var veiculos = _unitOfWork.Veiculo.GetAll();
                var modelos = _unitOfWork.ModeloVeiculo.GetAll();
                var marcas = _unitOfWork.MarcaVeiculo.GetAll();
                var unidades = _unitOfWork.Unidade.GetAll();
                var combustiveis = _unitOfWork.Combustivel.GetAll();

                var result = (
                    from vc in veiculosContrato
                    where vc != null && veiculosElegiveis.Contains(vc?.VeiculoId ?? Guid.Empty)
                    join v in veiculos on vc.VeiculoId equals v.VeiculoId
                    join m in modelos on v.ModeloId equals m.ModeloId
                    join ma in marcas on v.MarcaId equals ma.MarcaId
                    join u in unidades on v.UnidadeId equals u.UnidadeId into ud
                    from udResult in ud.DefaultIfEmpty()
                    join c in combustiveis on v.CombustivelId equals c.CombustivelId
                    select new
                    {
                        v.VeiculoId ,
                        v.Placa ,
                        MarcaModelo = ma.DescricaoMarca + "/" + m.DescricaoModelo ,
                        Sigla = udResult != null ? udResult.Sigla : "" ,
                        CombustivelDescricao = c.Descricao ,
                        v.Status ,
                    }
                ).ToList();

                return View(result);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("VeiculoController.cs" , "VeiculosDoContrato" , error);
                return View();
            }
        }

        [Route("DeleteContrato")]
        [HttpPost]
        public IActionResult DeleteContrato(VeiculoViewModel model)
        {
            try
            {
                if (model != null && model.VeiculoId != Guid.Empty)
                {
                    var objFromDb = _unitOfWork.Veiculo.GetFirstOrDefault(u =>
                        u.VeiculoId == model.VeiculoId
                    );
                    if (objFromDb != null)
                    {
                        var veiculoContrato = _unitOfWork.VeiculoContrato.GetFirstOrDefault(u =>
                            u.VeiculoId == model.VeiculoId && u.ContratoId == model.ContratoId
                        );
                        if (veiculoContrato != null)
                        {
                            if (objFromDb.ContratoId == model.ContratoId)
                            {
                                objFromDb.ContratoId = Guid.Empty;
                                _unitOfWork.Veiculo.Update(objFromDb);
                            }
                            _unitOfWork.VeiculoContrato.Remove(veiculoContrato);
                            _unitOfWork.Save();
                            return Json(
                                new
                                {
                                    success = true ,
                                    message = "Veículo removido com sucesso"
                                }
                            );
                        }
                        return Json(new
                        {
                            success = false ,
                            message = "Erro ao remover veículo"
                        });
                    }
                    return Json(new
                    {
                        success = false ,
                        message = "Erro ao remover veículo"
                    });
                }
                return Json(new
                {
                    success = false ,
                    message = "Erro ao remover veículo"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("VeiculoController.cs" , "DeleteContrato" , error);
                return Json(new
                {
                    success = false ,
                    message = "Erro ao deletar contrato"
                });
            }
        }

        [Route("SelecionaValorMensalAta")]
        [HttpGet]
        public JsonResult SelecionaValorMensalAta(Guid itemAta)
        {
            try
            {
                var ItemAta = _unitOfWork.ItemVeiculoAta.GetFirstOrDefault(i =>
                    i.ItemVeiculoAtaId == itemAta
                );

                return new JsonResult(new
                {
                    valor = ItemAta.ValorUnitario
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "VeiculoController.cs" ,
                    "SelecionaValorMensalAta" ,
                    error
                );
                return new JsonResult(new
                {
                    success = false
                });
            }
        }

        [Route("SelecionaValorMensalContrato")]
        [HttpGet]
        public JsonResult SelecionaValorMensalContrato(Guid itemContrato)
        {
            try
            {
                var ItemContrato = _unitOfWork.ItemVeiculoContrato.GetFirstOrDefault(i =>
                    i.ItemVeiculoId == itemContrato
                );

                return new JsonResult(new
                {
                    valor = ItemContrato.ValorUnitario
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "VeiculoController.cs" ,
                    "SelecionaValorMensalContrato" ,
                    error
                );
                return new JsonResult(new
                {
                    success = false
                });
            }
        }
    }
}
