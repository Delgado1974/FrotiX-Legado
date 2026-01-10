# Documentação: Alerta.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

A classe `Alerta` é um utilitário estático centralizado para tratamento de erros e exibição de alertas visuais no sistema FrotiX, integrado com SweetAlert2 e sistema de logging.

**Principais características:**

✅ **Alertas Visuais**: Sucesso, erro, informação, aviso, confirmação  
✅ **Tratamento de Erros**: Log com arquivo e linha do erro  
✅ **Integração SweetAlert**: Alertas personalizados via TempData  
✅ **Prioridades de Alerta**: Suporte a ícones e cores por prioridade  
✅ **Dependency Injection**: Bridges para serviços injetados

---

## Estrutura da Classe

### Classe Estática

```csharp
public static class Alerta
```

**Padrão**: Classe estática com métodos utilitários

---

## Dependency Injection Bridges

A classe usa propriedades estáticas para acessar serviços injetados:

```csharp
public static IHttpContextAccessor HttpCtx { get; set; }
public static ITempDataDictionaryFactory TempFactory { get; set; }
public static ILoggerFactory LoggerFactory { get; set; }
```

**Configuração**: Preenchidos no `Startup.cs` ou `Program.cs`:

```csharp
Alerta.HttpCtx = serviceProvider.GetRequiredService<IHttpContextAccessor>();
Alerta.TempFactory = serviceProvider.GetRequiredService<ITempDataDictionaryFactory>();
Alerta.LoggerFactory = serviceProvider.GetRequiredService<ILoggerFactory>();
```

---

## Métodos de Alerta Visual

### `Erro(string titulo, string texto, string confirmButtonText = "OK")`

**Descrição**: Exibe alerta de erro

**Uso**:
```csharp
Alerta.Erro("Erro ao Salvar", "Não foi possível salvar os dados.");
```

**Resultado**: Alerta vermelho com ícone de erro

---

### `Sucesso(string titulo, string texto, string confirmButtonText = "OK")`

**Descrição**: Exibe alerta de sucesso

**Uso**:
```csharp
Alerta.Sucesso("Sucesso!", "Dados salvos com sucesso.");
```

**Resultado**: Alerta verde com ícone de sucesso

---

### `Info(string titulo, string texto, string confirmButtonText = "OK")`

**Descrição**: Exibe alerta de informação

**Uso**:
```csharp
Alerta.Info("Informação", "Operação concluída.");
```

**Resultado**: Alerta azul com ícone de informação

---

### `Warning(string titulo, string texto, string confirmButtonText = "OK")`

**Descrição**: Exibe alerta de aviso

**Uso**:
```csharp
Alerta.Warning("Atenção", "Esta ação não pode ser desfeita.");
```

**Resultado**: Alerta amarelo/laranja com ícone de aviso

---

### `Confirmar(string titulo, string texto, string confirmButtonText = "Sim", string cancelButtonText = "Cancelar")`

**Descrição**: Exibe alerta de confirmação

**Uso**:
```csharp
Alerta.Confirmar("Confirmar Exclusão", "Deseja realmente excluir?");
```

**Resultado**: Alerta com botões de confirmação e cancelamento

---

## Tratamento de Erro com Linha

### `TratamentoErroComLinha(string arquivo, string funcao, Exception error, ILogger logger = null)`

**Descrição**: **MÉTODO CRÍTICO** - Trata erro com log detalhado incluindo arquivo e linha

**Funcionalidades**:
1. Extrai informações do stack trace (arquivo, linha, método)
2. Registra log estruturado
3. Exibe alerta visual com detalhes técnicos

**Uso Típico**:
```csharp
try
{
    // código que pode lançar exceção
}
catch (Exception ex)
{
    Alerta.TratamentoErroComLinha("MeuController.cs", "SalvarDados", ex);
}
```

**Log Gerado**:
```
MeuController.cs::SalvarDados (linha 42): SqlException - Timeout expired
```

**Alerta Visual**: Alerta técnico com:
- Classe e método
- Mensagem de erro
- Stack trace completo
- Inner exception (se houver)
- Detalhes de arquivo/linha

---

### Overload Legado

```csharp
TratamentoErroComLinha(Exception error, string arquivo, string funcao, ILogger logger = null)
```

**Nota**: Redireciona para a ordem nova (arquivo, funcao, error)

---

## Métodos de Prioridade de Alertas

