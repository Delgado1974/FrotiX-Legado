using FrotiX.Data;
using FrotiX.Helpers;
using FrotiX.Hubs;
using FrotiX.Models;
using FrotiX.Repository.IRepository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

// Alias para evitar conflito entre namespace FrotiX.Pages.AlertasFrotiX e classe FrotiX.Models.AlertasFrotiX
using AlertaModel = FrotiX.Models.AlertasFrotiX;

namespace FrotiX.Pages.AlertasFrotiX
{
    [Authorize]
    public class UpsertModel : PageModel
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IAlertasFrotiXRepository _alertasRepo;
        private readonly UserManager<IdentityUser> _userManager;
        private readonly IHubContext<AlertasHub> _hubContext;
        private readonly FrotiXDbContext _context;

        // =====================================================================
        // PROPRIEDADES EXISTENTES
        // =====================================================================

        [BindProperty]
        public Guid AlertasFrotiXId { get; set; }

        [BindProperty]
        public string Titulo { get; set; }

        [BindProperty]
        public string Descricao { get; set; }

        [BindProperty]
        public TipoAlerta TipoAlerta { get; set; }

        [BindProperty]
        public PrioridadeAlerta Prioridade { get; set; }

        [BindProperty]
        public TipoExibicaoAlerta TipoExibicao { get; set; }

        [BindProperty]
        public DateTime? DataExibicao { get; set; }

        [BindProperty]
        public TimeSpan? HorarioExibicao { get; set; }

        [BindProperty]
        public DateTime? DataExpiracao { get; set; }

        [BindProperty]
        public Guid? ViagemId { get; set; }

        [BindProperty]
        public Guid? ManutencaoId { get; set; }

        [BindProperty]
        public Guid? MotoristaId { get; set; }

        [BindProperty]
        public Guid? VeiculoId { get; set; }

        [BindProperty]
        public List<string> UsuariosIds { get; set; }

        // =====================================================================
        // PROPRIEDADES DE RECORRÊNCIA V2
        // =====================================================================

        /// <summary>
        /// Dias da semana selecionados (para TipoExibicao 5=Semanal e 6=Quinzenal)
        /// </summary>
        [BindProperty]
        public List<int> DiasSemana { get; set; }

        /// <summary>
        /// Dia específico do mês (para TipoExibicao 7=Mensal) - 1 a 31
        /// </summary>
        [BindProperty]
        public int? DiaMesRecorrencia { get; set; }

        /// <summary>
        /// Lista de datas separadas por vírgula (para TipoExibicao 8=Dias Variados)
        /// </summary>
        [BindProperty]
        public string DatasSelecionadas { get; set; }

        // =====================================================================
        // LISTAS PARA DROPDOWNS
        // =====================================================================

        public List<SelectListItem> PrioridadesList { get; set; }

        public List<SelectListItem> TipoExibicaoList { get; set; }

        public List<ViagemDropdownItem> ViagensListCompleta { get; set; }

        public List<SelectListItem> ViagensList { get; set; }

        public List<ManutencaoDropdownData> ManutencoesListCompleta { get; set; }

        public List<SelectListItem> ManutencoesList { get; set; }

        public List<SelectListItem> MotoristasList { get; set; }

        public List<SelectListItem> VeiculosList { get; set; }

        public List<SelectListItem> UsuariosList { get; set; }

        /// <summary>
        /// Lista para dropdown de Dias da Semana
        /// </summary>
        public List<SelectListItem> DiasSemanaList { get; set; }

        /// <summary>
        /// Lista para dropdown de Dias do Mês (1-31)
        /// </summary>
        public List<SelectListItem> DiasMesList { get; set; }

        // =====================================================================
        // CLASSES AUXILIARES
        // =====================================================================

        public class ViagemDropdownItem
        {
            public Guid ViagemId { get; set; }
            public string DataInicial { get; set; }
            public string HoraInicio { get; set; }
            public string Finalidade { get; set; }
            public string Requisitante { get; set; }
        }

        public class ManutencaoDropdownData
        {
            public Guid ManutencaoId { get; set; }
            public string NumOS { get; set; }
        }

