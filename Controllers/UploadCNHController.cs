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
    public partial class UploadCNHController :Controller
    {
        private IWebHostEnvironment hostingEnv;
        private readonly IUnitOfWork _unitOfWork;

        public UploadCNHController(IWebHostEnvironment env , IUnitOfWork unitOfWork)
        {
            try
            {
                this.hostingEnv = env;
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("UploadCNHController.cs" , "UploadCNHController" , error);
            }
        }

        [AcceptVerbs("Post")]
        [HttpPost]
        [Route("Save")]
        public IActionResult Save(IList<IFormFile> UploadFiles , [FromQuery] Guid motoristaId)
        {
            try
            {
                if (UploadFiles != null && motoristaId != Guid.Empty)
                {
                    foreach (var file in UploadFiles)
                    {
                        var objFromDb = _unitOfWork.Motorista.GetFirstOrDefault(u =>
                            u.MotoristaId == motoristaId
                        );

                        if (objFromDb != null)
                        {
                            using (var target = new MemoryStream())
                            {
                                file.CopyTo(target);
                                objFromDb.CNHDigital = target.ToArray();
                            }
                            _unitOfWork.Motorista.Update(objFromDb);
                            _unitOfWork.Save();
                        }
                    }
                }
                return Content("");
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("UploadCNHController.cs" , "Save" , error);
                Response.StatusCode = 500;
                return Content("");
            }
        }

        [AcceptVerbs("Post")]
        [HttpPost]
        [Route("Remove")]
        public IActionResult Remove(IList<IFormFile> UploadFiles , [FromQuery] Guid motoristaId)
        {
            try
            {
                if (motoristaId != Guid.Empty)
                {
                    var objFromDb = _unitOfWork.Motorista.GetFirstOrDefault(u =>
                        u.MotoristaId == motoristaId
                    );

                    if (objFromDb != null)
                    {
                        objFromDb.CNHDigital = null;
                        _unitOfWork.Motorista.Update(objFromDb);
                        _unitOfWork.Save();
                    }
                }
                return Content("");
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("UploadCNHController.cs" , "Remove" , error);
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
                Alerta.TratamentoErroComLinha("UploadCNHController.cs" , "UploadFeatures" , error);
                return View();
            }
        }
    }
}
