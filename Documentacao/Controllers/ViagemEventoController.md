# Documentação: ViagemEventoController.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `ViagemEventoController` gerencia operações relacionadas a viagens de eventos, incluindo listagem, fluxo Economildo e filtros.

**Principais características:**

✅ **Listagem**: Lista viagens com finalidade "Evento"  
✅ **Fluxo Economildo**: Visualização de fluxo de viagens Economildo  
✅ **Filtros**: Por veículo, motorista, status

**Nota**: Controller implementado como partial class dividido em múltiplos arquivos.

---

## Endpoints API Principais

### GET `/api/ViagemEvento`

**Descrição**: Lista viagens com finalidade "Evento"

**Parâmetros**: `Id` (string opcional)

**Filtro**: `Finalidade == "Evento"` e `StatusAgendamento == false`

---

### GET `/api/ViagemEvento/ViagemEventos`

**Descrição**: Lista todas as viagens de eventos

---

### GET `/api/ViagemEvento/Fluxo`

**Descrição**: Lista fluxo Economildo ordenado por data, MOB e hora

**Response**: Dados de `ViewFluxoEconomildo`

---

### GET `/api/ViagemEvento/FluxoVeiculos`

**Descrição**: Lista fluxo filtrado por veículo

**Parâmetros**: `Id` (string GUID) - ID do veículo

---

## Interconexões

### Quem Chama Este Controller

- **Pages**: `Pages/Eventos/*.cshtml`
- **Pages**: Páginas de gestão de eventos

### O Que Este Controller Chama

- **`_unitOfWork.ViewViagens`**: View otimizada
- **`_unitOfWork.ViewFluxoEconomildo`**: View de fluxo Economildo

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do ViagemEventoController

**Arquivos Afetados**:
- `Controllers/ViagemEventoController.cs`
- `Controllers/ViagemEventoController.UpdateStatus.cs`

**Impacto**: Documentação de referência para operações de viagens de eventos

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
