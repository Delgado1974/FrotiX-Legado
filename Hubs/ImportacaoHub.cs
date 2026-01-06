using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;

namespace FrotiX.Hubs
{
    /// <summary>
    /// Hub SignalR para envio de progresso em tempo real durante importação de planilhas
    /// </summary>
    public class ImportacaoHub : Hub
    {
        /// <summary>
        /// Chamado quando um cliente se conecta ao hub
        /// </summary>
        public override async Task OnConnectedAsync()
        {
            try
            {
                await base.OnConnectedAsync();
                await Clients.Caller.SendAsync("Conectado", Context.ConnectionId);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ImportacaoHub.cs", "OnConnectedAsync", error);
            }
        }

        /// <summary>
        /// Chamado quando um cliente se desconecta do hub
        /// </summary>
        public override async Task OnDisconnectedAsync(Exception exception)
        {
            try
            {
                await base.OnDisconnectedAsync(exception);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("ImportacaoHub.cs", "OnDisconnectedAsync", error);
            }
        }
    }

    /// <summary>
    /// DTO para envio de progresso ao cliente
    /// </summary>
    public class ProgressoImportacao
    {
        public int Porcentagem { get; set; }
        public string Etapa { get; set; }
        public string Detalhe { get; set; }
        public int LinhaAtual { get; set; }
        public int TotalLinhas { get; set; }

        // Resumo da planilha (enviado após leitura)
        public bool ResumoDisponivel { get; set; }
        public int TotalRegistros { get; set; }
        public string DataInicial { get; set; }
        public string DataFinal { get; set; }
        public int RegistrosGasolina { get; set; }
        public int RegistrosDiesel { get; set; }
        public int RegistrosOutros { get; set; }

        // Progresso detalhado por etapa (3 barras)
        public int XlsxAtual { get; set; }
        public int XlsxTotal { get; set; }
        public int CsvAtual { get; set; }
        public int CsvTotal { get; set; }
        public int ProcessAtual { get; set; }
        public int ProcessTotal { get; set; }
    }
}