        // =====================================================================
        // CONSTRUTOR
        // =====================================================================

        public UpsertModel(
            IUnitOfWork unitOfWork,
            IAlertasFrotiXRepository alertasRepo,
            UserManager<IdentityUser> userManager,
            IHubContext<AlertasHub> hubContext,
            FrotiXDbContext context)
        {
            try
            {
                _unitOfWork = unitOfWork;
                _alertasRepo = alertasRepo;
                _userManager = userManager;
                _hubContext = hubContext;
                _context = context;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs", "UpsertModel", error);
            }
        }

        // =====================================================================
        // OnGet - CARREGA DADOS PARA A PÁGINA
        // =====================================================================

        public async Task<IActionResult> OnGetAsync(Guid? id)
        {
            try
            {
                await CarregarListas();

                if (id.HasValue && id.Value != Guid.Empty)
                {
                    // Modo Edição
                    var alerta = await _unitOfWork.AlertasFrotiX.GetFirstOrDefaultAsync(
                        a => a.AlertasFrotiXId == id.Value,
                        includeProperties: "AlertasUsuarios"
                    );

                    if (alerta == null)
                    {
                        TempData["erro"] = "Alerta não encontrado";
                        return RedirectToPage("/AlertasFrotiX/Index");
                    }

                    // Preencher propriedades existentes
                    AlertasFrotiXId = alerta.AlertasFrotiXId;
                    Titulo = alerta.Titulo;
                    Descricao = alerta.Descricao;
                    TipoAlerta = alerta.TipoAlerta;
                    Prioridade = alerta.Prioridade;
                    TipoExibicao = alerta.TipoExibicao;
                    DataExibicao = alerta.DataExibicao;
                    HorarioExibicao = alerta.HorarioExibicao;
                    DataExpiracao = alerta.DataExpiracao;
                    ViagemId = alerta.ViagemId;
                    ManutencaoId = alerta.ManutencaoId;
                    MotoristaId = alerta.MotoristaId;
                    VeiculoId = alerta.VeiculoId;

                    // Preencher propriedades de recorrência V2
                    DiaMesRecorrencia = alerta.DiaMesRecorrencia;
                    DatasSelecionadas = alerta.DatasSelecionadas;

                    // Converter dias da semana booleanos para lista de inteiros
                    DiasSemana = new List<int>();
                    if (alerta.Sunday) DiasSemana.Add(0);
                    if (alerta.Monday) DiasSemana.Add(1);
                    if (alerta.Tuesday) DiasSemana.Add(2);
                    if (alerta.Wednesday) DiasSemana.Add(3);
                    if (alerta.Thursday) DiasSemana.Add(4);
                    if (alerta.Friday) DiasSemana.Add(5);
                    if (alerta.Saturday) DiasSemana.Add(6);

                    // Carregar usuários destinatários
                    UsuariosIds = alerta.AlertasUsuarios?
                        .Select(au => au.UsuarioId)
                        .ToList() ?? new List<string>();
                }
                else
                {
                    // Modo Novo
                    AlertasFrotiXId = Guid.Empty;
                    Prioridade = PrioridadeAlerta.Media;
                    TipoExibicao = TipoExibicaoAlerta.AoAbrir;
                    DiasSemana = new List<int>();
                }

                return Page();
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs", "OnGetAsync", error);
                TempData["erro"] = "Erro ao carregar a página";
                return RedirectToPage("/AlertasFrotiX/Index");
            }
        }

        // =====================================================================
        // OnPost - SALVA O ALERTA
        // =====================================================================

