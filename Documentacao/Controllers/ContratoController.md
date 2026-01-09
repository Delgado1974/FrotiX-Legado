# Documentação: ContratoController.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `ContratoController` gerencia operações CRUD de contratos, incluindo validação complexa de dependências, repactuações e relacionamentos com veículos, motoristas e empenhos.

**Principais características:**

✅ **CRUD Completo**: Listagem, exclusão e atualização de status  
✅ **Validação Complexa**: Verifica múltiplas dependências antes de excluir  
✅ **Repactuações**: Gerencia repactuações e itens relacionados  
✅ **Relacionamentos**: Integração com veículos, motoristas, empenhos

**⚠️ CRÍTICO**: Exclusão de contratos requer limpeza de múltiplos relacionamentos.

---

## Endpoints API

### GET `/api/Contrato`

**Descrição**: Retorna lista de contratos com informações formatadas

**Response**:
```json
{
  "data": [
    {
      "contratoCompleto": "2024/001",
      "processoCompleto": "12345/24",
      "objeto": "Prestação de serviços de transporte",
      "descricaoFornecedor": "Empresa XYZ",
      "periodo": "01/01/24 a 31/12/24",
      "valorFormatado": "R$ 1.200.000,00",
      "valorMensal": "R$ 100.000,00",
      "vigenciaCompleta": "1ª vigência + 2 prorrog.",
      "status": true,
      "contratoId": "guid"
    }
  ]
}
```

**Quando é chamado**: Pela página `Pages/Contrato/Index.cshtml`

---

### POST `/api/Contrato/Delete`

**Descrição**: **ENDPOINT CRÍTICO** - Exclui contrato com validação complexa de dependências

**Validações Sequenciais**:
1. Verifica se há veículos associados (`Veiculo.ContratoId`)
2. Verifica se há empenhos associados (`Empenho.ContratoId`)
3. Remove repactuações e itens relacionados:
   - Busca todas `RepactuacaoContrato` do contrato
   - Para cada repactuação, remove todos `ItemVeiculoContrato` relacionados
   - Remove as repactuações
4. Remove o contrato

**Response**:
```json
{
  "success": false,
  "message": "Existem veículos associados a esse contrato"
}
```

**⚠️ IMPORTANTE**: Processo de exclusão é complexo e requer múltiplas operações de limpeza.

---

### GET `/api/Contrato/UpdateStatusContrato`

**Descrição**: Alterna status ativo/inativo

**Parâmetros**: `Id` (Guid)

**Response**:
```json
{
  "success": true,
  "message": "Atualizado Status do Contrato [Nome: 2024/001] (Inativo)",
  "type": 1
}
```

---

## Interconexões

### Quem Chama Este Controller

- **Pages**: `Pages/Contrato/Index.cshtml`
- **Pages**: `Pages/Contrato/RepactuacaoContrato.cshtml`

### O Que Este Controller Chama

- **`_unitOfWork.Contrato`**: CRUD de contratos
- **`_unitOfWork.Veiculo`**: Validação de dependências
- **`_unitOfWork.Empenho`**: Validação de dependências
- **`_unitOfWork.RepactuacaoContrato`**: Limpeza de repactuações
- **`_unitOfWork.ItemVeiculoContrato`**: Limpeza de itens

---

## Notas Importantes

1. **Exclusão Complexa**: Requer limpeza de múltiplos relacionamentos
2. **Repactuações**: Remove repactuações e itens relacionados antes de excluir contrato
3. **Partial Class**: Controller dividido em múltiplos arquivos (ver arquivos relacionados)

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do ContratoController

**Arquivos Afetados**:
- `Controllers/ContratoController.cs`
- `Controllers/ContratoController.Partial.cs`
- `Controllers/ContratoController.VerificarDependencias.cs`

**Impacto**: Documentação de referência para operações de contratos

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
