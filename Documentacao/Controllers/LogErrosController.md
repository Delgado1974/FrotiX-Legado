# Documentação: LogErrosController.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `LogErrosController` gerencia logs de erros do sistema, incluindo recebimento de logs JavaScript (client-side) e fornecimento de dados para visualização.

**Principais características:**

✅ **Logs JavaScript**: Recebe logs de erros do frontend  
✅ **Visualização**: Fornece logs e estatísticas para página de visualização  
✅ **Estatísticas**: Contadores de erros, warnings, info, JS errors, HTTP errors

---

## Endpoints API

### POST `/api/LogErros/LogJavaScript`

**Descrição**: Recebe logs de erro do JavaScript (client-side)

**Request Body**: `LogJavaScriptRequest`
```json
{
  "mensagem": "Erro ocorrido",
  "arquivo": "script.js",
  "metodo": "funcao",
  "linha": 123,
  "coluna": 45,
  "stack": "stack trace",
  "userAgent": "browser info",
  "url": "page url"
}
```

**Uso**: Captura erros JavaScript do frontend

---

### GET `/api/LogErros/ObterLogs`

**Descrição**: Obtém todos os logs do dia atual com estatísticas

**Response**:
```json
{
  "success": true,
  "logs": "texto dos logs",
  "stats": {
    "totalLogs": 100,
    "errorCount": 50,
    "warningCount": 30,
    "infoCount": 20,
    "jsErrorCount": 10,
    "httpErrorCount": 5
  }
}
```

---

## Interconexões

### Quem Chama Este Controller

- **JavaScript**: Para enviar logs de erro do frontend
- **Pages**: `Pages/LogErros/Index.cshtml` - Para visualização

### O Que Este Controller Chama

- **`_logService`**: `ILogService` para gestão de logs

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do LogErrosController

**Arquivos Afetados**:
- `Controllers/LogErrosController.cs`

**Impacto**: Documentação de referência para logs de erros

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
