# Documentação: Administração - Gerar Estatísticas de Viagens

> **Última Atualização**: 06/01/2026
> **Versão Atual**: 1.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Funcionalidades Específicas](#funcionalidades-específicas)
4. [Endpoints API](#endpoints-api)
5. [Frontend](#frontend)
6. [Troubleshooting](#troubleshooting)

---

## Visão Geral

A página **Geração de Estatísticas de Viagens** é uma ferramenta de back-office que permite o reprocessamento manual das estatísticas consolidadas de viagens. Este processo é essencial para alimentar os dashboards e relatórios gerenciais com dados atualizados e consistentes, especialmente após importações de dados legados ou correções em massa.

### Características Principais

- ✅ **Processamento em Background**: O cálculo é executado em uma thread separada para não bloquear a interface.
- ✅ **Escopo Isolado**: Utiliza `IServiceScopeFactory` para criar contextos de banco de dados isolados e seguros para execução paralela.
- ✅ **Feedback Visual**: Barra de progresso com estimativa de tempo restante.
- ✅ **Resiliência**: Tratamento de erros individual por data, permitindo que o processo continue mesmo se um dia específico falhar.

---

## Arquitetura

### Estrutura de Arquivos

```
FrotiX.Site/
├── Pages/
│   └── Administracao/
│       ├── GerarEstatisticasViagens.cshtml    # View (HTML + JS inline)
│       └── GerarEstatisticasViagens.cshtml.cs # PageModel
│
├── Controllers/
│   └── ViagemController.MetodosEstatisticas.cs # Lógica Backend (Partial Class)
│
├── Services/
│   └── ViagemEstatisticaService.cs            # Serviço de Domínio (Cálculo)
```

### Tecnologias Utilizadas

| Tecnologia | Uso |
|------------|-----|
| **Task.Run (C#)** | Execução assíncrona em background |
| **Dependency Injection Scope** | Gerenciamento de ciclo de vida do DbContext |
| **MemoryCache** | Comunicação de estado entre thread de background e requisições HTTP |
| **AJAX Polling** | Atualização da interface do usuário |

---

## Funcionalidades Específicas

### 1. Início do Processamento
O usuário clica no botão "Iniciar", que dispara uma requisição AJAX para o endpoint `GerarEstatisticasViagens`. O backend inicia uma `Task` e retorna imediatamente, liberando o navegador.

**Lógica Backend (`ViagemController.MetodosEstatisticas.cs`)**:
```csharp
[Route("GerarEstatisticasViagens")]
[HttpPost]
public IActionResult GerarEstatisticasViagens()
{
    // ... verifica se já existe processo rodando ...

    // Inicia background task
    Task.Run(async () => await ProcessarGeracaoEstatisticas());

    return Json(new { success = true, message = "Processamento iniciado" });
}
```

### 2. Processamento em Background
O método `ProcessarGeracaoEstatisticas` realiza o trabalho pesado:
1. Cria um escopo de serviço (`CreateScope`).
2. Resolve os serviços necessários (`DbContext`, `Repositories`).
3. Busca todas as datas únicas de viagens no sistema.
4. Itera sobre cada data chamando o serviço de estatística.
5. Atualiza o progresso no Cache a cada iteração.

**Criação de Escopo**:
```csharp
using (var scope = _serviceScopeFactory.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<FrotiXDbContext>();
    // ...
    // É crucial criar um novo DbContext aqui, pois o Controller original
    // já foi descartado quando a requisição HTTP terminou.
}
```

### 3. Monitoramento
O frontend consulta periodicamente o status do processamento via endpoint `ObterProgressoEstatisticas`.

**Estrutura do Progresso**:
```csharp
public class ProgressoEstatisticas
{
    public int Total { get; set; }
    public int Processado { get; set; }
    public int Percentual { get; set; }
    public bool Concluido { get; set; }
    // ...
}
```

---

## Endpoints API

### 1. POST `/api/viagem/GerarEstatisticasViagens`
Inicia a task de processamento. Retorna sucesso imediato se a task foi agendada corretamente.

### 2. GET `/api/viagem/ObterProgressoEstatisticas`
Lê o objeto de progresso do `MemoryCache`.
- **Retorno**: `{ success: true, progresso: { total: 100, processado: 50, percentual: 50, ... } }`

### 3. POST `/api/viagem/LimparProgressoEstatisticas`
Remove a chave do cache, permitindo iniciar um novo processo se o anterior travou ou terminou.

---

## Frontend

### Scripts Inline (`GerarEstatisticasViagens.cshtml`)

**Cálculo de Tempo Restante**:
O script frontend calcula a velocidade de processamento (itens/segundo) para estimar o tempo restante.

```javascript
function calcularTempoRestante(progresso) {
    const tempoDecorrido = (new Date() - inicioProcessamento) / 1000;
    const velocidade = progresso.processado / tempoDecorrido;
    const restantes = progresso.total - progresso.processado;
    const segundosRestantes = restantes / velocidade;

    // ... formatação de tempo ...
    $("#statTempo").text(textoTempo);
}
```

**Polling**:
```javascript
function iniciarMonitoramento() {
    if (intervalId !== null) clearInterval(intervalId);
    intervalId = setInterval(() => {
        consultarProgresso();
    }, 500); // Consulta a cada 0.5s
}
```

---

## Troubleshooting

### Problema: "DbContext has been disposed"
**Sintoma**: O processo inicia e falha logo em seguida com erro de log no servidor.
**Causa**: Tentativa de usar o `_context` do Controller dentro da `Task.Run`.
**Solução**: O código já implementa `_serviceScopeFactory.CreateScope()` corretamente para criar um novo contexto independente. Se o erro ocorrer, verifique se alguma dependência injetada no construtor do Controller está sendo usada diretamente na Task.

### Problema: Barra de progresso não avança (0%)
**Sintoma**: Status "Preparando processamento..." eterno.
**Causa**: A query inicial de datas distintas (`datasUnicas`) pode ser muito pesada em bancos grandes e demorar para retornar antes de começar a iterar.
**Diagnóstico**: Verificar logs do banco de dados (SQL Server Profiler) para ver se a query `SELECT DISTINCT DataInicial` está rodando.

### Problema: Processo travado no meio
**Sintoma**: Progresso para em X% e não sai.
**Causa**: Erro não tratado dentro do loop `foreach` que derrubou a thread, ou o pool de aplicações do IIS reciclou.
**Solução**: Reiniciar o processo (o botão "Limpar Progresso" ou refresh da página pode ser necessário se o cache ainda estiver sujo).

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [06/01/2026] - Criação da Documentação

**Descrição**:
Documentação inicial da página de Geração de Estatísticas de Viagens.

**Status**: ✅ **Documentado**

**Responsável**: Claude (AI Assistant)
**Versão**: 1.0
