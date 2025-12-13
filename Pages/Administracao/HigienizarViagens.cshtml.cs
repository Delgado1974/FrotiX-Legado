using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FrotiX.Pages.Administracao
{
    public class HigienizarViagensModel :PageModel
    {
        private readonly IViagemRepository _viagemRepo;

        public HigienizarViagensModel(IViagemRepository viagemRepo)
        {
            try
            {
                _viagemRepo = viagemRepo;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("HigienizarViagens.cshtml.cs" , "HigienizarViagensModel" , error);
            }
        }

        [BindProperty]
        public List<string> OrigensDistintas
        {
            get; set;
        }

        [BindProperty]
        public List<string> OrigensParaCorrigir { get; set; } = new();

        [BindProperty]
        public List<string> OrigemSelecionada
        {
            get; set;
        }

        [BindProperty]
        public List<string> OrigemParaCorrigirSelecionada
        {
            get; set;
        }

        [BindProperty]
        public string NovaOrigem
        {
            get; set;
        }

        [BindProperty]
        public List<string> DestinosDistintos
        {
            get; set;
        }

        [BindProperty]
        public List<string> DestinosParaCorrigir { get; set; } = new();

        [BindProperty]
        public List<string> DestinoSelecionada
        {
            get; set;
        }

        [BindProperty]
        public List<string> DestinoParaCorrigirSelecionada
        {
            get; set;
        }

        [BindProperty]
        public string NovoDestino
        {
            get; set;
        }

        private async Task LoadDistinctAsync()
        {
            try
            {
                OrigensDistintas = await _viagemRepo.GetDistinctOrigensAsync();
                DestinosDistintos = await _viagemRepo.GetDistinctDestinosAsync();
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("HigienizarViagens.cshtml.cs" , "LoadDistinctAsync" , error);
                OrigensDistintas = new List<string>();
                DestinosDistintos = new List<string>();
            }
        }

        public async Task OnGetAsync()
        {
            try
            {
                await LoadDistinctAsync();
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("HigienizarViagens.cshtml.cs" , "OnGetAsync" , error);
            }
        }

        public async Task<IActionResult> OnPostApplyOrigemAsync()
        {
            try
            {
                await LoadDistinctAsync();
                if (!string.IsNullOrWhiteSpace(NovaOrigem) && OrigensParaCorrigir.Any())
                {
                    await _viagemRepo.CorrigirOrigemAsync(OrigensParaCorrigir , NovaOrigem);
                    OrigensParaCorrigir.Clear();
                    NovaOrigem = string.Empty;
                    await LoadDistinctAsync();
                }
                return Page();
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("HigienizarViagens.cshtml.cs" , "OnPostApplyOrigemAsync" , error);
                return Page();
            }
        }

        public async Task<IActionResult> OnPostMoveDestinoAsync()
        {
            try
            {
                await LoadDistinctAsync();
                if (DestinoSelecionada != null)
                {
                    foreach (var item in DestinoSelecionada)
                    {
                        DestinosParaCorrigir.Add(item);
                        DestinosDistintos.Remove(item);
                    }
                }
                return Page();
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("HigienizarViagens.cshtml.cs" , "OnPostMoveDestinoAsync" , error);
                return Page();
            }
        }

        public async Task<IActionResult> OnPostRemoveDestinoAsync()
        {
            try
            {
                await LoadDistinctAsync();
                if (DestinoParaCorrigirSelecionada != null)
                {
                    foreach (var item in DestinoParaCorrigirSelecionada)
                    {
                        DestinosDistintos.Add(item);
                        DestinosParaCorrigir.Remove(item);
                    }
                }
                return Page();
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("HigienizarViagens.cshtml.cs" , "OnPostRemoveDestinoAsync" , error);
                return Page();
            }
        }

        public async Task<IActionResult> OnPostApplyDestinoAsync()
        {
            try
            {
                await LoadDistinctAsync();
                if (!string.IsNullOrWhiteSpace(NovoDestino) && DestinosParaCorrigir.Any())
                {
                    await _viagemRepo.CorrigirDestinoAsync(DestinosParaCorrigir , NovoDestino);
                    DestinosParaCorrigir.Clear();
                    NovoDestino = string.Empty;
                    await LoadDistinctAsync();
                }
                return Page();
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("HigienizarViagens.cshtml.cs" , "OnPostApplyDestinoAsync" , error);
                return Page();
            }
        }
    }
}
