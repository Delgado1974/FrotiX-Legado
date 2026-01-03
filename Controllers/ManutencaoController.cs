using FrotiX.Models;
using FrotiX.Repository.IRepository;
using FrotiX.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Threading.Tasks;

namespace FrotiX.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ManutencaoController :Controller
    {
        private readonly IWebHostEnvironment _hostingEnvironment;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMemoryCache _cache;

        public ManutencaoController(
            IUnitOfWork unitOfWork ,
            IWebHostEnvironment hostingEnvironment ,
            IMemoryCache cache
        )
        {
            try
            {
                _unitOfWork = unitOfWork;
                _hostingEnvironment = hostingEnvironment;
                _cache = cache;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ManutencaoController.cs" , "ManutencaoController" , error);
            }
        }

        // helper genérico para cache
        private async Task<List<T>> GetCachedAsync<T>(
            string key ,
            Func<Task<List<T>>> factory ,
            TimeSpan ttl
        )
        {
            return await _cache.GetOrCreateAsync(
                key ,
                async entry =>
                {
                    entry.AbsoluteExpirationRelativeToNow = ttl;
                    return await factory();
                }
            );
        }

        // =======================================================================
        // 1) Predicate unificado – sempre filtra por DataSolicitacaoRaw
        // =======================================================================
        // ------------------------- Filtro (sem mudanças de lógica)
        static Expression<Func<ViewManutencao , bool>> manutencoesFilters(
            Guid veiculoId ,
            string statusId ,
            int? mes ,
            int? ano ,
            DateTime? dtIni ,
            DateTime? dtFim
        )
        {
            bool filtrarStatus = !string.IsNullOrWhiteSpace(statusId) && statusId != "Todas";
            bool filtrarMesAno = mes.HasValue && ano.HasValue;
            bool filtrarPeriodo = dtIni.HasValue && dtFim.HasValue;

            return vm =>
                (veiculoId == Guid.Empty || vm.VeiculoId == veiculoId)
                && (!filtrarStatus || vm.StatusOS == statusId)
                && (
                    (!filtrarMesAno && !filtrarPeriodo)
                    || (
                        filtrarMesAno
                        && vm.DataSolicitacaoRaw.HasValue
                        && vm.DataSolicitacaoRaw.Value.Month == mes.Value
                        && vm.DataSolicitacaoRaw.Value.Year == ano.Value
                    )
                    || (
                        filtrarPeriodo
                        && vm.DataSolicitacaoRaw.HasValue
                        && vm.DataSolicitacaoRaw.Value.Date >= dtIni.Value.Date
                        && vm.DataSolicitacaoRaw.Value.Date <= dtFim.Value.Date
                    )
                );
        }

        // =======================================================================
        // 2) Endpoint GET único – aplica todos os filtros e projeta para o DataTable
        //     Rota efetiva (com [Route("api/[controller]")]):  GET /api/Manutencao
        // =======================================================================
        [HttpGet]
        public IActionResult Get(
            string veiculoId = null ,
            string statusId = null ,
            string mes = null ,
            string ano = null ,
            string dataInicial = null ,
            string dataFinal = null
        )
        {
            try
            {
                // Veículo
                Guid veiculoGuid = Guid.Empty;
                if (!string.IsNullOrWhiteSpace(veiculoId) && Guid.TryParse(veiculoId , out var vg))
                    veiculoGuid = vg;

                // Mês/Ano
                int? mesInt = null,
                    anoInt = null;
                if (int.TryParse(mes , out var m))
                    mesInt = m;
                if (int.TryParse(ano , out var a))
                    anoInt = a;

                // Período – aceitar dd/MM/yyyy, yyyy-MM-dd e variantes com hora
                var formatos = new[]
                {
                    "dd/MM/yyyy",
                    "dd/MM/yyyy HH:mm",
                    "dd/MM/yyyy HH:mm:ss",
                    "yyyy-MM-dd",
                    "yyyy-MM-ddTHH:mm",
                    "yyyy-MM-ddTHH:mm:ss",
                };
                var culturaBr = new CultureInfo("pt-BR");
                DateTime? dtIni = null,
                    dtFim = null;

                if (
                    !string.IsNullOrWhiteSpace(dataInicial)
                    && DateTime.TryParseExact(
                        dataInicial.Trim() ,
                        formatos ,
                        culturaBr ,
                        DateTimeStyles.None ,
                        out var dti
                    )
                )
                    dtIni = dti;

                if (
                    !string.IsNullOrWhiteSpace(dataFinal)
                    && DateTime.TryParseExact(
                        dataFinal.Trim() ,
                        formatos ,
                        culturaBr ,
                        DateTimeStyles.None ,
                        out var dtf
                    )
                )
                    dtFim = dtf;

                // Normaliza período invertido
                if (dtIni.HasValue && dtFim.HasValue && dtIni > dtFim)
                {
                    var tmp = dtIni;
                    dtIni = dtFim;
                    dtFim = tmp;
                }

                // Status default: se vazio e houver QUALQUER outro filtro, vira "Todas"
                bool temFiltroData =
                    (mesInt.HasValue && anoInt.HasValue) || (dtIni.HasValue && dtFim.HasValue);
                if (string.IsNullOrWhiteSpace(statusId) && (veiculoGuid == Guid.Empty || temFiltroData))
                    statusId = "Todas";

                // 1) Consulta + filtro + projeção (sem formatar datas ainda)
                var queryMaterializada = _unitOfWork
                    .ViewManutencao.GetAllReducedIQueryable(
                        selector: vm => new
                        {
                            vm.ManutencaoId ,
                            vm.NumOS ,
                            vm.DescricaoVeiculo ,
                            vm.DataSolicitacao ,
                            vm.DataEntrega ,
                            vm.DataRecolhimento ,
                            vm.DataDevolucaoRaw , // <- DateTime?
                            vm.ResumoOS ,
                            StatusOS = vm.StatusOS ,
                            vm.Habilitado ,
                            vm.Tooltip ,
                            vm.OpacityTooltipEditarEditar ,
                            vm.Icon ,
                            Dias = vm.Dias ?? 0 ,
                            vm.Reserva ,
                            vm.DataSolicitacaoRaw , // <- usado no filtro e ordenação
                        } ,
                        filter: manutencoesFilters(veiculoGuid , statusId , mesInt , anoInt , dtIni , dtFim) ,
                        asNoTracking: true
                    )
                    .OrderByDescending(vm => vm.DataSolicitacaoRaw)
                    .ToList();

                // 2) Projeção final para o DataTable (agora formatamos DataDevolucao)
                var result = queryMaterializada
                    .Select(vm => new
                    {
                        vm.ManutencaoId ,
                        vm.NumOS ,
                        vm.DescricaoVeiculo ,
                        vm.DataSolicitacao ,
                        vm.DataEntrega ,
                        vm.DataRecolhimento ,
                        DataDevolucao = vm.DataDevolucaoRaw.HasValue
                            ? vm.DataDevolucaoRaw.Value.ToString("dd/MM/yyyy")
                            : null ,
                        vm.ResumoOS ,
                        vm.StatusOS ,
                        vm.Habilitado ,
                        vm.Tooltip ,
                        vm.OpacityTooltipEditarEditar ,
                        vm.Icon ,
                        vm.Dias ,
                        vm.Reserva ,
                    })
                    .ToList();

                return Json(new
                {
                    data = result
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ManutencaoController.cs" , "Get" , error);
                return View(); // padronizado
            }
        }

        //Apaga Conexão Viagem-OS
        //=======================
        [Route("ApagaConexaoOcorrencia")]
        [HttpPost]
        public JsonResult ApagaConexaoOcorrencia(Models.Viagem viagem = null)
        {
            try
            {
                //// ---- Remove a conexão entre OS e Ocorrência
                //var objViagem = _unitOfWork.Viagem.GetFirstOrDefault(v =>
                //    v.ItemManutencaoId == viagem.ItemManutencaoId
                //);
                //objViagem.StatusOcorrencia = "Aberta";
                //objViagem.ItemManutencaoId = Guid.Empty;
                //_unitOfWork.Viagem.Update(objViagem);

                //_unitOfWork.Save();

                //// ----- Apaga o Item de Ocorrência da OS
                //var objItemOS = _unitOfWork.ItensManutencao.GetFirstOrDefault(im =>
                //    im.ItemManutencaoId == viagem.ItemManutencaoId
                //);
                //_unitOfWork.ItensManutencao.Remove(objItemOS);

                //_unitOfWork.Save();

                return new JsonResult(new
                {
                    message = "Item da OS Adicionado com Sucesso!"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ManutencaoController.cs" , "ApagaConexaoOcorrencia" , error);
                return new JsonResult(new
                {
                    sucesso = false
                }); // padronizado
            }
        }

        //Apaga Conexão Pendência-OS
        //=========================
        [Route("ApagaConexaoPendencia")]
        [HttpPost]
        public JsonResult ApagaConexaoPendencia(Models.ItensManutencao itensManutencao = null)
        {
            try
            {
                //// ---- Remove a conexão entre OS e Ocorrência
                //var objViagem = _unitOfWork.Viagem.GetFirstOrDefault(v =>
                //    v.ItemManutencaoId == itensManutencao.ItemManutencaoId
                //);
                //objViagem.StatusOcorrencia = "Pendente";
                //objViagem.ItemManutencaoId = Guid.Empty;
                //_unitOfWork.Viagem.Update(objViagem);

                //// ----- Remove a conexão entre OS e Pendência
                //var objItemOS = _unitOfWork.ItensManutencao.GetFirstOrDefault(im =>
                //    im.ItemManutencaoId == itensManutencao.ItemManutencaoId
                //);
                //objItemOS.Status = "Pendente";
                //objItemOS.ManutencaoId = Guid.Empty;
                //_unitOfWork.ItensManutencao.Update(objItemOS);

                //_unitOfWork.Save();

                return new JsonResult(new
                {
                    message = "Item da OS Adicionado com Sucesso!"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ManutencaoController.cs" , "ApagaConexaoPendencia" , error);
                return new JsonResult(new
                {
                    sucesso = false
                }); // padronizado
            }
        }

        //Apaga Conexão Viagem-OS
        //=======================
        [Route("ApagaItens")]
        [HttpPost]
        public JsonResult ApagaItens(Models.ItensManutencao itensManutencao = null)
        {
            try
            {
                var itens = _unitOfWork.ItensManutencao.GetAll(im =>
                    im.ManutencaoId == itensManutencao.ManutencaoId
                );

                foreach (var itemOS in itens)
                {
                    // Libera a ocorrência em OcorrenciaViagem (se existir)
                    if (itemOS.ViagemId != null && itemOS.ViagemId != Guid.Empty)
                    {
                        var ocorrencia = _unitOfWork.OcorrenciaViagem.GetFirstOrDefault(o =>
                            o.ViagemId == itemOS.ViagemId
                        );
                        if (ocorrencia != null)
                        {
                            ocorrencia.Status = "Aberta";
                            ocorrencia.StatusOcorrencia = true; // true = Aberta
                            ocorrencia.ItemManutencaoId = null;
                            _unitOfWork.OcorrenciaViagem.Update(ocorrencia);
                        }
                    }

                    // Remove o item de manutenção
                    _unitOfWork.ItensManutencao.Remove(itemOS);
                }

                _unitOfWork.Save(); // <-- uma vez só
                return new JsonResult(new
                {
                    message = "Item da OS removido com Sucesso!"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ManutencaoController.cs" , "ApagaItens" , error);
                return new JsonResult(new
                {
                    sucesso = false
                }); // padronizado
            }
        }

        [Route("ApagaLavagem")]
        [HttpPost]
        public IActionResult ApagaLavagem(Lavagem lavagem = null)
        {
            try
            {
                if (lavagem != null && lavagem.LavagemId != Guid.Empty)
                {
                    var objFromDb = _unitOfWork.Lavagem.GetFirstOrDefault(u =>
                        u.LavagemId == lavagem.LavagemId
                    );
                    if (objFromDb != null)
                    {
                        var objLavadoresLavagem = _unitOfWork.LavadoresLavagem.GetAll(ll =>
                            ll.LavagemId == lavagem.LavagemId
                        );
                        foreach (var lavadorlavagem in objLavadoresLavagem)
                        {
                            _unitOfWork.LavadoresLavagem.Remove(lavadorlavagem);
                            _unitOfWork.Save();
                        }

                        _unitOfWork.Lavagem.Remove(objFromDb);
                        _unitOfWork.Save();
                        return Json(new
                        {
                            success = true ,
                            message = "Lavagem removida com sucesso"
                        });
                    }
                }
                return Json(new
                {
                    success = false ,
                    message = "Erro ao apagar Lavagem"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ManutencaoController.cs" , "ApagaLavagem" , error);
                return View(); // padronizado
            }
        }

        //Apaga OS/Manutenção
        //===================
        [Route("CancelaOS")]
        [HttpGet]
        public JsonResult CancelaOS(string Id = null)
        {
            try
            {
                // ---- Percorre os Itens de Manutenção e libera as Ocorrências vinculadas
                //=============================================================================
                var itensOS = _unitOfWork.ItensManutencao.GetAll(im => im.ManutencaoId == Guid.Parse(Id));
                foreach (var itemOS in itensOS)
                {
                    // Atualiza o status do item para "Cancelado"
                    itemOS.Status = "Cancelado";
                    _unitOfWork.ItensManutencao.Update(itemOS);
                    
                    // Libera a ocorrência vinculada
                    if (itemOS.ViagemId != null && itemOS.ViagemId != Guid.Empty)
                    {
                        var ocorrencia = _unitOfWork.OcorrenciaViagem.GetFirstOrDefault(o =>
                            o.ViagemId == itemOS.ViagemId
                        );
                        if (ocorrencia != null)
                        {
                            ocorrencia.Status = "Aberta";
                            ocorrencia.StatusOcorrencia = true;
                            ocorrencia.ItemManutencaoId = null;
                            ocorrencia.Solucao = "";
                            _unitOfWork.OcorrenciaViagem.Update(ocorrencia);
                        }
                    }
                }

                //------Atualiza o Registro de Manutenção para Cancelada
                //======================================================
                ClaimsPrincipal currentUser = this.User;
                var currentUserID = currentUser.FindFirst(ClaimTypes.NameIdentifier).Value;

                var objManutencao = _unitOfWork.Manutencao.GetFirstOrDefault(m =>
                    m.ManutencaoId == Guid.Parse(Id)
                );

                objManutencao.StatusOS = "Cancelada";
                objManutencao.IdUsuarioCancelamento = currentUserID;
                objManutencao.DataCancelamento = DateTime.Now;

                _unitOfWork.Manutencao.Update(objManutencao);

                _unitOfWork.Save();

                return new JsonResult(new
                {
                    success = true ,
                    message = "OS Cancelada com Sucesso!"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ManutencaoController.cs" , "CancelaOS" , error);
                return new JsonResult(new
                {
                    sucesso = false
                }); // padronizado
            }
        }

        //Fecha Manutenção/OS
        //======================
        [Route("FechaOS")]
        [HttpPost]
        public JsonResult FechaOS(Models.Manutencao manutencao = null)
        {
            try
            {
                var objManutencao = _unitOfWork.Manutencao.GetFirstOrDefault(m =>
                    m.ManutencaoId == manutencao.ManutencaoId
                );

                objManutencao.StatusOS = "Fechada";
                objManutencao.DataDevolucao = manutencao.DataDevolucao;
                objManutencao.ResumoOS = manutencao.ResumoOS;

                if (manutencao.VeiculoReservaId != null)
                {
                    objManutencao.ReservaEnviado = true;
                }

                ClaimsPrincipal currentUser = this.User;
                var currentUserID = currentUser.FindFirst(ClaimTypes.NameIdentifier).Value;

                objManutencao.IdUsuarioFinalizacao = currentUserID;
                objManutencao.DataFinalizacao = DateTime.Now;

                _unitOfWork.Manutencao.Update(objManutencao);

                _unitOfWork.Save();

                return new JsonResult(
                    new
                    {
                        data = manutencao.ManutencaoId ,
                        message = "OS Baixada com Sucesso!"
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ManutencaoController.cs" , "FechaOS" , error);
                return new JsonResult(new
                {
                    sucesso = false
                }); // padronizado
            }
        }

        //Baixa Manutenção/OS (chamado pelo ListaManutencao.js)
        //=====================================================
        [Route("BaixaOS")]
        [HttpPost]
        public JsonResult BaixaOS(
            [FromForm] string manutencaoId = null,
            [FromForm] string dataDevolucao = null,
            [FromForm] string resumoOS = null,
            [FromForm] string reservaEnviado = null,
            [FromForm] string veiculoReservaId = null,
            [FromForm] string dataRecebimentoReserva = null,
            [FromForm] string dataDevolucaoReserva = null,
            [FromForm] string itensRemovidosJson = null // JSON array de itens removidos
        )
        {
            try
            {
                // Parse do manutencaoId
                if (string.IsNullOrWhiteSpace(manutencaoId) || !Guid.TryParse(manutencaoId, out var manutencaoGuid))
                {
                    return new JsonResult(new
                    {
                        sucesso = false,
                        message = "ID da OS inválido"
                    });
                }

                var objManutencao = _unitOfWork.Manutencao.GetFirstOrDefault(m =>
                    m.ManutencaoId == manutencaoGuid
                );

                if (objManutencao == null)
                {
                    return new JsonResult(new
                    {
                        sucesso = false,
                        message = "OS não encontrada"
                    });
                }

                // Parse dos itens removidos (serão marcados como Pendente)
                var listaItensRemovidos = new List<Guid>();
                if (!string.IsNullOrWhiteSpace(itensRemovidosJson) && itensRemovidosJson != "[]")
                {
                    try
                    {
                        // Parse do JSON array
                        var itensArray = System.Text.Json.JsonSerializer.Deserialize<List<ItemRemovidoDTO>>(itensRemovidosJson);
                        if (itensArray != null)
                        {
                            foreach (var item in itensArray)
                            {
                                if (Guid.TryParse(item.itemManutencaoId, out var guidId))
                                {
                                    listaItensRemovidos.Add(guidId);
                                }
                            }
                        }
                    }
                    catch
                    {
                        // Se falhar o parse JSON, tenta como string separada por vírgula (fallback)
                        foreach (var id in itensRemovidosJson.Split(',', StringSplitOptions.RemoveEmptyEntries))
                        {
                            if (Guid.TryParse(id.Trim(), out var guidId))
                            {
                                listaItensRemovidos.Add(guidId);
                            }
                        }
                    }
                }

                // Atualiza dados da OS
                objManutencao.StatusOS = "Fechada";
                objManutencao.ResumoOS = resumoOS;
                
                // Parse da data de devolução
                if (!string.IsNullOrWhiteSpace(dataDevolucao))
                {
                    if (DateTime.TryParse(dataDevolucao, out var dtDevolucao))
                        objManutencao.DataDevolucao = dtDevolucao;
                }

                // Reserva
                if (reservaEnviado == "1")
                {
                    objManutencao.ReservaEnviado = true;
                    
                    if (!string.IsNullOrWhiteSpace(veiculoReservaId) && Guid.TryParse(veiculoReservaId, out var vReservaId))
                        objManutencao.VeiculoReservaId = vReservaId;
                    
                    if (!string.IsNullOrWhiteSpace(dataRecebimentoReserva) && DateTime.TryParse(dataRecebimentoReserva, out var dtReceb))
                        objManutencao.DataRecebimentoReserva = dtReceb;
                    
                    if (!string.IsNullOrWhiteSpace(dataDevolucaoReserva) && DateTime.TryParse(dataDevolucaoReserva, out var dtDevRes))
                        objManutencao.DataDevolucaoReserva = dtDevRes;
                }

                // Usuário e data de finalização
                ClaimsPrincipal currentUser = this.User;
                var currentUserID = currentUser.FindFirst(ClaimTypes.NameIdentifier).Value;
                objManutencao.IdUsuarioFinalizacao = currentUserID;
                objManutencao.DataFinalizacao = DateTime.Now;

                _unitOfWork.Manutencao.Update(objManutencao);

                // Processa todos os itens da OS
                var itensOS = _unitOfWork.ItensManutencao.GetAll(im => im.ManutencaoId == manutencaoGuid);
                int itensBaixados = 0;
                int itensPendentes = 0;
                
                foreach (var itemOS in itensOS)
                {
                    // Verifica se o item foi removido (deve ser Pendente)
                    bool itemRemovido = listaItensRemovidos.Contains(itemOS.ItemManutencaoId);
                    
                    if (itemRemovido)
                    {
                        // Item REMOVIDO = Status "Pendente"
                        itemOS.Status = "Pendente";
                        _unitOfWork.ItensManutencao.Update(itemOS);

                        // Atualiza a ocorrência vinculada para "Pendente"
                        if (itemOS.ViagemId != null && itemOS.ViagemId != Guid.Empty)
                        {
                            var ocorrencia = _unitOfWork.OcorrenciaViagem.GetFirstOrDefault(o =>
                                o.ViagemId == itemOS.ViagemId
                            );
                            if (ocorrencia != null)
                            {
                                ocorrencia.Status = "Pendente";
                                ocorrencia.StatusOcorrencia = true; // Disponível para nova OS
                                ocorrencia.ItemManutencaoId = null; // Desvincula da OS
                                ocorrencia.Solucao = "";
                                _unitOfWork.OcorrenciaViagem.Update(ocorrencia);
                            }
                        }
                        itensPendentes++;
                    }
                    else
                    {
                        // Item MANTIDO = Status "Baixada"
                        itemOS.Status = "Baixada";
                        _unitOfWork.ItensManutencao.Update(itemOS);

                        // Atualiza a ocorrência vinculada para "Baixada"
                        if (itemOS.ViagemId != null && itemOS.ViagemId != Guid.Empty)
                        {
                            var ocorrencia = _unitOfWork.OcorrenciaViagem.GetFirstOrDefault(o =>
                                o.ViagemId == itemOS.ViagemId
                            );
                            if (ocorrencia != null)
                            {
                                ocorrencia.Status = "Baixada";
                                ocorrencia.StatusOcorrencia = false;
                                ocorrencia.DataBaixa = DateTime.Now;
                                ocorrencia.Solucao = "Baixada na OS nº " + objManutencao.NumOS;
                                _unitOfWork.OcorrenciaViagem.Update(ocorrencia);
                            }
                        }
                        itensBaixados++;
                    }
                }

                _unitOfWork.Save();

                return new JsonResult(new
                {
                    sucesso = true,
                    data = manutencaoGuid,
                    message = "OS Baixada com Sucesso!",
                    itensBaixados = itensBaixados,
                    itensPendentes = itensPendentes
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ManutencaoController.cs", "BaixaOS", error);
                return new JsonResult(new
                {
                    sucesso = false,
                    message = "Erro ao baixar OS"
                });
            }
        }

        //Insere Novo Item de  Manutenção
        //===============================
        [Route("InsereItemOS")]
        [HttpPost]
        public JsonResult InsereItemOS(Models.ItensManutencao itensManutencao = null)
        {
            try
            {
                _unitOfWork.ItensManutencao.Add(itensManutencao);

                // Atualiza o Status em OcorrenciaViagem para torná-la indisponível
                if (itensManutencao.ViagemId != null && itensManutencao.ViagemId != Guid.Empty)
                {
                    var ocorrencia = _unitOfWork.OcorrenciaViagem.GetFirstOrDefault(o =>
                        o.ViagemId == itensManutencao.ViagemId
                    );
                    if (ocorrencia != null)
                    {
                        // Vincula à OS
                        ocorrencia.ItemManutencaoId = itensManutencao.ItemManutencaoId;
                        
                        if (itensManutencao.Status == "Baixada")
                        {
                            // Baixando a ocorrência
                            ocorrencia.Status = "Baixada";
                            ocorrencia.StatusOcorrencia = false;
                            ocorrencia.DataBaixa = DateTime.Now;
                            ocorrencia.Solucao = "Baixada na OS nº "
                                + itensManutencao.NumOS
                                + " de "
                                + itensManutencao.DataOS;
                        }
                        else
                        {
                            // Em manutenção - Status permanece "Aberta", StatusOcorrencia = true
                            // O ItemManutencaoId preenchido indica que está em manutenção
                            ocorrencia.Status = "Aberta";
                            ocorrencia.StatusOcorrencia = true;
                        }
                        
                        _unitOfWork.OcorrenciaViagem.Update(ocorrencia);
                    }
                }

                _unitOfWork.Save();

                return new JsonResult(new
                {
                    message = "Item da OS Adicionado com Sucesso!"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ManutencaoController.cs" , "InsereItemOS" , error);
                return new JsonResult(new
                {
                    sucesso = false
                }); // padronizado
            }
        }

        [Route("InsereLavadoresLavagem")]
        [Consumes("application/json")]
        public IActionResult InsereLavadoresLavagem(
            [FromBody] LavadoresLavagem lavadoreslavagem = null
        )
        {
            try
            {
                //Insere LavadoresLavagem
                //=======================
                var objLavadoresLavagem = new LavadoresLavagem();
                objLavadoresLavagem.LavagemId = lavadoreslavagem.LavagemId;
                objLavadoresLavagem.LavadorId = lavadoreslavagem.LavadorId;

                _unitOfWork.LavadoresLavagem.Add(objLavadoresLavagem);

                _unitOfWork.Save();

                return Json(new
                {
                    success = true ,
                    message = "Lavadores Cadastrados com Sucesso!"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ManutencaoController.cs" , "InsereLavadoresLavagem" , error);
                return View(); // padronizado
            }
        }

        [Route("InsereLavagem")]
        [Consumes("application/json")]
        public IActionResult InsereLavagem([FromBody] Lavagem lavagem = null)
        {
            try
            {
                //Insere Lavagem
                //===============
                var objLavagem = new Lavagem();
                objLavagem.Data = lavagem.Data;
                objLavagem.HorarioInicio = lavagem.HorarioInicio;
                objLavagem.HorarioFim = lavagem.HorarioFim;
                objLavagem.VeiculoId = lavagem.VeiculoId;
                objLavagem.MotoristaId = lavagem.MotoristaId;

                _unitOfWork.Lavagem.Add(objLavagem);

                _unitOfWork.Save();

                return Json(
                    new
                    {
                        success = true ,
                        message = "Lavagem Cadastrada com Sucesso!" ,
                        lavagemId = objLavagem.LavagemId ,
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ManutencaoController.cs" , "InsereLavagem" , error);
                return View(); // padronizado
            }
        }

        //Insere Nova Manutenção
        //======================
        [Route("InsereOS")]
        [HttpPost]
        public JsonResult InsereOS(Models.Manutencao manutencao = null)
        {
            try
            {
                ClaimsPrincipal currentUser = this.User;
                var currentUserAspId = currentUser.FindFirst(ClaimTypes.NameIdentifier).Value;

                if (manutencao.ManutencaoId == Guid.Empty)
                {
                    manutencao.IdUsuarioCriacao = currentUserAspId;
                    manutencao.DataCriacao = DateTime.Now;
                    _unitOfWork.Manutencao.Add(manutencao);
                }
                else
                {
                    manutencao.IdUsuarioAlteracao = currentUserAspId;
                    manutencao.DataAlteracao = DateTime.Now;
                    _unitOfWork.Manutencao.Update(manutencao);
                }

                _unitOfWork.Save();

                return new JsonResult(
                    new
                    {
                        data = manutencao.ManutencaoId ,
                        message = "OS Registrada com Sucesso!"
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ManutencaoController.cs" , "InsereOS" , error);
                return new JsonResult(new
                {
                    sucesso = false
                }); // padronizado
            }
        }

        [Route("ItensOS")]
        [HttpGet]
        public async Task<IActionResult> ItensOS(string id = null)
        {
            try
            {
                if (!Guid.TryParse(id , out var manutencaoId))
                    return Json(new
                    {
                        data = Array.Empty<object>()
                    });

                var result = await _unitOfWork
                    .ViewItensManutencao.GetAllReducedIQueryable(
                        selector: vim => new
                        {
                            vim.ItemManutencaoId ,
                            vim.ManutencaoId ,
                            vim.TipoItem ,
                            vim.NumFicha ,
                            vim.DataItem ,
                            vim.Resumo ,
                            vim.Descricao ,
                            vim.Status ,
                            vim.MotoristaId ,
                            vim.ViagemId ,
                            vim.ImagemOcorrencia ,
                            vim.NomeMotorista ,
                        } ,
                        filter: vim =>
                            vim.ManutencaoId == manutencaoId
                            && (vim.Status == "Manutenção" || vim.Status == "Baixada") ,
                        asNoTracking: true
                    )
                    .OrderByDescending(v => v.DataItem) // ordena no SQL
                    .ToListAsync();

                return Json(new
                {
                    data = result
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ManutencaoController.cs" , "ItensOS" , error);
                return View(); // padronizado
            }
        }

        [Route("ListaLavagemLavadores")]
        [HttpGet]
        public IActionResult ListaLavagemLavadores(Guid id)
        {
            try
            {
                var objLavagens = (
                    from vl in _unitOfWork.ViewLavagem.GetAll()
                    select new
                    {
                        vl.LavagemId ,
                        vl.Data ,
                        HorarioInicio = DateTime.Parse(vl.HorarioInicio).ToString("HH:mm") ,
                        HorarioFim = !string.IsNullOrEmpty(vl.HorarioFim) ? DateTime.Parse(vl.HorarioFim).ToString("HH:mm") : null ,
                        vl.DescricaoVeiculo ,
                        vl.Nome ,
                        vl.Lavadores ,
                        vl.LavadoresId ,
                    }
                ).ToList();

                var objLavadores = _unitOfWork.Lavador.GetAll();

                foreach (var lavador in objLavadores)
                {
                    if (lavador.LavadorId == id)
                    {
                    }
                    else
                    {
                        var lavagens = objLavagens.Count;

                        for (int i = 0; i < lavagens; i++)
                        {
                            if (objLavagens[i].LavadoresId.Contains(id.ToString().ToUpper()))
                            {
                            }
                            else
                            {
                                objLavagens.RemoveAt(i);
                                lavagens--;
                                i = -1;
                            }
                        }
                    }
                }

                return Json(new
                {
                    data = objLavagens
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ManutencaoController.cs" , "ListaLavagemLavadores" , error);
                return View(); // padronizado
            }
        }

        [Route("ListaLavagemMotoristas")]
        [HttpGet]
        public IActionResult ListaLavagemMotoristas(Guid id)
        {
            try
            {
                var result = (
                    from vl in _unitOfWork.ViewLavagem.GetAll()
                    where vl.MotoristaId == id
                    select new
                    {
                        vl.LavagemId ,
                        vl.Data ,
                        HorarioInicio = DateTime.Parse(vl.HorarioInicio).ToString("HH:mm") ,
                        HorarioFim = !string.IsNullOrEmpty(vl.HorarioFim) ? DateTime.Parse(vl.HorarioFim).ToString("HH:mm") : null ,
                        vl.DescricaoVeiculo ,
                        vl.Nome ,
                        vl.Lavadores ,
                    }
                ).ToList();

                return Json(new
                {
                    data = result
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ManutencaoController.cs" , "ListaLavagemMotoristas" , error);
                return View(); // padronizado
            }
        }

        [Route("ListaLavagemVeiculos")]
        [HttpGet]
        public IActionResult ListaLavagemVeiculos(Guid id)
        {
            try
            {
                var result = (
                    from vl in _unitOfWork.ViewLavagem.GetAll()
                    where vl.VeiculoId == id
                    select new
                    {
                        vl.LavagemId ,
                        vl.Data ,
                        HorarioInicio = DateTime.Parse(vl.HorarioInicio).ToString("HH:mm") ,
                        HorarioFim = !string.IsNullOrEmpty(vl.HorarioFim) ? DateTime.Parse(vl.HorarioFim).ToString("HH:mm") : null ,
                        vl.DescricaoVeiculo ,
                        vl.Nome ,
                        vl.Lavadores ,
                    }
                ).ToList();

                return Json(new
                {
                    data = result
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ManutencaoController.cs" , "ListaLavagemVeiculos" , error);
                return View(); // padronizado
            }
        }

        [Route("ListaLavagens")]
        [HttpGet]
        public IActionResult ListaLavagens(string id = null)
        {
            try
            {
                var result = (
                    from vl in _unitOfWork.ViewLavagem.GetAll()
                    select new
                    {
                        vl.LavagemId ,
                        vl.Data ,
                        HorarioInicio = DateTime.Parse(vl.HorarioInicio).ToString("HH:mm") ,
                        HorarioFim = !string.IsNullOrEmpty(vl.HorarioFim) ? DateTime.Parse(vl.HorarioFim).ToString("HH:mm") : null ,
                        vl.DescricaoVeiculo ,
                        vl.Nome ,
                        vl.Lavadores ,
                    }
                ).ToList();

                return Json(new
                {
                    data = result
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ManutencaoController.cs" , "ListaLavagens" , error);
                return View(); // padronizado
            }
        }

        [Route("ListaLavagensData")]
        [HttpGet]
        public IActionResult ListaLavagensData(string id = null)
        {
            try
            {
                var result = (
                    from vl in _unitOfWork.ViewLavagem.GetAll()
                    where vl.Data == id
                    select new
                    {
                        vl.LavagemId ,
                        vl.Data ,
                        HorarioInicio = DateTime.Parse(vl.HorarioInicio).ToString("HH:mm") ,
                        HorarioFim = !string.IsNullOrEmpty(vl.HorarioFim) ? DateTime.Parse(vl.HorarioFim).ToString("HH:mm") : null ,
                        vl.DescricaoVeiculo ,
                        vl.Nome ,
                        vl.Lavadores ,
                    }
                ).ToList();

                return Json(new
                {
                    data = result
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ManutencaoController.cs" , "ListaLavagensData" , error);
                return View(); // padronizado
            }
        }

        [Route("ListaManutencao")]
        [HttpGet]
        public async Task<IActionResult> ListaManutencao(string id = null)
        {
            try
            {
                var objManutencacao = await _unitOfWork
                    .ViewManutencao.GetAllReducedIQueryable(
                        selector: vm => vm ,
                        filter: manutencoesFilters("Aberta")
                    )
                    .AsNoTracking()
                    //.OrderBy(vm => vm.DataSolicitacaoRaw) // se existir a coluna raw
                    .ToListAsync();

                return Json(new
                {
                    data = objManutencacao
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ManutencaoController.cs" , "ListaManutencao" , error);
                return View(); // padronizado
            }
        }

        [Route("ListaManutencaoData")]
        [HttpGet]
        public IActionResult ListaManutencaoData(string id = null)
        {
            try
            {
                var dataValida = DateTime.TryParse(id , out var dataSolicitacao);
                var alvo = dataValida
                    ? dataSolicitacao.ToString("dd/MM/yyyy" , new CultureInfo("pt-BR"))
                    : null;

                var result = _unitOfWork
                    .ViewManutencao.GetAllReducedIQueryable(
                        selector: vm => vm ,
                        // Opção A (sem RAW):
                        filter: dataValida ? (vm => vm.DataSolicitacao == alvo) : (vm => false)
                    // Opção B (se tiver RAW):
                    //filter: dataValida ? (vm => vm.DataSolicitacaoRaw.HasValue &&
                    //                            vm.DataSolicitacaoRaw.Value.Date == dataSolicitacao.Date)
                    //                   : (vm => false)
                    )
                    .AsNoTracking()
                    //.OrderBy(vm => vm.DataSolicitacaoRaw) // se tiver RAW
                    .ToList();

                return Json(new
                {
                    data = result
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ManutencaoController.cs" , "ListaManutencaoData" , error);
                return View(); // padronizado
            }
        }

        [Route("ListaManutencaoIntervalo")]
        [HttpGet]
        public IActionResult ListaManutencaoIntervalo(string mes = null , string ano = null)
        {
            try
            {
                int m = int.Parse(mes);
                int a = int.Parse(ano);

                var result = _unitOfWork
                    .ViewManutencao.GetAllReducedIQueryable(
                        selector: vm => new
                        {
                            vm.ManutencaoId ,
                            vm.NumOS ,
                            vm.DescricaoVeiculo ,
                            vm.DataSolicitacao ,
                            vm.DataEntrega ,
                            vm.DataRecolhimento ,
                            vm.DataDisponibilidade ,
                            vm.DataDevolucao ,
                            vm.ResumoOS ,
                            vm.StatusOS ,
                            vm.Habilitado , // já vem da view
                            vm.Tooltip , // já vem da view
                            vm.Icon , // já vem da view
                            Dias = vm.Dias ?? 0 , // já vem da view
                            vm.Reserva ,
                            DataSolicitacaoRaw = vm.DataSolicitacaoRaw , // <-- Adiciona este campo ao anonymous type
                        } ,
                        filter: vm =>
                            vm.DataDevolucaoRaw.Value.Month == m && vm.DataDevolucaoRaw.Value.Year == a ,
                        asNoTracking: true
                    )
                    .OrderByDescending(vm => vm.DataSolicitacaoRaw) // agora o campo existe no anonymous type
                    .ToList();

                return Json(new
                {
                    data = result
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ManutencaoController.cs" , "ListaManutencaoIntervalo" , error);
                return View(); // padronizado
            }
        }

        [Route("ListaManutencaoStatus")]
        [HttpGet]
        public IActionResult ListaManutencaoStatus(string Id = null)
        {
            try
            {
                var query = _unitOfWork
                    .ViewManutencao.GetAllReducedIQueryable(
                        selector: vm => new
                        {
                            vm.ManutencaoId ,
                            vm.NumOS ,
                            vm.DescricaoVeiculo ,
                            vm.DataSolicitacao ,
                            vm.DataEntrega ,
                            vm.DataRecolhimento ,
                            vm.DataDisponibilidade ,
                            vm.DataDevolucao ,
                            vm.ResumoOS ,
                            vm.StatusOS ,
                            vm.Habilitado ,
                            vm.Tooltip ,
                            vm.Icon ,
                            Dias = vm.Dias ?? 0 ,
                            vm.Reserva ,
                        } ,
                        filter: Id == "Todas"
                            ? (Expression<Func<ViewManutencao , bool>>)null
                            : (vm => vm.StatusOS == Id) ,
                        asNoTracking: true
                    )
                    .OrderByDescending(vm => vm.DataSolicitacao);

                var result = query.ToList();
                return Json(new
                {
                    data = result
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ManutencaoController.cs" , "ListaManutencaoStatus" , error);
                return View(); // padronizado
            }
        }

        [Route("ListaManutencaoVeiculo")]
        [HttpGet]
        public IActionResult ListaManutencaoVeiculo(Guid Id)
        {
            try
            {
                var result = _unitOfWork
                    .ViewManutencao.GetAllReducedIQueryable(
                        selector: vm => new
                        {
                            vm.ManutencaoId ,
                            vm.NumOS ,
                            vm.DescricaoVeiculo ,
                            vm.DataSolicitacao ,
                            vm.DataEntrega ,
                            vm.DataRecolhimento ,
                            vm.DataDisponibilidade ,
                            vm.DataDevolucao ,
                            vm.ResumoOS ,
                            vm.StatusOS ,
                            vm.Habilitado ,
                            vm.Tooltip ,
                            vm.Icon ,
                            Dias = vm.Dias ?? 0 ,
                            vm.Reserva ,
                        } ,
                        filter: vm => vm.VeiculoId == Id ,
                        asNoTracking: true
                    )
                    .ToList();

                return Json(new
                {
                    data = result
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ManutencaoController.cs" , "ListaManutencaoVeiculo" , error);
                return View(); // padronizado
            }
        }

        [Route("OcorrenciasVeiculosManutencao")]
        [HttpGet]
        public IActionResult OcorrenciasVeiculosManutencao(Guid Id)
        {
            try
            {
                // Usa ViewOcorrenciasViagem (baseada em OcorrenciaViagem) com todos os campos
                var result = _unitOfWork
                    .ViewOcorrenciasViagem.GetAll(o => 
                        o.VeiculoId == Id
                        && (o.Status == "Aberta" || string.IsNullOrEmpty(o.Status))
                        && o.ItemManutencaoId == null // Não vinculada a nenhuma OS
                    )
                    .OrderByDescending(o => o.NoFichaVistoria)
                    .ThenByDescending(o => o.DataCriacao)
                    .Select(o => new
                    {
                        viagemId = o.ViagemId,
                        noFichaVistoria = o.NoFichaVistoria,
                        dataInicial = o.DataInicial.HasValue ? o.DataInicial.Value.ToString("dd/MM/yyyy") : o.DataCriacao.ToString("dd/MM/yyyy"),
                        nomeMotorista = o.NomeMotorista ?? "",
                        resumoOcorrencia = o.Resumo ?? "sem novas avarias",
                        descricaoOcorrencia = !string.IsNullOrEmpty(o.Descricao) 
                            ? Servicos.ConvertHtml(o.Descricao) 
                            : "Descrição não Informada",
                        statusOcorrencia = o.Status ?? "Aberta",
                        motoristaId = o.MotoristaId,
                        imagemOcorrencia = o.ImagemOcorrencia ?? "",
                        itemManutencaoId = o.ItemManutencaoId,
                        ocorrenciaViagemId = o.OcorrenciaViagemId
                    })
                    .ToList();

                return Json(new
                {
                    data = result
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ManutencaoController.cs" , "OcorrenciasVeiculosManutencao" , error);
                return Json(new { data = Array.Empty<object>() }); // padronizado
            }
        }

        [Route("OcorrenciasVeiculosPendencias")]
        [HttpGet]
        public IActionResult OcorrenciasVeiculosPendencias(Guid Id)
        {
            try
            {
                var result = _unitOfWork
                    .ViewPendenciasManutencao.GetAllReducedIQueryable(
                        selector: vpm => new
                        {
                            vpm.ItemManutencaoId ,
                            vpm.ViagemId ,
                            vpm.NumFicha ,
                            vpm.DataItem ,
                            vpm.Nome ,
                            vpm.Resumo ,
                            vpm.Descricao ,
                            vpm.Status ,
                            vpm.MotoristaId ,
                            vpm.ImagemOcorrencia ,
                        } ,
                        filter: vpm => vpm.VeiculoId == Id && vpm.Status == "Pendente" ,
                        asNoTracking: true
                    )
                    .OrderByDescending(v => v.NumFicha)
                    .ThenByDescending(v => v.DataItem)
                    .ToList();

                return Json(new
                {
                    data = result
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ManutencaoController.cs" , "OcorrenciasVeiculosPendencias" , error);
                return View(); // padronizado
            }
        }

        //Recupera os nomes dos Lavadores
        //===============================
        [Route("RecuperaLavador")]
        public IActionResult RecuperaLavador()
        {
            try
            {
                var objLavador = _unitOfWork.Lavador.GetAll();

                return Json(new
                {
                    data = objLavador.ToList()
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ManutencaoController.cs" , "RecuperaLavador" , error);
                return View(); // padronizado
            }
        }

        //Recupera o nome do Usuário de Criação/Finalização
        //=================================================
        [Route("RecuperaUsuario")]
        public IActionResult RecuperaUsuario(string Id = null)
        {
            try
            {
                var objUsuario = _unitOfWork.AspNetUsers.GetFirstOrDefault(u => u.Id == Id);

                if (objUsuario == null)
                {
                    return Json(new
                    {
                        data = ""
                    });
                }
                else
                {
                    return Json(new
                    {
                        data = objUsuario.NomeCompleto
                    });
                }
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ManutencaoController.cs" , "RecuperaUsuario" , error);
                return View(); // padronizado
            }
        }

        [Route("SaveImage")]
        public void SaveImage(IList<IFormFile> UploadFiles = null)
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
                        filename =
                            _hostingEnvironment.WebRootPath
                            + "\\DadosEditaveis\\ImagensViagens"
                            + $@"\{filename}";

                        // Create a new directory, if it does not exists
                        if (
                            !Directory.Exists(
                                _hostingEnvironment.WebRootPath + "\\DadosEditaveis\\ImagensViagens"
                            )
                        )
                        {
                            Directory.CreateDirectory(
                                _hostingEnvironment.WebRootPath + "\\DadosEditaveis\\ImagensViagens"
                            );
                        }

                        if (!System.IO.File.Exists(filename))
                        {
                            using (FileStream fs = System.IO.File.Create(filename))
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
                Alerta.TratamentoErroComLinha("ManutencaoController.cs" , "SaveImage" , error);
                Response.StatusCode = 204;
            }
        }

        //Zera Itens Manutenção/OS (coloca como pendência)
        //================================================
        [Route("ZeraItensOS")]
        [HttpPost]
        public JsonResult ZeraItensOS(Models.ItensManutencao manutencao = null)
        {
            try
            {
                var objItensPendencia = _unitOfWork.ItensManutencao.GetAll(im =>
                    im.ManutencaoId == manutencao.ManutencaoId
                );

                //foreach (var item in objItensPendencia)
                //{
                //    item.Status = "Pendente";
                //    _unitOfWork.ItensManutencao.Update(item);

                //    //-------Procura Ocorrências Ligadas à Manutenção
                //    var ObjOcorrencias = _unitOfWork.Viagem.GetFirstOrDefault(v =>
                //        v.ItemManutencaoId == item.ItemManutencaoId
                //    );
                //    if (ObjOcorrencias != null)
                //    {
                //        ObjOcorrencias.StatusOcorrencia = "Pendente";
                //        ObjOcorrencias.DescricaoSolucaoOcorrencia = "";
                //        _unitOfWork.Viagem.Update(ObjOcorrencias);
                //    }
                //}

                _unitOfWork.Save();

                return new JsonResult(
                    new
                    {
                        data = manutencao.ManutencaoId ,
                        message = "OS Baixada com Sucesso!"
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ManutencaoController.cs" , "ZeraItensOS" , error);
                return new JsonResult(new
                {
                    sucesso = false
                }); // padronizado
            }
        }

        private static Expression<Func<ViewManutencao , bool>> manutencoesFilters(
            string StatusOS = null
        )
        {
            return mf => (mf.StatusOS == "Aberta");
        }
    }

    /// <summary>
    /// DTO para deserializar os itens removidos do JSON enviado pelo ListaManutencao.js
    /// </summary>
    public class ItemRemovidoDTO
    {
        public string itemManutencaoId { get; set; }
        public string viagemId { get; set; }
        public string tipoItem { get; set; }
        public string numFicha { get; set; }
    }
}
