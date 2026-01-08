using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FrotiX.Pages.PlacaBronze
{
    public class UpsertModel : PageModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IWebHostEnvironment _hostingEnvironment;

        public UpsertModel(IUnitOfWork unitOfWork, IWebHostEnvironment hostingEnvironment)
        {
            _unitOfWork = unitOfWork;
            _hostingEnvironment = hostingEnvironment;
        }

        [BindProperty]
        public PlacaBronzeViewModel PlacaBronzeObj { get; set; }

        public IActionResult OnGet(Guid? id)
        {
            PlacaBronzeObj = new PlacaBronzeViewModel
            {
                PlacaBronze = new FrotiX.Models.PlacaBronze(),
                VeiculoId = Guid.Empty
            };

            if (id != null)
            {
                PlacaBronzeObj.PlacaBronze = _unitOfWork.PlacaBronze.GetFirstOrDefault(u => u.PlacaBronzeId == id);
                if (PlacaBronzeObj.PlacaBronze == null)
                {
                    return NotFound();
                }

                // Try to find the associated vehicle if it exists
                var veiculo = _unitOfWork.Veiculo.GetFirstOrDefault(v => v.PlacaBronzeId == id);
                if (veiculo != null)
                {
                     PlacaBronzeObj.VeiculoId = veiculo.VeiculoId;
                }
            }

            return Page();
        }

        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            if (PlacaBronzeObj.PlacaBronze.PlacaBronzeId == Guid.Empty)
            {
                PlacaBronzeObj.PlacaBronze.PlacaBronzeId = Guid.NewGuid();
                _unitOfWork.PlacaBronze.Add(PlacaBronzeObj.PlacaBronze);
            }
            else
            {
                var objFromDb = _unitOfWork.PlacaBronze.Get(PlacaBronzeObj.PlacaBronze.PlacaBronzeId);
                objFromDb.DescricaoPlaca = PlacaBronzeObj.PlacaBronze.DescricaoPlaca;
                objFromDb.Status = PlacaBronzeObj.PlacaBronze.Status;
                _unitOfWork.PlacaBronze.Update(objFromDb);
            }

            _unitOfWork.Save();

            // Handle Vehicle Association
             var currentVeiculo = _unitOfWork.Veiculo.GetFirstOrDefault(v => v.PlacaBronzeId == PlacaBronzeObj.PlacaBronze.PlacaBronzeId);

             if (currentVeiculo != null && currentVeiculo.VeiculoId != PlacaBronzeObj.VeiculoId)
             {
                 currentVeiculo.PlacaBronzeId = null;
                 _unitOfWork.Veiculo.Update(currentVeiculo);
             }

             if (PlacaBronzeObj.VeiculoId != Guid.Empty)
             {
                 var newVeiculo = _unitOfWork.Veiculo.Get(PlacaBronzeObj.VeiculoId);
                 if (newVeiculo != null)
                 {
                     newVeiculo.PlacaBronzeId = PlacaBronzeObj.PlacaBronze.PlacaBronzeId;
                     _unitOfWork.Veiculo.Update(newVeiculo);
                 }
             }

             _unitOfWork.Save();

            return RedirectToPage("./Index");
        }

        public IActionResult OnGetVeiculoData()
        {
            try
            {
                var veiculos = _unitOfWork.Veiculo.GetAll()
                    .Select(v => new { value = v.VeiculoId, text = v.Placa })
                    .ToList();
                return new JsonResult(veiculos);
            }
            catch (Exception)
            {
               return new JsonResult(new List<object>());
            }
        }
    }
}
