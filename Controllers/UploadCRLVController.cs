using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.IO;

namespace FrotiX.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [IgnoreAntiforgeryToken]
    public partial class UploadCRLVController :Controller
    {
        private IWebHostEnvironment hostingEnv;
        private readonly IUnitOfWork _unitOfWork;

        public UploadCRLVController(IWebHostEnvironment env , IUnitOfWork unitOfWork)
        {
            try
            {
                this.hostingEnv = env;
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("UploadCRLVController.cs" , "UploadCRLVController" , error);
            }
        }

        [AcceptVerbs("Post")]
        [HttpPost]
        [Route("Save")]
        public IActionResult Save(IList<IFormFile> UploadFiles , [FromQuery] Guid veiculoId)
        {
            try
            {
                if (UploadFiles != null && veiculoId != Guid.Empty)
                {
                    foreach (var file in UploadFiles)
                    {
                        var objFromDb = _unitOfWork.Veiculo.GetFirstOrDefault(u =>
                            u.VeiculoId == veiculoId
                        );

                        if (objFromDb != null)
                        {
                            using (var target = new MemoryStream())
                            {
                                file.CopyTo(target);
                                objFromDb.CRLV = target.ToArray();
                            }
                            _unitOfWork.Veiculo.Update(objFromDb);
                            _unitOfWork.Save();
                        }
                    }
                }
                return Content("");
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("UploadCRLVController.cs" , "Save" , error);
                Response.StatusCode = 500;
                return Content("");
            }
        }

        [AcceptVerbs("Post")]
        [HttpPost]
        [Route("Remove")]
        public IActionResult Remove(IList<IFormFile> UploadFiles , [FromQuery] Guid veiculoId)
        {
            try
            {
                if (veiculoId != Guid.Empty)
                {
                    var objFromDb = _unitOfWork.Veiculo.GetFirstOrDefault(u =>
                        u.VeiculoId == veiculoId
                    );

                    if (objFromDb != null)
                    {
                        objFromDb.CRLV = null;
                        _unitOfWork.Veiculo.Update(objFromDb);
                        _unitOfWork.Save();
                    }
                }
                return Content("");
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("UploadCRLVController.cs" , "Remove" , error);
                Response.Clear();
                Response.StatusCode = 500;
                Response.HttpContext.Features.Get<IHttpResponseFeature>().ReasonPhrase = error.Message;
                return Content("");
            }
        }

        [AcceptVerbs("Post")]
        [HttpPost]
        [Route("UploadFeatures")]
        public ActionResult UploadFeatures()
        {
            try
            {
                return View();
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("UploadCRLVController.cs" , "UploadFeatures" , error);
                return View();
            }
        }
    }
}
