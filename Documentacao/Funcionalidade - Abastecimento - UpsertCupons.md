# Documentação: Abastecimento - Registro de Cupons (Upsert)

> **Última Atualização**: 06/01/2026
> **Versão Atual**: 1.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Funcionalidades Específicas](#funcionalidades-específicas)
4. [Endpoints API](#endpoints-api)
5. [Frontend](#frontend)
6. [Troubleshooting](#troubleshooting)

---

## Visão Geral

A página **Upsert Cupons** é responsável pelo cadastro e edição dos lotes de cupons digitalizados. Permite definir a data do registro, fazer upload do arquivo PDF e adicionar observações ricas (HTML).

### Características Principais

- ✅ **Upload de PDF**: Componente Kendo Upload para envio do arquivo.
- ✅ **Visualização Imediata**: Kendo PDF Viewer exibe o arquivo logo após o upload.
- ✅ **Editor de Texto Rico**: Syncfusion RTE para observações.
- ✅ **Formulário Upsert**: Trata criação e edição na mesma interface.

---

## Arquitetura

### Estrutura de Arquivos

```
FrotiX.Site/
├── Pages/
│   └── Abastecimento/
│       ├── UpsertCupons.cshtml      # View
│       └── UpsertCupons.cshtml.cs   # PageModel (Backend)
```

### Tecnologias Utilizadas

| Tecnologia | Uso |
|------------|-----|
| **Razor Pages** | Estrutura e Binding |
| **Kendo UI Upload** | Upload de arquivo |
| **Kendo UI PDFViewer** | Visualização de PDF |
| **Syncfusion RTE** | Editor de texto |

---

## Funcionalidades Específicas

### 1. Upload e Visualização de PDF
O fluxo de upload é gerenciado pelo Kendo Upload.

**Configuração do Uploader**:
```javascript
$("#pdf").kendoUpload({
    async: {
        saveUrl: "/Abastecimento/UpsertCupons?handler=SavePDF",
        removeUrl: "/Abastecimento/UpsertCupons?handler=RemovePDF"
    },
    validation: {
        allowedExtensions: [".pdf"]
    },
    success: onSuccess
});
```

**Callback de Sucesso (`onSuccess`)**:
```javascript
function onSuccess(e) {
    // Remove viewer antigo
    $("#pdfViewer").remove();
    $("#PDFContainer").append("<div id='pdfViewer'></div>");

    var files = e.files;
    $.each(files, function () {
        // Normaliza nome do arquivo (remove acentos)
        document.getElementById("txtRegistroPDF").setAttribute('value', TiraAcento(this.name));

        // Inicializa Viewer
        $("#pdfViewer").kendoPDFViewer({
            pdfjsProcessing: {
                file: "/DadosEditaveis/Cupons/" + document.getElementById("txtRegistroPDF").value
            },
            width: "100%",
            height: 400
        });
    });
}
```

### 2. Editor de Observações
Utiliza o componente `<ejs-richtexteditor>` configurado para permitir inserção de imagens.

### 3. Submissão do Formulário
O botão de submit principal é interceptado via JavaScript para validação antes de disparar o submit real (um botão hidden `#btnEscondido`).

```javascript
$("#btnSubmit").on("click", function (event) {
    event.preventDefault();
    if (document.getElementById("txtDataRegistro").value === "") {
        swal({ title: "Informação Ausente", text: "A Data do Registro é obrigatória", icon: "error" });
        return;
    }
    $("#btnEscondido").trigger("click");
});
```

---

## Endpoints API (Handlers)

A página utiliza Handlers do Razor Pages para o upload.

### 1. POST `/Abastecimento/UpsertCupons?handler=SavePDF`
Recebe o arquivo enviado pelo Kendo Upload e salva no diretório do servidor (`/DadosEditaveis/Cupons/`).

### 2. POST `/Abastecimento/UpsertCupons?handler=RemovePDF`
Remove o arquivo do servidor (se necessário/implementado).

---

## Frontend

### Validação de "Enter"
Script para impedir o submit acidental ao pressionar Enter em campos do formulário.

```javascript
function stopEnterSubmitting(e) {
    if (e.keyCode === 13) {
        var src = e.srcElement || e.target;
        if (src.tagName.toLowerCase() !== "div") { // Permite enter em divs (como o RTE)
            e.preventDefault();
            return false;
        }
    }
}
```

---

## Troubleshooting

### Problema: PDF não aparece após upload
**Sintoma**: Upload conclui ("Arquivo Carregado"), mas viewer não renderiza.
**Causa**: Handler `SavePDF` falhou silenciosamente ou caminho do arquivo no JS não bate com onde foi salvo.
**Solução**: Verificar se a função `TiraAcento` está gerando o mesmo nome que o backend salvou.

### Problema: Botão "Criar Cupom" não faz nada
**Sintoma**: Clica e nada acontece.
**Causa**: Erro de JS no `event.preventDefault()` ou validação falhando sem mostrar alerta.
**Solução**: Verificar console por erros como `swal is not defined` (se SweetAlert não carregou).

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [06/01/2026] - Criação da Documentação

**Descrição**:
Documentação inicial da página de Upsert de Cupons.

**Status**: ✅ **Documentado**

**Responsável**: Claude (AI Assistant)
**Versão**: 1.0
