using AspNetCoreHero.ToastNotification.Abstractions;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using FrotiX.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System;

namespace FrotiX.Pages.Multa
{
    public class UpsertEmpenhosMultaModel : PageModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly INotyfService _notyf;

        public UpsertEmpenhosMultaModel(IUnitOfWork unitOfWork , INotyfService notyf)
        {
            try
            {
                _unitOfWork = unitOfWork;
                _notyf = notyf;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "UpsertEmpenhosMulta.cshtml.cs" ,
                    "UpsertEmpenhosMultaModel" ,
                    error
                );
            }
        }

        [BindProperty]
        public EmpenhoMultaViewModel EmpenhoMultaObj
        {
            get; set;
        }

        private void SetViewModel()
        {
            try
            {
                EmpenhoMultaObj = new EmpenhoMultaViewModel
                {
                    OrgaoList = _unitOfWork.OrgaoAutuante.GetOrgaoAutuanteListForDropDown() ,
                    EmpenhoMulta = new Models.EmpenhoMulta() ,
                };
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "UpsertEmpenhosMulta.cshtml.cs" ,
                    "SetViewModel" ,
                    error
                );
            }
        }

        public IActionResult OnGet(Guid id)
        {
            try
            {
                SetViewModel();

                if (id != Guid.Empty)
                {
                    EmpenhoMultaObj.EmpenhoMulta = _unitOfWork.EmpenhoMulta.GetFirstOrDefault(e =>
                        e.EmpenhoMultaId == id
                    );
                    if (EmpenhoMultaObj == null)
                    {
                        return NotFound();
                    }
                }

                return Page();
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("UpsertEmpenhosMulta.cshtml.cs" , "OnGet" , error);
                return Page();
            }
        }

        public IActionResult OnPostSubmit()
        {
            try
            {
                if (EmpenhoMultaObj.EmpenhoMulta.OrgaoAutuanteId == Guid.Empty)
                {
                    AppToast.show("Amarelo" , "Você deve informar o Órgão Autuante!" , 3000);
                    SetViewModel();
                    return Page();
                }

                if (EmpenhoMultaObj.EmpenhoMulta.NotaEmpenho == null)
                {
                    AppToast.show("Amarelo" , "Você deve informar o número da Nota de Empenho!" , 3000);
                    SetViewModel();
                    return Page();
                }

                if (EmpenhoMultaObj.EmpenhoMulta.NotaEmpenho.Length != 12)
                {
                    AppToast.show("Amarelo" , "A Nota de Empenho deve ter 12 (doze) dígitos!" , 3000);
                    SetViewModel();
                    return Page();
                }

                if (EmpenhoMultaObj.EmpenhoMulta.AnoVigencia == null)
                {
                    AppToast.show("Amarelo" , "Você deve informar o Ano de Vigência!" , 3000);
                    SetViewModel();
                    return Page();
                }

                if (EmpenhoMultaObj.EmpenhoMulta.SaldoInicial == null)
                {
                    AppToast.show("Amarelo" , "Você deve informar o Saldo Inicial!" , 3000);
                    SetViewModel();
                    return Page();
                }

                // Verifica Duplicado
                var existeEmpenho = _unitOfWork.EmpenhoMulta.GetFirstOrDefault(e =>
                    e.NotaEmpenho == EmpenhoMultaObj.EmpenhoMulta.NotaEmpenho
                );

                if (
                    EmpenhoMultaObj.EmpenhoMulta.EmpenhoMultaId != Guid.Empty
                    && existeEmpenho != null
                )
                {
                    if (EmpenhoMultaObj.EmpenhoMulta.EmpenhoMultaId != existeEmpenho.EmpenhoMultaId)
                    {
                        AppToast.show("Vermelho" , "Já existe este Empenho cadastrado!" , 3000);
                        SetViewModel();
                        return Page();
                    }
                }
                else if (existeEmpenho != null)
                {
                    AppToast.show("Vermelho" , "Já existe este Empenho cadastrado!" , 3000);
                    SetViewModel();
                    return Page();
                }

                if (EmpenhoMultaObj.EmpenhoMulta.EmpenhoMultaId == Guid.Empty)
                {
                    EmpenhoMultaObj.EmpenhoMulta.SaldoAtual = EmpenhoMultaObj
                        .EmpenhoMulta
                        .SaldoInicial;
                    _unitOfWork.EmpenhoMulta.Add(EmpenhoMultaObj.EmpenhoMulta);
                    AppToast.show("Verde" , "Nota de Empenho cadastrada com sucesso!" , 3000);
                }
                else
                {
                    _unitOfWork.EmpenhoMulta.Update(EmpenhoMultaObj.EmpenhoMulta);
                    AppToast.show("Verde" , "Nota de Empenho atualizada com sucesso!" , 3000);
                }
                _unitOfWork.Save();

                return RedirectToPage("./ListaEmpenhosMulta");
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "UpsertEmpenhosMulta.cshtml.cs" ,
                    "OnPostSubmit" ,
                    error
                );
                return RedirectToPage("./ListaEmpenhosMulta");
            }
        }
    }
}
