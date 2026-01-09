# Documentação: Fornecedor - Upsert (Criação e Edição)

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

A página de **Upsert de Fornecedor** (`Pages/Fornecedor/Upsert.cshtml`) permite cadastrar novos fornecedores ou editar os existentes. O formulário é simples e focado em dados cadastrais essenciais.

### Características Principais
- ✅ **Formulário Simples**: Campos diretos para preenchimento rápido.
- ✅ **Máscara de CNPJ**: Formatação automática.
- ✅ **Contatos Múltiplos**: Suporte a dois contatos.

---

## Arquitetura

### Estrutura de Arquivos

```
FrotiX.Site/
├── Pages/
│   └── Fornecedor/
│       └── Upsert.cshtml            # View do Formulário
│
├── Controllers/
│   └── FornecedorController.cs      # Controller (Submit)
```

### Tecnologias Utilizadas
| Tecnologia | Uso |
|------------|-----|
| **ASP.NET Core Razor Pages** | Renderização |
| **JavaScript Puro** | Máscara de CNPJ |
| **Bootstrap 5** | Layout |

---

## Estrutura da Interface

O formulário é renderizado com Razor Tag Helpers.

```html
<form method="post" asp-action="Upsert">
    <div class="row">
        <div class="col-4">
            <label>CNPJ</label>
            <input id="cnpj" asp-for="FornecedorObj.CNPJ" />
        </div>
        <div class="col-8">
            <label>Descrição</label>
            <input asp-for="FornecedorObj.DescricaoFornecedor" />
        </div>
    </div>
    <!-- ... Contatos ... -->
    <button type="submit">Salvar</button>
</form>
```

---

## Lógica de Frontend (JavaScript)

O script de máscara para o CNPJ é embutido na página para simplicidade.

```javascript
document.getElementById('cnpj').addEventListener('input', function (e) {
    var x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})/);
    e.target.value = !x[2] ? x[1] : x[1] + '.' + x[2] + '.' + x[3] + '/' + x[4] + (x[5] ? '-' + x[5] : '');
});
```

---

## Endpoints API

### POST `/Fornecedor/Upsert` (Handler)
Processa o formulário. Se o ID for vazio, cria um novo registro; caso contrário, atualiza o existente.

---

## Troubleshooting

### Máscara de CNPJ falha
**Causa**: O evento `input` não está sendo disparado ou regex incorreto.
**Solução**: Verifique se o ID do campo é `cnpj`.

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [06/01/2026] - Criação da Documentação

**Descrição**:
Documentação inicial do formulário de Upsert de Fornecedores.

**Status**: ✅ **Documentado**

**Responsável**: Claude (AI Assistant)
**Versão**: 1.0
