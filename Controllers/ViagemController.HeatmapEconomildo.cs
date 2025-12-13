using FrotiX.Models;
using FrotiX.Repository.IRepository;
using FrotiX.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;

namespace FrotiX.Controllers
{
    public partial class ViagemController : Controller
    {
        #region Heatmap Economildo

        /// <summary>
        /// Retorna matriz 7x24 com quantidade de viagens Economildo por dia da semana e hora
        /// </summary>
        [HttpGet]
        [Route("HeatmapEconomildo")]
        public IActionResult HeatmapEconomildo(string? mob , string? mes , string? ano)
        {
            try
            {
                // Usar ViewFluxoEconomildo que já tem os dados necessários
                var viagens = _unitOfWork.ViewFluxoEconomildo.GetAll();

                // Filtro por MOB
                if (!string.IsNullOrEmpty(mob))
                {
                    viagens = viagens.Where(v => v.MOB == mob);
                }

                // Filtro por mês
                if (!string.IsNullOrEmpty(mes) && int.TryParse(mes , out int mesInt))
                {
                    viagens = viagens.Where(v => v.Data.HasValue && v.Data.Value.Month == mesInt);
                }

                // Filtro por ano
                if (!string.IsNullOrEmpty(ano) && int.TryParse(ano , out int anoInt))
                {
                    viagens = viagens.Where(v => v.Data.HasValue && v.Data.Value.Year == anoInt);
                }

                // Materializar a query
                var listaViagens = viagens.ToList();

                // Criar matriz 7x24 (dias x horas)
                var heatmap = new int[7 , 24];
                int maxValor = 0;

                foreach (var v in listaViagens)
                {
                    if (!v.Data.HasValue || string.IsNullOrEmpty(v.HoraInicio))
                        continue;

                    // Converter DayOfWeek para índice (0=Segunda, 6=Domingo)
                    int diaSemana = (int)v.Data.Value.DayOfWeek;
                    int diaIndex = diaSemana == 0 ? 6 : diaSemana - 1; // Sunday(0) vai para 6

                    // Extrair hora do campo HoraInicio (formato esperado: "HH:mm" ou "HH:mm:ss")
                    int horaIndex = 0;
                    if (TimeSpan.TryParse(v.HoraInicio , out TimeSpan horaTimeSpan))
                    {
                        horaIndex = Math.Clamp(horaTimeSpan.Hours , 0 , 23);
                    }
                    else if (v.HoraInicio.Length >= 2 && int.TryParse(v.HoraInicio.Substring(0 , 2) , out int horaInt))
                    {
                        horaIndex = Math.Clamp(horaInt , 0 , 23);
                    }

                    heatmap[diaIndex , horaIndex]++;

                    if (heatmap[diaIndex , horaIndex] > maxValor)
                        maxValor = heatmap[diaIndex , horaIndex];
                }

                // Converter para lista de objetos para JSON
                var dados = new List<object>();
                var diasNomes = new[] { "Segunda" , "Terça" , "Quarta" , "Quinta" , "Sexta" , "Sábado" , "Domingo" };

                for (int dia = 0 ; dia < 7 ; dia++)
                {
                    var horasArray = new int[24];
                    for (int hora = 0 ; hora < 24 ; hora++)
                    {
                        horasArray[hora] = heatmap[dia , hora];
                    }

                    dados.Add(new
                    {
                        diaSemana = diasNomes[dia] ,
                        diaIndex = dia ,
                        horas = horasArray
                    });
                }

                return Json(new
                {
                    success = true ,
                    data = dados ,
                    maxValor = maxValor ,
                    totalViagens = listaViagens.Count
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ViagemController.cs" , "HeatmapEconomildo" , error);
                return Json(new { success = false , message = error.Message });
            }
        }

        #endregion Heatmap Economildo
    }
}
