# Documentação: Alertas FrotiX (Upsert)

> **Última Atualização**: 06/01/2026
> **Versão Atual**: 1.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Estrutura da Interface](#estrutura-da-interface)
4. [Lógica de Frontend (JavaScript)](#lógica-de-frontend-javascript)
5. [Lógica de Backend (Controller)](#lógica-de-backend-controller)
6. [Troubleshooting](#troubleshooting)

---

## Visão Geral

A funcionalidade de **Upsert** (Update/Insert) permite cadastrar novos alertas ou editar alertas existentes no sistema `AlertasFrotiX`. A página `Pages/AlertasFrotiX/Upsert.cshtml` fornece um formulário rico com suporte a diferentes tipos de alertas, configurações de exibição (incluindo recorrência) e seleção avançada de destinatários.

### Características Principais
- ✅ **Seleção Visual de Tipo**: Cards interativos para escolher o tipo de alerta (Agendamento, Manutenção, Motorista, etc.).
- ✅ **Vínculos Dinâmicos**: Campos de seleção específicos aparecem com base no tipo escolhido.
- ✅ **Sistema de Recorrência Robusto**: Suporte a 8 tipos de exibição, desde alertas únicos até recorrências complexas (diária, semanal, mensal, datas específicas).
- ✅ **Seleção de Destinatários**: Multiselect para definir quem receberá o alerta (ou todos se vazio).
- ✅ **Validação**: Validação client-side e server-side para garantir integridade.

---

## Arquitetura

### Estrutura de Arquivos

```
FrotiX.Site/
├── Pages/
│   └── AlertasFrotiX/
│       └── Upsert.cshtml            # View do formulário
│
├── Controllers/
│   └── AlertasFrotiXController.cs   # Endpoint Salvar
│
├── wwwroot/
│   ├── js/
│   │   └── alertasfrotix/
│   │       ├── alertas_upsert.js    # Lógica principal do formulário
│   │       ├── alertas_recorrencia.js # Lógica de datas e calendários
```

### Tecnologias Utilizadas

| Tecnologia | Uso |
|------------|-----|
| **ASP.NET Core Razor Pages** | Renderização do formulário |
| **Syncfusion EJ2** | Controles de input (Dropdown, DatePicker, Multiselect) |
| **Flatpickr** | Seletor de hora leve (para inputs específicos) |
| **jQuery** | Manipulação do DOM e lógica de exibição |
| **AJAX** | Submissão do formulário sem recarregar |

---

## Estrutura da Interface

A view `Upsert.cshtml` é dividida em seções lógicas para facilitar o preenchimento.

### 1. Tipos de Alerta (Cards)
O usuário seleciona o tipo clicando em cards visuais. O JavaScript gerencia a classe `selected` e o valor do input hidden `#TipoAlerta`.

```html
<div class="row mb-3">
    <div class="col-lg-2 col-md-4 col-sm-6 mb-3">
        <div class="tipo-alerta-card" data-tipo="1">
            <i class="fa-duotone fa-calendar-check" style="color: #0ea5e9;"></i>
            <div>Agendamento</div>
            <span class="preview-badge" style="background-color: #0ea5e9;">Agendamento</span>
        </div>
    </div>
    <!-- ... outros cards ... -->
</div>
<input type="hidden" id="TipoAlerta" name="TipoAlerta" value="@((int)Model.TipoAlerta)" />
```

### 2. Configurações de Exibição e Recorrência
Esta seção é altamente dinâmica. Dependendo do `TipoExibicao` selecionado, diferentes campos (Data, Horário, Dias da Semana, Calendário) são exibidos.

```html
<!-- Dropdown Principal -->
<ejs-dropdownlist id="TipoExibicao" placeholder="Quando exibir o alerta" ...></ejs-dropdownlist>

<!-- Campos Dinâmicos (controlados via JS) -->
<div class="row mt-3" id="rowCamposExibicao">
    <div class="col-md-2" id="divDataExibicao" style="display: none;">
        <ejs-datepicker id="DataExibicao" ...></ejs-datepicker>
    </div>
    <div class="col-md-2" id="divHorarioExibicao" style="display: none;">
        <ejs-timepicker id="HorarioExibicao" ...></ejs-timepicker>
    </div>
</div>

<!-- Recorrência -->
<div class="row mt-3" id="rowCamposRecorrencia">
    <div class="col-md-6" id="divDiasAlerta" style="display: none;">
        <ejs-multiselect id="lstDiasAlerta" ...></ejs-multiselect> <!-- Dias da semana -->
    </div>
</div>
```

---

## Lógica de Frontend (JavaScript)

O arquivo `wwwroot/js/alertasfrotix/alertas_upsert.js` gerencia a interatividade.

### Gerenciamento de Exibição de Campos
A função `configurarCamposExibicao` é central para a UX. Ela esconde todos os campos opcionais e mostra apenas os relevantes para o tipo de exibição escolhido.

```javascript
function configurarCamposExibicao(tipoExibicao)
{
    var tipo = parseInt(tipoExibicao);

    // 1. Esconder tudo
    $('#divDataExibicao, #divHorarioExibicao, #divDiasAlerta, ...').hide();

    // 2. Mostrar baseado no caso
    switch (tipo)
    {
        case 2: // Horário Específico
            $('#divHorarioExibicao').show();
            $('#divDataExpiracao').show();
            break;
        case 5: // Recorrente - Semanal
            $('#divDataExibicao').show(); // Age como Data Inicial
            $('#divHorarioExibicao').show();
            $('#divDataExpiracao').show(); // Age como Data Final
            $('#divDiasAlerta').show(); // Checkbox de Seg-Dom
            break;
        case 8: // Dias Variados
            $('#divHorarioExibicao').show();
            $('#calendarContainerAlerta').show(); // Calendário visual
            break;
        // ...
    }
}
```

### Vínculos Dinâmicos
Similar à exibição, `configurarCamposRelacionados` mostra dropdowns de vínculo (ex: escolher qual viagem está atrelada ao alerta) baseando-se no Tipo de Alerta.

```javascript
function configurarCamposRelacionados(tipo)
{
    $('#divViagem, #divManutencao, ...').hide();

    switch (parseInt(tipo))
    {
        case 1: // Agendamento
            $('#divViagem').show();
            break;
        case 2: // Manutenção
            $('#divManutencao').show();
            break;
    }
}
```

### Submissão e Validação
Antes de enviar, o JS valida se os campos obrigatórios para *aquele cenário específico* estão preenchidos.

```javascript
function validarFormulario()
{
    // Validação básica
    if (!validarCampo('Titulo', 'O título é obrigatório')) return false;

    // Validação contextual
    var tipoExibicao = parseInt(...);

    if (tipoExibicao === 5) { // Semanal
        var diasSemana = ...;
        if (!diasSemana || diasSemana.length === 0) {
            AppToast.show("Amarelo", "Selecione pelo menos um dia da semana");
            return false;
        }
    }
    return true;
}
```

---

## Lógica de Backend (Controller)

O método `Salvar` no `AlertasFrotiXController.cs` processa os dados. Ele trata casos especiais, como a criação de múltiplos alertas para o tipo "Dias Variados".

```csharp
[HttpPost("Salvar")]
public async Task<IActionResult> Salvar([FromBody] AlertaDto dto)
{
    // ... Validações básicas ...

    // CASO ESPECIAL: Tipo 8 (Dias Variados)
    // Cria N alertas, um para cada data selecionada
    if (dto.TipoExibicao == 8 && !string.IsNullOrWhiteSpace(dto.DatasSelecionadas))
    {
        var datasStr = dto.DatasSelecionadas.Split(',');
        foreach (var dataStr in datasStr)
        {
            var alerta = new AlertasFrotiX { ... };
            await _alertasRepo.CriarAlertaAsync(alerta, dto.UsuariosIds);
        }
        return Ok(...);
    }

    // CASO PADRÃO: Cria ou Atualiza um único alerta
    AlertasFrotiX alertaUnico;

    if (dto.AlertasFrotiXId != Guid.Empty) {
        // Update logic...
        alertaUnico = await _unitOfWork.AlertasFrotiX.Get...;
        // Atualiza campos e refaz vínculos de usuários
    } else {
        // Create logic...
        alertaUnico = new AlertasFrotiX { ... };
        await _alertasRepo.CriarAlertaAsync(alertaUnico, dto.UsuariosIds);
    }

    // Notifica via SignalR
    await NotificarUsuariosNovoAlerta(alertaUnico, dto.UsuariosIds);

    return Ok(...);
}
```

---

## Troubleshooting

### Campos de recorrência não aparecem
**Causa**: O evento `change` do dropdown `TipoExibicao` não está disparando ou o script `alertas_upsert.js` não carregou.
**Solução**: Verifique se o ID `TipoExibicao` está correto e se o Syncfusion instanciou o controle.

### Dropdown de Vínculos vazio
**Causa**: O model `UpsertModel` não carregou as listas (ViewBag/Model properties) ou o AJAX de filtro falhou.
**Solução**: Verifique no `OnGet` do `Upsert.cshtml.cs` se `ViagensListCompleta`, `ManutencoesListCompleta`, etc., estão sendo populados.

### Erro ao salvar "Dias Variados"
**Causa**: Formato de data inválido na string `DatasSelecionadas`.
**Solução**: O JS deve formatar as datas como `YYYY-MM-DD` antes de enviar. Verifique o console para ver o payload JSON enviado.

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [06/01/2026] - Criação da Documentação

**Descrição**:
Documentação inicial da funcionalidade de Criação e Edição (Upsert) de alertas.

**Status**: ✅ **Documentado**

**Responsável**: Claude (AI Assistant)
**Versão**: 1.0