        public async Task<IActionResult> OnPostAsync()
        {
            try
            {
                var userId = _userManager.GetUserId(User);

                if (AlertasFrotiXId == Guid.Empty)
                {
                    // Novo Alerta
                    var novoAlerta = CriarNovoAlerta(userId);

                    // V2: Se TipoExibicao >= 4, é recorrente
                    if ((int)TipoExibicao >= 4)
                    {
                        await CriarAlertasRecorrentes(novoAlerta, userId);
                    }
                    else
                    {
                        // Criar alerta único
                        await _unitOfWork.AlertasFrotiX.AddAsync(novoAlerta);
                        await _unitOfWork.SaveAsync();

                        // Criar AlertasUsuario para cada destinatário
                        await CriarAlertasUsuario(novoAlerta.AlertasFrotiXId);

                        // Notificar via SignalR
                        await NotificarUsuarios(novoAlerta.AlertasFrotiXId);
                    }

                    TempData["sucesso"] = "Alerta criado com sucesso!";
                }
                else
                {
                    // Editar Alerta existente
                    var alerta = await _unitOfWork.AlertasFrotiX.GetFirstOrDefaultAsync(
                        a => a.AlertasFrotiXId == AlertasFrotiXId,
                        includeProperties: "AlertasUsuarios"
                    );

                    if (alerta == null)
                    {
                        TempData["erro"] = "Alerta não encontrado";
                        return RedirectToPage("/AlertasFrotiX/Index");
                    }

                    AtualizarAlerta(alerta);
                    _unitOfWork.AlertasFrotiX.Update(alerta);
                    await _unitOfWork.SaveAsync();

                    // Atualizar AlertasUsuario
                    await AtualizarAlertasUsuario(alerta.AlertasFrotiXId);

                    TempData["sucesso"] = "Alerta atualizado com sucesso!";
                }

                return RedirectToPage("/AlertasFrotiX/Index");
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs", "OnPostAsync", error);
                TempData["erro"] = "Erro ao salvar o alerta";
                await CarregarListas();
                return Page();
            }
        }

        // =====================================================================
        // MÉTODOS AUXILIARES
        // =====================================================================

        /// <summary>
        /// Cria um novo objeto AlertasFrotiX com os dados do formulário
        /// </summary>
        private AlertaModel CriarNovoAlerta(string userId)
        {
            try
            {
                var alertaId = Guid.NewGuid();

                var alerta = new AlertaModel
                {
                    AlertasFrotiXId = alertaId,
                    Titulo = Titulo,
                    Descricao = Descricao,
                    TipoAlerta = TipoAlerta,
                    Prioridade = Prioridade,
                    TipoExibicao = TipoExibicao,
                    DataExibicao = DataExibicao,
                    HorarioExibicao = HorarioExibicao,
                    DataExpiracao = DataExpiracao, // V2: Serve para ambos: único e recorrente
                    DataInsercao = DateTime.Now,
                    UsuarioCriadorId = userId,
                    Ativo = true,
                    ViagemId = ViagemId,
                    ManutencaoId = ManutencaoId,
                    MotoristaId = MotoristaId,
                    VeiculoId = VeiculoId,

                    // Campos de recorrência V2
                    DiaMesRecorrencia = DiaMesRecorrencia,
                    DatasSelecionadas = DatasSelecionadas,

                    // V2: Auto-referência se recorrente (TipoExibicao >= 4)
                    RecorrenciaAlertaId = ((int)TipoExibicao >= 4) ? alertaId : (Guid?)null
                };

                PreencherDiasSemana(alerta);
                return alerta;
            }
            catch (Exception ex)
            {
                throw new Exception($"Erro ao criar novo alerta: {ex.Message}", ex);
            }
        }

