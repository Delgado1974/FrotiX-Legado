# Documentação: Manutenção - Gestão (ListaManutencao)

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

A página de **Lista de Manutenção** (`Pages/Manutencao/ListaManutencao.cshtml`) é o painel de controle das Ordens de Serviço (OS) de manutenção da frota. Permite filtrar, visualizar, criar e baixar (fechar) ordens de serviço, gerenciando itens de reparo, veículos reserva e custos.

### Características Principais
- ✅ **Filtros Abrangentes**: Ano, Mês, Período, Veículo e Status.
- ✅ **Listagem Detalhada**: Exibe OS com datas de solicitação, disponibilização, entrega e devolução.
- ✅ **Baixa de OS**: Modal completo para encerrar uma OS, incluindo registro de veículo reserva e itens de manutenção.
- ✅ **Status Visual**: Badges coloridos para identificar OS Aberta, Fechada ou Cancelada.
- ✅ **Visualização de Fotos**: Modal para ver imagens das ocorrências vinculadas.

---

## Arquitetura

### Estrutura de Arquivos

```
FrotiX.Site/
├── Pages/
│   └── Manutencao/
│       └── ListaManutencao.cshtml   # View principal
│
├── Controllers/
│   └── ManutencaoController.cs      # Endpoints API
│
├── wwwroot/
│   ├── js/
│   │   └── cadastros/
│   │       └── ListaManutencao.js   # Lógica do DataTable e Modais
```

### Tecnologias Utilizadas
| Tecnologia | Uso |
|------------|-----|
| **ASP.NET Core Razor Pages** | Renderização da página |
| **jQuery DataTables** | Grid principal |
| **Syncfusion EJ2** | Combobox de Veículos/Status |
| **Bootstrap 5** | Modais e Layout |

---

## Estrutura da Interface

A interface segue o padrão FrotiX com um painel de filtros no topo e a tabela de dados abaixo.

### Filtros
Combinação de selects nativos (Ano/Mês) e componentes Syncfusion (Veículo/Status).

```html
<div class="ftx-manut-filters-grid">
    <div class="ftx-manut-filter-group">
        <label>Mês</label>
        <select id="lstMes" class="form-select">...</select>
    </div>
    <div class="ftx-manut-filter-group">
        <label>Veículo</label>
        <ejs-combobox id="lstVeiculos" ...></ejs-combobox>
    </div>
</div>
```

### Modal de Baixa (Fechar OS)
Modal crítico (`#modalManutencao`) usado para finalizar o serviço.

```html
<div class="modal fade" id="modalManutencao">
    <!-- ... -->
    <label>Data da Devolução</label>
    <input id="txtDataDevolucao" type="date" />

    <label>Veículo Reserva</label>
    <select id="lstReserva">
        <option value="1">Enviado</option>
        <option value="0">Não Enviado</option>
    </select>
    <!-- ... Tabela de Itens ... -->
</div>
```

---

## Lógica de Frontend (JavaScript)

O arquivo `ListaManutencao.js` controla a grid e as ações.

### Inicialização do DataTable
Configura as colunas e a renderização dos botões de ação e status.

```javascript
function ListaTodasManutencao() {
    dataTable = $("#tblManutencao").DataTable({
        ajax: {
            url: "/api/Manutencao/RecuperaListaManutencao",
            data: { /* filtros */ }
        },
        columns: [
            { data: "numOS" },
            { data: "veiculo" },
            {
                data: "statusOS",
                render: function(data) {
                    if (data === "Aberta") return '<span class="badge-aberta">Aberta</span>';
                    return '<span class="badge-fechada">Fechada</span>';
                }
            },
            {
                data: "manutencaoId",
                render: function(data) {
                    return `
                        <a href="/Manutencao/Upsert?id=${data}" class="btn-editar"><i class="fa-pen"></i></a>
                        <button onclick="baixarOS('${data}')" class="btn-baixar"><i class="fa-check"></i></button>
                    `;
                }
            }
        ]
    });
}
```

### Baixa de OS
O processo de baixa envolve validar a data de devolução e processar o veículo reserva.

```javascript
$("#btnFecharManutencao").click(function() {
    var obj = {
        ManutencaoId: $("#txtId").val(),
        DataDevolucao: $("#txtDataDevolucao").val(),
        ReservaEnviado: $("#lstReserva").val(),
        // ... dados do veículo reserva
    };

    $.ajax({
        url: "/api/Manutencao/FecharManutencao",
        type: "POST",
        data: JSON.stringify(obj),
        success: function(data) {
            if(data.success) {
                AppToast.show("Verde", "OS Fechada com sucesso");
                dataTable.ajax.reload();
            }
        }
    });
});
```

---

## Endpoints API

### GET `/api/Manutencao/RecuperaListaManutencao`
Retorna a lista filtrada de ordens de serviço.
- **Parâmetros**: `mes`, `ano`, `dataInicial`, `dataFinal`, `veiculoId`, `statusId`.

### POST `/api/Manutencao/FecharManutencao`
Finaliza a OS.
- **Body**: Objeto JSON com dados de fechamento.
- **Lógica**: Atualiza status para "Fechada", registra devolução do veículo principal e do reserva (se houver).

### POST `/api/Manutencao/CancelarManutencao`
Cancela a OS.
- **Body**: `{ ManutencaoId: "..." }`.

---

## Troubleshooting

### Tabela vazia mesmo com dados
**Causa**: Filtros de data padrão podem estar excluindo registros antigos.
**Solução**: Tente limpar os filtros de data ou selecionar "Todos os Anos".

### Erro ao Baixar OS
**Causa**: Data de devolução anterior à data de abertura ou veículo reserva com dados incompletos.
**Solução**: Verifique as datas. Se marcou "Reserva Enviado", os campos de veículo reserva são obrigatórios.

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [06/01/2026] - Criação da Documentação

**Descrição**:
Documentação inicial da funcionalidade de Listagem e Gestão de Manutenção.

**Status**: ✅ **Documentado**

**Responsável**: Claude (AI Assistant)
**Versão**: 1.0
