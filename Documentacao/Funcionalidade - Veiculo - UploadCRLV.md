# Documentação: Upload de CRLV

> **Última Atualização**: 06/01/2026
> **Versão Atual**: 1.1

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

A página **Upload de CRLV** é uma interface dedicada para a gestão digitalizada do Certificado de Registro e Licenciamento de Veículo (CRLV). Ela permite o upload, substituição e visualização do documento PDF associado a um veículo específico.

### Características Principais

- ✅ **Upload Assíncrono**: Uso do componente Syncfusion Uploader para envio sem refresh.
- ✅ **Visualização Integrada**: Componente Syncfusion PDF Viewer para ler o documento na própria página.
- ✅ **Persistência no Banco**: O arquivo é salvo como binário (`byte[]`) diretamente no registro do veículo.
- ✅ **Feedback Visual**: Toasts de sucesso/erro e barra de progresso.

---

## Arquitetura

### Estrutura de Arquivos

```
FrotiX.Site/
├── Pages/
│   └── Veiculo/
│       ├── UploadCRLV.cshtml            # Interface (HTML + Scripts inline)
│       └── UploadCRLV.cshtml.cs         # PageModel (Backend básico)
│
├── Controllers/
│   ├── UploadCRLVController.cs          # API para salvar/remover arquivo
│   └── PdfViewerController.cs           # API para servir o arquivo ao viewer
```

### Tecnologias Utilizadas

| Tecnologia | Uso |
|------------|-----|
| **Syncfusion Uploader** | Componente de upload de arquivos (`ejs-uploader`) |
| **Syncfusion PDF Viewer** | Componente de visualização de PDF (`ejs-pdfviewer`) |
| **ASP.NET Core API** | Endpoints para manipulação do binário |
| **Bootstrap 5** | Layout |

---

## Funcionalidades Específicas

### 1. Upload de Arquivo
Utiliza o componente `<ejs-uploader>` configurado para aceitar apenas `.pdf`.
- **Configuração Async**: Aponta para `api/UploadCRLV/Save` e `api/UploadCRLV/Remove`.
- **Parâmetro Extra**: Envia `veiculoId` na Query String para identificar o registro.

```csharp
// Configuração no Razor (UploadCRLV.cshtml)
var asyncSettings = new Syncfusion.EJ2.Inputs.UploaderAsyncSettings
{
    SaveUrl = $"api/UploadCRLV/Save?veiculoId={Model.VeiculoObj.Veiculo.VeiculoId}",
    RemoveUrl = $"api/UploadCRLV/Remove?veiculoId={Model.VeiculoObj.Veiculo.VeiculoId}"
};
```

### 2. Visualização de PDF
Utiliza o componente `<ejs-pdfviewer>`.
- **Service URL**: Aponta para `/api/PdfViewer`.
- **Carregamento Inicial**: Se o veículo já possui CRLV (`Model.CRLV == 1`), o viewer é carregado automaticamente via AJAX no `document.ready`.
- **Pós-Upload**: Após um upload bem-sucedido, o viewer é recarregado com o novo arquivo.

### 3. Remoção de Arquivo
Permite remover o arquivo atual. O componente Uploader chama o endpoint de remoção, que seta o campo `CRLV` como `null` no banco.

---

## Endpoints API

### 1. POST `/api/UploadCRLV/Save`
Recebe o arquivo e salva no banco.

**Implementação (`UploadCRLVController.cs`)**:
```csharp
[HttpPost]
[Route("Save")]
public IActionResult Save(IList<IFormFile> UploadFiles, [FromQuery] Guid veiculoId)
{
    if (UploadFiles != null && veiculoId != Guid.Empty)
    {
        foreach (var file in UploadFiles)
        {
            var objFromDb = _unitOfWork.Veiculo.GetFirstOrDefault(u => u.VeiculoId == veiculoId);
            if (objFromDb != null)
            {
                using (var target = new MemoryStream())
                {
                    file.CopyTo(target);
                    objFromDb.CRLV = target.ToArray();
                }
                _unitOfWork.Veiculo.Update(objFromDb);
                _unitOfWork.Save();
            }
        }
    }
    return Content("");
}
```

### 2. POST `/api/UploadCRLV/Remove`
Remove o arquivo do banco.

**Implementação**:
```csharp
[HttpPost]
[Route("Remove")]
public IActionResult Remove(IList<IFormFile> UploadFiles, [FromQuery] Guid veiculoId)
{
    var objFromDb = _unitOfWork.Veiculo.GetFirstOrDefault(u => u.VeiculoId == veiculoId);
    if (objFromDb != null)
    {
        objFromDb.CRLV = null;
        _unitOfWork.Veiculo.Update(objFromDb);
        _unitOfWork.Save();
    }
    return Content("");
}
```

---

## Frontend

### Scripts Inline (`UploadCRLV.cshtml`)

O script da página gerencia os eventos dos componentes Syncfusion.

**Upload Concluído (`onActionComplete`)**:
Esta função é chamada automaticamente pelo componente após o upload.
```javascript
window.onActionComplete = function(args) {
    if (!args || !args.fileData || !args.fileData.length) return;

    // Exibe o viewer (que estava oculto)
    var div = document.getElementById("divpdf");
    if (div) {
        div.style.visibility = "visible";
        div.style.height = "600px";
    }

    // Carrega o PDF recém enviado no viewer
    $.ajax({
        url: '/api/PdfViewer/GetDocument?id=@Model.VeiculoObj.Veiculo.VeiculoId',
        method: 'POST',
        cache: false,
        processData: false,
        contentType: false
    })
    .done(function (result) {
        var pdfViewer = document.getElementById('pdfviewer');
        if (pdfViewer && pdfViewer.ej2_instances && pdfViewer.ej2_instances[0]) {
            pdfViewer.ej2_instances[0].load(result, null);
        }
    });
};
```

**Carregamento Inicial (se já existir arquivo)**:
```javascript
$(document).ready(function () {
    if (@Model.CRLV == 1) { // Verifica flag do modelo
        // Mostra div
        document.getElementById("divpdf").style.visibility = "visible";

        // Busca documento
        $.ajax({
            url: '/api/PdfViewer/GetDocument?id=@Model.VeiculoObj.Veiculo.VeiculoId',
            method: 'POST',
            // ...
        }).done(function(result) {
            // Carrega no viewer
        });
    }
});
```

---

## Troubleshooting

### Problema: "Erro ao carregar documento PDF"
**Sintoma**: Upload funciona, mas viewer fica branco ou exibe erro.
**Causa**: O endpoint `/api/PdfViewer/GetDocument` pode estar retornando erro 500 ou 404, ou o arquivo no banco está corrompido (tamanho 0).
**Solução**: Verificar se o `veiculoId` está correto na URL e se o banco contém dados na coluna `CRLV`.

### Problema: Upload falha com arquivos grandes
**Sintoma**: Erro "Falha no upload" ou "InvalidMaxFileSize".
**Causa**: Limite de tamanho de requisição no IIS ou validação do componente.
**Solução**: Verificar `web.config` (`maxAllowedContentLength`) e configuração do `ejs-uploader` (embora o código atual mostre mensagem customizada para 4MB, o limite real é definido no servidor).

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [06/01/2026] - Criação da Documentação

**Descrição**:
Documentação inicial da página de Upload de CRLV.

**Status**: ✅ **Documentado**

**Responsável**: Claude (AI Assistant)
**Versão**: 1.0
