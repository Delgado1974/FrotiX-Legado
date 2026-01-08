# Documentação: Motorista (Funcionalidade)

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

O módulo de **Motoristas** é responsável pelo cadastro e gestão dos condutores da frota. Ele permite armazenar dados pessoais, CNH, foto, contrato e vínculo com unidade. A listagem oferece uma visão rápida com status e ferramentas de filtro e exportação.

### Características Principais
- ✅ **Gestão Completa (CRUD)**: Listar, Criar, Editar e Desativar (via status) motoristas.
- ✅ **Foto do Motorista**: Upload e visualização de foto de perfil.
- ✅ **Dados de CNH**: Registro de número, categoria e validade da habilitação.
- ✅ **Vínculo Contratual**: Associação do motorista a um contrato e unidade específicos.
- ✅ **Visualização Rápida**: Modal na listagem para ver a foto do motorista sem abrir a edição.

---

## Arquitetura

### Estrutura de Arquivos

```
FrotiX.Site/
├── Pages/
│   └── Motorista/
│       ├── Index.cshtml             # Listagem
│       └── Upsert.cshtml            # Formulário de Cadastro
│
├── Controllers/
│   └── MotoristaController.cs       # Endpoints API
│
├── wwwroot/
│   ├── js/
│   │   └── cadastros/
│   │       ├── motorista.js         # Lógica da Listagem
│   │       └── motorista_upsert.js  # Lógica do Formulário
```

### Tecnologias Utilizadas
| Tecnologia | Uso |
|------------|-----|
| **ASP.NET Core Razor Pages** | Renderização das páginas |
| **jQuery DataTables** | Grid de listagem |
| **Bootstrap 5** | Layout, Modais e Componentes |
| **jQuery Mask Plugin** | Máscaras de input (CPF, Celular) |

---

## Listagem (Index)

A página `Index.cshtml` exibe uma tabela com os motoristas cadastrados.

### Estrutura da Tabela
A tabela é inicializada via JavaScript (`motorista.js`) e consome a API `/api/Motorista`.

**Colunas:**
1. Nome
2. Ponto (Matrícula)
3. CNH
4. Categoria CNH
5. Celular
6. Unidade
7. Contrato
8. Tipo (Motorista/Condutor)
9. Status (Ativo/Inativo)
10. Ações (Editar, Ver Foto)

### Modal de Foto
A listagem possui um botão "Foto" que abre um modal (`#modalFoto`) carregando a imagem via AJAX.

```javascript
$(document).on('click', '.btn-foto', function (e) {
    const motoristaId = $(this).data('id');
    // ... abre modal ...
    $.ajax({
        url: "/api/Motorista/PegaFotoModal",
        data: { id: motoristaId },
        success: function (res) {
            // ... exibe imagem base64 ...
        }
    });
});
```

---

## Cadastro/Edição (Upsert)

A página `Upsert.cshtml` é utilizada tanto para criar quanto para editar registros.

### Seções do Formulário
1. **Dados Pessoais**: Nome, CPF, Ponto, Data de Nascimento, Celular.
2. **Habilitação**: Número CNH, Categoria, Vencimento.
3. **Vínculo**: Unidade, Contrato, Tipo de Condutor (Efetivo/Ferista).
4. **Foto**: Upload de imagem com preview imediato.
5. **Configurações**: Checkbox de Ativo/Inativo.

### Lógica de Frontend (`motorista_upsert.js`)
- **Máscaras**: Aplica máscaras de CPF (`000.000.000-00`) e Celular.
- **Preview de Imagem**: Exibe a imagem selecionada no input file antes do upload.
- **Validação**: Verifica campos obrigatórios antes do submit.

```javascript
// Preview de imagem
$("#fotoUpload").change(function () {
    if (this.files && this.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            $('#imgPreview').attr('src', e.target.result).show();
            $('#txtSemFoto').hide();
        }
        reader.readAsDataURL(this.files[0]);
    }
});
```

---

## Endpoints API

### GET `/api/Motorista`
Retorna a lista de todos os motoristas para o DataTable.

### GET `/api/Motorista/PegaFotoModal?id={id}`
Retorna a string Base64 da foto do motorista especificado.

### POST `/Motorista/Upsert` (Handler)
Processa o formulário via submit tradicional (Razor Pages), lidando com `IFormFile` para a foto.

---

## Troubleshooting

### Foto não carrega no Modal
**Causa**: O endpoint `/api/Motorista/PegaFotoModal` retornou erro ou string vazia.
**Solução**: Verifique se o motorista tem foto no banco. O código trata falhas exibindo uma imagem padrão (`barbudo.jpg`).

### Erro de Validação no CPF
**Causa**: Formato inválido ou CPF já existente (validação de servidor).
**Solução**: Verifique se a máscara está funcionando e se o CPF é válido.

### Dropdown de Unidade/Contrato vazio
**Causa**: As listas `UnidadeList` ou `ContratoList` não foram populadas no `OnGet` do `UpsertModel`.
**Solução**: Verifique o controller/PageModel para garantir que os repositórios estão retornando dados.

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [06/01/2026] - Criação da Documentação

**Descrição**:
Documentação inicial do módulo de Motoristas (Index e Upsert).

**Status**: ✅ **Documentado**

**Responsável**: Claude (AI Assistant)
**Versão**: 1.0
