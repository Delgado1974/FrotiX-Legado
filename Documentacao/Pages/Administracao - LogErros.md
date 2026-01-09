# Documentação: Administração - Log de Erros

> **Última Atualização**: 06/01/2026
> **Versão Atual**: 1.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Interface de Visualização](#interface-de-visualização)
4. [Endpoints API](#endpoints-api)
5. [Frontend](#frontend)
6. [Troubleshooting](#troubleshooting)

---

## Visão Geral

A página **Log de Erros do Sistema** é o console central de monitoramento do FrotiX. Ela permite visualizar, filtrar e gerenciar os logs de auditoria, erros de execução (backend e frontend) e alertas de sistema.

### Características Principais

- ✅ **Monitoramento Full-Stack**: Centraliza logs de C# (Backend), JavaScript (Frontend) e requisições HTTP.
- ✅ **Dashboard de Métricas**: Cards clicáveis com contagem em tempo real por tipo de log (Erro, Warning, Info, JS Error).
- ✅ **Parsing Inteligente**: Transforma arquivos de texto bruto em blocos estruturados e coloridos para fácil leitura.
- ✅ **Filtros Avançados**: Busca por texto, tipo de log e data.
- ✅ **Limpeza Automática**: Ferramentas para limpar logs do dia ou histórico antigo.

---

## Arquitetura

### Estrutura de Arquivos

```
FrotiX.Site/
├── Pages/
│   └── Administracao/
│       ├── LogErros.cshtml          # View (HTML + CSS + JS inline)
│       └── LogErros.cshtml.cs       # PageModel
│
├── Controllers/
│   └── LogErrosController.cs        # API de Logs
│
├── Services/
│   └── LogService.cs                # Serviço de Gravação/Leitura em arquivo
```

### Tecnologias Utilizadas

| Tecnologia | Uso |
|------------|-----|
| **ASP.NET Core API** | Gerenciamento de arquivos de log |
| **Fetch API** | Carregamento assíncrono de logs grandes |
| **Regex** | Parsing de texto não estruturado para JSON no frontend |
| **CSS Grid** | Layout responsivo dos blocos de log |

---

## Interface de Visualização

A interface é dividida em três áreas:

### 1. Cards de Estatísticas
Atuam como indicadores e filtros rápidos. Ao clicar em um card (ex: "Erros"), a lista é filtrada automaticamente.

### 2. Barra de Filtros
Controles para refinar a busca:
- **Data**: Seleciona o arquivo de log do dia específico.
- **Tipo**: Dropdown (Todos, Erros, JS Errors, etc).
- **Busca**: Campo de texto livre que pesquisa em todo o conteúdo do log.

### 3. Container de Logs
Área com scroll infinito onde os logs são renderizados. Cada bloco possui:
- **Cabeçalho Colorido**: Indica severidade (Vermelho=Erro, Azul=Info, Roxo=JS).
- **Timestamp**: Hora exata do evento.
- **Resumo**: Mensagem principal.
- **Detalhes**: Stack trace, URL, Usuário, Dados adicionais.

---

## Endpoints API

O controller `LogErrosController` expõe os métodos de gestão.

### 1. GET `/api/LogErros/ObterLogs`
Lê o arquivo de log do dia atual e retorna o conteúdo bruto e estatísticas.

**Retorno**:
```json
{
  "success": true,
  "logs": "[10:00:00] [INFO] Sistema iniciado...",
  "stats": {
    "totalLogs": 150,
    "errorCount": 2,
    "jsErrorCount": 0
  }
}
```

### 2. POST `/api/LogErros/LogJavaScript`
Recebe erros capturados no navegador (`window.onerror`) e grava no log do servidor.

**Payload**:
```json
{
  "mensagem": "Uncaught ReferenceError: x is not defined",
  "arquivo": "site.js",
  "linha": 10,
  "url": "https://..."
}
```

### 3. POST `/api/LogErros/LimparLogs`
Apaga o conteúdo do arquivo de log atual.

### 4. GET `/api/LogErros/ListarArquivos`
Retorna a lista de arquivos de log históricos disponíveis para consulta.

---

## Frontend

### Parsing de Logs (`LogErros.cshtml`)
O log é armazenado como texto plano no servidor. O frontend é responsável por estruturá-lo visualmente.

**Regex de Parsing**:
```javascript
// Captura: [Hora] [TIPO] Mensagem
var regexPrincipal = /^\[(\d{2}:\d{2}:\d{2}\.\d{3})\]\s*\[([A-Z0-9_-]+)\]\s*(.*)$/;
```

**Lógica de Renderização**:
```javascript
function parsearLogsEmBlocos(logsTexto) {
    var linhas = logsTexto.split('\n');
    var blocos = [];
    var blocoAtual = null;

    for (var i = 0; i < linhas.length; i++) {
        var match = linhas[i].match(regexPrincipal);
        if (match) {
            // Novo bloco
            if (blocoAtual) blocos.push(blocoAtual);
            blocoAtual = { hora: match[1], tipo: match[2], resumo: match[3], detalhes: [] };
        } else if (blocoAtual) {
            // Detalhe do bloco anterior
            blocoAtual.detalhes.push(linhas[i]);
        }
    }
    return blocos.reverse(); // Mais recentes primeiro
}
```

### Captura de Erros JS
O sistema possui um script global (`error-hook-global.js` ou similar) que intercepta erros e envia para a API.

```javascript
window.onerror = function(msg, url, line, col, error) {
    fetch('/api/LogErros/LogJavaScript', {
        method: 'POST',
        body: JSON.stringify({ mensagem: msg, arquivo: url, linha: line, stack: error?.stack })
    });
};
```

---

## Troubleshooting

### Problema: "Erro ao carregar logs"
**Sintoma**: Tela exibe mensagem de erro ou fica carregando infinitamente.
**Causa**: O arquivo de log pode estar travado pelo IIS (lock de arquivo) ou ser muito grande (>10MB) causando timeout.
**Solução**: Tentar limpar o log via API ou acessar o servidor e deletar o arquivo físico em `/Logging/log_YYYYMMDD.txt`.

### Problema: Estatísticas zeradas
**Sintoma**: Cards mostram 0 mas há logs na tela.
**Causa**: O objeto `stats` retornado pela API pode estar nulo ou com nomes de propriedades diferentes (case sensitive).
**Verificação**: O frontend faz check duplo: `res.stats.TotalLogs || res.stats.totalLogs`.

### Problema: Logs antigos não aparecem
**Sintoma**: Filtro de data não traz dados de dias anteriores.
**Causa**: A política de retenção (`LogService`) pode ter excluído arquivos antigos (padrão 30 dias).

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [06/01/2026] - Criação da Documentação

**Descrição**:
Documentação inicial da página de Log de Erros.

**Status**: ✅ **Documentado**

**Responsável**: Claude (AI Assistant)
**Versão**: 1.0
