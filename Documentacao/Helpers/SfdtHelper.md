# Documentação: SfdtHelper.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

A classe `SfdtHelper` é um utilitário estático para conversão de documentos DOCX em imagens PNG usando Syncfusion e SkiaSharp.

**Principais características:**

✅ **Conversão DOCX → PNG**: Converte documentos Word em imagens  
✅ **Syncfusion Integration**: Usa Syncfusion DocIO e PDF Viewer  
✅ **SkiaSharp**: Para renderização de imagens  
✅ **Pipeline Completo**: DOCX → PDF → Imagem PNG

---

## Estrutura da Classe

### Classe Estática

```csharp
public static class SfdtHelper
```

**Padrão**: Classe estática com método utilitário

---

## Método Principal

### `SalvarImagemDeDocx(byte[] docxBytes)`

**Descrição**: Converte um documento DOCX em imagem PNG (primeira página)

**Parâmetros**:
- `docxBytes`: Array de bytes do arquivo DOCX

**Retorno**: `byte[]` - Bytes da imagem PNG, ou exceção se erro

**Pipeline de Conversão**:
1. **DOCX → PDF**: Usa `DocIORenderer.ConvertToPDF()`
2. **PDF → Bitmap**: Usa `PdfRenderer.ExportAsImage(0)` (primeira página)
3. **Bitmap → PNG**: Usa SkiaSharp para codificar como PNG com qualidade 100

**Uso**:
```csharp
byte[] docxBytes = File.ReadAllBytes("documento.docx");
byte[] imagemPng = SfdtHelper.SalvarImagemDeDocx(docxBytes);

File.WriteAllBytes("preview.png", imagemPng);
```

---

## Fluxo Detalhado

### Passo 1: Carregar DOCX

```csharp
using var docStream = new MemoryStream(docxBytes);
using var document = new WordDocument(docStream, FormatType.Docx);
```

**Biblioteca**: `Syncfusion.DocIO`

---

### Passo 2: Converter para PDF

```csharp
using var renderer = new DocIORenderer();
using var pdfDoc = renderer.ConvertToPDF(document);
```

**Biblioteca**: `Syncfusion.DocIORenderer`

**Resultado**: Documento PDF em memória

---

### Passo 3: Salvar PDF em Stream

```csharp
using var pdfStream = new MemoryStream();
pdfDoc.Save(pdfStream);
byte[] pdfBytes = pdfStream.ToArray();
```

**Resultado**: Bytes do PDF

---

### Passo 4: Carregar PDF e Renderizar Primeira Página

```csharp
using var input = new MemoryStream(pdfBytes);
using var loadedPdf = new PdfLoadedDocument(input);
var pdfRenderer = new PdfRenderer();
pdfRenderer.Load(input);

using var bitmap = pdfRenderer.ExportAsImage(0); // página 0 (primeira)
```

**Biblioteca**: `Syncfusion.Pdf`, `Syncfusion.EJ2.PdfViewer`

**Resultado**: Bitmap da primeira página

---

### Passo 5: Converter Bitmap para PNG

```csharp
using var img = SKImage.FromBitmap(bitmap);
using var encoded = img.Encode(SKEncodedImageFormat.Png, 100);
return encoded.ToArray();
```

**Biblioteca**: `SkiaSharp`

**Qualidade**: 100 (máxima)

**Resultado**: Bytes da imagem PNG

---

## Interconexões

### Quem Usa Esta Classe

- **EditorController**: Para extrair imagens de documentos DOCX
- **Sistema de Documentos**: Para gerar previews de documentos

### O Que Esta Classe Usa

- **Syncfusion.DocIO**: Leitura de DOCX
- **Syncfusion.DocIORenderer**: Conversão DOCX → PDF
- **Syncfusion.Pdf**: Manipulação de PDF
- **Syncfusion.EJ2.PdfViewer**: Renderização de PDF
- **SkiaSharp**: Conversão Bitmap → PNG

---

## Limitações

### Apenas Primeira Página

⚠️ **Limitação**: Método sempre retorna apenas a primeira página do documento

**Motivo**: `ExportAsImage(0)` está hardcoded

**Solução Futura**: Adicionar parâmetro `pageIndex` se necessário

---

### Qualidade Fixa

⚠️ **Qualidade**: PNG sempre com qualidade 100

**Impacto**: Arquivos podem ser grandes

---

## Casos de Uso

### Exemplo 1: Preview de Documento

```csharp
public IActionResult UploadDocumento(IFormFile arquivo)
{
    byte[] docxBytes;
    using (var stream = new MemoryStream())
    {
        arquivo.CopyTo(stream);
        docxBytes = stream.ToArray();
    }

    // Gerar preview da primeira página
    byte[] previewPng = SfdtHelper.SalvarImagemDeDocx(docxBytes);
    
    // Salvar preview
    _documento.PreviewImagem = previewPng;
    _unitOfWork.Save();
    
    return Ok();
}
```

### Exemplo 2: Thumbnail de Documento

```csharp
public byte[] GerarThumbnail(byte[] docxBytes)
{
    // Gerar imagem da primeira página
    byte[] imagem = SfdtHelper.SalvarImagemDeDocx(docxBytes);
    
    // Redimensionar para thumbnail (usando ImageHelper)
    byte[] thumbnail = ImageHelper.ResizeImage(imagem, 200, 200);
    
    return thumbnail;
}
```

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do SfdtHelper

**Arquivos Afetados**:
- `Helpers/SfdtHelper.cs`

**Impacto**: Documentação de referência para conversão de documentos

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
