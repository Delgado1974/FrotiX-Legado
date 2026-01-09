# Documentação: Contrato - Gestão (Index)

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Estrutura de Arquivos](#estrutura-de-arquivos)
4. [Lógica de Negócio](#lógica-de-negócio)
5. [Interconexões](#interconexões)
6. [Estrutura da Interface](#estrutura-da-interface)
7. [DataTable e Configurações](#datatable-e-configurações)
8. [Sistema de Gestão de Status](#sistema-de-gestão-de-status)
9. [Sistema de Exclusão com Validação](#sistema-de-exclusão-com-validação)
10. [Lógica de Frontend (JavaScript)](#lógica-de-frontend-javascript)
11. [Endpoints API](#endpoints-api)
12. [Validações](#validações)
13. [Exemplos de Uso](#exemplos-de-uso)
14. [Troubleshooting](#troubleshooting)

---

## Visão Geral

A página de **Listagem de Contratos** (`Pages/Contrato/Index.cshtml`) é o **ponto de entrada central** para o gerenciamento completo de contratos no sistema FrotiX. Ela exibe todos os contratos cadastrados em uma tabela interativa rica, permitindo visualizar informações financeiras, gerenciar status, acessar documentos e realizar operações CRUD básicas.

### Objetivo

A página de Contratos permite que os usuários:
- **Visualizem** todos os contratos cadastrados com informações financeiras e de vigência
- **Gerenciem** status (Ativo/Inativo) diretamente da listagem
- **Acessem** documentos, itens e repactuações de cada contrato
- **Editem** contratos através de link para página de edição
- **Excluam** contratos com validação inteligente de dependências
- **Exportem** dados para Excel e PDF
- **Filtrem** e **ordenem** dados usando recursos nativos do DataTable

### Características Principais

- ✅ **Visão Geral Rica**: Tabela com resumo financeiro (valores anual/mensal), prazos de vigência e informações de processo
- ✅ **Ações Múltiplas**: Botões para editar, ver documentos, gerenciar itens, repactuar e excluir
- ✅ **Status Inteligente**: Indicação visual de contratos ativos e inativos com bloqueio automático de ações quando inativo
- ✅ **Validação de Dependências**: Sistema avançado que verifica veículos, motoristas, encarregados, operadores, lavadores, empenhos e notas fiscais antes de permitir exclusão
- ✅ **Exportação de Dados**: Botões para exportar para Excel e PDF
- ✅ **Layout Responsivo**: Tabela adaptável para diferentes tamanhos de tela

---

## Arquitetura

### Visão Geral da Arquitetura

A página de Contratos utiliza uma arquitetura **simples mas robusta**, focada em:
- **Backend (ASP.NET Core Razor Pages)**: Renderização da página
- **Frontend (JavaScript)**: Lógica de tabela e validações de dependências
- **API RESTful**: Endpoints para busca de dados e operações
- **DataTables**: Componente de tabela interativa

### Padrões de Design Utilizados

1. **Repository Pattern**: Acesso a dados através de `IUnitOfWork` e repositórios específicos
2. **API RESTful**: Comunicação padronizada entre frontend e backend
3. **Dependency Injection**: Serviços injetados via construtor no backend
4. **Validação em Duas Camadas**: Frontend (UX) e Backend (Segurança)

---

## Estrutura de Arquivos

### Arquivos Principais

```
FrotiX.Site/
├── Pages/
│   └── Contrato/
│       ├── Index.cshtml              # View Principal (324+ linhas)
│       │                             # - HTML da tabela
│       │                             # - Estilos CSS customizados
│       │                             # - Scripts inline
│       │
│       └── Index.cshtml.cs          # PageModel (Backend Init)
│                                     # - Inicialização básica
│
├── Controllers/
│   └── ContratoController.cs        # API Controller (1190+ linhas)
│                                     # - Get: Lista todos os contratos
│                                     # - Delete: Exclui contrato com validações
│                                     # - UpdateStatusContrato: Atualiza status
│                                     # - VerificarDependencias: Valida dependências
│
├── wwwroot/
│   └── js/
│       └── cadastros/
│           └── contrato.js          # Lógica do DataTable (369 linhas)
│                                     # - Inicialização da tabela
│                                     # - Gestão de status
│                                     # - Validação de dependências antes de excluir
│                                     # - Handlers de eventos
│
└── Models/
    └── Cadastros/
        └── Contrato.cs              # Modelo principal de contrato
```

### Arquivos Relacionados

- `Repository/ContratoRepository.cs` - Acesso a dados de contratos
- `Repository/VeiculoContratoRepository.cs` - Acesso a veículos do contrato
- `Repository/MotoristaContratoRepository.cs` - Acesso a motoristas do contrato
- `Repository/EncarregadoContratoRepository.cs` - Acesso a encarregados do contrato
- `Repository/OperadorContratoRepository.cs` - Acesso a operadores do contrato
- `Repository/LavadorContratoRepository.cs` - Acesso a lavadores do contrato
- `Repository/EmpenhoRepository.cs` - Acesso a empenhos
- `Repository/NotaFiscalRepository.cs` - Acesso a notas fiscais

### Tecnologias Utilizadas

| Tecnologia | Versão | Uso Específico |
|------------|--------|----------------|
| **jQuery DataTables** | Latest | Tabela interativa com paginação, ordenação e exportação |
| **ASP.NET Core** | 3.1+ | Backend Razor Pages, Dependency Injection |
| **jQuery** | 3.6.0 | Manipulação DOM, AJAX, Event Handlers |
| **Bootstrap** | 5.x | Layout Responsivo |
| **Font Awesome Duotone** | Latest | Ícones e badges visuais |
| **SweetAlert2** | Latest | Confirmações elegantes e alertas |
| **Toastr** | Latest | Notificações flutuantes |

---

## Lógica de Negócio

### Fluxo Principal de Carregamento

O processo de carregamento da página segue este fluxo:

```
1. Página carrega (OnGet)
   ↓
2. Frontend inicializa DataTable chamando loadList()
   ↓
3. Requisição AJAX para /api/contrato (GET)
   ↓
4. Backend retorna todos os contratos com JOIN em Fornecedor
   ↓
5. Backend formata dados (valores, datas, vigência completa)
   ↓
6. DataTable renderiza dados na tabela
   ↓
7. Event handlers são registrados para ações
```

### Estados de um Contrato

Um contrato pode estar em um dos seguintes estados:

| Status | Descrição | Cor no Badge | Ações Bloqueadas |
|--------|-----------|--------------|------------------|
| **Ativo** | Contrato em vigor | 🟢 Verde | Nenhuma |
| **Inativo** | Contrato encerrado ou suspenso | ⚫ Cinza | Documentos, Itens, Repactuação |

**Comportamento Especial**: Quando um contrato está inativo, os botões de Documentos, Itens e Repactuação são automaticamente desabilitados (opacidade reduzida, pointer-events: none).

### Processo de Alteração de Status

Quando o status de um contrato é alterado:

1. **Usuário clica** no badge de status na tabela
2. **Requisição AJAX** para `/api/Contrato/UpdateStatusContrato?Id=guid`
3. **Backend inverte** o status (true ↔ false)
4. **Atualiza** registro no banco
5. **Retorna** novo status e mensagem
6. **Frontend atualiza** badge visualmente
7. **Frontend bloqueia/desbloqueia** botões de ação conforme novo status

---

## Interconexões

### Quem Chama Este Módulo

A página de Contratos é chamada por:
- **Navegação Principal**: Link no menu lateral (`/Contrato`)
- **Página de Veículos**: Links para ver contrato do veículo
- **Página de Motoristas**: Links para ver contrato do motorista

### O Que Este Módulo Chama

#### Backend (Controllers)

**ContratoController.cs** chama:
- `_unitOfWork.Contrato.GetAll()` - Busca todos os contratos
- `_unitOfWork.Fornecedor.GetAll()` - JOIN para dados do fornecedor
- `_unitOfWork.Contrato.GetFirstOrDefault()` - Busca contrato específico
- `_unitOfWork.Veiculo.GetFirstOrDefault()` - Verifica veículos associados
- `_unitOfWork.Empenho.GetFirstOrDefault()` - Verifica empenhos associados
- `_unitOfWork.RepactuacaoContrato.*` - Gerencia repactuações
- `_unitOfWork.ItemVeiculoContrato.*` - Gerencia itens de repactuação
- `_unitOfWork.Contrato.Update()` - Atualiza status
- `_unitOfWork.Contrato.Remove()` - Remove contrato
- `_unitOfWork.Save()` - Persiste alterações

#### Frontend (JavaScript)

**contrato.js** chama:
- `loadList()` - Inicializa tabela
- `dataTable.ajax.reload()` - Recarrega dados após operações
- `Alerta.Confirmar()` - Confirmação antes de excluir
- `Alerta.Warning()` - Aviso sobre dependências
- `AppToast.show()` - Notificações de sucesso/erro

### Fluxo de Dados Completo

```
┌─────────────────────────────────────────────────────────────┐
│                    USUÁRIO                                   │
│              (Interação com Interface)                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND (JavaScript)                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ contrato.js                                           │  │
│  │ - Inicialização do DataTable                         │  │
│  │ - Validação de dependências                          │  │
│  │ - Gestão de status                                   │  │
│  └───────────────┬──────────────────────────────────────┘  │
│                  │                                          │
│  ┌───────────────▼──────────────────────────────────────┐  │
│  │ jQuery DataTable                                      │  │
│  │ - Renderização da tabela                             │  │
│  │ - Paginação e ordenação                              │  │
│  └───────────────┬──────────────────────────────────────┘  │
│                  │                                          │
│  ┌───────────────▼──────────────────────────────────────┐  │
│  │ AJAX Requests                                        │  │
│  │ - GET /api/contrato                                  │  │
│  │ - GET /api/Contrato/VerificarDependencias           │  │
│  │ - GET /api/Contrato/UpdateStatusContrato            │  │
│  │ - POST /api/Contrato/Delete                         │  │
│  └───────────────┬──────────────────────────────────────┘  │
└──────────────────┼──────────────────────────────────────────┘
                   │ HTTP (REST API)
                   ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND (ASP.NET Core)                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ContratoController.cs                                 │  │
│  │ - Validações de dependências                         │  │
│  │ - Formatação de dados                                │  │
│  │ - Processamento de exclusão                          │  │
│  └───────────────┬──────────────────────────────────────┘  │
│                  │                                          │
│  ┌───────────────▼──────────────────────────────────────┐  │
│  │ IUnitOfWork                                           │  │
│  │ - Abstração de acesso a dados                        │  │
│  └───────────────┬──────────────────────────────────────┘  │
│                  │                                          │
│  ┌───────────────▼──────────────────────────────────────┐  │
│  │ Múltiplos Repositories                               │  │
│  │ - ContratoRepository                                 │  │
│  │ - VeiculoContratoRepository                          │  │
│  │ - MotoristaContratoRepository                        │  │
│  │ - EmpenhoRepository, etc.                           │  │
│  └───────────────┬──────────────────────────────────────┘  │
│                  │                                          │
│  ┌───────────────▼──────────────────────────────────────┐  │
│  │ FrotiXDbContext                                       │  │
│  │ - Entity Framework Core                              │  │
│  │ - Acesso ao banco de dados                           │  │
│  └───────────────┬──────────────────────────────────────┘  │
└──────────────────┼──────────────────────────────────────────┘
                   │ SQL
                   ▼
┌─────────────────────────────────────────────────────────────┐
│              BANCO DE DADOS (SQL Server)                    │
│  - Tabela: Contrato                                         │
│  - Tabelas relacionadas: VeiculoContrato, MotoristaContrato, │
│    EncarregadoContrato, OperadorContrato, LavadorContrato,  │
│    Empenho, NotaFiscal, RepactuacaoContrato                │
└─────────────────────────────────────────────────────────────┘
```

---

## Estrutura da Interface

### Layout da Página

A página é dividida em **2 seções principais**:

1. **Header com Botão de Ação**: Botão "Adicionar Contrato" (link para página de cadastro)
2. **Tabela de Dados**: DataTable com 10 colunas

### Tabela Principal

A tabela é renderizada com classes Bootstrap e estilos customizados FrotiX:

**Estrutura HTML**:
```html
<table id="tblContrato" class="table table-bordered table-striped" width="100%">
    <thead>
        <tr>
            <th>Contrato</th>
            <th>Processo</th>
            <th>Objeto</th>
            <th>Empresa</th>
            <th>Vigência</th>
            <th>(R$) Anual</th>
            <th>(R$) Mensal</th>
            <th>Prorrogação</th>
            <th>Status</th>
            <th>Ação</th>
        </tr>
    </thead>
    <tbody></tbody>
</table>
```

**Estilos Customizados**:
- Header azul (`#325d88`) com texto branco
- Hover nas linhas com cor suave
- Botões de ação centralizados em `ftx-actions`
- Badges de status com cores distintas

---

## DataTable e Configurações

### Inicialização do DataTable

A tabela é inicializada pela função `loadList()`:

**Colunas da Tabela**:

| # | Coluna | Tipo | Descrição |
|---|--------|------|-----------|
| 0 | Contrato | String | Formato "Ano/Número" (ex: "2026/001") |
| 1 | Processo | String | Formato "Número/Ano" (ex: "12345/26") |
| 2 | Objeto | String | Descrição do objeto do contrato |
| 3 | Empresa | String | Nome do fornecedor |
| 4 | Vigência | String | Período formatado "DD/MM/AA a DD/MM/AA" |
| 5 | (R$) Anual | String | Valor anual formatado em moeda |
| 6 | (R$) Mensal | String | Valor mensal calculado (Anual/12) |
| 7 | Prorrogação | String | Formato "Xª vigência + Y prorrog." |
| 8 | Status | HTML | Badge clicável (Ativo/Inativo) |
| 9 | Ação | HTML | Botões (Editar, Excluir, Documentos, Itens, Repactuação) |

**Ordenação Padrão**: Por coluna "Contrato" em ordem decrescente (contratos mais recentes primeiro)

**Renderizadores Customizados**:

#### Renderizador de Status

```javascript
{
    data: "status",
    render: function (data, type, row, meta) {
        if (data) {
            // ATIVO = btn-verde
            return `<a href="javascript:void(0)" 
                       class="updateStatusContrato ftx-badge-status btn-verde" 
                       data-url="/api/Contrato/updateStatusContrato?Id=${row.contratoId}">
                       <i class="fa-duotone fa-circle-check"></i>
                       Ativo
                    </a>`;
        } else {
            // INATIVO = fundo-cinza
            return `<a href="javascript:void(0)" 
                       class="updateStatusContrato ftx-badge-status fundo-cinza" 
                       data-url="/api/Contrato/updateStatusContrato?Id=${row.contratoId}">
                       <i class="fa-duotone fa-circle-xmark"></i>
                       Inativo
                    </a>`;
        }
    }
}
```

#### Renderizador de Ações

A coluna de ações contém **5 botões**:

1. **Editar** (Azul): Link para `/Contrato/Upsert?id=guid`
2. **Excluir** (Vermelho): Botão com validação de dependências
3. **Documentos** (Info/Ciano): Botão desabilitado se inativo
4. **Itens** (Cinza): Link para `/Contrato/ItensContrato?contratoId=guid` (desabilitado se inativo)
5. **Repactuação** (Chocolate): Link para `/Contrato/RepactuacaoContrato?id=guid` (desabilitado se inativo)

**Código**:
```javascript
{
    data: "contratoId",
    render: function (data, type, row) {
        var isInativo = !row.status;
        var disabledClass = isInativo ? 'disabled' : '';
        var disabledStyle = isInativo ? 'pointer-events: none; opacity: 0.5;' : '';
        
        return `<div class="ftx-actions" data-contrato-id="${data}">
                    <a href="/Contrato/Upsert?id=${data}" 
                       class="btn btn-azul btn-icon-28" 
                       data-ejtip="Editar Contrato">
                        <i class="fa-duotone fa-pen-to-square"></i>
                    </a>
                    <a href="javascript:void(0)" 
                       class="btn btn-delete btn-vinho btn-icon-28" 
                       data-ejtip="Excluir Contrato"
                       data-id="${data}">
                        <i class="fa-duotone fa-trash-can"></i>
                    </a>
                    <a href="javascript:void(0)" 
                       class="btn btn-documentos btn-info btn-icon-28 ${disabledClass}" 
                       data-ejtip="Documentos do Contrato"
                       style="${disabledStyle}"
                       data-id="${data}">
                        <i class="fa-duotone fa-file-pdf"></i>
                    </a>
                    <a href="${isInativo ? 'javascript:void(0)' : '/Contrato/ItensContrato?contratoId=' + data}" 
                       class="btn btn-itens fundo-cinza btn-icon-28 ${disabledClass}" 
                       data-ejtip="Itens do Contrato"
                       style="${disabledStyle}"
                       data-id="${data}">
                        <i class="fa-duotone fa-sitemap"></i>
                    </a>
                    <a href="${isInativo ? 'javascript:void(0)' : '/Contrato/RepactuacaoContrato?id=' + data}" 
                       class="btn btn-repactuacao fundo-chocolate btn-icon-28 ${disabledClass}" 
                       data-ejtip="Adicionar Repactuação"
                       style="${disabledStyle}"
                       data-id="${data}">
                        <i class="fa-duotone fa-handshake"></i>
                    </a>
                </div>`;
    }
}
```

---

## Sistema de Gestão de Status

### Funcionamento Detalhado

O sistema permite alternar status diretamente na tabela com bloqueio automático de ações:

**Event Handler**:
```javascript
$(document).on("click", ".updateStatusContrato", function () {
    const url = $(this).data("url");
    const currentElement = $(this);
    const row = currentElement.closest('tr');
    
    $.get(url, function (data) {
        if (data.success) {
            AppToast.show('Verde', "Status alterado com sucesso!");
            
            // Botões que devem ser bloqueados/desbloqueados
            var botoesBloqueaveis = row.find('.btn-documentos, .btn-itens, .btn-repactuacao');
            
            if (currentElement.hasClass("btn-verde")) {
                // Era Ativo, agora é Inativo - BLOQUEAR botões
                currentElement
                    .removeClass("btn-verde")
                    .addClass("fundo-cinza")
                    .html('<i class="fa-duotone fa-circle-xmark"></i> Inativo');
                
                botoesBloqueaveis
                    .addClass('disabled')
                    .css({ 'pointer-events': 'none', 'opacity': '0.5' });
                
                row.find('.btn-repactuacao').attr('href', 'javascript:void(0)');
            } else {
                // Era Inativo, agora é Ativo - DESBLOQUEAR botões
                currentElement
                    .removeClass("fundo-cinza")
                    .addClass("btn-verde")
                    .html('<i class="fa-duotone fa-circle-check"></i> Ativo');
                
                botoesBloqueaveis
                    .removeClass('disabled')
                    .css({ 'pointer-events': '', 'opacity': '' });
                
                const contratoId = row.find('.btn-repactuacao').data('id');
                row.find('.btn-repactuacao').attr('href', '/Contrato/RepactuacaoContrato?id=' + contratoId);
            }
        }
    });
});
```

**Características**:
- Atualização visual sem recarregar tabela
- Bloqueio/desbloqueio automático de botões conforme status
- Restauração de links quando contrato é ativado
- Feedback imediato ao usuário

---

## Sistema de Exclusão com Validação

### Funcionamento Detalhado

O sistema possui exclusão inteligente que verifica dependências antes de permitir exclusão:

**Fluxo de Exclusão**:

```
1. Usuário clica no botão "Excluir"
   ↓
2. Sistema chama GET /api/Contrato/VerificarDependencias?id=guid
   ↓
3. Backend verifica todas as dependências:
   - Veículos associados
   - Motoristas vinculados
   - Encarregados vinculados
   - Operadores vinculados
   - Lavadores vinculados
   - Empenhos vinculados
   - Notas fiscais vinculadas
   ↓
4. Se possui dependências:
   - Mostra alerta com detalhes
   - Bloqueia exclusão
   ↓
5. Se não possui dependências:
   - Mostra confirmação SweetAlert
   - Se confirmado, envia POST /api/Contrato/Delete
   ↓
6. Backend exclui repactuações e itens relacionados
   ↓
7. Backend exclui contrato
   ↓
8. Tabela recarrega
```

**Código de Validação de Dependências**:
```javascript
$(document).on("click", ".btn-delete", function () {
    const id = $(this).data("id");
    
    // Primeiro verifica se há dependências
    $.ajax({
        url: "/api/Contrato/VerificarDependencias?id=" + id,
        type: "GET",
        dataType: "json",
        success: function (result) {
            if (result.success && result.possuiDependencias) {
                // Não pode excluir - mostrar mensagem com detalhes
                var mensagem = "Este contrato não pode ser excluído pois possui:\n\n";
                
                if (result.veiculosContrato > 0) {
                    mensagem += "• " + result.veiculosContrato + " veículo(s) associado(s)\n";
                }
                if (result.motoristas > 0) {
                    mensagem += "• " + result.motoristas + " motorista(s) vinculado(s)\n";
                }
                // ... outros tipos de dependências ...
                
                mensagem += "\nRemova as associações antes de excluir o contrato.";
                
                Alerta.Warning("Exclusão não permitida", mensagem);
            } else {
                // Pode excluir - mostrar confirmação
                Alerta.Confirmar(
                    "Você tem certeza que deseja apagar este contrato?",
                    "Não será possível recuperar os dados eliminados!",
                    "Excluir",
                    "Cancelar"
                ).then((willDelete) => {
                    if (willDelete) {
                        // Enviar requisição de exclusão
                    }
                });
            }
        }
    });
});
```

**Tipos de Dependências Verificadas**:
1. **Veículos**: Tabela `VeiculoContrato`
2. **Motoristas**: Tabela `MotoristaContrato`
3. **Encarregados**: Tabela `EncarregadoContrato`
4. **Operadores**: Tabela `OperadorContrato`
5. **Lavadores**: Tabela `LavadorContrato`
6. **Empenhos**: Tabela `Empenho`
7. **Notas Fiscais**: Tabela `NotaFiscal`

---

## Lógica de Frontend (JavaScript)

O arquivo `contrato.js` (369 linhas) gerencia toda a interatividade da página.

### 1. Inicialização do DataTable

A função `loadList()` é chamada quando o documento está pronto:

```javascript
$(document).ready(function () {
    loadList();
    // ... event handlers ...
});
```

**Configurações Principais**:
- **order**: `[[0, "desc"]]` - Ordena por primeira coluna (Contrato) decrescente
- **responsive**: `true` - Tabela adaptável para mobile
- **language**: Português Brasil via CDN
- **columnDefs**: Larguras e alinhamentos específicos por coluna

### 2. Gestão de Status

Ver seção "Sistema de Gestão de Status" acima.

### 3. Exclusão com Validação

Ver seção "Sistema de Exclusão com Validação" acima.

---

## Endpoints API

O controller `ContratoController.cs` gerencia todas as operações relacionadas aos contratos através de uma API RESTful.

### 1. GET `/api/contrato`

**Descrição**: Retorna a lista completa de contratos com dados formatados.

**Parâmetros**: Nenhum

**Response** (JSON compatível com DataTables):
```json
{
  "data": [
    {
      "contratoCompleto": "2026/001",
      "processoCompleto": "12345/26",
      "objeto": "Locação de veículos",
      "descricaoFornecedor": "Empresa XYZ",
      "periodo": "01/01/26 a 31/12/26",
      "valorFormatado": "R$ 1.200.000,00",
      "valorMensal": "R$ 100.000,00",
      "vigenciaCompleta": "1ª vigência + 0 prorrog.",
      "status": true,
      "contratoId": "guid"
    }
  ]
}
```

**Lógica de Formatação**:

O endpoint faz JOIN com Fornecedor e formata os dados:

```csharp
var result = (
    from c in _unitOfWork.Contrato.GetAll()
    join f in _unitOfWork.Fornecedor.GetAll()
        on c.FornecedorId equals f.FornecedorId
    orderby c.AnoContrato descending
    select new
    {
        ContratoCompleto = c.AnoContrato + "/" + c.NumeroContrato,
        ProcessoCompleto = c.NumeroProcesso + "/" + c.AnoProcesso.ToString().Substring(2, 2),
        c.Objeto,
        f.DescricaoFornecedor,
        Periodo = c.DataInicio?.ToString("dd/MM/yy") + " a " + c.DataFim?.ToString("dd/MM/yy"),
        ValorFormatado = c.Valor?.ToString("C"),
        ValorMensal = (c.Valor / 12)?.ToString("C"),
        VigenciaCompleta = c.Vigencia + "ª vigência + " + c.Prorrogacao + " prorrog.",
        c.Status,
        c.ContratoId
    }
).ToList().OrderByDescending(c => c.ContratoCompleto);
```

**Características**:
- Formata valores em moeda brasileira (`ToString("C")`)
- Calcula valor mensal automaticamente (Anual / 12)
- Formata datas em padrão brasileiro (DD/MM/AA)
- Monta string de vigência completa

---

### 2. GET `/api/Contrato/VerificarDependencias`

**Descrição**: Verifica se um contrato possui dependências que impedem sua exclusão.

**Parâmetros de Query**:
- `id` (Guid, obrigatório): ID do contrato

**Response**:
```json
{
  "success": true,
  "possuiDependencias": true,
  "veiculosContrato": 5,
  "motoristas": 3,
  "encarregados": 2,
  "operadores": 1,
  "lavadores": 0,
  "empenhos": 2,
  "notasFiscais": 1
}
```

**Lógica**:
- Conta registros em cada tabela relacionada
- Retorna quantidade de cada tipo de dependência
- `possuiDependencias = true` se qualquer contagem > 0

**Uso**: Chamado antes de mostrar confirmação de exclusão para informar ao usuário quais dependências existem.

---

### 3. POST `/api/Contrato/Delete`

**Descrição**: Exclui um contrato do sistema, incluindo repactuações e itens relacionados.

**Request Body** (JSON):
```json
{
  "ContratoId": "guid-do-contrato"
}
```

**Validações Executadas**:
1. Verifica se contrato existe
2. Verifica se há veículos associados (tabela `Veiculo`)
3. Verifica se há empenhos associados (tabela `Empenho`)

**Processamento**:
1. Busca todas as repactuações do contrato
2. Para cada repactuação:
   - Remove todos os itens de veículo (`ItemVeiculoContrato`)
   - Remove a repactuação (`RepactuacaoContrato`)
3. Remove o contrato

**Response**:
```json
{
  "success": true,
  "message": "Contrato removido com sucesso"
}
```

**Código**:
```csharp
[Route("Delete")]
[HttpPost]
public IActionResult Delete(ContratoViewModel model)
{
    // Validações de veículos e empenhos...
    
    // Remove repactuações e itens
    var objRepactuacao = _unitOfWork.RepactuacaoContrato.GetAll(riv =>
        riv.ContratoId == model.ContratoId
    );
    foreach (var repactuacao in objRepactuacao)
    {
        var objItemRepactuacao = _unitOfWork.ItemVeiculoContrato.GetAll(ivc =>
            ivc.RepactuacaoContratoId == repactuacao.RepactuacaoContratoId
        );
        foreach (var itemveiculo in objItemRepactuacao)
        {
            _unitOfWork.ItemVeiculoContrato.Remove(itemveiculo);
        }
        _unitOfWork.RepactuacaoContrato.Remove(repactuacao);
    }
    
    _unitOfWork.Contrato.Remove(objFromDb);
    _unitOfWork.Save();
    
    return Json(new
    {
        success = true,
        message = "Contrato removido com sucesso"
    });
}
```

---

### 4. GET `/api/Contrato/UpdateStatusContrato`

**Descrição**: Alterna o status de um contrato entre Ativo e Inativo.

**Parâmetros de Query**:
- `Id` (Guid, obrigatório): ID do contrato

**Response**:
```json
{
  "success": true,
  "message": "Atualizado Status do Contrato [Nome: 2026/001] (Ativo)",
  "type": 0
}
```

**Lógica**: Similar ao endpoint de Motorista, inverte status e retorna tipo (0=Ativo, 1=Inativo).

---

## Validações

### Validações Frontend

1. **Confirmação de Exclusão**: Obrigatória antes de excluir contrato
2. **Validação de Dependências**: Verifica dependências antes de mostrar confirmação
3. **Validação de ID**: Verifica se ID é válido antes de requisições

### Validações Backend

1. **Contrato existe**: Verifica se contrato existe antes de operações
2. **Dependências**: Verifica veículos e empenhos antes de excluir
3. **ID válido**: Valida que ID não é Guid.Empty
4. **Integridade Referencial**: Mantém integridade ao excluir repactuações e itens relacionados

---

## Exemplos de Uso

### Exemplo 1: Visualizar Todos os Contratos

**Situação**: Usuário quer ver todos os contratos cadastrados.

**Passos**:
1. Acessa página `/Contrato`
2. Tabela carrega automaticamente mostrando todos os contratos
3. Pode filtrar usando campo de busca do DataTable
4. Pode ordenar clicando nos headers das colunas

**O que acontece**:
- Backend retorna todos os contratos com JOIN em Fornecedor
- Dados são formatados (valores, datas, vigência)
- DataTable renderiza com paginação (10 por página por padrão)

### Exemplo 2: Inativar Contrato

**Situação**: Usuário quer inativar um contrato que expirou.

**Passos**:
1. Localiza contrato na tabela
2. Clica no badge verde "Ativo"
3. Status muda para "Inativo" (cinza)
4. Botões de Documentos, Itens e Repactuação são automaticamente desabilitados

**O que acontece**:
- Requisição AJAX para `/api/Contrato/UpdateStatusContrato`
- Backend inverte status no banco
- Frontend atualiza badge e bloqueia botões visualmente
- Toast de sucesso é exibido

### Exemplo 3: Tentar Excluir Contrato com Dependências

**Situação**: Usuário tenta excluir um contrato que tem veículos associados.

**Passos**:
1. Localiza contrato na tabela
2. Clica no botão vermelho de excluir
3. Sistema verifica dependências
4. Mostra alerta informando que há 5 veículos associados
5. Exclusão é bloqueada

**O que acontece**:
- Requisição GET para `/api/Contrato/VerificarDependencias`
- Backend conta dependências
- Frontend mostra alerta detalhado
- Usuário precisa remover associações primeiro

### Exemplo 4: Excluir Contrato sem Dependências

**Situação**: Usuário quer excluir um contrato que não tem nenhuma dependência.

**Passos**:
1. Localiza contrato na tabela
2. Clica no botão de excluir
3. Sistema verifica dependências (nenhuma encontrada)
4. Mostra confirmação SweetAlert
5. Usuário confirma
6. Contrato é excluído junto com repactuações e itens

**O que acontece**:
- Validação de dependências retorna `possuiDependencias: false`
- Confirmação é exibida
- Requisição POST para `/api/Contrato/Delete`
- Backend exclui repactuações, itens e contrato
- Tabela recarrega

---

## Troubleshooting

### Problema 1: Tabela não carrega

**Sintoma**: Tabela aparece vazia ou com mensagem "Carregando..."

**Causas Possíveis**:
1. Erro no endpoint `/api/contrato` (500 Internal Server Error)
2. Problema de serialização JSON (valores muito grandes)
3. Erro JavaScript que impede inicialização do DataTable

**Solução**:
- Verificar logs do servidor
- Verificar Network Tab para erros na requisição
- Verificar console do navegador por erros JavaScript

---

### Problema 2: Valores formatados incorretamente

**Sintoma**: Valores aparecem sem formatação ou formato incorreto.

**Causas Possíveis**:
1. Configuração regional do servidor diferente
2. Dados não numéricos no banco
3. Problema no `ToString("C")` do C#

**Solução**:
- Verificar formato dos valores no banco de dados
- Verificar cultura do servidor (deve ser pt-BR)
- Verificar se valores são realmente numéricos

---

### Problema 3: Status não atualiza visualmente

**Sintoma**: Clica no badge de status, requisição retorna sucesso, mas badge não muda.

**Causas Possíveis**:
1. Classes CSS não estão sendo aplicadas
2. Elemento foi removido/recriado pelo DataTable
3. Event handler não está atualizando elemento correto

**Solução**:
- Verificar se classes `btn-verde` e `fundo-cinza` existem no CSS
- Verificar se `currentElement` está referenciando elemento correto
- Verificar se `row` está sendo encontrado corretamente

---

### Problema 4: Botões não bloqueiam quando inativo

**Sintoma**: Contrato está inativo mas botões ainda estão habilitados.

**Causas Possíveis**:
1. Renderizador não está aplicando classes/styles corretamente
2. Status não está sendo lido corretamente do backend

**Solução**:
- Verificar se `row.status` está sendo lido corretamente
- Verificar se classes `disabled` e styles estão sendo aplicados
- Verificar se `href` está sendo alterado para `javascript:void(0)`

---

### Problema 5: Validação de dependências não funciona

**Sintoma**: Tenta excluir contrato com dependências mas não mostra aviso.

**Causas Possíveis**:
1. Endpoint `/api/Contrato/VerificarDependencias` não existe ou retorna erro
2. Lógica de verificação não está funcionando corretamente

**Solução**:
- Verificar se endpoint existe no controller
- Verificar Network Tab para erros na requisição
- Verificar se resposta está no formato esperado

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [08/01/2026] - Expansão Completa da Documentação

**Descrição**:
Documentação expandida de ~143 linhas para mais de 700 linhas, incluindo:
- Detalhamento completo da arquitetura e estrutura de arquivos
- Explicação detalhada do sistema de validação de dependências
- Documentação completa do sistema de gestão de status com bloqueio de ações
- Explicação do renderizador de ações com bloqueio condicional
- Documentação completa de todos os endpoints API
- Validações frontend e backend documentadas
- Exemplos práticos de uso
- Troubleshooting expandido com 5 problemas comuns e soluções

**Arquivos Afetados**:
- `Documentacao/Pages/Contrato - Index.md` (expansão completa)

**Status**: ✅ **Documentado e Expandido**

**Responsável**: Claude (AI Assistant)
**Versão**: 2.0

---

## [06/01/2026] - Criação da Documentação Inicial

**Descrição**:
Documentação inicial da listagem de Contratos (Index).

**Status**: ✅ **Documentado**

**Responsável**: Claude (AI Assistant)
**Versão**: 1.0

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [06/01/2026] - Criação da Documentação

**Descrição**:
Documentação inicial da listagem de Contratos (Index).

**Status**: ✅ **Documentado**

**Responsável**: Claude (AI Assistant)
**Versão**: 1.0
