# Documentação: GridContratoController.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `GridContratoController` fornece endpoint para popular grid Syncfusion com itens de veículos de contratos.

**Principais características:**

✅ **DataSource Syncfusion**: Endpoint para Syncfusion DataGrid  
✅ **Itens de Veículos**: Lista itens de veículos de contratos

---

## Endpoints API

### GET `/api/GridContrato/DataSource`

**Descrição**: Retorna dados para Syncfusion DataGrid

**Response**: Lista de `ItensVeiculo` com dados de `ItemVeiculoContrato`

---

## Interconexões

### Quem Chama Este Controller

- **Syncfusion DataGrid**: Componente de grid
- **Pages**: Páginas de gestão de contratos

### O Que Este Controller Chama

- **`_unitOfWork.ItemVeiculoContrato`**: CRUD de itens

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do GridContratoController

**Arquivos Afetados**:
- `Controllers/GridContratoController.cs`

**Impacto**: Documentação de referência para grid de contratos

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
