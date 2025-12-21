using System;
using System.Collections.Generic;
using System.Linq;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace FrotiX.Services.Pdf;

/// <summary>
/// Service unificado para geração de PDFs do Dashboard Economildo
/// Adicione novos relatórios implementando métodos Gerar[Tipo]
/// </summary>
public class RelatorioEconomildoPdfService
{
    // Cores padrão
    private const string CorPrimary = "#1a5f7a";
    private const string CorSecondary = "#2d8f6f";
    private const string CorTexto = "#2d3748";
    private const string CorTextoLight = "#718096";
    private const string CorBorda = "#e2e8f0";
    
    // Cores MOB
    private const string CorPGR = "#3b82f6";
    private const string CorRodoviaria = "#f97316";
    private const string CorCefor = "#8b5cf6";
    
    // Cores Turno
    private const string CorManha = "#57c785";
    private const string CorTarde = "#3b82f6";
    private const string CorNoite = "#9f1239";

    // Cores Heatmap Viagens (verde)
    private static readonly string[] CoresHeatmapViagens = 
    {
        "#f8fafc", "#dcfce7", "#bbf7d0", "#86efac", "#4ade80", "#22c55e", "#16a34a"
    };

    // Cores Heatmap Passageiros (amarelo/laranja)
    private static readonly string[] CoresHeatmapPassageiros = 
    {
        "#fafaf9", "#fef3c7", "#fde68a", "#fcd34d", "#fbbf24", "#f59e0b", "#d97706"
    };

    public RelatorioEconomildoPdfService()
    {
        QuestPDF.Settings.License = LicenseType.Community;
    }

    #region ==================== HEATMAP VIAGENS ====================

    public byte[] GerarHeatmapViagens(HeatmapDto dados)
    {
        return GerarHeatmapBase(dados, CoresHeatmapViagens, "viagens");
    }

    #endregion

    #region ==================== HEATMAP PASSAGEIROS ====================

    public byte[] GerarHeatmapPassageiros(HeatmapDto dados)
    {
        return GerarHeatmapBase(dados, CoresHeatmapPassageiros, "passageiros");
    }

    #endregion

    #region ==================== HEATMAP BASE ====================

