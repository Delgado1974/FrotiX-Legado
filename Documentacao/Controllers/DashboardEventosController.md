# Documentação: DashboardEventosController.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `DashboardEventosController` fornece endpoints para dashboard de eventos, incluindo estatísticas gerais, análises por status, setor, requisitante e exportação PDF.

**Principais características:**

✅ **Estatísticas Gerais**: Totais, ativos, concluídos, cancelados, agendados  
✅ **Análises**: Por status, setor, requisitante, mês, dia  
✅ **Rankings**: Top 10 eventos maiores  
✅ **Exportação PDF**: Geração de relatórios em PDF

**Nota**: Controller implementado como partial class dividido em múltiplos arquivos.

---

## Endpoints API Principais

### GET `/api/DashboardEventos/ObterEstatisticasGerais`

**Descrição**: Estatísticas gerais de eventos

**Parâmetros**: `DataInicial`, `dataFim` (opcionais, padrão: últimos 30 dias)

---

### GET `/api/DashboardEventos/ObterEventosPorStatus`

**Descrição**: Distribuição de eventos por status

---

### GET `/api/DashboardEventos/ObterTop10EventosMaiores`

**Descrição**: Top 10 eventos com maior número de participantes

---

## Interconexões

### Quem Chama Este Controller

- **Pages**: `Pages/Eventos/DashboardEventos.cshtml`

### O Que Este Controller Chama

- **`_context.Evento`**: CRUD de eventos
- **`_userManager`**: Informações de usuários

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do DashboardEventosController

**Arquivos Afetados**:
- `Controllers/DashboardEventosController.cs`
- `Controllers/DashboardEventosController_ExportacaoPDF.cs`

**Impacto**: Documentação de referência para dashboard de eventos

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
