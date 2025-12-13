using AspNetCoreHero.ToastNotification.Abstractions;
using FrotiX.Infrastructure;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MotoristaData = FrotiX.Models.DTO.MotoristaData;
using VeiculoData = FrotiX.Models.DTO.VeiculoData;
using VeiculoReservaData = FrotiX.Models.DTO.VeiculoReservaData;

namespace FrotiX.Pages.Manutencao
{
    [Consumes("application/json")]
    [IgnoreAntiforgeryToken]
    public class UpsertModel :PageModel
    {
        public static Guid ManutencaoId;

        private readonly IWebHostEnvironment _hostingEnvironment;
        private readonly ILogger<IndexModel> _logger;
        private readonly INotyfService _notyf;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMemoryCache _cache;

        public UpsertModel(
            IUnitOfWork unitOfWork ,
            ILogger<IndexModel> logger ,
            IWebHostEnvironment hostingEnvironment ,
            INotyfService notyf ,
            IMemoryCache cache
        )
        {
            try
            {
                _unitOfWork = unitOfWork;
                _logger = logger;
                _hostingEnvironment = hostingEnvironment;
                _notyf = notyf;
                _cache = cache;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs" , "UpsertModel" , error);
            }
        }

        [BindProperty]
        public ManutencaoViewModel ManutencaoObj
        {
            get; set;
        }

        private void PreencheListaMotoristasFromCache()
        {
            try
            {
                var ds = _cache.Get<List<MotoristaData>>(CacheKeys.Motoristas) ?? new List<MotoristaData>();
                ViewData["dataMotorista"] = ds;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs" , "PreencheListaMotoristasFromCache" , error);
                return;
            }
        }

        private void PreencheListaVeiculosFromCache()
        {
            try
            {
                var ds = _cache.Get<List<VeiculoData>>(CacheKeys.Veiculos) ?? new List<VeiculoData>();
                ViewData["dataVeiculo"] = ds;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs" , "PreencheListaVeiculosFromCache" , error);
                return;
            }
        }

        private void PreencheListaVeiculosReservaFromCache()
        {
            try
            {
                var cachedData = _cache.Get(CacheKeys.VeiculosReserva);
                List<VeiculoReservaData> ds;
                if (cachedData is List<VeiculoReservaData> reservaData)
                {
                    ds = reservaData;
                }
                else if (cachedData is List<VeiculoData> veiculoData)
                {
                    ds = veiculoData
                        .Select(v => new VeiculoReservaData(
                            v.VeiculoId ,
                            v.Descricao
                        ))
                        .ToList();
                }
                else
                {
                    ds = new List<VeiculoReservaData>();
                }
                ViewData["dataVeiculoReserva"] = ds;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs" , "PreencheListaVeiculosReservaFromCache" , error);
                ViewData["dataVeiculoReserva"] = new List<VeiculoReservaData>();
            }
        }

        private void SetViewModel()
        {
            try
            {
                ManutencaoObj = new ManutencaoViewModel { Manutencao = new Models.Manutencao() };
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs" , "SetViewModel" , error);
                return;
            }
        }

        public async Task<IActionResult> OnGetAsync(Guid id)
        {
            try
            {
                SetViewModel();

                if (id != Guid.Empty)
                {
                    ManutencaoObj.Manutencao = _unitOfWork.Manutencao.GetFirstOrDefault(u => u.ManutencaoId == id);
                    if (ManutencaoObj?.Manutencao == null)
                        return NotFound();
                }

                PreencheListaMotoristasFromCache();
                PreencheListaVeiculosFromCache();
                PreencheListaVeiculosReservaFromCache();

                return Page();
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs" , "OnGetAsync" , error);
                return Page();
            }
        }
    }
}
