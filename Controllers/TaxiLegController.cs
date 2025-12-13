using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using NPOI.HSSF.UserModel;
using NPOI.SS.UserModel;
using NPOI.XSSF.UserModel;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;

namespace FrotiX.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TaxiLegController :Controller
    {
        private readonly ILogger<TaxiLegController> _logger;
        private IWebHostEnvironment _hostingEnvironment;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICorridasTaxiLegRepository _corridasTaxiLegRepository;

        private string ExtrairHora(IRow row , int cellIndex)
        {
            try
            {
                var cell = row.GetCell(cellIndex);
                if (cell != null)
                {
                    if (cell.CellType == CellType.Numeric && DateUtil.IsCellDateFormatted(cell))
                    {
                        return cell.DateCellValue.ToString("HH:mm");
                    }
                    else
                    {
                        string raw = cell.ToString().Trim();

                        if (TimeSpan.TryParse(raw , out var ts))
                            return ts.ToString(@"hh\:mm");
                        else if (DateTime.TryParse(raw , out var dt))
                            return dt.ToString("HH:mm");
                    }
                }
                return "";
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("TaxiLegController.cs" , "ExtrairHora" , error);
                return string.Empty;
            }
        }

        public TaxiLegController(
            ILogger<TaxiLegController> logger ,
            IWebHostEnvironment hostingEnvironment ,
            IUnitOfWork unitOfWork ,
            ICorridasTaxiLegRepository corridasTaxiLegRepository
        )
        {
            try
            {
                _logger = logger;
                _hostingEnvironment = hostingEnvironment;
                _unitOfWork = unitOfWork;
                _corridasTaxiLegRepository = corridasTaxiLegRepository;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("TaxiLegController.cs" , "TaxiLegController" , error);
            }
        }

        [BindProperty]
        public Models.CorridasTaxiLeg TaxiLegObj
        {
            get; set;
        }
        public Models.CorridasCanceladasTaxiLeg TaxiLegCanceladasObj
        {
            get; set;
        }

        public IActionResult Index()
        {
            try
            {
                return View();
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("TaxiLegController.cs" , "Index" , error);
                return View();
            }
        }

        [HttpGet]
        public IActionResult Get()
        {
            try
            {
                return Json(true);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("TaxiLegController.cs" , "Get" , error);
                return Json(new
                {
                    success = false
                });
            }
        }

        [Route("Import")]
        [HttpPost]
        public ActionResult Import()
        {
            try
            {
                IFormFile file = Request.Form.Files[0];
                string folderName = "DadosEditaveis/UploadExcel";
                string webRootPath = _hostingEnvironment.WebRootPath;
                string newPath = Path.Combine(webRootPath , folderName);

                if (!Directory.Exists(newPath))
                {
                    Directory.CreateDirectory(newPath);
                }

                var listaCorridas = new List<CorridasTaxiLeg>();

                if (file.Length > 0)
                {
                    string sFileExtension = Path.GetExtension(file.FileName).ToLower();
                    ISheet sheet;
                    string fullPath = Path.Combine(newPath , file.FileName);

                    using (var stream = new FileStream(fullPath , FileMode.Create))
                    {
                        file.CopyTo(stream);
                        stream.Position = 0;

                        if (sFileExtension == ".xls")
                        {
                            HSSFWorkbook hssfwb = new HSSFWorkbook(stream);
                            sheet = hssfwb.GetSheetAt(0);
                        }
                        else
                        {
                            XSSFWorkbook hssfwb = new XSSFWorkbook(stream);
                            sheet = hssfwb.GetSheetAt(0);
                        }

                        // Busca a primeira data válida da planilha para extrair ano/mês
                        DateTime? primeiraDataAgenda = null;
                        for (int i = sheet.FirstRowNum + 1; i <= sheet.LastRowNum; i++)
                        {
                            IRow row = sheet.GetRow(i);
                            if (row == null)
                                continue;

                            if (DateTime.TryParse(row.GetCell(7)?.ToString() , out var dataAgenda))
                            {
                                primeiraDataAgenda = dataAgenda;
                                break;
                            }
                        }

                        // Checa se encontrou data válida
                        if (primeiraDataAgenda == null)
                        {
                            return Json(
                                new
                                {
                                    success = false ,
                                    message = "Não foi possível determinar a data das corridas." ,
                                    data = (object)null ,
                                }
                            );
                        }

                        // Checa se já existem corridas para o mês/ano
                        var ano = primeiraDataAgenda.Value.Year;
                        var mes = primeiraDataAgenda.Value.Month;
                        if (_corridasTaxiLegRepository.ExisteCorridaNoMesAno(ano , mes))
                        {
                            return Json(
                                new
                                {
                                    success = false ,
                                    message = $"O mês {mes:D2}/{ano} já foi importado!" ,
                                    data = (object)null ,
                                }
                            );
                        }

                        // Processa as linhas normalmente se passou pela checagem
                        for (int i = sheet.FirstRowNum + 1; i <= sheet.LastRowNum; i++)
                        {
                            IRow row = sheet.GetRow(i);
                            if (
                                row == null
                                || row.Cells.TrueForAll(cell =>
                                    cell == null || cell.CellType == CellType.Blank
                                )
                            )
                                continue;

                            var TaxiLegObj = new CorridasTaxiLeg();

                            TaxiLegObj.QRU = row.GetCell(0)?.ToString() ?? "";
                            TaxiLegObj.DescSetor = row.GetCell(1)?.ToString() ?? "";
                            TaxiLegObj.Setor = row.GetCell(2)?.ToString() ?? "";
                            TaxiLegObj.Unidade = row.GetCell(3)?.ToString() ?? "";
                            TaxiLegObj.DescUnidade = row.GetCell(4)?.ToString() ?? "";
                            TaxiLegObj.QtdPassageiros = int.TryParse(
                                row.GetCell(5)?.ToString() ,
                                out var passageiros
                            )
                                ? passageiros
                                : 1;
                            TaxiLegObj.MotivoUso = row.GetCell(6)?.ToString() ?? "";

                            TaxiLegObj.DataAgenda = DateTime.TryParse(
                                row.GetCell(7)?.ToString() ,
                                out var dataAgenda
                            )
                                ? dataAgenda
                                : (DateTime?)null;

                            // Usando função utilitária para hora
                            TaxiLegObj.HoraAgenda = ExtrairHora(row , 7);
                            TaxiLegObj.HoraAceite = ExtrairHora(row , 8);
                            TaxiLegObj.HoraInicio = ExtrairHora(row , 9);
                            TaxiLegObj.HoraLocal = ExtrairHora(row , 10);
                            TaxiLegObj.HoraFinal = ExtrairHora(row , 11);

                            TaxiLegObj.DataFinal = DateTime.TryParse(
                                row.GetCell(12)?.ToString() ,
                                out var dataFinal
                            )
                                ? dataFinal
                                : (DateTime?)null;

                            TaxiLegObj.OrigemCorrida = row.GetCell(13)?.ToString() ?? "";
                            TaxiLegObj.DestinoCorrida = row.GetCell(14)?.ToString() ?? "";
                            TaxiLegObj.KmReal = double.TryParse(
                                row.GetCell(15)?.ToString() ,
                                out var km
                            )
                                ? km
                                : 0;
                            TaxiLegObj.QtdEstrelas = int.TryParse(
                                row.GetCell(16)?.ToString() ,
                                out var estrelas
                            )
                                ? estrelas
                                : 0;
                            TaxiLegObj.Avaliacao = row.GetCell(17)?.ToString() ?? "";

                            var cultura = new CultureInfo("pt-BR");

                            string dataInicio = TaxiLegObj.DataAgenda?.ToString("dd/MM/yyyy") ?? "";
                            string dataFinalizacao =
                                TaxiLegObj.DataFinal?.ToString("dd/MM/yyyy") ?? "";
                            string horaInicio = TaxiLegObj.HoraInicio?.Trim() ?? "";
                            string horaFinal = TaxiLegObj.HoraFinal?.Trim() ?? "";
                            string horaAceite = TaxiLegObj.HoraAceite?.Trim() ?? "";
                            string horaLocal = TaxiLegObj.HoraLocal?.Trim() ?? "";

                            // Cálculo da Duração da Viagem
                            TaxiLegObj.Duracao = null;
                            if (
                                DateTime.TryParseExact(
                                    $"{dataInicio} {horaInicio}" ,
                                    "dd/MM/yyyy HH:mm" ,
                                    cultura ,
                                    DateTimeStyles.None ,
                                    out var inicio
                                )
                                && DateTime.TryParseExact(
                                    $"{dataFinalizacao} {horaFinal}" ,
                                    "dd/MM/yyyy HH:mm" ,
                                    cultura ,
                                    DateTimeStyles.None ,
                                    out var fim
                                )
                            )
                            {
                                int duracao = (int)(fim - inicio).TotalMinutes;
                                TaxiLegObj.Duracao = duracao < 0 ? 0 : duracao;
                            }

                            // Cálculo do Tempo de Espera
                            TaxiLegObj.Espera = null;
                            if (
                                TimeSpan.TryParseExact(
                                    horaAceite ,
                                    "hh\\:mm" ,
                                    cultura ,
                                    out var tsHoraAceite
                                )
                                && TimeSpan.TryParseExact(
                                    horaLocal ,
                                    "hh\\:mm" ,
                                    cultura ,
                                    out var tsHoraLocal
                                )
                                && DateTime.TryParseExact(
                                    $"{dataInicio} {horaAceite}" ,
                                    "dd/MM/yyyy HH:mm" ,
                                    cultura ,
                                    DateTimeStyles.None ,
                                    out var aceite
                                )
                            )
                            {
                                DateTime local;
                                if (tsHoraLocal < tsHoraAceite)
                                    local = aceite.Date.AddDays(1).Add(tsHoraLocal);
                                else
                                    local = aceite.Date.Add(tsHoraLocal);

                                int espera = (int)(local - aceite).TotalMinutes;
                                TaxiLegObj.Espera = espera;
                            }

                            // Cálculo da Glosa
                            TaxiLegObj.Glosa = TaxiLegObj.Espera > 15;
                            TaxiLegObj.ValorGlosa = (bool)TaxiLegObj.Glosa
                                ? Math.Round((double)(TaxiLegObj.KmReal * 2.44) , 2)
                                : 0;

                            listaCorridas.Add(TaxiLegObj);
                            _unitOfWork.CorridasTaxiLeg.Add(TaxiLegObj);
                        }

                        _unitOfWork.Save();
                    }
                }

                // Ordena a lista pelo campo QRU antes de retornar
                listaCorridas = listaCorridas.OrderBy(c => c.QRU).ToList();

                return Json(
                    new
                    {
                        success = true ,
                        message = "Planilha Importada com Sucesso" ,
                        data = listaCorridas ,
                    }
                );
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("TaxiLegController.cs" , "Import" , error);
                return Json(new
                {
                    success = false ,
                    message = "Erro ao importar planilha"
                });
            }
        }

        [Route("ImportCanceladas")]
        [HttpPost]
        public ActionResult ImportCanceladas()
        {
            try
            {
                IFormFile file = Request.Form.Files[0];
                string folderName = "DadosEditaveis/UploadExcel";
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
                    ISheet sheet;
                    string fullPath = Path.Combine(newPath , file.FileName);
                    using (var stream = new FileStream(fullPath , FileMode.Create))
                    {
                        file.CopyTo(stream);
                        stream.Position = 0;
                        if (sFileExtension == ".xls")
                        {
                            HSSFWorkbook hssfwb = new HSSFWorkbook(stream);
                            sheet = hssfwb.GetSheetAt(0);
                        }
                        else
                        {
                            XSSFWorkbook hssfwb = new XSSFWorkbook(stream);
                            sheet = hssfwb.GetSheetAt(0);
                        }

                        // Faz o Cabeçalho
                        IRow headerRow = sheet.GetRow(0);
                        int cellCount = headerRow.LastCellNum;
                        sb.Append(
                            "<table id='tblImportacao' class='display' style='width: 100%'><thead><tr>"
                        );
                        for (int j = 0; j < cellCount; j++)
                        {
                            NPOI.SS.UserModel.ICell cell = headerRow.GetCell(j);
                            sb.Append("<th>" + cell.ToString() + "</th>");
                        }
                        sb.Append("<th>" + "Espera" + "</th>");
                        sb.Append("</tr></thead>");

                        // Lê o arquivo Excel
                        sb.AppendLine("<tbody><tr>");
                        for (int i = (sheet.FirstRowNum + 1); i <= sheet.LastRowNum; i++)
                        {
                            IRow row = sheet.GetRow(i);
                            if (row == null)
                                continue;
                            if (row.Cells.All(d => d.CellType == CellType.Blank))
                                continue;
                            TaxiLegCanceladasObj = new CorridasCanceladasTaxiLeg();
                            for (int j = row.FirstCellNum; j < cellCount; j++)
                            {
                                if (j == 0)
                                {
                                    if (row.GetCell(j) != null)
                                    {
                                        TaxiLegCanceladasObj.Origem = row.GetCell(j).ToString();
                                        sb.Append("<td>" + row.GetCell(j).ToString() + "</td>");
                                    }
                                    else
                                    {
                                        sb.Append("<td> N/A </td>");
                                    }
                                }

                                if (j == 1)
                                {
                                    if (row.GetCell(j) != null)
                                    {
                                        TaxiLegCanceladasObj.Setor = row.GetCell(j).ToString();
                                        sb.Append("<td>" + row.GetCell(j).ToString() + "</td>");
                                    }
                                    else
                                    {
                                        sb.Append("<td> N/A </td>");
                                    }
                                }

                                if (j == 2)
                                {
                                    if (row.GetCell(j) != null)
                                    {
                                        TaxiLegCanceladasObj.SetorExtra = row.GetCell(j).ToString();
                                        sb.Append("<td>" + row.GetCell(j).ToString() + "</td>");
                                    }
                                    else
                                    {
                                        sb.Append("<td> N/A </td>");
                                    }
                                }

                                if (j == 3)
                                {
                                    if (row.GetCell(j) != null)
                                    {
                                        TaxiLegCanceladasObj.Unidade = row.GetCell(j).ToString();
                                        sb.Append("<td>" + row.GetCell(j).ToString() + "</td>");
                                    }
                                    else
                                    {
                                        sb.Append("<td> N/A </td>");
                                    }
                                }

                                if (j == 4)
                                {
                                    if (row.GetCell(j) != null)
                                    {
                                        TaxiLegCanceladasObj.UnidadeExtra = row.GetCell(j)
                                            .ToString();
                                        sb.Append("<td>" + row.GetCell(j).ToString() + "</td>");
                                    }
                                    else
                                    {
                                        sb.Append("<td> N/A </td>");
                                    }
                                }

                                if (j == 5)
                                {
                                    if (row.GetCell(j) != null)
                                    {
                                        try
                                        {
                                            TaxiLegCanceladasObj.QtdPassageiros = int.Parse(
                                                row.GetCell(j).ToString()
                                            );
                                        }
                                        catch (Exception)
                                        {
                                            TaxiLegCanceladasObj.QtdPassageiros = 1;
                                        }
                                        sb.Append(
                                            "<td>" + TaxiLegCanceladasObj.QtdPassageiros + "</td>"
                                        );
                                    }
                                    else
                                    {
                                        sb.Append("<td> N/A </td>");
                                    }
                                }

                                if (j == 6)
                                {
                                    if (row.GetCell(j) != null)
                                    {
                                        TaxiLegCanceladasObj.MotivoUso = row.GetCell(j).ToString();
                                        sb.Append("<td>" + row.GetCell(j).ToString() + "</td>");
                                    }
                                    else
                                    {
                                        sb.Append("<td> N/A </td>");
                                    }
                                }

                                if (j == 7)
                                {
                                    if (row.GetCell(j) != null)
                                    {
                                        TaxiLegCanceladasObj.DataAgenda = Convert.ToDateTime(
                                            row.GetCell(j).ToString()
                                        );
                                        sb.Append("<td>" + row.GetCell(j).ToString() + "</td>");
                                    }
                                    else
                                    {
                                        sb.Append("<td> N/A </td>");
                                    }
                                }

                                if (j == 8)
                                {
                                    if (row.GetCell(j) != null)
                                    {
                                        TaxiLegCanceladasObj.HoraAgenda = DateTime
                                            .Parse(row.GetCell(j).ToString())
                                            .ToShortTimeString();
                                        sb.Append("<td>" + row.GetCell(j).ToString() + "</td>");
                                    }
                                    else
                                    {
                                        sb.Append("<td> N/A </td>");
                                    }
                                }

                                if (j == 9)
                                {
                                    if (row.GetCell(j) != null)
                                    {
                                        TaxiLegCanceladasObj.DataHoraCancelamento = DateTime.Parse(
                                            row.GetCell(j).ToString()
                                        );
                                        TaxiLegCanceladasObj.HoraCancelamento = Convert
                                            .ToDateTime(row.GetCell(j).ToString())
                                            .ToShortTimeString();
                                        sb.Append("<td>" + row.GetCell(j).ToString() + "</td>");
                                    }
                                    else
                                    {
                                        sb.Append("<td> N/A </td>");
                                    }
                                }

                                if (j == 10)
                                {
                                    if (row.GetCell(j) != null)
                                    {
                                        TaxiLegCanceladasObj.TipoCancelamento = row.GetCell(j)
                                            .ToString();
                                        sb.Append("<td>" + row.GetCell(j).ToString() + "</td>");
                                    }
                                    else
                                    {
                                        sb.Append("<td> N/A </td>");
                                    }
                                }

                                if (j == 11)
                                {
                                    if (row.GetCell(j) != null)
                                    {
                                        TaxiLegCanceladasObj.MotivoCancelamento = row.GetCell(j)
                                            .ToString();
                                        sb.Append("<td>" + row.GetCell(j).ToString() + "</td>");
                                    }
                                    else
                                    {
                                        sb.Append("<td> N/A </td>");
                                    }
                                }
                            }

                            DateTime startTime = DateTime.Parse(TaxiLegCanceladasObj.HoraAgenda);
                            DateTime endTime = DateTime.Parse(
                                TaxiLegCanceladasObj.HoraCancelamento
                            );

                            TimeSpan span = endTime.Subtract(startTime);

                            TaxiLegCanceladasObj.TempoEspera = (int?)span.TotalMinutes;

                            if (TaxiLegCanceladasObj.TempoEspera < 0)
                            {
                                DateTime startTimeAnterior = DateTime.Parse(
                                    TaxiLegCanceladasObj.HoraAgenda
                                );
                                DateTime endTimeAnterior = DateTime.Parse("00:00:00");
                                endTimeAnterior = endTimeAnterior.AddDays(1);

                                TimeSpan spanAnterior = endTimeAnterior.Subtract(startTimeAnterior);

                                DateTime startTimePosterior = DateTime.Parse("00:00:00");
                                DateTime endTimePosterior = DateTime.Parse(
                                    TaxiLegCanceladasObj.HoraCancelamento
                                );

                                TimeSpan spanPosterior = endTimePosterior.Subtract(
                                    startTimePosterior
                                );

                                TaxiLegCanceladasObj.TempoEspera =
                                    (int?)spanAnterior.TotalMinutes
                                    + (int?)spanPosterior.TotalMinutes;
                            }

                            sb.Append(
                                "<td>" + TaxiLegCanceladasObj.TempoEspera.ToString() + "</td>"
                            );
                            sb.AppendLine("</tr>");

                            _unitOfWork.CorridasCanceladasTaxiLeg.Add(TaxiLegCanceladasObj);
                            _unitOfWork.Save();
                        }

                        sb.Append("</tbody></table>");
                    }

                    sb.Append("</tbody></table>");

                    return Json(
                        new
                        {
                            success = true ,
                            message = "Planilha Importada com Sucesso" ,
                            response = this.Content(sb.ToString()) ,
                        }
                    );
                }
                else
                {
                    return Json(
                        new
                        {
                            success = false ,
                            message = "Planilha Não Importada" ,
                            response = this.Content(sb.ToString()) ,
                        }
                    );
                }
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("TaxiLegController.cs" , "ImportCanceladas" , error);
                return Json(new
                {
                    success = false ,
                    message = "Erro ao importar corridas canceladas"
                });
            }
        }
    }
}
