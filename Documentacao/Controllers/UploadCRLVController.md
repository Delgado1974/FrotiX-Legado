# Documentação: UploadCRLVController.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `UploadCRLVController` gerencia upload e remoção de CRLV (Certificado de Registro e Licenciamento de Veículo) usando Syncfusion Uploader.

**Principais características:**

✅ **Upload**: Upload de CRLV digital para veículo  
✅ **Remoção**: Remove CRLV digital do veículo  
✅ **Syncfusion Uploader**: Integração com componente Syncfusion

---

## Endpoints API

### POST `/api/UploadCRLV/Save`

**Descrição**: Salva CRLV digital de um veículo

**Request**: `multipart/form-data` com arquivo e `veiculoId` (query)

**Lógica**: Converte arquivo para byte array e salva em `Veiculo.CRLV`

---

### POST `/api/UploadCRLV/Remove`

**Descrição**: Remove CRLV digital de um veículo

**Parâmetros**: `veiculoId` (Guid, query)

**Lógica**: Define `Veiculo.CRLV = null`

---

## Interconexões

### Quem Chama Este Controller

- **Pages**: `Pages/Veiculo/*.cshtml` - Upload de CRLV
- **Syncfusion Uploader**: Componente de upload

### O Que Este Controller Chama

- **`_unitOfWork.Veiculo`**: Atualização de CRLV digital

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do UploadCRLVController

**Arquivos Afetados**:
- `Controllers/UploadCRLVController.cs`

**Impacto**: Documentação de referência para upload de CRLV

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