        /// <summary>
        /// Preenche os campos booleanos de dias da semana a partir da lista DiasSemana
        /// </summary>
        private void PreencherDiasSemana(AlertaModel alerta)
        {
            try
            {
                // Resetar todos os dias
                alerta.Sunday = false;
                alerta.Monday = false;
                alerta.Tuesday = false;
                alerta.Wednesday = false;
                alerta.Thursday = false;
                alerta.Friday = false;
                alerta.Saturday = false;

                // V2: TipoExibicao 4 = Diário (seg-sex), força segunda a sexta
                if ((int)alerta.TipoExibicao == 4)
                {
                    alerta.Monday = true;
                    alerta.Tuesday = true;
                    alerta.Wednesday = true;
                    alerta.Thursday = true;
                    alerta.Friday = true;
                    return;
                }

                // Para TipoExibicao 5 (Semanal) e 6 (Quinzenal), usar DiasSemana
                if (DiasSemana != null && DiasSemana.Any())
                {
                    foreach (var dia in DiasSemana)
                    {
                        switch (dia)
                        {
                            case 0:
                                alerta.Sunday = true;
                                break;
                            case 1:
                                alerta.Monday = true;
                                break;
                            case 2:
                                alerta.Tuesday = true;
                                break;
                            case 3:
                                alerta.Wednesday = true;
                                break;
                            case 4:
                                alerta.Thursday = true;
                                break;
                            case 5:
                                alerta.Friday = true;
                                break;
                            case 6:
                                alerta.Saturday = true;
                                break;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                throw new Exception($"Erro ao preencher dias da semana: {ex.Message}", ex);
            }
        }

        /// <summary>
        /// Atualiza um alerta existente com os dados do formulário
        /// </summary>
        private void AtualizarAlerta(AlertaModel alerta)
        {
            try
            {
                alerta.Titulo = Titulo;
                alerta.Descricao = Descricao;
                alerta.TipoAlerta = TipoAlerta;
                alerta.Prioridade = Prioridade;
                alerta.TipoExibicao = TipoExibicao;
                alerta.DataExibicao = DataExibicao;
                alerta.HorarioExibicao = HorarioExibicao;
                alerta.DataExpiracao = DataExpiracao; // V2: Usado para recorrências também
                alerta.ViagemId = ViagemId;
                alerta.ManutencaoId = ManutencaoId;
                alerta.MotoristaId = MotoristaId;
                alerta.VeiculoId = VeiculoId;

                // Campos de recorrência V2
                alerta.DiaMesRecorrencia = DiaMesRecorrencia;
                alerta.DatasSelecionadas = DatasSelecionadas;

                PreencherDiasSemana(alerta);
            }
            catch (Exception ex)
            {
                throw new Exception($"Erro ao atualizar alerta: {ex.Message}", ex);
            }
        }

        /// <summary>
        /// Cria alertas recorrentes baseado no TipoExibicao (V2)
        /// </summary>
        private async Task CriarAlertasRecorrentes(AlertaModel alertaOriginal, string userId)
        {
            try
            {
                var datas = GerarDatasRecorrencia();
                if (datas == null || datas.Count == 0)
                {
                    // Se não conseguiu gerar datas, criar apenas um alerta
                    await _unitOfWork.AlertasFrotiX.AddAsync(alertaOriginal);
                    await _unitOfWork.SaveAsync();
                    await CriarAlertasUsuario(alertaOriginal.AlertasFrotiXId);
                    return;
                }

                // O primeiro alerta é o "original" da série (já tem RecorrenciaAlertaId auto-referenciado)
                alertaOriginal.DataExibicao = datas[0];
                await _unitOfWork.AlertasFrotiX.AddAsync(alertaOriginal);
                await _unitOfWork.SaveAsync();

                // Criar AlertasUsuario para o primeiro
                await CriarAlertasUsuario(alertaOriginal.AlertasFrotiXId);

                // Criar os demais alertas da série
                for (int i = 1; i < datas.Count; i++)
                {
                    var alertaRecorrente = new AlertaModel
                    {
                        AlertasFrotiXId = Guid.NewGuid(),
                        Titulo = alertaOriginal.Titulo,
                        Descricao = alertaOriginal.Descricao,
                        TipoAlerta = alertaOriginal.TipoAlerta,
                        Prioridade = alertaOriginal.Prioridade,
                        TipoExibicao = alertaOriginal.TipoExibicao,
                        HorarioExibicao = alertaOriginal.HorarioExibicao,
                        DataInsercao = DateTime.Now,
                        UsuarioCriadorId = userId,
                        Ativo = true,
                        ViagemId = alertaOriginal.ViagemId,
                        ManutencaoId = alertaOriginal.ManutencaoId,
                        MotoristaId = alertaOriginal.MotoristaId,
                        VeiculoId = alertaOriginal.VeiculoId,

                        // V2: Campos de recorrência
                        RecorrenciaAlertaId = alertaOriginal.AlertasFrotiXId, // Aponta para o original
                        DataExibicao = datas[i],
                        DataExpiracao = alertaOriginal.DataExpiracao, // Mesma data de expiração

                        // Copiar campos de recorrência
                        DiaMesRecorrencia = alertaOriginal.DiaMesRecorrencia,
                        DatasSelecionadas = alertaOriginal.DatasSelecionadas,
                        Monday = alertaOriginal.Monday,
                        Tuesday = alertaOriginal.Tuesday,
                        Wednesday = alertaOriginal.Wednesday,
                        Thursday = alertaOriginal.Thursday,
                        Friday = alertaOriginal.Friday,
                        Saturday = alertaOriginal.Saturday,
                        Sunday = alertaOriginal.Sunday
                    };

                    await _unitOfWork.AlertasFrotiX.AddAsync(alertaRecorrente);
                    await _unitOfWork.SaveAsync();

                    // Criar AlertasUsuario
                    await CriarAlertasUsuario(alertaRecorrente.AlertasFrotiXId);
                }

                // Notificar todos os usuários sobre o primeiro alerta
                await NotificarUsuarios(alertaOriginal.AlertasFrotiXId);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs", "CriarAlertasRecorrentes", error);
                throw;
            }
        }

        /// <summary>
        /// Gera as datas de recorrência baseado no TipoExibicao (V2)
        /// </summary>
        private List<DateTime> GerarDatasRecorrencia()
        {
            try
            {
                var datas = new List<DateTime>();
                var dataInicial = DataExibicao ?? DateTime.Today;
                var dataFinal = DataExpiracao ?? dataInicial.AddMonths(3); // V2: Usa DataExpiracao

                int tipoExibicao = (int)TipoExibicao;

                switch (tipoExibicao)
                {
                    case 4: // Recorrente Diário (seg-sex)
                        var dataAtual = dataInicial;
                        while (dataAtual <= dataFinal)
                        {
                            if (dataAtual.DayOfWeek != DayOfWeek.Saturday &&
                                dataAtual.DayOfWeek != DayOfWeek.Sunday)
                            {
                                datas.Add(dataAtual);
                            }
                            dataAtual = dataAtual.AddDays(1);
                        }
                        break;

                    case 5: // Recorrente Semanal
                    case 6: // Recorrente Quinzenal
                        var intervaloSemanas = tipoExibicao == 5 ? 1 : 2;
                        dataAtual = dataInicial;
                        while (dataAtual <= dataFinal)
                        {
                            foreach (var dia in DiasSemana ?? new List<int>())
                            {
                                var dataComDia = ObterProximoDiaSemana(dataAtual, (DayOfWeek)dia);
                                if (dataComDia >= dataInicial && dataComDia <= dataFinal &&
                                    !datas.Contains(dataComDia))
                                {
                                    datas.Add(dataComDia);
                                }
                            }
                            dataAtual = dataAtual.AddDays(7 * intervaloSemanas);
                        }
                        datas = datas.OrderBy(d => d).ToList();
                        break;

                    case 7: // Recorrente Mensal
                        dataAtual = new DateTime(dataInicial.Year, dataInicial.Month,
                            Math.Min(DiaMesRecorrencia ?? 1, DateTime.DaysInMonth(dataInicial.Year, dataInicial.Month)));
                        while (dataAtual <= dataFinal)
                        {
                            if (dataAtual >= dataInicial)
                            {
                                datas.Add(dataAtual);
                            }
                            dataAtual = dataAtual.AddMonths(1);
                            // Ajustar dia para meses com menos dias
                            var ultimoDia = DateTime.DaysInMonth(dataAtual.Year, dataAtual.Month);
                            dataAtual = new DateTime(dataAtual.Year, dataAtual.Month,
                                Math.Min(DiaMesRecorrencia ?? 1, ultimoDia));
                        }
                        break;

                    case 8: // Recorrente Dias Variados
                        if (!string.IsNullOrEmpty(DatasSelecionadas))
                        {
                            var datasString = DatasSelecionadas.Split(',');
                            foreach (var dataStr in datasString)
                            {
                                if (DateTime.TryParse(dataStr.Trim(), out DateTime data))
                                {
                                    if (data >= dataInicial && data <= dataFinal)
                                    {
                                        datas.Add(data);
                                    }
                                }
                            }
                            datas = datas.OrderBy(d => d).ToList();
                        }
                        break;
                }

                return datas;
            }
            catch (Exception ex)
            {
                throw new Exception($"Erro ao gerar datas de recorrência: {ex.Message}", ex);
            }
        }

        /// <summary>
        /// Obtém a próxima ocorrência de um dia da semana a partir de uma data
        /// </summary>
        private DateTime ObterProximoDiaSemana(DateTime dataBase, DayOfWeek diaSemana)
        {
            var diasAteProximo = ((int)diaSemana - (int)dataBase.DayOfWeek + 7) % 7;
            return dataBase.AddDays(diasAteProximo);
        }

        /// <summary>
        /// Cria os registros AlertasUsuario para os destinatários
        /// </summary>
        private async Task CriarAlertasUsuario(Guid alertaId)
        {
            try
            {
                if (UsuariosIds == null || UsuariosIds.Count == 0) return;

                foreach (var usuarioId in UsuariosIds)
                {
                    var alertaUsuario = new AlertasUsuario
                    {
                        AlertasUsuarioId = Guid.NewGuid(),
                        AlertasFrotiXId = alertaId,
                        UsuarioId = usuarioId,
                        Lido = false,
                        Notificado = false
                    };

                    await _unitOfWork.AlertasUsuario.AddAsync(alertaUsuario);
                }

                await _unitOfWork.SaveAsync();
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs", "CriarAlertasUsuario", error);
            }
        }

        /// <summary>
        /// Atualiza os registros AlertasUsuario quando o alerta é editado
        /// </summary>
        private async Task AtualizarAlertasUsuario(Guid alertaId)
        {
            try
            {
                // Remover alertas de usuários que não estão mais na lista
                var alertasExistentes = await _unitOfWork.AlertasUsuario
                    .GetAllAsync(au => au.AlertasFrotiXId == alertaId);

                foreach (var au in alertasExistentes)
                {
                    if (!UsuariosIds.Contains(au.UsuarioId))
                    {
                        _unitOfWork.AlertasUsuario.Remove(au);
                    }
                }

                // Adicionar novos usuários
                var usuariosExistentes = alertasExistentes.Select(au => au.UsuarioId).ToList();
                foreach (var usuarioId in UsuariosIds)
                {
                    if (!usuariosExistentes.Contains(usuarioId))
                    {
                        var alertaUsuario = new AlertasUsuario
                        {
                            AlertasUsuarioId = Guid.NewGuid(),
                            AlertasFrotiXId = alertaId,
                            UsuarioId = usuarioId,
                            Lido = false,
                            Notificado = false
                        };
                        await _unitOfWork.AlertasUsuario.AddAsync(alertaUsuario);
                    }
                }

                await _unitOfWork.SaveAsync();
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs", "AtualizarAlertasUsuario", error);
            }
        }

        /// <summary>
        /// Notifica os usuários via SignalR
        /// </summary>
        private async Task NotificarUsuarios(Guid alertaId)
        {
            try
            {
                await _hubContext.Clients.All.SendAsync("NovoAlerta", alertaId.ToString());
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs", "NotificarUsuarios", error);
            }
        }

        /// <summary>
        /// Carrega as listas principais para os dropdowns
        /// </summary>
        private async Task CarregarListas()
        {
            try
            {
                // Lista de Prioridades
                PrioridadesList = Enum.GetValues(typeof(PrioridadeAlerta))
                    .Cast<PrioridadeAlerta>()
                    .Select(p => new SelectListItem
                    {
                        Text = p.GetDisplayName(),
                        Value = ((int)p).ToString()
                    })
                    .ToList();

                // Lista de Tipos de Exibição (V2: valores 1-8)
                TipoExibicaoList = Enum.GetValues(typeof(TipoExibicaoAlerta))
                    .Cast<TipoExibicaoAlerta>()
                    .Select(e => new SelectListItem
                    {
                        Value = ((int)e).ToString(),
                        Text = e.GetType()
                            .GetField(e.ToString())
                            .GetCustomAttributes(typeof(DisplayAttribute), false)
                            .Cast<DisplayAttribute>()
                            .FirstOrDefault()?.Name ?? e.ToString()
                    })
                    .ToList();

                // Lista de Usuários
                var usuarios = await _context.AspNetUsers
                    .OrderBy(u => u.UserName)
                    .ToListAsync();

                UsuariosList = usuarios.Select(u => new SelectListItem
                {
                    Text = u.UserName,
                    Value = u.Id
                }).ToList();

                // Lista de Motoristas
                var motoristas = await _unitOfWork.ViewMotoristasViagem.GetAllAsync();
                MotoristasList = motoristas
                    .OrderBy(m => m.Nome)
                    .Select(m => new SelectListItem
                    {
                        Text = m.Nome,
                        Value = m.MotoristaId.ToString()
                    })
                    .ToList();

                // Lista de Veículos
                var veiculos = await _unitOfWork.ViewVeiculos.GetAllAsync();
                VeiculosList = veiculos
                    .OrderBy(v => v.Placa)
                    .Select(v => new SelectListItem
                    {
                        Text = $"{v.Placa} - {v.MarcaModelo}",
                        Value = v.VeiculoId.ToString()
                    })
                    .ToList();

                // Lista de Viagens (últimas 100)
                var viagens = await _unitOfWork.ViewViagens.GetAllAsync();
                ViagensListCompleta = viagens
                    .OrderByDescending(v => v.DataInicial)
                    .Take(100)
                    .Select(v => new ViagemDropdownItem
                    {
                        ViagemId = v.ViagemId,
                        DataInicial = v.DataInicial?.ToString("dd/MM/yyyy"),
                        HoraInicio = v.HoraInicio?.ToString(@"hh\:mm"),
                        Finalidade = v.Finalidade
                    })
                    .ToList();

                // Lista de Manutenções (últimas 100)
                var manutencoes = await _unitOfWork.ViewManutencao.GetAllAsync();
                ManutencoesListCompleta = manutencoes
                    .OrderByDescending(m => m.DataSolicitacaoRaw)
                    .Take(100)
                    .Select(m => new ManutencaoDropdownData
                    {
                        ManutencaoId = m.ManutencaoId,
                        NumOS = m.NumOS
                    })
                    .ToList();

                // Lista de Dias da Semana (mantida para JavaScript)
                DiasSemanaList = new List<SelectListItem>
                {
                    new SelectListItem { Text = "Domingo", Value = "0" },
                    new SelectListItem { Text = "Segunda-Feira", Value = "1" },
                    new SelectListItem { Text = "Terça-Feira", Value = "2" },
                    new SelectListItem { Text = "Quarta-Feira", Value = "3" },
                    new SelectListItem { Text = "Quinta-Feira", Value = "4" },
                    new SelectListItem { Text = "Sexta-Feira", Value = "5" },
                    new SelectListItem { Text = "Sábado", Value = "6" }
                };

                // Lista de Dias do Mês (1-31) (mantida para JavaScript)
                DiasMesList = Enumerable.Range(1, 31)
                    .Select(d => new SelectListItem
                    {
                        Text = d.ToString(),
                        Value = d.ToString()
                    })
                    .ToList();
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("Upsert.cshtml.cs", "CarregarListas", error);
            }
        }
    }

    // =====================================================================
    // EXTENSÕES AUXILIARES
    // =====================================================================

    public static class EnumExtensions
    {
        public static string GetDisplayName(this Enum enumValue)
        {
            try
            {
                var field = enumValue.GetType().GetField(enumValue.ToString());
                var attribute = field?.GetCustomAttributes(typeof(System.ComponentModel.DataAnnotations.DisplayAttribute), false)
                    .FirstOrDefault() as System.ComponentModel.DataAnnotations.DisplayAttribute;
                return attribute?.Name ?? enumValue.ToString();
            }
            catch
            {
                return enumValue.ToString();
            }
        }
    }
}
