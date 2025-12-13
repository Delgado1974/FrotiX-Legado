using FrotiX.Data;
using FrotiX.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Syncfusion.Drawing;
using Syncfusion.Pdf;
using Syncfusion.Pdf.Graphics;
using Syncfusion.Pdf.Grid;

namespace FrotiX.Pages.Viagens
{
    [Authorize]
    public class ExportarParaPDFModel : PageModel
    {
        private readonly FrotiXDbContext _context;

        public ExportarParaPDFModel(FrotiXDbContext context)
        {
            _context = context;
        }

        public class ExportarPDFRequest
        {
            public DateTime DataInicio { get; set; }
            public DateTime DataFim { get; set; }
            public Dictionary<string , string> Graficos { get; set; }
        }

        public async Task<IActionResult> OnPostAsync([FromBody] ExportarPDFRequest request)
        {
            try
            {
                var dataInicio = request.DataInicio;
                var dataFim = request.DataFim;
                var graficos = request.Graficos ?? new Dictionary<string , string>();

                // Cria o documento PDF
                using (PdfDocument document = new PdfDocument())
                {
                    // Configuração da página A4
                    document.PageSettings.Size = PdfPageSize.A4;
                    document.PageSettings.Margins.All = 40;

                    // Página 1: Estatísticas Gerais com Gráficos
                    await CriarPagina1EstatisticasComGraficos(document , dataInicio , dataFim , graficos);

                    // Página 2: Rankings com Gráficos
                    await CriarPagina2RankingsComGraficos(document , dataInicio , dataFim , graficos);

                    // Página 3: Complementos com Gráficos
                    await CriarPagina3ComplementosComGraficos(document , dataInicio , dataFim , graficos);

                    // Salva o PDF em MemoryStream
                    using (MemoryStream stream = new MemoryStream())
                    {
                        document.Save(stream);
                        stream.Position = 0;

                        // Nome do arquivo
                        string nomeArquivo = $"Dashboard_Viagens_{dataInicio:dd-MM-yyyy}_a_{dataFim:dd-MM-yyyy}.pdf";

                        // Retorna o PDF para download
                        return File(stream.ToArray() , "application/pdf" , nomeArquivo);
                    }
                }
            }
            catch (Exception ex)
            {
                return BadRequest($"Erro ao gerar PDF: {ex.Message}");
            }
        }

        public async Task<IActionResult> OnGetAsync(DateTime? dataInicio , DateTime? dataFim)
        {
            try
            {
                // Define período padrão (últimos 30 dias)
                if (!dataInicio.HasValue || !dataFim.HasValue)
                {
                    dataFim = DateTime.Now.Date.AddDays(1).AddSeconds(-1);
                    dataInicio = dataFim.Value.AddDays(-30);
                }

                // Cria o documento PDF
                using (PdfDocument document = new PdfDocument())
                {
                    // Configuração da página A4
                    document.PageSettings.Size = PdfPageSize.A4;
                    document.PageSettings.Margins.All = 40;

                    // Página 1: Estatísticas Gerais (sem gráficos)
                    await CriarPagina1Estatisticas(document , dataInicio.Value , dataFim.Value);

                    // Página 2: Rankings (sem gráficos)
                    await CriarPagina2Rankings(document , dataInicio.Value , dataFim.Value);

                    // Página 3: Complementos (sem gráficos)
                    await CriarPagina3Complementos(document , dataInicio.Value , dataFim.Value);

                    // Salva o PDF em MemoryStream
                    using (MemoryStream stream = new MemoryStream())
                    {
                        document.Save(stream);
                        stream.Position = 0;

                        // Nome do arquivo
                        string nomeArquivo = $"Dashboard_Viagens_{dataInicio.Value:dd-MM-yyyy}_a_{dataFim.Value:dd-MM-yyyy}.pdf";

                        // Retorna o PDF para download
                        return File(stream.ToArray() , "application/pdf" , nomeArquivo);
                    }
                }
            }
            catch (Exception ex)
            {
                return BadRequest($"Erro ao gerar PDF: {ex.Message}");
            }
        }

        #region Página 1: Estatísticas COM Gráficos

