# Documentação: ImageHelper.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

A classe `ImageHelper` é um utilitário estático para validação e manipulação de imagens, especialmente redimensionamento de imagens JPEG e PNG.

**Principais características:**

✅ **Validação de Imagens**: Verifica se bytes representam imagem válida  
✅ **Redimensionamento**: Redimensiona imagens mantendo proporção  
✅ **Suporte Windows**: Usa `System.Drawing` (apenas Windows)  
✅ **Formatos Suportados**: JPEG e PNG

---

## Estrutura da Classe

### Classe Estática com Plataforma Específica

```csharp
[SupportedOSPlatform("windows")]
public static class ImageHelper
```

**Nota**: Requer Windows devido ao uso de `System.Drawing`

---

## Métodos Principais

### `IsImageValid(byte[] imageData)`

**Descrição**: Verifica se um array de bytes representa uma imagem válida

**Parâmetros**:
- `imageData`: Array de bytes da imagem

**Retorno**: `bool` - `true` se válida, `false` caso contrário

**Lógica**:
1. Cria `MemoryStream` a partir dos bytes
2. Tenta carregar imagem com `Image.FromStream()`
3. Retorna `true` se sucesso, `false` se exceção

**Uso**:
```csharp
byte[] imageBytes = File.ReadAllBytes("foto.jpg");
if (ImageHelper.IsImageValid(imageBytes))
{
    // imagem válida
}
```

**Tratamento de Erro**: Silencioso - retorna `false` em caso de erro

---

### `ResizeImage(byte[] imageData, int width, int height)`

**Descrição**: Redimensiona uma imagem JPEG ou PNG para dimensões especificadas

**Parâmetros**:
- `imageData`: Array de bytes da imagem original
- `width`: Largura desejada (pixels)
- `height`: Altura desejada (pixels)

**Retorno**: `byte[]` - Bytes da imagem redimensionada em JPEG, ou `null` se erro

**Lógica**:
1. Valida imagem com `IsImageValid()`
2. Carrega imagem original em `MemoryStream`
3. Cria `Bitmap` com dimensões desejadas
4. Desenha imagem original redimensionada no novo bitmap
5. Salva como JPEG com qualidade 100
6. Retorna bytes do JPEG

**Configurações de Qualidade**:
- `CompositingQuality.HighSpeed`: Performance otimizada
- `InterpolationMode.Low`: Interpolação rápida
- `CompositingMode.SourceCopy`: Copia direta

**Uso**:
```csharp
byte[] originalImage = File.ReadAllBytes("foto.jpg");
byte[] resizedImage = ImageHelper.ResizeImage(originalImage, 800, 600);

if (resizedImage != null)
{
    File.WriteAllBytes("foto_redimensionada.jpg", resizedImage);
}
```

**Nota**: Sempre retorna JPEG, mesmo se entrada for PNG

**Tratamento de Erro**: Retorna `null` em caso de erro e escreve no console

---

## Interconexões

### Quem Usa Esta Classe

- **Controllers de Upload**: Para validar e redimensionar imagens enviadas
- **MotoristaController**: Para redimensionar fotos de motoristas
- **EncarregadoController**: Para redimensionar fotos de encarregados
- **OperadorController**: Para redimensionar fotos de operadores

### O Que Esta Classe Usa

- **System.Drawing**: `Image`, `Bitmap`, `Graphics`
- **System.Drawing.Drawing2D**: `CompositingQuality`, `InterpolationMode`
- **System.Drawing.Imaging**: `ImageFormat`
- **System.IO**: `MemoryStream`

---

## Limitações

### Plataforma

⚠️ **Windows Only**: Usa `System.Drawing` que só funciona no Windows

**Alternativas para Cross-Platform**:
- SkiaSharp (já usado em `SfdtHelper.cs`)
- ImageSharp
- SixLabors.ImageSharp

---

### Formato de Saída

⚠️ **Sempre JPEG**: Método `ResizeImage()` sempre retorna JPEG, mesmo se entrada for PNG

**Motivo**: `ImageFormat.Jpeg` está hardcoded na linha 51

---

### Qualidade de Redimensionamento

⚠️ **Qualidade Baixa**: Usa `InterpolationMode.Low` para performance

**Impacto**: Pode resultar em imagens com qualidade reduzida em redimensionamentos grandes

---

## Exemplos de Uso

### Exemplo 1: Validação Antes de Salvar

```csharp
public IActionResult UploadFoto(IFormFile arquivo)
{
    byte[] imageBytes;
    using (var stream = new MemoryStream())
    {
        arquivo.CopyTo(stream);
        imageBytes = stream.ToArray();
    }

    if (!ImageHelper.IsImageValid(imageBytes))
    {
        return BadRequest("Arquivo não é uma imagem válida");
    }

    // Salvar imagem
    _motorista.Foto = imageBytes;
    _unitOfWork.Save();
    
    return Ok();
}
```

### Exemplo 2: Redimensionamento para Thumbnail

```csharp
public IActionResult UploadFoto(IFormFile arquivo)
{
    byte[] originalBytes;
    using (var stream = new MemoryStream())
    {
        arquivo.CopyTo(stream);
        originalBytes = stream.ToArray();
    }

    // Redimensionar para thumbnail 200x200
    byte[] thumbnail = ImageHelper.ResizeImage(originalBytes, 200, 200);
    
    if (thumbnail != null)
    {
        _motorista.Foto = thumbnail;
        _unitOfWork.Save();
    }
    
    return Ok();
}
```

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do ImageHelper

**Arquivos Afetados**:
- `Helpers/ImageHelper.cs`

**Impacto**: Documentação de referência para manipulação de imagens

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
