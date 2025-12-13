using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Syncfusion.EJ2.PdfViewer;
using System;
using System.Collections.Generic;
using System.IO;

namespace FrotiX.Controllers.API
{
    [Route("api/[controller]")]
    [ApiController]
    public class PdfViewerController :ControllerBase
    {
        private readonly IWebHostEnvironment _hostingEnvironment;

        public PdfViewerController(IWebHostEnvironment hostingEnvironment)
        {
            try
            {
                _hostingEnvironment = hostingEnvironment;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("PdfViewerController.cs" , "PdfViewerController" , error);
            }
        }

        [HttpPost("Load")]
        [Microsoft.AspNetCore.Cors.EnableCors("AllowAllOrigins")]
        public IActionResult Load([FromBody] Dictionary<string , string> jsonObject)
        {
            try
            {
                PdfRenderer pdfviewer = new PdfRenderer();
                MemoryStream stream = new MemoryStream();
                object jsonResult = new object();

                if (jsonObject != null && jsonObject.ContainsKey("document"))
                {
                    if (bool.TryParse(jsonObject["isFileName"] , out bool isFileName) && isFileName)
                    {
                        string documentPath = jsonObject["document"].TrimStart('/');
                        string fullPath = Path.Combine(_hostingEnvironment.WebRootPath , documentPath);

                        if (System.IO.File.Exists(fullPath))
                        {
                            byte[] bytes = System.IO.File.ReadAllBytes(fullPath);
                            stream = new MemoryStream(bytes);
                        }
                        else
                        {
                            return Content(JsonConvert.SerializeObject(new
                            {
                                error = "Arquivo não encontrado: " + fullPath
                            }));
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
                Alerta.TratamentoErroComLinha("PdfViewerController.cs" , "Load" , error);
                return Content(JsonConvert.SerializeObject(new
                {
                    error = error.Message
                }));
            }
        }

        [HttpPost("Bookmarks")]
        [Microsoft.AspNetCore.Cors.EnableCors("AllowAllOrigins")]
        public IActionResult Bookmarks([FromBody] Dictionary<string , string> jsonObject)
        {
            try
            {
                PdfRenderer pdfviewer = new PdfRenderer();
                object jsonResult = pdfviewer.GetBookmarks(jsonObject);
                return Content(JsonConvert.SerializeObject(jsonResult));
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("PdfViewerController.cs" , "Bookmarks" , error);
                return Content(JsonConvert.SerializeObject(new
                {
                    error = error.Message
                }));
            }
        }

        [HttpPost("RenderPdfPages")]
        [Microsoft.AspNetCore.Cors.EnableCors("AllowAllOrigins")]
        public IActionResult RenderPdfPages([FromBody] Dictionary<string , string> jsonObject)
        {
            try
            {
                PdfRenderer pdfviewer = new PdfRenderer();
                object jsonResult = pdfviewer.GetPage(jsonObject);
                return Content(JsonConvert.SerializeObject(jsonResult));
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("PdfViewerController.cs" , "RenderPdfPages" , error);
                return Content(JsonConvert.SerializeObject(new
                {
                    error = error.Message
                }));
            }
        }

        [HttpPost("RenderPdfTexts")]
        [Microsoft.AspNetCore.Cors.EnableCors("AllowAllOrigins")]
        public IActionResult RenderPdfTexts([FromBody] Dictionary<string , string> jsonObject)
        {
            try
            {
                PdfRenderer pdfviewer = new PdfRenderer();
                object jsonResult = pdfviewer.GetDocumentText(jsonObject);
                return Content(JsonConvert.SerializeObject(jsonResult));
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("PdfViewerController.cs" , "RenderPdfTexts" , error);
                return Content(JsonConvert.SerializeObject(new
                {
                    error = error.Message
                }));
            }
        }

        [HttpPost("RenderThumbnailImages")]
        [Microsoft.AspNetCore.Cors.EnableCors("AllowAllOrigins")]
        public IActionResult RenderThumbnailImages([FromBody] Dictionary<string , string> jsonObject)
        {
            try
            {
                PdfRenderer pdfviewer = new PdfRenderer();
                object result = pdfviewer.GetThumbnailImages(jsonObject);
                return Content(JsonConvert.SerializeObject(result));
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("PdfViewerController.cs" , "RenderThumbnailImages" , error);
                return Content(JsonConvert.SerializeObject(new
                {
                    error = error.Message
                }));
            }
        }

        [HttpPost("RenderAnnotationComments")]
        [Microsoft.AspNetCore.Cors.EnableCors("AllowAllOrigins")]
        public IActionResult RenderAnnotationComments([FromBody] Dictionary<string , string> jsonObject)
        {
            try
            {
                PdfRenderer pdfviewer = new PdfRenderer();
                object jsonResult = pdfviewer.GetAnnotationComments(jsonObject);
                return Content(JsonConvert.SerializeObject(jsonResult));
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("PdfViewerController.cs" , "RenderAnnotationComments" , error);
                return Content(JsonConvert.SerializeObject(new
                {
                    error = error.Message
                }));
            }
        }

        [HttpPost("ExportAnnotations")]
        [Microsoft.AspNetCore.Cors.EnableCors("AllowAllOrigins")]
        public IActionResult ExportAnnotations([FromBody] Dictionary<string , string> jsonObject)
        {
            try
            {
                PdfRenderer pdfviewer = new PdfRenderer();
                string jsonResult = pdfviewer.ExportAnnotation(jsonObject);
                return Content(jsonResult);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("PdfViewerController.cs" , "ExportAnnotations" , error);
                return Content(JsonConvert.SerializeObject(new
                {
                    error = error.Message
                }));
            }
        }

        [HttpPost("ImportAnnotations")]
        [Microsoft.AspNetCore.Cors.EnableCors("AllowAllOrigins")]
        public IActionResult ImportAnnotations([FromBody] Dictionary<string , string> jsonObject)
        {
            try
            {
                PdfRenderer pdfviewer = new PdfRenderer();
                object jsonResult = pdfviewer.ImportAnnotation(jsonObject);
                return Content(JsonConvert.SerializeObject(jsonResult));
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("PdfViewerController.cs" , "ImportAnnotations" , error);
                return Content(JsonConvert.SerializeObject(new
                {
                    error = error.Message
                }));
            }
        }

        [HttpPost("ExportFormFields")]
        [Microsoft.AspNetCore.Cors.EnableCors("AllowAllOrigins")]
        public IActionResult ExportFormFields([FromBody] Dictionary<string , string> jsonObject)
        {
            try
            {
                PdfRenderer pdfviewer = new PdfRenderer();
                string jsonResult = pdfviewer.ExportFormFields(jsonObject);
                return Content(jsonResult);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("PdfViewerController.cs" , "ExportFormFields" , error);
                return Content(JsonConvert.SerializeObject(new
                {
                    error = error.Message
                }));
            }
        }

        [HttpPost("ImportFormFields")]
        [Microsoft.AspNetCore.Cors.EnableCors("AllowAllOrigins")]
        public IActionResult ImportFormFields([FromBody] Dictionary<string , string> jsonObject)
        {
            try
            {
                PdfRenderer pdfviewer = new PdfRenderer();
                object jsonResult = pdfviewer.ImportFormFields(jsonObject);
                return Content(JsonConvert.SerializeObject(jsonResult));
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("PdfViewerController.cs" , "ImportFormFields" , error);
                return Content(JsonConvert.SerializeObject(new
                {
                    error = error.Message
                }));
            }
        }

        [HttpPost("Unload")]
        [Microsoft.AspNetCore.Cors.EnableCors("AllowAllOrigins")]
        public IActionResult Unload([FromBody] Dictionary<string , string> jsonObject)
        {
            try
            {
                PdfRenderer pdfviewer = new PdfRenderer();
                pdfviewer.ClearCache(jsonObject);
                return Ok("Document cache cleared");
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("PdfViewerController.cs" , "Unload" , error);
                return Content(JsonConvert.SerializeObject(new
                {
                    error = error.Message
                }));
            }
        }

        [HttpPost("Download")]
        [Microsoft.AspNetCore.Cors.EnableCors("AllowAllOrigins")]
        public IActionResult Download([FromBody] Dictionary<string , string> jsonObject)
        {
            try
            {
                PdfRenderer pdfviewer = new PdfRenderer();
                string documentBase = pdfviewer.GetDocumentAsBase64(jsonObject);
                return Content(documentBase);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("PdfViewerController.cs" , "Download" , error);
                return Content(JsonConvert.SerializeObject(new
                {
                    error = error.Message
                }));
            }
        }

        [HttpPost("PrintImages")]
        [Microsoft.AspNetCore.Cors.EnableCors("AllowAllOrigins")]
        public IActionResult PrintImages([FromBody] Dictionary<string , string> jsonObject)
        {
            try
            {
                PdfRenderer pdfviewer = new PdfRenderer();
                object pageImage = pdfviewer.GetPrintImage(jsonObject);
                return Content(JsonConvert.SerializeObject(pageImage));
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("PdfViewerController.cs" , "PrintImages" , error);
                return Content(JsonConvert.SerializeObject(new
                {
                    error = error.Message
                }));
            }
        }
    }
}
