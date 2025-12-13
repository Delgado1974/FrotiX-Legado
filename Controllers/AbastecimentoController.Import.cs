using FrotiX.Hubs;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using NPOI.SS.UserModel;
using NPOI.XSSF.UserModel;
using NPOI.HSSF.UserModel;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Transactions;

namespace FrotiX.Controllers
{
    public partial class AbastecimentoController : ControllerBase
    {
        // DTOs para importação
        public class ImportacaoRequest
        {
            public DateTime DataAbastecimento { get; set; }
        }

        public class LinhaImportacao
        {
            public int NumeroLinhaOriginal { get; set; }
            public int NumeroLinhaErro { get; set; }
            public string Placa { get; set; }
            public int CodMotorista { get; set; }
            public int Autorizacao { get; set; }
            public int KmAnterior { get; set; }
            public int Km { get; set; }
            public int KmRodado { get; set; }
            public string Produto { get; set; }
            public double ValorUnitario { get; set; }
            public double Quantidade { get; set; }
            public double ValorTotal => ValorUnitario * Quantidade;
            public double Consumo => Quantidade > 0 && KmRodado > 0 ? KmRodado / Quantidade : 0;
            public string Data { get; set; }
            public string Hora { get; set; }
            public DateTime? DataHoraParsed { get; set; }

            public Guid? VeiculoId { get; set; }
            public Guid? MotoristaId { get; set; }
            public Guid? CombustivelId { get; set; }
            public string NomeMotorista { get; set; }
            public List<string> Erros { get; set; } = new List<string>();

            public bool Valido => Erros.Count == 0;
        }

        public class ResultadoImportacao
        {
            public bool Sucesso { get; set; }
            public string Mensagem { get; set; }
            public int TotalLinhas { get; set; }
            public int LinhasImportadas { get; set; }
            public int LinhasComErro { get; set; }
            public int LinhasIgnoradas { get; set; }
            public List<ErroImportacao> Erros { get; set; } = new List<ErroImportacao>();
            public List<LinhaImportadaDTO> LinhasImportadasLista { get; set; } = new List<LinhaImportadaDTO>();
            public string ArquivoErros { get; set; }
            public string NomeArquivoErros { get; set; }
        }

        public class ErroImportacao
        {
            public int LinhaOriginal { get; set; }
            public int LinhaArquivoErros { get; set; }
            public string Tipo { get; set; }
            public string Descricao { get; set; }
            public string Icone { get; set; }
        }

        public class LinhaImportadaDTO
        {
            public string Placa { get; set; }
            public string Motorista { get; set; }
            public int Autorizacao { get; set; }
            public int KmAnterior { get; set; }
            public int Km { get; set; }
            public int KmRodado { get; set; }
            public string Produto { get; set; }
            public string ValorUnitario { get; set; }
            public string Quantidade { get; set; }
            public string ValorTotal { get; set; }
            public string Consumo { get; set; }
            public string DataHora { get; set; }
        }

        private class MapeamentoColunas
        {
            public int Autorizacao { get; set; } = -1;
            public int Data { get; set; } = -1;
            public int Hora { get; set; } = -1;
            public int Placa { get; set; } = -1;
            public int Km { get; set; } = -1;
            public int Produto { get; set; } = -1;
            public int Quantidade { get; set; } = -1;
            public int ValorUnitario { get; set; } = -1;
            public int Rodado { get; set; } = -1;
            public int CodMotorista { get; set; } = -1;
            public int KmAnterior { get; set; } = -1;

            public bool TodosMapeados => Autorizacao >= 0 && Data >= 0 && Hora >= 0 && Placa >= 0 &&
                                         Km >= 0 && Produto >= 0 && Quantidade >= 0 && ValorUnitario >= 0 &&
                                         Rodado >= 0 && CodMotorista >= 0 && KmAnterior >= 0;

