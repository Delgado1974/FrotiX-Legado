# Documentação: MultaUploadController.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `MultaUploadController` gerencia upload e remoção de arquivos PDF de multas usando Syncfusion EJ2 Uploader.

**Principais características:**

✅ **Upload Múltiplo**: Suporte a upload de múltiplos arquivos PDF  
✅ **Validação**: Validação de extensão (apenas PDF)  
✅ **Normalização**: Normalização de nomes de arquivos (remove acentos)  
✅ **Timestamp**: Adiciona timestamp para evitar conflitos  
✅ **Remoção**: Remove arquivos por nome ou via UploadFiles

---

## Endpoints API

### POST `/api/MultaUpload/Save`

**Descrição**: Salva arquivos PDF de multas

**Request**: `multipart/form-data` com `UploadFiles` (IList<IFormFile>)

**Validações**:
- Apenas arquivos `.pdf` são aceitos
- Normaliza nome do arquivo (remove acentos)
- Adiciona timestamp para evitar conflitos

**Response**: Lista de arquivos com status de sucesso/falha

---

### POST `/api/MultaUpload/Remove`

**Descrição**: Remove arquivos PDF de multas

**Request**: `multipart/form-data` com `UploadFiles` ou `fileName` via form data

**Lógica**: Remove arquivo de `wwwroot/DadosEditaveis/Multas/`

---

### GET `/api/MultaUpload/GetFileList`

**Descrição**: Lista todos os arquivos PDF disponíveis na pasta de multas

**Response**: Lista com nome, tamanho, tipo e data de modificação

---

## Interconexões

### Quem Chama Este Controller

- **Syncfusion EJ2 Uploader**: Componente de upload
- **Pages**: `Pages/Multa/*.cshtml` - Páginas de gestão de multas

### O Que Este Controller Chama

- **`Servicos.TiraAcento()`**: Normalização de nomes
- **`IWebHostEnvironment`**: Caminho do diretório web

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do MultaUploadController

**Arquivos Afetados**:
- `Controllers/MultaUploadController.cs`

**Impacto**: Documentação de referência para upload de multas

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
