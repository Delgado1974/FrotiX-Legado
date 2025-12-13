using FrotiX.Repository.IRepository;
using FrotiX.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;

namespace FrotiX.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [IgnoreAntiforgeryToken]
    public class CustosViagemController :Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        private IWebHostEnvironment hostingEnv;

        public CustosViagemController(IUnitOfWork unitOfWork , IWebHostEnvironment env)
        {
            try
            {
                _unitOfWork = unitOfWork;
                hostingEnv = env;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "CustosViagemController.cs" ,
                    "CustosViagemController" ,
                    error
                );
            }
        }

        [HttpGet]
        public IActionResult Get(string Id = null)
        {
            try
            {
                var objCustos = _unitOfWork.ViewCustosViagem.GetAllReduced(selector: v => new
                {
                    v.NoFichaVistoria ,
                    v.ViagemId ,
                    v.DataInicial ,
                    v.DataFinal ,
                    v.HoraInicio ,
                    v.HoraFim ,
                    v.Finalidade ,
                    v.Status ,
                    v.KmInicial ,
                    v.KmFinal ,
                    v.Quilometragem ,
                    v.CustoMotorista ,
                    v.CustoCombustivel ,
                    v.CustoVeiculo ,
                    v.NomeMotorista ,
                    v.MotoristaId ,
                    v.VeiculoId ,
                    v.StatusAgendamento ,
                    v.SetorSolicitanteId ,
                    v.DescricaoVeiculo ,
                    v.RowNum ,
                });
                return Json(new
                {
                    data = objCustos
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("CustosViagemController.cs" , "Get" , error);
                return Json(
                    new
                    {
                        data = new List<object>() ,
                        error = "Erro ao carregar dados" ,
                        success = false ,
                    }
                );
            }
        }

        [Route("CalculaCustoViagens")]
        [HttpPost]
        public IActionResult CalculaCustoViagens()
        {
            try
            {
                var objViagens = _unitOfWork.Viagem.GetAll(v =>
                    v.StatusAgendamento == false && v.Status == "Realizada"
                );

                foreach (var viagem in objViagens)
                {
                    if (viagem.MotoristaId != null)
                    {
                        var minutos = 0;
                        viagem.CustoMotorista = Servicos.CalculaCustoMotorista(
                            viagem ,
                            _unitOfWork ,
                            ref minutos
                        );
                    }
                    if (viagem.VeiculoId != null)
                    {
                        viagem.CustoVeiculo = Servicos.CalculaCustoVeiculo(viagem , _unitOfWork);
                        viagem.CustoCombustivel = Servicos.CalculaCustoCombustivel(
                            viagem ,
                            _unitOfWork
                        );
                    }
                    _unitOfWork.Viagem.Update(viagem);
                }
                _unitOfWork.Save();

                return Json(new
                {
                    success = true
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "CustosViagemController.cs" ,
                    "CalculaCustoViagens" ,
                    error
                );
                return StatusCode(500);
            }
        }

        [Route("ViagemVeiculos")]
        [HttpGet]
        public IActionResult ViagemVeiculos(Guid Id)
        {
            try
            {
                return Json(
                    new
                    {
                        data = _unitOfWork
                            .ViewCustosViagem.GetAll()
                            .Where(vv => vv.VeiculoId == Id && vv.StatusAgendamento == false) ,
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("CustosViagemController.cs" , "ViagemVeiculos" , error);
                return StatusCode(500);
            }
        }

        [Route("ViagemMotoristas")]
        [HttpGet]
        public IActionResult ViagemMotoristas(Guid Id)
        {
            try
            {
                return Json(
                    new
                    {
                        data = _unitOfWork
                            .ViewCustosViagem.GetAll()
                            .Where(vv => vv.MotoristaId == Id && vv.StatusAgendamento == false) ,
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "CustosViagemController.cs" ,
                    "ViagemMotoristas" ,
                    error
                );
                return StatusCode(500);
            }
        }

        [Route("ViagemStatus")]
        [HttpGet]
        public IActionResult ViagemStatus(string Id)
        {
            try
            {
                return Json(
                    new
                    {
                        data = _unitOfWork
                            .ViewCustosViagem.GetAll()
                            .Where(vv => vv.Status == Id && vv.StatusAgendamento == false) ,
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("CustosViagemController.cs" , "ViagemStatus" , error);
                return StatusCode(500);
            }
        }

        [Route("ViagemFinalidade")]
        [HttpGet]
        public IActionResult ViagemFinalidade(string Id)
        {
            try
            {
                return Json(
                    new
                    {
                        data = _unitOfWork
                            .ViewCustosViagem.GetAll()
                            .Where(vv => vv.Finalidade == Id && vv.StatusAgendamento == false) ,
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "CustosViagemController.cs" ,
                    "ViagemFinalidade" ,
                    error
                );
                return StatusCode(500);
            }
        }

        [Route("ViagemSetores")]
        [HttpGet]
        public IActionResult ViagemSetores(Guid Id)
        {
            try
            {
                return Json(
                    new
                    {
                        data = _unitOfWork
                            .ViewCustosViagem.GetAll()
                            .Where(vv =>
                                vv.SetorSolicitanteId == Id && vv.StatusAgendamento == false
                            ) ,
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("CustosViagemController.cs" , "ViagemSetores" , error);
                return StatusCode(500);
            }
        }

        [Route("ViagemData")]
        [HttpGet]
        public IActionResult ViagemData(string Id)
        {
            try
            {
                return Json(
                    new
                    {
                        data = _unitOfWork
                            .ViewCustosViagem.GetAll()
                            .Where(vv => vv.DataInicial == Id && vv.StatusAgendamento == false) ,
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("CustosViagemController.cs" , "ViagemData" , error);
                return StatusCode(500);
            }
        }

        [HttpGet]
        [Route("PegaFicha")]
        public JsonResult PegaFicha(Guid id)
        {
            try
            {
                if (id != Guid.Empty)
                {
                    var objFromDb = _unitOfWork.Viagem.GetFirstOrDefault(u => u.ViagemId == id);
                    if (objFromDb.FichaVistoria != null)
                    {
                        objFromDb.FichaVistoria = this.GetImage(
                            Convert.ToBase64String(objFromDb.FichaVistoria)
                        );
                        return Json(objFromDb);
                    }
                    return Json(false);
                }
                else
                {
                    return Json(false);
                }
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("CustosViagemController.cs" , "PegaFicha" , error);
                return new JsonResult(new
                {
                    sucesso = false
                });
            }
        }

        [HttpGet]
        [Route("PegaFichaModal")]
        public JsonResult PegaFichaModal(Guid id)
        {
            try
            {
                var objFromDb = _unitOfWork.Viagem.GetFirstOrDefault(u => u.ViagemId == id);
                if (objFromDb.FichaVistoria != null)
                {
                    objFromDb.FichaVistoria = this.GetImage(
                        Convert.ToBase64String(objFromDb.FichaVistoria)
                    );
                    return Json(objFromDb.FichaVistoria);
                }
                return Json(false);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("CustosViagemController.cs" , "PegaFichaModal" , error);
                return new JsonResult(new
                {
                    sucesso = false
                });
            }
        }

        public byte[] GetImage(string sBase64String)
        {
            try
            {
                byte[] bytes = null;
                if (!string.IsNullOrEmpty(sBase64String))
                {
                    bytes = Convert.FromBase64String(sBase64String);
                }
                return bytes;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("CustosViagemController.cs" , "GetImage" , error);
                return default(byte[]);
            }
        }

        [HttpGet]
        [Route("PegaMotoristaVeiculo")]
        public JsonResult PegaMotoristaVeiculo(Guid id)
        {
            try
            {
                var objFromDb = _unitOfWork.Viagem.GetFirstOrDefault(v => v.ViagemId == id);
                if (objFromDb != null)
                {
                    return Json(
                        new
                        {
                            success = true ,
                            motoristaId = objFromDb.MotoristaId ,
                            veiculoId = objFromDb.VeiculoId ,
                            finalidadeId = objFromDb.Finalidade ,
                            setorsolicitanteId = objFromDb.SetorSolicitanteId ,
                            eventoId = objFromDb.EventoId ,
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
                    "CustosViagemController.cs" ,
                    "PegaMotoristaVeiculo" ,
                    error
                );
                return new JsonResult(new
                {
                    sucesso = false
                });
            }
        }
    }
}