            public List<string> ColunasFaltantes()
            {
                var faltantes = new List<string>();
                if (Autorizacao < 0) faltantes.Add("Autorização");
                if (Data < 0) faltantes.Add("Data");
                if (Hora < 0) faltantes.Add("Hora");
                if (Placa < 0) faltantes.Add("Placa");
                if (Km < 0) faltantes.Add("KM");
                if (Produto < 0) faltantes.Add("Produto");
                if (Quantidade < 0) faltantes.Add("Qtde");
                if (ValorUnitario < 0) faltantes.Add("Valor Unitário");
                if (Rodado < 0) faltantes.Add("Rodado");
                if (CodMotorista < 0) faltantes.Add("CodMotorista");
                if (KmAnterior < 0) faltantes.Add("KMAnterior");
                return faltantes;
            }
        }

        /// <summary>
        /// Envia atualização de progresso via SignalR
        /// </summary>
        private async Task EnviarProgresso(string connectionId, int porcentagem, string etapa, string detalhe, int linhaAtual = 0, int totalLinhas = 0)
        {
            try
            {
                if (string.IsNullOrEmpty(connectionId) || _hubContext == null)
                    return;

                await _hubContext.Clients.Client(connectionId).SendAsync("ProgressoImportacao", new ProgressoImportacao
                {
                    Porcentagem = porcentagem,
                    Etapa = etapa,
                    Detalhe = detalhe,
                    LinhaAtual = linhaAtual,
                    TotalLinhas = totalLinhas
                });
            }
            catch (Exception error)
            {
                // Não interromper a importação por erro no SignalR
                Alerta.TratamentoErroComLinha("AbastecimentoController.cs", "EnviarProgresso", error);
            }
        }

