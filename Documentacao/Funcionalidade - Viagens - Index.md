# Documentação: Controle de Viagens (Index)

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

A página **Controle de Viagens** (`Pages/Viagens/Index.cshtml`) é o painel operacional para gestão do fluxo de viagens da frota. Ela permite visualizar, filtrar, criar, editar, finalizar e cancelar viagens, além de gerenciar ocorrências e custos associados.

### Características Principais
- ✅ **Listagem Rica**: DataTable com informações detalhadas, fotos de motoristas e badges de status coloridos.
- ✅ **Filtros Avançados**: Combinação de filtros por Data, Veículo, Motorista, Status e Evento.
- ✅ **Finalização de Viagem**: Modal complexo para encerrar viagens, capturando KM final, combustível e validações via IA.
- ✅ **Gestão de Ocorrências**: Permite visualizar, adicionar e dar baixa em ocorrências diretamente da listagem.
- ✅ **Ficha de Vistoria**: Upload e visualização de imagens de vistoria.
- ✅ **Relatórios**: Geração de fichas de viagem em PDF (Report Viewer).
- ✅ **Lazy Loading**: Carregamento otimizado de fotos de motoristas para performance.

---

## Arquitetura

### Estrutura de Arquivos

```
FrotiX.Site/
├── Pages/
│   └── Viagens/
│       └── Index.cshtml             # View principal (Tabela e Modais)
│
├── Controllers/
│   └── ViagemController.cs          # Endpoints API (Listagem, Finalização)
│   └── OcorrenciaViagemController.cs # Gestão de ocorrências
│
├── wwwroot/
│   ├── js/
│   │   └── cadastros/
│   │       └── ViagemIndex.js       # Lógica principal do DataTable e ações
│   │   └── viagens/
│   │       └── ocorrencia-viagem.js # Lógica específica de ocorrências
│   └── css/
│       └── viagemindex.css          # Estilos customizados
```

### Tecnologias Utilizadas

| Tecnologia | Uso |
|------------|-----|
| **ASP.NET Core Razor Pages** | Renderização da página |
| **jQuery DataTables** | Grid principal |
| **Syncfusion EJ2** | Dropdowns, TimePicker, RichTextEditor |
| **Bootstrap 5** | Modais e Layout |
| **Telerik Reporting** | Visualização de Fichas de Viagem |
| **Font Awesome Duotone** | Ícones |

---

## Estrutura da Interface

A interface é composta por um painel de filtros no topo e uma tabela de dados abaixo.

### Filtros
Os filtros utilizam componentes Syncfusion Combobox para seleção rica (com busca).

```html
<div class="ftx-filtros">
    <div class="row g-3">
        <div class="col-md-2">
            <ejs-combobox id="lstVeiculos" dataSource="@ViewData["lstVeiculos"]" ...></ejs-combobox>
        </div>
        <!-- ... outros filtros ... -->
    </div>
    <button onclick="FtxViagens.filtrar()">Filtrar Viagens</button>
</div>
```

### Modal de Finalização
O modal `#modalFinalizaViagem` é crítico para o processo de encerramento. Ele exibe dados readonly da abertura (Data/Hora/KM Inicial) e campos obrigatórios para o fechamento.

```html
<div class="modal fade" id="modalFinalizaViagem">
    <!-- ... -->
    <div class="row g-3 mb-4">
        <div class="col-md-3">
            <label>Data Final</label>
            <input id="txtDataFinal" type="date" class="form-control" />
        </div>
        <div class="col-md-3">
            <label>Km Final</label>
            <input id="txtKmFinal" type="number" class="form-control" />
        </div>
        <!-- ... -->
    </div>
    <button id="btnFinalizarViagem">Finalizar Viagem</button>
</div>
```

---

## Lógica de Frontend (JavaScript)

O arquivo `ViagemIndex.js` é extenso e gerencia toda a interatividade.

### 1. Inicialização do DataTable
Configura as colunas, renderizadores customizados (como a foto do motorista e badges de status) e a fonte de dados AJAX.

