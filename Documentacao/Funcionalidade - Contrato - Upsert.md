# Documentação: Contrato - Upsert (Criação e Edição)

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

A página de **Upsert de Contrato** (`Pages/Contrato/Upsert.cshtml`) é uma das mais complexas do sistema, pois adapta sua interface dinamicamente conforme o **Tipo de Contrato** (Locação, Terceirização, Serviços). Ela gerencia dados cadastrais, vigência, valores financeiros e itens específicos de cada tipo.

### Características Principais
- ✅ **Interface Dinâmica**: Campos aparecem ou somem baseados no tipo de contrato.
- ✅ **Grid de Veículos**: Para contratos de Locação, permite adicionar veículos diretamente.
- ✅ **Configuração de Terceirização**: Checkboxes e inputs para definir cargos e custos de mão de obra.
- ✅ **Repactuação**: Em edição, permite navegar pelo histórico de aditivos.

---

## Arquitetura

### Estrutura de Arquivos

```
FrotiX.Site/
├── Pages/
│   └── Contrato/
│       └── Upsert.cshtml            # View do Formulário
│
├── Controllers/
│   └── ContratoController.cs        # Endpoints API (Insert/Update)
```

### Tecnologias Utilizadas
| Tecnologia | Uso |
|------------|-----|
| **ASP.NET Core Razor Pages** | Renderização |
| **Syncfusion Grid** | Tabela de Veículos |
| **jQuery** | Lógica de exibição condicional |
| **Bootstrap 5** | Layout |

---

## Estrutura da Interface

### Seção Identificação
Dados básicos como Número, Ano, Processo e Vigência.

### Seção Detalhes (Dinâmica)
Dependendo do `#lstTipoContrato`:
- **Locação**: Exibe `#divVeiculosAdd` (Grid Syncfusion).
- **Terceirização**: Exibe `#divTerceirizacao` (Cargos e Salários).
- **Serviços**: Exibe apenas campos de valor global.

```html
<select id="lstTipoContrato" class="form-control">
    <option value="Locação">Locação</option>
    <option value="Terceirização">Terceirização</option>
    <option value="Serviços">Serviços</option>
</select>
```

---

## Lógica de Frontend (JavaScript)

Scripts inline na página controlam a visibilidade das seções.

### Controle de Exibição
```javascript
$('#lstTipoContrato').on('change', function () {
    // Esconde tudo primeiro
    $("#divVeiculosAdd, #divTerceirizacao").hide();

    if (this.value === 'Locação') {
        $("#divVeiculosAdd").show();
    } else if (this.value === 'Terceirização') {
        $("#divTerceirizacao").show();
    }
});
```

### Submissão do Formulário
A função `InsereRegistro` coleta os dados, incluindo os do Grid Syncfusion (se aplicável), e envia para a API.

```javascript
function InsereRegistro() {
    // Validações...

    var objContrato = {
        // ... coleta dados dos inputs ...
        "TipoContrato": $('#lstTipoContrato').val(),
        // ...
    };

    // Envio AJAX
    $.ajax({
        url: "api/Contrato/InsereContrato", // ou EditaContrato
        data: JSON.stringify(objContrato),
        // ...
    });
}
```

---

## Endpoints API

### POST `/api/Contrato/InsereContrato`
Cria um novo contrato.

### POST `/api/Contrato/EditaContrato`
Atualiza um contrato existente.

### POST `/api/Contrato/InsereItemContrato`
Utilizado em loop pelo frontend para salvar os itens do grid de veículos logo após criar o contrato.

---

## Troubleshooting

### Grid de Veículos não aparece
**Causa**: Tipo de contrato não selecionado ou erro no script de `change`.
**Solução**: Selecione "Locação". Verifique o console do navegador.

### Erro ao salvar itens
**Causa**: O ID do contrato (Repactuação) não foi retornado corretamente pela criação do contrato.
**Solução**: Verifique se a chamada `InsereContrato` retornou sucesso e o ID necessário para a chamada subsequente `InsereItemContrato`.

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [06/01/2026] - Criação da Documentação

**Descrição**:
Documentação inicial do formulário de Upsert de Contratos.

**Status**: ✅ **Documentado**

**Responsável**: Claude (AI Assistant)
**Versão**: 1.0
