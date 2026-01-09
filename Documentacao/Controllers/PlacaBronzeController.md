# Documentação: PlacaBronzeController.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `PlacaBronzeController` gerencia operações CRUD de placas bronze (placas especiais para veículos).

**Principais características:**

✅ **CRUD Completo**: Listagem e exclusão  
✅ **Validação de Dependências**: Verifica veículos antes de excluir  
✅ **Relacionamento**: Join com veículos para exibir placa associada

---

## Endpoints API

### GET `/api/PlacaBronze`

**Descrição**: Retorna lista de placas bronze com informações de veículos associados

**Response**: Lista com join com veículos (left join)

---

### POST `/api/PlacaBronze/Delete`

**Descrição**: Exclui placa bronze com validação

**Validações**: Verifica se há veículos associados (`Veiculo.PlacaBronzeId`)

---

## Interconexões

### Quem Chama Este Controller

- **Pages**: Páginas de gestão de placas bronze
- **Pages**: `Pages/Veiculo/*.cshtml` - Para seleção de placa bronze

### O Que Este Controller Chama

- **`_unitOfWork.PlacaBronze`**: CRUD
- **`_unitOfWork.Veiculo`**: Validação de dependências e join

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do PlacaBronzeController

**Arquivos Afetados**:
- `Controllers/PlacaBronzeController.cs`

**Impacto**: Documentação de referência para operações de placas bronze

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