        private async Task CriarPagina1EstatisticasComGraficos(PdfDocument document , DateTime dataInicio , DateTime dataFim , Dictionary<string , string> graficos)
        {
            PdfPage page = document.Pages.Add();
            PdfGraphics graphics = page.Graphics;

            // Fontes
            PdfFont titleFont = new PdfStandardFont(PdfFontFamily.Helvetica , 16 , PdfFontStyle.Bold);
            PdfFont headerFont = new PdfStandardFont(PdfFontFamily.Helvetica , 12 , PdfFontStyle.Bold);
            PdfFont regularFont = new PdfStandardFont(PdfFontFamily.Helvetica , 10);
            PdfFont smallFont = new PdfStandardFont(PdfFontFamily.Helvetica , 8);
            PdfFont cardTitleFont = new PdfStandardFont(PdfFontFamily.Helvetica , 9 , PdfFontStyle.Bold);
            PdfFont cardValueFont = new PdfStandardFont(PdfFontFamily.Helvetica , 16 , PdfFontStyle.Bold);

            // Cores
            PdfColor primaryColor = new PdfColor(13 , 110 , 253);
            PdfColor gradientStartColor = new PdfColor(13 , 110 , 253);
            PdfColor gradientEndColor = new PdfColor(102 , 126 , 234);
            PdfColor greenColor = new PdfColor(22 , 163 , 74);
            PdfColor redColor = new PdfColor(220 , 38 , 38);
            PdfColor yellowColor = new PdfColor(245 , 158 , 11);
            PdfColor blueColor = new PdfColor(13 , 110 , 253);
            PdfColor grayColor = new PdfColor(108 , 117 , 125);
            PdfColor lightGray = new PdfColor(248 , 249 , 250);

            float yPosition = 0;

            // ===== CABEÇALHO COM GRADIENTE =====
            RectangleF headerRect = new RectangleF(0 , 0 , page.GetClientSize().Width , 60);
            PdfLinearGradientBrush gradientBrush = new PdfLinearGradientBrush(
                new PointF(0 , 0) ,
                new PointF(page.GetClientSize().Width , 0) ,
                gradientStartColor ,
                gradientEndColor
            );
            graphics.DrawRectangle(gradientBrush , headerRect);

            // Título no cabeçalho
            graphics.DrawString("DASHBOARD DE VIAGENS" , titleFont , new PdfSolidBrush(new PdfColor(255 , 255 , 255)) ,
                new PointF(15 , 15));

            // Período no cabeçalho
            string periodo = $"Período: {dataInicio:dd/MM/yyyy} a {dataFim:dd/MM/yyyy}";
            graphics.DrawString(periodo , regularFont , new PdfSolidBrush(new PdfColor(255 , 255 , 255)) ,
                new PointF(15 , 38));

            yPosition = 80;

            // ===== BUSCA DADOS DO BANCO =====
            var viagens = await _context.Viagem
                .Where(v => v.DataInicial >= dataInicio && v.DataInicial <= dataFim)
                .ToListAsync();

            int totalViagens = viagens.Count;
            int viagensFinalizadas = viagens.Count(v => v.Status == "Realizada");
            int viagensEmAndamento = viagens.Count(v => v.Status == "Aberta");
            int viagensAgendadas = viagens.Count(v => v.Status == "Agendada");
            int viagensCanceladas = viagens.Count(v => v.Status == "Cancelada");

            // CUSTO TOTAL: APENAS CustoCombustivel + CustoLavador + CustoMotorista
            decimal custoTotal = (decimal)(viagens.Sum(v => v.CustoCombustivel ?? 0) +
                                  viagens.Sum(v => v.CustoLavador ?? 0) +
                                  viagens.Sum(v => v.CustoMotorista ?? 0));

            decimal custoMedio = totalViagens > 0 ? custoTotal / totalViagens : 0;
            double? kmTotal = viagens.Sum(v => v.KmFinal ?? 0) - viagens.Sum(v => v.KmInicial ?? 0);

            // ===== CARDS VISUAIS (2x2) =====
            graphics.DrawString("ESTATÍSTICAS GERAIS" , headerFont , new PdfSolidBrush(primaryColor) , new PointF(0 , yPosition));
            yPosition += 25;

            float cardWidth = (page.GetClientSize().Width - 10) / 2; // 10 = espaçamento entre cards
            float cardHeight = 60;
            float spacing = 10;

            // Card 1: Total de Viagens (Azul)
            DesenharCard(graphics , new RectangleF(0 , yPosition , cardWidth , cardHeight) ,
                "TOTAL DE VIAGENS" , totalViagens.ToString("N0") ,
                blueColor , new PdfColor(255 , 255 , 255) , cardTitleFont , cardValueFont);

            // Card 2: Custo Total (Verde)
            DesenharCard(graphics , new RectangleF(cardWidth + spacing , yPosition , cardWidth , cardHeight) ,
                "CUSTO TOTAL" , $"R$ {custoTotal:N2}" ,
                greenColor , new PdfColor(255 , 255 , 255) , cardTitleFont , cardValueFont);

            yPosition += cardHeight + spacing;

            // Card 3: Custo Médio (Laranja)
            DesenharCard(graphics , new RectangleF(0 , yPosition , cardWidth , cardHeight) ,
                "CUSTO MÉDIO" , $"R$ {custoMedio:N2}" ,
                new PdfColor(217 , 119 , 6) , new PdfColor(255 , 255 , 255) , cardTitleFont , cardValueFont);

            // Card 4: KM Total (Roxo)
            DesenharCard(graphics , new RectangleF(cardWidth + spacing , yPosition , cardWidth , cardHeight) ,
                "QUILOMETRAGEM TOTAL" , $"{kmTotal:N0} km" ,
                new PdfColor(157 , 78 , 221) , new PdfColor(255 , 255 , 255) , cardTitleFont , cardValueFont);

            yPosition += cardHeight + 20;

            // ===== DETALHAMENTO POR STATUS =====
            graphics.DrawString("VIAGENS POR STATUS" , headerFont , new PdfSolidBrush(primaryColor) , new PointF(0 , yPosition));
            yPosition += 20;

            // Estrutura: Tabela à esquerda, Gráfico à direita
            float tabelaWidth = page.GetClientSize().Width * 0.45f;
            float graficoWidth = page.GetClientSize().Width * 0.50f;
            float graficoSpacing = page.GetClientSize().Width * 0.05f;

            // Tabela de Status
            PdfGrid gridStatus = new PdfGrid();
            gridStatus.Columns.Add(3);
            gridStatus.Columns[0].Width = tabelaWidth * 0.50f; // Status
            gridStatus.Columns[1].Width = tabelaWidth * 0.25f; // Total
            gridStatus.Columns[2].Width = tabelaWidth * 0.25f; // %

            // Header
            PdfGridRow headerRow = gridStatus.Headers.Add(1)[0];
            headerRow.Cells[0].Value = "Status";
            headerRow.Cells[1].Value = "Total";
            headerRow.Cells[2].Value = "%";

            // Dados
            var statusData = new[]
            {
                new { Nome = "Finalizadas", Total = viagensFinalizadas, Cor = greenColor },
                new { Nome = "Em Andamento", Total = viagensEmAndamento, Cor = blueColor },
                new { Nome = "Agendadas", Total = viagensAgendadas, Cor = yellowColor },
                new { Nome = "Canceladas", Total = viagensCanceladas, Cor = redColor }
            };

            foreach (var status in statusData)
            {
                PdfGridRow row = gridStatus.Rows.Add();
                row.Cells[0].Value = status.Nome;
                row.Cells[1].Value = status.Total.ToString("N0");
                double percentual = totalViagens > 0 ? (status.Total * 100.0 / totalViagens) : 0;
                row.Cells[2].Value = $"{percentual:N1}%";

                // Colorir o nome do status
                row.Cells[0].Style.TextBrush = new PdfSolidBrush(status.Cor);
                row.Cells[0].Style.Font = new PdfStandardFont(PdfFontFamily.Helvetica , 9 , PdfFontStyle.Bold);
            }

            ApplyGridStyle(gridStatus , primaryColor , lightGray);
            var result = gridStatus.Draw(page , new PointF(0 , yPosition));

            // Gráfico de Status à direita (se disponível)
            if (graficos.ContainsKey("status") && !string.IsNullOrEmpty(graficos["status"]))
            {
                try
                {
                    string base64Image = graficos["status"].Contains(",") ? graficos["status"].Split(',')[1] : graficos["status"];
                    byte[] imageBytes = Convert.FromBase64String(base64Image);

                    using (MemoryStream ms = new MemoryStream(imageBytes))
                    {
                        PdfBitmap bitmap = new PdfBitmap(ms);
                        float graficoX = tabelaWidth + graficoSpacing;
                        float graficoY = yPosition;
                        float graficoHeight = result.Bounds.Height;

                        // Desenha o gráfico mantendo proporção
                        float aspectRatio = (float)bitmap.Width / bitmap.Height;
                        float targetWidth = graficoWidth;
                        float targetHeight = targetWidth / aspectRatio;

                        // Se altura calculada for maior que o espaço disponível, ajusta pela altura
                        if (targetHeight > graficoHeight)
                        {
                            targetHeight = graficoHeight;
                            targetWidth = targetHeight * aspectRatio;
                        }

                        graphics.DrawImage(bitmap , new RectangleF(graficoX , graficoY , targetWidth , targetHeight));
                    }
                }
                catch (Exception ex)
                {
                    // Se falhar, não desenha o gráfico
                    Console.WriteLine($"Erro ao desenhar gráfico de status: {ex.Message}");
                }
            }

            yPosition = result.Bounds.Bottom + 20;

            // ===== RODAPÉ =====
            string rodape = $"Gerado em: {DateTime.Now:dd/MM/yyyy HH:mm} | FrotiX - Sistema de Gestão de Frotas | Página 1/3";
            graphics.DrawString(rodape , smallFont , new PdfSolidBrush(grayColor) ,
                new PointF(0 , page.GetClientSize().Height - 20));
        }

        #endregion Página 1: Estatísticas COM Gráficos

        #region Página 2: Rankings COM Gráficos

        private async Task CriarPagina2RankingsComGraficos(PdfDocument document , DateTime dataInicio , DateTime dataFim , Dictionary<string , string> graficos)
        {
            PdfPage page = document.Pages.Add();
            PdfGraphics graphics = page.Graphics;

            // Fontes
            PdfFont titleFont = new PdfStandardFont(PdfFontFamily.Helvetica , 16 , PdfFontStyle.Bold);
            PdfFont headerFont = new PdfStandardFont(PdfFontFamily.Helvetica , 12 , PdfFontStyle.Bold);
            PdfFont regularFont = new PdfStandardFont(PdfFontFamily.Helvetica , 10);
            PdfFont smallFont = new PdfStandardFont(PdfFontFamily.Helvetica , 8);

            // Cores
            PdfColor primaryColor = new PdfColor(13 , 110 , 253);
            PdfColor greenColor = new PdfColor(22 , 163 , 74);
            PdfColor laranja = new PdfColor(217 , 119 , 6);
            PdfColor roxo = new PdfColor(157 , 78 , 221);
            PdfColor grayColor = new PdfColor(108 , 117 , 125);
            PdfColor lightGray = new PdfColor(248 , 249 , 250);

            float yPosition = 0;

            // ===== CABEÇALHO =====
            graphics.DrawString("RANKINGS DE VIAGENS" , titleFont , new PdfSolidBrush(primaryColor) , new PointF(0 , yPosition));
            yPosition += 25;

            // ===== TOP 10 MOTORISTAS =====
            graphics.DrawString("TOP 10 MOTORISTAS" , headerFont , new PdfSolidBrush(greenColor) , new PointF(0 , yPosition));
            yPosition += 20;

            yPosition = await DesenharRankingComGrafico(page , graphics , yPosition , dataInicio , dataFim , graficos , "motoristas" , greenColor , lightGray);

            // ===== TOP 10 VEÍCULOS =====
            yPosition += 20; // Espaçamento
            graphics.DrawString("TOP 10 VEÍCULOS" , headerFont , new PdfSolidBrush(laranja) , new PointF(0 , yPosition));
            yPosition += 20;

            yPosition = await DesenharRankingComGrafico(page , graphics , yPosition , dataInicio , dataFim , graficos , "veiculos" , laranja , lightGray);

            // ===== TOP 10 FINALIDADES =====
            yPosition += 20; // Espaçamento

            // Verifica se precisa de nova página
            if (yPosition > page.GetClientSize().Height - 250)
            {
                // Rodapé da página atual
                string rodape1 = $"Gerado em: {DateTime.Now:dd/MM/yyyy HH:mm} | FrotiX - Sistema de Gestão de Frotas | Página 2/3";
                graphics.DrawString(rodape1 , smallFont , new PdfSolidBrush(grayColor) ,
                    new PointF(0 , page.GetClientSize().Height - 20));

                // Nova página
                page = document.Pages.Add();
                graphics = page.Graphics;
                yPosition = 0;
            }

            graphics.DrawString("TOP 10 FINALIDADES" , headerFont , new PdfSolidBrush(roxo) , new PointF(0 , yPosition));
            yPosition += 20;

            yPosition = await DesenharRankingComGrafico(page , graphics , yPosition , dataInicio , dataFim , graficos , "finalidades" , roxo , lightGray);

            // ===== RODAPÉ =====
            string rodape = $"Gerado em: {DateTime.Now:dd/MM/yyyy HH:mm} | FrotiX - Sistema de Gestão de Frotas | Página 2/3";
            graphics.DrawString(rodape , smallFont , new PdfSolidBrush(grayColor) ,
                new PointF(0 , page.GetClientSize().Height - 20));
        }

