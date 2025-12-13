using Microsoft.AspNetCore.Mvc;
using Telerik.Reporting.Services;
using Telerik.Reporting.Services.AspNetCore;

namespace FrotiX.Controllers
{
    [Route("api/reports")]
    public class ReportsController :ReportsControllerBase
    {
        // Construtor NOVO - usando injeção de dependência
        public ReportsController(IReportServiceConfiguration reportServiceConfiguration)
            : base(reportServiceConfiguration)
        {
            // Não precisa de código aqui - a configuração vem do Startup/Program.cs
        }
    }
}
