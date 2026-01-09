# Documentação: OperadorController.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `OperadorController` gerencia operações CRUD de operadores, incluindo gestão de fotos e relacionamentos com contratos. Similar ao `EncarregadoController` e `MotoristaController`.

**Principais características:**

✅ **CRUD Completo**: Listagem, exclusão e atualização de status  
✅ **Gestão de Fotos**: Upload e recuperação de fotos em Base64  
✅ **Validação de Dependências**: Verifica contratos antes de excluir  
✅ **Relacionamentos**: Gerencia operadores por contrato

---

## Endpoints API

### GET `/api/Operador`

**Descrição**: Retorna lista de operadores com informações de contratos

**Response**:
```json
{
  "data": [
    {
      "operadorId": "guid",
      "nome": "João Silva",
      "ponto": "PONTO_01",
      "celular01": "11999999999",
      "contratoOperador": "2024/001 - Empresa XYZ",
      "status": true,
      "foto": null,
      "datadeAlteracao": "08/01/26",
      "nomeCompleto": "João da Silva"
    }
  ]
}
```

**Quando é chamado**: Pela página `Pages/Operador/Index.cshtml`

---

### POST `/api/Operador/Delete`

**Descrição**: Exclui operador com validação de dependências

**Validações**: Verifica se operador está associado a contratos (`OperadorContrato`)

---

### GET `/api/Operador/UpdateStatusOperador`

**Descrição**: Alterna status ativo/inativo

**Parâmetros**: `Id` (Guid)

---

### GET `/api/Operador/PegaFoto`

**Descrição**: Obtém foto do operador convertida para Base64

**Parâmetros**: `id` (Guid)

---

### GET `/api/Operador/PegaFotoModal`

**Descrição**: Obtém apenas foto do operador para exibição em modal

**Parâmetros**: `id` (Guid)

---

### GET `/api/Operador/OperadorContratos`

**Descrição**: Lista operadores associados a um contrato

**Parâmetros**: `Id` (Guid) - ID do contrato

---

### POST `/api/Operador/DeleteContrato`

**Descrição**: Remove associação de operador com contrato

**Request Body**: `OperadorViewModel` com `OperadorId` e `ContratoId`

---

## Interconexões

### Quem Chama Este Controller

- **Pages**: `Pages/Operador/Index.cshtml`
- **Pages**: `Pages/Contrato/*.cshtml`

### O Que Este Controller Chama

- **`_unitOfWork.Operador`**: CRUD
- **`_unitOfWork.OperadorContrato`**: Relacionamentos
- **`_unitOfWork.Contrato`**: Join para informações de contrato
- **`_unitOfWork.Fornecedor`**: Join para informações de fornecedor
- **`_unitOfWork.AspNetUsers`**: Join para usuário de alteração

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do OperadorController

**Arquivos Afetados**:
- `Controllers/OperadorController.cs`

**Impacto**: Documentação de referência para operações de operadores

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
