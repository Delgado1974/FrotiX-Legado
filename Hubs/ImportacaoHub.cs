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
    }
}
