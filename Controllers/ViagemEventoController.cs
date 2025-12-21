using FrotiX.Models;
using FrotiX.Repository.IRepository;
using FrotiX.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Threading.Tasks;

namespace FrotiX.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [IgnoreAntiforgeryToken]
    public partial class ViagemEventoController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        private IWebHostEnvironment hostingEnv;
        private readonly IWebHostEnvironment webHostEnvironment;

        public ViagemEventoController(
            IUnitOfWork unitOfWork,
            IWebHostEnvironment env,
            IWebHostEnvironment webHostEnvironment
        )
        {
            try
            {
                _unitOfWork = unitOfWork;
                hostingEnv = env;
                this.webHostEnvironment = webHostEnvironment;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "ViagemEventoController.cs",
                    "ViagemEventoController",
                    error
                );
            }
        }

        [HttpGet]
        public IActionResult Get(string Id)
        {
            try
            {
                return Json(
                    new
                    {
                        data = _unitOfWork
                            .ViewViagens.GetAll()
                            .Where(v => v.Finalidade == "Evento" && v.StatusAgendamento == false),
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ViagemEventoController.cs", "Get", error);
                return Json(new
                {
                    success = false,
                    message = "Erro ao carregar dados"
                });
            }
        }

        [Route("ViagemEventos")]
        [HttpGet]
        public IActionResult ViagemEventos()
        {
            try
            {
                return Json(
                    new
                    {
                        data = _unitOfWork
                            .ViewViagens.GetAll()
                            .Where(v => v.Finalidade == "Evento" && v.StatusAgendamento == false),
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ViagemEventoController.cs", "ViagemEventos", error);
                return Json(new
                {
                    success = false,
                    message = "Erro ao carregar eventos"
                });
            }
        }

        [Route("Fluxo")]
        [HttpGet]
        public IActionResult Fluxo()
        {
            try
            {
                var result = (
                    from vf in _unitOfWork.ViewFluxoEconomildo.GetAll()
                    select new
                    {
                        vf.ViagemEconomildoId,
                        vf.MotoristaId,
                        vf.VeiculoId,
                        vf.NomeMotorista,
                        vf.DescricaoVeiculo,
                        vf.MOB,
                        vf.Data,
                        vf.HoraInicio,
                        vf.HoraFim,
                        vf.QtdPassageiros,
                    }
                ).ToList().OrderByDescending(vf => vf.Data).ThenByDescending(vf => vf.MOB).ThenByDescending(vf => vf.HoraInicio);

                return Json(new
                {
                    data = result
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ViagemEventoController.cs", "Fluxo", error);
                return Json(new
                {
                    success = false,
                    message = "Erro ao carregar fluxo"
                });
            }
        }

        [Route("FluxoVeiculos")]
        [HttpGet]
        public IActionResult FluxoVeiculos(string Id)
        {
            try
            {
                var result = (
                    from vf in _unitOfWork.ViewFluxoEconomildo.GetAll()
                    where vf.VeiculoId == Guid.Parse(Id)
                    select new
                    {
                        vf.ViagemEconomildoId,
                        vf.MotoristaId,
                        vf.VeiculoId,
                        vf.NomeMotorista,
                        vf.DescricaoVeiculo,
                        vf.MOB,
                        vf.Data,
                        vf.HoraInicio,
                        vf.HoraFim,
                        vf.QtdPassageiros,
                    }
                ).ToList().OrderByDescending(vf => vf.Data).ThenByDescending(vf => vf.MOB).ThenByDescending(vf => vf.HoraInicio);

                return Json(new
                {
                    data = result
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ViagemEventoController.cs", "FluxoVeiculos", error);
                return Json(new
                {
                    success = false,
                    message = "Erro ao carregar fluxo de veículos"
                });
            }
        }

        [Route("FluxoMotoristas")]
        [HttpGet]
        public IActionResult FluxoMotoristas(string Id)
        {
            try
            {
                var result = (
                    from vf in _unitOfWork.ViewFluxoEconomildo.GetAll()
                    where vf.MotoristaId == Guid.Parse(Id)
                    select new
                    {
                        vf.ViagemEconomildoId,
                        vf.MotoristaId,
                        vf.VeiculoId,
                        vf.NomeMotorista,
                        vf.DescricaoVeiculo,
                        vf.MOB,
                        vf.Data,
                        vf.HoraInicio,
                        vf.HoraFim,
                        vf.QtdPassageiros,
                    }
                ).ToList().OrderByDescending(vf => vf.Data).ThenByDescending(vf => vf.MOB).ThenByDescending(vf => vf.HoraInicio);

                return Json(new
                {
                    data = result
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ViagemEventoController.cs", "FluxoMotoristas", error);
                return Json(new
                {
                    success = false,
                    message = "Erro ao carregar fluxo de motoristas"
                });
            }
        }

        [Route("FluxoData")]
        [HttpGet]
        public IActionResult FluxoData(string Id)
        {
            try
            {
                var dataFluxo = DateTime.Parse(Id);

                var result = (
                    from vf in _unitOfWork.ViewFluxoEconomildoData.GetAll()
                    where vf.Data == dataFluxo
                    select new
                    {
                        vf.ViagemEconomildoId,
                        vf.MotoristaId,
                        vf.VeiculoId,
                        vf.NomeMotorista,
                        vf.DescricaoVeiculo,
                        vf.MOB,
                        vf.Data,
                        vf.HoraInicio,
                        vf.HoraFim,
                        vf.QtdPassageiros,
                    }
                ).ToList().OrderByDescending(vf => vf.Data).ThenByDescending(vf => vf.MOB).ThenByDescending(vf => vf.HoraInicio);

                return Json(new
                {
                    data = result
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ViagemEventoController.cs", "FluxoData", error);
                return Json(new
                {
                    success = false,
                    message = "Erro ao carregar fluxo por data"
                });
            }
        }

        [Route("ApagaFluxoEconomildo")]
        [HttpPost]
        public IActionResult ApagaFluxoEconomildo(ViagensEconomildo viagensEconomildo)
        {
            try
            {
                var objFromDb = _unitOfWork.ViagensEconomildo.GetFirstOrDefault(v =>
                    v.ViagemEconomildoId == viagensEconomildo.ViagemEconomildoId
                );
                _unitOfWork.ViagensEconomildo.Remove(objFromDb);
                _unitOfWork.Save();
                return Json(new
                {
                    success = true,
                    message = "Viagem apagada com sucesso"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ViagemEventoController.cs", "ApagaFluxoEconomildo", error);
                return Json(new
                {
                    success = false,
                    message = "Erro ao apagar viagem"
                });
            }
        }

        [Route("MyUploader")]
        [HttpPost]
        public IActionResult MyUploader(IFormFile MyUploader, [FromForm] string ViagemId)
        {
            try
            {
                if (MyUploader != null)
                {
                    var viagemObj = _unitOfWork.Viagem.GetFirstOrDefault(v =>
                        v.ViagemId == Guid.Parse(ViagemId)
                    );
                    using (var ms = new MemoryStream())
                    {
                        MyUploader.CopyTo(ms);
                        viagemObj.FichaVistoria = ms.ToArray();
                    }

                    _unitOfWork.Viagem.Update(viagemObj);
                    _unitOfWork.Save();

                    return new ObjectResult(new
                    {
                        status = "success"
                    });
                }
                return new ObjectResult(new
                {
                    status = "fail"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ViagemEventoController.cs", "MyUploader", error);
                return new ObjectResult(new
                {
                    status = "fail"
                });
            }
        }

        [Route("CalculaCustoViagens")]
        [HttpPost]
        public IActionResult CalculaCustoViagens()
        {
            try
            {
                var objViagens = _unitOfWork.Viagem.GetAll(v =>
                    v.StatusAgendamento == false
                    && v.Status == "Realizada"
                    && (
                        v.Finalidade != "Manutenção"
                        && v.Finalidade != "Devolução à Locadora"
                        && v.Finalidade != "Recebimento da Locadora"
                        && v.Finalidade != "Saída para Manutenção"
                        && v.Finalidade != "Chegada da Manutenção"
                    )
                    && v.NoFichaVistoria != null
                );

                foreach (var viagem in objViagens)
                {
                    if (viagem.MotoristaId != null)
                    {
                        int minutos = -1;
                        viagem.CustoMotorista = Servicos.CalculaCustoMotorista(
                            viagem,
                            _unitOfWork,
                            ref minutos
                        );
                        viagem.Minutos = minutos;
                    }
                    if (viagem.VeiculoId != null)
                    {
                        viagem.CustoVeiculo = Servicos.CalculaCustoVeiculo(viagem, _unitOfWork);
                        viagem.CustoCombustivel = Servicos.CalculaCustoCombustivel(viagem, _unitOfWork);
                    }
                    viagem.CustoOperador = 0;
                    viagem.CustoLavador = 0;
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
                Alerta.TratamentoErroComLinha("ViagemEventoController.cs", "CalculaCustoViagens", error);
                return Json(new
                {
                    success = false,
                    message = "Erro ao calcular custos"
                });
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
                            .ViewViagens.GetAll()
                            .Where(vv => vv.VeiculoId == Id && vv.StatusAgendamento == false),
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ViagemEventoController.cs", "ViagemVeiculos", error);
                return Json(new
                {
                    success = false,
                    message = "Erro ao carregar viagens do veículo"
                });
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
                            .ViewViagens.GetAll()
                            .Where(vv => vv.MotoristaId == Id && vv.StatusAgendamento == false),
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ViagemEventoController.cs", "ViagemMotoristas", error);
                return Json(new
                {
                    success = false,
                    message = "Erro ao carregar viagens do motorista"
                });
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
                            .ViewViagens.GetAll()
                            .Where(vv => vv.Status == Id && vv.StatusAgendamento == false),
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ViagemEventoController.cs", "ViagemStatus", error);
                return Json(new
                {
                    success = false,
                    message = "Erro ao carregar viagens por status"
                });
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
                            .ViewViagens.GetAll()
                            .Where(vv => vv.SetorSolicitanteId == Id && vv.StatusAgendamento == false),
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ViagemEventoController.cs", "ViagemSetores", error);
                return Json(new
                {
                    success = false,
                    message = "Erro ao carregar viagens por setor"
                });
            }
        }

        [Route("ViagemData")]
        [HttpGet]
        public IActionResult ViagemData(string Id)
        {
            try
            {
                if (DateTime.TryParse(Id, out DateTime parsedDate))
                {
                    return Json(
                        new
                        {
                            data = _unitOfWork
                                .ViewViagens.GetAll()
                                .Where(vv =>
                                    vv.DataInicial == parsedDate && vv.StatusAgendamento == false
                                ),
                        }
                    );
                }
                return Json(new
                {
                    success = false,
                    message = "Data inválida fornecida."
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ViagemEventoController.cs", "ViagemData", error);
                return Json(new
                {
                    success = false,
                    message = "Erro ao carregar viagens por data"
                });
            }
        }

        [Route("Ocorrencias")]
        [HttpGet]
        public IActionResult Ocorrencias(Guid Id)
        {
            try
            {
                return Json(
                    new
                    {
                        data = _unitOfWork
                            .ViewViagens.GetAll()
                            .Where(vv =>
                                (vv.ResumoOcorrencia != null || vv.DescricaoOcorrencia != null)
                            ),
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ViagemEventoController.cs", "Ocorrencias", error);
                return Json(new
                {
                    success = false,
                    message = "Erro ao carregar ocorrências"
                });
            }
        }

        [Route("Cancelar")]
        [HttpPost]
        public IActionResult Cancelar(ViagemID id)
        {
            try
            {
                var objFromDb = _unitOfWork.Viagem.GetFirstOrDefault(u => u.ViagemId == id.ViagemId);
                if (objFromDb != null)
                {
                    objFromDb.Status = "Cancelada";
                    _unitOfWork.Viagem.Update(objFromDb);
                    _unitOfWork.Save();
                    return Json(new
                    {
                        success = true,
                        message = "Viagem cancelada com sucesso"
                    });
                }
                return Json(new
                {
                    success = false,
                    message = "Erro ao cancelar Viagem"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ViagemEventoController.cs", "Cancelar", error);
                return Json(new
                {
                    success = false,
                    message = "Erro ao cancelar viagem"
                });
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
                Alerta.TratamentoErroComLinha("ViagemEventoController.cs", "PegaFicha", error);
                return Json(false);
            }
        }

        [Route("AdicionarViagensEconomildo")]
        [Consumes("application/json")]
        public JsonResult AdicionarViagensEconomildo([FromBody] ViagensEconomildo viagensEconomildo)
        {
            try
            {
                _unitOfWork.ViagensEconomildo.Add(viagensEconomildo);
                _unitOfWork.Save();

                return Json(new
                {
                    success = true,
                    message = "Viagem Adicionada com Sucesso!"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ViagemEventoController.cs", "AdicionarViagensEconomildo", error);
                return Json(new
                {
                    success = false,
                    message = "Erro ao adicionar viagem"
                });
            }
        }

        [Route("ExisteDataEconomildo")]
        [Consumes("application/json")]
        public JsonResult ExisteDataEconomildo([FromBody] ViagensEconomildo viagensEconomildo)
        {
            try
            {
                if (viagensEconomildo.Data != null)
                {
                    var existeData = _unitOfWork.ViagensEconomildo.GetFirstOrDefault(u =>
                        u.Data == viagensEconomildo.Data
                        && u.VeiculoId == viagensEconomildo.VeiculoId
                        && u.MOB == viagensEconomildo.MOB
                        && u.MotoristaId == viagensEconomildo.MotoristaId
                    );
                    if (existeData != null)
                    {
                        return Json(
                            new
                            {
                                success = false,
                                message = "Já existe registro para essa data!"
                            }
                        );
                    }
                }

                return Json(new
                {
                    success = true,
                    message = ""
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ViagemEventoController.cs", "ExisteDataEconomildo", error);
                return Json(new
                {
                    success = false,
                    message = "Erro ao verificar data"
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
                Alerta.TratamentoErroComLinha("ViagemEventoController.cs", "PegaFichaModal", error);
                return Json(false);
            }
        }

        [HttpGet]
        [Route("PegaCategoria")]
        public JsonResult PegaCategoria(Guid id)
        {
            try
            {
                var objFromDb = _unitOfWork.Veiculo.GetFirstOrDefault(v => v.VeiculoId == id);
                if (objFromDb.Categoria != null)
                {
                    return Json(objFromDb.Categoria);
                }
                return Json(false);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ViagemEventoController.cs", "PegaCategoria", error);
                return Json(false);
            }
        }

        public byte[] GetImage(string sBase64String)
        {
            byte[] bytes = null;
            if (!string.IsNullOrEmpty(sBase64String))
            {
                bytes = Convert.FromBase64String(sBase64String);
            }
            return bytes;
        }

        [Route("AdicionarEvento")]
        [Consumes("application/json")]
        public JsonResult AdicionarEvento([FromBody] Evento evento)
        {
            try
            {
                var existeEvento = _unitOfWork.Evento.GetFirstOrDefault(u => (u.Nome == evento.Nome));
                if (existeEvento != null)
                {
                    return Json(new
                    {
                        success = false,
                        message = "Já existe um evento com este nome"
                    });
                }

                _unitOfWork.Evento.Add(evento);
                _unitOfWork.Save();

                return Json(
                    new
                    {
                        success = true,
                        message = "Evento Adicionado com Sucesso",
                        eventoid = evento.EventoId,
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ViagemEventoController.cs", "AdicionarEvento", error);
                return Json(new
                {
                    success = false,
                    message = "Erro ao adicionar evento"
                });
            }
        }

        [Route("AdicionarRequisitante")]
        [Consumes("application/json")]
        public JsonResult AdicionarRequisitante([FromBody] Requisitante requisitante)
        {
            try
            {
                var existeRequisitante = _unitOfWork.Requisitante.GetFirstOrDefault(u =>
                    (u.Ponto == requisitante.Ponto) || (u.Nome == requisitante.Nome)
                );
                if (existeRequisitante != null)
                {
                    return Json(
                        new
                        {
                            success = false,
                            message = "Já existe um requisitante com este ponto/nome",
                        }
                    );
                }

                requisitante.Status = true;
                requisitante.DataAlteracao = DateTime.Now;

                ClaimsPrincipal currentUser = this.User;
                var currentUserID = currentUser.FindFirst(ClaimTypes.NameIdentifier).Value;
                requisitante.UsuarioIdAlteracao = currentUserID;

                _unitOfWork.Requisitante.Add(requisitante);
                _unitOfWork.Save();

                return Json(
                    new
                    {
                        success = true,
                        message = "Requisitante Adicionado com Sucesso",
                        requisitanteid = requisitante.RequisitanteId,
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ViagemEventoController.cs", "AdicionarRequisitante", error);
                return Json(new
                {
                    success = false,
                    message = "Erro ao adicionar requisitante"
                });
            }
        }

        [Route("AdicionarSetor")]
        [Consumes("application/json")]
        public JsonResult AdicionarSetor([FromBody] SetorSolicitante setorSolicitante)
        {
            try
            {
                if (setorSolicitante.Sigla != null)
                {
                    var existeSigla = _unitOfWork.SetorSolicitante.GetFirstOrDefault(u =>
                        u.Sigla.ToUpper() == setorSolicitante.Sigla.ToUpper()
                        && u.SetorPaiId == setorSolicitante.SetorPaiId
                    );
                    if (
                        existeSigla != null
                        && existeSigla.SetorSolicitanteId != setorSolicitante.SetorSolicitanteId
                        && existeSigla.SetorPaiId == setorSolicitante.SetorPaiId
                    )
                    {
                        return Json(
                            new
                            {
                                success = false,
                                message = "Já existe um setor com esta sigla neste nível hierárquico",
                            }
                        );
                    }
                }

                var existeSetor = _unitOfWork.SetorSolicitante.GetFirstOrDefault(u =>
                    u.Nome.ToUpper() == setorSolicitante.Nome.ToUpper()
                    && u.SetorPaiId != setorSolicitante.SetorPaiId
                );
                if (
                    existeSetor != null
                    && existeSetor.SetorSolicitanteId != setorSolicitante.SetorSolicitanteId
                )
                {
                    if (existeSetor.SetorPaiId == setorSolicitante.SetorPaiId)
                    {
                        return Json(
                            new
                            {
                                success = false,
                                message = "Já existe um setor com este nome"
                            }
                        );
                    }
                }

                setorSolicitante.Status = true;
                setorSolicitante.DataAlteracao = DateTime.Now;

                ClaimsPrincipal currentUser = this.User;
                var currentUserID = currentUser.FindFirst(ClaimTypes.NameIdentifier).Value;
                setorSolicitante.UsuarioIdAlteracao = currentUserID;

                _unitOfWork.SetorSolicitante.Add(setorSolicitante);
                _unitOfWork.Save();

                return Json(
                    new
                    {
                        success = true,
                        message = "Setor Solicitante Adicionado com Sucesso"
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ViagemEventoController.cs", "AdicionarSetor", error);
                return Json(new
                {
                    success = false,
                    message = "Erro ao adicionar setor"
                });
            }
        }

        [Route("SaveImage")]
        public void SaveImage(IList<IFormFile> UploadFiles)
        {
            try
            {
                foreach (IFormFile file in UploadFiles)
                {
                    if (UploadFiles != null)
                    {
                        string filename = ContentDispositionHeaderValue
                            .Parse(file.ContentDisposition)
                            .FileName.Trim('"');

                        filename = Path.GetFileName(filename);

                        string folderPath = Path.Combine(
                            hostingEnv.WebRootPath,
                            "DadosEditaveis",
                            "ImagensViagens"
                        );

                        if (!Directory.Exists(folderPath))
                        {
                            Directory.CreateDirectory(folderPath);
                        }

                        string fullPath = Path.Combine(folderPath, filename);

                        if (!System.IO.File.Exists(fullPath))
                        {
                            using (FileStream fs = System.IO.File.Create(fullPath))
                            {
                                file.CopyTo(fs);
                                fs.Flush();
                            }
                            Response.StatusCode = 200;
                        }
                    }
                }
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ViagemEventoController.cs", "SaveImage", error);
                Response.StatusCode = 204;
            }
        }

        [Route("FinalizaViagem")]
        [Consumes("application/json")]
        public IActionResult FinalizaViagem([FromBody] FinalizacaoViagem viagem)
        {
            try
            {
                var objViagem = _unitOfWork.Viagem.GetFirstOrDefault(v =>
                    v.ViagemId == viagem.ViagemId
                );
                objViagem.DataFinal = viagem.DataFinal;
                objViagem.HoraFim = viagem.HoraFim;
                objViagem.KmFinal = viagem.KmFinal;
                objViagem.CombustivelFinal = viagem.CombustivelFinal;
                objViagem.Descricao = viagem.Descricao;
                objViagem.Status = "Realizada";
                objViagem.StatusDocumento = viagem.StatusDocumento;
                objViagem.StatusCartaoAbastecimento = viagem.StatusCartaoAbastecimento;

                ClaimsPrincipal currentUser = this.User;
                var currentUserID = currentUser.FindFirst(ClaimTypes.NameIdentifier).Value;
                objViagem.UsuarioIdFinalizacao = currentUserID;
                objViagem.DataFinalizacao = DateTime.Now;

                //objViagem.CustoCombustivel = Servicos.CalculaCustoCombustivel(objViagem, _unitOfWork);

                //int minutos = -1;
                //objViagem.CustoMotorista = Servicos.CalculaCustoMotorista(
                //    objViagem,
                //    _unitOfWork,
                //    ref minutos
                //);
                //objViagem.Minutos = minutos;

                //objViagem.CustoVeiculo = Servicos.CalculaCustoVeiculo(objViagem, _unitOfWork);

                //objViagem.CustoOperador = 0;
                //objViagem.CustoLavador = 0;

                _unitOfWork.Viagem.Update(objViagem);

                var veiculo = _unitOfWork.Veiculo.GetFirstOrDefault(v =>
                    v.VeiculoId == objViagem.VeiculoId
                );
                veiculo.Quilometragem = viagem.KmFinal;

                _unitOfWork.Veiculo.Update(veiculo);

                _unitOfWork.Save();

                return Json(
                    new
                    {
                        success = true,
                        message = "Viagem finalizada com sucesso",
                        type = 0,
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ViagemEventoController.cs", "FinalizaViagem", error);
                return Json(new
                {
                    success = false,
                    message = "Erro ao finalizar viagem"
                });
            }
        }

        [Route("AjustaViagem")]
        [Consumes("application/json")]
        public IActionResult AjustaViagem([FromBody] AjusteViagem viagem)
        {
            try
            {
                var objViagem = _unitOfWork.Viagem.GetFirstOrDefault(v =>
                    v.ViagemId == viagem.ViagemId
                );
                objViagem.NoFichaVistoria = viagem.NoFichaVistoria;
                objViagem.DataInicial = viagem.DataInicial;
                objViagem.HoraInicio = viagem.HoraInicial;
                objViagem.KmInicial = viagem.KmInicial;
                objViagem.DataFinal = viagem.DataFinal;
                objViagem.HoraFim = viagem.HoraFim;
                objViagem.KmFinal = viagem.KmFinal;

                objViagem.MotoristaId = viagem.MotoristaId;
                objViagem.VeiculoId = viagem.VeiculoId;

                objViagem.CustoCombustivel = Servicos.CalculaCustoCombustivel(objViagem, _unitOfWork);

                int minutos = -1;
                objViagem.CustoMotorista = Servicos.CalculaCustoMotorista(
                    objViagem,
                    _unitOfWork,
                    ref minutos
                );
                objViagem.Minutos = minutos;

                objViagem.CustoVeiculo = Servicos.CalculaCustoVeiculo(objViagem, _unitOfWork);

                objViagem.CustoOperador = 0;
                objViagem.CustoLavador = 0;

                _unitOfWork.Viagem.Update(objViagem);

                _unitOfWork.Save();

                return Json(
                    new
                    {
                        success = true,
                        message = "Viagem ajustada com sucesso",
                        type = 0,
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ViagemEventoController.cs", "AjustaViagem", error);
                return Json(new
                {
                    success = false,
                    message = "Erro ao ajustar viagem"
                });
            }
        }

        [AttributeUsage(
            AttributeTargets.Class | AttributeTargets.Method,
            AllowMultiple = false,
            Inherited = true
        )]
        public class RequestSizeLimitAttribute : Attribute, IAuthorizationFilter, IOrderedFilter
        {
            private readonly FormOptions _formOptions;

            public RequestSizeLimitAttribute(int valueCountLimit)
            {
                _formOptions = new FormOptions()
                {
                    KeyLengthLimit = valueCountLimit,
                    ValueCountLimit = valueCountLimit,
                    ValueLengthLimit = valueCountLimit,
                };
            }

            public int Order
            {
                get; set;
            }

            public void OnAuthorization(AuthorizationFilterContext context)
            {
                var contextFeatures = context.HttpContext.Features;
                var formFeature = contextFeatures.Get<IFormFeature>();

                if (formFeature == null || formFeature.Form == null)
                {
                    contextFeatures.Set<IFormFeature>(
                        new FormFeature(context.HttpContext.Request, _formOptions)
                    );
                }
            }
        }

        public class Objfile
        {
            public string file
            {
                get; set;
            }
            public string viagemid
            {
                get; set;
            }
        }

        /// <summary>
        /// Obtém os dados completos de um evento por ID
        /// Rota: /api/ViagemEvento/ObterPorId?id={guid}
        /// </summary>
        [Route("ObterPorId")]
        [HttpGet]
        public IActionResult ObterPorId(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    return Json(new
                    {
                        success = false,
                        message = "ID do evento inválido"
                    });
                }

                var evento = _unitOfWork.Evento.GetFirstOrDefault(e => e.EventoId == id);

                if (evento == null)
                {
                    return Json(new
                    {
                        success = false,
                        message = "Evento não encontrado"
                    });
                }

                // Retorna os dados completos do evento
                return Json(new
                {
                    success = true,
                    data = new
                    {
                        EventoId = evento.EventoId,
                        Nome = evento.Nome,
                        Descricao = evento.Descricao,
                        DataInicial = evento.DataInicial,
                        DataFinal = evento.DataFinal,
                        QtdParticipantes = evento.QtdParticipantes,
                        Status = evento.Status,
                        SetorSolicitanteId = evento.SetorSolicitanteId,
                        RequisitanteId = evento.RequisitanteId
                    }
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ViagemEventoController.cs", "ObterPorId", error);
                return Json(new
                {
                    success = false,
                    message = "Erro ao buscar dados do evento"
                });
            }
        }

        [Route("FileUpload")]
        [HttpPost]
        [RequestSizeLimit(valueCountLimit: 1999483648)]
        public JsonResult FileUpload(Objfile objFile)
        {
            try
            {
                if (objFile.viagemid == "")
                {
                    return Json(false);
                }

                String viagemid = objFile.viagemid;
                var objViagem = _unitOfWork.Viagem.GetFirstOrDefault(v =>
                    v.ViagemId == Guid.Parse(viagemid)
                );

                string base64 = objFile.file;
                int tamanho = objFile.file.Length;

                _unitOfWork.Viagem.Update(objViagem);

                return Json(viagemid);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ViagemEventoController.cs", "FileUpload", error);
                return Json(false);
            }
        }

        [Route("ObterDetalhamentoCustosViagem")]
        [HttpGet("ObterDetalhamentoCustosViagem")]
        public async Task<IActionResult> ObterDetalhamentoCustosViagem(Guid viagemId)
        {
            try
            {
                // ✅ Buscar viagem com relacionamentos
                var viagem = await _unitOfWork.Viagem.GetFirstOrDefaultAsync(
                    v => v.ViagemId == viagemId ,
                    includeProperties: "Requisitante,Motorista,Veiculo"  // ✅ Carregar relacionamentos
                );
                if (viagem == null)
                {
                    return Json(new { success = false, message = "Viagem não encontrada" });
                }

                // ✅ CALCULAR Tempo Total em Horas
                double tempoTotalHoras = 0;
                if (viagem.DataInicial.HasValue && viagem.HoraInicio.HasValue && 
                    viagem.DataFinal.HasValue && viagem.HoraFim.HasValue)
                {
                    // Combinar Data + Hora
                    var dataHoraInicio = viagem.DataInicial.Value.Date + viagem.HoraInicio.Value.TimeOfDay;
                    var dataHoraFim = viagem.DataFinal.Value.Date + viagem.HoraFim.Value.TimeOfDay;
            
                    // Calcular diferença em horas
                    var diferenca = dataHoraFim - dataHoraInicio;
                    tempoTotalHoras = diferenca.TotalHours;
                }

                // ✅ CALCULAR Valor Total da Viagem (soma de todos os custos)
                double custoTotal = 
                    (viagem.CustoMotorista ?? 0) +
                    (viagem.CustoVeiculo ?? 0) +
                    (viagem.CustoCombustivel ?? 0) +
                    (viagem.CustoLavador ?? 0) +
                    (viagem.CustoOperador ?? 0);

                var resultado = new
                {
                    NomeRequisitante = viagem.Requisitante?.Nome ?? "N/A",
                    DataInicial = viagem.DataInicial,
                    HoraInicial = viagem.HoraInicio?.ToString(@"hh\:mm"), // ✅ HoraInicio
                    DataFinal = viagem.DataFinal,
                    HoraFinal = viagem.HoraFim?.ToString(@"hh\:mm"),      // ✅ HoraFim
                    TempoTotalHoras = tempoTotalHoras,                     // ✅ CALCULADO
                    CustoMotorista = viagem.CustoMotorista ?? 0,
                    CustoVeiculo = viagem.CustoVeiculo ?? 0,
                    CustoCombustivel = viagem.CustoCombustivel ?? 0,
                    CustoTotal = custoTotal                                // ✅ CALCULADO
                };

                return Json(new { success = true, data = resultado });
            }
            catch (Exception ex)
            {
                return Json(new { 
                    success = false, 
                    message = $"Erro ao obter detalhamento: {ex.Message}" 
                });
            }
        }


        /// <summary>
        /// Obtém o detalhamento de custos de um evento
        /// Rota: /api/ViagemEvento/ObterDetalhamentoCustos?eventoId={guid}
        /// </summary>
        [Route("ObterDetalhamentoCustos")]
        [HttpGet]
        public IActionResult ObterDetalhamentoCustos(Guid eventoId)
        {
        try
        {
        if (eventoId == Guid.Empty)
        {
        return Json(new
        {
            success = false ,
            message = "ID do evento inválido"
        });
        }

        // Busca todas as viagens do evento
        var viagens = _unitOfWork.Viagem
            .GetAll()
            .Where(v => v.EventoId == eventoId)
            .ToList();

        if (!viagens.Any())
        {
        return Json(new
        {
            success = false ,
            message = "Nenhuma viagem encontrada para este evento"
        });
        }

        // Calcula o tempo total de viagem em horas
        double tempoTotalHoras = 0;
        DateTime? primeiraDataInicial = null;
        DateTime? ultimaDataFinal = null;

        foreach (var viagem in viagens)
        {
        if (viagem.DataInicial.HasValue && viagem.DataFinal.HasValue)
        {
        // Atualiza primeira data inicial
        if (!primeiraDataInicial.HasValue || viagem.DataInicial.Value < primeiraDataInicial.Value)
        {
        primeiraDataInicial = viagem.DataInicial.Value;
        }

        // Atualiza última data final
        if (!ultimaDataFinal.HasValue || viagem.DataFinal.Value > ultimaDataFinal.Value)
        {
        ultimaDataFinal = viagem.DataFinal.Value;
        }

        // Calcula tempo desta viagem
        var dataHoraInicial = viagem.DataInicial.Value.Date;
        var dataHoraFinal = viagem.DataFinal.Value.Date;

        if (viagem.HoraInicio.HasValue)
        {
            dataHoraInicial = dataHoraInicial.Add(viagem.HoraInicio.Value.TimeOfDay);
        }

        if (viagem.HoraFim.HasValue)
        {
            dataHoraFinal = dataHoraFinal.Add(viagem.HoraFim.Value.TimeOfDay);
        }

        var duracao = dataHoraFinal - dataHoraInicial;
        tempoTotalHoras += duracao.TotalHours;
        }
        }

        // Soma os custos
        var custoMotorista = viagens.Sum(v => v.CustoMotorista ?? 0);
        var custoVeiculo = viagens.Sum(v => v.CustoVeiculo ?? 0);
        var custoCombustivel = viagens.Sum(v => v.CustoCombustivel ?? 0);

        return Json(new
        {
            success = true ,
            data = new
            {
                TempoTotalHoras = Math.Round(tempoTotalHoras , 2) ,
                DataInicial = primeiraDataInicial ,
                HoraInicial = viagens.Where(v => v.DataInicial == primeiraDataInicial)
                                     .Select(v => v.HoraInicio)
                                     .FirstOrDefault() ,
                DataFinal = ultimaDataFinal ,
                HoraFinal = viagens.Where(v => v.DataFinal == ultimaDataFinal)
                                   .Select(v => v.HoraFim)
                                   .FirstOrDefault() ,
                CustoMotorista = custoMotorista ,
                CustoVeiculo = custoVeiculo ,
                CustoCombustivel = custoCombustivel ,
                CustoTotal = custoMotorista + custoVeiculo + custoCombustivel ,
                QuantidadeViagens = viagens.Count
            }
        });
        }
        catch (Exception error)
        {
        Alerta.TratamentoErroComLinha("ViagemEventoController.cs" , "ObterDetalhamentoCustos" , error);
        return Json(new
        {
            success = false ,
            message = "Erro ao buscar detalhamento de custos"
        });
        }
        }
    }
}