### `GetIconePrioridade(PrioridadeAlerta prioridade)`

**Descrição**: Retorna ícone FontAwesome Duotone baseado na prioridade

**Retornos**:
- `Baixa`: `"fa-duotone fa-circle-info"`
- `Media`: `"fa-duotone fa-circle-exclamation"`
- `Alta`: `"fa-duotone fa-triangle-exclamation"`

---

### `GetCorPrioridade(PrioridadeAlerta prioridade)`

**Descrição**: Retorna classe CSS Bootstrap baseada na prioridade

**Retornos**:
- `Baixa`: `"text-info"`
- `Media`: `"text-warning"`
- `Alta`: `"text-danger"`

---

### `GetCorHexPrioridade(PrioridadeAlerta prioridade)`

**Descrição**: Retorna cor hexadecimal baseada na prioridade

**Retornos**:
- `Baixa`: `"#0ea5e9"` (azul)
- `Media`: `"#f59e0b"` (laranja)
- `Alta`: `"#dc2626"` (vermelho)

---

### `GetNomePrioridade(PrioridadeAlerta prioridade)`

**Descrição**: Retorna nome descritivo da prioridade

---

## Métodos Auxiliares Privados

### `SetAlert(...)`

**Descrição**: Define alerta no TempData para exibição no cliente

**Formato JSON**:
```json
{
  "type": "error|success|info|warning|confirm",
  "title": "Título",
  "message": "Mensagem",
  "confirmButton": "OK",
  "cancelButton": "Cancelar" // opcional
}
```

---

### `SetErrorUnexpectedAlert(string arquivo, string metodo, Exception error)`

**Descrição**: Define alerta técnico de erro inesperado

**Formato JSON**:
```json
{
  "type": "errorUnexpected",
  "classe": "MeuController.cs",
  "metodo": "SalvarDados",
  "erro": "Mensagem do erro",
  "stack": "Stack trace completo",
  "innerErro": "Inner exception",
  "innerStack": "Inner stack trace",
  "detalhes": {
    "arquivo": "MeuController.cs",
    "linha": 42,
    "metodo": "SalvarDados",
    "tipo": "SqlException"
  }
}
```

---

### `TentarObterLinha(Exception ex)`

**Descrição**: Percorre stack trace para encontrar primeiro frame com informação de arquivo/linha

**Retorno**: `(int? line, string file, string member)`

**Lógica**:
1. Cria `StackTrace` com informações de arquivo
2. Percorre frames procurando primeiro com arquivo válido
3. Extrai linha e método
4. Retorna tupla com informações

---

### `TempDataSet(string key, object value)`

**Descrição**: Grava valor no TempData (se disponível)

**Uso**: Silencioso por design - não lança exceção se TempData não estiver disponível

---

## Interconexões

### Quem Usa Esta Classe

- **Todos os Controllers**: Para tratamento de erros e alertas
- **Services**: Para notificações de sucesso/erro
- **JavaScript**: Lê TempData["ShowSweetAlert"] e exibe alertas

### O Que Esta Classe Usa

- **Microsoft.AspNetCore.Http**: `IHttpContextAccessor`
- **Microsoft.AspNetCore.Mvc.ViewFeatures**: `ITempDataDictionaryFactory`
- **Microsoft.Extensions.Logging**: `ILogger`, `ILoggerFactory`
- **System.Text.Json**: Serialização JSON

---

## Exemplos de Uso

### Exemplo 1: Tratamento de Erro Completo

```csharp
public IActionResult SalvarDados([FromBody] MeuModel model)
{
    try
    {
        _unitOfWork.MeuModel.Add(model);
        _unitOfWork.Save();
        
        Alerta.Sucesso("Sucesso!", "Dados salvos com sucesso.");
        return Ok();
    }
    catch (Exception ex)
    {
        Alerta.TratamentoErroComLinha("MeuController.cs", "SalvarDados", ex);
        return StatusCode(500);
    }
}
```

### Exemplo 2: Confirmação Antes de Excluir

```csharp
public IActionResult Excluir(Guid id)
{
    Alerta.Confirmar("Confirmar Exclusão", "Deseja realmente excluir este item?");
    // JavaScript lê TempData e exibe confirmação
    // Se confirmado, chama endpoint de exclusão
}
```

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do Alerta

**Arquivos Afetados**:
- `Helpers/Alerta.cs`

**Impacto**: Documentação de referência para tratamento de erros e alertas

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
