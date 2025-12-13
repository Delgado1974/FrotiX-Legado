// ============================================================================
// SERVICOSASYNC.CS - VERSÃO CORRIGIDA
// Substitua o arquivo ServicosAsync.cs completo por este
// ============================================================================

using FrotiX.Models;
using FrotiX.Repository.IRepository;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace FrotiX.Services
{
    public static class ServicosAsync
    {
        public static async Task<double> CalculaCustoCombustivelAsync(Viagem viagemObj , IUnitOfWork _unitOfWork)
        {
            try
            {
                var veiculoQuery = _unitOfWork.ViewVeiculos
                    .GetAll(v => v.VeiculoId == viagemObj.VeiculoId);
                var veiculoObj = await Task.Run(() => veiculoQuery.FirstOrDefault());

                var combustivelQuery = _unitOfWork.Abastecimento
                    .GetAll(a => a.VeiculoId == viagemObj.VeiculoId)
                    .OrderByDescending(o => o.DataHora);
                var combustivelObj = await Task.Run(() => combustivelQuery.ToList());

                double ValorCombustivel = 0;
                if (!combustivelObj.Any())
                {
                    var abastecimentoQuery = _unitOfWork.MediaCombustivel
                        .GetAll(a => a.CombustivelId == veiculoObj.CombustivelId)
                        .OrderByDescending(o => o.Ano)
                        .ThenByDescending(o => o.Mes);
                    var abastecimento = await Task.Run(() => abastecimentoQuery.FirstOrDefault());
                    ValorCombustivel = (double)abastecimento.PrecoMedio;
                }
                else
                {
                    ValorCombustivel = (double)combustivelObj.First().ValorUnitario;
                }

                var Quilometragem = viagemObj.KmFinal - viagemObj.KmInicial;
                var ConsumoVeiculo = Convert.ToDouble(veiculoObj.Consumo);

                if (ConsumoVeiculo == 0)
                {
                    ConsumoVeiculo = 10;
                }

                var CustoViagem = (Quilometragem / ConsumoVeiculo) * ValorCombustivel;
                return (double)CustoViagem;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ServicosAsync.cs" , "CalculaCustoCombustivelAsync" , error);
                return 0;
            }
        }

        public static async Task<(double custo, int minutos)> CalculaCustoMotoristaAsync(
            Viagem viagemObj ,
            IUnitOfWork _unitOfWork)
        {
            try
            {
                var motoristaQuery = _unitOfWork.Motorista
                    .GetAll(m => m.MotoristaId == viagemObj.MotoristaId);
                var motoristaObj = await Task.Run(() => motoristaQuery.FirstOrDefault());

                if (motoristaObj.ContratoId == null)
                {
                    return (0, 0);
                }

                Guid contratoId = (Guid)motoristaObj.ContratoId;
                var topRepactuacaoQuery = _unitOfWork.RepactuacaoContrato
                    .GetAll(r => r.ContratoId == contratoId)
                    .OrderByDescending(r => r.DataRepactuacao);
                var topRepactuacao = await Task.Run(() => topRepactuacaoQuery.FirstOrDefault());

                var topMotoristaQuery = _unitOfWork.RepactuacaoTerceirizacao
                    .GetAll(rt => rt.RepactuacaoContratoId == topRepactuacao.RepactuacaoContratoId);
                var topMotorista = await Task.Run(() => topMotoristaQuery.FirstOrDefault());

                double valorMotorista = (double)topMotorista.ValorMotorista;

                const int HORAS_TRABALHO_DIA = 12;
                const int DIAS_UTEIS_MES = 22;

                double minutosMesUteis = DIAS_UTEIS_MES * HORAS_TRABALHO_DIA * 60;
                double custoMinutoMotorista = valorMotorista / minutosMesUteis;

                DateTime dataHoraInicio = viagemObj.DataInicial.Value.Date.Add(viagemObj.HoraInicio.Value.TimeOfDay);
                DateTime dataHoraFim = viagemObj.DataFinal.Value.Date.Add(viagemObj.HoraFim.Value.TimeOfDay);

                TimeSpan duracaoTotal = dataHoraFim - dataHoraInicio;

                double minutosViagemUteis = Servicos.CalcularMinutosUteisViagem(
                    dataHoraInicio ,
                    dataHoraFim ,
                    duracaoTotal ,
                    HORAS_TRABALHO_DIA
                );

                double custoCalculado = minutosViagemUteis * custoMinutoMotorista;
                int minutos = (int)minutosViagemUteis;

                return (Math.Min(custoCalculado , valorMotorista), minutos);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ServicosAsync.cs" , "CalculaCustoMotoristaAsync" , error);
                return (0, 0);
            }
        }

        public static async Task<double> CalculaCustoOperadorAsync(Viagem viagemObj , IUnitOfWork _unitOfWork)
        {
            try
            {
                var contratoQuery = _unitOfWork.Contrato
                    .GetAll(c => c.TipoContrato == "Terceirização" && c.ContratoOperadores == true)
                    .OrderByDescending(c => c.DataInicio);
                var contratoOperadores = await Task.Run(() => contratoQuery.FirstOrDefault());

                if (contratoOperadores == null)
                    return 0;

                var repactuacaoQuery = _unitOfWork.RepactuacaoContrato
                    .GetAll(r => r.ContratoId == contratoOperadores.ContratoId)
                    .OrderByDescending(r => r.DataRepactuacao);
                var topRepactuacao = await Task.Run(() => repactuacaoQuery.FirstOrDefault());

                if (topRepactuacao == null)
                    return 0;

                var terceirizacaoQuery = _unitOfWork.RepactuacaoTerceirizacao
                    .GetAll(rt => rt.RepactuacaoContratoId == topRepactuacao.RepactuacaoContratoId);
                var topTerceirizacao = await Task.Run(() => terceirizacaoQuery.FirstOrDefault());

                if (topTerceirizacao == null || topTerceirizacao.QtdOperadores == null || topTerceirizacao.ValorOperador == null)
                    return 0;

                double custoMensalOperadores = (double)(topTerceirizacao.QtdOperadores.Value * topTerceirizacao.ValorOperador.Value);

                // ✅ CORREÇÃO: Usar versão ASYNC do método
                double mediaViagens = await Servicos.CalcularMediaDiariaViagensAsync(viagemObj.DataInicial.Value , _unitOfWork);

                if (mediaViagens == 0)
                    return 0;

                double custoPorViagem = custoMensalOperadores / mediaViagens;

                return custoPorViagem;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ServicosAsync.cs" , "CalculaCustoOperadorAsync" , error);
                return 0;
            }
        }

        public static async Task<double> CalculaCustoLavadorAsync(Viagem viagemObj , IUnitOfWork _unitOfWork)
        {
            try
            {
                var contratoQuery = _unitOfWork.Contrato
                    .GetAll(c => c.TipoContrato == "Terceirização" && c.ContratoLavadores == true)
                    .OrderByDescending(c => c.DataInicio);
                var contratoLavadores = await Task.Run(() => contratoQuery.FirstOrDefault());

                if (contratoLavadores == null)
                    return 0;

                var repactuacaoQuery = _unitOfWork.RepactuacaoContrato
                    .GetAll(r => r.ContratoId == contratoLavadores.ContratoId)
                    .OrderByDescending(r => r.DataRepactuacao);
                var topRepactuacao = await Task.Run(() => repactuacaoQuery.FirstOrDefault());

                if (topRepactuacao == null)
                    return 0;

                var terceirizacaoQuery = _unitOfWork.RepactuacaoTerceirizacao
                    .GetAll(rt => rt.RepactuacaoContratoId == topRepactuacao.RepactuacaoContratoId);
                var topTerceirizacao = await Task.Run(() => terceirizacaoQuery.FirstOrDefault());

                if (topTerceirizacao == null || topTerceirizacao.QtdLavadores == null || topTerceirizacao.ValorLavador == null)
                    return 0;

                double custoMensalLavadores = (double)(topTerceirizacao.QtdLavadores.Value * topTerceirizacao.ValorLavador.Value);

                // ✅ CORREÇÃO: Usar versão ASYNC do método
                double mediaViagens = await Servicos.CalcularMediaDiariaViagensAsync(viagemObj.DataInicial.Value , _unitOfWork);

                if (mediaViagens == 0)
                    return 0;

                double custoPorViagem = custoMensalLavadores / mediaViagens;

                return custoPorViagem;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ServicosAsync.cs" , "CalculaCustoLavadorAsync" , error);
                return 0;
            }
        }

        public static async Task<double> CalculaCustoVeiculoAsync(Viagem viagemObj , IUnitOfWork _unitOfWork)
        {
            try
            {
                var veiculoQuery = _unitOfWork.Veiculo
                    .GetAll(v => v.VeiculoId == viagemObj.VeiculoId);
                var veiculoObj = await Task.Run(() => veiculoQuery.FirstOrDefault());

                double valorUnitario = await Task.Run(() => Servicos.ObterValorUnitarioVeiculo(veiculoObj , _unitOfWork));

                const int HORAS_UTEIS_DIA = 16;
                const int DIAS_UTEIS_MES = 22;

                double minutosMesUteis = DIAS_UTEIS_MES * HORAS_UTEIS_DIA * 60;
                double custoMinutoVeiculo = valorUnitario / minutosMesUteis;

                DateTime dataHoraInicio = viagemObj.DataInicial.Value.Date.Add(viagemObj.HoraInicio.Value.TimeOfDay);
                DateTime dataHoraFim = viagemObj.DataFinal.Value.Date.Add(viagemObj.HoraFim.Value.TimeOfDay);

                TimeSpan duracaoTotal = dataHoraFim - dataHoraInicio;

                double minutosViagemUteis = Servicos.CalcularMinutosUteisViagem(
                    dataHoraInicio ,
                    dataHoraFim ,
                    duracaoTotal ,
                    HORAS_UTEIS_DIA
                );

                double custoCalculado = minutosViagemUteis * custoMinutoVeiculo;

                return Math.Min(custoCalculado , valorUnitario);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ServicosAsync.cs" , "CalculaCustoVeiculoAsync" , error);
                return 0;
            }
        }
    }
}
