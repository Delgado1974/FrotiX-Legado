using FrotiX.Data;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using FrotiX.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Threading.Tasks;

namespace FrotiX.Controllers
{
    public partial class ViagemController
    {
        /// <summary>
        /// Lista todos os eventos COM o campo custoViagem calculado
        /// Rota: /api/viagem/listaeventos
        /// </summary>
        [HttpGet]
        [Route("ListaEventos")]
        public IActionResult ListaEventos()
        {
            try
            {
                // Busca todos os eventos
                var eventos = _unitOfWork.Evento.GetAll().ToList();

                // Busca custos das viagens agrupados por EventoId
                var custosPorEvento = _unitOfWork.Viagem
                    .GetAll()
                    .Where(v => v.EventoId != null && v.EventoId != Guid.Empty)
                    .ToList()
                    .GroupBy(v => v.EventoId ?? Guid.Empty)
                    .ToDictionary(
                        g => g.Key,
                        g => g.Sum(v => (v.CustoMotorista ?? 0) +
                                       (v.CustoCombustivel ?? 0) +
                                       (v.CustoLavador ?? 0))
                    );

                // Busca setores
                var setores = _unitOfWork.SetorSolicitante
                    .GetAll()
                    .ToList()
                    .ToDictionary(s => s.SetorSolicitanteId, s => new { s.Nome, s.Sigla });

                // Busca requisitantes
                var requisitantes = _unitOfWork.Requisitante
                    .GetAll()
                    .ToList()
                    .ToDictionary(r => r.RequisitanteId, r => r.Nome);

                // Monta resultado
                var resultado = eventos.Select(e =>
                {
                    // Pega nome do setor (SetorSolicitanteId é Guid, não nullable)
                    string nomeSetor = "";
                    if (e.SetorSolicitanteId != Guid.Empty && setores.TryGetValue(e.SetorSolicitanteId, out var setor))
                    {
                        nomeSetor = !string.IsNullOrEmpty(setor.Sigla)
                            ? $"{setor.Nome} ({setor.Sigla})"
                            : setor.Nome ?? "";
                    }

                    // Pega nome do requisitante (RequisitanteId é Guid, não nullable)
                    string nomeRequisitante = "";
                    if (e.RequisitanteId != Guid.Empty && requisitantes.TryGetValue(e.RequisitanteId, out var reqNome))
                    {
                        nomeRequisitante = reqNome ?? "";
                    }

                    // Pega custo calculado
                    double custoViagem = 0;
                    if (custosPorEvento.TryGetValue(e.EventoId, out var custo))
                    {
                        custoViagem = custo;
                    }

                    return new
                    {
                        eventoId = e.EventoId,
                        nome = e.Nome ?? "",
                        descricao = e.Descricao ?? "",
                        dataInicial = e.DataInicial,
                        dataFinal = e.DataFinal,
                        qtdParticipantes = e.QtdParticipantes ?? 0,
                        status = e.Status == "1" ? 1 : 0,
                        nomeSetor = nomeSetor,
                        nomeRequisitante = nomeRequisitante,
                        nomeRequisitanteHTML = nomeRequisitante,
                        custoViagem = custoViagem
                    };
                }).ToList();

                return Json(new { data = resultado });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ViagemController.cs", "ListaEventos", error);
                return Json(new
                {
                    success = false,
                    message = $"Erro ao listar eventos: {error.Message}",
                    data = new List<object>()
                });
            }
        }
    }
}
