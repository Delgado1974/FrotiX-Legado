/*
 * REFATORAÇÃO APLICADA:
 * - Padronizado tratamento de erros com Alerta.TratamentoErroComLinha
 * - Mantida estrutura completa do código
 * - Corrigido retornos em catch para manter consistência
 */

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
    [ApiController]
    [Route("api/[controller]")]
    public class MultaPdfViewerController :Controller
    {
        private readonly IWebHostEnvironment _env;
        private readonly IMemoryCache _cache;

        public MultaPdfViewerController(
            IWebHostEnvironment env ,
            IMemoryCache cache)
        {
            try
            {
                _env = env;
                _cache = cache;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("MultaPdfViewerController.cs" , "MultaPdfViewerController" , error);
            }
        }

        private string ResolveFolder()
        {
            try
            {
                var root = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath , "wwwroot");
                return Path.Combine(root , "DadosEditaveis" , "Multas");
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("MultaPdfViewerController.cs" , "ResolveFolder" , error);
                return string.Empty;
            }
        }

        private Stream ResolveDocumentStream(Dictionary<string , string> json)
        {
            try
            {
                if (json == null)
                    return new MemoryStream();

                bool isFileName = true;
                if (json.TryGetValue("isFileName" , out var isFileNameStr))
                    bool.TryParse(isFileNameStr , out isFileName);

                if (!json.TryGetValue("document" , out var document) || string.IsNullOrWhiteSpace(document))
                    return new MemoryStream();

                if (isFileName)
                {
                    var folder = ResolveFolder();
                    var path = Path.Combine(folder , Path.GetFileName(document));

                    if (!System.IO.File.Exists(path))
                        throw new FileNotFoundException($"{document} não encontrado em {folder}");

                    var ms = new MemoryStream();
                    using (var fs = new FileStream(path , FileMode.Open , FileAccess.Read , FileShare.ReadWrite))
                    {
                        fs.CopyTo(ms);
                    }
                    ms.Position = 0;
                    return ms;
                }
                else
                {
                    byte[] bytes;
                    try
                    {
                        bytes = Convert.FromBase64String(document);
                    }
                    catch
                    {
                        bytes = Array.Empty<byte>();
                    }
                    return new MemoryStream(bytes);
                }
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("MultaPdfViewerController.cs" , "ResolveDocumentStream" , error);
                return new MemoryStream();
            }
        }

        [HttpPost("Load")]
        public IActionResult Load([FromBody] Dictionary<string , string> json)
        {
            try
            {
                var viewer = new PdfRenderer(_cache);

                var stream = ResolveDocumentStream(json);
                stream.Position = 0;

                var output = viewer.Load(stream , json);
                return Content(JsonConvert.SerializeObject(output) ,
                               "application/json; charset=utf-8");
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("MultaPdfViewerController.cs" , "Load" , error);
                return StatusCode(500 , new
                {
                    error = error.Message
                });
            }
        }

        [HttpPost("RenderPdfPages")]
        public IActionResult RenderPdfPages([FromBody] Dictionary<string , string> json)
        {
            try
            {
                var viewer = new PdfRenderer(_cache);
                var result = viewer.GetPage(json);
                return Content(JsonConvert.SerializeObject(result) ,
                               "application/json; charset=utf-8");
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("MultaPdfViewerController.cs" , "RenderPdfPages" , error);
                return StatusCode(500 , new
                {
                    error = error.Message
                });
            }
        }

        [HttpPost("RenderThumbnailImages")]
        public IActionResult RenderThumbnailImages([FromBody] Dictionary<string , string> json)
        {
            try
            {
                var viewer = new PdfRenderer(_cache);
                var result = viewer.GetThumbnailImages(json);
                return Content(JsonConvert.SerializeObject(result) ,
                               "application/json; charset=utf-8");
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("MultaPdfViewerController.cs" , "RenderThumbnailImages" , error);
                return StatusCode(500 , new
                {
                    error = error.Message
                });
            }
        }

        [HttpPost("Bookmarks")]
        public IActionResult Bookmarks([FromBody] Dictionary<string , string> json)
        {
            try
            {
                var viewer = new PdfRenderer(_cache);
                var result = viewer.GetBookmarks(json);
                return Content(JsonConvert.SerializeObject(result) ,
                               "application/json; charset=utf-8");
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("MultaPdfViewerController.cs" , "Bookmarks" , error);
                return StatusCode(500 , new
                {
                    error = error.Message
                });
            }
        }

        [HttpPost("RenderAnnotationComments")]
        public IActionResult RenderAnnotationComments([FromBody] Dictionary<string , string> json)
        {
            try
            {
                var viewer = new PdfRenderer(_cache);
                var result = viewer.GetAnnotationComments(json);
                return Content(JsonConvert.SerializeObject(result) ,
                               "application/json; charset=utf-8");
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("MultaPdfViewerController.cs" , "RenderAnnotationComments" , error);
                return StatusCode(500 , new
                {
                    error = error.Message
                });
            }
        }

        [HttpPost("Unload")]
        public IActionResult Unload([FromBody] Dictionary<string , string> json)
        {
            try
            {
                var viewer = new PdfRenderer(_cache);
                viewer.ClearCache(json);
                return Content("Document cache is cleared" , "text/plain; charset=utf-8");
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("MultaPdfViewerController.cs" , "Unload" , error);
                return StatusCode(500 , new
                {
                    error = error.Message
                });
            }
        }

        [HttpPost("ExportAnnotations")]
        public IActionResult ExportAnnotations([FromBody] Dictionary<string , string> json)
        {
            try
            {
                var viewer = new PdfRenderer(_cache);
                var result = viewer.ExportAnnotation(json);
                return Content(result , "application/json; charset=utf-8");
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("MultaPdfViewerController.cs" , "ExportAnnotations" , error);
                return StatusCode(500 , new
                {
                    error = error.Message
                });
            }
        }

        [HttpPost("ImportAnnotations")]
        public IActionResult ImportAnnotations([FromBody] Dictionary<string , string> json)
        {
            try
            {
                var viewer = new PdfRenderer(_cache);

                if (json != null && json.ContainsKey("fileName"))
                {
                    var path = Path.Combine(ResolveFolder() , Path.GetFileName(json["fileName"]));
                    if (System.IO.File.Exists(path))
                    {
                        var xfdf = System.IO.File.ReadAllText(path);
                        return Content(xfdf , "application/json; charset=utf-8");
                    }
                    return Content($"{json["fileName"]} not found" , "text/plain; charset=utf-8");
                }

                var result = viewer.ImportAnnotation(json);
                return Content(JsonConvert.SerializeObject(result) ,
                               "application/json; charset=utf-8");
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("MultaPdfViewerController.cs" , "ImportAnnotations" , error);
                return StatusCode(500 , new
                {
                    error = error.Message
                });
            }
        }

        [HttpPost("ExportFormFields")]
        public IActionResult ExportFormFields([FromBody] Dictionary<string , string> json)
        {
            try
            {
                var viewer = new PdfRenderer(_cache);
                var result = viewer.ExportFormFields(json);
                return Content(result , "application/json; charset=utf-8");
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("MultaPdfViewerController.cs" , "ExportFormFields" , error);
                return StatusCode(500 , new
                {
                    error = error.Message
                });
            }
        }

        [HttpPost("ImportFormFields")]
        public IActionResult ImportFormFields([FromBody] Dictionary<string , string> json)
        {
            try
            {
                var viewer = new PdfRenderer(_cache);

                if (json != null && json.ContainsKey("data"))
                    json["data"] = Path.Combine(ResolveFolder() , Path.GetFileName(json["data"]));

                var result = viewer.ImportFormFields(json);
                return Content(JsonConvert.SerializeObject(result) ,
                               "application/json; charset=utf-8");
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("MultaPdfViewerController.cs" , "ImportFormFields" , error);
                return StatusCode(500 , new
                {
                    error = error.Message
                });
            }
        }

        [HttpPost("Download")]
        public IActionResult Download([FromBody] Dictionary<string , string> json)
        {
            try
            {
                var viewer = new PdfRenderer(_cache);
                var base64 = viewer.GetDocumentAsBase64(json);
                return Content(base64 , "text/plain; charset=utf-8");
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("MultaPdfViewerController.cs" , "Download" , error);
                return StatusCode(500 , new
                {
                    error = error.Message
                });
            }
        }

        [HttpPost("PrintImages")]
        public IActionResult PrintImages([FromBody] Dictionary<string , string> json)
        {
            try
            {
                var viewer = new PdfRenderer(_cache);
                var result = viewer.GetPrintImage(json);
                return Content(JsonConvert.SerializeObject(result) ,
                               "application/json; charset=utf-8");
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("MultaPdfViewerController.cs" , "PrintImages" , error);
                return StatusCode(500 , new
                {
                    error = error.Message
                });
            }
        }
    }
}
