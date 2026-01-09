# Documentação: VeiculoController.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `VeiculoController` gerencia operações CRUD e relacionamentos de veículos no sistema FrotiX. Fornece endpoints para listagem, exclusão, atualização de status, consulta de contratos e valores de atas/contratos.

**Principais características:**

✅ **CRUD Completo**: Listagem, exclusão e atualização de status  
✅ **Validação de Dependências**: Verifica relacionamentos antes de excluir  
✅ **Relacionamentos**: Gerencia veículos por contrato  
✅ **Valores de Contratos/Atas**: Consulta valores mensais de itens

---

## Endpoints API

### GET `/api/Veiculo`

**Descrição**: Retorna lista de veículos com dados reduzidos da view `ViewVeiculos`

**Response**:
```json
{
  "data": [
    {
      "veiculoId": "guid",
      "placa": "ABC-1234",
      "quilometragem": 50000,
      "marcaModelo": "Ford/Fiesta",
      "sigla": "UNI01",
      "descricao": "Unidade Central",
      "consumo": 9.5,
      "origemVeiculo": "Próprio",
      "dataAlteracao": "2026-01-08",
      "nomeCompleto": "João Silva",
      "veiculoReserva": false,
      "status": true,
      "combustivelId": "guid",
      "veiculoProprio": true
    }
  ]
}
```

**Quando é chamado**: Pela página `Pages/Veiculo/Index.cshtml` para popular DataTable

---

### POST `/api/Veiculo/Delete`

**Descrição**: Exclui veículo com validação de dependências

**Request Body**: `VeiculoViewModel` com `VeiculoId`

**Validações**:
- Verifica se veículo está associado a contrato (`VeiculoContrato`)
- Verifica se veículo está associado a viagens (`Viagem`)

**Response**:
```json
{
  "success": false,
  "message": "Não foi possível remover o veículo. Ele está associado a um ou mais contratos!"
}
```

**Quando é chamado**: Ao excluir veículo na interface

---

### GET `/api/Veiculo/UpdateStatusVeiculo`

**Descrição**: Alterna status ativo/inativo do veículo

**Parâmetros**: `Id` (Guid) - ID do veículo

**Response**:
```json
{
  "success": true,
  "message": "Atualizado Status do Veículo [Nome: ABC-1234] (Inativo)",
  "type": 1
}
```

**Quando é chamado**: Ao clicar no toggle de status na interface

---

### GET `/api/Veiculo/VeiculoContratos`

**Descrição**: Lista veículos associados a um contrato específico

**Parâmetros**: `Id` (Guid) - ID do contrato

**Response**:
```json
{
  "data": [
    {
      "veiculoId": "guid",
      "placa": "ABC-1234",
      "marcaModelo": "Ford/Fiesta",
      "sigla": "UNI01",
      "combustivelDescricao": "Gasolina",
      "status": true
    }
  ]
}
```

**Quando é chamado**: Para exibir veículos de um contrato específico

---

### GET `/api/Veiculo/VeiculoContratosGlosa`

**Descrição**: Lista veículos elegíveis para glosa (com manutenções com período > 0 dias)

**Parâmetros**: `id` (Guid) - ID do contrato

**Lógica**: Filtra veículos que têm manutenções com `DataSolicitacao` e `DataDevolucao` válidas e período > 0 dias

**Response**: View HTML com lista de veículos

**Quando é chamado**: Para gestão de glosas de contratos

---

### POST `/api/Veiculo/DeleteContrato`

**Descrição**: Remove associação de veículo com contrato

**Request Body**: `VeiculoViewModel` com `VeiculoId` e `ContratoId`

**Lógica**:
- Remove registro de `VeiculoContrato`
- Se `Veiculo.ContratoId == ContratoId`, limpa `ContratoId` do veículo

**Quando é chamado**: Ao desassociar veículo de contrato

---

### GET `/api/Veiculo/SelecionaValorMensalAta`

**Descrição**: Obtém valor unitário mensal de um item de ata

**Parâmetros**: `itemAta` (Guid) - ID do item de ata

**Response**:
```json
{
  "valor": 1500.00
}
```

**Quando é chamado**: Para cálculos de valores em formulários

---

### GET `/api/Veiculo/SelecionaValorMensalContrato`

**Descrição**: Obtém valor unitário mensal de um item de contrato

**Parâmetros**: `itemContrato` (Guid) - ID do item de contrato

**Response**:
```json
{
  "valor": 2000.00
}
```

**Quando é chamado**: Para cálculos de valores em formulários

---

## Interconexões

### Quem Chama Este Controller

- **Pages**: `Pages/Veiculo/Index.cshtml` - Listagem e gestão
- **Pages**: `Pages/Contrato/*.cshtml` - Relacionamentos com contratos

### O Que Este Controller Chama

- **`_unitOfWork.ViewVeiculos`**: Consulta otimizada
- **`_unitOfWork.Veiculo`**: CRUD de veículos
- **`_unitOfWork.VeiculoContrato`**: Relacionamentos
- **`_unitOfWork.Viagem`**: Validação de dependências
- **`_unitOfWork.ItemVeiculoAta`**: Valores de atas
- **`_unitOfWork.ItemVeiculoContrato`**: Valores de contratos

---

## Notas Importantes

1. **Validação de Dependências**: Não permite exclusão se veículo tem contratos ou viagens
2. **View Otimizada**: Usa `ViewVeiculos` para melhor performance
3. **Status**: Alterna entre ativo/inativo sem excluir registro

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do VeiculoController

**Arquivos Afetados**:
- `Controllers/VeiculoController.cs`

**Impacto**: Documentação de referência para operações de veículos

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