        [Route("ImportarNovo")]
        [HttpPost]
        public async Task<ActionResult> ImportarNovo()
        {
            string connectionId = null;

            try
            {
                // Obter connectionId do SignalR (enviado via form)
                connectionId = Request.Form["connectionId"].FirstOrDefault();

                // === ETAPA 1: Verificar arquivo (0-5%) ===
                await EnviarProgresso(connectionId, 2, "Recebendo arquivo", "Verificando upload...");

                if (Request.Form.Files.Count == 0)
                {
                    return Ok(new ResultadoImportacao
                    {
                        Sucesso = false,
                        Mensagem = "Nenhum arquivo foi enviado"
                    });
                }

                IFormFile file = Request.Form.Files[0];
                if (file.Length == 0)
                {
                    return Ok(new ResultadoImportacao
                    {
                        Sucesso = false,
                        Mensagem = "Arquivo vazio"
                    });
                }

                await EnviarProgresso(connectionId, 5, "Recebendo arquivo", $"Arquivo recebido: {file.FileName}");

                // === ETAPA 2: Ler planilha (5-20%) ===
                await EnviarProgresso(connectionId, 10, "Lendo planilha", "Abrindo arquivo Excel...");

                var resultadoLeitura = LerPlanilhaDinamica(file);
                if (!resultadoLeitura.Sucesso)
                {
                    return Ok(new ResultadoImportacao
                    {
                        Sucesso = false,
                        Mensagem = resultadoLeitura.MensagemErro
                    });
                }

                await EnviarProgresso(connectionId, 15, "Lendo planilha", "Mapeando colunas...");

                var linhas = resultadoLeitura.Linhas;
                if (linhas.Count == 0)
                {
                    return Ok(new ResultadoImportacao
                    {
                        Sucesso = false,
                        Mensagem = "Nenhum registro encontrado na planilha"
                    });
                }

                int totalLinhas = linhas.Count;
                await EnviarProgresso(connectionId, 20, "Lendo planilha", $"{totalLinhas} linha(s) encontrada(s)", 0, totalLinhas);

                // === ETAPA 3: Carregar dados de referência (20-25%) ===
                await EnviarProgresso(connectionId, 22, "Carregando dados", "Buscando veículos cadastrados...");
                var veiculos = _unitOfWork.Veiculo.GetAll().ToList();

                await EnviarProgresso(connectionId, 23, "Carregando dados", "Buscando motoristas cadastrados...");
                var motoristas = _unitOfWork.Motorista.GetAll().ToList();

                await EnviarProgresso(connectionId, 24, "Carregando dados", "Verificando autorizações existentes...");
                var autorizacoesExistentes = _unitOfWork.Abastecimento.GetAll()
                    .Where(a => a.AutorizacaoQCard.HasValue)
                    .Select(a => a.AutorizacaoQCard.Value)
                    .ToHashSet();

                await EnviarProgresso(connectionId, 25, "Carregando dados", "Dados de referência carregados");

                var mapaCombustivel = new Dictionary<string, Guid>(StringComparer.OrdinalIgnoreCase)
                {
                    { "Gasolina Comum", Guid.Parse("f668f660-8380-4df3-90cd-787db06fe734") },
                    { "Diesel S-10", Guid.Parse("a69aa86a-9162-4242-ab9a-8b184e04c4da") }
                };

                // === ETAPA 4: Validar linhas (25-70%) ===
                int linhaProcessada = 0;
                int intervaloAtualizacao = Math.Max(1, totalLinhas / 50); // Atualiza a cada ~2%

                foreach (var linha in linhas)
                {
                    linhaProcessada++;

                    // Enviar progresso a cada N linhas para não sobrecarregar
                    if (linhaProcessada % intervaloAtualizacao == 0 || linhaProcessada == totalLinhas)
                    {
                        int porcentagemValidacao = 25 + (int)((linhaProcessada / (double)totalLinhas) * 45);
                        await EnviarProgresso(connectionId, porcentagemValidacao, "Validando linhas",
                            $"Processando linha {linhaProcessada} de {totalLinhas}...", linhaProcessada, totalLinhas);
                    }

                    // Validar e parsear Data/Hora da planilha
                    var dataHoraParsed = ParseDataHora(linha.Data, linha.Hora);
                    if (dataHoraParsed.HasValue)
                    {
                        linha.DataHoraParsed = dataHoraParsed.Value;
                    }
                    else
                    {
                        linha.Erros.Add($"Data/Hora inválida: '{linha.Data}' '{linha.Hora}'");
                    }

                    var produtoLimpo = LimparProduto(linha.Produto);

                    if (mapaCombustivel.TryGetValue(produtoLimpo, out Guid combustivelId))
                    {
                        linha.CombustivelId = combustivelId;
                        linha.Produto = produtoLimpo;

                        if (autorizacoesExistentes.Contains(linha.Autorizacao))
                        {
                            linha.Erros.Add($"Autorização '{linha.Autorizacao}' já foi importada anteriormente");
                        }

                        var veiculo = veiculos.FirstOrDefault(v =>
                            v.Placa != null &&
                            v.Placa.Equals(linha.Placa, StringComparison.OrdinalIgnoreCase));

                        if (veiculo == null)
                        {
                            linha.Erros.Add($"Veículo de placa '{linha.Placa}' não cadastrado");
                        }
                        else
                        {
                            linha.VeiculoId = veiculo.VeiculoId;
                        }

                        var motorista = motoristas.FirstOrDefault(m =>
                            m.CodMotoristaQCard == linha.CodMotorista);

                        if (motorista == null)
                        {
                            linha.Erros.Add($"Motorista com código QCard '{linha.CodMotorista}' não cadastrado");
                        }
                        else
                        {
                            linha.MotoristaId = motorista.MotoristaId;
                            linha.NomeMotorista = motorista.Nome;
                        }

                        if (linha.Quantidade > 500)
                        {
                            linha.Erros.Add($"Quantidade de {linha.Quantidade:N2} litros excede o limite de 500 litros");
                        }

                        if (linha.KmRodado > 1000)
                        {
                            linha.Erros.Add($"Quilometragem de {linha.KmRodado} km excede o limite de 1.000 km");
                        }

                        if (linha.KmRodado < 0)
                        {
                            linha.Erros.Add($"Quilometragem negativa ({linha.KmRodado} km): Km Anterior maior que Km Atual");
                        }
                    }
                }

                await EnviarProgresso(connectionId, 70, "Validação concluída", "Preparando para gravar...");

                var linhasIgnoradas = linhas.Where(l => !l.CombustivelId.HasValue).ToList();
                var linhasParaProcessar = linhas.Where(l => l.CombustivelId.HasValue).ToList();
                var linhasValidas = linhasParaProcessar.Where(l => l.Valido).ToList();
                var linhasComErro = linhasParaProcessar.Where(l => !l.Valido).ToList();

                int numeroLinhaErro = 1;
                foreach (var linha in linhasComErro)
                {
                    linha.NumeroLinhaErro = ++numeroLinhaErro;
                }

                // === ETAPA 5: Salvar no banco (70-90%) ===
                var linhasImportadas = new List<LinhaImportadaDTO>();
                var veiculosParaAtualizar = new HashSet<Guid>();

                if (linhasValidas.Any())
                {
                    await EnviarProgresso(connectionId, 72, "Gravando dados", $"Salvando {linhasValidas.Count} abastecimento(s)...");

                    int linhaGravada = 0;
                    int intervaloGravacao = Math.Max(1, linhasValidas.Count / 20);

                    using (var scope = new TransactionScope(
                        TransactionScopeOption.RequiresNew,
                        new TimeSpan(0, 30, 0),
                        TransactionScopeAsyncFlowOption.Enabled))
                    {
                        foreach (var linha in linhasValidas)
                        {
                            linhaGravada++;

                            if (linhaGravada % intervaloGravacao == 0 || linhaGravada == linhasValidas.Count)
                            {
                                int porcentagemGravacao = 72 + (int)((linhaGravada / (double)linhasValidas.Count) * 15);
                                await EnviarProgresso(connectionId, porcentagemGravacao, "Gravando dados",
                                    $"Salvando registro {linhaGravada} de {linhasValidas.Count}...", linhaGravada, linhasValidas.Count);
                            }

                            var abastecimento = new Abastecimento
                            {
                                AbastecimentoId = Guid.NewGuid(),
                                DataHora = linha.DataHoraParsed.Value,
                                VeiculoId = linha.VeiculoId.Value,
                                MotoristaId = linha.MotoristaId.Value,
                                CombustivelId = linha.CombustivelId.Value,
                                AutorizacaoQCard = linha.Autorizacao,
                                Litros = linha.Quantidade,
                                ValorUnitario = linha.ValorUnitario,
                                Hodometro = linha.Km,
                                KmRodado = linha.KmRodado
                            };

                            _unitOfWork.Abastecimento.Add(abastecimento);
                            veiculosParaAtualizar.Add(linha.VeiculoId.Value);

                            linhasImportadas.Add(new LinhaImportadaDTO
                            {
                                Placa = linha.Placa,
                                Motorista = linha.NomeMotorista,
                                Autorizacao = linha.Autorizacao,
                                KmAnterior = linha.KmAnterior,
                                Km = linha.Km,
                                KmRodado = linha.KmRodado,
                                Produto = linha.Produto,
                                ValorUnitario = linha.ValorUnitario.ToString("C2", new CultureInfo("pt-BR")),
                                Quantidade = linha.Quantidade.ToString("N2"),
                                ValorTotal = linha.ValorTotal.ToString("C2", new CultureInfo("pt-BR")),
                                Consumo = linha.Consumo.ToString("N2") + " km/l",
                                DataHora = linha.DataHoraParsed.Value.ToString("dd/MM/yyyy HH:mm")
                            });
                        }

                        await EnviarProgresso(connectionId, 88, "Gravando dados", "Salvando no banco de dados...");
                        _unitOfWork.Save();

                        await EnviarProgresso(connectionId, 90, "Atualizando veículos", "Recalculando consumo médio...");

                        foreach (var veiculoId in veiculosParaAtualizar)
                        {
                            var mediaConsumo = _unitOfWork.ViewMediaConsumo.GetFirstOrDefault(v =>
                                v.VeiculoId == veiculoId);

                            if (mediaConsumo != null)
                            {
                                var veiculo = _unitOfWork.Veiculo.GetFirstOrDefault(v =>
                                    v.VeiculoId == veiculoId);

                                if (veiculo != null)
                                {
                                    veiculo.Consumo = (double?)mediaConsumo.ConsumoGeral;
                                    _unitOfWork.Veiculo.Update(veiculo);
                                }
                            }
                        }

                        _unitOfWork.Save();
                        scope.Complete();
                    }
                }

                // === ETAPA 6: Gerar arquivo de erros (90-98%) ===
                string arquivoErrosBase64 = null;
                string nomeArquivoErros = null;
                var erros = new List<ErroImportacao>();

                if (linhasComErro.Any())
                {
                    await EnviarProgresso(connectionId, 92, "Gerando relatório", "Preparando arquivo de erros...");

                    foreach (var linha in linhasComErro)
                    {
                        foreach (var erro in linha.Erros)
                        {
                            string tipo = "erro";
                            string icone = "fa-circle-xmark";

                            if (erro.Contains("Autorização"))
                            {
                                tipo = "autorizacao";
                                icone = "fa-ban";
                            }
                            else if (erro.Contains("Motorista"))
                            {
                                tipo = "motorista";
                                icone = "fa-user-xmark";
                            }
                            else if (erro.Contains("Veículo") || erro.Contains("placa"))
                            {
                                tipo = "veiculo";
                                icone = "fa-car-burst";
                            }
                            else if (erro.Contains("litros"))
                            {
                                tipo = "litros";
                                icone = "fa-gas-pump";
                            }
                            else if (erro.Contains("Quilometragem") || erro.Contains("km"))
                            {
                                tipo = "km";
                                icone = "fa-gauge-high";
                            }
                            else if (erro.Contains("Data") || erro.Contains("Hora"))
                            {
                                tipo = "data";
                                icone = "fa-calendar-xmark";
                            }

                            erros.Add(new ErroImportacao
                            {
                                LinhaOriginal = linha.NumeroLinhaOriginal,
                                LinhaArquivoErros = linha.NumeroLinhaErro,
                                Tipo = tipo,
                                Descricao = erro,
                                Icone = icone
                            });
                        }
                    }

                    await EnviarProgresso(connectionId, 95, "Gerando relatório", "Criando planilha de erros...");

                    var arquivoErros = GerarExcelErros(linhasComErro, resultadoLeitura.Mapeamento);
                    arquivoErrosBase64 = Convert.ToBase64String(arquivoErros);
                    nomeArquivoErros = $"Erros_Importacao_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
                }

                // === ETAPA 7: Finalizar (98-100%) ===
                await EnviarProgresso(connectionId, 98, "Finalizando", "Preparando resultado...");

                string mensagem;
                bool sucesso;

                if (linhasValidas.Any() && linhasComErro.Any())
                {
                    mensagem = $"Importação parcial concluída! {linhasValidas.Count} abastecimento(s) importado(s), " +
                               $"{linhasComErro.Count} linha(s) com erro. Baixe o arquivo para corrigir.";
                    sucesso = true;
                }
                else if (linhasValidas.Any())
                {
                    var msgIgnoradas = linhasIgnoradas.Count > 0
                        ? $" ({linhasIgnoradas.Count} linha(s) com produto não reconhecido foram ignoradas)"
                        : "";
                    mensagem = $"Importação concluída com sucesso! {linhasValidas.Count} abastecimento(s) registrado(s).{msgIgnoradas}";
                    sucesso = true;
                }
                else
                {
                    mensagem = $"Nenhum registro importado. {linhasComErro.Count} linha(s) com erro. Baixe o arquivo para corrigir.";
                    sucesso = false;
                }

                await EnviarProgresso(connectionId, 100, "Concluído", sucesso ? "Importação finalizada!" : "Finalizado com erros");

                return Ok(new ResultadoImportacao
                {
                    Sucesso = sucesso,
                    Mensagem = mensagem,
                    TotalLinhas = linhas.Count,
                    LinhasImportadas = linhasValidas.Count,
                    LinhasComErro = linhasComErro.Count,
                    LinhasIgnoradas = linhasIgnoradas.Count,
                    Erros = erros.OrderBy(e => e.LinhaArquivoErros).ToList(),
                    LinhasImportadasLista = linhasImportadas,
                    ArquivoErros = arquivoErrosBase64,
                    NomeArquivoErros = nomeArquivoErros
                });
            }
            catch (Exception error)
            {
                await EnviarProgresso(connectionId, 0, "Erro", error.Message);
                Alerta.TratamentoErroComLinha("AbastecimentoController.cs", "ImportarNovo", error);
                return StatusCode(500, new ResultadoImportacao
                {
                    Sucesso = false,
                    Mensagem = $"Erro interno ao processar importação: {error.Message}"
                });
            }
        }

