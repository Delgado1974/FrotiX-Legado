# LogService.cs e ILogService.cs

## Visão Geral
Implementação de serviço de **logging centralizado** para toda a aplicação FrotiX. Grava logs em arquivos diários na pasta `Logs`, capturando erros de servidor (C#), cliente (JavaScript), operações e ações de usuários.

## Localização
- `Services/LogService.cs` (implementação)
- `Services/ILogService.cs` (interface)

## Dependências
- `Microsoft.AspNetCore.Hosting` (`IWebHostEnvironment`)
- `Microsoft.AspNetCore.Http` (`IHttpContextAccessor`)
- `System.Text.RegularExpressions` (análise de logs)

## Interface (`ILogService`)

### Métodos de Logging

#### `Info(string message, string? arquivo = null, string? metodo = null)`
Registra mensagem informativa.

#### `Warning(string message, string? arquivo = null, string? metodo = null)`
Registra aviso.

#### `Error(string message, Exception? exception = null, string? arquivo = null, string? metodo = null, int? linha = null)`
Registra erro com exceção opcional. Inclui stack trace completo.

#### `ErrorJS(string message, string? arquivo = null, string? metodo = null, int? linha = null, int? coluna = null, string? stack = null, string? userAgent = null, string? url = null)`
Registra erro de JavaScript (client-side). Inclui informações do navegador e stack trace JS.

#### `Debug(string message, string? arquivo = null)`
Registra mensagem de debug (apenas em modo `DEBUG`).

#### `OperationStart(string operationName, string? arquivo = null)`
Registra início de operação.

#### `OperationSuccess(string operationName, string? details = null)`
Registra sucesso de operação.

#### `OperationFailed(string operationName, Exception exception, string? arquivo = null)`
Registra falha de operação.

#### `UserAction(string action, string? details = null, string? usuario = null)`
Registra ação do usuário (auditoria).

#### `HttpError(int statusCode, string path, string method, string? message = null, string? usuario = null)`
Registra erro HTTP (4xx, 5xx).

### Métodos de Consulta

#### `GetAllLogs()`
Retorna todos os logs do dia atual.

#### `GetLogsByDate(DateTime date)`
Retorna logs de uma data específica.

#### `GetLogFiles()`
Retorna lista de arquivos de log disponíveis (`List<LogFileInfo>`).

#### `ClearLogs()`
Limpa logs do dia atual.

#### `ClearLogsBefore(DateTime date)`
Limpa logs anteriores a uma data.

#### `GetErrorCount()`
Retorna contagem de erros do dia atual.

#### `GetStats()`
Retorna estatísticas dos logs (`LogStats`).

---

## Implementação (`LogService`)

### Estrutura de Arquivos
- **Diretório**: `{ContentRootPath}/Logs`
- **Formato**: `frotix_log_{yyyy-MM-dd}.txt`
- **Encoding**: UTF-8 (suporta emojis e caracteres especiais)

### Características

#### Thread-Safe
- Usa `lock (_lockObject)` para escrita concorrente
- Garante que múltiplas threads não corrompam o arquivo

#### Contexto HTTP
- Extrai usuário atual via `IHttpContextAccessor`
- Extrai URL da requisição
- Funciona mesmo fora de contexto HTTP (retorna "Anônimo")

#### Formato de Log
```
[HH:mm:ss.fff] [TIPO] Mensagem
  📄 Arquivo: arquivo.cs
  🔧 Método: MetodoNome
  📍 Linha: 123
  🌐 URL: /pagina
  👤 Usuário: nome.usuario
  📚 StackTrace:
      linha1
      linha2
```

### Métodos Principais

#### `WriteLog(string message)`
**Propósito**: Escreve log no arquivo do dia atual.

**Características**:
- Thread-safe com `lock`
- Encoding UTF-8 explícito
- Timestamp automático

---

#### `WriteLogError(string type, string message, Exception? exception = null, ...)`
**Propósito**: Escreve log de erro com formatação detalhada.

**Inclui**:
- Tipo de erro (`ERROR`, `ERROR-JS`, `OPERATION-FAIL`)
- Arquivo, método, linha
- URL e usuário
- Stack trace completo (até 15 linhas)
- Inner exception (se houver)

---

#### `GetStats()`
**Propósito**: Calcula estatísticas dos logs do dia atual.

**Retorna** (`LogStats`):
- `TotalLogs`: Total de entradas principais
- `ErrorCount`: Erros puros (`[ERROR]`)
- `WarningCount`: Avisos (`[WARN]`)
- `InfoCount`: Informações (`[INFO]`, `[USER]`, `[OPERATION]`, `[DEBUG]`)
- `JSErrorCount`: Erros JavaScript (`[ERROR-JS]`)
- `HttpErrorCount`: Erros HTTP (`[HTTP-ERROR]`)
- `FirstLogDate`: Data/hora do primeiro log
- `LastLogDate`: Data/hora do último log

**Lógica**:
- Usa regex para identificar linhas principais (com timestamp)
- Ignora linhas de detalhe (indentadas)
- Conta apenas entradas principais para evitar duplicação

---

### Classes Auxiliares

#### `LogFileInfo`
Informações sobre arquivo de log:
- `FileName`: Nome do arquivo
- `Date`: Data do log
- `SizeBytes`: Tamanho em bytes
- `SizeFormatted`: Tamanho formatado ("1.5 MB")

#### `LogStats`
Estatísticas dos logs (propriedades listadas acima).

---

## Eventos

### `OnErrorOccurred`
Evento disparado quando um erro ocorre. Útil para notificações em tempo real (ex.: SignalR).

```csharp
_logService.OnErrorOccurred += (message) => {
    // Notificar usuários ou sistemas externos
};
```

---

## Contribuição para o Sistema FrotiX

### 🔍 Rastreabilidade
- Todos os erros são registrados com contexto completo (arquivo, método, linha, usuário, URL)
- Stack traces facilitam debugging
- Logs diários organizados por data

### 📊 Monitoramento
- Estatísticas permitem identificar padrões de erro
- Contagem de erros por tipo facilita priorização
- Logs de usuário permitem auditoria

### 🐛 Debugging
- Logs detalhados aceleram resolução de problemas
- Informações de JavaScript capturam erros client-side
- Contexto HTTP ajuda a reproduzir problemas

### 🔒 Segurança
- Logs de ações de usuário para auditoria
- Rastreamento de tentativas de acesso não autorizado
- Histórico completo de operações críticas

## Observações Importantes

1. **Encoding UTF-8**: Logs usam UTF-8 explícito para suportar emojis e caracteres especiais (acentos, etc.).

2. **Performance**: Escrita é thread-safe mas pode ser um gargalo em alta concorrência. Considere usar `System.IO.File.AppendAllText` com buffer ou fila assíncrona para produção.

3. **Rotação de Logs**: Logs são organizados por dia automaticamente. Considere implementar limpeza automática de logs antigos (ex.: manter apenas últimos 30 dias).

4. **Debug Mode**: Método `Debug()` só executa em modo `DEBUG` (compilação condicional `#if DEBUG`).

5. **Eventos**: O evento `OnErrorOccurred` pode ser usado para integração com sistemas externos (ex.: Slack, email, SignalR).

## Arquivos Relacionados
- `Middlewares/ErrorLoggingMiddleware.cs`: Usa `ILogService` para capturar erros HTTP automaticamente
- `Helpers/Alerta.cs`: Usa `ILogService` para registrar erros
- `Helpers/AlertaBackend.cs`: Usa `ILogService` para registrar erros backend
- `Controllers/`: Vários controllers injetam `ILogService` para logging