```javascript
function ListaTodasViagens() {
    dataTableViagens = $("#tblViagem").DataTable({
        ajax: {
            url: "/api/viagem",
            data: { /* ... filtros ... */ }
        },
        columns: [
            { data: "noFichaVistoria" },
            {
                data: null,
                render: ftxRenderMotorista // Lazy loading de foto
            },
            {
                data: "status",
                render: function(data) {
                    if (data === "Aberta") return '<span class="badge-aberta">Aberta</span>';
                    // ...
                }
            },
            // ... Botões de Ação ...
        ]
    });
}
```

### 2. Finalização de Viagem
O clique no botão de finalizar abre o modal, preenche os dados iniciais e configura a submissão.

```javascript
$("#btnFinalizarViagem").click(async function (e) {
    // 1. Validações de Campos Obrigatórios
    if ($("#txtDataFinal").val() === "") {
        Alerta.Erro("Erro", "Data Final obrigatória");
        return;
    }

    // 2. Validação de Consistência (IA/Lógica)
    // ...

    // 3. Montagem do Objeto
    const objViagem = {
        ViagemId: $("#txtId").val(),
        KmFinal: $("#txtKmFinal").val(),
        // ...
        Ocorrencias: OcorrenciaViagem.coletarOcorrenciasSimples()
    };

    // 4. Envio AJAX
    $.ajax({
        url: "/api/Viagem/FinalizaViagem",
        type: "POST",
        data: JSON.stringify(objViagem),
        success: function(data) {
            if (data.success) {
                AppToast.show("Verde", "Viagem finalizada!");
                $("#tblViagem").DataTable().ajax.reload();
            }
        }
    });
});
```

### 3. Lazy Loading de Fotos
Para evitar sobrecarga ao carregar centenas de fotos de motoristas, o sistema usa `IntersectionObserver`.

```javascript
const FtxFotoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            const id = img.getAttribute('data-mot-id');
            ftxQueueFotoFetch(id).then(src => img.src = src);
        }
    });
});
```

---

## Endpoints API

### GET `/api/viagem`
Retorna a lista de viagens filtrada.
- **Parâmetros**: `veiculoId`, `motoristaId`, `statusId`, `dataviagem`, `eventoId`.
- **Retorno**: JSON compatível com DataTables.

### POST `/api/Viagem/FinalizaViagem`
Processa o encerramento da viagem.
- **Corpo**: Objeto JSON com dados finais (Data, Hora, Km, Combustível, Ocorrências).
- **Lógica**: Atualiza o registro, calcula custos, baixa estoque de combustível (se aplicável) e processa ocorrências.

### POST `/api/Viagem/Cancelar`
Cancela uma viagem aberta.
- **Corpo**: `{ ViagemId: "GUID" }`.

---

## Troubleshooting

### Tabela não carrega (Loading infinito)
**Causa**: Erro no endpoint `/api/viagem` (timeout ou erro 500) ou falha no script `ViagemIndex.js`.
**Solução**: Verifique o Network Tab do navegador. Se o status for 500, cheque os logs do servidor.

### Erro ao Finalizar: "Data Final deve ser maior que Inicial"
**Causa**: Validação de backend ou frontend detectou inconsistência temporal.
**Solução**: Verifique se a data/hora final inserida é realmente posterior à de abertura. Lembre-se que o servidor pode estar em UTC ou fuso horário diferente.

### Fotos dos motoristas não aparecem
**Causa**: Falha no endpoint `/api/Viagem/FotoMotorista` ou cache corrompido.
**Solução**: Verifique se o endpoint retorna Base64 válido. Limpe o cache do navegador.

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [06/01/2026] - Criação da Documentação

**Descrição**:
Documentação inicial do módulo de Controle de Viagens (Index), cobrindo listagem, filtros, finalização e ocorrências.

**Status**: ✅ **Documentado**

**Responsável**: Claude (AI Assistant)
**Versão**: 1.0
