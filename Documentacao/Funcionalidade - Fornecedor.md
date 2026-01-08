# Documentação: Fornecedor (Funcionalidade)

> **Última Atualização**: 06/01/2026
> **Versão Atual**: 1.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Listagem (Index)](#listagem-index)
4. [Cadastro/Edição (Upsert)](#cadastroedicao-upsert)
5. [Endpoints API](#endpoints-api)
6. [Troubleshooting](#troubleshooting)

---

## Visão Geral

O módulo de **Fornecedores** é responsável pelo cadastro e gestão das empresas e parceiros que prestam serviços ou fornecem produtos para a frota. Armazena dados cadastrais (CNPJ, Razão Social), contatos e status.

### Características Principais
- ✅ **CRUD Simples**: Interface direta para criação, leitura, atualização e desativação.
- ✅ **Máscara de CNPJ**: Formatação automática do campo de documento.
- ✅ **Contatos Múltiplos**: Suporte a dois contatos e telefones por fornecedor.
- ✅ **Status**: Controle de ativo/inativo para filtrar fornecedores em uso.

---

## Arquitetura

### Estrutura de Arquivos

```
FrotiX.Site/
├── Pages/
│   └── Fornecedor/
│       ├── Index.cshtml             # Listagem
│       └── Upsert.cshtml            # Formulário de Cadastro
│
├── Controllers/
│   └── FornecedorController.cs      # Endpoints API
│
├── wwwroot/
│   ├── js/
│   │   └── cadastros/
│   │       └── fornecedor.js        # Lógica da Listagem (DataTable)
```

### Tecnologias Utilizadas
| Tecnologia | Uso |
|------------|-----|
| **ASP.NET Core Razor Pages** | Renderização das páginas |
| **jQuery DataTables** | Grid de listagem |
| **Bootstrap 5** | Layout e Componentes |

---

## Listagem (Index)

A página `Index.cshtml` exibe a lista de fornecedores.

### Estrutura da Tabela
A tabela é gerada via JavaScript (`fornecedor.js`) consumindo a API `/api/Fornecedor`.

**Colunas:**
1. Descrição (Razão Social)
2. CNPJ
3. Contato
4. Telefone
5. Status (Ativo/Inativo)
6. Ação (Editar)

---

## Cadastro/Edição (Upsert)

A página `Upsert.cshtml` gerencia o formulário.

### Campos do Formulário
- **CNPJ**: Com máscara automática.
- **Descrição**: Razão Social ou Nome Fantasia.
- **Contatos**: Nome e Telefone (Principal e Secundário).
- **Status**: Checkbox Ativo/Inativo.

### Lógica de Frontend (Inline Script)
O script de máscara de CNPJ está embutido na página `Upsert.cshtml`.

```javascript
document.getElementById('cnpj').addEventListener('input', function (e) {
    var x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})/);
    e.target.value = !x[2] ? x[1] : x[1] + '.' + x[2] + '.' + x[3] + '/' + x[4] + (x[5] ? '-' + x[5] : '');
});
```

---

## Endpoints API

### GET `/api/Fornecedor`
Retorna a lista de todos os fornecedores.

### POST `/Fornecedor/Upsert` (Handler)
Processa a criação ou atualização via Razor Pages.

---

## Troubleshooting

### Máscara de CNPJ não funciona
**Causa**: Erro no script inline ou conflito de IDs.
**Solução**: Verifique se o ID do input é `cnpj` e se não há erros no console do navegador.

### Fornecedor não aparece na lista após cadastro
**Causa**: Cache do DataTable ou erro no Insert.
**Solução**: Recarregue a página. Se persistir, verifique o log do banco de dados para confirmar a inserção.

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [06/01/2026] - Criação da Documentação

**Descrição**:
Documentação inicial do módulo de Fornecedores.

**Status**: ✅ **Documentado**

**Responsável**: Claude (AI Assistant)
**Versão**: 1.0
