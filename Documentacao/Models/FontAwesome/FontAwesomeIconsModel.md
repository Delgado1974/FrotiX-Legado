# Documentação: FontAwesomeIconsModel.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Estrutura de Arquivos](#estrutura-de-arquivos)
4. [Estrutura do Model](#estrutura-do-model)
5. [Interconexões](#interconexões)
6. [Exemplos de Uso](#exemplos-de-uso)
7. [Troubleshooting](#troubleshooting)

---

## Visão Geral

O Model `FontAwesomeIconsModel` fornece estruturas para carregar e trabalhar com ícones FontAwesome traduzidos para português brasileiro. Facilita a busca e seleção de ícones através de categorias e palavras-chave em português.

**Principais características:**

✅ **Tradução PT-BR**: Categorias e labels traduzidos  
✅ **Busca por Keywords**: Suporte a palavras-chave em português  
✅ **Categorização**: Ícones organizados por categorias  
✅ **JSON Loader**: Helper para carregar arquivo JSON de ícones  
✅ **Integração com Menu**: Usado no sistema de navegação

### Objetivo

O `FontAwesomeIconsModel` resolve o problema de:
- Facilitar busca de ícones por termos em português
- Organizar ícones por categorias traduzidas
- Integrar com sistema de seleção de ícones
- Melhorar UX na escolha de ícones para menus

---

## Arquitetura

### Tecnologias Utilizadas

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| System.Text.Json | - | Serialização JSON |
| FontAwesome | 6.x | Biblioteca de ícones |

---

## Estrutura de Arquivos

### Arquivo Principal
```
Models/FontAwesome/FontAwesomeIconsModel.cs
```

### Arquivos Relacionados
- `fontawesome-icons.json` - Arquivo JSON com ícones traduzidos
- `Controllers/NavigationController.cs` - Gestão de recursos/ícones
- `Pages/Administracao/GestaoRecursosNavegacao.cshtml` - Interface de seleção

---

## Estrutura do Model

```csharp
public class FontAwesomeCategoryPT
{
    [JsonPropertyName("categoria")]
    public string Categoria { get; set; }

    [JsonPropertyName("categoriaOriginal")]
    public string CategoriaOriginal { get; set; }

    [JsonPropertyName("icones")]
    public List<FontAwesomeIconPT> Icones { get; set; } = new();
}

public class FontAwesomeIconPT
{
    [JsonPropertyName("id")]
    public string Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; }

    [JsonPropertyName("label")]
    public string Label { get; set; }

    [JsonPropertyName("keywords")]
    public List<string> Keywords { get; set; } = new();
}

internal static class FontAwesomeIconsLoader
{
    public static List<FontAwesomeCategoryPT> FromJson(string json);
}
```

**Classes:**

- `FontAwesomeCategoryPT`: Categoria de ícones traduzida
- `FontAwesomeIconPT`: Ícone individual com tradução
- `FontAwesomeIconsLoader`: Helper para carregar JSON

---

## Interconexões

### Quem Chama Este Arquivo

#### 1. **NavigationController.GetFontAwesomeIcons()** → Lista Ícones

**Quando**: Interface de seleção de ícones  
**Por quê**: Retornar ícones traduzidos para busca

```csharp
var json = File.ReadAllText("fontawesome-icons.json");
var categorias = FontAwesomeIconsLoader.FromJson(json);
return Ok(categorias);
```

---

## Exemplos de Uso

### Cenário 1: Buscar Ícones por Palavra-chave

**Situação**: Usuário busca ícone digitando "carro"

**Código**:
```csharp
var categorias = FontAwesomeIconsLoader.FromJson(json);
var resultados = categorias
    .SelectMany(c => c.Icones)
    .Where(i => i.Keywords.Any(k => k.Contains("carro", StringComparison.OrdinalIgnoreCase)))
    .ToList();
```

**Resultado**: Lista de ícones relacionados a "carro"

---

## Notas Importantes

1. **JSON**: Depende de arquivo `fontawesome-icons.json` na raiz
2. **Tradução**: Categorias e labels traduzidos para PT-BR
3. **Keywords**: Permite busca flexível por termos relacionados

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
