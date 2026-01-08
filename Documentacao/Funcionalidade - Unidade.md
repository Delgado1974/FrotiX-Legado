# Documentação: Unidade (Funcionalidade)

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

O módulo de **Unidades Usuárias** gerencia os departamentos, filiais ou divisões da organização que utilizam a frota. Cada unidade pode ter contatos responsáveis (até 3) e uma categoria organizacional.

### Características Principais
- ✅ **Contatos Múltiplos**: Registro de até 3 contatos responsáveis (Nome, Ponto, Ramal).
- ✅ **Categorização**: Classificação da unidade (Presidência, DG, Depol, etc.).
- ✅ **Capacidade**: Definição da quantidade de motoristas alocados.

---

## Arquitetura

### Estrutura de Arquivos

```
FrotiX.Site/
├── Pages/
│   └── Unidade/
│       ├── Index.cshtml             # Listagem
│       └── Upsert.cshtml            # Formulário
│
├── Controllers/
│   └── UnidadeController.cs         # Endpoints API
│
├── wwwroot/
│   ├── js/
│   │   └── cadastros/
│   │       └── unidade.js           # Lógica JS
```

### Tecnologias Utilizadas
| Tecnologia | Uso |
|------------|-----|
| **ASP.NET Core Razor Pages** | Renderização |
| **jQuery DataTables** | Listagem |
| **Bootstrap 5** | Layout |

---

## Listagem (Index)

Exibe as unidades cadastradas.

### Colunas
1. Sigla
2. Nome da Unidade (Descrição)
3. Contato (Primeiro Contato)
4. Ponto
5. Ramal
6. Status
7. Ação

---

## Cadastro/Edição (Upsert)

Formulário extenso para detalhes da unidade.

### Campos Principais
- **Identificação**: Sigla, Descrição, Categoria.
- **Capacidade**: Quantidade de Motoristas.
- **Contatos (1, 2 e 3)**: Blocos repetidos para Nome, Ponto e Ramal.
- **Status**: Ativo/Inativo.

---

## Endpoints API

### GET `/api/Unidade`
Retorna a lista de unidades.

### POST `/Unidade/Upsert` (Handler)
Processa a criação ou atualização.

---

## Troubleshooting

### Erro de Validação "Sigla Obrigatória"
**Causa**: Campo Sigla vazio.
**Solução**: Preencha a sigla (código curto da unidade).

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [06/01/2026] - Criação da Documentação

**Descrição**:
Documentação inicial do módulo de Unidades Usuárias.

**Status**: ✅ **Documentado**

**Responsável**: Claude (AI Assistant)
**Versão**: 1.0
