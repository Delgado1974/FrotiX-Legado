# Documentação: Alertas FrotiX (Gestão)

> **Última Atualização**: 06/01/2026
> **Versão Atual**: 1.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Estrutura da Interface](#estrutura-da-interface)
4. [Lógica de Negócio (Controller)](#lógica-de-negócio-controller)
5. [Interatividade (JavaScript)](#interatividade-javascript)
6. [Troubleshooting](#troubleshooting)

---

## Visão Geral

A página de **Gestão de Alertas** (`Pages/AlertasFrotiX/AlertasFrotiX.cshtml`) é o painel central para monitoramento e administração de notificações no sistema FrotiX. Ela permite visualizar alertas ativos, consultar histórico de alertas inativos e gerenciar os alertas pessoais do usuário logado.

### Características Principais
- ✅ **Abas de Navegação**: Separação clara entre "Alertas Ativos", "Histórico (Inativos)" e "Meus Alertas".
- ✅ **Integração com SignalR**: Atualização em tempo real de notificações (Sino).
- ✅ **Cards Interativos**: Visualização rápida de alertas ativos com indicadores de prioridade e tipo.
- ✅ **Detalhamento Completo**: Modal com estatísticas de leitura (quem leu, quando leu) e progresso.
- ✅ **Ação de Dar Baixa**: Permite ao criador ou administrador finalizar um alerta.

---

## Arquitetura

### Estrutura de Arquivos

```
FrotiX.Site/
├── Pages/
│   └── AlertasFrotiX/
│       └── AlertasFrotiX.cshtml     # View principal (Abas e Modais)
│
├── Controllers/
│   └── AlertasFrotiXController.cs   # Endpoints da API e Gestão
│
├── wwwroot/
│   ├── js/
│   │   └── alertasfrotix/
│   │       ├── alertas_gestao.js    # Lógica das abas e modals
│   │       ├── alertas_navbar.js    # Lógica do sino no topo
│   └── css/
│       └── frotix.css               # Estilos globais e customizados
```

### Tecnologias Utilizadas

| Tecnologia | Uso |
|------------|-----|
| **ASP.NET Core Razor Pages** | Renderização da página |
| **jQuery DataTables** | Listagem de alertas inativos e pessoais |
| **SignalR** | Comunicação em tempo real (Sino) |
| **Bootstrap 5** | Abas e Modais |
| **Font Awesome Duotone** | Ícones de tipos e status |

---

## Estrutura da Interface

A view utiliza um sistema de abas customizado (`nav-tabs-custom`) e badges coloridos para diferenciar status e quantidades.

### Abas de Navegação
```html
<ul class="nav nav-tabs nav-tabs-custom border-bottom-0 mt-3" id="alertasTab" role="tablist">
    <!-- Aba Alertas Ativos -->
    <li class="nav-item" role="presentation">
        <a class="nav-link active position-relative" id="tab-ativos" data-toggle="tab" href="#tabAtivos" role="tab">
            <i class="fa-duotone fa-bell-on me-2"></i>
            Alertas Ativos
            <span id="badgeAtivos" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light">
                0
            </span>
        </a>
    </li>
    <!-- Aba Histórico -->
    <li class="nav-item" role="presentation">
        <a class="nav-link position-relative" id="tab-inativos" data-toggle="tab" href="#tabInativos" role="tab">
            <i class="fa-duotone fa-clock-rotate-left me-2"></i>
            Histórico
            <span id="badgeInativos" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-secondary border border-light">
                0
            </span>
        </a>
    </li>
    <!-- Aba Meus Alertas -->
    <li class="nav-item" role="presentation">
        <a class="nav-link position-relative" id="tab-meus-alertas" data-toggle="tab" href="#tabMeusAlertas" role="tab">
            <i class="fa-duotone fa-inbox me-2"></i>
            Meus Alertas
            <span id="badgeMeusAlertas" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-secondary border border-light">
                0
            </span>
        </a>
    </li>
</ul>
```

### Modal de Detalhes
O modal `modalDetalhesAlerta` exibe informações profundas, incluindo tabela de usuários notificados e estatísticas de leitura.

```html
<div class="modal fade" id="modalDetalhesAlerta" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
        <div class="modal-content border-0 shadow-lg">
             <!-- Cabeçalho com cor dinâmica baseada no status -->
            <div class="modal-header text-white" id="alertaCabecalho">
                <h5 class="modal-title" id="tituloAlerta">Título do Alerta</h5>
                <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <!-- ... Corpo do modal com Estatísticas e Tabela de Usuários ... -->
        </div>
    </div>
</div>
```

---

## Lógica de Negócio (Controller)

O `AlertasFrotiXController.cs` gerencia as requisições da página e da API.

### 1. Obter Alertas Ativos (Gestão)
Retorna todos os alertas ativos para a aba principal.

```csharp
[HttpGet("GetTodosAlertasAtivosGestao")]
public async Task<IActionResult> GetTodosAlertasAtivosGestao()
{
    var alertasAtivos = await _unitOfWork.AlertasFrotiX.GetAllAsync(
        filter: a => a.Ativo,
        includeProperties: "AlertasUsuarios"
    );

    var resultado = alertasAtivos.Select(a => new
    {
        alertaId = a.AlertasFrotiXId,
        titulo = a.Titulo,
        // ... outros campos
        totalUsuarios = a.AlertasUsuarios?.Count ?? 0,
        usuariosLeram = a.AlertasUsuarios?.Count(au => au.Lido) ?? 0,
        iconeCss = Alerta.GetIconePrioridade(a.Prioridade)
    }).ToList();

    return Ok(resultado);
}
```

### 2. Obter Detalhes do Alerta
Endpoint crítico que retorna estatísticas e lista de usuários para o modal.

```csharp
[HttpGet("GetDetalhesAlerta/{id}")]
public async Task<IActionResult> GetDetalhesAlerta(Guid id)
{
    var alerta = await _unitOfWork.AlertasFrotiX.GetFirstOrDefaultAsync(
        a => a.AlertasFrotiXId == id,
        includeProperties: "AlertasUsuarios,Viagem,Manutencao,Veiculo,Motorista"
    );

    // ... lógica para calcular estatísticas ...
    var totalNotificados = alerta.AlertasUsuarios.Count(au => au.Notificado);
    var usuariosLeram = alerta.AlertasUsuarios.Count(au => au.Lido);
    var percentualLeitura = totalNotificados > 0
        ? Math.Round((double)usuariosLeram / totalNotificados * 100, 1)
        : 0;

    return Ok(new {
        success = true,
        data = new {
            // ... dados do alerta
            percentualLeitura = percentualLeitura,
            usuarios = usuariosDetalhes // Lista detalhada de quem leu/não leu
        }
    });
}
```

### 3. Dar Baixa no Alerta
Permite finalizar um alerta manualmente. Verifica permissão (Criador ou Admin).

```csharp
[HttpPost("DarBaixaAlerta/{alertaId}")]
public async Task<IActionResult> DarBaixaAlerta(Guid alertaId)
{
    var alerta = await _unitOfWork.AlertasFrotiX.GetFirstOrDefaultAsync(a => a.AlertasFrotiXId == alertaId);

    // ... validações ...

    alerta.Ativo = false;
    alerta.DataDesativacao = DateTime.Now;
    alerta.DesativadoPor = usuarioAtual;

    _unitOfWork.AlertasFrotiX.Update(alerta);
    await _unitOfWork.SaveAsync();

    return Ok(new { success = true, mensagem = "Baixa realizada com sucesso" });
}
```

---

## Interatividade (JavaScript)

O arquivo `wwwroot/js/alertasfrotix/alertas_gestao.js` controla a lógica do frontend.

### 1. Carregamento de Cards (Alertas Ativos)
Renderiza os cards HTML dinamicamente na aba principal.

```javascript
function adicionarCardAlerta(alerta)
{
    var prioridadeClass = obterClassePrioridade(alerta.prioridade);
    // ... lógica de badges ...

    var cardHtml = `
        <div class="col-lg-6 col-xl-4 mb-3" id="card-alerta-${alerta.alertaId}">
            <div class="card border-left-${obterCorBorda(alerta.tipo)} h-100">
                <div class="card-body">
                    <!-- ... Cabeçalho do Card ... -->
                    <div class="d-flex justify-content-between align-items-center mt-3">
                        <small class="text-muted">
                            <i class="fa-duotone fa-clock"></i>
                            ${formatarData(alerta.dataInsercao)}
                        </small>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-info btn-sm" onclick="verDetalhesAlerta('${alerta.alertaId}')">
                                <i class="fa-duotone fa-eye"></i>
                            </button>
                            ${ehCriador ? `
                            <button class="btn btn-vinho btn-sm" onclick="darBaixaAlerta('${alerta.alertaId}')">
                                <i class="fa-duotone fa-circle-xmark"></i>
                            </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

    $('#alertasAtivosContainer').prepend(cardHtml);
}
```

### 2. Preenchimento do Modal de Detalhes
Popula o modal com dados e calcula a barra de progresso visualmente.

```javascript
function popularModalDetalhes(alerta)
{
    // ... preenche textos básicos ...

    // ========== PROGRESSO DE LEITURA ==========
    const stats = alerta.estatisticas;
    const percentual = stats.percentualLeitura || 0;

    $('#progressoLeitura')
        .css('width', percentual + '%')
        .attr('aria-valuenow', percentual);
    $('#percentualLeitura').text(percentual.toFixed(1) + '%');

    // ========== TABELA DE USUÁRIOS ==========
    popularTabelaUsuarios(alerta.usuarios || []);
}
```

### 3. Integração com DataTables (Inativos)
Utiliza DataTables.js com renderização customizada de colunas (ícones, badges, barras de progresso).

```javascript
function inicializarDataTableLidos()
{
    tabelaAlertasLidos = $('#tblAlertasInativos').DataTable({
        "ajax": {
            "url": "/api/AlertasFrotiX/GetAlertasInativos",
            "type": "GET"
            // ...
        },
        "columns": [
            // ... definições de colunas com renderers HTML customizados
            {
                "data": "percentualLeitura",
                "render": function (data) {
                    // Retorna HTML da barra de progresso bootstrap
                }
            }
        ]
        // ...
    });
}
```

---

## Troubleshooting

### Cards não carregam
**Causa**: Falha na requisição API `/api/AlertasFrotiX/GetTodosAlertasAtivosGestao` ou erro JS.
**Solução**: Verifique o Console do navegador. Se houver erro 500, cheque os logs do servidor. Se houver erro JS, verifique se `alertas_gestao.js` foi carregado.

### SignalR não conecta
**Causa**: Problemas de rede ou configuração do Hub.
**Sintoma**: O sino não atualiza automaticamente.
**Solução**: Verifique se o objeto `SignalRManager` está definido globalmente. O script tenta reconectar a cada 10 segundos.

### Botão "Dar Baixa" não aparece
**Causa**: Permissão insuficiente.
**Lógica**: O botão só aparece se o usuário logado for o **Criador** do alerta ou **Admin**. O frontend faz uma checagem via API `VerificarPermissaoBaixa/{alertaId}` ao abrir o modal.

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [06/01/2026] - Criação da Documentação

**Descrição**:
Documentação inicial do módulo de Gestão de Alertas FrotiX.

**Status**: ✅ **Documentado**

**Responsável**: Claude (AI Assistant)
**Versão**: 1.0
