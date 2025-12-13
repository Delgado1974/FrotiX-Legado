using AspNetCoreHero.ToastNotification.Abstractions;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using FrotiX.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using System;

namespace FrotiX.Pages.MovimentacaoPatrimonio
{
    public class UpsertModel :PageModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<IndexModel> _logger;
        private readonly IWebHostEnvironment _hostingEnvironment;
        private readonly INotyfService _notyf;

        public UpsertModel(
            IUnitOfWork unitOfWork ,
            ILogger<IndexModel> logger ,
            IWebHostEnvironment hostingEnvironment ,
            INotyfService notyf
        )
        {
            try
            {
                _unitOfWork = unitOfWork;
                _logger = logger;
                _hostingEnvironment = hostingEnvironment;
                _notyf = notyf;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs" , "UpsertModel" , error);
            }
        }

        [BindProperty]
        public MovimentacaoPatrimonioViewModel MovimentacaoPatrimonioObj
        {
            get; set;
        }

        public IActionResult OnGet(Guid? id , Guid? patrimonioId)
        {
            try
            {
                // Inicializar o ViewModel
                MovimentacaoPatrimonioObj = new MovimentacaoPatrimonioViewModel
                {
                    MovimentacaoPatrimonio = new Models.MovimentacaoPatrimonio() ,
                    MovimentacaoPatrimonioId = id ?? Guid.Empty ,
                    PatrimonioId = patrimonioId ,
                };

                // Se for edição, carregar dados básicos para inicialização
                if (id.HasValue && id != Guid.Empty)
                {
                    var movimentacao = _unitOfWork.MovimentacaoPatrimonio.GetFirstOrDefault(m =>
                        m.MovimentacaoPatrimonioId == id
                    );

                    if (movimentacao != null)
                    {
                        MovimentacaoPatrimonioObj.MovimentacaoPatrimonio = movimentacao;
                        MovimentacaoPatrimonioObj.MovimentacaoPatrimonioId =
                            movimentacao.MovimentacaoPatrimonioId;
                        MovimentacaoPatrimonioObj.PatrimonioId = movimentacao.PatrimonioId;

                        // Buscar nomes para exibição inicial (opcional)
                        var patrimonio = _unitOfWork.Patrimonio.GetFirstOrDefault(p =>
                            p.PatrimonioId == movimentacao.PatrimonioId
                        );

                        if (patrimonio != null)
                        {
                            MovimentacaoPatrimonioObj.PatrimonioNome = patrimonio.NPR;
                        }

                        var setorOrigem = _unitOfWork.SetorPatrimonial.GetFirstOrDefault(s =>
                            s.SetorId == movimentacao.SetorOrigemId
                        );

                        var secaoOrigem = _unitOfWork.SecaoPatrimonial.GetFirstOrDefault(s =>
                            s.SecaoId == movimentacao.SecaoOrigemId
                        );

                        MovimentacaoPatrimonioObj.SetorOrigemNome = setorOrigem?.NomeSetor;
                        MovimentacaoPatrimonioObj.SecaoOrigemNome = secaoOrigem?.NomeSecao;
                    }
                    else
                    {
                        AppToast.show("Vermelho" , "Movimentação não encontrada" , 3000);
                        return RedirectToPage("./Index");
                    }
                }

                return Page();
            }
            catch (Exception error)
            {
                _logger.LogError(error , "Erro em OnGet");
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs" , "OnGet" , error);
                AppToast.show("Vermelho" , "Erro ao carregar página" , 3000);
                return RedirectToPage("./Index");
            }
        }

        // Os métodos POST não são mais necessários pois tudo será via AJAX
        // Mantendo apenas para compatibilidade se houver alguma referência
        public IActionResult OnPost()
        {
            try
            {
                // Redirecionar para o Index caso alguém faça um POST direto
                return RedirectToPage("./Index");
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs" , "OnPost" , error);
                return RedirectToPage("./Index");
            }
        }
    }
}