    private byte[] GerarHeatmapBase(HeatmapDto dados, string[] cores, string unidade)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape());
                page.Margin(25);
                page.DefaultTextStyle(x => x.FontFamily("Segoe UI").FontSize(10));

                page.Header().Element(c => HeaderPadrao(c, dados.Titulo, dados.Subtitulo, dados.Filtro));
                page.Content().Element(c => ConteudoHeatmap(c, dados, cores, unidade));
                page.Footer().Element(FooterPadrao);
            });
        });

        return document.GeneratePdf();
    }

    private void ConteudoHeatmap(IContainer container, HeatmapDto dados, string[] cores, string unidade)
    {
        container.PaddingVertical(10).Column(column =>
        {
            // Tabela Heatmap
            column.Item().Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.ConstantColumn(65);
                    for (int i = 0; i < 24; i++)
                        columns.RelativeColumn();
                });

                // Header
                table.Header(header =>
                {
                    header.Cell().Background(CorPrimary).Padding(4)
                        .Text("Dia/Hora").FontSize(8).Bold().FontColor("#ffffff");

                    for (int h = 0; h < 24; h++)
                    {
                        header.Cell().Background("#f1f5f9").Padding(3)
                            .AlignCenter().Text(h.ToString("00"))
                            .FontSize(7).Bold().FontColor(CorTextoLight);
                    }
                });

                // Linhas
                string[] dias = { "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo" };

                for (int d = 0; d < 7; d++)
                {
                    table.Cell().Background("#f8fafc").Padding(4)
                        .Text(dias[d]).FontSize(8).Bold().FontColor(CorTexto);

                    for (int h = 0; h < 24; h++)
                    {
                        var valor = dados.Valores[d, h];
                        var nivel = CalcularNivel(valor, dados.ValorMaximo, cores.Length - 1);
                        var cor = cores[nivel];
                        var corTexto = nivel >= 4 ? "#ffffff" : CorTexto;

                        var cell = table.Cell().Background(cor).Padding(2).AlignCenter();
                        if (valor > 0)
                            cell.Text(valor.ToString()).FontSize(7).Bold().FontColor(corTexto);
                    }
                }
            });

            // Legenda
            column.Item().PaddingTop(12).Row(row =>
            {
                row.RelativeItem().AlignCenter().Row(legendRow =>
                {
                    legendRow.AutoItem().AlignMiddle().PaddingRight(8)
                        .Text($"Menos {unidade}").FontSize(9).FontColor(CorTextoLight);

                    foreach (var cor in cores.Skip(1))
                    {
                        legendRow.ConstantItem(22).Height(14).Background(cor);
                    }

                    legendRow.AutoItem().AlignMiddle().PaddingLeft(8)
                        .Text($"Mais {unidade}").FontSize(9).FontColor(CorTextoLight);
                });
            });

            // Estatísticas
            column.Item().PaddingTop(15).Row(row =>
            {
                BoxEstatistica(row, SvgIcones.ChartLine, dados.ValorMaximo.ToString(), $"Pico ({dados.DiaPico} {dados.HoraPico}h)");
                BoxEstatistica(row, SvgIcones.Clock, dados.HorarioPicoManha, "Pico Manhã");
                BoxEstatistica(row, SvgIcones.CalendarDay, dados.DiaMaisMovimentado, "Dia + Movimentado");
                BoxEstatistica(row, SvgIcones.Stopwatch, dados.PeriodoOperacao, "Operação");
            });
        });
    }

    #endregion

    #region ==================== USUÁRIOS POR MÊS ====================

    public byte[] GerarUsuariosMes(GraficoBarrasDto dados)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape());
                page.Margin(25);
                page.DefaultTextStyle(x => x.FontFamily("Segoe UI").FontSize(10));

                page.Header().Element(c => HeaderPadrao(c, dados.Titulo, dados.Subtitulo, dados.Filtro));
                page.Content().Element(c => ConteudoBarrasVertical(c, dados, CorPrimary, CorSecondary));
                page.Footer().Element(FooterPadrao);
            });
        });

        return document.GeneratePdf();
    }

    #endregion

    #region ==================== USUÁRIOS POR TURNO ====================

    public byte[] GerarUsuariosTurno(GraficoPizzaDto dados)
    {
        var coresTurno = new Dictionary<string, string>
        {
            { "Manhã", CorManha },
            { "Tarde", CorTarde },
            { "Noite", CorNoite }
        };

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(25);
                page.DefaultTextStyle(x => x.FontFamily("Segoe UI").FontSize(10));

                page.Header().Element(c => HeaderPadrao(c, dados.Titulo, dados.Subtitulo, dados.Filtro));
                page.Content().Element(c => ConteudoPizza(c, dados, coresTurno));
                page.Footer().Element(FooterPadrao);
            });
        });

        return document.GeneratePdf();
    }

    #endregion

    #region ==================== COMPARATIVO MOB ====================

    public byte[] GerarComparativoMob(GraficoComparativoDto dados)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape());
                page.Margin(25);
                page.DefaultTextStyle(x => x.FontFamily("Segoe UI").FontSize(10));

                page.Header().Element(c => HeaderPadrao(c, dados.Titulo, dados.Subtitulo, dados.Filtro));
                page.Content().Element(c => ConteudoComparativo(c, dados));
                page.Footer().Element(FooterPadrao);
            });
        });

        return document.GeneratePdf();
    }

    private void ConteudoComparativo(IContainer container, GraficoComparativoDto dados)
    {
        container.PaddingVertical(10).Column(column =>
        {
            // Tabela comparativa
            column.Item().Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.ConstantColumn(80); // MOB
                    foreach (var _ in dados.Labels)
                        columns.RelativeColumn();
                    columns.ConstantColumn(70); // Total
                });

                // Header
                table.Header(header =>
                {
                    header.Cell().Background(CorPrimary).Padding(6)
                        .Text("MOB").FontSize(9).Bold().FontColor("#ffffff");

                    foreach (var label in dados.Labels)
                    {
                        header.Cell().Background(CorPrimary).Padding(6)
                            .AlignCenter().Text(label).FontSize(9).Bold().FontColor("#ffffff");
                    }

                    header.Cell().Background(CorPrimary).Padding(6)
                        .AlignCenter().Text("Total").FontSize(9).Bold().FontColor("#ffffff");
                });

                // Linhas por série
                foreach (var serie in dados.Series)
                {
                    table.Cell().Background(serie.Cor).Padding(6)
                        .Text(serie.Nome).FontSize(9).Bold().FontColor("#ffffff");

                    foreach (var valor in serie.Valores)
                    {
                        table.Cell().BorderBottom(1).BorderColor(CorBorda).Padding(6)
                            .AlignCenter().Text(valor.ToString("N0")).FontSize(9).FontColor(CorTexto);
                    }

                    table.Cell().Background("#f1f5f9").Padding(6)
                        .AlignCenter().Text(serie.Total.ToString("N0")).FontSize(9).Bold().FontColor(CorTexto);
                }
            });

            // Legenda
            column.Item().PaddingTop(20).Row(row =>
            {
                row.RelativeItem().AlignCenter().Row(legendRow =>
                {
                    foreach (var serie in dados.Series)
                    {
                        legendRow.AutoItem().PaddingHorizontal(10).Row(itemRow =>
                        {
                            itemRow.ConstantItem(14).Height(14).Background(serie.Cor);
                            itemRow.AutoItem().PaddingLeft(5).AlignMiddle()
                                .Text(serie.Nome).FontSize(9).FontColor(CorTexto);
                        });
                    }
                });
            });
        });
    }

    #endregion

    #region ==================== USUÁRIOS DIA SEMANA ====================

    public byte[] GerarUsuariosDiaSemana(GraficoBarrasDto dados)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(25);
                page.DefaultTextStyle(x => x.FontFamily("Segoe UI").FontSize(10));

                page.Header().Element(c => HeaderPadrao(c, dados.Titulo, dados.Subtitulo, dados.Filtro));
                page.Content().Element(c => ConteudoBarrasHorizontal(c, dados, CorPrimary));
                page.Footer().Element(FooterPadrao);
            });
        });

        return document.GeneratePdf();
    }

    #endregion

    #region ==================== DISTRIBUIÇÃO HORÁRIO ====================

    public byte[] GerarDistribuicaoHorario(GraficoBarrasDto dados)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape());
                page.Margin(25);
                page.DefaultTextStyle(x => x.FontFamily("Segoe UI").FontSize(10));

                page.Header().Element(c => HeaderPadrao(c, dados.Titulo, dados.Subtitulo, dados.Filtro));
                page.Content().Element(c => ConteudoBarrasVertical(c, dados, CorPrimary, CorSecondary));
                page.Footer().Element(FooterPadrao);
            });
        });

        return document.GeneratePdf();
    }

    #endregion

    #region ==================== TOP VEÍCULOS ====================

    public byte[] GerarTopVeiculos(GraficoBarrasDto dados)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(25);
                page.DefaultTextStyle(x => x.FontFamily("Segoe UI").FontSize(10));

                page.Header().Element(c => HeaderPadrao(c, dados.Titulo, dados.Subtitulo, dados.Filtro));
                page.Content().Element(c => ConteudoRanking(c, dados));
                page.Footer().Element(FooterPadrao);
            });
        });

        return document.GeneratePdf();
    }

    private void ConteudoRanking(IContainer container, GraficoBarrasDto dados)
    {
        container.PaddingVertical(10).Column(column =>
        {
            column.Item().Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.ConstantColumn(40);  // Posição
                    columns.RelativeColumn(2);    // Placa/Nome
                    columns.RelativeColumn(3);    // Barra
                    columns.ConstantColumn(80);   // Valor
                    columns.ConstantColumn(60);   // %
                });

                // Header
                table.Header(header =>
                {
                    header.Cell().Background(CorPrimary).Padding(8)
                        .AlignCenter().Text("#").FontSize(10).Bold().FontColor("#ffffff");
                    header.Cell().Background(CorPrimary).Padding(8)
                        .Text("Veículo").FontSize(10).Bold().FontColor("#ffffff");
                    header.Cell().Background(CorPrimary).Padding(8)
                        .Text("").FontSize(10);
                    header.Cell().Background(CorPrimary).Padding(8)
                        .AlignCenter().Text("Usuários").FontSize(10).Bold().FontColor("#ffffff");
                    header.Cell().Background(CorPrimary).Padding(8)
                        .AlignCenter().Text("%").FontSize(10).Bold().FontColor("#ffffff");
                });

                var maxValor = dados.Dados.Max(d => d.Valor);
                var pos = 1;

                foreach (var item in dados.Dados.OrderByDescending(d => d.Valor))
                {
                    var bgColor = pos % 2 == 0 ? "#f8fafc" : "#ffffff";
                    var barWidth = maxValor > 0 ? (float)item.Valor / maxValor : 0;

                    // Posição
                    table.Cell().Background(bgColor).Padding(8)
                        .AlignCenter().Text(pos.ToString()).FontSize(11).Bold().FontColor(CorPrimary);

                    // Label
                    table.Cell().Background(bgColor).Padding(8)
                        .Text(item.Label).FontSize(10).FontColor(CorTexto);

                    // Barra
                    table.Cell().Background(bgColor).Padding(8).PaddingVertical(12)
                        .Row(row =>
                        {
                            var barraCheia = Math.Max(0.01f, (float)barWidth);
                            var barraVazia = Math.Max(0.01f, (float)(1 - barWidth));
                            row.RelativeItem(barraCheia).Height(16).Background(CorPrimary);
                            row.RelativeItem(barraVazia).Height(16).Background("#e2e8f0");
                        });

                    // Valor
                    table.Cell().Background(bgColor).Padding(8)
                        .AlignCenter().Text(item.Valor.ToString("N0")).FontSize(10).Bold().FontColor(CorTexto);

                    // Percentual
                    table.Cell().Background(bgColor).Padding(8)
                        .AlignCenter().Text($"{item.Percentual:F1}%").FontSize(10).FontColor(CorTextoLight);

                    pos++;
                }
            });

            // Total
            column.Item().PaddingTop(15).AlignRight()
                .Text($"Total: {dados.Total:N0} usuários").FontSize(11).Bold().FontColor(CorPrimary);
        });
    }

    #endregion

    #region ==================== COMPONENTES COMPARTILHADOS ====================

    private void HeaderPadrao(IContainer container, string titulo, string subtitulo, FiltroEconomildoDto filtro)
    {
        container.Column(column =>
        {
            column.Item().Row(row =>
            {
                row.ConstantItem(45).AlignMiddle().Svg(SvgIcones.Bus);

                row.RelativeItem().PaddingLeft(10).Column(col =>
                {
                    col.Item().Text(titulo).FontSize(18).Bold().FontColor(CorTexto);
                    col.Item().Text(subtitulo).FontSize(11).FontColor(CorTextoLight);
                    col.Item().Text($"Período: {filtro.PeriodoFormatado}").FontSize(10).FontColor(CorTextoLight);
                });

                row.ConstantItem(160).AlignMiddle().AlignRight()
                    .Background(CorPrimary).Padding(8)
                    .Text("FrotiX - Gestão de Frotas").FontSize(9).FontColor("#ffffff").Bold();
            });

            column.Item().PaddingTop(8).LineHorizontal(2).LineColor(CorPrimary);
        });
    }

    private void FooterPadrao(IContainer container)
    {
        container.Row(row =>
        {
            row.RelativeItem().Text($"Câmara dos Deputados | {DateTime.Now:dd/MM/yyyy HH:mm}")
                .FontSize(8).FontColor(CorTextoLight);

            row.RelativeItem().AlignRight().Text(text =>
            {
                text.Span("Página ").FontSize(8).FontColor(CorTextoLight);
                text.CurrentPageNumber().FontSize(8).FontColor(CorTextoLight);
                text.Span(" de ").FontSize(8).FontColor(CorTextoLight);
                text.TotalPages().FontSize(8).FontColor(CorTextoLight);
            });
        });
    }

    private void BoxEstatistica(RowDescriptor row, string svg, string valor, string label)
    {
        row.RelativeItem().Border(1).BorderColor(CorBorda).Padding(8).Column(col =>
        {
            col.Item().Row(r =>
            {
                r.ConstantItem(20).Svg(svg);
                r.RelativeItem().AlignCenter().Text(valor).FontSize(14).Bold().FontColor(CorPrimary);
            });
            col.Item().AlignCenter().Text(label).FontSize(8).FontColor(CorTextoLight);
        });
    }

    private void ConteudoBarrasVertical(IContainer container, GraficoBarrasDto dados, string cor1, string cor2)
    {
        container.PaddingVertical(10).Column(column =>
        {
            // Tabela de dados
            column.Item().Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.RelativeColumn();    // Label
                    columns.RelativeColumn(2);   // Barra
                    columns.ConstantColumn(80);  // Valor
                    columns.ConstantColumn(60);  // %
                });

                table.Header(header =>
                {
                    header.Cell().Background(cor1).Padding(8).Text(dados.EixoX).FontSize(10).Bold().FontColor("#ffffff");
                    header.Cell().Background(cor1).Padding(8).Text("").FontSize(10);
                    header.Cell().Background(cor1).Padding(8).AlignCenter().Text(dados.EixoY).FontSize(10).Bold().FontColor("#ffffff");
                    header.Cell().Background(cor1).Padding(8).AlignCenter().Text("%").FontSize(10).Bold().FontColor("#ffffff");
                });

                var maxValor = dados.Dados.Any() ? dados.Dados.Max(d => d.Valor) : 1;

                foreach (var item in dados.Dados)
                {
                    var barWidth = maxValor > 0 ? (float)item.Valor / maxValor : 0;

                    table.Cell().BorderBottom(1).BorderColor(CorBorda).Padding(8)
                        .Text(item.Label).FontSize(10).FontColor(CorTexto);

                    table.Cell().BorderBottom(1).BorderColor(CorBorda).Padding(8).PaddingVertical(10)
                        .Row(row =>
                        {
                            var barraCheia = Math.Max(0.01f, (float)barWidth);
                            var barraVazia = Math.Max(0.01f, (float)(1 - barWidth));
                            row.RelativeItem(barraCheia).Height(14).Background(cor1);
                            row.RelativeItem(barraVazia).Height(14).Background("#e2e8f0");
                        });

                    table.Cell().BorderBottom(1).BorderColor(CorBorda).Padding(8)
                        .AlignCenter().Text(item.Valor.ToString("N0")).FontSize(10).Bold().FontColor(CorTexto);

                    table.Cell().BorderBottom(1).BorderColor(CorBorda).Padding(8)
                        .AlignCenter().Text($"{item.Percentual:F1}%").FontSize(10).FontColor(CorTextoLight);
                }
            });

            column.Item().PaddingTop(15).AlignRight()
                .Text($"Total: {dados.Total:N0}").FontSize(11).Bold().FontColor(cor1);
        });
    }

    private void ConteudoBarrasHorizontal(IContainer container, GraficoBarrasDto dados, string cor)
    {
        ConteudoBarrasVertical(container, dados, cor, cor);
    }

    private void ConteudoPizza(IContainer container, GraficoPizzaDto dados, Dictionary<string, string> cores)
    {
        container.PaddingVertical(20).Column(column =>
        {
            // Cards por turno
            column.Item().Row(row =>
            {
                foreach (var item in dados.Dados)
                {
                    var cor = cores.GetValueOrDefault(item.Label, CorPrimary);

                    row.RelativeItem().Padding(10).Border(2).BorderColor(cor).Column(card =>
                    {
                        card.Item().Background(cor).Padding(10).AlignCenter()
                            .Text(item.Label).FontSize(14).Bold().FontColor("#ffffff");

                        card.Item().Padding(15).AlignCenter()
                            .Text(item.Valor.ToString("N0")).FontSize(28).Bold().FontColor(cor);

                        card.Item().PaddingBottom(10).AlignCenter()
                            .Text($"{item.Percentual:F1}%").FontSize(14).FontColor(CorTextoLight);
                    });
                }
            });

            // Total
            column.Item().PaddingTop(20).AlignCenter()
                .Text($"Total: {dados.Total:N0} usuários").FontSize(14).Bold().FontColor(CorPrimary);
        });
    }

    private int CalcularNivel(int valor, int maximo, int niveis)
    {
        if (valor == 0 || maximo == 0) return 0;
        var percentual = (double)valor / maximo;
        var nivel = (int)(percentual * niveis);
        return Math.Clamp(nivel, 1, niveis);
    }

    #endregion
}
