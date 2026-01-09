# Documentação: AlertasFrotiX.cs

**📅 Última Atualização:** 08/01/2026  
**📋 Versão:** 2.0 (Padrão FrotiX Simplificado)

---

## 📋 Índice

1. [Objetivos](#objetivos)
2. [Arquivos Envolvidos](#arquivos-envolvidos)
3. [Estrutura do Model](#estrutura-do-model)
4. [Mapeamento Model ↔ Banco de Dados](#mapeamento-model--banco-de-dados)
5. [Enums e Tipos](#enums-e-tipos)
6. [Quem Chama e Por Quê](#quem-chama-e-por-quê)
7. [Problema → Solução → Código](#problema--solução--código)
8. [Fluxo de Funcionamento](#fluxo-de-funcionamento)
9. [Sistema de Recorrência](#sistema-de-recorrência)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Objetivos

O Model `AlertasFrotiX` representa o sistema completo de alertas e notificações do FrotiX, permitindo criar alertas únicos ou recorrentes vinculados a diferentes entidades (Viagens, Manutenções, Motoristas, Veículos) e destinados a usuários específicos.

**Principais objetivos:**

✅ Criar alertas personalizados com diferentes tipos e prioridades  
✅ Suportar 8 tipos de exibição (única, horário específico, recorrências variadas)  
✅ Vincular alertas a entidades específicas (Viagem, Manutenção, Motorista, Veículo)  
✅ Gerenciar destinatários através de relacionamento N-N com usuários  
✅ Controlar leitura e notificação de alertas por usuário  
✅ Suportar recorrências complexas (diária, semanal, quinzenal, mensal, datas variadas)  
✅ Permitir desativação e rastreamento de quem desativou e por quê

---

## 📁 Arquivos Envolvidos

### Arquivo Principal
- **`Models/AlertasFrotiX.cs`** - Model principal + AlertasUsuario + Enums

### Arquivos que Utilizam
- **`Controllers/AlertasFrotiXController.cs`** - Endpoints CRUD e gestão de alertas
- **`Pages/AlertasFrotiX/AlertasFrotiX.cshtml`** - Página de listagem de alertas
- **`Pages/AlertasFrotiX/Upsert.cshtml`** - Formulário de criação/edição
- **`Repository/AlertasFrotiXRepository.cs`** - Acesso a dados e queries complexas
- **`Repository/AlertasUsuarioRepository.cs`** - Gestão de relacionamento N-N
- **`Hubs/AlertasHub.cs`** - SignalR para notificações em tempo real
- **`Data/FrotiXDbContext.cs`** - Configuração dos DbSets

---

## 🏗️ Estrutura do Model

### Classe Principal: AlertasFrotiX

```csharp
public class AlertasFrotiX
{
    // ✅ Chave primária
    [Key]
    public Guid AlertasFrotiXId { get; set; }

    // ✅ Dados básicos do alerta
    [Required(ErrorMessage = "O título do alerta é obrigatório")]
    [StringLength(200)]
    public string? Titulo { get; set; }

    [Required(ErrorMessage = "A descrição do alerta é obrigatória")]
    [StringLength(1000)]
    public string? Descricao { get; set; }

    [Required]
    public TipoAlerta TipoAlerta { get; set; }

    [Required]
    public PrioridadeAlerta Prioridade { get; set; }

    // ✅ Controle de datas
    [Required]
    public DateTime? DataInsercao { get; set; }

    public DateTime? DataExibicao { get; set; }      // Data inicial para recorrências
    public DateTime? DataExpiracao { get; set; }     // Data final para recorrências
    public DateTime? DataDesativacao { get; set; }
    public string? DesativadoPor { get; set; }
    public string? MotivoDesativacao { get; set; }

    // ✅ Relacionamentos opcionais com entidades
    public Guid? ViagemId { get; set; }
    [ForeignKey("ViagemId")]
    public virtual Viagem Viagem { get; set; }

    public Guid? ManutencaoId { get; set; }
    [ForeignKey("ManutencaoId")]
    public virtual Manutencao Manutencao { get; set; }

    public Guid? MotoristaId { get; set; }
    [ForeignKey("MotoristaId")]
    public virtual Motorista Motorista { get; set; }

    public Guid? VeiculoId { get; set; }
    [ForeignKey("VeiculoId")]
    public virtual Veiculo Veiculo { get; set; }

    // ✅ Configuração de exibição
    public TipoExibicaoAlerta TipoExibicao { get; set; }
    public TimeSpan? HorarioExibicao { get; set; }

    // ✅ Usuário criador
    [Required]
    public string? UsuarioCriadorId { get; set; }

    // ✅ Status
    public bool Ativo { get; set; } = true;

    // ✅ Campos de recorrência
    public bool Monday { get; set; } = false;
    public bool Tuesday { get; set; } = false;
    public bool Wednesday { get; set; } = false;
    public bool Thursday { get; set; } = false;
    public bool Friday { get; set; } = false;
    public bool Saturday { get; set; } = false;
    public bool Sunday { get; set; } = false;
    public int? DiaMesRecorrencia { get; set; }
    public string? DatasSelecionadas { get; set; } // Formato: "2025-01-15,2025-01-20"
    public string DiasSemana { get; set; }        // Formato: "1,2,3,4,5"

    // ✅ Recorrência - auto-referência
    public Guid? RecorrenciaAlertaId { get; set; }
    [ForeignKey("RecorrenciaAlertaId")]
    public virtual AlertasFrotiX AlertaOriginal { get; set; }
    public virtual ICollection<AlertasFrotiX> AlertasRecorrentes { get; set; }

    // ✅ Relacionamento N-N com usuários
    public virtual ICollection<AlertasUsuario> AlertasUsuarios { get; set; }

    // ✅ Construtor
    public AlertasFrotiX()
    {
        AlertasFrotiXId = Guid.NewGuid();
        DataInsercao = DateTime.Now;
        AlertasUsuarios = new HashSet<AlertasUsuario>();
        AlertasRecorrentes = new HashSet<AlertasFrotiX>();
    }
}
```

### Classe de Relacionamento: AlertasUsuario

```csharp
public class AlertasUsuario
{
    [Key]
    public Guid AlertasUsuarioId { get; set; }

    [Required]
    public Guid AlertasFrotiXId { get; set; }
    [ForeignKey("AlertasFrotiXId")]
    public virtual AlertasFrotiX AlertasFrotiX { get; set; }

    [Required]
    public string UsuarioId { get; set; }
    [ForeignKey("UsuarioId")]
    public virtual AspNetUsers Usuario { get; set; }

    // ✅ Controle de leitura
    public bool Lido { get; set; } = false;
    public DateTime? DataLeitura { get; set; }

    // ✅ Controle de notificação
    public bool Notificado { get; set; } = false;
    public DateTime? DataNotificacao { get; set; }

    // ✅ Controle de exclusão
    public bool Apagado { get; set; }
    public DateTime? DataApagado { get; set; }
}
```

---

## 🗄️ Mapeamento Model ↔ Banco de Dados

### Estrutura SQL da Tabela AlertasFrotiX

```sql
CREATE TABLE [dbo].[AlertasFrotiX] (
    [AlertasFrotiXId] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    
    -- Dados básicos
    [Titulo] NVARCHAR(200) NOT NULL,
    [Descricao] NVARCHAR(1000) NOT NULL,
    [TipoAlerta] INT NOT NULL,
    [Prioridade] INT NOT NULL,
    
    -- Controle de datas
    [DataInsercao] DATETIME2 NOT NULL,
    [DataExibicao] DATETIME2 NULL,
    [DataExpiracao] DATETIME2 NULL,
    [DataDesativacao] DATETIME2 NULL,
    [DesativadoPor] NVARCHAR(450) NULL,
    [MotivoDesativacao] NVARCHAR(500) NULL,
    
    -- Relacionamentos opcionais
    [ViagemId] UNIQUEIDENTIFIER NULL,
    [ManutencaoId] UNIQUEIDENTIFIER NULL,
    [MotoristaId] UNIQUEIDENTIFIER NULL,
    [VeiculoId] UNIQUEIDENTIFIER NULL,
    
    -- Configuração de exibição
    [TipoExibicao] INT NOT NULL,
    [HorarioExibicao] TIME NULL,
    
    -- Usuário criador
    [UsuarioCriadorId] NVARCHAR(450) NOT NULL,
    
    -- Status
    [Ativo] BIT NOT NULL DEFAULT 1,
    
    -- Campos de recorrência
    [Monday] BIT NOT NULL DEFAULT 0,
    [Tuesday] BIT NOT NULL DEFAULT 0,
    [Wednesday] BIT NOT NULL DEFAULT 0,
    [Thursday] BIT NOT NULL DEFAULT 0,
    [Friday] BIT NOT NULL DEFAULT 0,
    [Saturday] BIT NOT NULL DEFAULT 0,
    [Sunday] BIT NOT NULL DEFAULT 0,
    [DiaMesRecorrencia] INT NULL,
    [DatasSelecionadas] NVARCHAR(MAX) NULL,
    [DiasSemana] NVARCHAR(50) NULL,
    
    -- Auto-referência para recorrência
    [RecorrenciaAlertaId] UNIQUEIDENTIFIER NULL,
    
    -- Foreign Keys
    CONSTRAINT [FK_AlertasFrotiX_Viagem] 
        FOREIGN KEY ([ViagemId]) REFERENCES [Viagem]([ViagemId]),
    CONSTRAINT [FK_AlertasFrotiX_Manutencao] 
        FOREIGN KEY ([ManutencaoId]) REFERENCES [Manutencao]([ManutencaoId]),
    CONSTRAINT [FK_AlertasFrotiX_Motorista] 
        FOREIGN KEY ([MotoristaId]) REFERENCES [Motorista]([MotoristaId]),
    CONSTRAINT [FK_AlertasFrotiX_Veiculo] 
        FOREIGN KEY ([VeiculoId]) REFERENCES [Veiculo]([VeiculoId]),
    CONSTRAINT [FK_AlertasFrotiX_Recorrencia] 
        FOREIGN KEY ([RecorrenciaAlertaId]) REFERENCES [AlertasFrotiX]([AlertasFrotiXId]),
    CONSTRAINT [FK_AlertasFrotiX_UsuarioCriador] 
        FOREIGN KEY ([UsuarioCriadorId]) REFERENCES [AspNetUsers]([Id])
);

-- Índices
CREATE INDEX [IX_AlertasFrotiX_TipoAlerta] ON [AlertasFrotiX]([TipoAlerta]);
CREATE INDEX [IX_AlertasFrotiX_DataExibicao] ON [AlertasFrotiX]([DataExibicao]);
CREATE INDEX [IX_AlertasFrotiX_Ativo] ON [AlertasFrotiX]([Ativo]);
CREATE INDEX [IX_AlertasFrotiX_RecorrenciaAlertaId] ON [AlertasFrotiX]([RecorrenciaAlertaId]);
```

### Estrutura SQL da Tabela AlertasUsuario

```sql
CREATE TABLE [dbo].[AlertasUsuario] (
    [AlertasUsuarioId] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    [AlertasFrotiXId] UNIQUEIDENTIFIER NOT NULL,
    [UsuarioId] NVARCHAR(450) NOT NULL,
    
    -- Controle de leitura
    [Lido] BIT NOT NULL DEFAULT 0,
    [DataLeitura] DATETIME2 NULL,
    
    -- Controle de notificação
    [Notificado] BIT NOT NULL DEFAULT 0,
    [DataNotificacao] DATETIME2 NULL,
    
    -- Controle de exclusão
    [Apagado] BIT NOT NULL DEFAULT 0,
    [DataApagado] DATETIME2 NULL,
    
    -- Foreign Keys
    CONSTRAINT [FK_AlertasUsuario_AlertasFrotiX] 
        FOREIGN KEY ([AlertasFrotiXId]) REFERENCES [AlertasFrotiX]([AlertasFrotiXId]) ON DELETE CASCADE,
    CONSTRAINT [FK_AlertasUsuario_Usuario] 
        FOREIGN KEY ([UsuarioId]) REFERENCES [AspNetUsers]([Id]) ON DELETE CASCADE,
    
    -- Chave única composta (evita duplicatas)
    CONSTRAINT [UK_AlertasUsuario_AlertaUsuario] 
        UNIQUE ([AlertasFrotiXId], [UsuarioId])
);

-- Índices
CREATE INDEX [IX_AlertasUsuario_UsuarioId] ON [AlertasUsuario]([UsuarioId]);
CREATE INDEX [IX_AlertasUsuario_Lido] ON [AlertasUsuario]([Lido]);
CREATE INDEX [IX_AlertasUsuario_Apagado] ON [AlertasUsuario]([Apagado]);
```

---

## 📊 Enums e Tipos

### TipoAlerta

```csharp
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
```

### PrioridadeAlerta

```csharp
public enum PrioridadeAlerta
{
    [Display(Name = "Baixa")]
    Baixa = 1,
    
    [Display(Name = "Média")]
    Media = 2,
    
    [Display(Name = "Alta")]
    Alta = 3
}
```

### TipoExibicaoAlerta

```csharp
public enum TipoExibicaoAlerta
{
    [Display(Name = "Ao abrir o sistema")]
    AoAbrir = 1,                    // Exibição única
    
    [Display(Name = "Em horário específico")]
    Horario = 2,                    // Exibição única
    
    [Display(Name = "Em data/hora específica")]
    DataHora = 3,                   // Exibição única
    
    [Display(Name = "Recorrente - Diário (seg-sex)")]
    RecorrenteDiario = 4,           // Recorrência
    
    [Display(Name = "Recorrente - Semanal")]
    RecorrenteSemanal = 5,          // Recorrência
    
    [Display(Name = "Recorrente - Quinzenal")]
    RecorrenteQuinzenal = 6,        // Recorrência
    
    [Display(Name = "Recorrente - Mensal")]
    RecorrenteMensal = 7,           // Recorrência
    
    [Display(Name = "Recorrente - Dias Variados")]
    RecorrenteDiasVariados = 8      // Recorrência
}
```

---

## 🔗 Quem Chama e Por Quê

### 1. **AlertasFrotiXController.cs** → CRUD Completo

**Quando:** Usuário cria, edita, lista ou desativa alertas  
**Por quê:** Gerenciamento completo do ciclo de vida dos alertas

```csharp
[HttpPost("Salvar")]
public async Task<IActionResult> Salvar([FromBody] AlertasFrotiX alerta)
{
    // ✅ Cria alerta principal
    _unitOfWork.AlertasFrotiX.Add(alerta);
    
    // ✅ Se for recorrência, cria alertas individuais
    if (alerta.TipoExibicao >= TipoExibicaoAlerta.RecorrenteDiario)
    {
        await CriarAlertasRecorrentes(alerta);
    }
    
    // ✅ Vincula usuários selecionados
    await VincularUsuarios(alerta.AlertasFrotiXId, usuarioIds);
    
    _unitOfWork.Save();
    return Json(new { success = true });
}
```

### 2. **Pages/AlertasFrotiX/Upsert.cshtml.cs** → Formulário de Criação

**Quando:** Usuário acessa página de criação/edição  
**Por quê:** Carregar dados do alerta para edição ou preparar formulário vazio

```csharp
public async Task<IActionResult> OnGetAsync(Guid? id)
{
    if (id.HasValue)
    {
        // ✅ Carrega alerta existente para edição
        var alerta = await _alertasRepo.GetFirstOrDefaultAsync(a => a.AlertasFrotiXId == id.Value);
        // Preenche propriedades do PageModel...
    }
    return Page();
}
```

### 3. **AlertasHub.cs (SignalR)** → Notificações em Tempo Real

**Quando:** Alerta deve ser exibido para usuários conectados  
**Por quê:** Notificar usuários em tempo real sem recarregar página

```csharp
public async Task EnviarNotificacaoAlerta(AlertasFrotiX alerta, List<string> usuarioIds)
{
    foreach (var usuarioId in usuarioIds)
    {
        // ✅ Envia notificação via SignalR
        await Clients.User(usuarioId).SendAsync("NovoAlerta", new
        {
            titulo = alerta.Titulo,
            descricao = alerta.Descricao,
            prioridade = alerta.Prioridade.ToString()
        });
        
        // ✅ Marca como notificado
        var alertaUsuario = await _unitOfWork.AlertasUsuario
            .GetFirstOrDefaultAsync(au => 
                au.AlertasFrotiXId == alerta.AlertasFrotiXId && 
                au.UsuarioId == usuarioId);
        alertaUsuario.Notificado = true;
        alertaUsuario.DataNotificacao = DateTime.Now;
    }
}
```

---

## 🛠️ Problema → Solução → Código

### Problema 1: Alertas Recorrentes Complexos

**Problema:** Criar múltiplos alertas individuais para uma recorrência semanal/mensal manualmente seria trabalhoso e propenso a erros.

**Solução:** Sistema que cria automaticamente alertas individuais baseado na configuração de recorrência, vinculando todos ao alerta original.

**Código:**

```csharp
// ✅ Em AlertasFrotiXController.cs
private async Task CriarAlertasRecorrentes(AlertasFrotiX alertaOriginal)
{
    var alertasCriados = new List<AlertasFrotiX>();
    
    // ✅ O primeiro alerta aponta para si mesmo
    alertaOriginal.RecorrenciaAlertaId = alertaOriginal.AlertasFrotiXId;
    
    switch (alertaOriginal.TipoExibicao)
    {
        case TipoExibicaoAlerta.RecorrenteSemanal:
            // ✅ Cria alerta para cada dia da semana selecionado
            var diasSemana = new[] { 
                alertaOriginal.Monday ? DayOfWeek.Monday : (DayOfWeek?)null,
                alertaOriginal.Tuesday ? DayOfWeek.Tuesday : (DayOfWeek?)null,
                // ... outros dias
            }.Where(d => d.HasValue).ToList();
            
            var dataInicio = alertaOriginal.DataExibicao.Value;
            var dataFim = alertaOriginal.DataExpiracao.Value;
            
            for (var data = dataInicio; data <= dataFim; data = data.AddDays(1))
            {
                if (diasSemana.Contains(data.DayOfWeek))
                {
                    var alertaRecorrente = CriarAlertaRecorrente(alertaOriginal, data);
                    alertasCriados.Add(alertaRecorrente);
                }
            }
            break;
            
        case TipoExibicaoAlerta.RecorrenteDiasVariados:
            // ✅ Cria alerta para cada data na lista DatasSelecionadas
            var datas = alertaOriginal.DatasSelecionadas?
                .Split(',')
                .Select(d => DateTime.Parse(d.Trim()))
                .ToList() ?? new List<DateTime>();
            
            foreach (var data in datas)
            {
                var alertaRecorrente = CriarAlertaRecorrente(alertaOriginal, data);
                alertasCriados.Add(alertaRecorrente);
            }
            break;
    }
    
    // ✅ Salva todos os alertas criados
    foreach (var alerta in alertasCriados)
    {
        _unitOfWork.AlertasFrotiX.Add(alerta);
    }
}

private AlertasFrotiX CriarAlertaRecorrente(AlertasFrotiX original, DateTime dataExibicao)
{
    return new AlertasFrotiX
    {
        AlertasFrotiXId = Guid.NewGuid(),
        Titulo = original.Titulo,
        Descricao = original.Descricao,
        TipoAlerta = original.TipoAlerta,
        Prioridade = original.Prioridade,
        DataInsercao = DateTime.Now,
        DataExibicao = dataExibicao.Date.Add(original.HorarioExibicao ?? TimeSpan.Zero),
        TipoExibicao = TipoExibicaoAlerta.DataHora, // ✅ Alerta individual
        RecorrenciaAlertaId = original.AlertasFrotiXId, // ✅ Aponta para o original
        UsuarioCriadorId = original.UsuarioCriadorId,
        Ativo = true
    };
}
```

### Problema 2: Vinculação de Usuários em Lote

**Problema:** Vincular um alerta a múltiplos usuários manualmente seria ineficiente.

**Solução:** Método que cria registros `AlertasUsuario` em lote para todos os usuários selecionados.

**Código:**

```csharp
// ✅ Em AlertasFrotiXController.cs
private async Task VincularUsuarios(Guid alertaId, List<string> usuarioIds)
{
    // ✅ Se lista vazia, vincula a todos os usuários ativos
    if (usuarioIds == null || usuarioIds.Count == 0)
    {
        usuarioIds = _unitOfWork.AspNetUsers
            .GetAll(u => u.LockoutEnabled == false)
            .Select(u => u.Id)
            .ToList();
    }
    
    var alertasUsuario = new List<AlertasUsuario>();
    
    foreach (var usuarioId in usuarioIds)
    {
        // ✅ Verifica se já existe vínculo
        var existe = await _unitOfWork.AlertasUsuario
            .GetFirstOrDefaultAsync(au => 
                au.AlertasFrotiXId == alertaId && 
                au.UsuarioId == usuarioId);
        
        if (existe == null)
        {
            alertasUsuario.Add(new AlertasUsuario
            {
                AlertasUsuarioId = Guid.NewGuid(),
                AlertasFrotiXId = alertaId,
                UsuarioId = usuarioId,
                Lido = false,
                Notificado = false,
                Apagado = false
            });
        }
    }
    
    // ✅ Adiciona todos de uma vez
    foreach (var alertaUsuario in alertasUsuario)
    {
        _unitOfWork.AlertasUsuario.Add(alertaUsuario);
    }
}
```

### Problema 3: Marcação de Alerta como Lido

**Problema:** Quando usuário marca alerta como lido, precisa atualizar `AlertasUsuario` específico, não o alerta geral.

**Solução:** Buscar registro `AlertasUsuario` específico do usuário e atualizar apenas esse registro.

**Código:**

```csharp
// ✅ Em AlertasFrotiXController.cs
[HttpPost("MarcarComoLido/{alertaId}")]
public async Task<IActionResult> MarcarComoLido(Guid alertaId)
{
    var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    
    if (string.IsNullOrEmpty(userId))
        return Json(new { success = false, message = "Usuário não autenticado" });
    
    // ✅ Busca registro específico do usuário
    var alertaUsuario = await _unitOfWork.AlertasUsuario
        .GetFirstOrDefaultAsync(au => 
            au.AlertasFrotiXId == alertaId && 
            au.UsuarioId == userId);
    
    if (alertaUsuario == null)
        return Json(new { success = false, message = "Alerta não encontrado para este usuário" });
    
    // ✅ Marca como lido
    alertaUsuario.Lido = true;
    alertaUsuario.DataLeitura = DateTime.Now;
    
    _unitOfWork.AlertasUsuario.Update(alertaUsuario);
    _unitOfWork.Save();
    
    return Json(new { success = true });
}
```

---

## 🔄 Fluxo de Funcionamento

### Fluxo 1: Criação de Alerta Único

```
1. Usuário preenche formulário em /AlertasFrotiX/Upsert
   ↓
2. Seleciona tipo de alerta, prioridade, destinatários
   ↓
3. Escolhe TipoExibicao = "Ao abrir o sistema" (único)
   ↓
4. JavaScript valida formulário e envia via AJAX
   ↓
5. AlertasFrotiXController.Salvar recebe dados
   ↓
6. Cria AlertasFrotiX com DataExibicao = DateTime.Now
   ↓
7. Vincula usuários selecionados (cria AlertasUsuario)
   ↓
8. Salva no banco
   ↓
9. Envia notificação via SignalR (se usuários conectados)
   ↓
10. Retorna sucesso e redireciona para listagem
```

### Fluxo 2: Criação de Alerta Recorrente Semanal

```
1. Usuário preenche formulário
   ↓
2. Seleciona TipoExibicao = "Recorrente - Semanal"
   ↓
3. Seleciona dias da semana (ex: Segunda, Quarta, Sexta)
   ↓
4. Define DataExibicao (início) e DataExpiracao (fim)
   ↓
5. Define HorarioExibicao (ex: 08:00)
   ↓
6. Controller detecta TipoExibicao >= RecorrenteDiario
   ↓
7. Chama CriarAlertasRecorrentes()
   ↓
8. Para cada dia da semana selecionado entre DataExibicao e DataExpiracao:
   ├─ Cria AlertasFrotiX individual
   ├─ DataExibicao = data específica + horário
   ├─ RecorrenciaAlertaId = ID do alerta original
   └─ TipoExibicao = DataHora (individual)
   ↓
9. Vincula todos os alertas criados aos usuários selecionados
   ↓
10. Salva todos no banco
   ↓
11. Retorna sucesso
```

### Fluxo 3: Exibição de Alertas para Usuário

```
1. Usuário abre sistema → JavaScript chama /api/alertasfrotix/obteralertasusuario
   ↓
2. Controller busca AlertasUsuario onde:
   ├─ UsuarioId = usuário atual
   ├─ Lido = false
   ├─ Apagado = false
   └─ AlertasFrotiX.Ativo = true
   ↓
3. Filtra por DataExibicao (se TipoExibicao = DataHora, verifica se já passou)
   ↓
4. Retorna lista de alertas não lidos
   ↓
5. JavaScript exibe modal ou notificação toast
   ↓
6. Usuário clica em "Marcar como lido"
   ↓
7. Chama /api/alertasfrotix/marcarcomolido/{id}
   ↓
8. Controller atualiza AlertasUsuario.Lido = true
   ↓
9. Alerta desaparece da lista de não lidos
```

---

## 🔁 Sistema de Recorrência

### Tipos de Recorrência Suportados

| Tipo | Valor | Descrição | Campos Utilizados |
|------|-------|-----------|-------------------|
| Diário (seg-sex) | 4 | Todos os dias úteis entre DataExibicao e DataExpiracao | `DataExibicao`, `DataExpiracao`, `HorarioExibicao` |
| Semanal | 5 | Dias da semana selecionados | `Monday-Sunday`, `DataExibicao`, `DataExpiracao`, `HorarioExibicao` |
| Quinzenal | 6 | A cada 15 dias nos dias selecionados | `Monday-Sunday`, `DataExibicao`, `DataExpiracao`, `HorarioExibicao` |
| Mensal | 7 | Dia específico do mês | `DiaMesRecorrencia`, `DataExibicao`, `DataExpiracao`, `HorarioExibicao` |
| Dias Variados | 8 | Lista específica de datas | `DatasSelecionadas` (formato: "2025-01-15,2025-01-20"), `HorarioExibicao` |

### Exemplo: Recorrência Semanal

```csharp
// ✅ Alerta original
var alertaOriginal = new AlertasFrotiX
{
    Titulo = "Reunião Semanal",
    TipoExibicao = TipoExibicaoAlerta.RecorrenteSemanal,
    DataExibicao = new DateTime(2025, 1, 6),  // Segunda-feira, 06/01/2025
    DataExpiracao = new DateTime(2025, 1, 31), // Sexta-feira, 31/01/2025
    HorarioExibicao = new TimeSpan(8, 0, 0), // 08:00
    Monday = true,
    Wednesday = true,
    Friday = true
};

// ✅ Sistema cria automaticamente:
// - 06/01/2025 08:00 (Segunda)
// - 08/01/2025 08:00 (Quarta)
// - 10/01/2025 08:00 (Sexta)
// - 13/01/2025 08:00 (Segunda)
// - 15/01/2025 08:00 (Quarta)
// - ... até 31/01/2025
```

---

## 🔍 Troubleshooting

### Erro: Alertas recorrentes não são criados

**Causa:** `CriarAlertasRecorrentes()` não está sendo chamado ou há erro na lógica.

**Solução:**
```csharp
// ✅ Verificar se método está sendo chamado
[HttpPost("Salvar")]
public async Task<IActionResult> Salvar([FromBody] AlertasFrotiX alerta)
{
    _unitOfWork.AlertasFrotiX.Add(alerta);
    _unitOfWork.Save(); // ✅ Salvar primeiro para ter ID
    
    // ✅ Verificar tipo de exibição
    if (alerta.TipoExibicao >= TipoExibicaoAlerta.RecorrenteDiario)
    {
        await CriarAlertasRecorrentes(alerta); // ✅ Chamar método
    }
    
    _unitOfWork.Save();
}
```

### Erro: Usuários não recebem alertas

**Causa:** `AlertasUsuario` não está sendo criado ou usuário não está na lista.

**Solução:**
```csharp
// ✅ Verificar se usuários estão sendo vinculados
var alertasUsuario = await _unitOfWork.AlertasUsuario
    .GetAll(au => au.AlertasFrotiXId == alertaId)
    .ToListAsync();
    
if (alertasUsuario.Count == 0)
{
    // ✅ Re-vincular usuários
    await VincularUsuarios(alertaId, usuarioIds);
}
```

### Erro: Alertas aparecem para usuários errados

**Causa:** Filtro incorreto na query de busca de alertas.

**Solução:**
```csharp
// ✅ Sempre filtrar por UsuarioId
var alertas = await _unitOfWork.AlertasUsuario
    .GetAll(au => 
        au.UsuarioId == userId &&           // ✅ Filtro por usuário
        au.Lido == false &&                 // ✅ Apenas não lidos
        au.Apagado == false &&              // ✅ Apenas não apagados
        au.AlertasFrotiX.Ativo == true)     // ✅ Apenas ativos
    .Include(au => au.AlertasFrotiX)
    .ToListAsync();
```

---

## 📊 Endpoints API Resumidos

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/alertasfrotix/listar` | Lista todos os alertas (admin) |
| `GET` | `/api/alertasfrotix/obteralertasusuario` | Lista alertas do usuário atual |
| `GET` | `/api/alertasfrotix/getdetalhesalerta/{id}` | Detalhes de um alerta específico |
| `POST` | `/api/alertasfrotix/salvar` | Cria ou atualiza alerta |
| `POST` | `/api/alertasfrotix/marcarcomolido/{id}` | Marca alerta como lido |
| `POST` | `/api/alertasfrotix/desativar/{id}` | Desativa um alerta |
| `DELETE` | `/api/alertasfrotix/deletar/{id}` | Deleta alerta (soft delete) |

---

## 📝 Notas Importantes

1. **Auto-referência para recorrência** - `RecorrenciaAlertaId` permite rastrear qual alerta original gerou uma série de alertas recorrentes.

2. **Relacionamento N-N** - `AlertasUsuario` permite que um alerta seja destinado a múltiplos usuários e cada usuário tenha controle individual de leitura.

3. **Soft delete** - Alertas não são deletados fisicamente, apenas marcados como `Ativo = false` ou `Apagado = true` em `AlertasUsuario`.

4. **Performance** - Índices em `DataExibicao`, `Ativo`, `UsuarioId` e `Lido` são essenciais para queries rápidas.

5. **SignalR** - Notificações em tempo real são enviadas via `AlertasHub` quando alertas são criados ou atualizados.

---

**📅 Documentação criada em:** 08/01/2026  
**🔄 Última atualização:** 08/01/2026
