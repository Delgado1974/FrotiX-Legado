# Documentação: Motorista - Gestão (Index)

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

A página de **Listagem de Motoristas** (`Pages/Motorista/Index.cshtml`) é o ponto de entrada para o gerenciamento de condutores. Ela exibe todos os motoristas cadastrados em uma tabela interativa, com opções para editar, visualizar a foto do perfil e verificar o status atual.

### Características Principais
- ✅ **Listagem Completa**: Exibe Nome, Ponto, CNH, Categoria, Celular, Unidade, Contrato, Tipo e Status.
- ✅ **Modal de Foto**: Visualização rápida da foto do motorista sem sair da listagem.
- ✅ **Filtros e Ordenação**: Recursos nativos do DataTable.
- ✅ **Status Visual**: Indicadores claros de motoristas Ativos/Inativos.

---

## Arquitetura

### Estrutura de Arquivos

```
FrotiX.Site/
├── Pages/
│   └── Motorista/
│       └── Index.cshtml             # View da Listagem
│
├── Controllers/
│   └── MotoristaController.cs       # Endpoints API (Get, PegaFotoModal)
│
├── wwwroot/
│   ├── js/
│   │   └── cadastros/
│   │       └── motorista.js         # Lógica do DataTable
```

### Tecnologias Utilizadas
| Tecnologia | Uso |
|------------|-----|
| **ASP.NET Core Razor Pages** | Renderização da página |
| **jQuery DataTables** | Grid de dados |
| **Bootstrap 5** | Modais e Layout |

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

O arquivo `motorista.js` inicializa o DataTable e gerencia os eventos.

### Inicialização
A tabela consome a API via AJAX.

```javascript
dataTable = $("#tblMotorista").DataTable({
    ajax: {
        url: "/api/Motorista",
        type: "GET",
        datatype: "json"
    },
    columns: [
        { data: "nome" },
        { data: "ponto" },
        { data: "cnh" },
        { data: "categoriaCNH" },
        { data: "celular01" },
        { data: "unidade.sigla" }, // Exemplo de navegação de propriedade
        { data: "contrato.numeroContrato" },
        { data: "tipoCondutor" },
        { data: "status" }, // Renderizado como badge
        { data: "motoristaId" } // Renderizado como botões
    ]
});
```

### Carregamento de Foto
Ao clicar no botão `.btn-foto`, uma requisição é feita para buscar a imagem em Base64.

```javascript
$(document).on('click', '.btn-foto', function (e) {
    const motoristaId = $(this).data('id');
    const modalElement = document.getElementById('modalFoto');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();

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
});
```

---

## Endpoints API

### GET `/api/Motorista`
Retorna a lista completa de motoristas ativos e inativos.

### GET `/api/Motorista/PegaFotoModal`
Retorna a string Base64 da foto do motorista.
- **Parâmetros**: `id` (Guid).
- **Retorno**: String (Base64) ou `false`/`null`.

---

## Troubleshooting

### Foto não carrega (imagem quebrada)
**Causa**: String Base64 inválida ou retorno nulo da API.
**Solução**: O JS possui um fallback para `/Images/barbudo.jpg`. Verifique no banco se o campo `Foto` possui dados binários válidos.

### Tabela vazia
**Causa**: Falha na requisição `/api/Motorista`.
**Solução**: Verifique o Network tab do navegador. Se retornar 500, verifique os logs do servidor (erros de serialização ou conexão com banco).

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
