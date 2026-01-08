# Documentação: Requisitante - Upsert (Criação e Edição)

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

A página de **Upsert de Requisitante** (`Pages/Requisitante/Upsert.cshtml`) permite cadastrar novos requisitantes ou editar os existentes. O ponto principal é a seleção do **Setor Solicitante**, que utiliza um componente de árvore hierárquica.

### Características Principais
- ✅ **Formulário Simples**: Campos de identificação e contato.
- ✅ **Seleção Hierárquica**: Componente `Dropdowntree` para escolher o setor na estrutura organizacional.
- ✅ **Status**: Checkbox simples para ativar/desativar.

---

## Arquitetura

### Estrutura de Arquivos

```
FrotiX.Site/
├── Pages/
│   └── Requisitante/
│       └── Upsert.cshtml            # View do Formulário
│
├── Controllers/
│   └── RequisitanteController.cs    # Controller (Submit)
```

### Tecnologias Utilizadas
| Tecnologia | Uso |
|------------|-----|
| **ASP.NET Core Razor Pages** | Renderização |
| **Syncfusion Dropdowntree** | Seleção de Setor |
| **Bootstrap 5** | Layout |

---

## Estrutura da Interface

### Componente de Setor (Syncfusion)
O `ejs-dropdowntree` é configurado para consumir uma fonte de dados hierárquica (Id, Texto, ParentId).

```html
<ejs-dropdowntree id="ddtree"
                  ejs-for="@Model.RequisitanteObj.Requisitante.SetorSolicitanteId">
    <e-dropdowntree-fields dataSource="@ViewData["dataSource"]"
                           value="SetorSolicitanteId"
                           text="Nome"
                           parentValue="SetorPaiId"
                           hasChildren="HasChild">
    </e-dropdowntree-fields>
</ejs-dropdowntree>
```

---

## Lógica de Frontend (JavaScript)

Script inline para pré-selecionar o valor no componente Syncfusion durante a edição (devido a peculiaridades de renderização do componente).

```javascript
$(document).ready(function () {
    var setorId = "@Model.RequisitanteObj.Requisitante.SetorSolicitanteId";
    // Se existir setor e não for GUID vazio
    if (setorId && setorId !== "00000000-0000-0000-0000-000000000000") {
        // Define o valor no componente
        document.getElementById("ddtree").ej2_instances[0].value = [setorId];
    }
});
```

---

## Endpoints API

### POST `/Requisitante/Upsert` (Handler)
Processa o formulário. O `RequisitanteObj` é populado automaticamente pelo Model Binding do ASP.NET Core.

---

## Troubleshooting

### Árvore de setores não carrega
**Causa**: `ViewData["dataSource"]` nulo ou formato de dados incorreto (falta de `HasChild`).
**Solução**: Verifique o método `OnGet` e a query que popula a lista de setores.

### Valor do setor não salva
**Causa**: O componente `dropdowntree` pode não estar bindado corretamente ao input hidden do form.
**Solução**: O atributo `ejs-for` deve gerar o `name` correto (`RequisitanteObj.Requisitante.SetorSolicitanteId`).

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [06/01/2026] - Criação da Documentação

**Descrição**:
Documentação inicial do formulário de Upsert de Requisitantes.

**Status**: ✅ **Documentado**

**Responsável**: Claude (AI Assistant)
**Versão**: 1.0
