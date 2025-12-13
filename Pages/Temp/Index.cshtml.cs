using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace FrotiX.Pages
{
    public class IndexModel : PageModel
    {
        private readonly IUnitOfWork _unitOfWork;
        //public System.Collections.Generic.List<OrdersDetails> Datasource { get; set; }
        //public System.Collections.Generic.List<Veiculos> dtsVeiculo { get; set; }
        public string WelcomeMessage { get; set; }

        public IndexModel(IUnitOfWork unitOfWork)
        {
            try
            {

                _unitOfWork = unitOfWork;
                
            }
        catch (Exception error)
        {
            Alerta.TratamentoErroComLinha("Index.cshtml.cs", "IndexModel", error);
        }
}

public void OnGet()
{
    try
    {

        //Datasource = OrdersDetails.GetAllRecords().ToList();

        PreencheGridVeiculos();

        WelcomeMessage = "WelCome to Razor Pages by Saineshwar Bageri";

        
    }
catch (Exception error)
{
    Alerta.TratamentoErroComLinha("Index.cshtml.cs", "OnGet", error);
    return; // padronizado
}
}

class Veiculos
{
    public string Veiculo { get; set; }
    public decimal Consumo { get; set; }
}

public void PreencheGridVeiculos()
{
    try
    {

        //Preenche Grid de Veicucolos
        //==================================
        var objVeiculos = _unitOfWork.ViewVeiculos.GetAll();
        List<Veiculos> VeiculosDataSource = new List<Veiculos>();

        //string requisitante = "8852C87D-90D8-4A16-8D13-08D97F8B08A4";
        //RequisitanteDataSource.Add(new RequisitanteData
        //{
        //    RequisitanteId = Guid.Parse(requisitante),
        //    Requisitante = "Alexandre Delgado",
        //});

        foreach (var veiculo in objVeiculos)
        {
            VeiculosDataSource.Add(new Veiculos
            {
                Veiculo = veiculo.MarcaModelo,
                Consumo = (decimal)veiculo.Consumo,
            });
    }

ViewData["dataVeiculo"] = VeiculosDataSource;


}
catch (Exception error)
{
    Alerta.TratamentoErroComLinha("Index.cshtml.cs", "PreencheGridVeiculos", error);
    return; // padronizado
}
}



}
}


