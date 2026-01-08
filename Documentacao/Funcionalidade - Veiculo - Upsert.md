# Documentação: Cadastro de Veículo (Upsert)

> **Última Atualização**: 06/01/2026
> **Versão Atual**: 1.2

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
function GetModeloList(marcaId)
{
    try
    {
        $.ajax({
            url: "/Veiculo/Upsert?handler=ModeloList",
            method: "GET",
            data: { id: marcaId },
            success: function (res)
            {
                try
                {
                    var options = '<option value="">-- Selecione um Modelo --</option>';

                    if (res && res.data && res.data.length)
                    {
                        res.data.forEach(function (obj)
                        {
                            options += '<option value="' + obj.modeloId + '">' + obj.descricaoModelo + '</option>';
                        });
                    }

                    $('#ModeloId').html(options);

                    // Seleciona modelo se já existir
                    var modeloIdSelecionado = $('#Veiculo_ModeloId').val();
                    if (modeloIdSelecionado)
                    {
                        $('#ModeloId').val(modeloIdSelecionado);
                    }
                } catch (error)
                {
                    Alerta.TratamentoErroComLinha("veiculo_upsert.js", "GetModeloList.success", error);
                }
            },
            error: function (xhr)
            {
                try
                {
                    console.error("Erro ao carregar modelos:", xhr);
                    AppToast.show('Erro ao carregar modelos', 'Vermelho', 2000);
                } catch (error)
                {
                    Alerta.TratamentoErroComLinha("veiculo_upsert.js", "GetModeloList.error", error);
                }
            }
        });
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("veiculo_upsert.js", "GetModeloList", error);
    }
}
```

**Validação de Placa (FocusOut)**:

```javascript
$('#txtPlaca').on('focusout', function ()
{
    try
    {
        var placa = $(this).val();

        if (placa)
        {
            // Formata: remove espaços, remove hífens, converte para maiúsculo
            placa = placa.replace(/\s+/g, '').replace(/-/g, '').toUpperCase();
            $(this).val(placa);

            // Verifica se placa já existe
            if (placa.length >= 4)
            {
                var ultimos4 = placa.substr(placa.length - 4);
                verificarPlacaExistente(ultimos4);
            }
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("veiculo_upsert.js", "txtPlaca.focusout", error);
    }
});
```

**Lógica de Veículo Próprio (Toggle)**:

```javascript
function toggleCamposVeiculoProprio(veiculoProprio)
{
    try
    {
        if (veiculoProprio)
        {
            // É PRÓPRIO
            // Mostra Patrimônio
            $('#divPatrimonio').show();

            // DESABILITA Contrato e Ata (mas mantém visíveis)
            $('#lstcontratos').prop('disabled', true);
            $('#lstatas').prop('disabled', true);

            // Esconde e limpa Items
            $('#lstItemVeiculo').hide().val('');
            $('#lstItemVeiculoAta').hide().val('');
            $('#lblItemContrato').hide();
            $('#lblItemAta').hide();

            // Limpa valores de Contrato e Ata
            $('#lstcontratos').val('');
            $('#lstatas').val('');
        } else
        {
            // NÃO É PRÓPRIO
            // Esconde Patrimônio e limpa valor
            $('#divPatrimonio').hide();
            $('#txtPatrimonio').val('');

            // HABILITA Contrato e Ata
            $('#lstcontratos').prop('disabled', false);
            $('#lstatas').prop('disabled', false);
        }
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("veiculo_upsert.js", "toggleCamposVeiculoProprio", error);
    }
}
```

**Validação de Submit (Cliente)**:
Intercepta o submit para validações que o `required` do HTML5 não cobre.

```javascript
function validarCamposObrigatorios()
{
    try
    {
        var camposErro = [];

        // Marca
        if (!$('#listamarca').val())
        {
            camposErro.push('Marca');
        }

        // Modelo
        if (!$('#ModeloId').val())
        {
            camposErro.push('Modelo');
        }

        // Placa
        var placa = $('#txtPlaca').val();
        if (!placa || placa.trim() === '')
        {
            camposErro.push('Placa');
        }

        // Quilometragem
        var km = $('#VeiculoObj_Veiculo_Quilometragem').val();
        if (!km || km.trim() === '')
        {
            camposErro.push('Quilometragem');
        }

        // Unidade Vinculada
        if (!$('#VeiculoObj_Veiculo_UnidadeId').val())
        {
            camposErro.push('Unidade Vinculada');
        }

        // Combustível
        if (!$('#VeiculoObj_Veiculo_CombustivelId').val())
        {
            camposErro.push('Combustível');
        }

        // Categoria
        if (!$('#VeiculoObj_Veiculo_Categoria').val())
        {
            camposErro.push('Categoria');
        }

        // Data de Ingresso na Frota
        var dataIngresso = $('#txtDataChegada').val();
        if (!dataIngresso || dataIngresso.trim() === '')
        {
            camposErro.push('Data de Ingresso na Frota');
        }

        // Contrato OU Ata OU Veículo Próprio
        var contratoId = $('#lstcontratos').val();
        var ataId = $('#lstatas').val();
        var veiculoProprio = $('#chkVeiculoProprio').is(':checked');

        if (!contratoId && !ataId && !veiculoProprio)
        {
            camposErro.push('Contrato, Ata ou Veículo Próprio (escolha ao menos um)');
        }

        // Se tem Contrato E o campo está visível, precisa Item Contratual
        if (contratoId && $('#lstItemVeiculo').is(':visible') && !$('#lstItemVeiculo').val())
        {
            camposErro.push('Item Contratual (obrigatório quando há Contrato)');
        }

        // Se tem Ata E o campo está visível, precisa Item da Ata
        if (ataId && $('#lstItemVeiculoAta').is(':visible') && !$('#lstItemVeiculoAta').val())
        {
            camposErro.push('Item da Ata (obrigatório quando há Ata)');
        }

        // Se Veículo Próprio E campo está visível, precisa Patrimônio
        if (veiculoProprio && $('#txtPatrimonio').is(':visible'))
        {
            var patrimonio = $('#txtPatrimonio').val();
            if (!patrimonio || patrimonio.trim() === '')
            {
                camposErro.push('Nº Patrimônio (obrigatório para Veículo Próprio)');
            }
        }

        // Se encontrou erros, exibe alerta
        if (camposErro.length > 0)
        {
            var mensagem = 'Campos obrigatórios não preenchidos:\n\n• ' + camposErro.join('\n• ');
            console.log('Validação falhou. Campos:', camposErro);
            Alerta.Warning('Validação de Campos', mensagem, 'Ok');
            return false;
        }

        console.log('Validação passou! Submetendo formulário...');
        return true;
    } catch (error)
    {
        Alerta.TratamentoErroComLinha("veiculo_upsert.js", "validarCamposObrigatorios", error);
        return false;
    }
}
```

---

## Validações

### Validações Backend (`Upsert.cshtml.cs`)

Além das validações de frontend, o servidor realiza verificações robustas através do método `ChecaInconstancias`.

```csharp
private bool ChecaInconstancias(Guid id)
{
    try
    {
        // === VALIDAÇÕES DE CAMPOS OBRIGATÓRIOS BÁSICOS ===

        // Placa
        if (string.IsNullOrWhiteSpace(VeiculoObj.Veiculo.Placa))
        {
            _notyf.Error("Você precisa informar a placa do veículo!" , 3);
            return true;
        }

        // ... (outras validações de campos básicos)

        // === VALIDAÇÕES DE DUPLICIDADES ===

        // Verifica Placa Duplicada
        var existePlaca = _unitOfWork.Veiculo.GetFirstOrDefault(u =>
            u.Placa.ToUpper() == VeiculoObj.Veiculo.Placa.ToUpper()
        );

        if (id == Guid.Empty && existePlaca != null)
        {
            _notyf.Error("Já existe um veículo com essa placa!" , 3);
            return true;
        }

        if (existePlaca != null && existePlaca.VeiculoId != id)
        {
            _notyf.Error("Já existe um veículo com essa placa!" , 3);
            return true;
        }

        // ... (validação Renavam)

        // === VALIDAÇÕES DE VÍNCULO (Contrato/Ata/Próprio) ===

        // Deve ter ao menos um: Contrato, Ata ou Veículo Próprio
        if (
            (
                VeiculoObj.Veiculo.ContratoId == null
                && VeiculoObj.Veiculo.AtaId == null
                && VeiculoObj.Veiculo.VeiculoProprio == false
            )
        )
        {
            _notyf.Error(
                "Você precisa definir se o veículo é próprio ou se pertence a um Contrato ou a uma Ata!" ,
                3
            );
            return true;
        }

        // Se tem Contrato, precisa ter Item Contratual
        if (
            (
                VeiculoObj.Veiculo.ContratoId != null
                && VeiculoObj.Veiculo.ItemVeiculoId == null
            )
        )
        {
            _notyf.Error("Você precisa informar o Item Contratual do veículo!" , 3);
            return true;
        }

        // Se tem Ata, precisa ter Item da Ata
        if (
            (
                VeiculoObj.Veiculo.AtaId != null
                && VeiculoObj.Veiculo.ItemVeiculoAtaId == null
            )
        )
        {
            _notyf.Error("Você precisa informar o Item da Ata do veículo!" , 3);
            return true;
        }

        // Se é Veículo Próprio, precisa ter número de Patrimônio
        if (
            (
                VeiculoObj.Veiculo.VeiculoProprio == true
                && VeiculoObj.Veiculo.Patrimonio == null
            )
        )
        {
            _notyf.Error("Você precisa informar o número de patrimônio do veículo!" , 3);
            return true;
        }

        return false;
    }
    catch (Exception error)
    {
        Alerta.TratamentoErroComLinha("Upsert.cshtml.cs" , "ChecaInconstancias" , error);
        return false;
    }
}
```

**Método Submit (Insert)**:

```csharp
public IActionResult OnPostSubmit()
{
    try
    {
        // ... (preparação de dados)

        if (ChecaInconstancias(Guid.Empty))
        {
            SetViewModel();
            return Page();
        }

        // Processa o arquivo CRLV se foi enviado
        if (ArquivoCRLV != null && ArquivoCRLV.Length > 0)
        {
            using (var memoryStream = new MemoryStream())
            {
                ArquivoCRLV.CopyTo(memoryStream);
                VeiculoObj.Veiculo.CRLV = memoryStream.ToArray();
            }
        }

        // Adiciona o veículo
        if (VeiculoObj.Veiculo.VeiculoId == Guid.Empty)
        {
            _unitOfWork.Veiculo.Add(VeiculoObj.Veiculo);

            // Adiciona o veículo ao contrato, caso selecionado
            if (VeiculoObj.Veiculo.ContratoId != null)
            {
                VeiculoContrato veiculoContrato = new VeiculoContrato
                {
                    ContratoId = (Guid)VeiculoObj.Veiculo.ContratoId ,
                    VeiculoId = VeiculoObj.Veiculo.VeiculoId ,
                };
                _unitOfWork.VeiculoContrato.Add(veiculoContrato);
            }

            _unitOfWork.Save();

            AppToast.show("Verde" , "Veículo criado com sucesso!" , 2000);
        }

        return RedirectToPage("./Index");
    }
    catch (Exception error)
    {
        Alerta.TratamentoErroComLinha("Upsert.cshtml.cs" , "OnPostSubmit" , error);
        return RedirectToPage("./Index");
    }
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
