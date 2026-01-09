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
5. [Endpoints API](#endpoints-api)
6. [Troubleshooting](#troubleshooting)

---

## Visão Geral

A página **Upsert de Viagens** (`Pages/Viagens/Upsert.cshtml`) é responsável pela criação e edição de viagens. Diferente de um CRUD simples, esta página lida com uma lógica de negócios complexa, incluindo validação cruzada de datas/horas, cálculo automático de duração, integração com fichas de vistoria (upload de imagem) e registro de múltiplas ocorrências.

### Características Principais
- ✅ **Formulário Segmentado**: Dividido em seções (Período, Trajeto, Motorista/Veículo, Combustível, Documentos, Solicitante).
- ✅ **Validação Dinâmica**: Verifica disponibilidade de veículo e motorista em tempo real (via componentes Syncfusion).
- ✅ **Ficha de Vistoria**: Upload com preview e zoom de imagem.
- ✅ **Integração Mobile**: Se a viagem foi criada via App, exibe rubricas e dados específicos.
- ✅ **Gestão de Ocorrências**: Permite adicionar múltiplas ocorrências durante a criação/edição.
- ✅ **Bloqueio de Edição**: Viagens com status "Realizada" ou "Cancelada" são abertas em modo somente leitura.

---

## Arquitetura

### Estrutura de Arquivos

```
FrotiX.Site/
├── Pages/
│   └── Viagens/
│       └── Upsert.cshtml            # View do formulário
│
├── Controllers/
│   └── ViagemController.cs          # Endpoints API (Submit, UploadFicha)
│
├── wwwroot/
│   ├── js/
│   │   └── cadastros/
│   │       └── ViagemUpsert.js      # Lógica de validação e submissão
│   │   └── viagens/
│   │       └── kendo-editor-upsert.js # Editor de texto rico para descrição
```

### Tecnologias Utilizadas

| Tecnologia | Uso |
|------------|-----|
| **ASP.NET Core Razor Pages** | Renderização do formulário |
| **Syncfusion EJ2** | Dropdowns, ComboBox, TimePicker |
| **Kendo UI Editor** | Editor de texto rico para descrição |
| **Bootstrap 5** | Layout e Modais |
| **jQuery** | Manipulação do DOM e AJAX |

---

## Estrutura da Interface

A view `Upsert.cshtml` é organizada em cards temáticos para facilitar o preenchimento.

### 1. Período da Viagem
Campos de Data/Hora Inicial e Final. O sistema calcula automaticamente a duração.

```html
<div class="ftx-section ftx-section-periodo">
    <div class="row g-3">
        <div class="col-6 col-md-2">
            <label>Data Inicial</label>
            <input id="txtDataInicial" type="date" class="form-control" />
        </div>
        <!-- ... -->
        <div class="col-6 col-md-2">
            <label>Duração</label>
            <input id="txtDuracao" class="form-control ftx-calculated" disabled />
        </div>
    </div>
</div>
```

### 2. Motorista e Veículo
Usa `ejs-combobox` com templates customizados para mostrar a foto do motorista.

```html
<ejs-combobox id="cmbMotorista"
              dataSource="@ViewData["dataMotorista"]"
              created="onCmbMotoristaCreated"
              change="MotoristaValueChange">
    <e-combobox-fields text="Nome" value="MotoristaId"></e-combobox-fields>
</ejs-combobox>
```

### 3. Ficha de Vistoria
Seção dedicada ao upload de imagem da ficha de papel digitalizada.

```html
<input type="file" id="txtFile" accept="image/*" onchange="VisualizaImagem(this)" />
<img id="imgViewerItem" src="..." class="img-thumbnail" />
```

---

## Lógica de Frontend (JavaScript)

O arquivo `ViagemUpsert.js` (e scripts inline) gerencia a complexidade da página.

### Validação de Duplicidade (Fuzzy Logic)
O script inclui algoritmos de Levenshtein para sugerir se um destino digitado ("Aeroporto") já existe na lista ("Aeroporto Intl").

```javascript
function similarity(a, b) {
    // Calcula similaridade entre strings para evitar duplicação de cadastros
    // ex: "São Paulo" vs "Sao Paulo"
}
```

### Cálculo de Duração
Ao alterar datas ou horas, a duração é recalculada instantaneamente.

```javascript
document.getElementById("txtHoraFinal")?.addEventListener("focusout", calcularDuracaoViagem);

function calcularDuracaoViagem() {
    // Usa moment.js ou Date nativo para diff
    // Atualiza o campo #txtDuracao
}
```

### Proteção de Dados
O sistema detecta alterações no formulário e alerta o usuário se ele tentar sair sem salvar.

```javascript
$('form').on('change input', 'input, select, textarea', function () {
    formularioAlterado = true;
});

$('#btnVoltarLista').on('click', function (e) {
    if (formularioAlterado) {
        Alerta.Confirmar("Descartar Alterações?", ...);
    }
});
```

---

## Endpoints API

### POST `/Viagens/Upsert` (Handler Razor)
Processa o formulário principal.
- **Model**: `ViagemViewModel`.
- **Lógica**: Se `ViagemId` for vazio, cria; senão, atualiza.

### POST `/api/Viagem/UploadFichaVistoria`
Recebe o arquivo de imagem via AJAX `FormData`.
- **Parâmetros**: `arquivo` (IFormFile), `viagemId` (Guid).
- **Retorno**: JSON `{ success: true, message: "..." }`.

### GET `/api/Viagem/FotoMotorista?id={id}`
Retorna a foto do motorista em Base64 para o template do ComboBox.

---

## Troubleshooting

### Erro "Request Verification Token"
**Causa**: O upload de imagem no editor Kendo/Syncfusion não está enviando o token CSRF.
**Solução**: O script `toolbarClick` injeta o header `XSRF-TOKEN` manualmente antes do upload.

### Combo de Motorista sem foto
**Causa**: O endpoint `/api/Viagem/FotoMotorista` retornou 404 ou null.
**Solução**: O template JS tem um fallback para `/images/barbudo.jpg` (placeholder padrão).

### Campos desabilitados
**Causa**: A viagem está com status "Realizada" ou "Cancelada".
**Lógica**: O Razor renderiza a view verificando `Model.ViagemObj.Viagem.Status`. Se finalizada, botões de salvar são ocultados e inputs podem ser renderizados como `disabled`.

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [06/01/2026] - Criação da Documentação

**Descrição**:
Documentação inicial do módulo de Upsert de Viagens, cobrindo formulário, validações e upload de ficha.

**Status**: ✅ **Documentado**

**Responsável**: Claude (AI Assistant)
**Versão**: 1.0