        private async Task<float> DesenharRankingComGrafico(PdfPage page , PdfGraphics graphics , float yPosition ,
            DateTime dataInicio , DateTime dataFim , Dictionary<string , string> graficos ,
            string tipoGrafico , PdfColor corHeader , PdfColor corAlternada)
        {
            float tabelaWidth = page.GetClientSize().Width * 0.45f;
            float graficoWidth = page.GetClientSize().Width * 0.50f;
            float graficoSpacing = page.GetClientSize().Width * 0.05f;

            PdfGrid grid = new PdfGrid();
            grid.Columns.Add(2);
            grid.Columns[0].Width = tabelaWidth * 0.70f; // Nome
            grid.Columns[1].Width = tabelaWidth * 0.30f; // Total

            // Header
            PdfGridRow headerRow = grid.Headers.Add(1)[0];

            if (tipoGrafico == "motoristas")
            {
                headerRow.Cells[0].Value = "Motorista";
                headerRow.Cells[1].Value = "Viagens";

                // Busca dados
                var viagens = await _context.Viagem
                    .Where(v => v.DataInicial >= dataInicio && v.DataInicial <= dataFim)
                    .Include(v => v.Motorista)
                    .ToListAsync();

                var topMotoristas = viagens
                    .Where(v => v.Motorista != null)
                    .GroupBy(v => new { v.MotoristaId , Nome = v.Motorista.Nome })
                    .Select(g => new
                    {
                        Motorista = g.Key.Nome ?? "Não informado" ,
                        Total = g.Count()
                    })
                    .OrderByDescending(x => x.Total)
                    .Take(10)
                    .ToList();

                // Dados
                foreach (var item in topMotoristas)
                {
                    PdfGridRow row = grid.Rows.Add();
                    row.Cells[0].Value = item.Motorista;
                    row.Cells[1].Value = item.Total.ToString("N0");
                }
            }
            else if (tipoGrafico == "veiculos")
            {
                headerRow.Cells[0].Value = "Veículo";
                headerRow.Cells[1].Value = "Viagens";

                // Busca dados USANDO ViewVeiculos
                var viagens = await _context.Viagem
                    .Where(v => v.DataInicial >= dataInicio && v.DataInicial <= dataFim && v.VeiculoId != null)
                    .ToListAsync();

                var veiculoIds = viagens.Select(v => v.VeiculoId.Value).Distinct().ToList();

                var veiculos = await _context.ViewVeiculos
                    .Where(vv => veiculoIds.Contains(vv.VeiculoId))
                    .ToListAsync();

                var topVeiculos = viagens
                    .Where(v => v.VeiculoId != null)
                    .GroupBy(v => v.VeiculoId.Value)
                    .Select(g => new
                    {
                        VeiculoId = g.Key ,
                        Total = g.Count()
                    })
                    .Join(veiculos ,
                        v => v.VeiculoId ,
                        vv => vv.VeiculoId ,
                        (v , vv) => new
                        {
                            Veiculo = vv.MarcaModelo ?? "Não informado" ,
                            Total = v.Total
                        })
                    .OrderByDescending(x => x.Total)
                    .Take(10)
                    .ToList();

                // Dados
                foreach (var item in topVeiculos)
                {
                    PdfGridRow row = grid.Rows.Add();
                    row.Cells[0].Value = item.Veiculo;
                    row.Cells[1].Value = item.Total.ToString("N0");
                }
            }
            else if (tipoGrafico == "finalidades")
            {
                headerRow.Cells[0].Value = "Finalidade";
                headerRow.Cells[1].Value = "Viagens";

                // Busca dados
                var viagens = await _context.Viagem
                    .Where(v => v.DataInicial >= dataInicio && v.DataInicial <= dataFim)
                    .ToListAsync();

                var topFinalidades = viagens
                    .Where(v => !string.IsNullOrEmpty(v.Finalidade))
                    .GroupBy(v => new { v.Finalidade , Descricao = v.Finalidade })
                    .Select(g => new
                    {
                        Finalidade = g.Key.Descricao ?? "Não informado" ,
                        Total = g.Count()
                    })
                    .OrderByDescending(x => x.Total)
                    .Take(10)
                    .ToList();

                // Dados
                foreach (var item in topFinalidades)
                {
                    PdfGridRow row = grid.Rows.Add();
                    row.Cells[0].Value = item.Finalidade;
                    row.Cells[1].Value = item.Total.ToString("N0");
                }
            }

            ApplyGridStyle(grid , corHeader , corAlternada);
            var result = grid.Draw(page , new PointF(0 , yPosition));

            // Gráfico à direita (se disponível)
            if (graficos.ContainsKey(tipoGrafico) && !string.IsNullOrEmpty(graficos[tipoGrafico]))
            {
                try
                {
                    string base64Image = graficos[tipoGrafico].Contains(",") ? graficos[tipoGrafico].Split(',')[1] : graficos[tipoGrafico];
                    byte[] imageBytes = Convert.FromBase64String(base64Image);

                    using (MemoryStream ms = new MemoryStream(imageBytes))
                    {
                        PdfBitmap bitmap = new PdfBitmap(ms);
                        float graficoX = tabelaWidth + graficoSpacing;
                        float graficoY = yPosition;
                        float graficoHeight = result.Bounds.Height;

                        // Desenha o gráfico mantendo proporção
                        float aspectRatio = (float)bitmap.Width / bitmap.Height;
                        float targetWidth = graficoWidth;
                        float targetHeight = targetWidth / aspectRatio;

                        // Se altura calculada for maior que o espaço disponível, ajusta pela altura
                        if (targetHeight > graficoHeight)
                        {
                            targetHeight = graficoHeight;
                            targetWidth = targetHeight * aspectRatio;
                        }

                        graphics.DrawImage(bitmap , new RectangleF(graficoX , graficoY , targetWidth , targetHeight));
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Erro ao desenhar gráfico {tipoGrafico}: {ex.Message}");
                }
            }

            return result.Bounds.Bottom;
        }

        #endregion Página 2: Rankings COM Gráficos

        #region Página 3: Complementos COM Gráficos

        private async Task CriarPagina3ComplementosComGraficos(PdfDocument document , DateTime dataInicio , DateTime dataFim , Dictionary<string , string> graficos)
        {
            PdfPage page = document.Pages.Add();
            PdfGraphics graphics = page.Graphics;

            // Fontes
            PdfFont titleFont = new PdfStandardFont(PdfFontFamily.Helvetica , 16 , PdfFontStyle.Bold);
            PdfFont headerFont = new PdfStandardFont(PdfFontFamily.Helvetica , 12 , PdfFontStyle.Bold);
            PdfFont regularFont = new PdfStandardFont(PdfFontFamily.Helvetica , 10);
            PdfFont smallFont = new PdfStandardFont(PdfFontFamily.Helvetica , 8);

            // Cores
            PdfColor primaryColor = new PdfColor(13 , 110 , 253);
            PdfColor greenColor = new PdfColor(22 , 163 , 74);
            PdfColor rosaColor = new PdfColor(236 , 72 , 153);
            PdfColor amareloColor = new PdfColor(245 , 158 , 11);
            PdfColor grayColor = new PdfColor(108 , 117 , 125);
            PdfColor lightGray = new PdfColor(248 , 249 , 250);

            float yPosition = 0;

            // ===== CABEÇALHO =====
            graphics.DrawString("INFORMAÇÕES COMPLEMENTARES" , titleFont , new PdfSolidBrush(primaryColor) , new PointF(0 , yPosition));
            yPosition += 25;

            // ===== TOP 10 VIAGENS MAIS CARAS =====
            graphics.DrawString("TOP 10 VIAGENS MAIS CARAS" , headerFont , new PdfSolidBrush(primaryColor) , new PointF(0 , yPosition));
            yPosition += 20;

            // Busca viagens USANDO ViewVeiculos para MarcaModelo
            var viagensComVeiculos = await _context.Viagem
                .Where(v => v.DataInicial >= dataInicio && v.DataInicial <= dataFim)
                .Include(v => v.Motorista)
                .ToListAsync();

            var veiculoIds = viagensComVeiculos.Where(v => v.VeiculoId != null).Select(v => v.VeiculoId.Value).Distinct().ToList();
            var veiculos = await _context.ViewVeiculos.Where(vv => veiculoIds.Contains(vv.VeiculoId)).ToListAsync();

            var viagensMaisCaras = viagensComVeiculos
                .Select(v => new
                {
                    v.NoFichaVistoria ,
                    v.DataInicial ,
                    v.DataFinal ,
                    NomeMotorista = v.Motorista != null ? v.Motorista.Nome : null ,
                    DescricaoVeiculo = v.VeiculoId != null ? veiculos.FirstOrDefault(vv => vv.VeiculoId == v.VeiculoId.Value)?.MarcaModelo : null ,
                    CustoViagem = (v.CustoCombustivel ?? 0) + (v.CustoLavador ?? 0) + (v.CustoMotorista ?? 0)
                })
                .OrderByDescending(v => v.CustoViagem)
                .Take(10)
                .ToList();

            PdfGrid gridViagensCaras = new PdfGrid();
            gridViagensCaras.Columns.Add(7);
            gridViagensCaras.Columns[0].Width = 25;  // #
            gridViagensCaras.Columns[1].Width = 60;  // Nº Ficha
            gridViagensCaras.Columns[2].Width = 75;  // Data Inicial
            gridViagensCaras.Columns[3].Width = 75;  // Data Final
            gridViagensCaras.Columns[4].Width = 100; // Motorista
            gridViagensCaras.Columns[5].Width = 100; // Veículo
            gridViagensCaras.Columns[6].Width = 75;  // Custo

            // Header
            PdfGridRow headerRow = gridViagensCaras.Headers.Add(1)[0];
            headerRow.Cells[0].Value = "#";
            headerRow.Cells[1].Value = "Nº Ficha";
            headerRow.Cells[2].Value = "Data Inicial";
            headerRow.Cells[3].Value = "Data Final";
            headerRow.Cells[4].Value = "Motorista";
            headerRow.Cells[5].Value = "Veículo";
            headerRow.Cells[6].Value = "Custo Total";

            // Dados
            int contador = 1;
            foreach (var viagem in viagensMaisCaras)
            {
                PdfGridRow row = gridViagensCaras.Rows.Add();
                row.Cells[0].Value = contador.ToString();
                row.Cells[1].Value = viagem.NoFichaVistoria?.ToString() ?? "N/A";
                row.Cells[2].Value = viagem.DataInicial?.ToString("dd/MM/yyyy") ?? "N/A";
                row.Cells[3].Value = viagem.DataFinal?.ToString("dd/MM/yyyy") ?? "N/A";
                row.Cells[4].Value = viagem.NomeMotorista ?? "Não informado";
                row.Cells[5].Value = viagem.DescricaoVeiculo ?? "Não informado";
                row.Cells[6].Value = $"R$ {viagem.CustoViagem:N2}";

                // Destaca custo em verde
                row.Cells[6].Style.TextBrush = new PdfSolidBrush(greenColor);
                row.Cells[6].Style.Font = new PdfStandardFont(PdfFontFamily.Helvetica , 9 , PdfFontStyle.Bold);

                contador++;
            }

            ApplyGridStyle(gridViagensCaras , primaryColor , lightGray);
            var result = gridViagensCaras.Draw(page , new PointF(0 , yPosition));
            yPosition = result.Bounds.Bottom + 20;

            // ===== TOP 10 REQUISITANTES =====
            graphics.DrawString("TOP 10 REQUISITANTES" , headerFont , new PdfSolidBrush(rosaColor) , new PointF(0 , yPosition));
            yPosition += 20;

            yPosition = await DesenharRankingComGraficoSimples(page , graphics , yPosition , dataInicio , dataFim , graficos , "requisitantes" , rosaColor , lightGray);

            // ===== TOP 10 SETORES =====
            yPosition += 20;

            // Verifica se precisa de nova página
            if (yPosition > page.GetClientSize().Height - 250)
            {
                // Rodapé da página atual
                string rodape1 = $"Gerado em: {DateTime.Now:dd/MM/yyyy HH:mm} | FrotiX - Sistema de Gestão de Frotas | Página 3/3";
                graphics.DrawString(rodape1 , smallFont , new PdfSolidBrush(grayColor) ,
                    new PointF(0 , page.GetClientSize().Height - 20));

                // Nova página
                page = document.Pages.Add();
                graphics = page.Graphics;
                yPosition = 0;
            }

            graphics.DrawString("TOP 10 SETORES" , headerFont , new PdfSolidBrush(amareloColor) , new PointF(0 , yPosition));
            yPosition += 20;

            yPosition = await DesenharRankingComGraficoSimples(page , graphics , yPosition , dataInicio , dataFim , graficos , "setores" , amareloColor , lightGray);

            // ===== RODAPÉ =====
            string rodape = $"Gerado em: {DateTime.Now:dd/MM/yyyy HH:mm} | FrotiX - Sistema de Gestão de Frotas | Página 3/3";
            graphics.DrawString(rodape , smallFont , new PdfSolidBrush(grayColor) ,
                new PointF(0 , page.GetClientSize().Height - 20));
        }

        private async Task<float> DesenharRankingComGraficoSimples(PdfPage page , PdfGraphics graphics , float yPosition ,
            DateTime dataInicio , DateTime dataFim , Dictionary<string , string> graficos ,
            string tipoGrafico , PdfColor corHeader , PdfColor corAlternada)
        {
            float tabelaWidth = page.GetClientSize().Width * 0.45f;
            float graficoWidth = page.GetClientSize().Width * 0.50f;
            float graficoSpacing = page.GetClientSize().Width * 0.05f;

            PdfGrid grid = new PdfGrid();
            grid.Columns.Add(2);
            grid.Columns[0].Width = tabelaWidth * 0.70f; // Nome
            grid.Columns[1].Width = tabelaWidth * 0.30f; // Total

            // Header
            PdfGridRow headerRow = grid.Headers.Add(1)[0];

            if (tipoGrafico == "requisitantes")
            {
                headerRow.Cells[0].Value = "Requisitante";
                headerRow.Cells[1].Value = "Viagens";

                // Busca dados
                var viagens = await _context.Viagem
                    .Where(v => v.DataInicial >= dataInicio && v.DataInicial <= dataFim && v.RequisitanteId != null)
                    .Include(v => v.Requisitante)
                    .ToListAsync();

                var topRequisitantes = viagens
                    .Where(v => v.Requisitante != null && v.Requisitante.Nome != "Coordenação de Transportes (Ctran)")
                    .GroupBy(v => new { v.RequisitanteId , Nome = v.Requisitante.Nome })
                    .Select(g => new
                    {
                        Requisitante = g.Key.Nome ?? "Não informado" ,
                        Total = g.Count()
                    })
                    .OrderByDescending(x => x.Total)
                    .Take(10)
                    .ToList();

                // Dados
                foreach (var item in topRequisitantes)
                {
                    PdfGridRow row = grid.Rows.Add();
                    row.Cells[0].Value = item.Requisitante;
                    row.Cells[1].Value = item.Total.ToString("N0");
                }
            }
            else if (tipoGrafico == "setores")
            {
                headerRow.Cells[0].Value = "Setor";
                headerRow.Cells[1].Value = "Viagens";

                // Busca dados
                var viagens = await _context.Viagem
                    .Where(v => v.DataInicial >= dataInicio && v.DataInicial <= dataFim && v.SetorSolicitanteId != null)
                    .Include(v => v.SetorSolicitante)
                    .ToListAsync();

                var topSetores = viagens
                    .Where(v => v.SetorSolicitante != null && v.SetorSolicitante.Nome != "Coordenação de Transportes")
                    .GroupBy(v => new { v.SetorSolicitanteId , Nome = v.SetorSolicitante.Nome })
                    .Select(g => new
                    {
                        Setor = g.Key.Nome ?? "Não informado" ,
                        Total = g.Count()
                    })
                    .OrderByDescending(x => x.Total)
                    .Take(10)
                    .ToList();

                // Dados
                foreach (var item in topSetores)
                {
                    PdfGridRow row = grid.Rows.Add();
                    row.Cells[0].Value = item.Setor;
                    row.Cells[1].Value = item.Total.ToString("N0");
                }
            }

            ApplyGridStyle(grid , corHeader , corAlternada);
            var result = grid.Draw(page , new PointF(0 , yPosition));

            // Gráfico à direita (se disponível)
            if (graficos.ContainsKey(tipoGrafico) && !string.IsNullOrEmpty(graficos[tipoGrafico]))
            {
                try
                {
                    string base64Image = graficos[tipoGrafico].Contains(",") ? graficos[tipoGrafico].Split(',')[1] : graficos[tipoGrafico];
                    byte[] imageBytes = Convert.FromBase64String(base64Image);

                    using (MemoryStream ms = new MemoryStream(imageBytes))
                    {
                        PdfBitmap bitmap = new PdfBitmap(ms);
                        float graficoX = tabelaWidth + graficoSpacing;
                        float graficoY = yPosition;
                        float graficoHeight = result.Bounds.Height;

                        // Desenha o gráfico mantendo proporção
                        float aspectRatio = (float)bitmap.Width / bitmap.Height;
                        float targetWidth = graficoWidth;
                        float targetHeight = targetWidth / aspectRatio;

                        // Se altura calculada for maior que o espaço disponível, ajusta pela altura
                        if (targetHeight > graficoHeight)
                        {
                            targetHeight = graficoHeight;
                            targetWidth = targetHeight * aspectRatio;
                        }

                        graphics.DrawImage(bitmap , new RectangleF(graficoX , graficoY , targetWidth , targetHeight));
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Erro ao desenhar gráfico {tipoGrafico}: {ex.Message}");
                }
            }

            return result.Bounds.Bottom;
        }

        #endregion Página 3: Complementos COM Gráficos

        #region Métodos Helper

        private void DesenharCard(PdfGraphics graphics , RectangleF rect , string titulo , string valor ,
            PdfColor corFundo , PdfColor corTexto , PdfFont tituloFont , PdfFont valorFont)
        {
            // Desenha fundo colorido
            graphics.DrawRectangle(new PdfSolidBrush(corFundo) , rect);

            // Desenha bordas (opcional)
            graphics.DrawRectangle(PdfPens.LightGray , rect);

            // Desenha título (top-center)
            SizeF tituloSize = tituloFont.MeasureString(titulo);
            float tituloX = rect.X + (rect.Width - tituloSize.Width) / 2;
            float tituloY = rect.Y + 10;
            graphics.DrawString(titulo , tituloFont , new PdfSolidBrush(corTexto) , new PointF(tituloX , tituloY));

            // Desenha valor (center-center)
            SizeF valorSize = valorFont.MeasureString(valor);
            float valorX = rect.X + (rect.Width - valorSize.Width) / 2;
            float valorY = rect.Y + (rect.Height - valorSize.Height) / 2 + 5;
            graphics.DrawString(valor , valorFont , new PdfSolidBrush(corTexto) , new PointF(valorX , valorY));
        }

        private void ApplyGridStyle(PdfGrid grid , PdfColor headerColor , PdfColor alternateRowColor)
        {
            // Estilo do header
            PdfGridCellStyle headerStyle = new PdfGridCellStyle();
            headerStyle.BackgroundBrush = new PdfSolidBrush(headerColor);
            headerStyle.TextBrush = new PdfSolidBrush(new PdfColor(255 , 255 , 255));
            headerStyle.Font = new PdfStandardFont(PdfFontFamily.Helvetica , 10 , PdfFontStyle.Bold);

            foreach (PdfGridRow header in grid.Headers)
            {
                header.Style = headerStyle;
            }

            // Estilo das linhas
            for (int i = 0 ; i < grid.Rows.Count ; i++)
            {
                PdfGridRow row = grid.Rows[i];

                if (i % 2 == 1)
                {
                    row.Style.BackgroundBrush = new PdfSolidBrush(alternateRowColor);
                }

                row.Style.Font = new PdfStandardFont(PdfFontFamily.Helvetica , 9);
            }

            // Bordas
            grid.Style.BorderOverlapStyle = PdfBorderOverlapStyle.Inside;
            grid.Style.CellPadding = new PdfPaddings(5 , 5 , 5 , 5);
        }

        #endregion Métodos Helper

        #region Página 1: Estatísticas SEM Gráficos (Fallback OnGetAsync)

        private async Task CriarPagina1Estatisticas(PdfDocument document , DateTime dataInicio , DateTime dataFim)
        {
            PdfPage page = document.Pages.Add();
            PdfGraphics graphics = page.Graphics;

            // Fontes
            PdfFont titleFont = new PdfStandardFont(PdfFontFamily.Helvetica , 16 , PdfFontStyle.Bold);
            PdfFont headerFont = new PdfStandardFont(PdfFontFamily.Helvetica , 12 , PdfFontStyle.Bold);
            PdfFont regularFont = new PdfStandardFont(PdfFontFamily.Helvetica , 10);
            PdfFont smallFont = new PdfStandardFont(PdfFontFamily.Helvetica , 8);

            // Cores
            PdfColor primaryColor = new PdfColor(13 , 110 , 253);
            PdfColor gradientStartColor = new PdfColor(13 , 110 , 253);
            PdfColor gradientEndColor = new PdfColor(102 , 126 , 234);
            PdfColor greenColor = new PdfColor(22 , 163 , 74);
            PdfColor redColor = new PdfColor(220 , 38 , 38);
            PdfColor yellowColor = new PdfColor(245 , 158 , 11);
            PdfColor grayColor = new PdfColor(108 , 117 , 125);
            PdfColor lightGray = new PdfColor(248 , 249 , 250);

            float yPosition = 0;

            // ===== CABEÇALHO COM GRADIENTE =====
            RectangleF headerRect = new RectangleF(0 , 0 , page.GetClientSize().Width , 60);
            PdfLinearGradientBrush gradientBrush = new PdfLinearGradientBrush(
                new PointF(0 , 0) ,
                new PointF(page.GetClientSize().Width , 0) ,
                gradientStartColor ,
                gradientEndColor
            );
            graphics.DrawRectangle(gradientBrush , headerRect);

            // Título no cabeçalho
            graphics.DrawString("DASHBOARD DE VIAGENS" , titleFont , new PdfSolidBrush(new PdfColor(255 , 255 , 255)) ,
                new PointF(15 , 15));

            // Período no cabeçalho
            string periodo = $"Período: {dataInicio:dd/MM/yyyy} a {dataFim:dd/MM/yyyy}";
            graphics.DrawString(periodo , regularFont , new PdfSolidBrush(new PdfColor(255 , 255 , 255)) ,
                new PointF(15 , 38));

            yPosition = 80;

            // ===== BUSCA DADOS DO BANCO =====
            var viagens = await _context.Viagem
                .Where(v => v.DataInicial >= dataInicio && v.DataInicial <= dataFim)
                .ToListAsync();

            int totalViagens = viagens.Count;
            int viagensFinalizadas = viagens.Count(v => v.Status == "Realizada");
            int viagensEmAndamento = viagens.Count(v => v.Status == "Aberta");
            int viagensAgendadas = viagens.Count(v => v.Status == "Agendada");
            int viagensCanceladas = viagens.Count(v => v.Status == "Cancelada");

            // CUSTO TOTAL: APENAS CustoCombustivel + CustoLavador + CustoMotorista
            decimal custoTotal = (decimal)(viagens.Sum(v => v.CustoCombustivel ?? 0) +
                                  viagens.Sum(v => v.CustoLavador ?? 0) +
                                  viagens.Sum(v => v.CustoMotorista ?? 0));

            decimal custoMedio = totalViagens > 0 ? custoTotal / totalViagens : 0;
            double? kmTotal = viagens.Sum(v => v.KmFinal ?? 0) - viagens.Sum(v => v.KmInicial ?? 0);

            // ===== ESTATÍSTICAS GERAIS (SEM CARDS) =====
            graphics.DrawString("ESTATÍSTICAS GERAIS" , headerFont , new PdfSolidBrush(primaryColor) , new PointF(0 , yPosition));
            yPosition += 25;

            graphics.DrawString($"Total de Viagens: {totalViagens:N0}" , regularFont , new PdfSolidBrush(grayColor) , new PointF(0 , yPosition));
            yPosition += 18;
            graphics.DrawString($"Custo Total: R$ {custoTotal:N2}" , regularFont , new PdfSolidBrush(grayColor) , new PointF(0 , yPosition));
            yPosition += 18;
            graphics.DrawString($"Custo Médio: R$ {custoMedio:N2}" , regularFont , new PdfSolidBrush(grayColor) , new PointF(0 , yPosition));
            yPosition += 18;
            graphics.DrawString($"Quilometragem Total: {kmTotal:N0} km" , regularFont , new PdfSolidBrush(grayColor) , new PointF(0 , yPosition));
            yPosition += 30;

            // ===== DETALHAMENTO POR STATUS (SEM GRÁFICO) =====
            graphics.DrawString("VIAGENS POR STATUS" , headerFont , new PdfSolidBrush(primaryColor) , new PointF(0 , yPosition));
            yPosition += 20;

            PdfGrid gridStatus = new PdfGrid();
            gridStatus.Columns.Add(3);
            gridStatus.Columns[0].Width = page.GetClientSize().Width * 0.50f;
            gridStatus.Columns[1].Width = page.GetClientSize().Width * 0.25f;
            gridStatus.Columns[2].Width = page.GetClientSize().Width * 0.25f;

            // Header
            PdfGridRow headerRow = gridStatus.Headers.Add(1)[0];
            headerRow.Cells[0].Value = "Status";
            headerRow.Cells[1].Value = "Total";
            headerRow.Cells[2].Value = "%";

            // Dados
            var statusData = new[]
            {
                new { Nome = "Finalizadas", Total = viagensFinalizadas, Cor = greenColor },
                new { Nome = "Em Andamento", Total = viagensEmAndamento, Cor = new PdfColor(13, 110, 253) },
                new { Nome = "Agendadas", Total = viagensAgendadas, Cor = yellowColor },
                new { Nome = "Canceladas", Total = viagensCanceladas, Cor = redColor }
            };

            foreach (var status in statusData)
            {
                PdfGridRow row = gridStatus.Rows.Add();
                row.Cells[0].Value = status.Nome;
                row.Cells[1].Value = status.Total.ToString("N0");
                double percentual = totalViagens > 0 ? (status.Total * 100.0 / totalViagens) : 0;
                row.Cells[2].Value = $"{percentual:N1}%";

                // Colorir o nome do status
                row.Cells[0].Style.TextBrush = new PdfSolidBrush(status.Cor);
                row.Cells[0].Style.Font = new PdfStandardFont(PdfFontFamily.Helvetica , 9 , PdfFontStyle.Bold);
            }

            ApplyGridStyle(gridStatus , primaryColor , lightGray);
            var result = gridStatus.Draw(page , new PointF(0 , yPosition));
            yPosition = result.Bounds.Bottom + 20;

            // ===== RODAPÉ =====
            string rodape = $"Gerado em: {DateTime.Now:dd/MM/yyyy HH:mm} | FrotiX - Sistema de Gestão de Frotas | Página 1/3";
            graphics.DrawString(rodape , smallFont , new PdfSolidBrush(grayColor) ,
                new PointF(0 , page.GetClientSize().Height - 20));
        }

        #endregion Página 1: Estatísticas SEM Gráficos (Fallback OnGetAsync)

        #region Página 2: Rankings SEM Gráficos (Fallback OnGetAsync)

        private async Task CriarPagina2Rankings(PdfDocument document , DateTime dataInicio , DateTime dataFim)
        {
            PdfPage page = document.Pages.Add();
            PdfGraphics graphics = page.Graphics;

            // Fontes
            PdfFont titleFont = new PdfStandardFont(PdfFontFamily.Helvetica , 16 , PdfFontStyle.Bold);
            PdfFont headerFont = new PdfStandardFont(PdfFontFamily.Helvetica , 12 , PdfFontStyle.Bold);
            PdfFont regularFont = new PdfStandardFont(PdfFontFamily.Helvetica , 10);
            PdfFont smallFont = new PdfStandardFont(PdfFontFamily.Helvetica , 8);

            // Cores
            PdfColor primaryColor = new PdfColor(13 , 110 , 253);
            PdfColor greenColor = new PdfColor(22 , 163 , 74);
            PdfColor laranja = new PdfColor(217 , 119 , 6);
            PdfColor roxo = new PdfColor(157 , 78 , 221);
            PdfColor grayColor = new PdfColor(108 , 117 , 125);
            PdfColor lightGray = new PdfColor(248 , 249 , 250);

            float yPosition = 0;

            // ===== CABEÇALHO =====
            graphics.DrawString("RANKINGS DE VIAGENS" , titleFont , new PdfSolidBrush(primaryColor) , new PointF(0 , yPosition));
            yPosition += 25;

            // ===== TOP 10 MOTORISTAS =====
            graphics.DrawString("TOP 10 MOTORISTAS" , headerFont , new PdfSolidBrush(greenColor) , new PointF(0 , yPosition));
            yPosition += 20;

            var viagens = await _context.Viagem
                .Where(v => v.DataInicial >= dataInicio && v.DataInicial <= dataFim)
                .Include(v => v.Motorista)
                .ToListAsync();

            var topMotoristas = viagens
                .Where(v => v.Motorista != null)
                .GroupBy(v => new { v.MotoristaId , Nome = v.Motorista.Nome })
                .Select(g => new
                {
                    Motorista = g.Key.Nome ?? "Não informado" ,
                    Total = g.Count()
                })
                .OrderByDescending(x => x.Total)
                .Take(10)
                .ToList();

            PdfGrid gridMotoristas = new PdfGrid();
            gridMotoristas.Columns.Add(2);
            gridMotoristas.Columns[0].Width = 400;
            gridMotoristas.Columns[1].Width = page.GetClientSize().Width - 400;

            // Header
            PdfGridRow headerRow = gridMotoristas.Headers.Add(1)[0];
            headerRow.Cells[0].Value = "Motorista";
            headerRow.Cells[1].Value = "Total de Viagens";

            // Dados
            foreach (var mot in topMotoristas)
            {
                PdfGridRow row = gridMotoristas.Rows.Add();
                row.Cells[0].Value = mot.Motorista;
                row.Cells[1].Value = mot.Total.ToString("N0");
            }

            ApplyGridStyle(gridMotoristas , greenColor , lightGray);
            var result = gridMotoristas.Draw(page , new PointF(0 , yPosition));
            yPosition = result.Bounds.Bottom + 20;

            // ===== TOP 10 VEÍCULOS =====
            graphics.DrawString("TOP 10 VEÍCULOS" , headerFont , new PdfSolidBrush(laranja) , new PointF(0 , yPosition));
            yPosition += 20;

            // Busca USANDO ViewVeiculos
            var viagensVeiculos = await _context.Viagem
                .Where(v => v.DataInicial >= dataInicio && v.DataInicial <= dataFim && v.VeiculoId != null)
                .ToListAsync();

            var veiculoIds = viagensVeiculos.Select(v => v.VeiculoId.Value).Distinct().ToList();
            var veiculos = await _context.ViewVeiculos.Where(vv => veiculoIds.Contains(vv.VeiculoId)).ToListAsync();

            var topVeiculos = viagensVeiculos
                .GroupBy(v => v.VeiculoId.Value)
                .Select(g => new
                {
                    VeiculoId = g.Key ,
                    Total = g.Count()
                })
                .Join(veiculos ,
                    v => v.VeiculoId ,
                    vv => vv.VeiculoId ,
                    (v , vv) => new
                    {
                        Veiculo = vv.MarcaModelo ?? "Não informado" ,
                        Total = v.Total
                    })
                .OrderByDescending(x => x.Total)
                .Take(10)
                .ToList();

            PdfGrid gridVeiculos = new PdfGrid();
            gridVeiculos.Columns.Add(2);
            gridVeiculos.Columns[0].Width = 400;
            gridVeiculos.Columns[1].Width = page.GetClientSize().Width - 400;

            // Header
            headerRow = gridVeiculos.Headers.Add(1)[0];
            headerRow.Cells[0].Value = "Veículo";
            headerRow.Cells[1].Value = "Total de Viagens";

            // Dados
            foreach (var veic in topVeiculos)
            {
                PdfGridRow row = gridVeiculos.Rows.Add();
                row.Cells[0].Value = veic.Veiculo;
                row.Cells[1].Value = veic.Total.ToString("N0");
            }

            ApplyGridStyle(gridVeiculos , laranja , lightGray);
            result = gridVeiculos.Draw(page , new PointF(0 , yPosition));
            yPosition = result.Bounds.Bottom + 20;

            // ===== TOP 10 FINALIDADES =====
            // Verifica se precisa de nova página
            if (yPosition > page.GetClientSize().Height - 200)
            {
                // Rodapé da página atual
                string rodape1 = $"Gerado em: {DateTime.Now:dd/MM/yyyy HH:mm} | FrotiX - Sistema de Gestão de Frotas | Página 2/3";
                graphics.DrawString(rodape1 , smallFont , new PdfSolidBrush(grayColor) ,
                    new PointF(0 , page.GetClientSize().Height - 20));

                // Nova página
                page = document.Pages.Add();
                graphics = page.Graphics;
                yPosition = 0;
            }

            graphics.DrawString("TOP 10 FINALIDADES" , headerFont , new PdfSolidBrush(roxo) , new PointF(0 , yPosition));
            yPosition += 20;

            var viagensFinalidades = await _context.Viagem
                .Where(v => v.DataInicial >= dataInicio && v.DataInicial <= dataFim)
                .ToListAsync();

            var topFinalidades = viagensFinalidades
                .Where(v => !string.IsNullOrEmpty(v.Finalidade))
                .GroupBy(v => new { v.Finalidade , Descricao = v.Finalidade })
                .Select(g => new
                {
                    Finalidade = g.Key.Descricao ?? "Não informado" ,
                    Total = g.Count()
                })
                .OrderByDescending(x => x.Total)
                .Take(10)
                .ToList();

            PdfGrid gridFinalidades = new PdfGrid();
            gridFinalidades.Columns.Add(2);
            gridFinalidades.Columns[0].Width = 400;
            gridFinalidades.Columns[1].Width = page.GetClientSize().Width - 400;

            // Header
            headerRow = gridFinalidades.Headers.Add(1)[0];
            headerRow.Cells[0].Value = "Finalidade";
            headerRow.Cells[1].Value = "Total de Viagens";

            // Dados
            foreach (var fin in topFinalidades)
            {
                PdfGridRow row = gridFinalidades.Rows.Add();
                row.Cells[0].Value = fin.Finalidade;
                row.Cells[1].Value = fin.Total.ToString("N0");
            }

            ApplyGridStyle(gridFinalidades , roxo , lightGray);
            result = gridFinalidades.Draw(page , new PointF(0 , yPosition));

            // ===== RODAPÉ =====
            string rodape = $"Gerado em: {DateTime.Now:dd/MM/yyyy HH:mm} | FrotiX - Sistema de Gestão de Frotas | Página 2/3";
            graphics.DrawString(rodape , smallFont , new PdfSolidBrush(grayColor) ,
                new PointF(0 , page.GetClientSize().Height - 20));
        }

        #endregion Página 2: Rankings SEM Gráficos (Fallback OnGetAsync)

        #region Página 3: Complementos SEM Gráficos (Fallback OnGetAsync)

        private async Task CriarPagina3Complementos(PdfDocument document , DateTime dataInicio , DateTime dataFim)
        {
            PdfPage page = document.Pages.Add();
            PdfGraphics graphics = page.Graphics;

            // Fontes
            PdfFont titleFont = new PdfStandardFont(PdfFontFamily.Helvetica , 16 , PdfFontStyle.Bold);
            PdfFont headerFont = new PdfStandardFont(PdfFontFamily.Helvetica , 12 , PdfFontStyle.Bold);
            PdfFont regularFont = new PdfStandardFont(PdfFontFamily.Helvetica , 10);
            PdfFont smallFont = new PdfStandardFont(PdfFontFamily.Helvetica , 8);

            // Cores
            PdfColor primaryColor = new PdfColor(13 , 110 , 253);
            PdfColor greenColor = new PdfColor(22 , 163 , 74);
            PdfColor rosaColor = new PdfColor(236 , 72 , 153);
            PdfColor amareloColor = new PdfColor(245 , 158 , 11);
            PdfColor grayColor = new PdfColor(108 , 117 , 125);
            PdfColor lightGray = new PdfColor(248 , 249 , 250);

            float yPosition = 0;

            // ===== CABEÇALHO =====
            graphics.DrawString("INFORMAÇÕES COMPLEMENTARES" , titleFont , new PdfSolidBrush(primaryColor) , new PointF(0 , yPosition));
            yPosition += 25;

            // ===== TOP 10 VIAGENS MAIS CARAS =====
            graphics.DrawString("TOP 10 VIAGENS MAIS CARAS" , headerFont , new PdfSolidBrush(primaryColor) , new PointF(0 , yPosition));
            yPosition += 20;

            // Busca USANDO ViewVeiculos
            var viagensComVeiculos = await _context.Viagem
                .Where(v => v.DataInicial >= dataInicio && v.DataInicial <= dataFim)
                .Include(v => v.Motorista)
                .ToListAsync();

            var veiculoIds = viagensComVeiculos.Where(v => v.VeiculoId != null).Select(v => v.VeiculoId.Value).Distinct().ToList();
            var veiculos = await _context.ViewVeiculos.Where(vv => veiculoIds.Contains(vv.VeiculoId)).ToListAsync();

            var viagensMaisCaras = viagensComVeiculos
                .Select(v => new
                {
                    v.NoFichaVistoria ,
                    v.DataInicial ,
                    v.DataFinal ,
                    NomeMotorista = v.Motorista != null ? v.Motorista.Nome : null ,
                    DescricaoVeiculo = v.VeiculoId != null ? veiculos.FirstOrDefault(vv => vv.VeiculoId == v.VeiculoId.Value)?.MarcaModelo : null ,
                    CustoViagem = (v.CustoCombustivel ?? 0) + (v.CustoLavador ?? 0) + (v.CustoMotorista ?? 0)
                })
                .OrderByDescending(v => v.CustoViagem)
                .Take(10)
                .ToList();

            PdfGrid gridViagensCaras = new PdfGrid();
            gridViagensCaras.Columns.Add(7);
            gridViagensCaras.Columns[0].Width = 25;  // #
            gridViagensCaras.Columns[1].Width = 60;  // Nº Ficha
            gridViagensCaras.Columns[2].Width = 75;  // Data Inicial
            gridViagensCaras.Columns[3].Width = 75;  // Data Final
            gridViagensCaras.Columns[4].Width = 100; // Motorista
            gridViagensCaras.Columns[5].Width = 100; // Veículo
            gridViagensCaras.Columns[6].Width = 75;  // Custo

            // Header
            PdfGridRow headerRow = gridViagensCaras.Headers.Add(1)[0];
            headerRow.Cells[0].Value = "#";
            headerRow.Cells[1].Value = "Nº Ficha";
            headerRow.Cells[2].Value = "Data Inicial";
            headerRow.Cells[3].Value = "Data Final";
            headerRow.Cells[4].Value = "Motorista";
            headerRow.Cells[5].Value = "Veículo";
            headerRow.Cells[6].Value = "Custo Total";

            // Dados
            int contador = 1;
            foreach (var viagem in viagensMaisCaras)
            {
                PdfGridRow row = gridViagensCaras.Rows.Add();
                row.Cells[0].Value = contador.ToString();
                row.Cells[1].Value = viagem.NoFichaVistoria?.ToString() ?? "N/A";
                row.Cells[2].Value = viagem.DataInicial?.ToString("dd/MM/yyyy") ?? "N/A";
                row.Cells[3].Value = viagem.DataFinal?.ToString("dd/MM/yyyy") ?? "N/A";
                row.Cells[4].Value = viagem.NomeMotorista ?? "Não informado";
                row.Cells[5].Value = viagem.DescricaoVeiculo ?? "Não informado";
                row.Cells[6].Value = $"R$ {viagem.CustoViagem:N2}";

                // Destaca custo em verde
                row.Cells[6].Style.TextBrush = new PdfSolidBrush(greenColor);
                row.Cells[6].Style.Font = new PdfStandardFont(PdfFontFamily.Helvetica , 9 , PdfFontStyle.Bold);

                contador++;
            }

            ApplyGridStyle(gridViagensCaras , primaryColor , lightGray);
            var result = gridViagensCaras.Draw(page , new PointF(0 , yPosition));
            yPosition = result.Bounds.Bottom + 20;

            // ===== TOP 10 REQUISITANTES =====
            graphics.DrawString("TOP 10 REQUISITANTES" , headerFont , new PdfSolidBrush(rosaColor) , new PointF(0 , yPosition));
            yPosition += 20;

            var viagens = await _context.Viagem
                .Where(v => v.DataInicial >= dataInicio && v.DataInicial <= dataFim && v.RequisitanteId != null)
                .Include(v => v.Requisitante)
                .ToListAsync();

            var topRequisitantes = viagens
                .Where(v => v.Requisitante != null && v.Requisitante.Nome != "Coordenação de Transportes (Ctran)")
                .GroupBy(v => new { v.RequisitanteId , Nome = v.Requisitante.Nome })
                .Select(g => new
                {
                    Requisitante = g.Key.Nome ?? "Não informado" ,
                    Total = g.Count()
                })
                .OrderByDescending(x => x.Total)
                .Take(10)
                .ToList();

            PdfGrid gridRequisitantes = new PdfGrid();
            gridRequisitantes.Columns.Add(2);
            gridRequisitantes.Columns[0].Width = 400;
            gridRequisitantes.Columns[1].Width = page.GetClientSize().Width - 400;

            // Header
            headerRow = gridRequisitantes.Headers.Add(1)[0];
            headerRow.Cells[0].Value = "Requisitante";
            headerRow.Cells[1].Value = "Total de Viagens";
            // Cor do header em ROSA
            headerRow.Cells[0].Style.BackgroundBrush = new PdfSolidBrush(rosaColor);
            headerRow.Cells[1].Style.BackgroundBrush = new PdfSolidBrush(rosaColor);
            headerRow.Cells[0].Style.TextBrush = new PdfSolidBrush(new PdfColor(255 , 255 , 255));
            headerRow.Cells[1].Style.TextBrush = new PdfSolidBrush(new PdfColor(255 , 255 , 255));

            // Dados
            foreach (var req in topRequisitantes)
            {
                PdfGridRow row = gridRequisitantes.Rows.Add();
                row.Cells[0].Value = req.Requisitante;
                row.Cells[1].Value = req.Total.ToString("N0");
            }

            ApplyGridStyle(gridRequisitantes , rosaColor , lightGray);
            result = gridRequisitantes.Draw(page , new PointF(0 , yPosition));
            yPosition = result.Bounds.Bottom + 20;

            // ===== TOP 10 SETORES =====
            // Verifica se cabe na página atual
            if (yPosition > page.GetClientSize().Height - 200)
            {
                // Rodapé da página atual
                string rodape1 = $"Gerado em: {DateTime.Now:dd/MM/yyyy HH:mm} | FrotiX - Sistema de Gestão de Frotas | Página 3/3";
                graphics.DrawString(rodape1 , smallFont , new PdfSolidBrush(grayColor) ,
                    new PointF(0 , page.GetClientSize().Height - 20));

                // Nova página
                page = document.Pages.Add();
                graphics = page.Graphics;
                yPosition = 0;
            }

            graphics.DrawString("TOP 10 SETORES" , headerFont , new PdfSolidBrush(amareloColor) , new PointF(0 , yPosition));
            yPosition += 20;

            var topSetores = viagens
                .Where(v => v.SetorSolicitante != null && v.SetorSolicitante.Nome != "Coordenação de Transportes")
                .GroupBy(v => new { v.SetorSolicitanteId , Nome = v.SetorSolicitante.Nome })
                .Select(g => new
                {
                    Setor = g.Key.Nome ?? "Não informado" ,
                    Total = g.Count()
                })
                .OrderByDescending(x => x.Total)
                .Take(10)
                .ToList();

            PdfGrid gridSetores = new PdfGrid();
            gridSetores.Columns.Add(2);
            gridSetores.Columns[0].Width = 400;
            gridSetores.Columns[1].Width = page.GetClientSize().Width - 400;

            // Header
            headerRow = gridSetores.Headers.Add(1)[0];
            headerRow.Cells[0].Value = "Setor";
            headerRow.Cells[1].Value = "Total de Viagens";
            // Cor do header em AMARELO
            headerRow.Cells[0].Style.BackgroundBrush = new PdfSolidBrush(amareloColor);
            headerRow.Cells[1].Style.BackgroundBrush = new PdfSolidBrush(amareloColor);
            headerRow.Cells[0].Style.TextBrush = new PdfSolidBrush(new PdfColor(255 , 255 , 255));
            headerRow.Cells[1].Style.TextBrush = new PdfSolidBrush(new PdfColor(255 , 255 , 255));

            // Dados
            foreach (var setor in topSetores)
            {
                PdfGridRow row = gridSetores.Rows.Add();
                row.Cells[0].Value = setor.Setor;
                row.Cells[1].Value = setor.Total.ToString("N0");
            }

            ApplyGridStyle(gridSetores , amareloColor , lightGray);
            result = gridSetores.Draw(page , new PointF(0 , yPosition));

            // ===== RODAPÉ =====
            string rodape = $"Gerado em: {DateTime.Now:dd/MM/yyyy HH:mm} | FrotiX - Sistema de Gestão de Frotas | Página 3/3";
            graphics.DrawString(rodape , smallFont , new PdfSolidBrush(grayColor) ,
                new PointF(0 , page.GetClientSize().Height - 20));
        }

        #endregion Página 3: Complementos SEM Gráficos (Fallback OnGetAsync)
    }
}