        private DateTime? ParseDataHora(string data, string hora)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(data))
                    return null;

                DateTime dataParsed;

                var formatosData = new[] { "dd/MM/yyyy", "d/M/yyyy", "yyyy-MM-dd", "dd-MM-yyyy" };
                bool dataOk = false;

                foreach (var formato in formatosData)
                {
                    if (DateTime.TryParseExact(data.Trim(), formato, CultureInfo.InvariantCulture, DateTimeStyles.None, out dataParsed))
                    {
                        dataOk = true;
                        break;
                    }
                }

                if (!dataOk)
                {
                    if (!DateTime.TryParse(data.Trim(), new CultureInfo("pt-BR"), DateTimeStyles.None, out dataParsed))
                    {
                        return null;
                    }
                }
                else
                {
                    DateTime.TryParseExact(data.Trim(), formatosData, CultureInfo.InvariantCulture, DateTimeStyles.None, out dataParsed);
                }

                if (!string.IsNullOrWhiteSpace(hora))
                {
                    if (TimeSpan.TryParse(hora.Trim(), out TimeSpan horaParsed))
                    {
                        dataParsed = dataParsed.Date.Add(horaParsed);
                    }
                }

                return dataParsed;
            }
            catch
            {
                return null;
            }
        }

        private string LimparProduto(string produto)
        {
            try
            {
                if (string.IsNullOrEmpty(produto)) return produto;

                produto = produto.Trim();

                if (produto.Length > 2 && char.IsDigit(produto[0]) && char.IsDigit(produto[1]) && produto[2] == '-')
                {
                    produto = produto.Substring(3).Trim();
                }

                return produto;
            }
            catch
            {
                return produto;
            }
        }

        private (bool Sucesso, string MensagemErro, List<LinhaImportacao> Linhas, MapeamentoColunas Mapeamento) LerPlanilhaDinamica(IFormFile file)
        {
            try
            {
                var linhas = new List<LinhaImportacao>();
                string extensao = Path.GetExtension(file.FileName).ToLower();
                var mapeamento = new MapeamentoColunas();

                using (var stream = file.OpenReadStream())
                {
                    ISheet sheet;
                    IWorkbook workbook;

                    if (extensao == ".xls")
                    {
                        workbook = new HSSFWorkbook(stream);
                    }
                    else
                    {
                        workbook = new XSSFWorkbook(stream);
                    }

                    sheet = workbook.GetSheetAt(0);

                    var headerRow = sheet.GetRow(0);
                    if (headerRow == null)
                    {
                        return (false, "Planilha sem cabeçalho", null, null);
                    }

                    for (int col = 0; col <= headerRow.LastCellNum; col++)
                    {
                        var cell = headerRow.GetCell(col);
                        if (cell == null) continue;

                        var header = GetCellStringValue(cell)?.Trim().ToLower();
                        if (string.IsNullOrEmpty(header)) continue;

                        switch (header)
                        {
                            case "autorização":
                            case "autorizacao":
                                mapeamento.Autorizacao = col;
                                break;
                            case "data":
                                mapeamento.Data = col;
                                break;
                            case "hora":
                                mapeamento.Hora = col;
                                break;
                            case "placa":
                                mapeamento.Placa = col;
                                break;
                            case "km":
                                mapeamento.Km = col;
                                break;
                            case "produto":
                                mapeamento.Produto = col;
                                break;
                            case "qtde":
                                mapeamento.Quantidade = col;
                                break;
                            case "valor unitário":
                            case "valor unitario":
                                mapeamento.ValorUnitario = col;
                                break;
                            case "rodado":
                                mapeamento.Rodado = col;
                                break;
                            case "codmotorista":
                                mapeamento.CodMotorista = col;
                                break;
                            case "kmanterior":
                                mapeamento.KmAnterior = col;
                                break;
                        }
                    }

                    if (!mapeamento.TodosMapeados)
                    {
                        var faltantes = mapeamento.ColunasFaltantes();
                        return (false, $"Colunas não encontradas na planilha: {string.Join(", ", faltantes)}", null, null);
                    }

                    for (int i = 1; i <= sheet.LastRowNum; i++)
                    {
                        var row = sheet.GetRow(i);
                        if (row == null) continue;

                        var placaCell = row.GetCell(mapeamento.Placa);
                        if (placaCell == null || string.IsNullOrWhiteSpace(GetCellStringValue(placaCell)))
                            continue;

                        var linha = new LinhaImportacao
                        {
                            NumeroLinhaOriginal = i + 1,
                            Autorizacao = GetCellIntValue(row.GetCell(mapeamento.Autorizacao)),
                            Data = GetCellStringValue(row.GetCell(mapeamento.Data))?.Trim(),
                            Hora = GetCellStringValue(row.GetCell(mapeamento.Hora))?.Trim(),
                            Placa = GetCellStringValue(row.GetCell(mapeamento.Placa))?.Trim().ToUpper(),
                            Km = GetCellIntValue(row.GetCell(mapeamento.Km)),
                            Produto = GetCellStringValue(row.GetCell(mapeamento.Produto))?.Trim(),
                            Quantidade = GetCellDoubleValue(row.GetCell(mapeamento.Quantidade)),
                            ValorUnitario = GetCellDoubleValue(row.GetCell(mapeamento.ValorUnitario)),
                            KmRodado = GetCellIntValue(row.GetCell(mapeamento.Rodado)),
                            CodMotorista = GetCellIntValue(row.GetCell(mapeamento.CodMotorista)),
                            KmAnterior = GetCellIntValue(row.GetCell(mapeamento.KmAnterior))
                        };

                        linhas.Add(linha);
                    }
                }

                return (true, null, linhas, mapeamento);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AbastecimentoController.cs", "LerPlanilhaDinamica", error);
                return (false, $"Erro ao ler planilha: {error.Message}", null, null);
            }
        }

        private byte[] GerarExcelErros(List<LinhaImportacao> linhasComErro, MapeamentoColunas mapeamento)
        {
            try
            {
                var workbook = new XSSFWorkbook();
                var sheet = workbook.CreateSheet("Linhas com Erro");

                var headerStyle = workbook.CreateCellStyle();
                var headerFont = workbook.CreateFont();
                headerFont.IsBold = true;
                headerStyle.SetFont(headerFont);
                headerStyle.FillForegroundColor = NPOI.HSSF.Util.HSSFColor.Grey25Percent.Index;
                headerStyle.FillPattern = FillPattern.SolidForeground;

                var erroStyle = workbook.CreateCellStyle();
                erroStyle.FillForegroundColor = NPOI.HSSF.Util.HSSFColor.Rose.Index;
                erroStyle.FillPattern = FillPattern.SolidForeground;

                var headerRow = sheet.CreateRow(0);
                var headers = new[] { "Linha Original", "Autorização", "Data", "Hora", "Placa", "KM",
                                      "Produto", "Qtde", "Valor Unitário", "Rodado", "CodMotorista",
                                      "KMAnterior", "ERROS" };

                for (int i = 0; i < headers.Length; i++)
                {
                    var cell = headerRow.CreateCell(i);
                    cell.SetCellValue(headers[i]);
                    cell.CellStyle = headerStyle;
                }

                int rowIndex = 1;
                foreach (var linha in linhasComErro)
                {
                    var row = sheet.CreateRow(rowIndex++);

                    row.CreateCell(0).SetCellValue(linha.NumeroLinhaOriginal);
                    row.CreateCell(1).SetCellValue(linha.Autorizacao);
                    row.CreateCell(2).SetCellValue(linha.Data ?? "");
                    row.CreateCell(3).SetCellValue(linha.Hora ?? "");
                    row.CreateCell(4).SetCellValue(linha.Placa ?? "");
                    row.CreateCell(5).SetCellValue(linha.Km);
                    row.CreateCell(6).SetCellValue(linha.Produto ?? "");
                    row.CreateCell(7).SetCellValue(linha.Quantidade);
                    row.CreateCell(8).SetCellValue(linha.ValorUnitario);
                    row.CreateCell(9).SetCellValue(linha.KmRodado);
                    row.CreateCell(10).SetCellValue(linha.CodMotorista);
                    row.CreateCell(11).SetCellValue(linha.KmAnterior);

                    var erroCell = row.CreateCell(12);
                    erroCell.SetCellValue(string.Join(" | ", linha.Erros));
                    erroCell.CellStyle = erroStyle;
                }

                for (int i = 0; i < headers.Length; i++)
                {
                    sheet.AutoSizeColumn(i);
                }

                using (var ms = new MemoryStream())
                {
                    workbook.Write(ms);
                    return ms.ToArray();
                }
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AbastecimentoController.cs", "GerarExcelErros", error);
                throw;
            }
        }

        private string GetCellStringValue(ICell cell)
        {
            try
            {
                if (cell == null) return null;

                return cell.CellType switch
                {
                    CellType.String => cell.StringCellValue,
                    CellType.Numeric => DateUtil.IsCellDateFormatted(cell)
                        ? cell.DateCellValue.ToString("dd/MM/yyyy")
                        : cell.NumericCellValue.ToString(),
                    CellType.Boolean => cell.BooleanCellValue.ToString(),
                    CellType.Formula => cell.ToString(),
                    _ => cell.ToString()
                };
            }
            catch
            {
                return cell?.ToString();
            }
        }

        private int GetCellIntValue(ICell cell)
        {
            try
            {
                if (cell == null) return 0;

                return cell.CellType switch
                {
                    CellType.Numeric => (int)cell.NumericCellValue,
                    CellType.String => int.TryParse(cell.StringCellValue, out int val) ? val : 0,
                    _ => int.TryParse(cell.ToString(), out int val2) ? val2 : 0
                };
            }
            catch
            {
                return 0;
            }
        }

        private double GetCellDoubleValue(ICell cell)
        {
            try
            {
                if (cell == null) return 0;

                return cell.CellType switch
                {
                    CellType.Numeric => cell.NumericCellValue,
                    CellType.String => double.TryParse(
                        cell.StringCellValue.Replace(",", "."),
                        NumberStyles.Any,
                        CultureInfo.InvariantCulture,
                        out double val) ? val : 0,
                    _ => double.TryParse(cell.ToString(), out double val2) ? val2 : 0
                };
            }
            catch
            {
                return 0;
            }
        }

        [Route("ExcluirPorData")]
        [HttpPost]
        public IActionResult ExcluirPorData([FromBody] ImportacaoRequest request)
        {
            try
            {
                var dataInicio = request.DataAbastecimento.Date;
                var dataFim = dataInicio.AddDays(1);

                var registros = _unitOfWork.Abastecimento.GetAll()
                    .Where(a => a.DataHora >= dataInicio && a.DataHora < dataFim)
                    .ToList();

                if (!registros.Any())
                {
                    return Ok(new
                    {
                        success = false,
                        message = $"Nenhum registro encontrado para {dataInicio:dd/MM/yyyy}"
                    });
                }

                int quantidade = registros.Count;

                foreach (var registro in registros)
                {
                    _unitOfWork.Abastecimento.Remove(registro);
                }

                _unitOfWork.Save();

                return Ok(new
                {
                    success = true,
                    message = $"{quantidade} abastecimento(s) excluído(s) com sucesso para {dataInicio:dd/MM/yyyy}"
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AbastecimentoController.cs", "ExcluirPorData", error);
                return StatusCode(500, new { success = false, message = error.Message });
            }
        }
    }
}
