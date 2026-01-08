using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System;

namespace FrotiX.Pages.Veiculo
{
    public class UploadCRLVModel :PageModel
    {
        // Propriedade de instância (não estática)
        public int CRLV
        {
            get; set;
        }

        private readonly IUnitOfWork _unitOfWork;

        public UploadCRLVModel(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("UploadCRLV.cshtml.cs" , "UploadCRLVModel" , error);
            }
        }

        [BindProperty]
        public VeiculoViewModel VeiculoObj
        {
            get; set;
        }

        private void SetViewModel()
        {
            try
            {
                VeiculoObj = new VeiculoViewModel { Veiculo = new Models.Veiculo() };
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("UploadCRLV.cshtml.cs" , "SetViewModel" , error);
                return;
            }
        }

        public ActionResult OnGet(Guid id)
        {
            try
            {
                SetViewModel();
                CRLV = 0;

                if (id != Guid.Empty)
                {
                    VeiculoObj.Veiculo = _unitOfWork.Veiculo.GetFirstOrDefault(u => u.VeiculoId == id);

                    if (VeiculoObj?.Veiculo == null)
                    {
                        return NotFound();
                    }

                    if (VeiculoObj.Veiculo.CRLV != null)
                    {
                        CRLV = 1;
                    }
                }

                return Page();
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("UploadCRLV.cshtml.cs" , "OnGet" , error);
                return Page();
            }
        }
    }
}
