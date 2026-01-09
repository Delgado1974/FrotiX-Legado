# Documentação: WhatsAppController.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `WhatsAppController` fornece endpoints para integração com WhatsApp via serviço externo, incluindo gerenciamento de sessões, QR code e envio de mensagens.

**Principais características:**

✅ **Gerenciamento de Sessões**: Inicia e verifica status de sessões WhatsApp  
✅ **QR Code**: Gera QR code para autenticação  
✅ **Envio de Mensagens**: Envia mensagens de texto e mídia  
✅ **Autorização**: Requer autenticação (`[Authorize]`)

---

## Endpoints API

### POST `/api/WhatsApp/start`

**Descrição**: Inicia uma sessão WhatsApp

**Request Body**: `StartSessionRequest` com `Session` (string opcional)

**Response**: Resultado da inicialização da sessão

---

### GET `/api/WhatsApp/status`

**Descrição**: Obtém status de uma sessão WhatsApp

**Query Parameters**: `session` (string)

**Response**: Status da sessão

---

### GET `/api/WhatsApp/qr`

**Descrição**: Obtém QR code em Base64 para autenticação

**Query Parameters**: `session` (string)

**Response**: QR code em formato data URI (`data:image/png;base64,...`)

---

### POST `/api/WhatsApp/send-text`

**Descrição**: Envia mensagem de texto via WhatsApp

**Request Body**: `SendTextRequest`
```json
{
  "session": "string",
  "phoneE164": "string",
  "message": "string"
}
```

---

### POST `/api/WhatsApp/send-media`

**Descrição**: Envia mídia (imagem/vídeo) via WhatsApp

**Request Body**: `SendMediaRequest`
```json
{
  "session": "string",
  "phoneE164": "string",
  "fileName": "string",
  "base64Data": "string",
  "caption": "string"
}
```

---

## Interconexões

### Quem Chama Este Controller

- **Pages**: Páginas de integração WhatsApp
- **JavaScript**: Para envio de mensagens e verificação de status

### O Que Este Controller Chama

- **`IWhatsAppService`**: Serviço de integração WhatsApp
- **`_wa.StartSessionAsync()`**: Inicia sessão
- **`_wa.GetStatusAsync()`**: Obtém status
- **`_wa.GetQrBase64Async()`**: Gera QR code
- **`_wa.SendTextAsync()`**: Envia texto
- **`_wa.SendMediaAsync()`**: Envia mídia

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do WhatsAppController

**Arquivos Afetados**:
- `Controllers/Api/WhatsAppController.cs`

**Impacto**: Documentação de referência para integração WhatsApp

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
