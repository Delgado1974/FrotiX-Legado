# Documentação: Pendências de Abastecimento

> **Última Atualização**: 06/01/2025
> **Versão Atual**: 1.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Fluxo de Operação](#fluxo-de-operação)
4. [Cards de Resumo Estatístico](#cards-de-resumo-estatístico)
5. [Tipos de Pendência](#tipos-de-pendência)
6. [Ações Disponíveis](#ações-disponíveis)
7. [Sistema de Sugestões](#sistema-de-sugestões)
8. [Endpoints API](#endpoints-api)
9. [Frontend](#frontend)
10. [Validações](#validações)
11. [Troubleshooting](#troubleshooting)

---

## Visão Geral

A funcionalidade de **Pendências de Abastecimento** permite gerenciar registros de abastecimento que não puderam ser importados automaticamente devido a erros de validação. Essas pendências são **geradas durante a importação** e podem ser **corrigidas e resolvidas** nesta página.

### Características Principais
- ✅ **Exibição de Pendências**: Tabela DataTable com todos os registros com erro
- ✅ **Filtros Estatísticos**: Cards que filtram por tipo de pendência (Veículo, Motorista, KM, Corrigíveis)
- ✅ **Edição Manual**: Modal para editar dados da pendência
- ✅ **Sugestões Automáticas**: Para erros de KM, mostra correções recomendadas
- ✅ **Importação Direta**: Após corrigir, pode-se importar direto (Salvar e Importar)
- ✅ **Exclusão**: Remove pendências que não será possível corrigir
- ✅ **Suporte a Badges**: Visualização clara do tipo de erro com ícones

### Relação com Importação

As pendências são **geradas durante a importação** (página `/Abastecimento/Importacao`). Quando um registro não passa em todas as validações, é criado um registro em `AbastecimentoPendente` com:
- Os dados originais da importação
- Descrição detalhada do erro
- Tipo de erro (para facilitar filtros)
- Sugestão de correção (se aplicável)

---

## Arquitetura

### Estrutura de Arquivos

```
FrotiX.Site/
├── Pages/
│   └── Abastecimento/
│       ├── Pendencias.cshtml            # Página principal (HTML + CSS + JavaScript)
│       └── Pendencias.cshtml.cs         # Code-behind (C# backend)
│
├── Controllers/
│   └── AbastecimentoController.Pendencias.cs  # Endpoints API para pendências
│
└── Models/
    └── AbastecimentoPendente.cs         # Modelo de dados para pendências
```

### Tecnologias Utilizadas

| Tecnologia | Uso |
|------------|-----|
| **ASP.NET Core Razor Pages** | Framework frontend |
| **jQuery** | Manipulação do DOM e AJAX |
| **DataTables 1.10+** | Tabela com paginação e filtros |
| **Bootstrap 5** | Layout e componentes |
| **Syncfusion** | DropdownList, DropdownTree |
| **SweetAlert** | Confirmação de exclusão |
| **JavaScript Vanilla** | Lógica principal |

---

## Fluxo de Operação

### Diagrama Geral

```
┌─────────────────────────────────────────────────────────────┐
│ USUÁRIO ACESSA /Abastecimento/Pendencias                   │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ OnGet() carrega dados de referência                          │
│ - Veículos (para dropdown)                                  │
│ - Motoristas (para dropdown)                                │
│ - Combustíveis (para dropdown)                              │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ PAGE LOAD: JavaScript inicializa                            │
│ 1. Carregar estatísticas (API)                              │
│ 2. Carregar DataTable de pendências (API)                   │
│ 3. Inicializar componentes (modais, botões)                │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ USUÁRIO INTERAGE                                            │
│ - Clica em card de filtro → Filtra tabela                  │
│ - Clica em botão Sugestão → Abre modal com sugestão        │
│ - Clica em botão Editar → Abre modal de edição             │
│ - Clica em botão Excluir → Confirma e deleta               │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ APLICAR CORREÇÃO OU IMPORTAR                                │
│ - Se Editar: Salva alterações na pendência (Status 0)      │
│ - Se Salvar e Importar: Cria registro em Abastecimento     │
│ - Se Aplicar Sugestão: Aplica valor e revalida             │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ RETORNAR PARA LISTA                                         │
│ - Recarregar DataTable                                      │
│ - Atualizar estatísticas                                    │
│ - Mostrar mensagem de sucesso                               │
└─────────────────────────────────────────────────────────────┘
```

### Fluxo de Dados

```
Pendência Importada (Status = 0)
        │
        ▼
┌─────────────────────────────────┐
│ OPÇÃO 1: EDITAR                 │
├─────────────────────────────────┤
│ Clica em "Editar"               │
│ → Modal abre com dados          │
│ → Edita Veículo, Motorista, etc │
│ → Clica "Salvar"                │
│ → Pendência revalidada          │
│ → Se sem erro: Status = 0       │
│ → Se com erro: Status = 0       │
└─────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────┐
│ OPÇÃO 2: SALVAR E IMPORTAR      │
├─────────────────────────────────┤
│ Clica em "Salvar e Importar"    │
│ → Valida dados obrigatórios     │
│ → Cria registro em Abastecimento│
│ → Marca pendência como Status=1 │
│ → Retorna lista atualizada      │
└─────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────┐
│ OPÇÃO 3: APLICAR SUGESTÃO       │
├─────────────────────────────────┤
│ Clica em botão "Sugestão"       │
│ → Modal mostra: Atual → Sugerido│
│ → Clica "Aplicar"               │
│ → Corrige valor de KM           │
│ → Recalcula KM Rodado           │
│ → Revalida pendência            │
│ → Atualiza na lista             │
└─────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────┐
│ OPÇÃO 4: EXCLUIR                │
├─────────────────────────────────┤
│ Clica em "Excluir"              │
│ → Pede confirmação (SweetAlert) │
│ → Deleta pendência              │
│ → Retorna lista atualizada      │
└─────────────────────────────────┘
```

---

## Cards de Resumo Estatístico

A página exibe **5 cards** que servem como filtros e mostram estatísticas:

### 1. Card Total (Azul Indigo)
- **Ícone**: `fa-duotone fa-list-check`
- **Gradiente**: `#6366f1` → `#4f46e5`
- **Função**: Mostra total de pendências e limpa qualquer filtro ativo
- **Clique**: Volta a exibir todas as pendências
- **Estado Inicial**: Ativo (com classe `filtro-ativo`)

### 2. Card Veículo (Laranja)
- **Ícone**: `fa-duotone fa-car-burst`
- **Gradiente**: `#f59e0b` → `#d97706`
- **Função**: Filtra apenas pendências onde `TipoPendencia = "veiculo"`
- **Significado**: Placa do veículo não encontrada no banco de dados
- **Badge**: `badge-pendencia veiculo` (fundo amarelo claro)

### 3. Card Motorista (Vermelho)
- **Ícone**: `fa-duotone fa-user-xmark`
- **Gradiente**: `#ef4444` → `#dc2626`
- **Função**: Filtra apenas pendências onde `TipoPendencia = "motorista"`
- **Significado**: CodMotorista QCard não encontrado
- **Badge**: `badge-pendencia motorista` (fundo rosa claro)

### 4. Card Quilometragem (Roxo)
- **Ícone**: `fa-duotone fa-gauge-high`
- **Gradiente**: `#8b5cf6` → `#7c3aed`
- **Função**: Filtra apenas pendências onde `TipoPendencia = "km"`
- **Significado**: KM negativo ou acima do esperado
- **Badge**: `badge-pendencia km` (fundo roxo claro)

### 5. Card Corrigíveis (Verde)
- **Ícone**: `fa-duotone fa-wand-magic-sparkles`
- **Gradiente**: `#10b981` → `#059669`
- **Função**: Filtra apenas pendências onde `TemSugestao = true`
- **Significado**: Pendências que têm sugestão automática de correção
- **Badge**: Não tem badge próprio

### Indicador de Filtro Ativo

Quando um filtro está ativo (não é "Total"), mostra-se um banner:
```html
<div id="filtroInfo" class="filtro-info visivel">
    <i class="fa-duotone fa-filter"></i>
    <span>Exibindo: <strong id="filtroNome">Pendências de Veículo</strong></span>
    <button class="btn-limpar-filtro" onclick="filtrarPorCard('total')">
        <i class="fa-duotone fa-xmark"></i> Limpar Filtro
    </button>
</div>
```

---

## Tipos de Pendência

| Tipo | Valor | Ícone | Cor (Badge) | Descrição |
|------|-------|-------|-------------|-----------|
| Autorização | `autorizacao` | `fa-ban` | Rosa/Magenta | Autorização QCard duplicada |
| Veículo | `veiculo` | `fa-car-burst` | Amarelo claro | Placa não encontrada no banco |
| Motorista | `motorista` | `fa-user-xmark` | Rosa claro | CodMotorista QCard não cadastrado |
| Quilometragem | `km` | `fa-gauge-high` | Roxo claro | KM negativo ou acima do esperado |
| Litros | `litros` | `fa-gas-pump` | Azul claro | Quantidade acima de 500 litros |
| Data | `data` | `fa-calendar-xmark` | Índigo claro | Data/hora inválida |
| Erro Geral | `erro` | `fa-circle-xmark` | Cinza claro | Outro tipo de erro não categor. |

### Exemplo de Pendência

```
Autorização: 123456
Data/Hora: 01/01/2025 10:30
Placa: ABC1234
Motorista: João Silva
Produto: Gasolina Comum
Litros: 40.5
KM Ant.: 50200
KM: 49800
Rodado: -400  ← ERRO!
Pendência: [Badge KM] "Quilometragem negativa (-400 km): KM Anterior maior que KM Atual"
Ações: [Sugestão] [Editar] [Excluir]
```

---

## Ações Disponíveis

Cada linha da tabela possui **botões de ação** na coluna final:

### 1. Botão Sugestão (Laranja com Pulsação)
- **Classe**: `btn btn-sugestao`
- **Ícone**: `fa-duotone fa-wand-magic-sparkles`
- **Quando Aparece**: Apenas se `TemSugestao = true`
- **Comportamento**:
  - Clique: Abre modal `modalSugestao`
  - Mostra valor atual errado e valor sugerido
  - Mostra justificativa (ex: "Baseado na média de 11.5 km/l do veículo...")
  - **Efeito Visual**: Pulsa continuamente (animação `pulseGlow`)
  - Ao passar mouse: Para a pulsação
- **Função JS**: `aplicarSugestao(id)`

### 2. Botão Editar (Azul Escuro)
- **Classe**: `btn btn-editar-pendencia`
- **Ícone**: `fa-duotone fa-pen`
- **Sempre Aparece**: Sim
- **Comportamento**:
  - Clique: Abre modal `modalEditarPendencia`
  - Carrega todos os dados da pendência
  - Permite editar: Veículo, Motorista, Litros, Combustível, KM, etc.
  - Recalcula KM Rodado automaticamente
  - Opções ao salvar:
    - **Salvar**: Apenas atualiza a pendência (Status = 0)
    - **Salvar e Importar**: Atualiza e importa diretamente (Status = 1)
- **Função JS**: `editarPendencia(id)`

### 3. Botão Excluir (Vinho/Marrom)
- **Classe**: `btn btn-excluir-pendencia`
- **Ícone**: `fa-duotone fa-trash`
- **Sempre Aparece**: Sim
- **Comportamento**:
  - Clique: Abre SweetAlert de confirmação
  - Pergunta: "Excluir Pendência? Esta ação não poderá ser desfeita."
  - Se confirmar: Deleta a pendência do banco
  - Recarrega tabela e estatísticas
- **Função JS**: `excluirPendencia(id)`

---

## Sistema de Sugestões

### Como Funciona

O sistema **sugere correções automaticamente** para erros de **quilometragem**. A sugestão é gerada durante a importação e armazenada na pendência.

### Campos de Sugestão

Na tabela `AbastecimentoPendente`:
- **`TemSugestao`**: boolean - Se tem sugestão disponível
- **`CampoCorrecao`**: string - "KmAnterior" ou "Km"
- **`ValorAtualErrado`**: int - Valor incorreto
- **`ValorSugerido`**: int - Valor corrigido recomendado
- **`JustificativaSugestao`**: string - Explicação do cálculo
- **`MediaConsumoVeiculo`**: double - Consumo médio do veículo usado no cálculo

### Exemplo de Sugestão

```
Pendência Original:
- KM Anterior: 15.000
- KM Atual: 10.500
- KM Rodado: -4.500 ❌ NEGATIVO

Sugestão:
- Campo a Corrigir: KM Anterior
- Valor Atual (Errado): 15.000
- Valor Sugerido: 10.060
- Justificativa: "Baseado na média de 11 km/l do veículo e consumo de 40 litros,
  o KM Anterior deveria ser aproximadamente 10.060 para uma quilometragem positiva"

Resultado Esperado:
- KM Anterior: 10.060 ✅
- KM Atual: 10.500 ✅
- KM Rodado: 440 ✅
```

### Dois Modos de Aplicar Sugestão

#### Modo 1: Botão Sugestão (Modal Flutuante)
```
1. Clica no botão "Sugestão" (laranja com pulseGlow)
2. Abre modal `modalSugestao` mostrando:
   - Título: "Correção Automática"
   - Box Errado: "Valor Atual" com valor tachado
   - Seta verde: →
   - Box Correto: "Valor Correto" em verde
   - Justificativa em italico
3. Clica "Aplicar Correção"
4. Envia API: POST /api/Abastecimento/AplicarSugestao
5. Revalida pendência e recarrega tabela
```

#### Modo 2: Dentro do Modal Editar
```
1. Clica em "Editar"
2. Modal abre com dados completos
3. Se tem sugestão, mostra card amarelo:
   - "Sugestão de Correção"
   - Mostra os valores (atual → sugerido)
   - Botão "Aplicar Sugestão"
4. Clica "Aplicar Sugestão"
   - Preenche o valor sugerido no campo
   - Recalcula KM Rodado
5. Clica "Salvar" ou "Salvar e Importar"
```

---

## Endpoints API

**Base URL**: `/api/Abastecimento`

### 1. GET `/api/Abastecimento/ContarPendencias`

**Descrição**: Conta pendências por tipo e retorna estatísticas.

**Request**: Nenhum parâmetro

**Response**:
```json
{
  "total": 45,
  "veiculo": 12,
  "motorista": 8,
  "km": 15,
  "autorizacao": 3,
  "litros": 2,
  "data": 1,
  "corrigiveis": 7
}
```

**Uso**: Popula os cards de filtro na página

---

### 2. GET `/api/Abastecimento/ListarPendencias`

**Descrição**: Lista todas as pendências (Status = 0) formatadas para DataTable.

**Request**: Nenhum parâmetro

**Response**:
```json
{
  "data": [
    {
      "abastecimentoPendenteId": "12345678-1234-1234-1234-123456789012",
      "autorizacaoQCard": 123456,
      "placa": "ABC1234",
      "nomeMotorista": "João Silva",
      "produto": "Gasolina Comum",
      "dataHora": "01/01/2025 10:30",
      "kmAnterior": 50200,
      "km": 49800,
      "kmRodado": -400,
      "litros": "40.50",
      "valorUnitario": "R$ 5,89",
      "valorTotal": "R$ 238,45",
      "descricaoPendencia": "Quilometragem negativa (-400 km): KM Anterior maior que KM Atual",
      "tipoPendencia": "km",
      "iconePendencia": "fa-gauge-high",
      "temSugestao": true,
      "campoCorrecao": "KmAnterior",
      "valorAtualErrado": 50200,
      "valorSugerido": 50060,
      "justificativaSugestao": "Baseado na média de 11.5 km/l do veículo...",
      "veiculoId": "87654321-4321-4321-4321-210987654321",
      "motoristaId": "11111111-1111-1111-1111-111111111111",
      "combustivelId": "22222222-2222-2222-2222-222222222222",
      "codMotorista": 101
    }
  ]
}
```

**Uso**: Preenche DataTable com `ajax.url = "/api/Abastecimento/ListarPendencias"`

---

### 3. GET `/api/Abastecimento/ObterPendencia?id={id}`

**Descrição**: Obtém detalhes de uma pendência específica pelo ID.

**Request**:
- `id`: string (GUID da pendência)

**Response**:
```json
{
  "success": true,
  "data": {
    "abastecimentoPendenteId": "12345678-1234-1234-1234-123456789012",
    "autorizacaoQCard": 123456,
    "placa": "ABC1234",
    "nomeMotorista": "João Silva",
    "descricaoPendencia": "Quilometragem negativa (-400 km)",
    "temSugestao": true,
    "campoCorrecao": "KmAnterior",
    "valorAtualErrado": 50200,
    "valorSugerido": 50060,
    "justificativaSugestao": "Baseado na média de 11.5 km/l do veículo...",
    "veiculoId": "87654321-4321-4321-4321-210987654321",
    "motoristaId": "11111111-1111-1111-1111-111111111111",
    "combustivelId": "22222222-2222-2222-2222-222222222222",
    "km": 49800,
    "kmAnterior": 50200,
    "litros": "40.50",
    "valorUnitario": "5.89",
    "codMotorista": 101
  }
}
```

**Uso**: Carrega dados quando usuário clica em "Editar" ou "Sugestão"

---

### 4. POST `/api/Abastecimento/SalvarPendencia`

**Descrição**: Salva alterações em uma pendência sem importar.

**Request**:
```json
{
  "AbastecimentoPendenteId": "12345678-1234-1234-1234-123456789012",
  "AutorizacaoQCard": 123456,
  "Placa": "ABC1234",
  "CodMotorista": 101,
  "DataHora": "2025-01-01T10:30",
  "Litros": 40.5,
  "ValorUnitario": 5.89,
  "KmAnterior": 50060,
  "Km": 49800,
  "VeiculoId": "87654321-4321-4321-4321-210987654321",
  "MotoristaId": "11111111-1111-1111-1111-111111111111",
  "CombustivelId": "22222222-2222-2222-2222-222222222222"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Pendência atualizada com sucesso",
  "pendenciasRestantes": false
}
```

**Behavior**:
- Atualiza pendência na tabela `AbastecimentoPendente` com Status = 0
- Revalida pendência (pode remover ou adicionar erros)
- Não cria registro em `Abastecimento`
- Se `pendenciasRestantes = true`, ainda há erro na pendência

**Uso**: Botão "Salvar" no modal de edição

---

### 5. POST `/api/Abastecimento/ResolverPendencia`

**Descrição**: Salva alterações e **importa o abastecimento** (cria registro em Abastecimento).

**Request**: Mesmo formato de `SalvarPendencia`

**Response**:
```json
{
  "success": true,
  "message": "Abastecimento importado com sucesso! KM Rodado: 440 km, Consumo: 9.20 km/l"
}
```

**Behavior**:
- Valida dados obrigatórios:
  - Veículo não vazio
  - Motorista não vazio
  - Combustível não vazio
  - Litros > 0
  - Valor Unitário > 0
  - Data/hora válida
  - KM Rodado não negativo
- Verifica se autorização já existe em `Abastecimento`
  - Se existe: Marca pendência como Status = 1 e avisa que já foi importada
  - Se não existe: Cria novo registro em `Abastecimento`
- Marca pendência como Status = 1 (Resolvida)
- Atualiza consumo médio do veículo

**Uso**: Botão "Salvar e Importar" no modal de edição

---

### 6. POST `/api/Abastecimento/AplicarSugestao`

**Descrição**: Aplica sugestão de correção automaticamente.

**Request**:
```json
{
  "AbastecimentoPendenteId": "12345678-1234-1234-1234-123456789012"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Sugestão aplicada com sucesso",
  "kmRodado": 440,
  "pendenciasRestantes": false
}
```

**Behavior**:
- Verifica se pendência tem sugestão (`TemSugestao = true`)
- Aplica valor sugerido no campo correto:
  - Se `CampoCorrecao = "KmAnterior"`: atualiza `KmAnterior = ValorSugerido`
  - Se `CampoCorrecao = "Km"`: atualiza `Km = ValorSugerido`
- Recalcula `KmRodado = Km - KmAnterior`
- Limpa campos de sugestão (`TemSugestao = false`, etc.)
- Revalida pendência com novos valores
- Se `pendenciasRestantes = false`: Tenta importar automaticamente

**Uso**: Modal `modalSugestao` e card de sugestão no modal de edição

---

### 7. POST `/api/Abastecimento/ExcluirPendencia`

**Descrição**: Deleta uma pendência específica.

**Request**:
```json
{
  "AbastecimentoPendenteId": "12345678-1234-1234-1234-123456789012"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Pendência excluída com sucesso"
}
```

**Uso**: Botão "Excluir" em cada linha da tabela

---

### 8. POST `/api/Abastecimento/ExcluirTodasPendencias`

**Descrição**: Deleta **todas** as pendências (Status = 0).

**Request**: Nenhum corpo JSON

**Response**:
```json
{
  "success": true,
  "message": "45 pendência(s) excluída(s) com sucesso"
}
```

**Uso**: Botão "Excluir Todas" no header da página

---

## Frontend

### Estrutura HTML

#### Header da Página

```html
<div class="ftx-card-header">
    <h2 class="titulo-paginas">
        <i class="fa-duotone fa-triangle-exclamation"></i>
        Abastecimentos Pendentes
    </h2>
    <div class="ftx-card-actions d-flex gap-2">
        <!-- Botão Voltar para Abastecimentos -->
        <a href="/Abastecimento/Index" class="btn btn-fundo-laranja">
            <i class="fa-duotone fa-gas-pump icon-pulse me-1"></i> Abastecimentos
        </a>

        <!-- Botão Ir para Importação -->
        <a href="/Abastecimento/Importacao" class="btn btn-fundo-laranja">
            <i class="fa-duotone fa-file-import icon-pulse me-1"></i> Nova Importação
        </a>

        <!-- Botão Excluir Todas -->
        <button type="button" class="btn btn-excluir-todas" onclick="excluirTodasPendencias()">
            <i class="fa-duotone fa-trash-can icon-pulse me-1"></i> Excluir Todas
        </button>
    </div>
</div>
```

#### Cards de Resumo

```html
<div class="row g-3 mb-4">
    <!-- Card Total -->
    <div class="col-6 col-md-4 col-xl-2">
        <div class="ftx-stat-card filtro-ativo" data-filtro="total" onclick="filtrarPorCard('total')">
            <div class="ftx-stat-icon total">
                <i class="fa-duotone fa-list-check"></i>
            </div>
            <div class="ftx-stat-info">
                <h4 id="statTotal">0</h4>
                <span>Total</span>
            </div>
        </div>
    </div>

    <!-- Card Veículo -->
    <div class="col-6 col-md-4 col-xl-2">
        <div class="ftx-stat-card" data-filtro="veiculo" onclick="filtrarPorCard('veiculo')">
            <div class="ftx-stat-icon veiculo">
                <i class="fa-duotone fa-car-burst"></i>
            </div>
            <div class="ftx-stat-info">
                <h4 id="statVeiculo">0</h4>
                <span>Veículo</span>
            </div>
        </div>
    </div>

    <!-- Card Motorista -->
    <div class="col-6 col-md-4 col-xl-2">
        <div class="ftx-stat-card" data-filtro="motorista" onclick="filtrarPorCard('motorista')">
            <div class="ftx-stat-icon motorista">
                <i class="fa-duotone fa-user-xmark"></i>
            </div>
            <div class="ftx-stat-info">
                <h4 id="statMotorista">0</h4>
                <span>Motorista</span>
            </div>
        </div>
    </div>

    <!-- Card Quilometragem -->
    <div class="col-6 col-md-4 col-xl-2">
        <div class="ftx-stat-card" data-filtro="km" onclick="filtrarPorCard('km')">
            <div class="ftx-stat-icon km">
                <i class="fa-duotone fa-gauge-high"></i>
            </div>
            <div class="ftx-stat-info">
                <h4 id="statKm">0</h4>
                <span>Quilometragem</span>
            </div>
        </div>
    </div>

    <!-- Card Corrigíveis -->
    <div class="col-6 col-md-4 col-xl-2">
        <div class="ftx-stat-card" data-filtro="corrigivel" onclick="filtrarPorCard('corrigivel')">
            <div class="ftx-stat-icon corrigivel">
                <i class="fa-duotone fa-wand-magic-sparkles"></i>
            </div>
            <div class="ftx-stat-info">
                <h4 id="statCorrigivel">0</h4>
                <span>Corrigíveis</span>
            </div>
        </div>
    </div>
</div>
```

#### DataTable

```html
<table id="tblPendencias" class="table table-bordered table-striped" width="100%">
    <thead>
        <tr>
            <th>Autorização</th>
            <th>Data/Hora</th>
            <th>Placa</th>
            <th>Motorista</th>
            <th>Produto</th>
            <th>Litros</th>
            <th>KM Ant.</th>
            <th>KM</th>
            <th>Rodado</th>
            <th>Pendência</th>
            <th>Ações</th>
        </tr>
    </thead>
    <tbody>
        <!-- Preenchido via AJAX -->
    </tbody>
</table>
```

### Modais

#### Modal de Edição (modalEditarPendencia)

```html
<div class="modal fade" id="modalEditarPendencia" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header bg-primary text-white">
                <h5 class="modal-title">
                    <i class="fa-duotone fa-pen-to-square"></i> Editar Pendência
                </h5>
            </div>
            <div class="modal-body">
                <form id="frmEditarPendencia">
                    <!-- Alerta de Pendência -->
                    <div class="alert alert-warning">
                        <i class="fa-duotone fa-triangle-exclamation me-2"></i>
                        <span id="txtDescricaoPendencia"></span>
                    </div>

                    <!-- Campos Readonly -->
                    <div class="row">
                        <div class="col-md-4 mb-3">
                            <label class="form-label">Autorização QCard</label>
                            <input type="text" class="form-control" id="txtAutorizacao" readonly />
                        </div>
                        <!-- ... outros campos ... -->
                    </div>

                    <!-- Dropdown de Veículo -->
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Veículo</label>
                        <ejs-dropdownlist id="cmbVeiculo"
                                          dataSource="@ViewData["lstVeiculos"]"
                                          placeholder="Selecione o Veículo"
                                          allowFiltering="true"
                                          filterType="Contains">
                        </ejs-dropdownlist>
                    </div>

                    <!-- Card de Sugestão (se tiver) -->
                    <div id="cardSugestao" class="card-sugestao d-none">
                        <h6><i class="fa-duotone fa-wand-magic-sparkles"></i> Sugestão de Correção</h6>
                        <p id="txtSugestaoInfo"></p>
                        <button type="button" class="btn btn-verde btn-sm" onclick="aplicarSugestaoNoModal()">
                            <i class="fa-duotone fa-check"></i> Aplicar Sugestão
                        </button>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-azul" id="btnSalvarPendencia" onclick="salvarPendencia()">
                    <span class="btn-text"><i class="fa-duotone fa-floppy-disk icon-pulse"></i> Salvar</span>
                    <span class="btn-loading d-none"><i class="fa-duotone fa-spinner fa-spin"></i> Salvando...</span>
                </button>
                <button type="button" class="btn btn-verde" id="btnSalvarImportar" onclick="salvarEImportar()">
                    <span class="btn-text"><i class="fa-duotone fa-file-import"></i> Salvar e Importar</span>
                    <span class="btn-loading d-none"><i class="fa-duotone fa-spinner fa-spin"></i> Processando...</span>
                </button>
            </div>
        </div>
    </div>
</div>
```

#### Modal de Sugestão (modalSugestao)

```html
<div class="modal fade" id="modalSugestao" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header bg-success text-white">
                <h5 class="modal-title">
                    <i class="fa-duotone fa-wand-magic-sparkles"></i> Correção Automática
                </h5>
            </div>
            <div class="modal-body">
                <div class="sugestao-modal-body">
                    <div class="sugestao-titulo">
                        <i class="fa-duotone fa-lightbulb"></i>
                        <span id="txtSugestaoCampoLabel">Sugestão de Correção</span>
                    </div>

                    <div class="sugestao-valores">
                        <div class="sugestao-valor-box errado">
                            <div class="valor-label">Valor Atual</div>
                            <div class="valor-numero" id="txtSugestaoValorAtual">-</div>
                        </div>
                        <div class="sugestao-seta">
                            <i class="fa-duotone fa-arrow-right"></i>
                        </div>
                        <div class="sugestao-valor-box correto">
                            <div class="valor-label">Valor Correto</div>
                            <div class="valor-numero" id="txtSugestaoValorSugerido">-</div>
                        </div>
                    </div>

                    <div class="sugestao-justificativa" id="txtSugestaoJustificativa"></div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-verde" id="btnAplicarSugestao" onclick="confirmarAplicarSugestao()">
                    <span class="btn-text"><i class="fa-duotone fa-check"></i> Aplicar Correção</span>
                    <span class="btn-loading d-none"><i class="fa-duotone fa-spinner fa-spin"></i> Aplicando...</span>
                </button>
            </div>
        </div>
    </div>
</div>
```

### JavaScript Principal

#### Inicialização

```javascript
$(document).ready(function () {
    try {
        mostrarLoading();
        carregarEstatisticas();      // GET /api/Abastecimento/ContarPendencias
        carregarPendencias();         // GET /api/Abastecimento/ListarPendencias
    } catch (error) {
        esconderLoading();
        Alerta.TratamentoErroComLinha("Pendencias.cshtml", "document.ready", error);
    }
});
```

#### Filtrar por Card

```javascript
function filtrarPorCard(tipo) {
    mostrarLoading();
    filtroAtivo = tipo;

    // Atualizar visual dos cards
    $('.ftx-stat-card').removeClass('filtro-ativo');
    $('.ftx-stat-card[data-filtro="' + tipo + '"]').addClass('filtro-ativo');

    // Atualizar indicador
    if (tipo === 'total') {
        $('#filtroInfo').removeClass('visivel');
    } else {
        $('#filtroInfo').addClass('visivel');
        $('#filtroNome').text({
            'veiculo': 'Pendências de Veículo',
            'motorista': 'Pendências de Motorista',
            'km': 'Pendências de Quilometragem',
            'corrigivel': 'Pendências Corrigíveis'
        }[tipo]);
    }

    // Aplicar filtro no DataTable
    aplicarFiltroDataTable();
    esconderLoading();
}
```

#### Aplicar Filtro no DataTable

```javascript
function aplicarFiltroDataTable() {
    if (!tblPendencias) return;

    $.fn.dataTable.ext.search.pop();

    if (filtroAtivo !== 'total') {
        $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
            var rowData = tblPendencias.row(dataIndex).data();
            if (!rowData) return false;

            if (filtroAtivo === 'corrigivel') {
                return rowData.temSugestao === true;
            } else {
                return rowData.tipoPendencia === filtroAtivo;
            }
        });
    }

    tblPendencias.draw();
}
```

---

## Validações

### Validações ao Resolver Pendência

Quando o usuário clica em "Salvar e Importar", o sistema valida:

1. **Veículo obrigatório**
   - `VeiculoId` deve estar preenchido
   - Erro: "Veículo não identificado"

2. **Motorista obrigatório**
   - `MotoristaId` deve estar preenchido
   - Erro: "Motorista não identificado"

3. **Combustível obrigatório**
   - `CombustivelId` deve estar preenchido
   - Erro: "Combustível não identificado"

4. **Litros válido**
   - Deve ser > 0
   - Erro: "Quantidade de litros inválida"

5. **Valor unitário válido**
   - Deve ser > 0
   - Erro: "Valor unitário inválido"

6. **Data/hora válida**
   - Deve ser parseável
   - Erro: "Data/hora não informada"

7. **Quilometragem não negativa**
   - `(Km - KmAnterior)` deve ser >= 0
   - Erro: "Quilometragem negativa: KM Anterior maior que KM Atual"

8. **Consumo plausível**
   - Se KM Rodado > 1000: verifica consumo esperado
   - Erro: "Consumo de XX km/l parece muito alto"

9. **Autorização não duplicada**
   - Verifica se autorização já existe em `Abastecimento`
   - Se existe: Marca como resolvida sem importar

### Revalidação após Edição

Quando usuário clica "Salvar" (sem importar), a pendência é revalidada com os novos valores:

```javascript
// Revalidar pendência
var novosPendencias = RevalidarPendencia(pendencia);
pendencia.DescricaoPendencia = novosPendencias.descricao;
pendencia.TipoPendencia = novosPendencias.tipo;
pendencia.TemSugestao = novosPendencias.temSugestao;
```

---

## Troubleshooting

### Problema 1: DataTable não carrega pendências

**Sintomas**: Tabela vazia mesmo havendo pendências no banco

**Causas Possíveis**:
1. API retorna erro 500
2. Formato JSON não corresponde à coluna configurada
3. Status das pendências não é 0

**Solução**:
1. Abrir DevTools (F12) → Console
2. Verificar se há erros na aba Network ao chamar `/api/Abastecimento/ListarPendencias`
3. Verificar no banco: `SELECT * FROM AbastecimentoPendente WHERE Status = 0`
4. Se vazio, criar uma pendência manualmente via importação

---

### Problema 2: Filtro não funciona

**Sintomas**: Ao clicar no card "Veículo", nenhuma linha aparece

**Causa**: Propriedade `tipoPendencia` vazia ou NULL

**Solução**:
1. Verificar no banco se pendências têm `TipoPendencia` preenchido
2. Se vazio, rodar query:
```sql
UPDATE AbastecimentoPendente
SET TipoPendencia = 'veiculo'
WHERE DescricaoPendencia LIKE '%não cadastrado%'
```

---

### Problema 3: Modal de sugestão não abre

**Sintomas**: Clica no botão "Sugestão" mas nada acontece

**Causas Possíveis**:
1. Pendência não tem sugestão (`TemSugestao = false`)
2. API retorna erro ao buscar detalhes
3. Bootstrap Modal não inicializado

**Solução**:
1. Verificar console para erros JavaScript
2. Confirmar que `TemSugestao = true` na pendência
3. Recarregar página (F5)

---

### Problema 4: KM Rodado não calcula ao editar

**Sintomas**: Edita KM Anterior ou KM, mas KM Rodado não atualiza

**Causa**: Falta disparar evento de recalcular

**Solução**: Ao editar `KmAnterior` ou `Km`, o código JS deve recalcular:
```javascript
var kmAnt = parseInt($("#txtKmAnterior").val()) || 0;
var kmAtual = parseInt($("#txtKm").val()) || 0;
$("#txtKmRodado").val(kmAtual - kmAnt);
```

---

### Problema 5: Botão "Excluir Todas" não funciona

**Sintomas**: Clica no botão, confirma, mas nada acontece

**Causa**: API retorna erro ou nenhuma pendência encontrada

**Solução**:
1. Verificar se há pendências: `SELECT COUNT(*) FROM AbastecimentoPendente WHERE Status = 0`
2. Se houver, verificar console (F12) para erro
3. Recarregar página

---

### Problema 6: Sugestão aplicada mas pendência continua

**Sintomas**: Clica "Aplicar Sugestão", mensagem de sucesso, mas pendência continua na tabela

**Causa**: Revalidação encontrou outro erro (ex: veículo não cadastrado)

**Solução**:
1. Clicar em "Editar"
2. Verificar descrição da pendência (no alert amarelo)
3. Se necessário, preencher Veículo e/ou Motorista
4. Clicar "Salvar e Importar"

---

## Referências Rápidas

### Arquivos Principais
- **Frontend**: `/Pages/Abastecimento/Pendencias.cshtml`
- **Code-behind**: `/Pages/Abastecimento/Pendencias.cshtml.cs`
- **Backend API**: `/Controllers/AbastecimentoController.Pendencias.cs`
- **Modelo**: `/Models/AbastecimentoPendente.cs`

### URLs
- **Página de Pendências**: `/Abastecimento/Pendencias`
- **API Listar**: `GET /api/Abastecimento/ListarPendencias`
- **API Contar**: `GET /api/Abastecimento/ContarPendencias`
- **API Obter**: `GET /api/Abastecimento/ObterPendencia?id={id}`
- **API Salvar**: `POST /api/Abastecimento/SalvarPendencia`
- **API Resolver**: `POST /api/Abastecimento/ResolverPendencia`
- **API Sugestão**: `POST /api/Abastecimento/AplicarSugestao`
- **API Excluir**: `POST /api/Abastecimento/ExcluirPendencia`
- **API Excluir Todas**: `POST /api/Abastecimento/ExcluirTodasPendencias`

### Status de Pendência
- **0 = Pendente**: Exibida na página
- **1 = Resolvida**: Não aparece mais (foi importada)
- **2 = Ignorada**: Não aparece mais (foi ignorada)

### Animações CSS
- **pulseGlow**: Botão Sugestão pulsa continuamente
- **ftxLogoPulse**: Logo do overlay de loading (1.5s)
- **buttonWiggle**: Hover dos botões de ação

### Limites e Regras
- ✅ Máximo 500 litros por abastecimento
- ✅ Máximo 1000 km rodados (com validação de consumo)
- ✅ Consumo tolerância: ±40% da média do veículo

---

<br><br><br>

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)
> **PADRÃO**: `## [Data/Hora] - Título da Modificação`

---

## [06/01/2025] - Criação da Documentação Inicial

**Descrição**:
Documentação completa da funcionalidade de Pendências de Abastecimento criada para padronização e referência futura. Inclui:

1. **Visão Geral**: Características principais e relação com a funcionalidade de Importação
2. **Arquitetura**: Estrutura de arquivos e tecnologias utilizadas
3. **Fluxo de Operação**: Diagramas e explicações de como os dados fluem
4. **Cards de Resumo**: Descrição detalhada dos 5 cards de filtro e seus estados
5. **Tipos de Pendência**: Tabela com todos os tipos (7 tipos diferentes)
6. **Ações Disponíveis**: Descrição de cada botão (Sugestão, Editar, Excluir)
7. **Sistema de Sugestões**: Como as sugestões funcionam e dois modos de aplicar
8. **Endpoints API**: 8 endpoints documentados com request/response completo
9. **Frontend**: Estrutura HTML dos componentes principais e JavaScript
10. **Validações**: Validações aplicadas ao resolver/importar pendências
11. **Troubleshooting**: 6 problemas comuns e suas soluções

**Status**: ✅ **Documentado**

**Escopo Coberto**:
- Página: `/Abastecimento/Pendencias`
- Arquivos: `Pendencias.cshtml`, `Pendencias.cshtml.cs`, `AbastecimentoController.Pendencias.cs`
- Modelo: `AbastecimentoPendente.cs`
- Endpoints: 8 (Listar, Contar, Obter, Salvar, Resolver, Aplicar Sugestão, Excluir, Excluir Todas)
- Modais: 2 (Edição, Sugestão)
- Cards de Filtro: 5 (Total, Veículo, Motorista, Quilometragem, Corrigíveis)

---

**Fim do LOG**

---

**Última atualização deste arquivo**: 06/01/2025
**Responsável pela documentação**: Claude (AI Assistant)
**Versão do documento**: 1.0
