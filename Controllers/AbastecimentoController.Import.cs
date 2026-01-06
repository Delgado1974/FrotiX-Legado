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
using CsvHelper;
using CsvHelper.Configuration;
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
            
            // Campos para sugestão de correção de KM
            public bool TemSugestao { get; set; }
            public string CampoCorrecao { get; set; }
            public int ValorAtualErrado { get; set; }
            public int ValorSugerido { get; set; }
            public string JustificativaSugestao { get; set; }
            public double MediaConsumoVeiculo { get; set; }
        }

        public class ResultadoImportacao
        {
            public bool Sucesso { get; set; }
            public string Mensagem { get; set; }
            public int TotalLinhas { get; set; }
            public int LinhasImportadas { get; set; }
            public int LinhasComErro { get; set; }
            public int LinhasIgnoradas { get; set; }
            public int LinhasCorrigiveis { get; set; }
            public List<ErroImportacao> Erros { get; set; } = new List<ErroImportacao>();
            public List<LinhaImportadaDTO> LinhasImportadasLista { get; set; } = new List<LinhaImportadaDTO>();
            public string ArquivoErros { get; set; }
            public string NomeArquivoErros { get; set; }
            public int PendenciasGeradas { get; set; }
        }

        public class ErroImportacao
        {
            public int LinhaOriginal { get; set; }
            public int LinhaArquivoErros { get; set; }
            public string Tipo { get; set; }
            public string Descricao { get; set; }
            public string Icone { get; set; }
            
            // Campos para sugestão de correção (erros de KM)
            public bool Corrigivel { get; set; }
            public string CampoCorrecao { get; set; }
            public int ValorAtual { get; set; }
            public int ValorSugerido { get; set; }
            public string JustificativaSugestao { get; set; }
            
            // Dados da linha para correção via API
            public int Autorizacao { get; set; }
            public string Placa { get; set; }
            public int KmAnterior { get; set; }
            public int Km { get; set; }
            public int KmRodado { get; set; }
            public double Litros { get; set; }
            public string VeiculoId { get; set; }
            public string MotoristaId { get; set; }
            public string CombustivelId { get; set; }
            public string DataHora { get; set; }
            public double ValorUnitario { get; set; }
            public string NomeMotorista { get; set; }
            public string Produto { get; set; }
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

        // DTOs para importação dual (CSV + XLSX)
        public class LinhaCsv
        {
            public int Autorizacao { get; set; }
            public string Placa { get; set; }
            public int Km { get; set; }
            public string Produto { get; set; }
            public double Qtde { get; set; }
            public double VrUnitario { get; set; }
            public int Rodado { get; set; }
            public int CodMotorista { get; set; }
            public int KmAnterior { get; set; }
        }

        public class LinhaXlsx
        {
            public int Autorizacao { get; set; }
            public DateTime DataHora { get; set; }
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

            // Campos obrigatórios: Autorização, Data, Placa, Km, Produto, Quantidade, ValorUnitario
            // Campos opcionais: Hora, Rodado, CodMotorista, KmAnterior
            public bool TodosMapeados => Autorizacao >= 0 && Data >= 0 && Placa >= 0 &&
                                         Km >= 0 && Produto >= 0 && Quantidade >= 0 && ValorUnitario >= 0;

            public List<string> ColunasFaltantes()
            {
                var faltantes = new List<string>();
                if (Autorizacao < 0) faltantes.Add("Autorização");
                if (Data < 0) faltantes.Add("Data");
                if (Placa < 0) faltantes.Add("Placa");
                if (Km < 0) faltantes.Add("KM");
                if (Produto < 0) faltantes.Add("Produto");
                if (Quantidade < 0) faltantes.Add("Qtde");
                if (ValorUnitario < 0) faltantes.Add("Valor Unitário");
                // Não adiciona opcionais: Hora, Rodado, CodMotorista, KmAnterior
                return faltantes;
            }
        }

        /// <summary>
        /// Envia atualização de progresso via SignalR
        /// </summary>
        private async Task EnviarProgresso(string connectionId, int porcentagem, string etapa, string detalhe,
            int linhaAtual = 0, int totalLinhas = 0,
            int xlsxAtual = 0, int xlsxTotal = 0,
            int csvAtual = 0, int csvTotal = 0,
            int processAtual = 0, int processTotal = 0)
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
                    TotalLinhas = totalLinhas,
                    XlsxAtual = xlsxAtual,
                    XlsxTotal = xlsxTotal,
                    CsvAtual = csvAtual,
                    CsvTotal = csvTotal,
                    ProcessAtual = processAtual,
                    ProcessTotal = processTotal
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AbastecimentoController.cs", "EnviarProgresso", error);
            }
        }

        /// <summary>
        /// Envia resumo da planilha via SignalR (após análise inicial)
        /// </summary>
        private async Task EnviarResumoPlnailha(string connectionId, int totalRegistros, string dataInicial, string dataFinal, 
            int registrosGasolina, int registrosDiesel, int registrosOutros)
        {
            try
            {
                if (string.IsNullOrEmpty(connectionId) || _hubContext == null)
                    return;

                await _hubContext.Clients.Client(connectionId).SendAsync("ProgressoImportacao", new ProgressoImportacao
                {
                    Porcentagem = 20,
                    Etapa = "Planilha analisada",
                    Detalhe = $"{totalRegistros} registros de {dataInicial} a {dataFinal}",
                    ResumoDisponivel = true,
                    TotalRegistros = totalRegistros,
                    DataInicial = dataInicial,
                    DataFinal = dataFinal,
                    RegistrosGasolina = registrosGasolina,
                    RegistrosDiesel = registrosDiesel,
                    RegistrosOutros = registrosOutros
                });
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AbastecimentoController.cs", "EnviarResumoPlnailha", error);
            }
        }

        [Route("ImportarNovo")]
        [HttpPost]
        public async Task<ActionResult> ImportarNovo()
        {
            string connectionId = null;
            string nomeArquivo = "";

            try
            {
                // ⭐ BLINDAGEM: Remover validação das propriedades de navegação
                // Evita erro "The Veiculo/Motorista/Combustivel field is required" em produção
                ModelState.Remove("Veiculo");
                ModelState.Remove("Motorista");
                ModelState.Remove("Combustivel");

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
                nomeArquivo = file.FileName;

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

                // === ETAPA 2.5: Analisar planilha e enviar resumo (17-20%) ===
                await EnviarProgresso(connectionId, 17, "Analisando planilha", "Identificando período e produtos...");

                var datasValidas = linhas
                    .Select(l => ParseDataHora(l.Data, l.Hora))
                    .Where(d => d.HasValue)
                    .Select(d => d.Value)
                    .OrderBy(d => d)
                    .ToList();

                string dataInicial = datasValidas.Any() ? datasValidas.First().ToString("dd/MM/yyyy") : "N/A";
                string dataFinal = datasValidas.Any() ? datasValidas.Last().ToString("dd/MM/yyyy") : "N/A";

                int registrosGasolina = linhas.Count(l => 
                    LimparProduto(l.Produto)?.Equals("Gasolina Comum", StringComparison.OrdinalIgnoreCase) == true);
                int registrosDiesel = linhas.Count(l => 
                    LimparProduto(l.Produto)?.Equals("Diesel S-10", StringComparison.OrdinalIgnoreCase) == true);
                int registrosOutros = totalLinhas - registrosGasolina - registrosDiesel;

                await EnviarResumoPlnailha(connectionId, totalLinhas, dataInicial, dataFinal, 
                    registrosGasolina, registrosDiesel, registrosOutros);

                // === ETAPA 3: Carregar dados de referência (20-25%) ===
                await EnviarProgresso(connectionId, 21, "Carregando dados", "Buscando veículos cadastrados...");
                var veiculos = _unitOfWork.Veiculo.GetAll().ToList();

                await EnviarProgresso(connectionId, 22, "Carregando dados", "Buscando motoristas cadastrados...");
                var motoristas = _unitOfWork.Motorista.GetAll().ToList();

                await EnviarProgresso(connectionId, 23, "Carregando dados", "Verificando autorizações existentes...");
                var autorizacoesExistentes = _unitOfWork.Abastecimento.GetAll()
                    .Where(a => a.AutorizacaoQCard.HasValue)
                    .Select(a => a.AutorizacaoQCard.Value)
                    .ToHashSet();

                await EnviarProgresso(connectionId, 24, "Carregando dados", "Calculando médias de consumo...");
                var mediasConsumo = _unitOfWork.ViewMediaConsumo.GetAll()
                    .ToDictionary(m => m.VeiculoId, m => m.ConsumoGeral ?? 0);

                await EnviarProgresso(connectionId, 25, "Carregando dados", "Dados de referência carregados");

                var mapaCombustivel = new Dictionary<string, Guid>(StringComparer.OrdinalIgnoreCase)
                {
                    { "Gasolina Comum", Guid.Parse("f668f660-8380-4df3-90cd-787db06fe734") },
                    { "Diesel S-10", Guid.Parse("a69aa86a-9162-4242-ab9a-8b184e04c4da") }
                };

                // === ETAPA 4: Validar linhas (25-70%) ===
                int linhaProcessada = 0;
                int intervaloAtualizacao = Math.Max(1, totalLinhas / 50);

                foreach (var linha in linhas)
                {
                    linhaProcessada++;

                    if (linhaProcessada % intervaloAtualizacao == 0 || linhaProcessada == totalLinhas)
                    {
                        int porcentagemValidacao = 25 + (int)((linhaProcessada / (double)totalLinhas) * 45);
                        await EnviarProgresso(connectionId, porcentagemValidacao, "Validando linhas",
                            $"Processando linha {linhaProcessada} de {totalLinhas}...",
                            linhaAtual: linhaProcessada, totalLinhas: totalLinhas,
                            processAtual: linhaProcessada, processTotal: totalLinhas);
                    }

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

                    Guid combustivelId;
                    if (mapaCombustivel.TryGetValue(produtoLimpo, out combustivelId))
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

                        // Validação inteligente de quilometragem com sugestões
                        if (linha.VeiculoId.HasValue)
                        {
                            double mediaConsumo = 0;
                            decimal mediaTemp;
                            if (mediasConsumo.TryGetValue(linha.VeiculoId.Value, out mediaTemp))
                            {
                                mediaConsumo = (double)mediaTemp;
                            }
                            linha.MediaConsumoVeiculo = mediaConsumo;

                            int kmRodadoEsperado = mediaConsumo > 0 
                                ? (int)(linha.Quantidade * mediaConsumo) 
                                : 150;

                            if (linha.KmRodado < 0)
                            {
                                linha.Erros.Add($"Quilometragem negativa ({linha.KmRodado} km): Km Anterior maior que Km Atual");
                                
                                int kmAnteriorSugerido = linha.Km - kmRodadoEsperado;
                                if (kmAnteriorSugerido > 0)
                                {
                                    linha.TemSugestao = true;
                                    linha.CampoCorrecao = "KmAnterior";
                                    linha.ValorAtualErrado = linha.KmAnterior;
                                    linha.ValorSugerido = kmAnteriorSugerido;
                                    linha.JustificativaSugestao = mediaConsumo > 0
                                        ? $"Baseado na média de {mediaConsumo:N1} km/l do veículo, o KM Anterior deveria ser aproximadamente {kmAnteriorSugerido:N0}"
                                        : $"Baseado em consumo padrão, o KM Anterior deveria ser aproximadamente {kmAnteriorSugerido:N0}";
                                }
                            }
                            else if (linha.KmRodado > 1000)
                            {
                                double consumoAtual = linha.Quantidade > 0 ? linha.KmRodado / linha.Quantidade : 0;
                                double mediaReferencia = mediaConsumo > 0 ? mediaConsumo : 10;
                                double limiteInferior = mediaReferencia * 0.6;
                                double limiteSuperior = mediaReferencia * 1.4;
                                bool consumoDentroDoEsperado = consumoAtual >= limiteInferior && consumoAtual <= limiteSuperior;
                                
                                if (consumoDentroDoEsperado)
                                {
                                    // Viagem longa legítima - NÃO adiciona erro
                                }
                                else if (consumoAtual > limiteSuperior)
                                {
                                    linha.Erros.Add($"Quilometragem de {linha.KmRodado} km excede o limite e consumo de {consumoAtual:N1} km/l está muito acima da média ({mediaReferencia:N1} km/l)");
                                    
                                    int kmAnteriorSugerido = linha.Km - kmRodadoEsperado;
                                    if (kmAnteriorSugerido > 0)
                                    {
                                        linha.TemSugestao = true;
                                        linha.CampoCorrecao = "KmAnterior";
                                        linha.ValorAtualErrado = linha.KmAnterior;
                                        linha.ValorSugerido = kmAnteriorSugerido;
                                        linha.JustificativaSugestao = $"Consumo de {consumoAtual:N1} km/l está muito acima da média ({mediaReferencia:N1} km/l). Provável erro no KM Anterior.";
                                    }
                                }
                                else
                                {
                                    linha.Erros.Add($"Quilometragem de {linha.KmRodado} km excede o limite e consumo de {consumoAtual:N1} km/l está muito abaixo da média ({mediaReferencia:N1} km/l)");
                                    
                                    int kmSugerido = linha.KmAnterior + kmRodadoEsperado;
                                    linha.TemSugestao = true;
                                    linha.CampoCorrecao = "Km";
                                    linha.ValorAtualErrado = linha.Km;
                                    linha.ValorSugerido = kmSugerido;
                                    linha.JustificativaSugestao = $"Consumo de {consumoAtual:N1} km/l está muito abaixo da média ({mediaReferencia:N1} km/l). Provável erro no KM Atual.";
                                }
                            }
                        }
                        else
                        {
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

                    // Buscar autorizações já existentes na tabela de abastecimentos para evitar duplicatas
                    var autorizacoesAbastecimento = _unitOfWork.Abastecimento
                        .GetAll()
                        .Select(a => a.AutorizacaoQCard)
                        .Where(a => a.HasValue)
                        .Select(a => a.Value)
                        .ToHashSet();

                    // Filtrar linhas válidas removendo duplicatas
                    var linhasParaGravar = linhasValidas
                        .Where(l => l.Autorizacao <= 0 || !autorizacoesAbastecimento.Contains(l.Autorizacao))
                        .ToList();

                    int linhasIgnoradasDuplicadas = linhasValidas.Count - linhasParaGravar.Count;

                    int linhaGravada = 0;
                    int intervaloGravacao = Math.Max(1, linhasParaGravar.Count / 20);

                    using (var scope = new TransactionScope(
                        TransactionScopeOption.RequiresNew,
                        new TimeSpan(0, 30, 0),
                        TransactionScopeAsyncFlowOption.Enabled))
                    {
                        foreach (var linha in linhasParaGravar)
                        {
                            linhaGravada++;

                            if (linhaGravada % intervaloGravacao == 0 || linhaGravada == linhasParaGravar.Count)
                            {
                                int porcentagemGravacao = 72 + (int)((linhaGravada / (double)linhasParaGravar.Count) * 15);
                                await EnviarProgresso(connectionId, porcentagemGravacao, "Gravando dados",
                                    $"Salvando registro {linhaGravada} de {linhasParaGravar.Count}...", linhaGravada, linhasParaGravar.Count);
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

                // === ETAPA 6: GRAVAR PENDÊNCIAS NA TABELA (90-98%) ===
                var erros = new List<ErroImportacao>();
                int linhasCorrigiveis = 0;
                int pendenciasGeradas = 0;

                if (linhasComErro.Any())
                {
                    await EnviarProgresso(connectionId, 92, "Salvando pendências", $"Gravando {linhasComErro.Count} pendência(s)...");

                    // Buscar autorizações já existentes na tabela de pendências para evitar duplicatas
                    var autorizacoesPendentes = _unitOfWork.AbastecimentoPendente
                        .GetAll(p => p.Status == 0) // Apenas pendentes
                        .Select(p => p.AutorizacaoQCard)
                        .Where(a => a.HasValue)
                        .Select(a => a.Value)
                        .ToHashSet();

                    foreach (var linha in linhasComErro)
                    {
                        // Ignorar se já existe pendência com mesma autorização
                        if (linha.Autorizacao > 0 && autorizacoesPendentes.Contains(linha.Autorizacao))
                        {
                            continue; // Já existe, ignorar silenciosamente
                        }

                        bool linhaPossuiSugestao = linha.TemSugestao;
                        if (linhaPossuiSugestao) linhasCorrigiveis++;

                        // Determinar tipo principal do erro
                        string tipoPrincipal = DeterminarTipoPendencia(linha.Erros);
                        string descricaoCompleta = string.Join("; ", linha.Erros);

                        // Criar registro na tabela de pendências
                        var pendencia = new AbastecimentoPendente
                        {
                            AbastecimentoPendenteId = Guid.NewGuid(),
                            AutorizacaoQCard = linha.Autorizacao,
                            Placa = linha.Placa,
                            CodMotorista = linha.CodMotorista,
                            NomeMotorista = linha.NomeMotorista,
                            Produto = linha.Produto,
                            DataHora = linha.DataHoraParsed,
                            KmAnterior = linha.KmAnterior,
                            Km = linha.Km,
                            KmRodado = linha.KmRodado,
                            Litros = linha.Quantidade,
                            ValorUnitario = linha.ValorUnitario,
                            VeiculoId = linha.VeiculoId,
                            MotoristaId = linha.MotoristaId,
                            CombustivelId = linha.CombustivelId,
                            DescricaoPendencia = descricaoCompleta,
                            TipoPendencia = tipoPrincipal,
                            TemSugestao = linha.TemSugestao,
                            CampoCorrecao = linha.CampoCorrecao,
                            ValorAtualErrado = linha.ValorAtualErrado,
                            ValorSugerido = linha.ValorSugerido,
                            JustificativaSugestao = linha.JustificativaSugestao,
                            MediaConsumoVeiculo = linha.MediaConsumoVeiculo,
                            DataImportacao = DateTime.Now,
                            NumeroLinhaOriginal = linha.NumeroLinhaOriginal,
                            ArquivoOrigem = nomeArquivo,
                            Status = 0 // Pendente
                        };

                        _unitOfWork.AbastecimentoPendente.Add(pendencia);
                        pendenciasGeradas++;

                        // Manter lista de erros para o retorno
                        foreach (var erro in linha.Erros)
                        {
                            string tipo = "erro";
                            string icone = "fa-circle-xmark";
                            bool erroCorrigivel = false;

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
                                erroCorrigivel = linhaPossuiSugestao;
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
                                Icone = icone,
                                Corrigivel = erroCorrigivel,
                                CampoCorrecao = erroCorrigivel ? linha.CampoCorrecao : null,
                                ValorAtual = erroCorrigivel ? linha.ValorAtualErrado : 0,
                                ValorSugerido = erroCorrigivel ? linha.ValorSugerido : 0,
                                JustificativaSugestao = erroCorrigivel ? linha.JustificativaSugestao : null,
                                Autorizacao = linha.Autorizacao,
                                Placa = linha.Placa,
                                KmAnterior = linha.KmAnterior,
                                Km = linha.Km,
                                KmRodado = linha.KmRodado,
                                Litros = linha.Quantidade,
                                VeiculoId = linha.VeiculoId?.ToString(),
                                MotoristaId = linha.MotoristaId?.ToString(),
                                CombustivelId = linha.CombustivelId?.ToString(),
                                DataHora = linha.DataHoraParsed?.ToString("dd/MM/yyyy HH:mm"),
                                ValorUnitario = linha.ValorUnitario,
                                NomeMotorista = linha.NomeMotorista,
                                Produto = linha.Produto
                            });
                        }
                    }

                    await EnviarProgresso(connectionId, 95, "Salvando pendências", "Gravando no banco de dados...");
                    _unitOfWork.Save();
                }

                // === ETAPA 7: Finalizar (98-100%) ===
                await EnviarProgresso(connectionId, 98, "Finalizando", "Preparando resultado...");

                string mensagem;
                bool sucesso;
                int totalIgnoradas = linhasIgnoradas.Count + (linhasValidas.Count - linhasImportadas.Count);

                if (linhasImportadas.Any() && linhasComErro.Any())
                {
                    mensagem = $"Importação parcial concluída! {linhasImportadas.Count} abastecimento(s) importado(s), " +
                               $"{pendenciasGeradas} pendência(s) gerada(s). Acesse a tela de Pendências para resolver.";
                    sucesso = true;
                }
                else if (linhasImportadas.Any())
                {
                    var msgIgnoradas = totalIgnoradas > 0
                        ? $" ({totalIgnoradas} linha(s) ignorada(s) - produto não reconhecido ou duplicada)"
                        : "";
                    mensagem = $"Importação concluída com sucesso! {linhasImportadas.Count} abastecimento(s) registrado(s).{msgIgnoradas}";
                    sucesso = true;
                }
                else
                {
                    mensagem = $"Nenhum registro importado. {pendenciasGeradas} pendência(s) gerada(s). Acesse a tela de Pendências para resolver.";
                    sucesso = false;
                }

                await EnviarProgresso(connectionId, 100, "Concluído", sucesso ? "Importação finalizada!" : "Finalizado com pendências");

                return Ok(new ResultadoImportacao
                {
                    Sucesso = sucesso,
                    Mensagem = mensagem,
                    TotalLinhas = linhas.Count,
                    LinhasImportadas = linhasImportadas.Count,
                    LinhasComErro = linhasComErro.Count,
                    LinhasIgnoradas = totalIgnoradas,
                    LinhasCorrigiveis = linhasCorrigiveis,
                    Erros = erros.OrderBy(e => e.LinhaArquivoErros).ToList(),
                    LinhasImportadasLista = linhasImportadas,
                    PendenciasGeradas = pendenciasGeradas
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

        /// <summary>
        /// Determina o tipo principal da pendência baseado nos erros
        /// </summary>
        private string DeterminarTipoPendencia(List<string> erros)
        {
            try
            {
                foreach (var erro in erros)
                {
                    if (erro.Contains("Autorização")) return "autorizacao";
                    if (erro.Contains("Veículo") || erro.Contains("placa")) return "veiculo";
                    if (erro.Contains("Motorista")) return "motorista";
                    if (erro.Contains("Quilometragem") || erro.Contains("km")) return "km";
                    if (erro.Contains("litros")) return "litros";
                    if (erro.Contains("Data") || erro.Contains("Hora")) return "data";
                }
                return "erro";
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AbastecimentoController.cs", "DeterminarTipoPendencia", error);
                return "erro";
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
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AbastecimentoController.cs", "ParseDataHora", error);
                return null;
            }
        }

        private string LimparProduto(string produto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(produto))
                    return null;

                produto = produto.Trim();

                if (produto.Contains("Gasolina", StringComparison.OrdinalIgnoreCase))
                    return "Gasolina Comum";

                if (produto.Contains("Diesel", StringComparison.OrdinalIgnoreCase) ||
                    produto.Contains("S-10", StringComparison.OrdinalIgnoreCase) ||
                    produto.Contains("S10", StringComparison.OrdinalIgnoreCase))
                    return "Diesel S-10";

                return produto;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AbastecimentoController.cs", "LimparProduto", error);
                return null;
            }
        }

        private class ResultadoLeituraPlanilha
        {
            public bool Sucesso { get; set; }
            public string MensagemErro { get; set; }
            public List<LinhaImportacao> Linhas { get; set; } = new List<LinhaImportacao>();
            public MapeamentoColunas Mapeamento { get; set; }
        }

        private ResultadoLeituraPlanilha LerPlanilhaDinamica(IFormFile file)
        {
            try
            {
                var resultado = new ResultadoLeituraPlanilha();
                string sFileExtension = Path.GetExtension(file.FileName).ToLower();

                using (var stream = file.OpenReadStream())
                {
                    IWorkbook workbook;
                    if (sFileExtension == ".xls")
                    {
                        workbook = new HSSFWorkbook(stream);
                    }
                    else if (sFileExtension == ".xlsx")
                    {
                        workbook = new XSSFWorkbook(stream);
                    }
                    else
                    {
                        resultado.Sucesso = false;
                        resultado.MensagemErro = "Formato de arquivo não suportado. Use .xls ou .xlsx";
                        return resultado;
                    }

                    ISheet sheet = workbook.GetSheetAt(0);
                    if (sheet == null)
                    {
                        resultado.Sucesso = false;
                        resultado.MensagemErro = "Planilha vazia ou inválida";
                        return resultado;
                    }

                    // ===== DETECTAR LINHA DO CABEÇALHO AUTOMATICAMENTE =====
                    int headerRowIndex = -1;
                    IRow headerRow = null;

                    // Procurar cabeçalho nas primeiras 5 linhas
                    for (int r = 0; r < Math.Min(5, sheet.LastRowNum + 1); r++)
                    {
                        IRow row = sheet.GetRow(r);
                        if (row == null) continue;

                        // Verificar se a linha contém palavras-chave de cabeçalho
                        for (int c = 0; c < row.LastCellNum; c++)
                        {
                            var cell = row.GetCell(c);
                            if (cell == null) continue;

                            string cellValue = cell.ToString().Trim().ToLower();

                            if (cellValue.Contains("autori") ||
                                (cellValue.Contains("data") && !cellValue.Contains("relat")))
                            {
                                headerRowIndex = r;
                                headerRow = row;
                                break;
                            }
                        }

                        if (headerRowIndex >= 0) break;
                    }

                    if (headerRow == null)
                    {
                        resultado.Sucesso = false;
                        resultado.MensagemErro = "Cabeçalho não encontrado na planilha. Verifique se contém as colunas: Data, Autorização, Placa, KM, Produto, Qtde, Valor Unitário";
                        return resultado;
                    }

                    // ===== MAPEAR COLUNAS =====
                    var mapeamento = new MapeamentoColunas();

                    for (int col = 0; col < headerRow.LastCellNum; col++)
                    {
                        var cell = headerRow.GetCell(col);
                        if (cell == null) continue;

                        string header = cell.ToString().Trim().ToLower();

                        if (header.Contains("autori")) mapeamento.Autorizacao = col;
                        else if (header.Contains("data") && !header.Contains("hora")) mapeamento.Data = col;
                        else if (header.Contains("hora")) mapeamento.Hora = col;
                        else if (header.Contains("placa")) mapeamento.Placa = col;
                        else if (header == "km" || header.Contains("odômetro") || header.Contains("odometro")) mapeamento.Km = col;
                        else if (header.Contains("produto") || header.Contains("combustível") || header.Contains("combustivel")) mapeamento.Produto = col;
                        else if (header.Contains("qtde") || header.Contains("quantidade") || header.Contains("litros")) mapeamento.Quantidade = col;
                        else if (header.Contains("unitário") || header.Contains("unitario") || header.Contains("unit")) mapeamento.ValorUnitario = col;
                        else if (header.Contains("rodado")) mapeamento.Rodado = col;
                        else if (header.Contains("codmotorista") || header.Contains("cód motorista") || header.Contains("cod motorista")) mapeamento.CodMotorista = col;
                        else if (header.Contains("kmanterior") || header.Contains("km anterior")) mapeamento.KmAnterior = col;
                    }

                    if (!mapeamento.TodosMapeados)
                    {
                        resultado.Sucesso = false;
                        resultado.MensagemErro = $"Colunas obrigatórias não encontradas na planilha: {string.Join(", ", mapeamento.ColunasFaltantes())}";
                        return resultado;
                    }

                    resultado.Mapeamento = mapeamento;

                    // ===== LER LINHAS DE DADOS =====
                    for (int row = headerRowIndex + 1; row <= sheet.LastRowNum; row++)
                    {
                        IRow dataRow = sheet.GetRow(row);
                        if (dataRow == null) continue;

                        var autorizacaoCell = dataRow.GetCell(mapeamento.Autorizacao);
                        if (autorizacaoCell == null || string.IsNullOrWhiteSpace(autorizacaoCell.ToString()))
                            continue;

                        // ===== EXTRAIR DATA E HORA =====
                        string dataStr = null;
                        string horaStr = null;

                        var dataCellValue = GetCellStringValueWithDateTime(dataRow.GetCell(mapeamento.Data));
                        if (dataCellValue != null && dataCellValue.Contains(" "))
                        {
                            // Data e Hora juntas (ex: "06/12/2024 10:10")
                            var partes = dataCellValue.Split(' ');
                            dataStr = partes[0];
                            horaStr = partes.Length > 1 ? partes[1] : null;
                        }
                        else
                        {
                            dataStr = dataCellValue;
                            horaStr = mapeamento.Hora >= 0 ? GetCellStringValue(dataRow.GetCell(mapeamento.Hora)) : null;
                        }

                        // ===== EXTRAIR PRODUTO (REMOVER PREFIXO) =====
                        string produtoRaw = GetCellStringValue(dataRow.GetCell(mapeamento.Produto));
                        string produtoLimpo = produtoRaw;

                        if (!string.IsNullOrEmpty(produtoRaw))
                        {
                            // Remover prefixos como "01-", "14-", etc.
                            if (System.Text.RegularExpressions.Regex.IsMatch(produtoRaw, @"^\d{1,2}-"))
                            {
                                produtoLimpo = System.Text.RegularExpressions.Regex.Replace(produtoRaw, @"^\d{1,2}-", "").Trim();
                            }
                        }

                        var linha = new LinhaImportacao
                        {
                            NumeroLinhaOriginal = row + 1,
                            Autorizacao = GetCellIntValue(dataRow.GetCell(mapeamento.Autorizacao)),
                            Data = dataStr,
                            Hora = horaStr,
                            Placa = GetCellStringValue(dataRow.GetCell(mapeamento.Placa))?.ToUpper(),
                            Km = GetCellIntValue(dataRow.GetCell(mapeamento.Km)),
                            Produto = produtoLimpo,
                            Quantidade = GetCellDoubleValue(dataRow.GetCell(mapeamento.Quantidade)),
                            ValorUnitario = GetCellDoubleValue(dataRow.GetCell(mapeamento.ValorUnitario)),
                            KmRodado = mapeamento.Rodado >= 0 ? GetCellIntValue(dataRow.GetCell(mapeamento.Rodado)) : 0,
                            CodMotorista = mapeamento.CodMotorista >= 0 ? GetCellIntValue(dataRow.GetCell(mapeamento.CodMotorista)) : 0,
                            KmAnterior = mapeamento.KmAnterior >= 0 ? GetCellIntValue(dataRow.GetCell(mapeamento.KmAnterior)) : 0
                        };

                        resultado.Linhas.Add(linha);
                    }

                    resultado.Sucesso = true;
                    return resultado;
                }
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AbastecimentoController.cs", "LerPlanilhaDinamica", error);
                return new ResultadoLeituraPlanilha
                {
                    Sucesso = false,
                    MensagemErro = $"Erro ao ler planilha: {error.Message}"
                };
            }
        }

        private string GetCellStringValue(ICell cell)
        {
            try
            {
                if (cell == null) return null;

                switch (cell.CellType)
                {
                    case CellType.Numeric:
                        if (DateUtil.IsCellDateFormatted(cell))
                        {
                            return cell.DateCellValue.ToString("dd/MM/yyyy");
                        }
                        return cell.NumericCellValue.ToString();
                    case CellType.String:
                        return cell.StringCellValue?.Trim();
                    case CellType.Boolean:
                        return cell.BooleanCellValue.ToString();
                    case CellType.Formula:
                        try
                        {
                            return cell.StringCellValue?.Trim();
                        }
                        catch
                        {
                            return cell.NumericCellValue.ToString();
                        }
                    default:
                        return cell.ToString()?.Trim();
                }
            }
            catch
            {
                return null;
            }
        }

        private string GetCellStringValueWithDateTime(ICell cell)
        {
            try
            {
                if (cell == null) return null;

                switch (cell.CellType)
                {
                    case CellType.Numeric:
                        if (DateUtil.IsCellDateFormatted(cell))
                        {
                            // Retorna com data E hora
                            return cell.DateCellValue.ToString("dd/MM/yyyy HH:mm");
                        }
                        return cell.NumericCellValue.ToString();
                    case CellType.String:
                        return cell.StringCellValue?.Trim();
                    case CellType.Boolean:
                        return cell.BooleanCellValue.ToString();
                    case CellType.Formula:
                        try
                        {
                            return cell.StringCellValue?.Trim();
                        }
                        catch
                        {
                            return cell.NumericCellValue.ToString();
                        }
                    default:
                        return cell.ToString()?.Trim();
                }
            }
            catch
            {
                return null;
            }
        }

        private int GetCellIntValue(ICell cell)
        {
            try
            {
                if (cell == null) return 0;

                int resultado;
                switch (cell.CellType)
                {
                    case CellType.Numeric:
                        return (int)cell.NumericCellValue;
                    case CellType.String:
                        if (int.TryParse(cell.StringCellValue, out resultado))
                            return resultado;
                        return 0;
                    default:
                        if (int.TryParse(cell.ToString(), out resultado))
                            return resultado;
                        return 0;
                }
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

                double resultado;
                switch (cell.CellType)
                {
                    case CellType.Numeric:
                        return cell.NumericCellValue;
                    case CellType.String:
                        if (double.TryParse(cell.StringCellValue.Replace(",", "."), NumberStyles.Any, CultureInfo.InvariantCulture, out resultado))
                            return resultado;
                        return 0;
                    default:
                        if (double.TryParse(cell.ToString(), out resultado))
                            return resultado;
                        return 0;
                }
            }
            catch
            {
                return 0;
            }
        }

        /// <summary>
        /// Lê arquivo CSV e retorna Dictionary com chave = Autorizacao
        /// </summary>
        private async Task<Dictionary<int, LinhaCsv>> LerArquivoCsvAsync(IFormFile file, string connectionId = null)
        {
            try
            {
                var resultado = new Dictionary<int, LinhaCsv>();

                using (var reader = new StreamReader(file.OpenReadStream(), Encoding.GetEncoding("ISO-8859-1")))
                using (var csv = new CsvReader(reader, new CsvConfiguration(CultureInfo.InvariantCulture)
                {
                    Delimiter = ",",
                    MissingFieldFound = null,
                    HeaderValidated = null,
                    BadDataFound = null
                }))
                {
                    var registros = csv.GetRecords<LinhaCsv>().ToList();
                    int totalLinhasCsv = registros.Count;
                    int linhaAtual = 0;
                    int intervaloAtualizacao = Math.Max(1, totalLinhasCsv / 20); // Atualizar a cada 5%

                    foreach (var registro in registros)
                    {
                        linhaAtual++;

                        // Enviar progresso a cada N linhas
                        if (!string.IsNullOrEmpty(connectionId) && (linhaAtual % intervaloAtualizacao == 0 || linhaAtual == totalLinhasCsv))
                        {
                            await EnviarProgresso(connectionId, 12, "Lendo CSV", $"Linha {linhaAtual}/{totalLinhasCsv}",
                                csvAtual: linhaAtual, csvTotal: totalLinhasCsv);
                        }

                        if (registro.Autorizacao > 0 && !resultado.ContainsKey(registro.Autorizacao))
                        {
                            resultado[registro.Autorizacao] = registro;
                        }
                    }
                }

                return resultado;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AbastecimentoController.cs", "LerArquivoCsv", error);
                return new Dictionary<int, LinhaCsv>();
            }
        }

        /// <summary>
        /// Lê arquivo XLSX extraindo apenas Data+Hora e Autorizacao
        /// </summary>
        private async Task<Dictionary<int, LinhaXlsx>> LerArquivoXlsxAsync(IFormFile file, string connectionId = null)
        {
            try
            {
                var resultado = new Dictionary<int, LinhaXlsx>();
                string sFileExtension = Path.GetExtension(file.FileName).ToLower();

                using (var stream = file.OpenReadStream())
                {
                    IWorkbook workbook;
                    if (sFileExtension == ".xls")
                    {
                        workbook = new HSSFWorkbook(stream);
                    }
                    else if (sFileExtension == ".xlsx")
                    {
                        workbook = new XSSFWorkbook(stream);
                    }
                    else
                    {
                        return resultado;
                    }

                    ISheet sheet = workbook.GetSheetAt(0);
                    if (sheet == null) return resultado;

                    // Detectar automaticamente qual linha contém o cabeçalho (primeiras 5 linhas)
                    IRow headerRow = null;
                    int headerRowIndex = -1;

                    for (int r = 0; r < Math.Min(5, sheet.LastRowNum + 1); r++)
                    {
                        IRow row = sheet.GetRow(r);
                        if (row == null) continue;

                        // Verificar se a linha contém palavras-chave do cabeçalho
                        bool temData = false;
                        bool temAutorizacao = false;

                        for (int c = 0; c < row.LastCellNum; c++)
                        {
                            var cell = row.GetCell(c);
                            if (cell == null) continue;

                            string cellValue = cell.ToString().Trim().ToLower();

                            // Normalizar string removendo acentos para comparação
                            string normalized = cellValue
                                .Replace("ç", "c")
                                .Replace("ã", "a")
                                .Replace("õ", "o")
                                .Replace("á", "a")
                                .Replace("é", "e")
                                .Replace("í", "i")
                                .Replace("ó", "o")
                                .Replace("ú", "u");

                            if (normalized.Contains("data") && !normalized.Contains("relat"))
                                temData = true;

                            if (normalized.Contains("autoriz"))
                                temAutorizacao = true;
                        }

                        if (temData && temAutorizacao)
                        {
                            headerRow = row;
                            headerRowIndex = r;
                            break;
                        }
                    }

                    if (headerRow == null) return resultado;

                    // Mapear colunas do header
                    int colData = -1, colAutorizacao = -1;

                    for (int col = 0; col < headerRow.LastCellNum; col++)
                    {
                        var cell = headerRow.GetCell(col);
                        if (cell == null) continue;

                        string header = cell.ToString().Trim().ToLower();

                        // Normalizar string removendo acentos
                        string normalized = header
                            .Replace("ç", "c")
                            .Replace("ã", "a")
                            .Replace("õ", "o")
                            .Replace("á", "a")
                            .Replace("é", "e")
                            .Replace("í", "i")
                            .Replace("ó", "o")
                            .Replace("ú", "u");

                        if (normalized.Contains("data") && !normalized.Contains("relat"))
                            colData = col;

                        if (normalized.Contains("autoriz"))
                            colAutorizacao = col;
                    }

                    if (colData < 0 || colAutorizacao < 0)
                    {
                        return resultado; // Colunas obrigatórias não encontradas
                    }

                    // Ler linhas de dados (começar DEPOIS do cabeçalho)
                    int totalLinhasXlsx = sheet.LastRowNum - headerRowIndex;
                    int linhaAtual = 0;
                    int intervaloAtualizacao = Math.Max(1, totalLinhasXlsx / 20); // Atualizar a cada 5%

                    for (int row = headerRowIndex + 1; row <= sheet.LastRowNum; row++)
                    {
                        IRow dataRow = sheet.GetRow(row);
                        if (dataRow == null) continue;

                        linhaAtual++;

                        // Enviar progresso a cada N linhas
                        if (!string.IsNullOrEmpty(connectionId) && (linhaAtual % intervaloAtualizacao == 0 || linhaAtual == totalLinhasXlsx))
                        {
                            await EnviarProgresso(connectionId, 7, "Lendo XLSX", $"Linha {linhaAtual}/{totalLinhasXlsx}",
                                xlsxAtual: linhaAtual, xlsxTotal: totalLinhasXlsx);
                        }

                        int autorizacao = GetCellIntValue(dataRow.GetCell(colAutorizacao));
                        DateTime? dataHora = GetCellDateTimeValue(dataRow.GetCell(colData));

                        if (autorizacao > 0 && dataHora.HasValue && !resultado.ContainsKey(autorizacao))
                        {
                            resultado[autorizacao] = new LinhaXlsx
                            {
                                Autorizacao = autorizacao,
                                DataHora = dataHora.Value
                            };
                        }
                    }
                }

                return resultado;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AbastecimentoController.cs", "LerArquivoXlsx", error);
                return new Dictionary<int, LinhaXlsx>();
            }
        }

        /// <summary>
        /// Importação DUAL: recebe CSV + XLSX, faz JOIN em memória por Autorizacao
        /// NOTA: Este método é acessado via AbastecimentoImportController (sem [ApiController])
        /// para evitar validação automática antes do processamento dos arquivos.
        /// </summary>
        internal async Task<ActionResult> ImportarDualInternal()
        {
            string connectionId = null;
            string nomeXlsx = "";
            string nomeCsv = "";

            try
            {
                // Blindagem: Remover validação de TODOS os campos que virão dos arquivos
                // (na importação, os dados vêm do CSV/XLSX, não do formulário)
                ModelState.Remove("Veiculo");
                ModelState.Remove("Motorista");
                ModelState.Remove("Combustivel");
                ModelState.Remove("Litros");
                ModelState.Remove("DataHora");
                ModelState.Remove("Hodometro");
                ModelState.Remove("AutorizacaoQCard");
                ModelState.Remove("ValorUnitario");
                ModelState.Remove("VeiculoId");
                ModelState.Remove("MotoristaId");
                ModelState.Remove("CombustivelId");
                ModelState.Remove("KmRodado");

                connectionId = Request.Form["connectionId"].FirstOrDefault();

                // === ETAPA 1: Validar 2 arquivos (0-5%) ===
                await EnviarProgresso(connectionId, 2, "Recebendo arquivos", "Verificando upload...");

                if (Request.Form.Files.Count < 2)
                {
                    return Ok(new ResultadoImportacao
                    {
                        Sucesso = false,
                        Mensagem = "É necessário enviar 2 arquivos (XLSX + CSV)"
                    });
                }

                IFormFile arquivoXlsx = Request.Form.Files["arquivoXlsx"];
                IFormFile arquivoCsv = Request.Form.Files["arquivoCsv"];

                if (arquivoXlsx == null || arquivoCsv == null)
                {
                    return Ok(new ResultadoImportacao
                    {
                        Sucesso = false,
                        Mensagem = "É necessário enviar ambos os arquivos: XLSX e CSV"
                    });
                }

                nomeXlsx = arquivoXlsx.FileName;
                nomeCsv = arquivoCsv.FileName;

                await EnviarProgresso(connectionId, 5, "Arquivos recebidos", $"XLSX: {nomeXlsx}, CSV: {nomeCsv}");

                // === ETAPA 2: Ler XLSX (5-10%) ===
                await EnviarProgresso(connectionId, 7, "Lendo XLSX", "Extraindo Data/Hora e Autorizações...");

                var dadosXlsx = await LerArquivoXlsxAsync(arquivoXlsx, connectionId);
                if (dadosXlsx.Count == 0)
                {
                    return Ok(new ResultadoImportacao
                    {
                        Sucesso = false,
                        Mensagem = "Nenhum registro válido encontrado no arquivo XLSX. Verifique se contém as colunas 'Data' e 'Autorizacao'."
                    });
                }

                await EnviarProgresso(connectionId, 10, "XLSX lido", $"{dadosXlsx.Count} autorizações encontradas");

                // === ETAPA 3: Ler CSV (10-15%) ===
                await EnviarProgresso(connectionId, 12, "Lendo CSV", "Extraindo dados de abastecimento...");

                var dadosCsv = await LerArquivoCsvAsync(arquivoCsv, connectionId);
                if (dadosCsv.Count == 0)
                {
                    return Ok(new ResultadoImportacao
                    {
                        Sucesso = false,
                        Mensagem = "Nenhum registro válido encontrado no arquivo CSV. Verifique se contém as colunas obrigatórias."
                    });
                }

                await EnviarProgresso(connectionId, 15, "CSV lido", $"{dadosCsv.Count} abastecimentos encontrados");

                // === ETAPA 4: INNER JOIN em memória (15-20%) ===
                await EnviarProgresso(connectionId, 17, "Combinando dados", "Fazendo JOIN por Autorização...");

                var mapaCombustivel = new Dictionary<string, Guid>(StringComparer.OrdinalIgnoreCase)
                {
                    { "Gasolina Comum", Guid.Parse("f668f660-8380-4df3-90cd-787db06fe734") },
                    { "Diesel S-10", Guid.Parse("a69aa86a-9162-4242-ab9a-8b184e04c4da") }
                };

                var linhas = new List<LinhaImportacao>();
                int matchCount = 0;
                int csvProcessado = 0;
                int totalCsv = dadosCsv.Count;
                int intervaloJoin = Math.Max(1, totalCsv / 20); // Atualizar a cada 5%

                foreach (var kvpCsv in dadosCsv)
                {
                    csvProcessado++;
                    int autorizacao = kvpCsv.Key;
                    var dadoCsv = kvpCsv.Value;

                    // Enviar progresso periodicamente durante o JOIN
                    if (!string.IsNullOrEmpty(connectionId) && (csvProcessado % intervaloJoin == 0 || csvProcessado == totalCsv))
                    {
                        await EnviarProgresso(connectionId, 17, "Combinando dados", $"Processando {csvProcessado}/{totalCsv}...",
                            processAtual: csvProcessado, processTotal: totalCsv);
                    }

                    // INNER JOIN: só processa se existe no XLSX
                    if (dadosXlsx.TryGetValue(autorizacao, out var dadoXlsx))
                    {
                        matchCount++;

                        // Limpar e mapear produto
                        var produtoLimpo = LimparProduto(dadoCsv.Produto);
                        Guid? combustivelId = null;

                        if (!string.IsNullOrEmpty(produtoLimpo) && mapaCombustivel.TryGetValue(produtoLimpo, out var combustivelGuid))
                        {
                            combustivelId = combustivelGuid;
                        }

                        linhas.Add(new LinhaImportacao
                        {
                            NumeroLinhaOriginal = matchCount,
                            Autorizacao = autorizacao,
                            DataHoraParsed = dadoXlsx.DataHora,
                            Data = dadoXlsx.DataHora.ToString("dd/MM/yyyy"),
                            Hora = dadoXlsx.DataHora.ToString("HH:mm"),
                            Placa = dadoCsv.Placa,
                            Km = dadoCsv.Km,
                            Quantidade = dadoCsv.Qtde,
                            ValorUnitario = dadoCsv.VrUnitario,
                            KmRodado = dadoCsv.Rodado,
                            CodMotorista = dadoCsv.CodMotorista,
                            KmAnterior = dadoCsv.KmAnterior,
                            Produto = produtoLimpo,
                            CombustivelId = combustivelId
                        });
                    }
                }

                if (linhas.Count == 0)
                {
                    return Ok(new ResultadoImportacao
                    {
                        Sucesso = false,
                        Mensagem = $"Nenhum registro com Autorização correspondente encontrado. CSV: {dadosCsv.Count} registros, XLSX: {dadosXlsx.Count} registros. Verifique se os números de Autorização correspondem nos dois arquivos."
                    });
                }

                int totalLinhas = linhas.Count;
                await EnviarProgresso(connectionId, 20, "Dados combinados", $"{totalLinhas} registros prontos para validação");

                // === ETAPA 5: REUTILIZAR VALIDAÇÃO EXISTENTE (20-90%) ===
                // Carregar dados de referência
                await EnviarProgresso(connectionId, 21, "Carregando dados", "Buscando veículos cadastrados...");
                var veiculos = _unitOfWork.Veiculo.GetAll().ToList();

                await EnviarProgresso(connectionId, 22, "Carregando dados", "Buscando motoristas cadastrados...");
                var motoristas = _unitOfWork.Motorista.GetAll().ToList();

                await EnviarProgresso(connectionId, 23, "Carregando dados", "Verificando autorizações existentes...");
                var autorizacoesExistentes = _unitOfWork.Abastecimento.GetAll()
                    .Where(a => a.AutorizacaoQCard.HasValue)
                    .Select(a => a.AutorizacaoQCard.Value)
                    .ToHashSet();

                await EnviarProgresso(connectionId, 24, "Carregando dados", "Calculando médias de consumo...");
                var mediasConsumo = _unitOfWork.ViewMediaConsumo.GetAll()
                    .ToDictionary(m => m.VeiculoId, m => m.ConsumoGeral ?? 0);

                await EnviarProgresso(connectionId, 25, "Carregando dados", "Dados de referência carregados");

                // Validar linhas (código idêntico ao ImportarNovo, linhas 338-489)
                int linhaProcessada = 0;
                int intervaloAtualizacao = Math.Max(1, totalLinhas / 50);

                foreach (var linha in linhas)
                {
                    linhaProcessada++;

                    if (linhaProcessada % intervaloAtualizacao == 0 || linhaProcessada == totalLinhas)
                    {
                        int porcentagemValidacao = 25 + (int)((linhaProcessada / (double)totalLinhas) * 45);
                        await EnviarProgresso(connectionId, porcentagemValidacao, "Validando linhas",
                            $"Processando linha {linhaProcessada} de {totalLinhas}...",
                            linhaAtual: linhaProcessada, totalLinhas: totalLinhas,
                            processAtual: linhaProcessada, processTotal: totalLinhas);
                    }

                    // Validação de combustível
                    if (!linha.CombustivelId.HasValue)
                    {
                        linha.Erros.Add($"Produto '{linha.Produto}' não reconhecido (aceitos: Gasolina Comum, Diesel S-10)");
                        continue; // Produto não reconhecido, será ignorado
                    }

                    // Validação de autorização duplicada
                    if (autorizacoesExistentes.Contains(linha.Autorizacao))
                    {
                        linha.Erros.Add($"Autorização '{linha.Autorizacao}' já foi importada anteriormente");
                    }

                    // Validação de veículo
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

                    // Validação de motorista
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

                    // Validação de quantidade
                    if (linha.Quantidade > 500)
                    {
                        linha.Erros.Add($"Quantidade de {linha.Quantidade:N2} litros excede o limite de 500 litros");
                    }

                    // Validação inteligente de quilometragem (código idêntico linhas 407-488)
                    if (linha.VeiculoId.HasValue)
                    {
                        double mediaConsumo = 0;
                        decimal mediaTemp;
                        if (mediasConsumo.TryGetValue(linha.VeiculoId.Value, out mediaTemp))
                        {
                            mediaConsumo = (double)mediaTemp;
                        }
                        linha.MediaConsumoVeiculo = mediaConsumo;

                        int kmRodadoEsperado = mediaConsumo > 0
                            ? (int)(linha.Quantidade * mediaConsumo)
                            : 150;

                        if (linha.KmRodado < 0)
                        {
                            linha.Erros.Add($"Quilometragem negativa ({linha.KmRodado} km): Km Anterior maior que Km Atual");

                            int kmAnteriorSugerido = linha.Km - kmRodadoEsperado;
                            if (kmAnteriorSugerido > 0)
                            {
                                linha.TemSugestao = true;
                                linha.CampoCorrecao = "KmAnterior";
                                linha.ValorAtualErrado = linha.KmAnterior;
                                linha.ValorSugerido = kmAnteriorSugerido;
                                linha.JustificativaSugestao = mediaConsumo > 0
                                    ? $"Baseado na média de {mediaConsumo:N1} km/l do veículo, o KM Anterior deveria ser aproximadamente {kmAnteriorSugerido:N0}"
                                    : $"Baseado em consumo padrão, o KM Anterior deveria ser aproximadamente {kmAnteriorSugerido:N0}";
                            }
                        }
                        else if (linha.KmRodado > 1000)
                        {
                            double consumoAtual = linha.Quantidade > 0 ? linha.KmRodado / linha.Quantidade : 0;
                            double mediaReferencia = mediaConsumo > 0 ? mediaConsumo : 10;
                            double limiteInferior = mediaReferencia * 0.6;
                            double limiteSuperior = mediaReferencia * 1.4;
                            bool consumoDentroDoEsperado = consumoAtual >= limiteInferior && consumoAtual <= limiteSuperior;

                            if (consumoDentroDoEsperado)
                            {
                                // Viagem longa legítima - NÃO adiciona erro
                            }
                            else if (consumoAtual > limiteSuperior)
                            {
                                linha.Erros.Add($"Quilometragem de {linha.KmRodado} km excede o limite e consumo de {consumoAtual:N1} km/l está muito acima da média ({mediaReferencia:N1} km/l)");

                                int kmAnteriorSugerido = linha.Km - kmRodadoEsperado;
                                if (kmAnteriorSugerido > 0)
                                {
                                    linha.TemSugestao = true;
                                    linha.CampoCorrecao = "KmAnterior";
                                    linha.ValorAtualErrado = linha.KmAnterior;
                                    linha.ValorSugerido = kmAnteriorSugerido;
                                    linha.JustificativaSugestao = $"Consumo de {consumoAtual:N1} km/l está muito acima da média ({mediaReferencia:N1} km/l). Provável erro no KM Anterior.";
                                }
                            }
                            else
                            {
                                linha.Erros.Add($"Quilometragem de {linha.KmRodado} km excede o limite e consumo de {consumoAtual:N1} km/l está muito abaixo da média ({mediaReferencia:N1} km/l)");

                                int kmSugerido = linha.KmAnterior + kmRodadoEsperado;
                                linha.TemSugestao = true;
                                linha.CampoCorrecao = "Km";
                                linha.ValorAtualErrado = linha.Km;
                                linha.ValorSugerido = kmSugerido;
                                linha.JustificativaSugestao = $"Consumo de {consumoAtual:N1} km/l está muito abaixo da média ({mediaReferencia:N1} km/l). Provável erro no KM Atual.";
                            }
                        }
                    }
                    else
                    {
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

                // Separar linhas (código idêntico linhas 492-502)
                var linhasIgnoradas = linhas.Where(l => !l.CombustivelId.HasValue).ToList();
                var linhasParaProcessar = linhas.Where(l => l.CombustivelId.HasValue).ToList();
                var linhasValidas = linhasParaProcessar.Where(l => l.Valido).ToList();
                var linhasComErro = linhasParaProcessar.Where(l => !l.Valido).ToList();

                int numeroLinhaErro = 1;
                foreach (var linha in linhasComErro)
                {
                    linha.NumeroLinhaErro = ++numeroLinhaErro;
                }

                // === ETAPA 6: Salvar no banco (70-90%) ===
                var linhasImportadas = new List<LinhaImportadaDTO>();
                var veiculosParaAtualizar = new HashSet<Guid>();

                if (linhasValidas.Any())
                {
                    await EnviarProgresso(connectionId, 72, "Gravando dados", $"Salvando {linhasValidas.Count} abastecimento(s)...");

                    var autorizacoesAbastecimento = _unitOfWork.Abastecimento
                        .GetAll()
                        .Select(a => a.AutorizacaoQCard)
                        .Where(a => a.HasValue)
                        .Select(a => a.Value)
                        .ToHashSet();

                    var linhasParaGravar = linhasValidas
                        .Where(l => l.Autorizacao <= 0 || !autorizacoesAbastecimento.Contains(l.Autorizacao))
                        .ToList();

                    int linhasIgnoradasDuplicadas = linhasValidas.Count - linhasParaGravar.Count;
                    int linhaGravada = 0;
                    int intervaloGravacao = Math.Max(1, linhasParaGravar.Count / 20);

                    using (var scope = new TransactionScope(
                        TransactionScopeOption.RequiresNew,
                        new TimeSpan(0, 30, 0),
                        TransactionScopeAsyncFlowOption.Enabled))
                    {
                        foreach (var linha in linhasParaGravar)
                        {
                            linhaGravada++;

                            if (linhaGravada % intervaloGravacao == 0 || linhaGravada == linhasParaGravar.Count)
                            {
                                int porcentagemGravacao = 72 + (int)((linhaGravada / (double)linhasParaGravar.Count) * 15);
                                await EnviarProgresso(connectionId, porcentagemGravacao, "Gravando dados",
                                    $"Salvando registro {linhaGravada} de {linhasParaGravar.Count}...", linhaGravada, linhasParaGravar.Count);
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
                                ValorTotal = (linha.ValorUnitario * linha.Quantidade).ToString("C2", new CultureInfo("pt-BR")),
                                Consumo = (linha.Quantidade > 0 && linha.KmRodado > 0 ? linha.KmRodado / linha.Quantidade : 0).ToString("N2") + " km/l",
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

                // === ETAPA 7: Salvar pendências (90-98%) ===
                var erros = new List<ErroImportacao>();
                int linhasCorrigiveis = 0;
                int pendenciasGeradas = 0;

                if (linhasComErro.Any())
                {
                    await EnviarProgresso(connectionId, 92, "Salvando pendências", $"Gravando {linhasComErro.Count} pendência(s)...");

                    var autorizacoesPendentes = _unitOfWork.AbastecimentoPendente
                        .GetAll(p => p.Status == 0)
                        .Select(p => p.AutorizacaoQCard)
                        .Where(a => a.HasValue)
                        .Select(a => a.Value)
                        .ToHashSet();

                    foreach (var linha in linhasComErro)
                    {
                        if (linha.Autorizacao > 0 && autorizacoesPendentes.Contains(linha.Autorizacao))
                        {
                            continue;
                        }

                        bool linhaPossuiSugestao = linha.TemSugestao;
                        if (linhaPossuiSugestao) linhasCorrigiveis++;

                        string tipoPrincipal = DeterminarTipoPendencia(linha.Erros);
                        string descricaoCompleta = string.Join("; ", linha.Erros);

                        var pendencia = new AbastecimentoPendente
                        {
                            AbastecimentoPendenteId = Guid.NewGuid(),
                            AutorizacaoQCard = linha.Autorizacao,
                            Placa = linha.Placa,
                            CodMotorista = linha.CodMotorista,
                            NomeMotorista = linha.NomeMotorista,
                            Produto = linha.Produto,
                            DataHora = linha.DataHoraParsed,
                            KmAnterior = linha.KmAnterior,
                            Km = linha.Km,
                            KmRodado = linha.KmRodado,
                            Litros = linha.Quantidade,
                            ValorUnitario = linha.ValorUnitario,
                            VeiculoId = linha.VeiculoId,
                            MotoristaId = linha.MotoristaId,
                            CombustivelId = linha.CombustivelId,
                            DescricaoPendencia = descricaoCompleta,
                            TipoPendencia = tipoPrincipal,
                            TemSugestao = linha.TemSugestao,
                            CampoCorrecao = linha.CampoCorrecao,
                            ValorAtualErrado = linha.ValorAtualErrado,
                            ValorSugerido = linha.ValorSugerido,
                            JustificativaSugestao = linha.JustificativaSugestao,
                            MediaConsumoVeiculo = linha.MediaConsumoVeiculo,
                            DataImportacao = DateTime.Now,
                            NumeroLinhaOriginal = linha.NumeroLinhaOriginal,
                            ArquivoOrigem = $"{nomeCsv} + {nomeXlsx}",
                            Status = 0
                        };

                        _unitOfWork.AbastecimentoPendente.Add(pendencia);
                        pendenciasGeradas++;

                        foreach (var erro in linha.Erros)
                        {
                            string tipo = "erro";
                            string icone = "fa-circle-xmark";
                            bool erroCorrigivel = false;

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
                                erroCorrigivel = linhaPossuiSugestao;
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
                                Icone = icone,
                                Corrigivel = erroCorrigivel,
                                CampoCorrecao = erroCorrigivel ? linha.CampoCorrecao : null,
                                ValorAtual = erroCorrigivel ? linha.ValorAtualErrado : 0,
                                ValorSugerido = erroCorrigivel ? linha.ValorSugerido : 0,
                                JustificativaSugestao = erroCorrigivel ? linha.JustificativaSugestao : null,
                                Autorizacao = linha.Autorizacao,
                                Placa = linha.Placa,
                                KmAnterior = linha.KmAnterior,
                                Km = linha.Km,
                                KmRodado = linha.KmRodado,
                                Litros = linha.Quantidade,
                                VeiculoId = linha.VeiculoId?.ToString(),
                                MotoristaId = linha.MotoristaId?.ToString(),
                                CombustivelId = linha.CombustivelId?.ToString(),
                                DataHora = linha.DataHoraParsed?.ToString("dd/MM/yyyy HH:mm"),
                                ValorUnitario = linha.ValorUnitario,
                                NomeMotorista = linha.NomeMotorista,
                                Produto = linha.Produto
                            });
                        }
                    }

                    await EnviarProgresso(connectionId, 95, "Salvando pendências", "Gravando no banco de dados...");
                    _unitOfWork.Save();
                }

                // === ETAPA 8: Finalizar (98-100%) ===
                await EnviarProgresso(connectionId, 98, "Finalizando", "Preparando resultado...");

                string mensagem;
                bool sucesso;
                int totalIgnoradas = linhasIgnoradas.Count + (linhasValidas.Count - linhasImportadas.Count);

                if (linhasImportadas.Any() && linhasComErro.Any())
                {
                    mensagem = $"Importação parcial concluída! {linhasImportadas.Count} abastecimento(s) importado(s), " +
                               $"{pendenciasGeradas} pendência(s) gerada(s). Acesse a tela de Pendências para resolver.";
                    sucesso = true;
                }
                else if (linhasImportadas.Any())
                {
                    var msgIgnoradas = totalIgnoradas > 0
                        ? $" ({totalIgnoradas} linha(s) ignorada(s) - produto não reconhecido ou duplicada)"
                        : "";
                    mensagem = $"Importação concluída com sucesso! {linhasImportadas.Count} abastecimento(s) registrado(s).{msgIgnoradas}";
                    sucesso = true;
                }
                else
                {
                    mensagem = $"Nenhum registro importado. {pendenciasGeradas} pendência(s) gerada(s). Acesse a tela de Pendências para resolver.";
                    sucesso = false;
                }

                await EnviarProgresso(connectionId, 100, "Concluído", sucesso ? "Importação finalizada!" : "Finalizado com pendências");

                return Ok(new ResultadoImportacao
                {
                    Sucesso = sucesso,
                    Mensagem = mensagem,
                    TotalLinhas = linhas.Count,
                    LinhasImportadas = linhasImportadas.Count,
                    LinhasComErro = linhasComErro.Count,
                    LinhasIgnoradas = totalIgnoradas,
                    LinhasCorrigiveis = linhasCorrigiveis,
                    Erros = erros.OrderBy(e => e.LinhaArquivoErros).ToList(),
                    LinhasImportadasLista = linhasImportadas,
                    PendenciasGeradas = pendenciasGeradas
                });
            }
            catch (Exception error)
            {
                await EnviarProgresso(connectionId, 0, "Erro", error.Message);
                Alerta.TratamentoErroComLinha("AbastecimentoController.cs", "ImportarDual", error);
                return StatusCode(500, new ResultadoImportacao
                {
                    Sucesso = false,
                    Mensagem = $"Erro interno ao processar importação: {error.Message}"
                });
            }
        }

        /// <summary>
        /// Helper para extrair DateTime de uma célula Excel (trata múltiplos formatos)
        /// </summary>
        private DateTime? GetCellDateTimeValue(ICell cell)
        {
            try
            {
                if (cell == null) return null;

                // Se for célula numérica formatada como data
                if (cell.CellType == CellType.Numeric && DateUtil.IsCellDateFormatted(cell))
                {
                    return cell.DateCellValue;
                }

                // Fallback: tentar parse de string
                string valor = cell.ToString()?.Trim();
                if (!string.IsNullOrWhiteSpace(valor))
                {
                    if (DateTime.TryParse(valor, new CultureInfo("pt-BR"), DateTimeStyles.None, out DateTime result))
                    {
                        return result;
                    }
                }

                return null;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AbastecimentoController.cs", "GetCellDateTimeValue", error);
                return null;
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

        [Route("ExportarPendencias")]
        [HttpGet]
        public IActionResult ExportarPendencias()
        {
            try
            {
                // Buscar todas as pendências (Status = 0 = Pendente)
                var pendencias = _unitOfWork.AbastecimentoPendente
                    .GetAll()
                    .Where(p => p.Status == 0)
                    .OrderBy(p => p.DataImportacao)
                    .ThenBy(p => p.AutorizacaoQCard)
                    .ToList();

                if (!pendencias.Any())
                {
                    return NotFound(new { success = false, message = "Nenhuma pendência encontrada para exportar." });
                }

                // Criar workbook Excel
                var workbook = new XSSFWorkbook();
                var sheet = workbook.CreateSheet("Pendências");

                // Criar estilo para o cabeçalho
                var headerStyle = workbook.CreateCellStyle();
                var headerFont = workbook.CreateFont();
                headerFont.IsBold = true;
                headerFont.FontHeightInPoints = 11;
                headerStyle.SetFont(headerFont);
                headerStyle.FillForegroundColor = NPOI.HSSF.Util.HSSFColor.Grey25Percent.Index;
                headerStyle.FillPattern = FillPattern.SolidForeground;
                headerStyle.BorderBottom = BorderStyle.Thin;
                headerStyle.BorderTop = BorderStyle.Thin;
                headerStyle.BorderLeft = BorderStyle.Thin;
                headerStyle.BorderRight = BorderStyle.Thin;

                // Criar estilo para células de data
                var dateStyle = workbook.CreateCellStyle();
                var dataFormat = workbook.CreateDataFormat();
                dateStyle.DataFormat = dataFormat.GetFormat("dd/mm/yyyy hh:mm");

                // Criar cabeçalho
                var headerRow = sheet.CreateRow(0);
                string[] headers = {
                    "Data Importação",
                    "Autorização QCard",
                    "Data/Hora Abast.",
                    "Placa",
                    "Cód. Motorista",
                    "Nome Motorista",
                    "Produto",
                    "KM Anterior",
                    "KM",
                    "KM Rodado",
                    "Litros",
                    "Valor Unitário",
                    "Tipo Pendência",
                    "Descrição Pendência",
                    "Arquivo Origem",
                    "Linha Original"
                };

                for (int i = 0; i < headers.Length; i++)
                {
                    var cell = headerRow.CreateCell(i);
                    cell.SetCellValue(headers[i]);
                    cell.CellStyle = headerStyle;
                }

                // Preencher dados
                int rowIndex = 1;
                foreach (var pendencia in pendencias)
                {
                    var row = sheet.CreateRow(rowIndex++);

                    // Data Importação
                    var cellDataImportacao = row.CreateCell(0);
                    cellDataImportacao.SetCellValue(pendencia.DataImportacao);
                    cellDataImportacao.CellStyle = dateStyle;

                    // Autorização QCard
                    row.CreateCell(1).SetCellValue(pendencia.AutorizacaoQCard ?? 0);

                    // Data/Hora Abastecimento
                    if (pendencia.DataHora.HasValue)
                    {
                        var cellDataHora = row.CreateCell(2);
                        cellDataHora.SetCellValue(pendencia.DataHora.Value);
                        cellDataHora.CellStyle = dateStyle;
                    }
                    else
                    {
                        row.CreateCell(2).SetCellValue("");
                    }

                    // Placa
                    row.CreateCell(3).SetCellValue(pendencia.Placa ?? "");

                    // Código Motorista
                    row.CreateCell(4).SetCellValue(pendencia.CodMotorista ?? 0);

                    // Nome Motorista
                    row.CreateCell(5).SetCellValue(pendencia.NomeMotorista ?? "");

                    // Produto
                    row.CreateCell(6).SetCellValue(pendencia.Produto ?? "");

                    // KM Anterior
                    row.CreateCell(7).SetCellValue(pendencia.KmAnterior ?? 0);

                    // KM
                    row.CreateCell(8).SetCellValue(pendencia.Km ?? 0);

                    // KM Rodado
                    row.CreateCell(9).SetCellValue(pendencia.KmRodado ?? 0);

                    // Litros
                    row.CreateCell(10).SetCellValue(pendencia.Litros ?? 0);

                    // Valor Unitário
                    row.CreateCell(11).SetCellValue(pendencia.ValorUnitario ?? 0);

                    // Tipo Pendência
                    row.CreateCell(12).SetCellValue(pendencia.TipoPendencia ?? "");

                    // Descrição Pendência
                    row.CreateCell(13).SetCellValue(pendencia.DescricaoPendencia ?? "");

                    // Arquivo Origem
                    row.CreateCell(14).SetCellValue(pendencia.ArquivoOrigem ?? "");

                    // Linha Original
                    row.CreateCell(15).SetCellValue(pendencia.NumeroLinhaOriginal);
                }

                // Auto-ajustar largura das colunas
                for (int i = 0; i < headers.Length; i++)
                {
                    sheet.AutoSizeColumn(i);
                }

                // Converter para byte array
                using (var memoryStream = new MemoryStream())
                {
                    workbook.Write(memoryStream);
                    var excelBytes = memoryStream.ToArray();

                    // Retornar arquivo
                    string nomeArquivo = $"Pendencias_Abastecimento_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
                    return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", nomeArquivo);
                }
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("AbastecimentoController.cs", "ExportarPendencias", error);
                return StatusCode(500, new { success = false, message = error.Message });
            }
        }
    }
}
