# Documentação: Administração - Cálculo de Custos Total

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

A página **Cálculo de Custos das Viagens** permite ao administrador executar um reprocessamento em lote (batch) para recalcular os custos de todas as viagens realizadas no sistema. Este processo é fundamental quando há alterações retroativas em contratos, valores de combustíveis ou fórmulas de cálculo.

### Características Principais

- ✅ **Processamento em Batch**: Executa o cálculo em lotes de 500 registros para evitar sobrecarga de memória e timeout.
- ✅ **Otimização de Performance**: Carrega dados de referência (contratos, veículos, médias) em cache uma única vez antes do processamento.
- ✅ **Feedback em Tempo Real**: Barra de progresso visual com percentual, tempo decorrido e status.
- ✅ **Robustez**: Tratamento de erros e timeouts com log detalhado.

---

## Arquitetura

### Estrutura de Arquivos

```
FrotiX.Site/
├── Pages/
│   └── Administracao/
│       ├── CalculaCustoViagensTotal.cshtml    # View (HTML + JS inline)
│       └── CalculaCustoViagensTotal.cshtml.cs # PageModel
│
├── Controllers/
│   └── ViagemController.CalculoCustoBatch.cs  # Lógica de negócio pesada (Partial Class)
```

### Tecnologias Utilizadas

| Tecnologia | Uso |
|------------|-----|
| **ASP.NET Core (C#)** | Processamento backend e Entity Framework Core |
| **MemoryCache** | Armazenamento temporário de progresso e dados de referência |
| **AJAX (Polling)** | Consulta periódica de status para atualizar a barra de progresso |
| **CSS Grid/Flexbox** | Layout da interface de progresso |

---

## Funcionalidades Específicas

### 1. Execução do Cálculo (Batch)
O processo é iniciado via botão e executa no servidor de forma assíncrona (do ponto de vista da requisição principal, embora o método C# `ExecutarCalculoCustoBatch` seja síncrono em sua execução de loop, ele é chamado via AJAX com timeout longo).

**Lógica Backend (`ViagemController.CalculoCustoBatch.cs`)**:
1. **Cache de Dados**: Carrega todos os valores de contratos, médias de combustível e informações de veículos em memória (`DadosCalculoCache`).
2. **Busca de Viagens**: Seleciona IDs de todas as viagens realizadas com dados completos.
3. **Loop de Batch**:
   - Itera em blocos de 500 IDs.
   - Carrega as entidades do banco.
   - Aplica fórmulas de cálculo (Combustível, Veículo, Motorista, Operador, Lavador).
   - Salva as alterações (`SaveChanges`).
   - Atualiza o progresso no Cache.

**Fórmulas de Cálculo**:
- **Combustível**: `(KM / Consumo) * PreçoMédio`
- **Veículo**: `(ValorMensal / 43200) * Minutos` (43200 = minutos em 30 dias)
- **Motorista**: `ValorMensal * (Minutos / 13200)` (13200 = minutos em 220h)

### 2. Monitoramento de Progresso
O frontend realiza polling a cada 500ms para atualizar a interface.

**Endpoint de Progresso**:
```csharp
[HttpGet]
[Route("ObterProgressoCalculoCustoBatch")]
public IActionResult ObterProgressoCalculoCustoBatch()
{
    // Lê do MemoryCache
    if (_cache.TryGetValue("CalculoCusto_Progresso", out object progresso))
    {
        return Json(new { success = true, progresso = progresso });
    }
    // ...
}
```

---

## Endpoints API

### 1. POST `/api/viagem/ExecutarCalculoCustoBatch`
Inicia o processo de cálculo.
- **Timeout**: Configurado para 30 minutos no AJAX.
- **Retorno**: JSON com resumo da operação (total processado, tempo).

### 2. GET `/api/viagem/ObterProgressoCalculoCustoBatch`
Retorna o estado atual do processamento.
- **Retorno**: `{ processado: 1500, total: 50000, percentual: 3, mensagem: "..." }`

### 3. POST `/api/viagem/LimparProgressoCalculoCustoBatch`
Limpa a chave de cache ao finalizar ou cancelar.

---

## Frontend

### Scripts Inline (`CalculaCustoViagensTotal.cshtml`)

**Inicialização do Processo**:
```javascript
function iniciarCalculoCustos() {
    marcarBotaoProcessando();
    mostrarBarraProgresso();
    iniciarMonitoramentoProgresso(); // Inicia o setInterval

    $.ajax({
        type: "POST",
        url: "/api/viagem/ExecutarCalculoCustoBatch",
        timeout: 1800000, // 30 min
        success: function (data) {
            pararMonitoramentoProgresso();
            // ... exibe sucesso
        },
        error: function (jqXHR, textStatus, errorThrown) {
            // ... exibe erro e timeout
        }
    });
}
```

**Polling de Progresso**:
```javascript
function consultarProgresso() {
    $.ajax({
        type: "GET",
        url: "/api/viagem/ObterProgressoCalculoCustoBatch",
        success: function (data) {
            if (data.success && data.progresso) {
                atualizarInterface(p.processado, p.total, p.mensagem, p.percentual);
            }
        }
    });
}
```

---

## Troubleshooting

### Problema: Timeout no navegador (504 Gateway Timeout)
**Sintoma**: O processo para no meio e exibe erro de timeout, mas o servidor continua processando (ou também cai).
**Causa**: O tempo de execução total excede o limite do proxy reverso (IIS/Nginx) ou do navegador.
**Solução**: O processamento em batch foi desenhado para mitigar isso, mas se persistir, reduzir o `BATCH_SIZE` no Controller (atualmente 500).

### Problema: Barra de progresso travada
**Sintoma**: Status fica em "Iniciando..." ou congela em uma porcentagem.
**Causa**: Falha no polling AJAX ou o servidor parou de atualizar o cache (crash da thread).
**Verificação**: Checar console do navegador por erros de rede no endpoint `ObterProgresso...`.

### Problema: Valores zerados após cálculo
**Sintoma**: Viagens processadas ficam com custo 0.
**Causa**: Falta de dados de referência (média de combustível não cadastrada para o mês, contrato sem valor, veículo sem consumo).
**Solução**: Verificar cadastros de Contratos e Médias de Combustível. O log do servidor (Console.WriteLine no código) detalha quando valores base são 0.

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [06/01/2026] - Criação da Documentação

**Descrição**:
Documentação inicial da página de Cálculo de Custos Total.

**Status**: ✅ **Documentado**

**Responsável**: Claude (AI Assistant)
**Versão**: 1.0
