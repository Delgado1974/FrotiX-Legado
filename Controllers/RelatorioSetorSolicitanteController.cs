using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Stimulsoft.Report;
using Stimulsoft.Report.Mvc;

namespace FrotiX.Controllers
{
    [Route("SetorSolicitante/RelatorioSetorSolicitante")]
    public class RelatorioSetorSolicitanteController : Controller
    {
        static RelatorioSetorSolicitanteController()
        {
            try
            {
                // How to Activate
                Stimulsoft.Base.StiLicense.Key =
                    "6vJhGtLLLz2GNviWmUTrhSqnOItdDwjBylQzQcAOiHkgpgFGkUl79uxVs8X+uspx6K+tqdtOB5G1S6PFPRrlVNvMUiSiNYl724EZbrUAWwAYHlGLRbvxMviMExTh2l9xZJ2xc4K1z3ZVudRpQpuDdFq+fe0wKXSKlB6okl0hUd2ikQHfyzsAN8fJltqvGRa5LI8BFkA/f7tffwK6jzW5xYYhHxQpU3hy4fmKo/BSg6yKAoUq3yMZTG6tWeKnWcI6ftCDxEHd30EjMISNn1LCdLN0/4YmedTjM7x+0dMiI2Qif/yI+y8gmdbostOE8S2ZjrpKsgxVv2AAZPdzHEkzYSzx81RHDzZBhKRZc5mwWAmXsWBFRQol9PdSQ8BZYLqvJ4Jzrcrext+t1ZD7HE1RZPLPAqErO9eo+7Zn9Cvu5O73+b9dxhE2sRyAv9Tl1lV2WqMezWRsO55Q3LntawkPq0HvBkd9f8uVuq9zk7VKegetCDLb0wszBAs1mjWzN+ACVHiPVKIk94/QlCkj31dWCg8YTrT5btsKcLibxog7pv1+2e4yocZKWsposmcJbgG0";
                //Stimulsoft.Base.StiLicense.LoadFromFile("https://localhost:44340/licenses/stimulsoftlicense.key");
                //Stimulsoft.Base.StiLicense.LoadFromStream(stream);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "RelatorioSetorSolicitanteController.cs",
                    "RelatorioSetorSolicitanteController",
                    error
                );
            }
        }

        [IgnoreAntiforgeryToken]
        public IActionResult Index()
        {
            try
            {
                return View();
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "RelatorioSetorSolicitanteController.cs",
                    "Index",
                    error
                );
                return View(); // padronizado
            }
        }

        [Route("GetReport")]
        public IActionResult GetReport()
        {
            try
            {
                StiReport report = new StiReport();
                report.Dictionary.DataStore.Clear();
                report.Load(StiNetCoreHelper.MapPath(this, "Reports/SetoresSolicitantes.mrt"));
                //report.Load(StiNetCoreHelper.MapPath(this, "Reports/Viagens.mrt"));
                //report["@p_ViagemId"] = "4D220794-ED4B-454B-DCD8-08D9A2F6C6C2";
                //report.DataSources["DataSource1"].Parameters["@p_ViagemId"].Value = "4D220794-ED4B-454B-DCD8-08D9A2F6C6C2";

                return StiNetCoreViewer.GetReportResult(this, report);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "RelatorioSetorSolicitanteController.cs",
                    "GetReport",
                    error
                );
                return View(); // padronizado
            }
        }

        [Route("ViewerEvent")]
        public IActionResult ViewerEvent()
        {
            try
            {
                return StiNetCoreViewer.ViewerEventResult(this);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha(
                    "RelatorioSetorSolicitanteController.cs",
                    "ViewerEvent",
                    error
                );
                return View(); // padronizado
            }
        }
    }
}
