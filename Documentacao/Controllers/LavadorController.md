# Documentação: LavadorController.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `LavadorController` gerencia operações CRUD de lavadores, incluindo gestão de fotos e relacionamentos com contratos. Similar ao `EncarregadoController` e `OperadorController`.

**Principais características:**

✅ **CRUD Completo**: Listagem, exclusão e atualização de status  
✅ **Gestão de Fotos**: Upload e recuperação de fotos em Base64  
✅ **Validação de Dependências**: Verifica contratos antes de excluir  
✅ **Relacionamentos**: Gerencia lavadores por contrato

---

## Endpoints API

### GET `/api/Lavador`

**Descrição**: Retorna lista de lavadores com informações de contratos

**Response**: Lista de lavadores com join com contratos e fornecedores

---

### POST `/api/Lavador/Delete`

**Descrição**: Exclui lavador com validação de dependências

**Validações**: Verifica se lavador está associado a contratos (`LavadorContrato`)

---

### GET `/api/Lavador/UpdateStatusLavador`

**Descrição**: Alterna status ativo/inativo

---

### GET `/api/Lavador/PegaFoto`

**Descrição**: Obtém foto do lavador convertida para Base64

---

### GET `/api/Lavador/LavadorContratos`

**Descrição**: Lista lavadores associados a um contrato

---

### POST `/api/Lavador/DeleteContrato`

**Descrição**: Remove associação de lavador com contrato

---

## Interconexões

### Quem Chama Este Controller

- **Pages**: `Pages/Lavador/Index.cshtml`
- **Pages**: `Pages/Contrato/*.cshtml`

### O Que Este Controller Chama

- **`_unitOfWork.Lavador`**: CRUD
- **`_unitOfWork.LavadorContrato`**: Relacionamentos
- **`_unitOfWork.Contrato`**: Join para informações de contrato
- **`_unitOfWork.Fornecedor`**: Join para informações de fornecedor
- **`_unitOfWork.AspNetUsers`**: Join para usuário de alteração

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do LavadorController

**Arquivos Afetados**:
- `Controllers/LavadorController.cs`

**Impacto**: Documentação de referência para operações de lavadores

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
