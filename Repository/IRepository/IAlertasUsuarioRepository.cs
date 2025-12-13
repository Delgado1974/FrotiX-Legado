using FrotiX.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace FrotiX.Repository.IRepository
{
    public interface IAlertasUsuarioRepository :IRepository<AlertasUsuario>
    {
        /// <summary>
        /// Obtém todos os alertas de um usuário específico
        /// </summary>
        Task<IEnumerable<AlertasUsuario>> ObterAlertasPorUsuarioAsync(string usuarioId);

        /// <summary>
        /// Obtém todos os usuários vinculados a um alerta
        /// </summary>
        Task<IEnumerable<AlertasUsuario>> ObterUsuariosPorAlertaAsync(Guid alertaId);

        /// <summary>
        /// Verifica se um usuário já tem um alerta específico vinculado
        /// </summary>
        Task<bool> UsuarioTemAlertaAsync(Guid alertaId , string usuarioId);

        /// <summary>
        /// Remove todos os alertas de um usuário
        /// </summary>
        Task RemoverAlertasDoUsuarioAsync(string usuarioId);

        /// <summary>
        /// Remove todos os usuários de um alerta
        /// </summary>
        Task RemoverUsuariosDoAlertaAsync(Guid alertaId);

        /// <summary>
        /// Atualiza a entidade AlertasUsuario
        /// </summary>
        void Update(AlertasUsuario alertaUsuario);
    }
}
