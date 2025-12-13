using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System;
using System.Collections.Generic;
using System.IO;

namespace FrotiX.Pages.Multa
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
            }
        }

        public ActionResult OnPostSave(IEnumerable<IFormFile> files)
        {
            try
            {
                if (files != null)
                {
                    foreach (var file in files)
                    {
                        string folderName = "Upload";
                        string webRootPath = _hostingEnvironment.WebRootPath;
                        string newPath = Path.Combine(webRootPath , folderName);

                        if (!Directory.Exists(newPath))
                        {
                            Directory.CreateDirectory(newPath);
                        }

                        if (file.Length > 0)
                        {
                            string sFileExtension = Path.GetExtension(file.FileName).ToLower();

                            if (sFileExtension != ".pdf")
                            {
                                return Content("ERROR:INVALID_EXTENSION");
                            }

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
                Alerta.TratamentoErroComLinha("UploadPDF.cshtml.cs" , "OnPostSave" , error);
                return Content("ERROR:UPLOAD_FAILED");
            }
        }

        public ActionResult OnPostRemove(string[] fileNames)
        {
            try
            {
                if (fileNames != null)
                {
                    foreach (var fullName in fileNames)
                    {
                        var fileName = Path.GetFileName(fullName);
                        string webRootPath = _hostingEnvironment.WebRootPath;
                        string folderName = "Upload";
                        var physicalPath = Path.Combine(webRootPath , folderName , fileName);

                        if (System.IO.File.Exists(physicalPath))
                        {
                            System.IO.File.Delete(physicalPath);
                        }
                    }
                }

                return Content("");
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("UploadPDF.cshtml.cs" , "OnPostRemove" , error);
                return Content("ERROR:REMOVE_FAILED");
            }
        }
    }
}
