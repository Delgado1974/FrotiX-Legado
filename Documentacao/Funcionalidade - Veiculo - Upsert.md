# Documentação: Cadastro de Veículo (Upsert)

> **Última Atualização**: 06/01/2026
> **Versão Atual**: 1.1

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Funcionalidades Específicas](#funcionalidades-específicas)
4. [Frontend](#frontend)
5. [Validações](#validações)
6. [Troubleshooting](#troubleshooting)

---

## Visão Geral

A página **Cadastro de Veículo (Upsert)** é responsável pela criação (Insert) e atualização (Update) dos registros de veículos no sistema. O termo "Upsert" refere-se à capacidade da página de lidar com ambas as operações. Ela apresenta um formulário detalhado, dividido em seções lógicas, com validações dinâmicas e carregamento assíncrono de dependências.

### Características Principais

- ✅ **Formulário Completo**: Cadastro de todas as características técnicas, legais e administrativas do veículo.
- ✅ **Carregamento em Cascata**: Seleção de Marca carrega Modelos; Contrato carrega Itens.
- ✅ **Upload de CRLV**: Envio direto de arquivo PDF/Imagem do documento do veículo.
- ✅ **Log de Auditoria**: Exibe quem criou/alterou o registro e quando (apenas edição).
- ✅ **Validações Dinâmicas**: Regras mudam conforme o tipo de vínculo (Contrato, Ata ou Próprio).
- ✅ **Verificação de Duplicidade**: Alerta em tempo real se a placa já existe.

---

## Arquitetura

### Estrutura de Arquivos

```
FrotiX.Site/
├── Pages/
│   └── Veiculo/
│       ├── Upsert.cshtml            # Interface (HTML Razor)
│       └── Upsert.cshtml.cs         # Lógica Backend (PageModel)
│
├── Controllers/
│   └── VeiculoController.cs         # Alguns endpoints auxiliares (se houver)
│
├── wwwroot/
│   ├── js/
│   │   └── cadastros/
│   │       └── veiculo_upsert.js    # Lógica Frontend (jQuery)
│   └── css/
│       └── frotix.css               # Estilos globais
```

### Tecnologias Utilizadas

| Tecnologia | Uso |
|------------|-----|
| **Razor Pages** | Renderização server-side e binding de dados (`OnGet`, `OnPost`) |
| **AJAX (jQuery)** | Carregamento dinâmico de listas (Modelos, Itens) |
| **ASP.NET Core Validation** | Validação no servidor (ModelState) |
| **Notyf** | Notificações toast (Sucesso/Erro) |
| **Input File** | Upload de arquivo multipart/form-data |

---

## Funcionalidades Específicas

### 1. Seção: Identificação do Veículo
- **Marca/Modelo**: Dropdowns encadeados. Ao selecionar Marca, busca Modelos via AJAX.
- **Placa**: Campo com máscara e formatação automática (uppercase, sem hífens). Valida duplicidade ao sair do campo (`focusout`).

### 2. Seção: Documentação
- **Renavam**: Campo numérico.
- **Ano Fabricação/Modelo**: Dropdowns com anos gerados dinamicamente (2003 até ano atual + 1).
- **Upload CRLV**:
    - Aceita PDF, JPG, PNG (Max 10MB).
    - Mostra nome do arquivo selecionado.
    - Em edição, permite "Substituir CRLV" ou manter o atual.

### 3. Seção: Origem do Veículo
Define como o veículo entrou na frota. O comportamento dos campos muda dinamicamente:
- **Contrato**: Habilita seleção de Item Contratual. Desabilita Ata e Patrimônio.
- **Ata de Registro**: Habilita seleção de Item da Ata. Desabilita Contrato e Patrimônio.
- **Veículo Próprio**: Habilita campo Patrimônio. Desabilita Contrato e Ata.

*Lógica Frontend*: Controlada pela função `toggleCamposVeiculoProprio` e eventos `change` nos dropdowns.

### 4. Seção: Configurações
Checkboxes booleanos para flags do sistema:
- **Veículo Próprio**: Ativa modo de veículo próprio.
- **Ativo/Inativo**: Define status inicial.
- **Veículo Reserva**: Marca como reserva técnica.
- **Veículo de Economildo**: Flag específica para projeto Economildo.

---

## Frontend

### JavaScript (`veiculo_upsert.js`)

**Carregamento de Listas (Cascata)**:
```javascript
function GetModeloList(marcaId) {
    $.ajax({
        url: "/Veiculo/Upsert?handler=ModeloList",
        method: "GET",
        data: { id: marcaId },
        success: function (res) {
            var options = '<option value="">-- Selecione um Modelo --</option>';
            if (res && res.data && res.data.length) {
                res.data.forEach(function (obj) {
                    options += '<option value="' + obj.modeloId + '">' + obj.descricaoModelo + '</option>';
                });
            }
            $('#ModeloId').html(options);
            // ... seleciona se já tiver valor
        },
        error: function (xhr) {
            AppToast.show('Erro ao carregar modelos', 'Vermelho', 2000);
        }
    });
}
```

**Validação de Placa (FocusOut)**:
```javascript
$('#txtPlaca').on('focusout', function () {
    var placa = $(this).val();
    if (placa) {
        // Formata: remove espaços, remove hífens, converte para maiúsculo
        placa = placa.replace(/\s+/g, '').replace(/-/g, '').toUpperCase();
        $(this).val(placa);

        // Verifica se placa já existe
        if (placa.length >= 4) {
            var ultimos4 = placa.substr(placa.length - 4);
            verificarPlacaExistente(ultimos4);
        }
    }
});
```

**Lógica de Veículo Próprio (Toggle)**:
```javascript
function toggleCamposVeiculoProprio(veiculoProprio) {
    if (veiculoProprio) {
        // É PRÓPRIO
        $('#divPatrimonio').show();
        $('#lstcontratos').prop('disabled', true); // Desabilita Contrato
        $('#lstatas').prop('disabled', true); // Desabilita Ata
        // Limpa campos...
    } else {
        // NÃO É PRÓPRIO
        $('#divPatrimonio').hide();
        $('#lstcontratos').prop('disabled', false);
        $('#lstatas').prop('disabled', false);
    }
}
```

**Validação de Submit (Cliente)**:
Intercepta o submit para validações que o `required` do HTML5 não cobre.
```javascript
$('form').on('submit', function (e) {
    if (!validarCamposObrigatorios()) {
        e.preventDefault();
        return false;
    }
    // ...
});

function validarCamposObrigatorios() {
    var camposErro = [];

    // Contrato OU Ata OU Veículo Próprio
    var contratoId = $('#lstcontratos').val();
    var ataId = $('#lstatas').val();
    var veiculoProprio = $('#chkVeiculoProprio').is(':checked');

    if (!contratoId && !ataId && !veiculoProprio) {
        camposErro.push('Contrato, Ata ou Veículo Próprio (escolha ao menos um)');
    }

    // ... outras validações

    if (camposErro.length > 0) {
        var mensagem = 'Campos obrigatórios não preenchidos:\n\n• ' + camposErro.join('\n• ');
        Alerta.Warning('Validação de Campos', mensagem, 'Ok');
        return false;
    }
    return true;
}
```

---

## Validações

### Validações Backend (`Upsert.cshtml.cs`)

Além das validações de frontend, o servidor realiza verificações robustas através do método `ChecaInconstancias`.

**Validação de Placa e Renavam (Unicidade)**:
```csharp
var existePlaca = _unitOfWork.Veiculo.GetFirstOrDefault(u =>
    u.Placa.ToUpper() == VeiculoObj.Veiculo.Placa.ToUpper()
);

// Se inserindo e já existe
if (id == Guid.Empty && existePlaca != null)
{
    _notyf.Error("Já existe um veículo com essa placa!" , 3);
    return true;
}

// Se editando e já existe (mas não é o próprio)
if (existePlaca != null && existePlaca.VeiculoId != id)
{
    _notyf.Error("Já existe um veículo com essa placa!" , 3);
    return true;
}
```

**Consistência de Vínculo**:
```csharp
// Deve ter ao menos um: Contrato, Ata ou Veículo Próprio
if (VeiculoObj.Veiculo.ContratoId == null
    && VeiculoObj.Veiculo.AtaId == null
    && VeiculoObj.Veiculo.VeiculoProprio == false)
{
    _notyf.Error(
        "Você precisa definir se o veículo é próprio ou se pertence a um Contrato ou a uma Ata!", 3
    );
    return true;
}

// Se tem Contrato, precisa ter Item Contratual
if (VeiculoObj.Veiculo.ContratoId != null && VeiculoObj.Veiculo.ItemVeiculoId == null)
{
    _notyf.Error("Você precisa informar o Item Contratual do veículo!", 3);
    return true;
}
```

---

## Troubleshooting

### Problema: Modelo não carrega ao selecionar Marca
**Sintoma**: Seleciona marca "Ford", dropdown Modelo continua vazio ou com "Selecione".
**Causa Possível**: Erro no AJAX ou handler `OnGetModeloList`.
**Verificação**:
O handler backend deve retornar um JSON com a propriedade `data`:
```csharp
public JsonResult OnGetModeloList(Guid id)
{
    var ModeloList = _unitOfWork.ModeloVeiculo.GetAll().Where(e => e.MarcaId == id);
    return new JsonResult(new { data = ModeloList });
}
```

### Problema: Erro ao salvar arquivo (Upload)
**Sintoma**: Formulário reseta ou exibe erro ao tentar salvar com CRLV.
**Causa Possível**: Arquivo maior que limite do servidor (IIS default ~30MB, mas verifique validação de 10MB no JS) ou permissão de pasta.
**Solução**: Verificar `FileSize` no JS e logs do servidor.

### Problema: Placa duplicada não detectada no frontend
**Sintoma**: Usuário digita placa existente e não recebe alerta, só erro ao salvar.
**Causa**: Evento `focusout` falhou ou API `VerificaPlaca` retornou erro silencioso.
**Solução**: Verificar se a função `verificarPlacaExistente` está sendo chamada.

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [06/01/2026] - Criação da Documentação

**Descrição**:
Documentação inicial da página de cadastro/edição de veículos (Upsert).

**Status**: ✅ **Documentado**

**Responsável**: Claude (AI Assistant)
**Versão**: 1.0
