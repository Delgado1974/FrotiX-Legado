// ============================================================================
// AlertasFrotiXRepository.cs - VERSÃO CORRIGIDA
// Tratamento defensivo de NULLs nos Includes
// ============================================================================

using FrotiX.Data;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FrotiX.Repository
{
    public class AlertasFrotiXRepository : Repository<AlertasFrotiX>, IAlertasFrotiXRepository
    {
        private new readonly FrotiXDbContext _db;

        public AlertasFrotiXRepository(FrotiXDbContext db) : base(db)
        {
            _db = db;
        }

        // ====================================================================
        // MÉTODO CORRIGIDO - Removido Include de Viagem e Manutencao
        // que podem causar "Data is Null" quando têm campos NULL
        // ====================================================================
        public async Task<IEnumerable<AlertasFrotiX>> GetTodosAlertasAtivosAsync()
        {
            try
            {
                return await _db.AlertasFrotiX
                    .Include(a => a.AlertasUsuarios)
                    // REMOVIDO: .Include(a => a.Viagem)
                    // REMOVIDO: .Include(a => a.Manutencao)
                    // Esses includes causam erro quando Viagem/Manutencao têm campos NULL
                    .Where(a => a.Ativo)
                    .OrderByDescending(a => a.DataInsercao)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                Alerta.TratamentoErroComLinha("AlertasFrotiXRepository.cs", "GetTodosAlertasAtivosAsync", ex);
                return new List<AlertasFrotiX>();
            }
        }

        public async Task<IEnumerable<AlertasFrotiX>> GetTodosAlertasComLeituraAsync()
        {
            try
            {
                return await _db.AlertasFrotiX
                    .Include(a => a.AlertasUsuarios)
                    .Where(a => a.AlertasUsuarios.Any(au => au.Lido))
                    .OrderByDescending(a => a.DataInsercao)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                Alerta.TratamentoErroComLinha("AlertasFrotiXRepository.cs", "GetTodosAlertasComLeituraAsync", ex);
                return new List<AlertasFrotiX>();
            }
        }

        public async Task<int> GetQuantidadeAlertasNaoLidosAsync(string usuarioId)
        {
            try
            {
                return await _db.AlertasUsuario
                    .Where(au => au.UsuarioId == usuarioId && !au.Lido && !au.Apagado)
                    .Join(_db.AlertasFrotiX,
                        au => au.AlertasFrotiXId,
                        a => a.AlertasFrotiXId,
                        (au, a) => a)
                    .Where(a => a.Ativo)
                    .CountAsync();
            }
            catch (Exception ex)
            {
                Alerta.TratamentoErroComLinha("AlertasFrotiXRepository.cs", "GetQuantidadeAlertasNaoLidosAsync", ex);
                return 0;
            }
        }

        public async Task<bool> MarcarComoLidoAsync(Guid alertaId, string usuarioId)
        {
            try
            {
                var alertaUsuario = await _db.AlertasUsuario
                    .FirstOrDefaultAsync(au => au.AlertasFrotiXId == alertaId && au.UsuarioId == usuarioId);

                if (alertaUsuario != null)
                {
                    alertaUsuario.Lido = true;
                    alertaUsuario.DataLeitura = DateTime.Now;
                    await _db.SaveChangesAsync();
                    return true;
                }

                return false;
            }
            catch (Exception ex)
            {
                Alerta.TratamentoErroComLinha("AlertasFrotiXRepository.cs", "MarcarComoLidoAsync", ex);
                return false;
            }
        }

        public async Task<AlertasFrotiX> CriarAlertaAsync(AlertasFrotiX alerta, List<string> usuariosIds)
        {
            try
            {
                _db.AlertasFrotiX.Add(alerta);
                await _db.SaveChangesAsync();

                if (usuariosIds == null || !usuariosIds.Any())
                {
                    var todosUsuarios = await _db.AspNetUsers.Select(u => u.Id).ToListAsync();
                    usuariosIds = todosUsuarios;
                }

                foreach (var usuarioId in usuariosIds)
                {
                    var alertaUsuario = new AlertasUsuario
                    {
                        AlertasFrotiXId = alerta.AlertasFrotiXId,
                        UsuarioId = usuarioId,
                        Lido = false,
                        Notificado = false,
                        DataNotificacao = null,
                        Apagado = false
                    };

                    _db.AlertasUsuario.Add(alertaUsuario);
                }

                await _db.SaveChangesAsync();
                return alerta;
            }
            catch (Exception ex)
            {
                Alerta.TratamentoErroComLinha("AlertasFrotiXRepository.cs", "CriarAlertaAsync", ex);
                throw;
            }
        }

        // === NOVOS MÉTODOS ===

        public async Task<AlertasFrotiX> GetAlertaComDetalhesAsync(Guid alertaId)
        {
            try
            {
                return await _db.AlertasFrotiX
                    .Include(a => a.AlertasUsuarios)
                        .ThenInclude(au => au.Usuario)
                    .Include(a => a.Viagem)
                    .Include(a => a.Manutencao)
                        .ThenInclude(m => m.Veiculo)
                    .Include(a => a.Veiculo)
                    .Include(a => a.Motorista)
                    .FirstOrDefaultAsync(a => a.AlertasFrotiXId == alertaId);
            }
            catch (Exception ex)
            {
                Alerta.TratamentoErroComLinha("AlertasFrotiXRepository.cs", "GetAlertaComDetalhesAsync", ex);
                return null;
            }
        }

        public async Task<bool> MarcarComoApagadoAsync(Guid alertaId, string usuarioId)
        {
            try
            {
                var alertaUsuario = await _db.AlertasUsuario
                    .FirstOrDefaultAsync(au => au.AlertasFrotiXId == alertaId && au.UsuarioId == usuarioId);

                if (alertaUsuario != null && !alertaUsuario.Lido)
                {
                    alertaUsuario.Apagado = true;
                    alertaUsuario.DataApagado = DateTime.Now;
                    await _db.SaveChangesAsync();
                    return true;
                }

                return false;
            }
            catch (Exception ex)
            {
                Alerta.TratamentoErroComLinha("AlertasFrotiXRepository.cs", "MarcarComoApagadoAsync", ex);
                return false;
            }
        }

        public async Task<bool> DesativarAlertaAsync(Guid alertaId)
        {
            try
            {
                var alerta = await _db.AlertasFrotiX
                    .FirstOrDefaultAsync(a => a.AlertasFrotiXId == alertaId);

                if (alerta != null)
                {
                    alerta.Ativo = false;
                    alerta.DataDesativacao = DateTime.Now;
                    await _db.SaveChangesAsync();
                    return true;
                }

                return false;
            }
            catch (Exception ex)
            {
                Alerta.TratamentoErroComLinha("AlertasFrotiXRepository.cs", "DesativarAlertaAsync", ex);
                return false;
            }
        }

        public async Task<IEnumerable<AlertasUsuario>> GetUsuariosNotificadosAsync(Guid alertaId)
        {
            try
            {
                return await _db.AlertasUsuario
                    .Include(au => au.Usuario)
                    .Where(au => au.AlertasFrotiXId == alertaId)
                    .OrderBy(au => au.Usuario.UserName)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                Alerta.TratamentoErroComLinha("AlertasFrotiXRepository.cs", "GetUsuariosNotificadosAsync", ex);
                return new List<AlertasUsuario>();
            }
        }

        public async Task<AspNetUsers> GetUsuarioAsync(string usuarioId)
        {
            try
            {
                return await _db.AspNetUsers
                    .FirstOrDefaultAsync(u => u.Id == usuarioId);
            }
            catch (Exception ex)
            {
                Alerta.TratamentoErroComLinha("AlertasFrotiXRepository.cs", "GetUsuarioAsync", ex);
                return null;
            }
        }

        public async Task<IEnumerable<AlertasFrotiX>> GetAlertasParaNotificarAsync()
        {
            try
            {
                var agora = DateTime.Now;

                return await _db.AlertasFrotiX
                    .Include(a => a.AlertasUsuarios)
                        .ThenInclude(au => au.Usuario)
                    .Where(a => a.Ativo &&
                           (
                               // Alertas que devem ser exibidos ao abrir o sistema
                               (a.TipoExibicao == TipoExibicaoAlerta.AoAbrir) ||

                               // Alertas com horário específico (verifica se chegou a hora hoje)
                               (a.TipoExibicao == TipoExibicaoAlerta.Horario &&
                                a.HorarioExibicao.HasValue &&
                                agora.TimeOfDay >= a.HorarioExibicao.Value &&
                                agora.TimeOfDay <= a.HorarioExibicao.Value.Add(TimeSpan.FromMinutes(5))) ||

                               // Alertas com data/hora específica
                               (a.TipoExibicao == TipoExibicaoAlerta.DataHora &&
                                a.DataExibicao.HasValue &&
                                a.DataExibicao.Value <= agora &&
                                (!a.DataExpiracao.HasValue || a.DataExpiracao.Value >= agora))
                           ))
                    .Where(a => !a.DataExpiracao.HasValue || a.DataExpiracao.Value >= agora) // Não expirados
                    .OrderByDescending(a => a.Prioridade)
                    .ThenByDescending(a => a.DataInsercao)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                Alerta.TratamentoErroComLinha("AlertasFrotiXRepository.cs", "GetAlertasParaNotificarAsync", ex);
                return new List<AlertasFrotiX>();
            }
        }
    }
}
