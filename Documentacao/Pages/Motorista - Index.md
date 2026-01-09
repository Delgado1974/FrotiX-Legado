# Documentação: Motorista - Gestão (Index)

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
8. [Modal de Foto](#modal-de-foto)
9. [Lógica de Frontend (JavaScript)](#lógica-de-frontend-javascript)
10. [Endpoints API](#endpoints-api)
11. [Validações](#validações)
12. [Exemplos de Uso](#exemplos-de-uso)
13. [Troubleshooting](#troubleshooting)

---

## Visão Geral

A página de **Listagem de Motoristas** (`Pages/Motorista/Index.cshtml`) é o **ponto de entrada central** para o gerenciamento completo de condutores no sistema FrotiX. Ela exibe todos os motoristas cadastrados em uma tabela interativa rica, permitindo visualizar informações detalhadas, gerenciar status, visualizar fotos e realizar operações CRUD básicas.

### Objetivo

A página de Motoristas permite que os usuários:
- **Visualizem** todos os motoristas cadastrados em uma tabela interativa
- **Visualizem** fotos dos motoristas através de modal
- **Gerenciem** status (Ativo/Inativo) diretamente da listagem
- **Editem** motoristas através de link para página de edição
- **Excluam** motoristas com confirmação de segurança
- **Exportem** dados para Excel e PDF
- **Filtrem** e **ordenem** dados usando recursos nativos do DataTable

### Características Principais

- ✅ **Listagem Rica**: DataTable com informações detalhadas (Nome, Ponto, CNH, Categoria, Celular, Unidade, Contrato, Tipo, Status)
- ✅ **Modal de Foto**: Visualização rápida da foto do motorista em modal Bootstrap sem sair da listagem
- ✅ **Filtros e Ordenação**: Recursos nativos do DataTable com busca em todas as colunas
- ✅ **Status Visual**: Indicadores claros de motoristas Ativos/Inativos com badges coloridos
- ✅ **Gestão de Status**: Alternância de status diretamente na tabela com feedback visual
- ✅ **Exportação de Dados**: Botões para exportar para Excel e PDF (formato paisagem)
- ✅ **Exclusão Segura**: Confirmação antes de excluir motorista
- ✅ **Layout Responsivo**: Tabela adaptável para diferentes tamanhos de tela

---

## Arquitetura

### Visão Geral da Arquitetura

A página de Motoristas utiliza uma arquitetura **simples mas eficiente**, focada em:
- **Backend (ASP.NET Core Razor Pages)**: Renderização da página e inicialização
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
│   └── Motorista/
│       ├── Index.cshtml              # View Principal (400+ linhas)
│       │                             # - HTML da tabela
│       │                             # - Modal de foto
│       │                             # - Estilos CSS customizados
│       │                             # - Scripts inline
│       │
│       └── Index.cshtml.cs          # PageModel (Backend Init)
│                                     # - Inicialização básica
│
├── Controllers/
│   └── MotoristaController.cs        # API Controller (500+ linhas)
│                                     # - Get: Lista todos os motoristas
│                                     # - PegaFotoModal: Retorna foto em Base64
│                                     # - Delete: Exclui motorista
│                                     # - UpdateStatus: Atualiza status Ativo/Inativo
│
├── wwwroot/
│   ├── js/
│   │   └── cadastros/
│   │       └── motorista.js          # Lógica do DataTable (296 linhas)
│   │                                 # - Inicialização da tabela
│   │                                 # - Handlers de eventos
│   │                                 # - Gestão de status
│   │                                 # - Exclusão de motoristas
│   │
│   └── css/
│       └── (estilos inline no Index.cshtml)
│
└── Models/
    └── Cadastros/
        └── Motorista.cs              # Modelo principal de motorista
```

### Arquivos Relacionados

- `Repository/MotoristaRepository.cs` - Acesso a dados de motoristas
- `Repository/ViewMotoristasRepository.cs` - Acesso à view de motoristas
- `Helpers/ListaMotorista.cs` - Helper para listagem de motoristas

### Tecnologias Utilizadas

| Tecnologia | Versão | Uso Específico |
|------------|--------|----------------|
| **jQuery DataTables** | Latest | Tabela interativa com paginação, ordenação e exportação |
| **ASP.NET Core** | 3.1+ | Backend Razor Pages, Dependency Injection |
| **jQuery** | 3.6.0 | Manipulação DOM, AJAX, Event Handlers |
| **Bootstrap** | 5.x | Modais, Layout Responsivo |
| **Font Awesome Duotone** | Latest | Ícones e badges visuais |
| **SweetAlert2** | Latest | Confirmações elegantes |

---

## Estrutura da Interface

### Tabela Principal
A tabela é renderizada com a classe `table-bordered table-striped` e preenchida dinamicamente.

```html
<table id="tblMotorista" class="table table-bordered table-striped" width="100%">
    <thead>
        <tr>
            <th>Nome</th>
            <th>Ponto</th>
            <th>CNH</th>
            <th>Categoria</th>
            <th>Celular</th>
            <th>Unidade</th>
            <th>Contrato</th>
            <th>Tipo</th>
            <th>Status</th>
            <th>Ações</th>
        </tr>
    </thead>
    <tbody></tbody>
</table>
```

### Modal de Foto
Um modal Bootstrap (`#modalFoto`) é utilizado para exibir a imagem do motorista quando o botão de câmera é clicado na grid.

```html
<div class="modal fade ftx-modal" id="modalFoto">
    <!-- ... -->
    <div class="ftx-foto-container">
        <img id="imgViewer" src="/Images/barbudo.jpg" class="ftx-foto-img" />
    </div>
</div>
```

---

## Lógica de Frontend (JavaScript)

O arquivo `motorista.js` (296 linhas) gerencia toda a interatividade da página.

### 1. Inicialização do DataTable

A função `loadList()` é chamada quando o documento está pronto:

```javascript
$(document).ready(function () {
    loadList();
    // ... outros event handlers ...
});
```

**Configurações Principais**:
- **dom**: `"Bfrtip"` - Define layout (Botões, filtro, tabela, informações, paginação)
- **lengthMenu**: Opções de linhas por página (10, 25, 50, Todas)
- **buttons**: Exportação para Excel e PDF
- **responsive**: Tabela adaptável para mobile
- **language**: Português Brasil via CDN

### 2. Gestão de Status

O sistema permite alternar status diretamente na tabela:

**Event Handler**:
```javascript
$(document).on("click", ".updateStatusMotorista", function () {
    const url = $(this).data("url");
    const currentElement = $(this);
    
    $.get(url, function (data) {
        if (data.success) {
            AppToast.show("Verde", "Status alterado com sucesso!", 2000);
            
            if (data.type == 0) {
                // ATIVO = VERDE
                currentElement.html('<i class="fa-duotone fa-circle-check"></i> Ativo');
                currentElement.removeClass("fundo-cinza").addClass("btn-verde");
                currentElement.attr('data-ejtip', 'Motorista ativo - clique para inativar');
            } else {
                // INATIVO = CINZA
                currentElement.html('<i class="fa-duotone fa-circle-xmark"></i> Inativo');
                currentElement.removeClass("btn-verde").addClass("fundo-cinza");
                currentElement.attr('data-ejtip', 'Motorista inativo - clique para ativar');
            }
        }
    });
});
```

**Características**:
- Atualização visual sem recarregar tabela
- Feedback imediato ao usuário
- Tooltip atualizado dinamicamente

### 3. Exclusão de Motorista

O sistema possui exclusão segura com confirmação:

**Event Handler**:
```javascript
$(document).on("click", ".btn-delete", function () {
    const id = $(this).data("id");
    
    Alerta.Confirmar(
        "Confirmar Exclusão",
        "Você tem certeza que deseja apagar este motorista? Não será possível recuperar os dados eliminados!",
        "Sim, excluir",
        "Cancelar"
    ).then((confirmed) => {
        if (confirmed) {
            $.ajax({
                url: "/api/Motorista/Delete",
                type: "POST",
                data: JSON.stringify({ MotoristaId: id }),
                contentType: "application/json; charset=utf-8",
                success: function (data) {
                    if (data.success) {
                        AppToast.show("Verde", data.message, 3000);
                        dataTable.ajax.reload();
                    } else {
                        AppToast.show("Vermelho", data.message, 3000);
                    }
                }
            });
        }
    });
});
```

**Validações**:
- Confirmação obrigatória antes de excluir
- Verificação de dependências no backend (contratos)
- Feedback claro sobre sucesso ou erro

---

## Endpoints API

O controller `MotoristaController.cs` gerencia todas as operações relacionadas aos motoristas através de uma API RESTful.

### 1. GET `/api/motorista`

**Descrição**: Retorna a lista completa de motoristas, incluindo ativos e inativos.

**Parâmetros**: Nenhum

**Response** (JSON compatível com DataTables):
```json
{
  "data": [
    {
      "motoristaId": "guid",
      "nome": "João Silva",
      "ponto": "12345",
      "cnh": "12345678901",
      "categoriaCNH": "B",
      "celular01": "(11) 98765-4321",
      "sigla": "SP",
      "contratoMotorista": "2026/001 - Empresa XYZ",
      "efetivoFerista": "Efetivo",
      "status": true,
      "foto": "base64-string..."
    }
  ]
}
```

**Lógica de Processamento**:

O endpoint utiliza a view `ViewMotoristas` e formata os dados:

```csharp
var result = (
    from vm in _unitOfWork.ViewMotoristas.GetAll()
    select new
    {
        vm.MotoristaId,
        vm.Nome,
        vm.Ponto,
        vm.CNH,
        vm.Celular01,
        vm.CategoriaCNH,
        Sigla = vm.Sigla != null ? vm.Sigla : "",
        ContratoMotorista = vm.AnoContrato != null
            ? (vm.AnoContrato + "/" + vm.NumeroContrato + " - " + vm.DescricaoFornecedor)
            : vm.TipoCondutor != null ? vm.TipoCondutor
            : "(sem contrato)",
        vm.Status,
        vm.EfetivoFerista,
        vm.Foto
    }
).ToList();
```

**Características**:
- Formata contrato como "Ano/Número - Fornecedor"
- Fallback para tipo de condutor se não houver contrato
- Inclui foto em Base64 (se disponível)

---

### 2. GET `/api/Motorista/PegaFotoModal`

**Descrição**: Retorna a foto do motorista em formato Base64 para exibição no modal.

**Parâmetros de Query**:
- `id` (Guid, obrigatório): ID do motorista

**Response**:
- **Sucesso**: String Base64 da imagem (ex: `"/9j/4AAQSkZJRg..."`)
- **Sem foto**: `false` ou `null`

**Código**:
```csharp
[Route("PegaFotoModal")]
public JsonResult PegaFotoModal(Guid id)
{
    try
    {
        var motorista = _unitOfWork.Motorista.GetFirstOrDefault(m =>
            m.MotoristaId == id
        );
        
        if (motorista != null && motorista.Foto != null && motorista.Foto.Length > 0)
        {
            string base64 = Convert.ToBase64String(motorista.Foto);
            return Json(base64);
        }
        
        return Json(false);
    }
    catch (Exception error)
    {
        Alerta.TratamentoErroComLinha("MotoristaController.cs", "PegaFotoModal", error);
        return Json(false);
    }
}
```

**Uso no Frontend**:
```javascript
$.ajax({
    type: "GET",
    url: "/api/Motorista/PegaFotoModal",
    data: { id: motoristaId },
    success: function (res) {
        if (res) {
            $("#imgViewer").attr("src", "data:image/jpg;base64," + res);
        } else {
            $("#imgViewer").attr("src", "/Images/barbudo.jpg");
        }
    }
});
```

---

### 3. GET `/api/Motorista/UpdateStatusMotorista`

**Descrição**: Alterna o status de um motorista entre Ativo e Inativo.

**Parâmetros de Query**:
- `Id` (Guid, obrigatório): ID do motorista

**Response**:
```json
{
  "success": true,
  "message": "Atualizado Status do Motorista [Nome: João Silva] (Ativo)",
  "type": 0
}
```

**Lógica**:
- Se status atual é `true` (Ativo) → muda para `false` (Inativo), `type = 1`
- Se status atual é `false` (Inativo) → muda para `true` (Ativo), `type = 0`
- Atualiza registro no banco
- Retorna mensagem descritiva

**Código**:
```csharp
[Route("UpdateStatusMotorista")]
public JsonResult UpdateStatusMotorista(Guid Id)
{
    try
    {
        if (Id != Guid.Empty)
        {
            var objFromDb = _unitOfWork.Motorista.GetFirstOrDefault(u =>
                u.MotoristaId == Id
            );
            
            if (objFromDb != null)
            {
                int type = 0;
                string Description = "";
                
                if (objFromDb.Status == true)
                {
                    objFromDb.Status = false;
                    Description = $"Atualizado Status do Motorista [Nome: {objFromDb.Nome}] (Inativo)";
                    type = 1;
                }
                else
                {
                    objFromDb.Status = true;
                    Description = $"Atualizado Status do Motorista [Nome: {objFromDb.Nome}] (Ativo)";
                    type = 0;
                }
                
                _unitOfWork.Motorista.Update(objFromDb);
                _unitOfWork.Save();
                
                return Json(new
                {
                    success = true,
                    message = Description,
                    type = type
                });
            }
        }
        
        return Json(new { success = false });
    }
    catch (Exception error)
    {
        Alerta.TratamentoErroComLinha("MotoristaController.cs", "UpdateStatusMotorista", error);
        return Json(new { success = false });
    }
}
```

---

### 4. POST `/api/Motorista/Delete`

**Descrição**: Exclui um motorista do sistema, com validação de dependências.

**Request Body** (JSON):
```json
{
  "MotoristaId": "guid-do-motorista"
}
```

**Validações Executadas**:
1. Verifica se motorista existe
2. **Verifica se motorista está associado a contratos**:
   - Se estiver associado, **bloqueia exclusão**
   - Retorna mensagem: "Não foi possível remover o motorista. Ele está associado a um ou mais contratos!"

**Response**:
```json
{
  "success": true,
  "message": "Motorista removido com sucesso"
}
```

**Código**:
```csharp
[Route("Delete")]
[HttpPost]
public IActionResult Delete(MotoristaViewModel model)
{
    try
    {
        if (model != null && model.MotoristaId != Guid.Empty)
        {
            var objFromDb = _unitOfWork.Motorista.GetFirstOrDefault(u =>
                u.MotoristaId == model.MotoristaId
            );
            
            if (objFromDb != null)
            {
                // Verifica se pode apagar o motorista
                var motoristaContrato = _unitOfWork.MotoristaContrato.GetFirstOrDefault(u =>
                    u.MotoristaId == model.MotoristaId
                );
                
                if (motoristaContrato != null)
                {
                    return Json(new
                    {
                        success = false,
                        message = "Não foi possível remover o motorista. Ele está associado a um ou mais contratos!"
                    });
                }
                
                _unitOfWork.Motorista.Remove(objFromDb);
                _unitOfWork.Save();
                
                return Json(new
                {
                    success = true,
                    message = "Motorista removido com sucesso"
                });
            }
        }
        
        return Json(new
        {
            success = false,
            message = "Erro ao apagar motorista"
        });
    }
    catch (Exception error)
    {
        Alerta.TratamentoErroComLinha("MotoristaController.cs", "Delete", error);
        return View();
    }
}
```

---

## Validações

### Validações Frontend

1. **Confirmação de Exclusão**: Obrigatória antes de excluir motorista
2. **Validação de ID**: Verifica se ID é válido antes de requisições

### Validações Backend

1. **Motorista existe**: Verifica se motorista existe antes de operações
2. **Dependências**: Verifica se motorista está associado a contratos antes de excluir
3. **ID válido**: Valida que ID não é Guid.Empty

---

## Exemplos de Uso

### Exemplo 1: Visualizar Todos os Motoristas

**Situação**: Usuário quer ver todos os motoristas cadastrados.

**Passos**:
1. Acessa página `/Motorista`
2. Tabela carrega automaticamente mostrando todos os motoristas
3. Pode filtrar usando campo de busca do DataTable
4. Pode ordenar clicando nos headers das colunas

**O que acontece**:
- Backend retorna todos os motoristas da view
- DataTable renderiza com paginação (10 por página por padrão)
- Usuário pode navegar entre páginas

### Exemplo 2: Inativar Motorista

**Situação**: Usuário quer inativar um motorista que está de férias.

**Passos**:
1. Localiza motorista na tabela
2. Clica no badge verde "Ativo"
3. Sistema pergunta confirmação (implícita)
4. Status muda para "Inativo" (cinza)

**O que acontece**:
- Requisição AJAX para `/api/Motorista/UpdateStatusMotorista`
- Backend inverte status no banco
- Frontend atualiza badge visualmente
- Toast de sucesso é exibido

### Exemplo 3: Visualizar Foto do Motorista

**Situação**: Usuário quer ver a foto de um motorista.

**Passos**:
1. Localiza motorista na tabela
2. Clica no botão de foto (ícone de câmera)
3. Modal abre mostrando foto

**O que acontece**:
- Modal Bootstrap abre
- Requisição AJAX busca foto em Base64
- Se foto existe, exibe no modal
- Se não existe, mostra imagem padrão

### Exemplo 4: Excluir Motorista

**Situação**: Usuário quer excluir um motorista que não está mais na empresa.

**Passos**:
1. Localiza motorista na tabela
2. Clica no botão vermelho de excluir
3. Sistema pergunta confirmação
4. Usuário confirma
5. Sistema verifica dependências
6. Se não houver dependências, exclui

**O que acontece**:
- Confirmação via SweetAlert
- Requisição POST para `/api/Motorista/Delete`
- Backend verifica se motorista tem contratos
- Se não tiver, exclui e retorna sucesso
- Se tiver, retorna erro e mantém motorista
- Tabela recarrega após sucesso

---

## Troubleshooting

### Problema 1: Tabela não carrega (Loading infinito)

**Sintoma**: 
- Tabela aparece vazia ou com mensagem "Carregando..."
- Nenhum dado é exibido

**Causas Possíveis**:
1. Erro no endpoint `/api/motorista` (500 Internal Server Error)
2. View `ViewMotoristas` não existe ou tem erro
3. Problema de serialização JSON (campo binário muito grande)

**Diagnóstico**:
1. Abrir DevTools (F12)
2. Ir para aba Network
3. Verificar requisição `motorista`
4. Verificar Status Code e Response

**Solução**:
- Verificar logs do servidor
- Verificar se view existe no banco de dados
- Verificar se campo `Foto` não está causando problema de serialização

---

### Problema 2: Foto não carrega (imagem quebrada)

**Sintoma**: 
- Modal abre mas mostra imagem quebrada
- Ou sempre mostra imagem padrão (`barbudo.jpg`)

**Causas Possíveis**:
1. String Base64 inválida ou corrompida
2. Campo `Foto` no banco está vazio ou NULL
3. Endpoint `/api/Motorista/PegaFotoModal` retorna erro
4. Base64 muito grande causando problema de serialização

**Diagnóstico**:
```javascript
// Testar endpoint manualmente
fetch('/api/Motorista/PegaFotoModal?id=guid-do-motorista')
    .then(r => r.json())
    .then(data => {
        console.log('Foto recebida:', data ? 'Sim' : 'Não');
        console.log('Tamanho:', data?.length);
    });
```

**Solução**:
- Verificar se campo `Foto` no banco tem dados válidos
- Verificar se Base64 está sendo gerado corretamente
- O JS possui fallback para `/Images/barbudo.jpg` que deve funcionar

---

### Problema 3: Status não atualiza visualmente

**Sintoma**: 
- Clica no badge de status
- Requisição é enviada e retorna sucesso
- Mas badge não muda de cor

**Causas Possíveis**:
1. Event handler não está atualizando elemento corretamente
2. Classes CSS não estão sendo aplicadas
3. Elemento foi removido/recriado pelo DataTable

**Solução**:
- Verificar se classes `btn-verde` e `fundo-cinza` existem no CSS
- Verificar se `currentElement` está referenciando elemento correto
- Recarregar tabela após atualização: `dataTable.ajax.reload()`

---

### Problema 4: Não consegue excluir motorista

**Sintoma**: 
- Tenta excluir motorista
- Recebe mensagem: "Não foi possível remover o motorista. Ele está associado a um ou mais contratos!"

**Causa**: Motorista está associado a um ou mais contratos na tabela `MotoristaContrato`.

**Solução**:
- Verificar contratos do motorista na página de Contratos
- Desassociar motorista dos contratos primeiro
- Depois tentar excluir novamente

---

### Problema 5: Exportação não funciona

**Sintoma**: 
- Botões de exportar Excel/PDF não fazem nada

**Causas Possíveis**:
1. Plugins do DataTable não foram carregados
2. Bibliotecas de exportação não estão disponíveis

**Solução**:
- Verificar se `buttons.html5.js` foi carregado
- Verificar se `jszip.js` e `pdfmake.js` estão disponíveis
- Verificar ordem de carregamento dos scripts

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [08/01/2026] - Expansão Completa da Documentação

**Descrição**:
Documentação expandida de ~194 linhas para mais de 600 linhas, incluindo:
- Detalhamento completo da arquitetura e estrutura de arquivos
- Explicação detalhada do DataTable e renderizadores customizados
- Documentação completa do modal de foto
- Sistema de gestão de status explicado
- Documentação completa de todos os endpoints API
- Validações frontend e backend documentadas
- Exemplos práticos de uso
- Troubleshooting expandido com 5 problemas comuns e soluções

**Arquivos Afetados**:
- `Documentacao/Pages/Motorista - Index.md` (expansão completa)

**Status**: ✅ **Documentado e Expandido**

**Responsável**: Claude (AI Assistant)
**Versão**: 2.0

---

## [06/01/2026] - Criação da Documentação Inicial

**Descrição**:
Documentação inicial da listagem de Motoristas (Index).

**Status**: ✅ **Documentado**

**Responsável**: Claude (AI Assistant)
**Versão**: 1.0

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [06/01/2026] - Criação da Documentação

**Descrição**:
Documentação inicial da listagem de Motoristas (Index).

**Status**: ✅ **Documentado**

**Responsável**: Claude (AI Assistant)
**Versão**: 1.0
