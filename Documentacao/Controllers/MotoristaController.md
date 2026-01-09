# Documentação: MotoristaController.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `MotoristaController` gerencia operações CRUD de motoristas, incluindo gestão de fotos, relacionamentos com contratos e atualização de status.

**Principais características:**

✅ **CRUD Completo**: Listagem, exclusão e atualização de status  
✅ **Gestão de Fotos**: Upload e recuperação de fotos em Base64  
✅ **Validação de Dependências**: Verifica contratos antes de excluir  
✅ **Relacionamentos**: Gerencia motoristas por contrato

---

## Endpoints API

### GET `/api/Motorista`

**Descrição**: Retorna lista completa de motoristas com informações de contratos

**Response**:
```json
{
  "data": [
    {
      "motoristaId": "guid",
      "nome": "João Silva",
      "ponto": "PONTO_01",
      "cnh": "123456789",
      "celular01": "11999999999",
      "categoriaCNH": "B",
      "sigla": "UNI01",
      "contratoMotorista": "2024/001 - Empresa XYZ",
      "status": true,
      "datadeAlteracao": "08/01/26",
      "nomeCompleto": "João da Silva",
      "efetivoFerista": true,
      "foto": null
    }
  ]
}
```

**Quando é chamado**: Pela página `Pages/Motorista/Index.cshtml`

---

### POST `/api/Motorista/Delete`

**Descrição**: Exclui motorista com validação de dependências

**Validações**: Verifica se motorista está associado a contratos (`MotoristaContrato`)

**Response**:
```json
{
  "success": false,
  "message": "Não foi possível remover o motorista. Ele está associado a um ou mais contratos!"
}
```

---

### GET `/api/Motorista/UpdateStatusMotorista`

**Descrição**: Alterna status ativo/inativo

**Parâmetros**: `Id` (Guid)

**Response**:
```json
{
  "success": true,
  "message": "Atualizado Status do Motorista [Nome: João Silva] (Ativo)",
  "type": 0
}
```

---

### GET `/api/Motorista/PegaFoto`

**Descrição**: Obtém foto do motorista convertida para Base64

**Parâmetros**: `id` (Guid)

**Response**: Objeto motorista com foto em Base64

---

### GET `/api/Motorista/PegaFotoModal`

**Descrição**: Obtém apenas foto do motorista para exibição em modal

**Parâmetros**: `id` (Guid)

**Response**: String Base64 da foto

---

### GET `/api/Motorista/MotoristaContratos`

**Descrição**: Lista motoristas associados a um contrato

**Parâmetros**: `Id` (Guid) - ID do contrato

**Response**: Lista de motoristas do contrato

---

### POST `/api/Motorista/DeleteContrato`

**Descrição**: Remove associação de motorista com contrato

**Request Body**: `MotoristaViewModel` com `MotoristaId` e `ContratoId`

**Lógica**: Remove `MotoristaContrato` e limpa `ContratoId` do motorista se necessário

---

## Interconexões

### Quem Chama Este Controller

- **Pages**: `Pages/Motorista/Index.cshtml`
- **Pages**: `Pages/Contrato/*.cshtml`

### O Que Este Controller Chama

- **`_unitOfWork.ViewMotoristas`**: Consulta otimizada
- **`_unitOfWork.Motorista`**: CRUD
- **`_unitOfWork.MotoristaContrato`**: Relacionamentos

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do MotoristaController

**Arquivos Afetados**:
- `Controllers/MotoristaController.cs`

**Impacto**: Documentação de referência para operações de motoristas

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
