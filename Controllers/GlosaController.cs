/*
 * REFATORAÇÕES APLICADAS:
 * - Adicionado try-catch com Alerta.TratamentoErroComLinha em todos os endpoints
 * - Mantida toda estrutura e lógica original
 */

using ClosedXML.Excel;
using FrotiX.Services;
using Microsoft.AspNetCore.Mvc;
using Syncfusion.Blazor.Data;
using Syncfusion.EJ2.Base;
using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;

[ApiController]
[Route("glosa")]
public class GlosaController :ControllerBase
{
    private readonly IGlosaService _service;

    public GlosaController(IGlosaService service)
    {
        try
        {
            _service = service;
        }
        catch (Exception error)
        {
            Alerta.TratamentoErroComLinha("GlosaController.cs" , "GlosaController" , error);
        }
    }

    // ===================== DADOS P/ GRID (Syncfusion EJ2) =====================

    // aceita /glosa/resumo e /glosa/resumo/
    [HttpGet("resumo")]
    [HttpGet("resumo/")]
    public IActionResult Resumo(
        [FromQuery] DataManagerRequest dm ,
        [FromQuery] Guid contratoId ,
        [FromQuery] int ano ,
        [FromQuery] int mes
    )
    {
        try
        {
            var data = _service.ListarResumo(contratoId , mes , ano).AsQueryable();

            var ops = new DataOperations();
            IEnumerable result = data;

            // search (opcional)
            if (dm.Search != null && dm.Search.Count > 0)
                result = ops.PerformSearching(result , dm.Search);

            // where
            var whereOperator = (dm.Where != null && dm.Where.Count > 0) ? dm.Where[0].Operator : "and";
            result = ops.PerformFiltering(result , dm.Where , whereOperator);

            // sort
            result = ops.PerformSorting(result , dm.Sorted);

            // total antes de paginar
            var count = result.Cast<object>().Count();

            // paginação
            if (dm.Skip != 0)
                result = ops.PerformSkip(result , dm.Skip);
            if (dm.Take != 0)
                result = ops.PerformTake(result , dm.Take);

            return new JsonResult(new DataResult { Result = result , Count = count });
        }
        catch (Exception error)
        {
            Alerta.TratamentoErroComLinha("GlosaController.cs" , "Resumo" , error);
            return StatusCode(500);
        }
    }

    [HttpGet("detalhes")]
    [HttpGet("detalhes/")]
    public IActionResult Detalhes(
        [FromQuery] DataManagerRequest dm ,
        [FromQuery] Guid contratoId ,
        [FromQuery] int ano ,
        [FromQuery] int mes
    )
    {
        try
        {
            var data = _service.ListarDetalhes(contratoId , mes , ano).AsQueryable();

            var ops = new DataOperations();
            IEnumerable result = data;

            if (dm.Search != null && dm.Search.Count > 0)
                result = ops.PerformSearching(result , dm.Search);

            var whereOperator = (dm.Where != null && dm.Where.Count > 0) ? dm.Where[0].Operator : "and";
            result = ops.PerformFiltering(result , dm.Where , whereOperator);

            result = ops.PerformSorting(result , dm.Sorted);

            var count = result.Cast<object>().Count();

            if (dm.Skip != 0)
                result = ops.PerformSkip(result , dm.Skip);
            if (dm.Take != 0)
                result = ops.PerformTake(result , dm.Take);

            return new JsonResult(new DataResult { Result = result , Count = count });
        }
        catch (Exception error)
        {
            Alerta.TratamentoErroComLinha("GlosaController.cs" , "Detalhes" , error);
            return StatusCode(500);
        }
    }

    // apenas Resumo
    [HttpGet("export/resumo")]
    [Produces("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")]
    public IActionResult ExportResumo(
        [FromQuery] Guid contratoId ,
        [FromQuery] int mes ,
        [FromQuery] int ano
    )
    {
        try
        {
            var resumo = _service.ListarResumo(contratoId , mes , ano).ToList();

            using var wb = new XLWorkbook();
            var ws = wb.Worksheets.Add("Resumo");
            var table = ws.Cell(1 , 1).InsertTable(resumo , true);
            table.Theme = XLTableTheme.TableStyleMedium2;

            FormatCurrencyColumns(
                ws ,
                table ,
                "PrecoDiario" ,
                "PrecoTotalMensal" ,
                "Glosa" ,
                "ValorParaAteste"
            );
            ws.Columns().AdjustToContents();

            return BuildExcelFileResult(wb , $"Glosa_Resumo_{ano}-{mes:00}.xlsx");
        }
        catch (Exception error)
        {
            Alerta.TratamentoErroComLinha("GlosaController.cs" , "ExportResumo" , error);
            return StatusCode(500);
        }
    }

