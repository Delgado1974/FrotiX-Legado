using FrotiX.Data;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using FrotiX.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace FrotiX.Controllers
{
    /// <summary>
    /// Classe parcial do ViagemController contendo métodos para geração de estatísticas de viagens
    /// </summary>
    public partial class ViagemController
    {
        // ========================================
        // MÉTODOS PARA GERAÇÃO DE ESTATÍSTICAS DE VIAGENS
        // ========================================

        /// <summary>
        /// Classe auxiliar para controlar o progresso da geração de estatísticas
        /// </summary>
        public class ProgressoEstatisticas
        {
            public int Total { get; set; }
            public int Processado { get; set; }
            public int Percentual { get; set; }
            public bool Concluido { get; set; }
            public bool Erro { get; set; }
            public string Mensagem { get; set; }
            public DateTime IniciadoEm { get; set; }
        }

        [Route("GerarEstatisticasViagens")]
        [HttpPost]
        public IActionResult GerarEstatisticasViagens()
        {
            try
            {
                var cacheKey = "ProgressoEstatisticas";

                // Verifica se já existe um processamento em andamento
                if (_cache.TryGetValue(cacheKey , out ProgressoEstatisticas progressoExistente))
                {
                    if (!progressoExistente.Concluido && !progressoExistente.Erro)
                    {
                        return Json(new
                        {
                            success = false ,
                            message = "Já existe um processamento em andamento. Aguarde a conclusão."
                        });
                    }
                }

                // Inicia o processamento em background
                Task.Run(async () => await ProcessarGeracaoEstatisticas());

                return Json(new
                {
                    success = true ,
                    message = "Processamento iniciado com sucesso"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ViagemController.cs" , "GerarEstatisticasViagens" , error);
                return Json(new
                {
                    success = false ,
                    message = "Erro ao iniciar geração de estatísticas"
                });
            }
        }

        private async Task ProcessarGeracaoEstatisticas()
        {
            var cacheKey = "ProgressoEstatisticas";
            var progresso = new ProgressoEstatisticas
            {
                Total = 0 ,
                Processado = 0 ,
                Percentual = 0 ,
                Concluido = false ,
                Erro = false ,
                Mensagem = "Inicializando..." ,
                IniciadoEm = DateTime.Now
            };

            try
            {
                // Armazena progresso inicial no cache (30 minutos)
                _cache.Set(cacheKey , progresso , TimeSpan.FromMinutes(30));

                // CRÍTICO: Criar um novo scope para ter um novo DbContext
                using (var scope = _serviceScopeFactory.CreateScope())
                {
                    // Resolve dependências do scope
                    var context = scope.ServiceProvider.GetRequiredService<FrotiXDbContext>();
                    var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
                    var viagemEstatisticaRepository = scope.ServiceProvider.GetRequiredService<IViagemEstatisticaRepository>();

                    // Cria novo service com as dependências do scope
                    var estatisticaService = new ViagemEstatisticaService(
                        context ,
                        viagemEstatisticaRepository ,
                        unitOfWork
                    );

                    // Busca todas as datas únicas de viagens
                    var datasUnicas = await context.Viagem
                        .Where(v => v.DataInicial.HasValue)
                        .Select(v => v.DataInicial.Value.Date)
                        .Distinct()
                        .OrderBy(d => d)
                        .ToListAsync();

                    progresso.Total = datasUnicas.Count;
                    progresso.Mensagem = $"Processando estatísticas de {progresso.Total} datas...";
                    _cache.Set(cacheKey , progresso , TimeSpan.FromMinutes(30));

                    int contador = 0;

                    foreach (var data in datasUnicas)
                    {
                        try
                        {
                            // Gera/atualiza estatísticas para a data
                            await estatisticaService.RecalcularEstatisticasAsync(data);

                            // Atualiza progresso
                            contador++;
                            progresso.Processado = contador;
                            progresso.Percentual = progresso.Total > 0
                                ? (int)((contador * 100.0) / progresso.Total)
                                : 0;
                            progresso.Mensagem = $"Processando data {contador} de {progresso.Total}... ({data:dd/MM/yyyy})";

                            _cache.Set(cacheKey , progresso , TimeSpan.FromMinutes(30));

                            // Pequeno delay a cada 10 iterações para não sobrecarregar
                            if (contador % 10 == 0)
                            {
                                await Task.Delay(50);
                            }
                        }
                        catch (Exception ex)
                        {
                            // Log do erro mas continua processando as outras datas
                            Console.WriteLine($"Erro ao processar estatísticas da data {data:dd/MM/yyyy}: {ex.Message}");
                        }
                    }

                    // Finaliza com sucesso
                    progresso.Concluido = true;
                    progresso.Percentual = 100;
                    progresso.Mensagem = $"Processamento concluído! Estatísticas de {contador} datas geradas.";
                    _cache.Set(cacheKey , progresso , TimeSpan.FromMinutes(30));
                }
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ViagemController.cs" , "ProcessarGeracaoEstatisticas" , error);

                progresso.Erro = true;
                progresso.Concluido = true;
                progresso.Mensagem = $"Erro durante o processamento: {error.Message}";
                _cache.Set(cacheKey , progresso , TimeSpan.FromMinutes(30));
            }
        }

        [Route("ObterProgressoEstatisticas")]
        [HttpGet]
        public IActionResult ObterProgressoEstatisticas()
        {
            try
            {
                var cacheKey = "ProgressoEstatisticas";

                if (_cache.TryGetValue(cacheKey , out ProgressoEstatisticas progresso))
                {
                    return Json(new
                    {
                        success = true ,
                        progresso = new
                        {
                            total = progresso.Total ,
                            processado = progresso.Processado ,
                            percentual = progresso.Percentual ,
                            concluido = progresso.Concluido ,
                            erro = progresso.Erro ,
                            mensagem = progresso.Mensagem
                        }
                    });
                }

                // Não há processamento em andamento
                return Json(new
                {
                    success = true ,
                    progresso = new
                    {
                        total = 0 ,
                        processado = 0 ,
                        percentual = 0 ,
                        concluido = false ,
                        erro = false ,
                        mensagem = "Nenhum processamento em andamento"
                    }
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ViagemController.cs" , "ObterProgressoEstatisticas" , error);
                return Json(new
                {
                    success = false ,
                    message = "Erro ao obter progresso"
                });
            }
        }

        [Route("LimparProgressoEstatisticas")]
        [HttpPost]
        public IActionResult LimparProgressoEstatisticas()
        {
            try
            {
                var cacheKey = "ProgressoEstatisticas";
                _cache.Remove(cacheKey);

                return Json(new
                {
                    success = true ,
                    message = "Progresso limpo com sucesso"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ViagemController.cs" , "LimparProgressoEstatisticas" , error);
                return Json(new
                {
                    success = false ,
                    message = "Erro ao limpar progresso"
                });
            }
        }
    }
}
