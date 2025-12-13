using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Newtonsoft.Json;
using Syncfusion.EJ2.PdfViewer;
using System;
using System.Collections.Generic;
using System.IO;

namespace FrotiX.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [IgnoreAntiforgeryToken]
    public class PdfViewerCNHController :Controller
    {
        private readonly IMemoryCache _cache;
        private readonly IWebHostEnvironment _hostingEnvironment;
        private readonly IUnitOfWork _unitOfWork;

        public PdfViewerCNHController(
            IWebHostEnvironment hostingEnvironment ,
            IMemoryCache cache ,
            IUnitOfWork unitOfWork
        )
        {
            try
            {
                _hostingEnvironment = hostingEnvironment;
                _cache = cache;
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("PdfViewerCNHController.cs" , "PdfViewerCNHController" , error);
            }
        }

        public IActionResult PdfViewerFeatures()
        {
            try
            {
                return View();
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("PdfViewerCNHController.cs" , "PdfViewerFeatures" , error);
                return View();
            }
        }

        [HttpPost]
        [Route("Load")]
        public IActionResult Load([FromBody] Dictionary<string , string> jsonObject)
        {
            try
            {
                PdfRenderer pdfviewer = new PdfRenderer(_cache);
                MemoryStream stream = new MemoryStream();
                object jsonResult = new object();

                if (jsonObject != null && jsonObject.ContainsKey("document"))
                {
                    if (bool.Parse(jsonObject["isFileName"]))
                    {
                        string documentPath = GetDocumentPath(jsonObject["document"]);
                        if (!string.IsNullOrEmpty(documentPath))
                        {
                            byte[] bytes = System.IO.File.ReadAllBytes(documentPath);
                            stream = new MemoryStream(bytes);
                        }
                        else
                        {
                            return Content(jsonObject["document"] + " não encontrado");
                        }
                    }
                    else
                    {
                        byte[] bytes = Convert.FromBase64String(jsonObject["document"]);
                        stream = new MemoryStream(bytes);
                    }
                }

                jsonResult = pdfviewer.Load(stream , jsonObject);
                return Content(JsonConvert.SerializeObject(jsonResult));
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("PdfViewerCNHController.cs" , "Load" , error);
                return Content(JsonConvert.SerializeObject(new
                {
                    error = error.Message
                }));
            }
        }

        [HttpPost]
        [Route("RenderPdfPages")]
        public IActionResult RenderPdfPages([FromBody] Dictionary<string , string> jsonObject)
        {
            try
            {
                PdfRenderer pdfviewer = new PdfRenderer(_cache);
                object jsonResult = pdfviewer.GetPage(jsonObject);
                return Content(JsonConvert.SerializeObject(jsonResult));
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("PdfViewerCNHController.cs" , "RenderPdfPages" , error);
                return Content(JsonConvert.SerializeObject(new
                {
                    error = error.Message
                }));
            }
        }

        [HttpPost]
        [Route("RenderAnnotationComments")]
        public IActionResult RenderAnnotationComments([FromBody] Dictionary<string , string> jsonObject)
        {
            try
            {
                PdfRenderer pdfviewer = new PdfRenderer(_cache);
                object jsonResult = pdfviewer.GetAnnotationComments(jsonObject);
                return Content(JsonConvert.SerializeObject(jsonResult));
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("PdfViewerCNHController.cs" , "RenderAnnotationComments" , error);
                return Content(JsonConvert.SerializeObject(new
                {
                    error = error.Message
                }));
            }
        }

        [HttpPost]
        [Route("Unload")]
        public IActionResult Unload([FromBody] Dictionary<string , string> jsonObject)
        {
            try
            {
                PdfRenderer pdfviewer = new PdfRenderer(_cache);
                pdfviewer.ClearCache(jsonObject);
                return Content("Document cache is cleared");
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("PdfViewerCNHController.cs" , "Unload" , error);
                return Content("Erro ao limpar cache");
            }
        }

        [HttpPost]
        [Route("RenderThumbnailImages")]
        public IActionResult RenderThumbnailImages([FromBody] Dictionary<string , string> jsonObject)
        {
            try
            {
                PdfRenderer pdfviewer = new PdfRenderer(_cache);
                object result = pdfviewer.GetThumbnailImages(jsonObject);
                return Content(JsonConvert.SerializeObject(result));
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("PdfViewerCNHController.cs" , "RenderThumbnailImages" , error);
                return Content(JsonConvert.SerializeObject(new
                {
                    error = error.Message
                }));
            }
        }

        [HttpPost]
        [Route("Bookmarks")]
        public IActionResult Bookmarks([FromBody] Dictionary<string , string> jsonObject)
        {
            try
            {
                PdfRenderer pdfviewer = new PdfRenderer(_cache);
                object jsonResult = pdfviewer.GetBookmarks(jsonObject);
                return Content(JsonConvert.SerializeObject(jsonResult));
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("PdfViewerCNHController.cs" , "Bookmarks" , error);
                return Content(JsonConvert.SerializeObject(new
                {
                    error = error.Message
                }));
            }
        }

        [HttpPost]
        [Route("Download")]
        public IActionResult Download([FromBody] Dictionary<string , string> jsonObject)
        {
            try
            {
                PdfRenderer pdfviewer = new PdfRenderer(_cache);
                string documentBase = pdfviewer.GetDocumentAsBase64(jsonObject);
                return Content(documentBase);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("PdfViewerCNHController.cs" , "Download" , error);
                return Content(string.Empty);
            }
        }

        [HttpPost]
        [Route("PrintImages")]
        public IActionResult PrintImages([FromBody] Dictionary<string , string> jsonObject)
        {
            try
            {
                PdfRenderer pdfviewer = new PdfRenderer(_cache);
                object pageImage = pdfviewer.GetPrintImage(jsonObject);
                return Content(JsonConvert.SerializeObject(pageImage));
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("PdfViewerCNHController.cs" , "PrintImages" , error);
                return Content(JsonConvert.SerializeObject(new
                {
                    error = error.Message
                }));
            }
        }

        [HttpPost]
        [Route("ExportAnnotations")]
        public IActionResult ExportAnnotations([FromBody] Dictionary<string , string> jsonObject)
        {
            try
            {
                PdfRenderer pdfviewer = new PdfRenderer(_cache);
                string jsonResult = pdfviewer.ExportAnnotation(jsonObject);
                return Content(jsonResult);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("PdfViewerCNHController.cs" , "ExportAnnotations" , error);
                return Content(string.Empty);
            }
        }

        [HttpPost]
        [Route("ImportAnnotations")]
        public IActionResult ImportAnnotations([FromBody] Dictionary<string , string> jsonObject)
        {
            try
            {
                PdfRenderer pdfviewer = new PdfRenderer(_cache);
                string jsonResult = string.Empty;

                if (jsonObject != null && jsonObject.ContainsKey("fileName"))
                {
                    string documentPath = GetDocumentPath(jsonObject["fileName"]);
                    if (!string.IsNullOrEmpty(documentPath))
                    {
                        jsonResult = System.IO.File.ReadAllText(documentPath);
                    }
                    else
                    {
                        return Content(jsonObject["document"] + " não encontrado");
                    }
                }

                return Content(jsonResult);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("PdfViewerCNHController.cs" , "ImportAnnotations" , error);
                return Content(string.Empty);
            }
        }

        [HttpPost]
        [Route("ExportFormFields")]
        public IActionResult ExportFormFields([FromBody] Dictionary<string , string> jsonObject)
        {
            try
            {
                PdfRenderer pdfviewer = new PdfRenderer(_cache);
                string result = pdfviewer.ExportFormFields(jsonObject);
                return Content(result);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("PdfViewerCNHController.cs" , "ExportFormFields" , error);
                return Content(string.Empty);
            }
        }

        [HttpPost]
        [Route("ImportFormFields")]
        public IActionResult ImportFormFields([FromBody] Dictionary<string , string> jsonObject)
        {
            try
            {
                PdfRenderer pdfviewer = new PdfRenderer(_cache);
                object result = pdfviewer.ImportFormFields(jsonObject);
                return Content(JsonConvert.SerializeObject(result));
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("PdfViewerCNHController.cs" , "ImportFormFields" , error);
                return Content(JsonConvert.SerializeObject(new
                {
                    error = error.Message
                }));
            }
        }

        private string GetDocumentPath(string document)
        {
            try
            {
                string documentPath = string.Empty;
                if (!System.IO.File.Exists(document))
                {
                    string basePath = _hostingEnvironment.WebRootPath;
                    string dataPath = string.Empty;
                    dataPath = basePath + @"/scripts/pdfviewer/";
                    if (System.IO.File.Exists(dataPath + document))
                        documentPath = dataPath + document;
                }
                else
                {
                    documentPath = document;
                }
                return documentPath;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("PdfViewerCNHController.cs" , "GetDocumentPath" , error);
                return string.Empty;
            }
        }

        [HttpPost]
        [Route("GetDocument")]
        public string GetDocument(Guid id)
        {
            try
            {
                var objFromDb = _unitOfWork.Motorista.GetFirstOrDefault(u => u.MotoristaId == id);
                if (objFromDb != null)
                {
                    if (objFromDb.CNHDigital != null)
                    {
                        byte[] byteArray = objFromDb.CNHDigital;
                        return "data:application/pdf;base64," + Convert.ToBase64String(byteArray);
                    }
                }

                return "data:application/pdf;base64,";
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("PdfViewerCNHController.cs" , "GetDocument" , error);
                return string.Empty;
            }
        }
    }
}
