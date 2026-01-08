using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FrotiX.Pages.Uploads
{
    public class UploadPDFModel :PageModel
    {
        private IWebHostEnvironment _hostingEnvironment;

        public UploadPDFModel(IWebHostEnvironment hostingEnvironment)
        {
            try
            {
                _hostingEnvironment = hostingEnvironment;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("UploadPDF.cshtml.cs" , "UploadPDFModel" , error);
            }
        }

        public void OnGet()
        {
            try
            {
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("UploadPDF.cshtml.cs" , "OnGet" , error);
                return;
            }
        }

        public async Task<IActionResult> OnPostSaveIMGManutencaoAsync(IEnumerable<IFormFile> files)
        {
            try
            {
                var file = files?.FirstOrDefault();
                if (file is null || file.Length == 0)
                {
                    return BadRequest("Arquivo ausente.");
                }

                var allowed = new[] { ".jpg" , ".jpeg" , ".png" , ".gif" , ".webp" };
                var ext = Path.GetExtension(file.FileName)?.ToLowerInvariant();
                if (!allowed.Contains(ext))
                {
                    return BadRequest("Extensão inválida.");
                }

                var root = _hostingEnvironment.WebRootPath;
                var target = Path.Combine(root , "DadosEditaveis" , "ImagensOcorrencias");
                Directory.CreateDirectory(target);

                var stored = $"{Guid.NewGuid():N}{ext}";
                var full = Path.Combine(target , stored);

                await using (var fs = System.IO.File.Create(full))
                {
                    await file.CopyToAsync(fs);
                }

                return new JsonResult(new
                {
                    fileName = stored
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("UploadPDF.cshtml.cs" , "OnPostSaveIMGManutencaoAsync" , error);
                return BadRequest("Erro ao processar o arquivo.");
            }
        }

        public ActionResult OnPostSaveIMGManutencaoNovo(IEnumerable<IFormFile> filesnovo)
        {
            try
            {
                if (filesnovo != null)
                {
                    foreach (var file in filesnovo)
                    {
                        string folderName = "DadosEditaveis/ImagensOcorrencias";
                        string webRootPath = _hostingEnvironment.WebRootPath;
                        string newPath = Path.Combine(webRootPath , folderName);
                        StringBuilder sb = new StringBuilder();

                        if (!Directory.Exists(newPath))
                        {
                            Directory.CreateDirectory(newPath);
                        }

                        if (file.Length > 0)
                        {
                            string sFileExtension = Path.GetExtension(file.FileName).ToLower();
                            string fullPath = Path.Combine(newPath , file.FileName);

                            using (var stream = new FileStream(fullPath , FileMode.Create))
                            {
                                file.CopyTo(stream);
                            }
                        }
                    }
                }

                return Content("");
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("UploadPDF.cshtml.cs" , "OnPostSaveIMGManutencaoNovo" , error);
                return Content("");
            }
        }

        public ActionResult OnPostRemoveIMGManutencao(string[] fileNames)
        {
            try
            {
                if (fileNames != null)
                {
                    foreach (var fullName in fileNames)
                    {
                        var fileName = Path.GetFileName(fullName);
                        var physicalPath = Path.Combine("App_Data" , fileName);

                        if (System.IO.File.Exists(physicalPath))
                        {
                            // Os arquivos não são realmente removidos nesta demo
                            // System.IO.File.Delete(physicalPath);
                        }
                    }
                }

                return Content("");
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("UploadPDF.cshtml.cs" , "OnPostRemoveIMGManutencao" , error);
                return Content("");
            }
        }
    }
}
