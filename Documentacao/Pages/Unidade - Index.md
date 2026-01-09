# Documentação: Unidade - Gestão (Index)

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
8. [Lógica de Frontend (JavaScript)](#lógica-de-frontend-javascript)
9. [Endpoints API](#endpoints-api)
10. [Validações](#validações)
11. [Exemplos de Uso](#exemplos-de-uso)
12. [Troubleshooting](#troubleshooting)

---

## Visão Geral

A página de **Listagem de Unidades** (`Pages/Unidade/Index.cshtml`) é o **ponto de entrada** para o gerenciamento de unidades organizacionais (departamentos, secretarias, setores, etc.) no sistema FrotiX. Ela exibe todas as unidades cadastradas em uma tabela interativa, permitindo visualizar informações de contato, gerenciar status e acessar funcionalidades relacionadas.

### Objetivo

A página de Unidades permite que os usuários:
- **Visualizem** todas as unidades organizacionais cadastradas
- **Gerenciem** status (Ativo/Inativo) diretamente da listagem
- **Visualizem** informações de contato (primeiro, segundo, terceiro contato)
- **Acessem** funcionalidades relacionadas (lotação de motoristas, veículos da unidade)
- **Editem** unidades através de link para página de edição
- **Exportem** dados para Excel e PDF

### Características Principais

- ✅ **Listagem Resumida**: Exibe Sigla, Nome, Primeiro Contato, Ponto e Ramal
- ✅ **Status Visual**: Indicador claro de unidade ativa ou inativa com badges coloridos
- ✅ **Ações Múltiplas**: Botões para editar, ver lotações de motoristas e veículos da unidade
- ✅ **Informações de Contato**: Exibe até 3 contatos principais com pontos e ramais
- ✅ **Exportação de Dados**: Botões para exportar para Excel e PDF
- ✅ **Layout Responsivo**: Tabela adaptável para diferentes tamanhos de tela

---

## Arquitetura

### Visão Geral da Arquitetura

A página de Unidades utiliza uma arquitetura **simples e direta**, focada em:
- **Backend (ASP.NET Core Razor Pages)**: Renderização da página
- **Frontend (JavaScript)**: Lógica de tabela e interações
- **API RESTful**: Endpoints para busca de dados e operações
- **DataTables**: Componente de tabela interativa

### Padrões de Design Utilizados

1. **Repository Pattern**: Acesso a dados através de `IUnitOfWork` e repositórios específicos
2. **API RESTful**: Comunicação padronizada entre frontend e backend
3. **Dependency Injection**: Serviços injetados via construtor no backend

---

## Estrutura de Arquivos

### Arquivos Principais

```
FrotiX.Site/
├── Pages/
│   └── Unidade/
│       ├── Index.cshtml              # View Principal
│       │                             # - HTML da tabela
│       │                             # - Estilos CSS customizados
│       │
│       └── Index.cshtml.cs          # PageModel (Backend Init)
│                                     # - Inicialização básica
│
├── Controllers/
│   └── UnidadeController.cs         # API Controller (466+ linhas)
│                                     # - Get: Lista todas as unidades
│                                     # - Delete: Exclui unidade
│                                     # - UpdateStatus: Atualiza status
│                                     # - ListaLotacao: Lista lotações de motoristas
│                                     # - LotaMotorista: Cria lotação
│
├── wwwroot/
│   └── js/
│       └── cadastros/
│           └── unidade.js           # Lógica do DataTable
│                                     # - Inicialização da tabela
│                                     # - Gestão de status
│                                     # - Handlers de eventos
│
└── Models/
    └── Cadastros/
        └── Unidade.cs               # Modelo principal de unidade
```

### Arquivos Relacionados

- `Repository/UnidadeRepository.cs` - Acesso a dados de unidades
- `Repository/LotacaoMotoristaRepository.cs` - Acesso a lotações de motoristas
- `Pages/Unidade/LotacaoMotoristas.cshtml` - Página de gestão de lotações
- `Pages/Unidade/VeiculosUnidade.cshtml` - Página de veículos da unidade

### Tecnologias Utilizadas

| Tecnologia | Versão | Uso Específico |
|------------|--------|----------------|
| **jQuery DataTables** | Latest | Tabela interativa com paginação, ordenação e exportação |
| **ASP.NET Core** | 3.1+ | Backend Razor Pages, Dependency Injection |
| **jQuery** | 3.6.0 | Manipulação DOM, AJAX, Event Handlers |
| **Bootstrap** | 5.x | Layout Responsivo |
| **Font Awesome Duotone** | Latest | Ícones e badges visuais |
| **SweetAlert2** | Latest | Confirmações elegantes |
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
3. Requisição AJAX para /api/unidade (GET)
   ↓
4. Backend retorna todas as unidades
   ↓
5. DataTable renderiza dados na tabela
   ↓
6. Event handlers são registrados para ações
```

### Estados de uma Unidade

Uma unidade pode estar em um dos seguintes estados:

| Status | Descrição | Cor no Badge | Ações Permitidas |
|--------|-----------|--------------|------------------|
| **Ativo** | Unidade ativa e operacional | 🟢 Verde | Editar, Excluir, Ver Veículos, Ver Lotações |
| **Inativo** | Unidade inativada | ⚫ Cinza | Editar, Excluir, Ver Veículos, Ver Lotações |

### Processo de Alteração de Status

Quando o status de uma unidade é alterado:

1. **Usuário clica** no badge de status na tabela
2. **Requisição AJAX** para `/api/Unidade/UpdateStatus?Id=guid`
3. **Backend inverte** o status (true ↔ false)
4. **Atualiza** registro no banco
5. **Retorna** novo status e mensagem
6. **Frontend atualiza** badge visualmente sem recarregar tabela

---

## Interconexões

### Quem Chama Este Módulo

A página de Unidades é chamada por:
- **Navegação Principal**: Link no menu lateral (`/Unidade`)
- **Página de Motoristas**: Links para ver unidade do motorista
- **Página de Veículos**: Links para ver unidade do veículo

### O Que Este Módulo Chama

#### Backend (Controllers)

**UnidadeController.cs** chama:
- `_unitOfWork.Unidade.GetAll()` - Busca todas as unidades
- `_unitOfWork.Unidade.GetFirstOrDefault()` - Busca unidade específica
- `_unitOfWork.Veiculo.GetFirstOrDefault()` - Verifica veículos associados
- `_unitOfWork.Unidade.Update()` - Atualiza status
- `_unitOfWork.Unidade.Remove()` - Remove unidade
- `_unitOfWork.Save()` - Persiste alterações

#### Frontend (JavaScript)

**unidade.js** chama:
- `loadList()` - Inicializa tabela
- `dataTable.ajax.reload()` - Recarrega dados após operações
- `Alerta.Confirmar()` - Confirmação antes de excluir
- `AppToast.show()` - Notificações de sucesso/erro

---

## Estrutura da Interface

### Layout da Página

A página é dividida em **2 seções principais**:

1. **Header com Botão de Ação**: Botão "Adicionar Unidade" (link para página de cadastro)
2. **Tabela de Dados**: DataTable com 7 colunas

### Tabela Principal

A tabela é renderizada com classes Bootstrap e estilos customizados FrotiX:

**Estrutura HTML**:
```html
<table id="tblUnidade" class="table table-bordered table-striped" width="100%">
    <thead>
        <tr>
            <th>Sigla</th>
            <th>Nome da Unidade</th>
            <th>Contato</th>
            <th>Ponto</th>
            <th>Ramal</th>
            <th>Status</th>
            <th>Ação</th>
        </tr>
    </thead>
    <tbody></tbody>
</table>
```

---

## DataTable e Configurações

### Inicialização do DataTable

A tabela é inicializada pela função `loadList()`:

**Colunas da Tabela**:

| # | Coluna | Tipo | Descrição |
|---|--------|------|-----------|
| 0 | Sigla | String | Sigla da unidade (ex: "SP", "RJ") |
| 1 | Nome da Unidade | String | Descrição completa da unidade |
| 2 | Contato | String | Nome do primeiro contato |
| 3 | Ponto | String | Ponto do primeiro contato |
| 4 | Ramal | String | Ramal do primeiro contato |
| 5 | Status | HTML | Badge clicável (Ativo/Inativo) |
| 6 | Ação | HTML | Botões (Editar, Excluir, Veículos) |

**Renderizadores Customizados**:

#### Renderizador de Status

```javascript
{
    data: "status",
    render: function (data, type, row, meta) {
        if (data) {
            // ATIVO = btn-verde
            return '<a href="javascript:void(0)" ' +
                'class="updateStatus btn btn-verde text-white" ' +
                'data-url="/api/Unidade/UpdateStatus?Id=' + row.unidadeId + '" ' +
                'data-ejtip="Unidade ativa - clique para inativar">' +
                'Ativo</a>';
        } else {
            // INATIVO = fundo-cinza
            return '<a href="javascript:void(0)" ' +
                'class="updateStatus btn fundo-cinza text-white text-bold" ' +
                'data-url="/api/Unidade/UpdateStatus?Id=' + row.unidadeId + '" ' +
                'data-ejtip="Unidade inativa - clique para ativar">' +
                'Inativo</a>';
        }
    }
}
```

#### Renderizador de Ações

A coluna de ações contém **3 botões**:

1. **Editar** (Azul): Link para `/Unidade/Upsert?id=guid`
2. **Excluir** (Vermelho): Botão com confirmação
3. **Veículos** (Chocolate): Link para `/Unidade/VeiculosUnidade?id=guid`

**Código**:
```javascript
{
    data: "unidadeId",
    render: function (data) {
        return `<div class="text-center">
            <a href="/Unidade/Upsert?id=${data}" 
               class="btn btn-azul text-white" 
               data-ejtip="Editar unidade">
                <i class="far fa-edit"></i>
            </a>
            <a class="btn-delete btn btn-vinho text-white" 
               data-id="${data}"
               data-ejtip="Excluir unidade">
                <i class="far fa-trash-alt"></i>
            </a>
            <a href="/Unidade/VeiculosUnidade?id=${data}" 
               class="btn fundo-chocolate text-white" 
               data-ejtip="Veículos da unidade">
                <i class="far fa-cars"></i>
            </a>
        </div>`;
    }
}
```

---

## Lógica de Frontend (JavaScript)

O arquivo `unidade.js` (268 linhas) gerencia toda a interatividade da página.

### 1. Inicialização do DataTable

A função `loadList()` é chamada quando o documento está pronto:

```javascript
$(document).ready(function () {
    loadList();
    // ... event handlers ...
});
```

**Configurações Principais**:
- **responsive**: `true` - Tabela adaptável para mobile
- **language**: Português Brasil via CDN
- **columnDefs**: Larguras e alinhamentos específicos por coluna

### 2. Gestão de Status

O sistema permite alternar status diretamente na tabela:

**Event Handler**:
```javascript
$(document).on("click", ".updateStatus", function () {
    const url = $(this).data("url");
    const currentElement = $(this);
    
    $.get(url, function (data) {
        if (data.success) {
            AppToast.show("Verde", "Status alterado com sucesso!", 2000);
            
            if (data.type == 1) {
                // INATIVO
                currentElement.removeClass("btn-verde").addClass("fundo-cinza");
                currentElement.text("Inativo");
            } else {
                // ATIVO
                currentElement.removeClass("fundo-cinza").addClass("btn-verde");
                currentElement.text("Ativo");
            }
        }
    });
});
```

**Características**:
- Atualização visual sem recarregar tabela
- Feedback imediato ao usuário
- Tooltip atualizado dinamicamente

### 3. Exclusão de Unidade

O sistema possui exclusão segura com confirmação:

**Event Handler**:
```javascript
$(document).on("click", ".btn-delete", function () {
    const id = $(this).data("id");
    
    Alerta.Confirmar(
        "Confirmar Exclusão",
        "Você tem certeza que deseja apagar esta unidade? Não será possível recuperar os dados eliminados!",
        "Sim, excluir",
        "Cancelar"
    ).then((confirmed) => {
        if (confirmed) {
            $.ajax({
                url: "/api/Unidade/Delete",
                type: "POST",
                data: JSON.stringify({ UnidadeId: id }),
                contentType: "application/json; charset=utf-8",
                success: function (data) {
                    if (data.success) {
                        AppToast.show("Verde", data.message, 2000);
                        dataTable.ajax.reload();
                    } else {
                        AppToast.show("Vermelho", data.message, 2000);
                    }
                }
            });
        }
    });
});
```

**Validações**:
- Confirmação obrigatória antes de excluir
- Verificação de dependências no backend (veículos)
- Feedback claro sobre sucesso ou erro

---

## Endpoints API

O controller `UnidadeController.cs` gerencia todas as operações relacionadas às unidades através de uma API RESTful.

### 1. GET `/api/unidade`

**Descrição**: Retorna a lista completa de unidades cadastradas.

**Parâmetros**: Nenhum

**Response** (JSON compatível com DataTables):
```json
{
  "data": [
    {
      "unidadeId": "guid",
      "sigla": "SP",
      "descricao": "Secretaria de Planejamento",
      "primeiroContato": "João Silva",
      "pontoPrimeiroContato": "12345",
      "primeiroRamal": "1234",
      "status": true
    }
  ]
}
```

**Lógica de Processamento**:

O endpoint retorna todas as unidades diretamente do repositório:

```csharp
[HttpGet]
public IActionResult Get()
{
    try
    {
        return Json(new
        {
            data = _unitOfWork.Unidade.GetAll()
        });
    }
    catch (Exception error)
    {
        Alerta.TratamentoErroComLinha("UnidadeController.cs", "Get", error);
        return Json(new
        {
            success = false,
            message = "Erro ao carregar dados"
        });
    }
}
```

---

### 2. GET `/api/Unidade/UpdateStatus`

**Descrição**: Alterna o status de uma unidade entre Ativo e Inativo.

**Parâmetros de Query**:
- `Id` (Guid, obrigatório): ID da unidade

**Response**:
```json
{
  "success": true,
  "message": "Atualizado Status da Unidade [Nome: Secretaria de Planejamento] (Ativo)",
  "type": 0
}
```

**Lógica**: Similar ao endpoint de Motorista, inverte status e retorna tipo (0=Ativo, 1=Inativo).

---

### 3. POST `/api/Unidade/Delete`

**Descrição**: Exclui uma unidade do sistema, com validação de dependências.

**Request Body** (JSON):
```json
{
  "UnidadeId": "guid-da-unidade"
}
```

**Validações Executadas**:
1. Verifica se unidade existe
2. **Verifica se há veículos associados** (tabela `Veiculo`)
   - Se houver veículos, **bloqueia exclusão**
   - Retorna mensagem: "Existem veículos associados a essa unidade"

**Response**:
```json
{
  "success": true,
  "message": "Unidade removida com sucesso"
}
```

**Código**:
```csharp
[Route("Delete")]
[HttpPost]
public IActionResult Delete(UnidadeViewModel model)
{
    try
    {
        if (model != null && model.UnidadeId != Guid.Empty)
        {
            var objFromDb = _unitOfWork.Unidade.GetFirstOrDefault(u =>
                u.UnidadeId == model.UnidadeId
            );
            
            if (objFromDb != null)
            {
                // Verifica se há veículos associados
                var veiculo = _unitOfWork.Veiculo.GetFirstOrDefault(u =>
                    u.UnidadeId == model.UnidadeId
                );
                
                if (veiculo != null)
                {
                    return Json(new
                    {
                        success = false,
                        message = "Existem veículos associados a essa unidade"
                    });
                }
                
                _unitOfWork.Unidade.Remove(objFromDb);
                _unitOfWork.Save();
                
                return Json(new
                {
                    success = true,
                    message = "Unidade removida com sucesso"
                });
            }
        }
        
        return Json(new
        {
            success = false,
            message = "Erro ao apagar Unidade"
        });
    }
    catch (Exception error)
    {
        Alerta.TratamentoErroComLinha("UnidadeController.cs", "Delete", error);
        return Json(new
        {
            success = false,
            message = "Erro ao deletar unidade"
        });
    }
}
```

---

## Validações

### Validações Frontend

1. **Confirmação de Exclusão**: Obrigatória antes de excluir unidade
2. **Validação de ID**: Verifica se ID é válido antes de requisições

### Validações Backend

1. **Unidade existe**: Verifica se unidade existe antes de operações
2. **Dependências**: Verifica veículos antes de excluir
3. **ID válido**: Valida que ID não é Guid.Empty

---

## Exemplos de Uso

### Exemplo 1: Visualizar Todas as Unidades

**Situação**: Usuário quer ver todas as unidades cadastradas.

**Passos**:
1. Acessa página `/Unidade`
2. Tabela carrega automaticamente mostrando todas as unidades
3. Pode filtrar usando campo de busca do DataTable
4. Pode ordenar clicando nos headers das colunas

**O que acontece**:
- Backend retorna todas as unidades
- DataTable renderiza com paginação (10 por página por padrão)
- Usuário pode navegar entre páginas

### Exemplo 2: Inativar Unidade

**Situação**: Usuário quer inativar uma unidade que foi desativada.

**Passos**:
1. Localiza unidade na tabela
2. Clica no badge verde "Ativo"
3. Status muda para "Inativo" (cinza)

**O que acontece**:
- Requisição AJAX para `/api/Unidade/UpdateStatus`
- Backend inverte status no banco
- Frontend atualiza badge visualmente
- Toast de sucesso é exibido

### Exemplo 3: Ver Veículos da Unidade

**Situação**: Usuário quer ver quais veículos pertencem a uma unidade.

**Passos**:
1. Localiza unidade na tabela
2. Clica no botão chocolate "Veículos"
3. Redireciona para página `/Unidade/VeiculosUnidade?id=guid`

**O que acontece**:
- Navegação para página específica de veículos da unidade
- Página mostra apenas veículos daquela unidade

### Exemplo 4: Tentar Excluir Unidade com Veículos

**Situação**: Usuário tenta excluir uma unidade que tem veículos associados.

**Passos**:
1. Localiza unidade na tabela
2. Clica no botão vermelho de excluir
3. Confirma exclusão
4. Sistema verifica dependências
5. Recebe mensagem de erro informando que há veículos associados

**O que acontece**:
- Confirmação é exibida
- Requisição POST para `/api/Unidade/Delete`
- Backend verifica veículos
- Retorna erro com mensagem clara
- Unidade não é excluída

---

## Troubleshooting

### Problema 1: Tabela não carrega

**Sintoma**: Tabela aparece vazia ou com mensagem "Carregando..."

**Causas Possíveis**:
1. Erro no endpoint `/api/unidade` (500 Internal Server Error)
2. Problema de conexão com banco de dados
3. Erro JavaScript que impede inicialização do DataTable

**Solução**:
- Verificar logs do servidor
- Verificar Network Tab para erros na requisição
- Verificar console do navegador por erros JavaScript

---

### Problema 2: Status não atualiza visualmente

**Sintoma**: Clica no badge de status, requisição retorna sucesso, mas badge não muda.

**Causas Possíveis**:
1. Classes CSS não estão sendo aplicadas
2. Elemento foi removido/recriado pelo DataTable
3. Event handler não está atualizando elemento correto

**Solução**:
- Verificar se classes `btn-verde` e `fundo-cinza` existem no CSS
- Verificar se `currentElement` está referenciando elemento correto
- Verificar se texto está sendo atualizado corretamente

---

### Problema 3: Não consegue excluir unidade

**Sintoma**: Tenta excluir unidade mas recebe mensagem de erro sobre veículos associados.

**Causa**: Unidade está associada a um ou mais veículos na tabela `Veiculo`.

**Solução**:
- Verificar veículos da unidade na página `/Unidade/VeiculosUnidade`
- Desassociar veículos da unidade primeiro (mover para outra unidade ou deixar sem unidade)
- Depois tentar excluir novamente

---

### Problema 4: Botão de Veículos não funciona

**Sintoma**: Clica no botão "Veículos" mas não navega para a página.

**Causas Possíveis**:
1. Link está incorreto
2. Página `/Unidade/VeiculosUnidade` não existe
3. ID da unidade não está sendo passado corretamente

**Solução**:
- Verificar se link está correto no renderizador
- Verificar se página existe
- Verificar se ID está sendo passado corretamente no `href`

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [08/01/2026] - Expansão Completa da Documentação

**Descrição**:
Documentação expandida de ~137 linhas para mais de 500 linhas, incluindo:
- Detalhamento completo da arquitetura e estrutura de arquivos
- Explicação detalhada do DataTable e renderizadores customizados
- Sistema de gestão de status explicado
- Documentação completa de todos os endpoints API
- Validações frontend e backend documentadas
- Exemplos práticos de uso
- Troubleshooting expandido com 4 problemas comuns e soluções

**Arquivos Afetados**:
- `Documentacao/Pages/Unidade - Index.md` (expansão completa)

**Status**: ✅ **Documentado e Expandido**

**Responsável**: Claude (AI Assistant)
**Versão**: 2.0

---

## [06/01/2026] - Criação da Documentação Inicial

**Descrição**:
Documentação inicial da listagem de Unidades (Index).

**Status**: ✅ **Documentado**

**Responsável**: Claude (AI Assistant)
**Versão**: 1.0

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [06/01/2026] - Criação da Documentação

**Descrição**:
Documentação inicial da listagem de Unidades (Index).

**Status**: ✅ **Documentado**

**Responsável**: Claude (AI Assistant)
**Versão**: 1.0
