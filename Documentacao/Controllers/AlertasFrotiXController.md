# Documentação: AlertasFrotiXController.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `AlertasFrotiXController` gerencia sistema completo de alertas do FrotiX, incluindo criação, listagem, notificação via SignalR e rastreamento de leitura por usuário.

**Principais características:**

✅ **CRUD Completo**: Criação, listagem, atualização, exclusão  
✅ **SignalR**: Notificações em tempo real via `AlertasHub`  
✅ **Rastreamento**: Rastreamento de leitura por usuário (`AlertasUsuarios`)  
✅ **Estatísticas**: Estatísticas de leitura, notificação, etc.

---

## Endpoints API Principais

### GET `/api/AlertasFrotiX/GetDetalhesAlerta/{id}`

**Descrição**: Obtém detalhes completos de um alerta incluindo estatísticas de usuários

**Parâmetros**: `id` (Guid)

**Response**: Dados completos do alerta com estatísticas de leitura por usuário

---

## Interconexões

### Quem Chama Este Controller

- **Pages**: Páginas de gestão de alertas
- **SignalR Hub**: Para notificações em tempo real

### O Que Este Controller Chama

- **`_unitOfWork.AlertasFrotiX`**: CRUD de alertas
- **`_alertasRepo`**: Repository específico de alertas
- **`_hubContext`**: SignalR para notificações
- **`_unitOfWork.AlertasUsuarios`**: Rastreamento de leitura

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do AlertasFrotiXController

**Arquivos Afetados**:
- `Controllers/AlertasFrotiXController.cs`

**Impacto**: Documentação de referência para sistema de alertas

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
