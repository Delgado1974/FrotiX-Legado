# Documentação: AtaRegistroPrecosController.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `AtaRegistroPrecosController` gerencia operações CRUD de atas de registro de preços, incluindo validação complexa de dependências e limpeza de repactuações.

**Principais características:**

✅ **CRUD Completo**: Listagem, exclusão e atualização de status  
✅ **Validação Complexa**: Verifica veículos e repactuações antes de excluir  
✅ **Repactuações**: Remove repactuações e itens relacionados antes de excluir ata

**Nota**: Controller implementado como partial class dividido em múltiplos arquivos.

---

## Endpoints API Principais

### GET `/api/AtaRegistroPrecos`

**Descrição**: Retorna lista de atas com informações formatadas

**Response**: Lista ordenada por ano (descendente)

---

### POST `/api/AtaRegistroPrecos/Delete`

**Descrição**: Exclui ata com validação complexa

**Validações Sequenciais**:
1. Verifica se há veículos associados (`VeiculoAta.AtaId`)
2. Remove repactuações e itens relacionados:
   - Busca todas `RepactuacaoAta` da ata
   - Para cada repactuação, remove todos `ItemVeiculoAta` relacionados
   - Remove as repactuações
3. Remove a ata

---

### POST `/api/AtaRegistroPrecos/UpdateStatusAta`

**Descrição**: Alterna status ativo/inativo

---

## Interconexões

### Quem Chama Este Controller

- **Pages**: `Pages/Ata/*.cshtml`
- **Pages**: `Pages/Contrato/*.cshtml` - Para relacionamentos

### O Que Este Controller Chama

- **`_unitOfWork.AtaRegistroPrecos`**: CRUD
- **`_unitOfWork.VeiculoAta`**: Validação de dependências
- **`_unitOfWork.RepactuacaoAta`**: Limpeza de repactuações
- **`_unitOfWork.ItemVeiculoAta`**: Limpeza de itens

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do AtaRegistroPrecosController

**Arquivos Afetados**:
- `Controllers/AtaRegistroPrecosController.cs`
- `Controllers/AtaRegistroPrecosController.Partial.cs`

**Impacto**: Documentação de referência para operações de atas

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
