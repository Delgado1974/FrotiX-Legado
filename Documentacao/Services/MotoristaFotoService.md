# MotoristaFotoService.cs

## Visão Geral
Serviço para **processamento e cache de fotos de motoristas**. Redimensiona imagens grandes e converte para Base64 para exibição no frontend, com cache em memória para performance.

## Localização
`Services/MotoristaFotoService.cs`

## Dependências
- `Microsoft.Extensions.Caching.Memory` (`IMemoryCache`)
- `System.Drawing` (Windows-specific)
- `System.Runtime.Versioning` (`SupportedOSPlatform`)

## Características

### Plataforma Específica
- ⚠️ **Windows-only**: Usa `System.Drawing`, que só funciona no Windows
- Atributo `[SupportedOSPlatform("windows")]` indica dependência de plataforma

### Cache em Memória
- Cache de 1 hora por foto
- Chave: `"foto_{motoristaId}"`
- Reduz processamento repetido da mesma foto

---

## Métodos Principais

### `ObterFotoBase64(Guid motoristaId, byte[] fotoOriginal)`
**Propósito**: Obtém foto do motorista em Base64, com cache e redimensionamento automático.

**Fluxo**:
1. Verifica se foto é `null` ou vazia → retorna `null`
2. Tenta buscar do cache (`"foto_{motoristaId}"`)
3. Se não estiver em cache:
   - Se foto > 50KB: redimensiona para 60x60 pixels
   - Se foto ≤ 50KB: usa foto original
4. Converte para Base64: `"data:image/jpeg;base64,{base64}"`
5. Armazena no cache por 1 hora
6. Retorna string Base64

**Retorno**: `string` (Base64 com prefixo `data:image/jpeg;base64,`) ou `null`

**Chamado de**: 
- `Controllers/MotoristaController` (endpoint de foto)
- Páginas que exibem fotos de motoristas

**Complexidade**: Média (processamento de imagem)

---

### `RedimensionarImagem(byte[] imagemBytes, int largura, int altura)`
**Propósito**: Redimensiona imagem para tamanho específico usando `System.Drawing`.

**Fluxo**:
1. Carrega imagem original de `MemoryStream`
2. Cria `Bitmap` com dimensões desejadas
3. Usa `Graphics` com qualidade otimizada:
   - `CompositingQuality.HighSpeed`: Performance sobre qualidade
   - `InterpolationMode.Low`: Interpolação rápida
   - `CompositingMode.SourceCopy`: Copia direta
4. Desenha imagem redimensionada
5. Salva como JPEG em `MemoryStream`
6. Retorna bytes da imagem redimensionada

**Parâmetros**:
- `imagemBytes`: Bytes da imagem original
- `largura`: Largura desejada (ex.: 60)
- `altura`: Altura desejada (ex.: 60)

**Retorno**: `byte[]` (imagem redimensionada) ou `null` em caso de erro

**Complexidade**: Média (processamento de imagem)

---

## Configuração de Cache

```csharp
_cache.Set(cacheKey, fotoBase64, TimeSpan.FromHours(1));
```

- **TTL**: 1 hora
- **Chave**: `"foto_{motoristaId}"`
- **Tipo**: `string` (Base64 completo)

---

## Contribuição para o Sistema FrotiX

### 🖼️ Performance
- Cache reduz processamento repetido
- Redimensionamento automático reduz tamanho de transferência
- Base64 permite exibição direta em HTML (`<img src="data:image/jpeg;base64,...">`)

### 💾 Otimização de Armazenamento
- Fotos grandes (>50KB) são redimensionadas para 60x60
- Reduz uso de memória e largura de banda
- Mantém qualidade suficiente para exibição em thumbnails

### 🔄 Compatibilidade
- Formato JPEG garantido (compatível com todos os navegadores)
- Base64 permite exibição sem arquivos separados

## Observações Importantes

1. **⚠️ Windows-Only**: Este serviço só funciona no Windows devido ao uso de `System.Drawing`. Para Linux/macOS, considere usar `SkiaSharp` ou `ImageSharp`.

2. **Limite de Redimensionamento**: Fotos > 50KB são redimensionadas para 60x60. Este limite pode ser ajustado conforme necessário.

3. **Qualidade vs Performance**: O redimensionamento usa configurações de baixa qualidade (`HighSpeed`, `Low`) para priorizar performance. Se precisar de melhor qualidade, ajuste para `HighQuality` e `Bicubic`.

4. **Cache Invalidation**: Não há método para invalidar cache manualmente. Se uma foto for atualizada, o cache antigo permanecerá por 1 hora.

5. **Error Handling**: Métodos retornam `null` em caso de erro, mas não logam exceções. Considere adicionar logging.

6. **Formato Fixo**: Sempre retorna JPEG, mesmo se a imagem original for PNG/GIF. Isso pode reduzir qualidade em imagens com transparência.

## Alternativa Cross-Platform

Para suportar Linux/macOS, considere usar `SkiaSharp`:

```csharp
using SkiaSharp;

public byte[] RedimensionarImagem(byte[] imagemBytes, int largura, int altura)
{
    using var inputStream = new MemoryStream(imagemBytes);
    using var imagemOriginal = SKBitmap.Decode(inputStream);
    
    var info = new SKImageInfo(largura, altura, SKColorType.Rgba8888);
    using var imagemRedimensionada = imagemOriginal.Resize(info, SKFilterQuality.Low);
    
    using var outputStream = new MemoryStream();
    imagemRedimensionada.Encode(SKEncodedImageFormat.Jpeg, 85).SaveTo(outputStream);
    
    return outputStream.ToArray();
}
```

## Arquivos Relacionados
- `Controllers/MotoristaController.cs`: Usa `MotoristaFotoService` para exibir fotos
- `Models/Motorista.cs`: Entidade com propriedade `Foto` (byte[])
- `Pages/Motorista/`: Páginas que exibem fotos de motoristas
