# Documentação: EncarregadoController.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `EncarregadoController` gerencia operações CRUD de encarregados, incluindo gestão de fotos e relacionamentos com contratos.

**Principais características:**

✅ **CRUD Completo**: Listagem, exclusão e atualização de status  
✅ **Gestão de Fotos**: Upload e recuperação de fotos em Base64  
✅ **Validação de Dependências**: Verifica contratos antes de excluir  
✅ **Relacionamentos**: Gerencia encarregados por contrato

---

## Endpoints API

### GET `/api/Encarregado`

**Descrição**: Retorna lista de encarregados com informações de contratos e usuário de alteração

**Response**:
```json
{
  "data": [
    {
      "encarregadoId": "guid",
      "nome": "João Silva",
      "ponto": "PONTO_01",
      "celular01": "11999999999",
      "contratoEncarregado": "2024/001 - Empresa XYZ",
      "status": true,
      "foto": null,
      "datadeAlteracao": "08/01/26",
      "nomeCompleto": "João da Silva"
    }
  ]
}
```

**Quando é chamado**: Pela página `Pages/Encarregado/Index.cshtml`

---

### POST `/api/Encarregado/Delete`

**Descrição**: Exclui encarregado com validação de dependências

**Validações**: Verifica se encarregado está associado a contratos (`EncarregadoContrato`)

---

### GET `/api/Encarregado/UpdateStatusEncarregado`

**Descrição**: Alterna status ativo/inativo

**Parâmetros**: `Id` (Guid)

---

### GET `/api/Encarregado/PegaFoto`

**Descrição**: Obtém foto do encarregado convertida para Base64

**Parâmetros**: `id` (Guid)

---

### GET `/api/Encarregado/PegaFotoModal`

**Descrição**: Obtém apenas foto do encarregado para exibição em modal

**Parâmetros**: `id` (Guid)

---

### GET `/api/Encarregado/EncarregadoContratos`

**Descrição**: Lista encarregados associados a um contrato

**Parâmetros**: `Id` (Guid) - ID do contrato

---

### POST `/api/Encarregado/DeleteContrato`

**Descrição**: Remove associação de encarregado com contrato

**Request Body**: `EncarregadoViewModel` com `EncarregadoId` e `ContratoId`

---

## Interconexões

### Quem Chama Este Controller

- **Pages**: `Pages/Encarregado/Index.cshtml`
- **Pages**: `Pages/Contrato/*.cshtml`

### O Que Este Controller Chama

- **`_unitOfWork.Encarregado`**: CRUD
- **`_unitOfWork.EncarregadoContrato`**: Relacionamentos
- **`_unitOfWork.Contrato`**: Join para informações de contrato
- **`_unitOfWork.Fornecedor`**: Join para informações de fornecedor
- **`_unitOfWork.AspNetUsers`**: Join para usuário de alteração

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do EncarregadoController

**Arquivos Afetados**:
- `Controllers/EncarregadoController.cs`

**Impacto**: Documentação de referência para operações de encarregados

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
