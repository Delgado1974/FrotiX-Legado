using FrotiX.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace FrotiX.Repository.IRepository
{
    public interface IAlertasFrotiXRepository :IRepository<AlertasFrotiX>
    {
        // Métodos existentes
        Task<IEnumerable<AlertasFrotiX>> GetTodosAlertasAtivosAsync();
        Task<IEnumerable<AlertasFrotiX>> GetTodosAlertasComLeituraAsync();
        Task<int> GetQuantidadeAlertasNaoLidosAsync(string usuarioId);
        Task<bool> MarcarComoLidoAsync(Guid alertaId , string usuarioId);
        Task<AlertasFrotiX> CriarAlertaAsync(AlertasFrotiX alerta , List<string> usuariosIds);

        // NOVOS MÉTODOS
        Task<AlertasFrotiX> GetAlertaComDetalhesAsync(Guid alertaId);
        Task<bool> MarcarComoApagadoAsync(Guid alertaId , string usuarioId);
        Task<bool> DesativarAlertaAsync(Guid alertaId);
        Task<IEnumerable<AlertasUsuario>> GetUsuariosNotificadosAsync(Guid alertaId);
        Task<AspNetUsers> GetUsuarioAsync(string usuarioId);
        Task<IEnumerable<AlertasFrotiX>> GetAlertasParaNotificarAsync();

    }
}
