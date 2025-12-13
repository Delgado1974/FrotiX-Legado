using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System;

namespace FrotiX.Pages.Usuarios
{
    public class InsereRecursosUsuariosModel :PageModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IWebHostEnvironment _hostingEnvironment;

        public InsereRecursosUsuariosModel(IUnitOfWork unitOfWork , IWebHostEnvironment hostingEnvironment)
        {
            try
            {
                _unitOfWork = unitOfWork;
                _hostingEnvironment = hostingEnvironment;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("InsereRecursosUsuarios.cshtml.cs" , "InsereRecursosUsuariosModel" , error);
            }
        }
    }
}
