using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System;

namespace FrotiX.Pages.Motorista
{
    public class UploadCNHModel :PageModel
    {
        public int CNHDigital
        {
            get; set;
        }

        private readonly IUnitOfWork _unitOfWork;

        public UploadCNHModel(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("UploadCNH.cshtml.cs" , "UploadCNHModel" , error);
            }
        }

        [BindProperty]
        public MotoristaViewModel MotoristaObj
        {
            get; set;
        }

        private void SetViewModel()
        {
            try
            {
                MotoristaObj = new MotoristaViewModel
                {
                    Motorista = new Models.Motorista()
                };
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("UploadCNH.cshtml.cs" , "SetViewModel" , error);
            }
        }

        public ActionResult OnGet(Guid id)
        {
            try
            {
                SetViewModel();
                CNHDigital = 0;

                if (id != Guid.Empty)
                {
                    MotoristaObj.Motorista = _unitOfWork.Motorista.GetFirstOrDefault(u =>
                        u.MotoristaId == id
                    );

                    if (MotoristaObj?.Motorista == null)
                    {
                        return NotFound();
                    }

                    if (MotoristaObj.Motorista.CNHDigital != null)
                    {
                        CNHDigital = 1;
                    }
                }

                return Page();
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("UploadCNH.cshtml.cs" , "OnGet" , error);
                return Page();
            }
        }
    }
}
