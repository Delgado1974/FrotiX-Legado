using Microsoft.AspNetCore.Hosting;
using System.Collections.Generic;
using System.IO;
using Telerik.Reporting;
using Telerik.Reporting.Services;

namespace FrotiX.Services
{
    public class CustomReportSourceResolver :IReportSourceResolver
    {
        private readonly IWebHostEnvironment _environment;

        public CustomReportSourceResolver(IWebHostEnvironment environment)
        {
            _environment = environment;
        }

        public ReportSource Resolve(string reportId , OperationOrigin operationOrigin , IDictionary<string , object> currentParameterValues)
        {
            // Caminho onde seus relatórios .trdp ou .trdx estão salvos
            var reportsPath = Path.Combine(_environment.ContentRootPath , "Reports");
            var reportPath = Path.Combine(reportsPath , reportId);

            // Adiciona extensão se não tiver
            if (!reportPath.EndsWith(".trdp") && !reportPath.EndsWith(".trdx"))
                reportPath += ".trdp";

            if (!File.Exists(reportPath))
                throw new FileNotFoundException($"Relatório não encontrado: {reportId}");

            var reportPackageSource = new UriReportSource
            {
                Uri = reportPath
            };

            // CRÍTICO: Passar os parâmetros recebidos do front-end para o relatório
            if (currentParameterValues != null)
            {
                foreach (var param in currentParameterValues)
                {
                    reportPackageSource.Parameters.Add(param.Key, param.Value);
                }
            }

            return reportPackageSource;
        }
    }
}
