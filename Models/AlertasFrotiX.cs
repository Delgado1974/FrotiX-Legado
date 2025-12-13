using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FrotiX.Models
{
    public class AlertasFrotiX
    {
        [Key]
        public Guid AlertasFrotiXId
        {
            get; set;
        }

        [Required(ErrorMessage = "O título do alerta é obrigatório")]
        [StringLength(200 , ErrorMessage = "O título deve ter no máximo 200 caracteres")]
        public string? Titulo
        {
            get; set;
        }

        [Required(ErrorMessage = "A descrição do alerta é obrigatória")]
        [StringLength(1000 , ErrorMessage = "A descrição deve ter no máximo 1000 caracteres")]
        public string? Descricao
        {
            get; set;
        }

        [Required(ErrorMessage = "O tipo de alerta é obrigatório")]
        public TipoAlerta TipoAlerta
        {
            get; set;
        }

        [Required(ErrorMessage = "A prioridade é obrigatória")]
        public PrioridadeAlerta Prioridade
        {
            get; set;
        }

        [Required]
        public DateTime? DataInsercao
        {
            get; set;
        }

        /// <summary>
        /// Data de exibição do alerta
        /// Para alertas recorrentes: Data INICIAL da recorrência
        /// </summary>
        public DateTime? DataExibicao
        {
            get; set;
        }

        /// <summary>
        /// Data de expiração do alerta
        /// Para alertas recorrentes: Data FINAL da recorrência (término da série)
        /// </summary>
        public DateTime? DataExpiracao
        {
            get; set;
        }

        // Data de desativação do alerta
        public DateTime? DataDesativacao
        {
            get; set;
        }

        public string? DesativadoPor
        {
            get; set;
        }

        public string? MotivoDesativacao
        {
            get; set;
        }

        // Relacionamentos opcionais
        public Guid? ViagemId
        {
            get; set;
        }

        [ForeignKey("ViagemId")]
        public virtual Viagem Viagem
        {
            get; set;
        }

        public Guid? ManutencaoId
        {
            get; set;
        }

        [ForeignKey("ManutencaoId")]
        public virtual Manutencao Manutencao
        {
            get; set;
        }

        public Guid? MotoristaId
        {
            get; set;
        }

        [ForeignKey("MotoristaId")]
        public virtual Motorista Motorista
        {
            get; set;
        }

        public Guid? VeiculoId
        {
            get; set;
        }

        [ForeignKey("VeiculoId")]
        public virtual Veiculo Veiculo
        {
            get; set;
        }

        /// <summary>
        /// Tipo de exibição do alerta
        /// Valores 1-3: Exibição única
        /// Valores 4-8: Exibição recorrente
        /// </summary>
        public TipoExibicaoAlerta TipoExibicao
        {
            get; set;
        }

        /// <summary>
        /// Horário específico para exibição
        /// </summary>
        public TimeSpan? HorarioExibicao
        {
            get; set;
        }

        // Usuário que criou o alerta
        [Required]
        public string? UsuarioCriadorId
        {
            get; set;
        }

        // Status do alerta
        public bool Ativo { get; set; } = true;

        // =====================================================================
        // CAMPOS DE RECORRÊNCIA - Baseados no design da tabela Viagem
        // =====================================================================

        /// <summary>
        /// Dias da semana para recorrência Semanal (TipoExibicao=5) e Quinzenal (TipoExibicao=6)
        /// </summary>
        public bool Monday { get; set; } = false;

        public bool Tuesday { get; set; } = false;
        public bool Wednesday { get; set; } = false;
        public bool Thursday { get; set; } = false;
        public bool Friday { get; set; } = false;
        public bool Saturday { get; set; } = false;
        public bool Sunday { get; set; } = false;

        /// <summary>
        /// Dia específico do mês para recorrência Mensal (TipoExibicao=7)
        /// Valor entre 1 e 31
        /// </summary>
        public int? DiaMesRecorrencia
        {
            get; set;
        }

        /// <summary>
        /// Lista de datas separadas por vírgula para recorrência Variada (TipoExibicao=8)
        /// Formato: "2025-01-15,2025-01-20,2025-01-25"
        /// </summary>
        public string? DatasSelecionadas
        {
            get; set;
        }

        /// <summary>
        /// Referência ao alerta original da série recorrente
        /// O primeiro alerta criado tem RecorrenciaAlertaId = seu próprio AlertasFrotiXId
        /// Os demais alertas da série apontam para o primeiro
        /// </summary>
        public Guid? RecorrenciaAlertaId
        {
            get; set;
        }

        [ForeignKey("RecorrenciaAlertaId")]
        public virtual AlertasFrotiX AlertaOriginal
        {
            get; set;
        }

        // Coleção de alertas que fazem parte da mesma série recorrente
        public virtual ICollection<AlertasFrotiX> AlertasRecorrentes
        {
            get; set;
        }

        public string DiasSemana { get; set; }           // Ex: "1,2,3,4,5"

        // =====================================================================
        // FIM DOS CAMPOS DE RECORRÊNCIA
        // =====================================================================

        // Navegação para AlertasUsuario
        public virtual ICollection<AlertasUsuario> AlertasUsuarios
        {
            get; set;
        }

        // Construtor
        public AlertasFrotiX()
        {
            AlertasFrotiXId = Guid.NewGuid();
            DataInsercao = DateTime.Now;
            AlertasUsuarios = new HashSet<AlertasUsuario>();
            AlertasRecorrentes = new HashSet<AlertasFrotiX>();
        }
    }

    // Tabela de relacionamento N-N entre Alertas e Usuários
    public class AlertasUsuario
    {
        [Key]
        public Guid AlertasUsuarioId
        {
            get; set;
        }

        [Required]
        public Guid AlertasFrotiXId
        {
            get; set;
        }

        [ForeignKey("AlertasFrotiXId")]
        public virtual AlertasFrotiX AlertasFrotiX
        {
            get; set;
        }

        [Required]
        public string UsuarioId
        {
            get; set;
        }

        [ForeignKey("UsuarioId")]
        public virtual AspNetUsers Usuario
        {
            get; set;
        }

        public bool Lido { get; set; } = false;

        public DateTime? DataLeitura
        {
            get; set;
        }

        public bool Notificado { get; set; } = false;

        public AlertasUsuario()
        {
            AlertasUsuarioId = Guid.NewGuid();
        }

        // Controle de exclusão sem leitura
        public bool Apagado
        {
            get; set;
        }

        public DateTime? DataApagado
        {
            get; set;
        }

        public DateTime? DataNotificacao
        {
            get; set;
        }
    }

    // Enums
    public enum TipoAlerta
    {
        [Display(Name = "Agendamento")]
        Agendamento = 1,

        [Display(Name = "Manutenção")]
        Manutencao = 2,

        [Display(Name = "Motorista")]
        Motorista = 3,

        [Display(Name = "Veículo")]
        Veiculo = 4,

        [Display(Name = "Anúncio")]
        Anuncio = 5,

        [Display(Name = "Diversos")]
        Diversos = 6
    }

    public enum PrioridadeAlerta
    {
        [Display(Name = "Baixa")]
        Baixa = 1,

        [Display(Name = "Média")]
        Media = 2,

        [Display(Name = "Alta")]
        Alta = 3
    }

    /// <summary>
    /// Tipo de exibição do alerta
    /// Valores 1-3: Exibição única
    /// Valores 4-8: Exibição recorrente
    /// </summary>
    public enum TipoExibicaoAlerta
    {
        [Display(Name = "Ao abrir o sistema")]
        AoAbrir = 1,

        [Display(Name = "Em horário específico")]
        Horario = 2,

        [Display(Name = "Em data/hora específica")]
        DataHora = 3,

        [Display(Name = "Recorrente - Diário (seg-sex)")]
        RecorrenteDiario = 4,

        [Display(Name = "Recorrente - Semanal")]
        RecorrenteSemanal = 5,

        [Display(Name = "Recorrente - Quinzenal")]
        RecorrenteQuinzenal = 6,

        [Display(Name = "Recorrente - Mensal")]
        RecorrenteMensal = 7,

        [Display(Name = "Recorrente - Dias Variados")]
        RecorrenteDiasVariados = 8
    }
}
