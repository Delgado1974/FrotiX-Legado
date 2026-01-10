# TelerikReportWarmupService.cs

## Visão Geral
Serviço de **background** (`IHostedService`) que faz warm-up do **Telerik Report Server** na inicialização da aplicação. Reduz latência do primeiro relatório ao pré-carregar assemblies e inicializar o engine de relatórios.

## Localização
`Services/TelerikReportWarmupService.cs`

## Dependências
- `Microsoft.Extensions.Hosting` (`IHostedService`)
- `Microsoft.Extensions.Logging` (`ILogger`)
- `System.Net.Http` (`IHttpClientFactory`, `HttpClient`)

## Características

### Hosted Service
- Implementa `IHostedService` para execução em background
- Inicia automaticamente com a aplicação
- Não bloqueia startup (executa em background)

### Warm-up Strategy
- Faz requisição HTTP para endpoint de recursos do Telerik
- Força carregamento de assemblies e inicialização do engine
- Aguarda 5 segundos antes de iniciar (garante aplicação pronta)

---

## Métodos Principais

### `StartAsync(CancellationToken)`
**Propósito**: Inicia o serviço de warm-up.

**Fluxo**:
1. Cria `CancellationTokenSource` vinculado ao token de cancelamento
2. Executa warm-up em background (não bloqueia startup):
   - `Task.Run()` executa `ExecuteWarmupAsync()` em thread separada
3. Registra log de inicialização
4. Retorna `Task.CompletedTask` imediatamente

**Complexidade**: Baixa

---

### `ExecuteWarmupAsync(CancellationToken)` (privado)
**Propósito**: Executa warm-up do Telerik Report Server.

**Fluxo**:
1. **Aguarda 5 segundos**: Garante que aplicação está pronta
2. **Estratégia 1 - Requisição HTTP**:
   - Cria `HttpClient` com timeout de 30 segundos
   - Faz requisição GET para `api/reports/resources/js/telerikReportViewer`
   - Isso força carregamento de assemblies e inicialização do engine
   - Loga sucesso ou aviso (mesmo com erro HTTP, engine é inicializado)
3. **Estratégia 2 - Delay Adicional**:
   - Aguarda mais 2 segundos para garantir inicialização completa
4. Registra log de conclusão

**Tratamento de Erros**:
- `HttpRequestException`: Loga aviso (esperado se HTTPS não configurado localmente)
- `TaskCanceledException`: Loga aviso de timeout
- `OperationCanceledException`: Loga informação de cancelamento
- Outras exceções: Loga erro

**Complexidade**: Baixa (requisição HTTP simples)

---

### `StopAsync(CancellationToken)`
**Propósito**: Para o serviço graciosamente.

**Fluxo**:
1. Registra log de parada
2. Cancela `CancellationTokenSource`
3. Retorna `Task.CompletedTask`

**Complexidade**: Baixa

---

### `Dispose()`
**Propósito**: Libera recursos.

**Fluxo**: Dispose do `CancellationTokenSource`

**Complexidade**: Baixa

---

## Contribuição para o Sistema FrotiX

### ⚡ Performance
- **Reduz latência**: Primeiro relatório é mais rápido
- **Melhora UX**: Usuários não percebem delay no primeiro relatório
- **Otimização proativa**: Inicializa engine antes de ser necessário

### 🚀 Startup Não Bloqueante
- Executa em background (não bloqueia startup)
- Não afeta tempo de inicialização da aplicação
- Falhas no warm-up não impedem aplicação de iniciar

### 🔧 Estratégia Dupla
- Requisição HTTP força inicialização
- Delay adicional garante conclusão
- Tolerante a falhas (mesmo com erro HTTP, engine é inicializado)

## Observações Importantes

1. **Não Bloqueante**: O warm-up executa em background. A aplicação inicia normalmente mesmo se warm-up ainda estiver em execução.

2. **Timeout**: Requisição HTTP tem timeout de 30 segundos. Se demorar mais, será cancelada, mas engine ainda será inicializado.

3. **Tolerante a Falhas**: Mesmo se requisição HTTP falhar (ex.: HTTPS não configurado localmente), o engine ainda é inicializado. Logs indicam isso.

4. **Delay Inicial**: Aguarda 5 segundos antes de iniciar warm-up. Isso garante que aplicação está pronta, mas pode ser ajustado conforme necessário.

5. **Endpoint Específico**: Usa endpoint `api/reports/resources/js/telerikReportViewer`. Se estrutura de rotas mudar, atualize este endpoint.

6. **Logging Detalhado**: Registra logs em cada etapa (início, requisição, conclusão, erros). Use logs para monitorar performance.

## Registro no DI Container

```csharp
// Startup.cs ou Program.cs
services.AddHttpClient(); // Necessário para IHttpClientFactory
services.AddHostedService<TelerikReportWarmupService>();
```

## Arquivos Relacionados
- `Services/CustomReportSourceResolver.cs`: Resolver de relatórios Telerik
- `Controllers/Relatorio*Controller.cs`: Controllers que expõem relatórios
- `Telerik.Reporting`: Biblioteca Telerik Reporting
