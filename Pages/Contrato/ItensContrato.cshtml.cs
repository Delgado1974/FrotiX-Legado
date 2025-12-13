using AspNetCoreHero.ToastNotification.Abstractions;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace FrotiX.Pages.Contrato
{
    public class ItensContratoModel :PageModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly INotyfService _notyf;

        public ItensContratoModel(IUnitOfWork unitOfWork , INotyfService notyf)
        {
            try
            {
                _unitOfWork = unitOfWork;
                _notyf = notyf;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "ItensContrato.cshtml.cs" ,
                    "ItensContratoModel" ,
                    error
                );
            }
        }

        [BindProperty]
        public ItensContratoViewModel ItensContratoObj { get; set; } = default!;

        public async Task OnGetAsync(string? tipoContrato = "")
        {
            try
            {
                ItensContratoObj = new ItensContratoViewModel
                {
                    ContratoList = await _unitOfWork
                        .Contrato.GetDropDown(tipoContrato)
                        .ToListAsync() ,
                    ItensContrato = new Models.ItensContrato() ,
                };
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ItensContrato.cshtml.cs" , "OnGetAsync" , error);
                return;
            }
        }
    }
}
