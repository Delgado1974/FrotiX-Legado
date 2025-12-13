using FrotiX.Models;
using FrotiX.Repository.IRepository;
using HtmlAgilityPack;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace FrotiX.Services
{
    [Route("api/[controller]")]
    [ApiController]
    public class Servicos
    {
        private readonly IUnitOfWork _unitOfWork;

        public Servicos(IUnitOfWork unitOfWork)
        {
            try
            {
                _unitOfWork = unitOfWork;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Servicos.cs" , "Constructor" , error);
            }
        }

        // ========================================
        // CÁLCULOS DE CUSTOS
        // ========================================

        public static double CalculaCustoCombustivel(Viagem viagemObj , IUnitOfWork _unitOfWork)
        {
            try
            {
                var veiculoObj = _unitOfWork.ViewVeiculos.GetFirstOrDefault(v => v.VeiculoId == viagemObj.VeiculoId);

                var combustivelObj = _unitOfWork.Abastecimento.GetAll(a => a.VeiculoId == viagemObj.VeiculoId).OrderByDescending(o => o.DataHora);

                // Verifica se tem abastecimento
                double ValorCombustivel = 0;
                if (combustivelObj.FirstOrDefault() == null)
                {
                    var abastecimentoObj = _unitOfWork.MediaCombustivel.GetAll(a => a.CombustivelId == veiculoObj.CombustivelId).OrderByDescending(o => o.Ano).ThenByDescending(o => o.Mes);
                    ValorCombustivel = (double)abastecimentoObj.FirstOrDefault().PrecoMedio;
                }
                else
                {
                    ValorCombustivel = (double)combustivelObj.FirstOrDefault().ValorUnitario;
                }

                var Quilometragem = viagemObj.KmFinal - viagemObj.KmInicial;

                var ConsumoVeiculo = Convert.ToDouble(veiculoObj.Consumo);

                // Ainda não teve Abastecimento
                if (ConsumoVeiculo == 0)
                {
                    ConsumoVeiculo = 10;
                }

                var CustoViagem = (Quilometragem / ConsumoVeiculo) * ValorCombustivel;

                return (double)CustoViagem;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Servicos.cs" , "CalculaCustoCombustivel" , error);
                return 0;
            }
        }

        public static double CalculaCustoVeiculo(Viagem viagemObj , IUnitOfWork _unitOfWork)
        {
            try
            {
                var veiculoObj = _unitOfWork.Veiculo.GetFirstOrDefault(v => v.VeiculoId == viagemObj.VeiculoId);
                double valorUnitario = ObterValorUnitarioVeiculo(veiculoObj , _unitOfWork);

                const int HORAS_UTEIS_DIA = 16; // 6h às 22h
                const int DIAS_UTEIS_MES = 22; // Apenas dias úteis

                double minutosMesUteis = DIAS_UTEIS_MES * HORAS_UTEIS_DIA * 60; // 21.120 minutos
                double custoMinutoVeiculo = valorUnitario / minutosMesUteis;

                DateTime dataHoraInicio = viagemObj.DataInicial.Value.Date.Add(viagemObj.HoraInicio.Value.TimeOfDay);
                DateTime dataHoraFim = viagemObj.DataFinal.Value.Date.Add(viagemObj.HoraFim.Value.TimeOfDay);

                TimeSpan duracaoTotal = dataHoraFim - dataHoraInicio;

                // Calcula minutos considerando dias úteis e horário operacional
                double minutosViagemUteis = CalcularMinutosUteisViagem(
                    dataHoraInicio ,
                    dataHoraFim ,
                    duracaoTotal ,
                    HORAS_UTEIS_DIA
                );

                double custoCalculado = minutosViagemUteis * custoMinutoVeiculo;

                // Garante que nunca ultrapasse o valor mensal
                return Math.Min(custoCalculado , valorUnitario);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Servicos.cs" , "CalculaCustoVeiculo" , error);
                return 0;
            }
        }

        public static double CalculaCustoMotorista(Viagem viagemObj , IUnitOfWork _unitOfWork , ref int minutos)
        {
            try
            {
                var motoristaObj = _unitOfWork.Motorista.GetFirstOrDefault(m => m.MotoristaId == viagemObj.MotoristaId);

                // Motorista não é terceirizado
                if (motoristaObj.ContratoId == null)
                {
                    if (minutos == -1)
                        minutos = 0;
                    return 0;
                }

                // Busca valor do motorista na última repactuação
                Guid contratoId = (Guid)motoristaObj.ContratoId;
                var topRepactuacao = _unitOfWork.RepactuacaoContrato
                    .GetAll(r => r.ContratoId == contratoId)
                    .OrderByDescending(r => r.DataRepactuacao)
                    .FirstOrDefault();

                var topMotorista = _unitOfWork.RepactuacaoTerceirizacao
                    .GetFirstOrDefault(rt => rt.RepactuacaoContratoId == topRepactuacao.RepactuacaoContratoId);

                double valorMotorista = (double)topMotorista.ValorMotorista;

                const int HORAS_TRABALHO_DIA = 12; // Máximo 12h/dia
                const int DIAS_UTEIS_MES = 22; // Apenas dias úteis

                double minutosMesUteis = DIAS_UTEIS_MES * HORAS_TRABALHO_DIA * 60; // 15.840 minutos
                double custoMinutoMotorista = valorMotorista / minutosMesUteis;

                DateTime dataHoraInicio = viagemObj.DataInicial.Value.Date.Add(viagemObj.HoraInicio.Value.TimeOfDay);
                DateTime dataHoraFim = viagemObj.DataFinal.Value.Date.Add(viagemObj.HoraFim.Value.TimeOfDay);

                TimeSpan duracaoTotal = dataHoraFim - dataHoraInicio;

                // Calcula minutos considerando dias úteis e jornada de trabalho
                double minutosViagemUteis = CalcularMinutosUteisViagem(
                    dataHoraInicio ,
                    dataHoraFim ,
                    duracaoTotal ,
                    HORAS_TRABALHO_DIA
                );

                double custoCalculado = minutosViagemUteis * custoMinutoMotorista;

                // Registra minutos totais se solicitado
                if (minutos == -1)
                {
                    minutos = (int)minutosViagemUteis;
                }

                // Garante que nunca ultrapasse o valor mensal
                return Math.Min(custoCalculado , valorMotorista);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Servicos.cs" , "CalculaCustoMotorista" , error);
                return 0;
            }
        }

        /// <summary>
        /// Calcula minutos úteis considerando:
        /// - Apenas dias úteis (seg-sex), EXCETO se início/fim cair em fim de semana
        /// - Limite de horas por dia (12h motorista, 16h veículo)
        /// </summary>
        public static double CalcularMinutosUteisViagem(DateTime inicio , DateTime fim , TimeSpan duracao , int horasMaximasDia)
        {
            try
            {
                const int MINUTOS_DIA_COMPLETO = 24 * 60;
                int minutosMaximosDia = horasMaximasDia * 60;

                // Viagem curta (mesmo dia ou poucas horas)
                if (duracao.TotalHours <= horasMaximasDia)
                {
                    return duracao.TotalMinutes;
                }

                // Viagem longa - conta dias úteis com regra especial de fim de semana
                int diasUteis = ContarDiasUteisComExcecoes(inicio.Date , fim.Date);

                // Calcula minutos úteis
                double minutosUteis = diasUteis * minutosMaximosDia;

                // Ajusta se a duração real é menor que o calculado
                double minutosReaisAjustados = duracao.TotalMinutes * ((double)minutosMaximosDia / MINUTOS_DIA_COMPLETO);

                return Math.Min(minutosUteis , minutosReaisAjustados);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Servicos.cs" , "CalcularMinutosUteisViagem" , error);
                return 0;
            }
        }

        /// <summary>
        /// Conta dias úteis (seg-sex) INCLUINDO início e fim se forem fim de semana
        /// Regra: Se DataInicial ou DataFinal for sábado/domingo, conta esse dia
        /// </summary>
        public static int ContarDiasUteisComExcecoes(DateTime dataInicio , DateTime dataFim)
        {
            try
            {
                int diasUteis = 0;
                DateTime dataAtual = dataInicio;

                while (dataAtual <= dataFim)
                {
                    DayOfWeek diaSemana = dataAtual.DayOfWeek;
                    bool ehFimDeSemana = (diaSemana == DayOfWeek.Saturday || diaSemana == DayOfWeek.Sunday);
                    bool ehDiaInicial = (dataAtual == dataInicio);
                    bool ehDiaFinal = (dataAtual == dataFim);

                    // Conta se: É dia útil OU (é fim de semana MAS é o dia inicial ou final)
                    if (!ehFimDeSemana || ehDiaInicial || ehDiaFinal)
                    {
                        diasUteis++;
                    }

                    dataAtual = dataAtual.AddDays(1);
                }

                return diasUteis;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Servicos.cs" , "ContarDiasUteisComExcecoes" , error);
                return 0;
            }
        }

        /// <summary>
        /// Extrai valor unitário do veículo (contrato/ata/próprio)
        /// </summary>
        public static double ObterValorUnitarioVeiculo(Veiculo veiculoObj , IUnitOfWork _unitOfWork)
        {
            try
            {
                if (veiculoObj.ContratoId != null)
                {
                    var valorUnitario = (from i in _unitOfWork.ItemVeiculoContrato.GetAll()
                                         join r in _unitOfWork.RepactuacaoContrato.GetAll()
                                         on i.RepactuacaoContratoId equals r.RepactuacaoContratoId
                                         orderby r.DataRepactuacao descending
                                         where i.ItemVeiculoId == veiculoObj.ItemVeiculoId
                                         select i.ValorUnitario).FirstOrDefault();

                    return (double)(valorUnitario ?? 0);
                }
                else if (veiculoObj.AtaId != null)
                {
                    var valorUnitario = (from i in _unitOfWork.ItemVeiculoAta.GetAll()
                                         join r in _unitOfWork.RepactuacaoAta.GetAll()
                                         on i.RepactuacaoAtaId equals r.RepactuacaoAtaId
                                         orderby r.DataRepactuacao descending
                                         where i.ItemVeiculoAtaId == veiculoObj.ItemVeiculoAtaId
                                         select i.ValorUnitario).FirstOrDefault();

                    return (double)(valorUnitario ?? 0);
                }
                else
                {
                    return 100; // Veículo próprio
                }
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Servicos.cs" , "ObterValorUnitarioVeiculo" , error);
                return 0;
            }
        }

        public static double CalculaCustoOperador(Viagem viagemObj , IUnitOfWork _unitOfWork)
        {
            try
            {
                // Busca o contrato de operadores terceirizados mais recente
                var contratoOperadores = _unitOfWork.Contrato
                    .GetAll(c => c.TipoContrato == "Terceirização" && c.ContratoOperadores == true)
                    .OrderByDescending(c => c.DataInicio)
                    .FirstOrDefault();

                if (contratoOperadores == null)
                    return 0;

                // Busca última repactuação do contrato de operadores
                var topRepactuacao = _unitOfWork.RepactuacaoContrato
                    .GetAll(r => r.ContratoId == contratoOperadores.ContratoId)
                    .OrderByDescending(r => r.DataRepactuacao)
                    .FirstOrDefault();

                if (topRepactuacao == null)
                    return 0;

                var topTerceirizacao = _unitOfWork.RepactuacaoTerceirizacao
                    .GetFirstOrDefault(rt => rt.RepactuacaoContratoId == topRepactuacao.RepactuacaoContratoId);

                if (topTerceirizacao == null || topTerceirizacao.QtdOperadores == null || topTerceirizacao.ValorOperador == null)
                    return 0;

                // Custo mensal total dos operadores
                double custoMensalOperadores = (double)(topTerceirizacao.QtdOperadores.Value * topTerceirizacao.ValorOperador.Value);

                // Calcula média diária de viagens até a data desta viagem
                double mediaViagens = CalcularMediaDiariaViagens(viagemObj.DataInicial.Value , _unitOfWork);

                if (mediaViagens == 0)
                    return 0;

                // Custo por viagem = Custo Mensal Total / Média de Viagens Mensais
                double custoPorViagem = custoMensalOperadores / mediaViagens;

                return custoPorViagem;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Servicos.cs" , "CalculaCustoOperador" , error);
                return 0;
            }
        }

        public static double CalculaCustoLavador(Viagem viagemObj , IUnitOfWork _unitOfWork)
        {
            try
            {
                // Busca o contrato de lavadores terceirizados mais recente
                var contratoLavadores = _unitOfWork.Contrato
                    .GetAll(c => c.TipoContrato == "Terceirização" && c.ContratoLavadores == true)
                    .OrderByDescending(c => c.DataInicio)
                    .FirstOrDefault();

                if (contratoLavadores == null)
                    return 0;

                // Busca última repactuação do contrato de lavadores
                var topRepactuacao = _unitOfWork.RepactuacaoContrato
                    .GetAll(r => r.ContratoId == contratoLavadores.ContratoId)
                    .OrderByDescending(r => r.DataRepactuacao)
                    .FirstOrDefault();

                if (topRepactuacao == null)
                    return 0;

                var topTerceirizacao = _unitOfWork.RepactuacaoTerceirizacao
                    .GetFirstOrDefault(rt => rt.RepactuacaoContratoId == topRepactuacao.RepactuacaoContratoId);

                if (topTerceirizacao == null || topTerceirizacao.QtdLavadores == null || topTerceirizacao.ValorLavador == null)
                    return 0;

                // Custo mensal total dos lavadores
                double custoMensalLavadores = (double)(topTerceirizacao.QtdLavadores.Value * topTerceirizacao.ValorLavador.Value);

                // Calcula média diária de viagens até a data desta viagem
                double mediaViagens = CalcularMediaDiariaViagens(viagemObj.DataInicial.Value , _unitOfWork);

                if (mediaViagens == 0)
                    return 0;

                // Custo por viagem = Custo Mensal Total / Média de Viagens Mensais
                double custoPorViagem = custoMensalLavadores / mediaViagens;

                return custoPorViagem;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Servicos.cs" , "CalculaCustoLavador" , error);
                return 0;
            }
        }

        /// <summary>
        /// Calcula a média DIÁRIA de viagens realizadas ANTES da data especificada
        /// Lógica: totalViagensAnteriores / totalDiasDesdeInicio × 30
        /// </summary>
        /// <param name="dataViagem">Data da viagem sendo calculada</param>
        /// <param name="_unitOfWork">Unit of work para acesso ao banco</param>
        /// <returns>Média mensal de viagens baseada no histórico diário</returns>
        public static double CalcularMediaDiariaViagens(DateTime dataViagem , IUnitOfWork _unitOfWork)
        {
            try
            {
                // Busca TODAS as viagens realizadas ANTES desta data
                var viagensAnteriores = _unitOfWork.Viagem
                    .GetAll(v => v.DataInicial < dataViagem && v.Status == "Realizada")
                    .Select(v => v.DataInicial.Value)
                    .OrderBy(d => d)
                    .ToList();

                int totalViagens = viagensAnteriores.Count;

                // Se não há viagens anteriores, retorna 1 (mínimo)
                if (totalViagens == 0)
                    return 1.0;

                // Pega a data da PRIMEIRA viagem do histórico
                DateTime primeiraViagem = viagensAnteriores.First();

                // Calcula total de DIAS desde a primeira viagem até esta data
                int totalDias = (dataViagem.Date - primeiraViagem.Date).Days;

                // Se for no mesmo dia ou 0 dias, usa 1 como divisor
                if (totalDias <= 0)
                    totalDias = 1;

                // Média DIÁRIA = Total de viagens / Total de dias
                double mediaDiaria = (double)totalViagens / (double)totalDias;

                // Converte para média MENSAL (multiplica por 30)
                double mediaMensal = mediaDiaria * 30.0;

                // Garante que a média nunca seja zero (mínimo 0.1)
                return Math.Max(mediaMensal , 0.1);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Servicos.cs" , "CalcularMediaDiariaViagens" , error);
                return 1.0; // Em caso de erro, retorna 1 para evitar divisão por zero
            }
        }

        public static async Task<double> CalcularMediaDiariaViagensAsync(
            DateTime dataViagem ,
            IUnitOfWork _unitOfWork)
        {
            try
            {
                System.Diagnostics.Debug.WriteLine($"[MEDIA QUERY] Iniciando cálculo para {dataViagem:dd/MM/yyyy}");

                // ✅ USA GetQuery() em vez de GetAll()
                // GetQuery() retorna IQueryable (não materializa)
                // Count() e Min() executam no SQL (rápido!)
                System.Diagnostics.Debug.WriteLine($"[MEDIA QUERY] Obtendo query (sem materializar)...");

                var query = _unitOfWork.Viagem.GetQuery(v =>
                    v.DataInicial.HasValue &&
                    v.DataInicial < dataViagem &&
                    v.Status == "Realizada"
                );

                System.Diagnostics.Debug.WriteLine($"[MEDIA QUERY] Executando COUNT no SQL...");

                // ✅ Count() executa SELECT COUNT(*) no SQL (milissegundos)
                int totalViagens = await Task.Run(() => query.Count());

                System.Diagnostics.Debug.WriteLine($"[MEDIA QUERY] Total: {totalViagens}");

                // Se não há viagens anteriores, retorna 1 (mínimo)
                if (totalViagens == 0)
                {
                    System.Diagnostics.Debug.WriteLine($"[MEDIA QUERY] Nenhuma viagem, retornando 1.0");
                    return 1.0;
                }

                System.Diagnostics.Debug.WriteLine($"[MEDIA QUERY] Executando MIN no SQL...");

                // ✅ Min() executa SELECT MIN(DataInicial) no SQL (milissegundos)
                DateTime primeiraViagem = await Task.Run(() => query.Min(v => v.DataInicial.Value));

                System.Diagnostics.Debug.WriteLine($"[MEDIA QUERY] Primeira viagem: {primeiraViagem:dd/MM/yyyy}");

                // Calcula total de DIAS desde a primeira viagem até esta data
                int totalDias = (dataViagem.Date - primeiraViagem.Date).Days;

                if (totalDias <= 0)
                {
                    totalDias = 1;
                }

                // Média DIÁRIA = Total de viagens / Total de dias
                double mediaDiaria = (double)totalViagens / (double)totalDias;

                // Converte para média MENSAL (multiplica por 30)
                double mediaMensal = mediaDiaria * 30.0;

                // Garante que a média nunca seja zero (mínimo 0.1)
                double resultadoFinal = Math.Max(mediaMensal , 0.1);

                System.Diagnostics.Debug.WriteLine($"[MEDIA QUERY] ✅ Resultado: {resultadoFinal:F2} viagens/mês ({mediaDiaria:F4}/dia)");

                return resultadoFinal;
            }
            catch (Exception error)
            {
                System.Diagnostics.Debug.WriteLine($"[MEDIA QUERY] ❌ ERRO: {error.Message}");
                System.Diagnostics.Debug.WriteLine($"[MEDIA QUERY] Stack: {error.StackTrace}");
                Alerta.TratamentoErroComLinha("Servicos.cs" , "CalcularMediaDiariaViagensAsync" , error);
                return 1.0;
            }
        }

        // ========================================
        // CONVERSÃO DE HTML PARA TEXTO SIMPLES
        // ========================================

        public static string ConvertHtml(string html)
        {
            try
            {
                if (html != null)
                {
                    HtmlDocument doc = new HtmlDocument();
                    doc.LoadHtml(html);

                    StringWriter sw = new StringWriter();
                    ConvertTo(doc.DocumentNode , sw);
                    sw.Flush();
                    var resultado = sw.ToString();

                    if (resultado.Length >= 4)
                    {
                        if (resultado != "" && resultado.Substring(0 , 4) == "\r\n")
                        {
                            return resultado.Remove(0 , 2);
                        }
                        else
                        {
                            return resultado;
                        }
                    }
                    else
                    {
                        return resultado;
                    }
                }
                else
                {
                    return "";
                }
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Servicos.cs" , "ConvertHtml" , error);
                return "";
            }
        }

        public static void ConvertTo(HtmlNode node , TextWriter outText)
        {
            try
            {
                string html;
                switch (node.NodeType)
                {
                    case HtmlNodeType.Comment:
                        // don't output comments
                        break;

                    case HtmlNodeType.Document:
                        ConvertContentTo(node , outText);
                        break;

                    case HtmlNodeType.Text:
                        // script and style must not be output
                        string parentName = node.ParentNode.Name;
                        if ((parentName == "script") || (parentName == "style"))
                            break;

                        // get text
                        html = ((HtmlTextNode)node).Text;

                        // is it in fact a special closing node output as text?
                        if (HtmlNode.IsOverlappedClosingElement(html))
                            break;

                        // check the text is meaningful and not a bunch of whitespaces
                        if (html.Trim().Length > 0)
                        {
                            outText.Write(HtmlEntity.DeEntitize(html));
                        }
                        break;

                    case HtmlNodeType.Element:
                        switch (node.Name)
                        {
                            case "p":
                                // treat paragraphs as crlf
                                outText.Write("\r\n");
                                break;
                        }

                        if (node.HasChildNodes)
                        {
                            ConvertContentTo(node , outText);
                        }
                        break;
                }
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Servicos.cs" , "ConvertTo" , error);
            }
        }

        public static void ConvertContentTo(HtmlNode node , TextWriter outText)
        {
            try
            {
                foreach (HtmlNode subnode in node.ChildNodes)
                {
                    ConvertTo(subnode , outText);
                }
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Servicos.cs" , "ConvertContentTo" , error);
            }
        }

        // ========================================
        // TREEVIEW E HIERARQUIA
        // ========================================

        [Route("Employees")]
        [HttpGet]
        public JsonResult Employees()
        {
            try
            {
                var result = _unitOfWork.SetorSolicitante.GetAll();
                {
                    var employees = from e in result
                                    select new
                                    {
                                        id = e.SetorSolicitanteId ,
                                        Name = e.Nome ,
                                        hasChildren = (from q in _unitOfWork.SetorSolicitante.GetAll()
                                                       where (q.SetorPaiId == e.SetorSolicitanteId)
                                                       select q
                                                       ).Count() > 0
                                    };

                    return new JsonResult(employees.ToList());
                }
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Servicos.cs" , "Employees" , error);
                return new JsonResult(new
                {
                    erro = error.Message
                });
            }
        }

        public class HierarchicalViewModel
        {
            public int ID
            {
                get; set;
            }

            public int? ParendID
            {
                get; set;
            }

            public bool HasChildren
            {
                get; set;
            }

            public string Name
            {
                get; set;
            }
        }

        public static IList<HierarchicalViewModel> GetHierarchicalData()
        {
            try
            {
                var result = new List<HierarchicalViewModel>()
                {
                    new HierarchicalViewModel() { ID = 1, ParendID = null, HasChildren = true, Name = "Parent item" },
                    new HierarchicalViewModel() { ID = 2, ParendID = 1, HasChildren = true, Name = "Parent item" },
                    new HierarchicalViewModel() { ID = 3, ParendID = 1, HasChildren = false, Name = "Item" },
                    new HierarchicalViewModel() { ID = 4, ParendID = 2, HasChildren = false, Name = "Item" },
                    new HierarchicalViewModel() { ID = 5, ParendID = 2, HasChildren = false, Name = "Item" }
                };

                return result;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Servicos.cs" , "GetHierarchicalData" , error);
                return new List<HierarchicalViewModel>();
            }
        }

        public IActionResult Read_TreeViewData(int? id)
        {
            try
            {
                var result = GetHierarchicalData()
                    .Where(x => id.HasValue ? x.ParendID == id : x.ParendID == null)
                    .Select(item => new
                    {
                        id = item.ID ,
                        Name = item.Name ,
                        hasChildren = item.HasChildren
                    });

                return new JsonResult(result);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Servicos.cs" , "Read_TreeViewData" , error);
                return new JsonResult(new
                {
                    erro = error.Message
                });
            }
        }

        // ========================================
        // FUNÇÃO TIRAACENTO - VERSÃO COMPLETA
        // ========================================

        /// <summary>
        /// Remove acentos e caracteres inválidos para nomes de arquivo
        /// Substitui espaços por underscore
        /// </summary>
        /// <param name="texto">Texto a ser normalizado</param>
        /// <returns>Texto normalizado e seguro para nome de arquivo</returns>
        public static string TiraAcento(string texto)
        {
            if (string.IsNullOrWhiteSpace(texto))
                return string.Empty;

            try
            {
                // Remove acentos usando normalização Unicode
                string normalizado = texto.Normalize(NormalizationForm.FormD);
                StringBuilder sb = new StringBuilder();

                foreach (char c in normalizado)
                {
                    UnicodeCategory categoria = CharUnicodeInfo.GetUnicodeCategory(c);
                    if (categoria != UnicodeCategory.NonSpacingMark)
                    {
                        sb.Append(c);
                    }
                }

                string resultado = sb.ToString().Normalize(NormalizationForm.FormC);

                // Substitui caracteres especiais que podem não ser cobertos pela normalização
                var substituicoes = new Dictionary<string , string>
                {
                    { "ß", "ss" }, { "œ", "oe" }, { "Œ", "OE" },
                    { "æ", "ae" }, { "Æ", "AE" }, { "ð", "d" },
                    { "Ð", "D" },  { "þ", "th" }, { "Þ", "TH" }
                };

                foreach (var sub in substituicoes)
                {
                    resultado = resultado.Replace(sub.Key , sub.Value);
                }

                // Remove caracteres inválidos para nomes de arquivo
                char[] caracteresInvalidos = Path.GetInvalidFileNameChars();
                resultado = string.Concat(resultado.Split(caracteresInvalidos));

                // Remove caracteres especiais, mantendo apenas alfanuméricos, espaços, underscore, hífen e ponto
                resultado = Regex.Replace(resultado , @"[^\w\s.\-]" , "");

                // Substitui espaços por underscore
                resultado = Regex.Replace(resultado , @"\s+" , "_");

                // Remove múltiplos underscores/hífens/pontos consecutivos
                resultado = Regex.Replace(resultado , @"_{2,}" , "_");
                resultado = Regex.Replace(resultado , @"-{2,}" , "-");
                resultado = Regex.Replace(resultado , @"\.{2,}" , ".");

                // Remove underscore/hífen no início e fim
                resultado = Regex.Replace(resultado , @"^[_\-]+|[_\-]+$" , "");

                // Limita tamanho (255 caracteres)
                if (resultado.Length > 255)
                {
                    resultado = resultado.Substring(0 , 255);
                }

                return resultado;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Servicos.cs" , "TiraAcento" , error);
                return texto;
            }
        }

        // Exemplos de uso:
        // TiraAcento("Açúcar & Café.pdf")        → "Acucar_Cafe.pdf"
        // TiraAcento("São Paulo/Rio")            → "Sao_PauloRio"
        // TiraAcento("Relatório 2024: análise")  → "Relatorio_2024_analise"
    }
}
