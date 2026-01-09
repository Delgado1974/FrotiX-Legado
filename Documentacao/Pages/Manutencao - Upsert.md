# Documentação: Manutenção - Upsert (Criação e Edição)

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

A página **Upsert de Manutenção** (`Pages/Manutencao/Upsert.cshtml`) gerencia o ciclo de vida de uma Ordem de Serviço (OS). Ela permite criar novas OS, editar existentes, associar um veículo, registrar datas de fluxo (solicitação, entrega, devolução), configurar veículo reserva e adicionar itens de manutenção (peças/serviços) com imagens.

### Características Principais
- ✅ **Formulário Completo**: Campos para datas críticas, status e veículo principal.
- ✅ **Gestão de Itens**: Adição dinâmica de itens à OS (ex: "Troca de Óleo", "Pneu"), com suporte a upload de fotos.
- ✅ **Veículo Reserva**: Seção condicional para registrar se um veículo reserva foi fornecido.
- ✅ **Ocorrências e Pendências**: Exibe tabelas de ocorrências e pendências do veículo selecionado, permitindo vinculá-las à OS.
- ✅ **Modo Somente Leitura**: Se a OS estiver "Fechada" ou "Cancelada", o formulário bloqueia edições.

---

## Arquitetura

### Estrutura de Arquivos

```
FrotiX.Site/
├── Pages/
│   └── Manutencao/
│       └── Upsert.cshtml            # View do formulário
│
├── Controllers/
│   └── ManutencaoController.cs      # Endpoints API
│
├── wwwroot/
│   ├── js/
│   │   └── cadastros/
│   │       └── manutencao.js        # Lógica de validação e itens
```

### Tecnologias Utilizadas
| Tecnologia | Uso |
|------------|-----|
| **ASP.NET Core Razor Pages** | Renderização do formulário |
| **Syncfusion EJ2** | Combobox e RichTextEditor |
| **jQuery** | Manipulação do DOM e AJAX |
| **Bootstrap 5** | Layout e Modais |

---

## Estrutura da Interface

### 1. Dados Principais da OS
Campos de data e status.

```html
<div class="row g-4">
    <div class="col-12 col-md-3">
        <label>Número OS</label>
        <input asp-for="ManutencaoObj.Manutencao.NumOS" disabled />
    </div>
    <div class="col-12 col-md-3">
        <label>Data Solicitação</label>
        <input asp-for="ManutencaoObj.Manutencao.DataSolicitacao" type="date" />
    </div>
    <!-- ... outros campos ... -->
</div>
```

### 2. Seção Veículo Reserva
Exibida apenas se o select "Reserva Enviado" for "Enviado".

```html
<select id="lstReserva" onchange="fnExibeReserva()">
    <option value="1">Enviado</option>
    <option value="0">Não Enviado</option>
</select>

<div id="divReserva" style="display:none">
    <ejs-combobox id="lstVeiculoReserva" ...></ejs-combobox>
    <input id="txtDataRecebimentoReserva" type="date" />
</div>
```

### 3. Tabelas de Itens e Pendências
Tabelas dinâmicas preenchidas via AJAX ao selecionar um veículo.

```html
<div id="divItens">
    <h4>Itens da Manutenção</h4>
    <button id="btnAdicionaItem">Adicionar Item</button>
    <table id="tblItens">...</table>
</div>
```

---

## Lógica de Frontend (JavaScript)

O arquivo `manutencao.js` orquestra a página.

### Seleção de Veículo
Ao mudar o veículo, o sistema busca ocorrências e pendências em aberto para aquele carro.

```javascript
function VeiculoChange() {
    var veiculoId = document.getElementById('lstVeiculo').ej2_instances[0].value;

    // 1. Carregar Ocorrências
    CarregaOcorrencias(veiculoId);

    // 2. Carregar Pendências
    CarregaPendencias(veiculoId);
}
```

### Adicionar Item de Manutenção
Abre um modal, permite upload de foto e salva via AJAX.

```javascript
$("#btnInsereItem").click(function() {
    var formData = new FormData();
    formData.append("ManutencaoId", $("#txtManutencaoId").val());
    formData.append("Resumo", $("#txtResumo").val());
    formData.append("files", $("#txtFileItem")[0].files[0]);

    $.ajax({
        url: "/api/Manutencao/AdicionarItem",
        type: "POST",
        data: formData,
        processData: false, // Importante para upload
        contentType: false,
        success: function(data) {
            if(data.success) {
                AppToast.show("Verde", "Item adicionado");
                CarregaItens(); // Recarrega tabela
                $("#modalManutencao").modal("hide");
            }
        }
    });
});
```

---

## Endpoints API

### POST `/Manutencao/Upsert` (Handler)
Processa a criação ou atualização dos dados principais da OS.

### POST `/api/Manutencao/AdicionarItem`
Adiciona um item à OS. Recebe arquivo via `multipart/form-data`.

### GET `/api/Manutencao/GetOcorrenciasVeiculo`
Retorna ocorrências em aberto para o veículo selecionado.

### GET `/api/Manutencao/GetItensManutencao`
Retorna os itens já cadastrados para a OS.

---

## Troubleshooting

### Botão "Adicionar Item" não funciona
**Causa**: O ID da Manutenção (`txtManutencaoId`) está vazio.
**Lógica**: Você só pode adicionar itens após salvar a OS pela primeira vez (criando o ID).
**Solução**: Salve a OS básica primeiro. O sistema deve recarregar a página com o ID gerado.

### Veículo Reserva não aparece
**Causa**: A função `fnExibeReserva` não foi chamada ou erro JS.
**Solução**: Verifique se o evento `onchange` do select `lstReserva` está disparando.

### Erro ao salvar imagem
**Causa**: Arquivo muito grande ou formato inválido.
**Solução**: Verifique se o backend aceita o tamanho (limite padrão ASP.NET é ~30MB, mas pode haver validação customizada).

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [06/01/2026] - Criação da Documentação

**Descrição**:
Documentação inicial do módulo de Upsert de Manutenção (OS).

**Status**: ✅ **Documentado**

**Responsável**: Claude (AI Assistant)
**Versão**: 1.0
