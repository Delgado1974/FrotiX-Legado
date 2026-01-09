# Documentação: PdfViewerCNHController.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `PdfViewerCNHController` fornece endpoints específicos para visualização de PDFs de CNH usando Syncfusion PDF Viewer com cache.

**Principais características:**

✅ **Visualização PDF CNH**: Carregamento e renderização de PDFs de CNH  
✅ **Cache**: Usa `IMemoryCache` para otimização  
✅ **Syncfusion**: Integração com Syncfusion PDF Viewer

---

## Endpoints API

### POST `/api/PdfViewerCNH/Load`

**Descrição**: Carrega PDF de CNH para visualização

**Request Body**: `Dictionary<string, string>` com documento (arquivo ou Base64)

**Response**: JSON com dados do PDF para Syncfusion PDF Viewer

---

### POST `/api/PdfViewerCNH/RenderPdfPages`

**Descrição**: Renderiza páginas específicas do PDF

---

## Interconexões

### Quem Chama Este Controller

- **Syncfusion PDF Viewer**: Componente de visualização
- **Pages**: Páginas que exibem CNH

### O Que Este Controller Chama

- **Syncfusion PDF Renderer**: Biblioteca de renderização
- **`_cache`**: Cache de memória
- **`_unitOfWork`**: Acesso a dados de motoristas

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do PdfViewerCNHController

**Arquivos Afetados**:
- `Controllers/PdfViewerCNHController.cs`

**Impacto**: Documentação de referência para visualização de CNH

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
