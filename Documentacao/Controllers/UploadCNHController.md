# Documentação: UploadCNHController.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `UploadCNHController` gerencia upload e remoção de CNH digital de motoristas usando Syncfusion Uploader.

**Principais características:**

✅ **Upload**: Upload de CNH digital para motorista  
✅ **Remoção**: Remove CNH digital do motorista  
✅ **Syncfusion Uploader**: Integração com componente Syncfusion

---

## Endpoints API

### POST `/api/UploadCNH/Save`

**Descrição**: Salva CNH digital de um motorista

**Request**: `multipart/form-data` com arquivo e `motoristaId` (query)

**Lógica**: Converte arquivo para byte array e salva em `Motorista.CNHDigital`

---

### POST `/api/UploadCNH/Remove`

**Descrição**: Remove CNH digital de um motorista

**Parâmetros**: `motoristaId` (Guid, query)

**Lógica**: Define `Motorista.CNHDigital = null`

---

## Interconexões

### Quem Chama Este Controller

- **Pages**: `Pages/Motorista/*.cshtml` - Upload de CNH
- **Syncfusion Uploader**: Componente de upload

### O Que Este Controller Chama

- **`_unitOfWork.Motorista`**: Atualização de CNH digital

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do UploadCNHController

**Arquivos Afetados**:
- `Controllers/UploadCNHController.cs`

**Impacto**: Documentação de referência para upload de CNH

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