    // apenas Detalhes
    [HttpGet("export/detalhes")]
    [Produces("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")]
    public IActionResult ExportDetalhes(
        [FromQuery] Guid contratoId ,
        [FromQuery] int mes ,
        [FromQuery] int ano
    )
    {
        try
        {
            var detalhes = _service.ListarDetalhes(contratoId , mes , ano).ToList();

            using var wb = new XLWorkbook();
            var ws = wb.Worksheets.Add("Detalhes");
            var table = ws.Cell(1 , 1).InsertTable(detalhes , true);
            table.Theme = XLTableTheme.TableStyleMedium2;

            FormatDateColumns(
                ws ,
                table ,
                "DataSolicitacao" ,
                "DataDisponibilidade" ,
                "DataRecolhimento" ,
                "DataDevolucao"
            );
            ws.Columns().AdjustToContents();

            return BuildExcelFileResult(wb , $"Glosa_Detalhes_{ano}-{mes:00}.xlsx");
        }
        catch (Exception error)
        {
            Alerta.TratamentoErroComLinha("GlosaController.cs" , "ExportDetalhes" , error);
            return StatusCode(500);
        }
    }

    // ambas as abas
    [HttpGet("export")]
    [Produces("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")]
    public IActionResult ExportAmbos(
        [FromQuery] Guid contratoId ,
        [FromQuery] int mes ,
        [FromQuery] int ano
    )
    {
        try
        {
            var resumo = _service.ListarResumo(contratoId , mes , ano).ToList();
            var detalhes = _service.ListarDetalhes(contratoId , mes , ano).ToList();

            using var wb = new XLWorkbook();

            var wsResumo = wb.Worksheets.Add("Resumo");
            var tbResumo = wsResumo.Cell(1 , 1).InsertTable(resumo , true);
            tbResumo.Theme = XLTableTheme.TableStyleMedium2;
            FormatCurrencyColumns(
                wsResumo ,
                tbResumo ,
                "PrecoDiario" ,
                "PrecoTotalMensal" ,
                "Glosa" ,
                "ValorParaAteste"
            );
            wsResumo.Columns().AdjustToContents();

            var wsDet = wb.Worksheets.Add("Detalhes");
            var tbDet = wsDet.Cell(1 , 1).InsertTable(detalhes , true);
            tbDet.Theme = XLTableTheme.TableStyleMedium2;
            FormatDateColumns(
                wsDet ,
                tbDet ,
                "DataSolicitacao" ,
                "DataDisponibilidade" ,
                "DataRecolhimento" ,
                "DataDevolucao"
            );
            wsDet.Columns().AdjustToContents();

            return BuildExcelFileResult(wb , $"Glosa_{ano}-{mes:00}.xlsx");
        }
        catch (Exception error)
        {
            Alerta.TratamentoErroComLinha("GlosaController.cs" , "ExportAmbos" , error);
            return StatusCode(500);
        }
    }

    // ===================== HELPERS =====================

    private static FileContentResult BuildExcelFileResult(XLWorkbook wb , string fileName)
    {
        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        return new FileContentResult(
            ms.ToArray() ,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        {
            FileDownloadName = fileName ,
        };
    }

    private static void FormatCurrencyColumns(
        IXLWorksheet ws ,
        IXLTable table ,
        params string[] headerNames
    )
    {
        var headers =
            headerNames
                ?.Where(h => !string.IsNullOrWhiteSpace(h))
                .Select(h => h.Trim())
                .ToHashSet(StringComparer.OrdinalIgnoreCase)
            ?? new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var cell in table.HeadersRow().Cells())
            if (headers.Contains(cell.GetString().Trim()))
                ws.Column(cell.Address.ColumnNumber).Style.NumberFormat.Format = "R$ #,##0.00";
    }

    private static void FormatDateColumns(
        IXLWorksheet ws ,
        IXLTable table ,
        params string[] headerNames
    )
    {
        var headers =
            headerNames
                ?.Where(h => !string.IsNullOrWhiteSpace(h))
                .Select(h => h.Trim())
                .ToHashSet(StringComparer.OrdinalIgnoreCase)
            ?? new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var cell in table.HeadersRow().Cells())
            if (headers.Contains(cell.GetString().Trim()))
                ws.Column(cell.Address.ColumnNumber).Style.DateFormat.Format = "dd/MM/yyyy";
    }
}
