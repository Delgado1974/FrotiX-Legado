# Documentação: AlertaBackend.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

A classe `AlertaBackend` é um helper backend-only para logging de erros inesperados, sem dependência de JavaScript ou UI. Focado em log estruturado e correlação de erros.

**Principais características:**

✅ **Backend-Only**: Não depende de JSInterop ou TempData  
✅ **Logging Estruturado**: Logs detalhados com contexto  
✅ **Correlação de Erros**: Suporte a Correlation ID via Activity  
✅ **Caller Attributes**: Uso de `[CallerMemberName]`, `[CallerFilePath]`, `[CallerLineNumber]`  
✅ **Múltiplos Overloads**: Suporte a contextos estáticos e de instância

---

## Estrutura da Classe

### Classe Estática

```csharp
public static class AlertaBackend
```

**Padrão**: Classe estática com métodos utilitários

---

## Configuração

### Logger Injection

```csharp
private static ILogger? _logger;

public static void ConfigureLogger(ILogger logger) => _logger = logger;
```

**Uso**: Configurado no `Startup.cs` ou `Program.cs`:

```csharp
AlertaBackend.ConfigureLogger(loggerFactory.CreateLogger("AlertaBackend"));
```

---

## Métodos Principais

### `TratamentoErroComLinha(...)`

**Descrição**: Loga erro inesperado a partir de uma instância (com `this`)

**Assinatura**:
```csharp
public static ValueTask TratamentoErroComLinha(
    object? ctx,                    // Contexto (this)
    Exception ex,                   // Exceção
    string? userMessage = null,     // Mensagem amigável
    string? tag = null,             // Tag para categorização
    int severity = 0,               // Severidade (compatibilidade)
    [CallerMemberName] string? member = null,
    [CallerFilePath] string? file = null,
    [CallerLineNumber] int line = 0
)
```

**Uso**:
```csharp
try
{
    // código
}
catch (Exception ex)
{
    await AlertaBackend.TratamentoErroComLinha(this, ex, "Erro ao processar");
}
```

**Log Gerado**:
```
Unexpected error | ctx=MeuService | member=Processar | file=C:\...\MeuService.cs:42 | 
exFile=C:\...\OutroArquivo.cs:123 | tag=processamento | correlationId=abc123 | msg=Erro ao processar
```

---

### `TratamentoErroComLinhaStatic<T>(...)`

**Descrição**: Versão para chamadas em contextos estáticos (sem `this`)

**Assinatura**:
```csharp
public static ValueTask TratamentoErroComLinhaStatic<T>(
    Exception ex,
    string? userMessage = null,
    string? tag = null,
    int severity = 0,
    [CallerMemberName] string? member = null,
    [CallerFilePath] string? file = null,
    [CallerLineNumber] int line = 0
)
```

**Uso**:
```csharp
try
{
    // código estático
}
catch (Exception ex)
{
    await AlertaBackend.TratamentoErroComLinhaStatic<MeuHelper>(ex, "Erro estático");
}
```

---

### `SendUnexpected(...)`

**Descrição**: Versão direta para enviar/logar sem contexto (helpers puros)

**Assinatura**:
```csharp
public static ValueTask SendUnexpected(
    string source,                  // Nome da fonte
    string? userMessage,            // Mensagem amigável
    Exception ex,                   // Exceção
    string? tag = null,             // Tag
    int severity = 0,                // Severidade
    [CallerMemberName] string? member = null,
    [CallerFilePath] string? file = null,
    [CallerLineNumber] int line = 0
)
```

**Uso**:
```csharp
await AlertaBackend.SendUnexpected("MeuHelper", "Erro ao converter", ex, "conversao");
```

---

## Funcionalidades Avançadas

### Correlation ID

```csharp
public static string GetCorrelationId() =>
    Activity.Current?.Id ?? Guid.NewGuid().ToString("N");
```

**Uso**: Identifica requisições relacionadas para rastreamento de erros

**Vantagens**:
- Rastreia erros através de múltiplos serviços
- Facilita debugging em sistemas distribuídos
- Usa `Activity.Current` quando disponível (ASP.NET Core)

---

### Extração de Arquivo/Linha do StackTrace

```csharp
public static (string? file, int? line) TryExtractFileLine(Exception ex)
```

**Lógica**:
1. Procura padrão `":line "` no stack trace
2. Extrai caminho do arquivo antes de `":line "`
3. Extrai número da linha após `":line "`
4. Retorna tupla `(arquivo, linha)`

**Padrão Esperado**:
```
at MeuMetodo() in C:\path\to\file.cs:line 123
```

---

## Interconexões

### Quem Usa Esta Classe

- **Services**: Para logging de erros em operações de negócio
- **Middlewares**: Para captura de erros não tratados
- **Helpers**: Para logging em métodos utilitários

### O Que Esta Classe Usa

- **Microsoft.Extensions.Logging**: `ILogger`
- **System.Diagnostics**: `Activity`, `StackTrace`
- **System.Runtime.CompilerServices**: `CallerMemberName`, `CallerFilePath`, `CallerLineNumber`

---

## Comparação com `Alerta.cs`

| Característica | Alerta.cs | AlertaBackend.cs |
|----------------|-----------|------------------|
| **UI Integration** | ✅ Sim (SweetAlert) | ❌ Não |
| **TempData** | ✅ Sim | ❌ Não |
| **Logging** | ✅ Sim | ✅ Sim (mais detalhado) |
| **Correlation ID** | ❌ Não | ✅ Sim |
| **Caller Attributes** | ❌ Não | ✅ Sim |
| **Backend-Only** | ❌ Não | ✅ Sim |

**Uso Recomendado**:
- **Alerta.cs**: Para erros que precisam de feedback visual ao usuário
- **AlertaBackend.cs**: Para logging interno, serviços, middlewares

---

## Exemplos de Uso

### Exemplo 1: Logging em Service

```csharp
public class MeuService
{
    public async Task ProcessarAsync()
    {
        try
        {
            // lógica de negócio
        }
        catch (Exception ex)
        {
            await AlertaBackend.TratamentoErroComLinha(
                this, 
                ex, 
                "Erro ao processar dados",
                "processamento"
            );
            throw; // Re-lança para tratamento superior
        }
    }
}
```

### Exemplo 2: Logging em Helper Estático

```csharp
public static class MeuHelper
{
    public static string Converter(string input)
    {
        try
        {
            // conversão
        }
        catch (Exception ex)
        {
            AlertaBackend.TratamentoErroComLinhaStatic<MeuHelper>(
                ex,
                "Erro na conversão",
                "conversao"
            ).AsTask().Wait();
            throw;
        }
    }
}
```

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do AlertaBackend

**Arquivos Afetados**:
- `Helpers/AlertaBackend.cs`

**Impacto**: Documentação de referência para logging backend

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
