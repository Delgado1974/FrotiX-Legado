using FrotiX.Repository.IRepository;
using FrotiX.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using System;
using System.Collections.Generic;
using System.Linq;

namespace FrotiX.Pages.Frota
{
    [Authorize]
    public class DashboardEconomildoModel : PageModel
    {
        private readonly IUnitOfWork _unitOfWork;

        public DashboardEconomildoModel(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("DashboardEconomildo.cshtml.cs", "DashboardEconomildoModel", error);
            }
        }

        public IEnumerable<SelectListItem>? MobList { get; set; }
        public IEnumerable<SelectListItem>? MesList { get; set; }
        public IEnumerable<SelectListItem>? AnoList { get; set; }

        public void OnGet()
        {
            try
            {
                // Lista de MOBs
                MobList = new List<SelectListItem>
                {
                    new SelectListItem { Value = "", Text = "Todos" },
                    new SelectListItem { Value = "Rodoviaria", Text = "Rodoviaria" },
                    new SelectListItem { Value = "PGR", Text = "PGR" },
                    new SelectListItem { Value = "Cefor", Text = "Cefor" }
                };

                // Lista de Meses
                MesList = new List<SelectListItem>
                {
                    new SelectListItem { Value = "", Text = "Todos" },
                    new SelectListItem { Value = "1", Text = "Janeiro" },
                    new SelectListItem { Value = "2", Text = "Fevereiro" },
                    new SelectListItem { Value = "3", Text = "Marco" },
                    new SelectListItem { Value = "4", Text = "Abril" },
                    new SelectListItem { Value = "5", Text = "Maio" },
                    new SelectListItem { Value = "6", Text = "Junho" },
                    new SelectListItem { Value = "7", Text = "Julho" },
                    new SelectListItem { Value = "8", Text = "Agosto" },
                    new SelectListItem { Value = "9", Text = "Setembro" },
                    new SelectListItem { Value = "10", Text = "Outubro" },
                    new SelectListItem { Value = "11", Text = "Novembro" },
                    new SelectListItem { Value = "12", Text = "Dezembro" }
                };

                // Lista de Anos (ultimos 5 anos)
                var anoAtual = DateTime.Now.Year;
                var anos = new List<SelectListItem> { new SelectListItem { Value = "", Text = "Todos" } };
                for (int i = anoAtual; i >= anoAtual - 5; i--)
                {
                    anos.Add(new SelectListItem { Value = i.ToString(), Text = i.ToString() });
                }
                AnoList = anos;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("DashboardEconomildo.cshtml.cs", "OnGet", error);
            }
        }
    }
}
