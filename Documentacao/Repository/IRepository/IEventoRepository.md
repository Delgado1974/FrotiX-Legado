# Documentação: IEventoRepository.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

A interface `IEventoRepository` define o contrato específico para operações de repositório de eventos, incluindo método otimizado de paginação.

**Principais características:**

✅ **Herança**: Estende `IRepository<Evento>`  
✅ **Dropdown**: Método para lista de seleção  
✅ **Paginação Otimizada**: Método complexo com JOINs e cálculos

---

## Métodos Específicos

### `GetEventoListForDropDown()`

**Descrição**: Retorna lista de eventos para DropDownList

---

### `Update(Evento evento)`

**Descrição**: Atualiza evento com lógica específica

---

### `GetEventosPaginadoAsync(...)`

**Descrição**: Lista eventos com paginação e otimização

**Parâmetros**:
- `page`: Número da página
- `pageSize`: Tamanho da página
- `filtroStatus`: Filtro opcional por status

**Retorno**: Tupla com lista de eventos formatados e total de itens

**Características**:
- JOINs com Requisitante e SetorSolicitante
- Cálculo de custos em batch
- Formatação de dados
- Performance monitoring

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do IEventoRepository

**Arquivos Afetados**:
- `Repository/IRepository/IEventoRepository.cs`

**Impacto**: Documentação de referência para interface de eventos

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
