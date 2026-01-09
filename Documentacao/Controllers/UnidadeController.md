# Documentação: UnidadeController.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `UnidadeController` gerencia operações CRUD de unidades e **sistema complexo de lotação de motoristas**. É um dos controllers mais complexos do sistema devido à gestão de lotações.

**Principais características:**

✅ **CRUD de Unidades**: Listagem, exclusão e atualização de status  
✅ **Sistema de Lotação**: Gestão completa de lotação de motoristas em unidades  
✅ **Cobertura**: Sistema de cobertura de motoristas (substituição temporária)  
✅ **Validação de Dependências**: Verifica veículos antes de excluir unidade  
✅ **Notificações**: Usa `INotyfService` para notificações toast

**⚠️ CRÍTICO**: Sistema de lotação é complexo e afeta múltiplas entidades.

---

## Endpoints API

### GET `/api/Unidade`

**Descrição**: Retorna lista de todas as unidades

**Response**:
```json
{
  "data": [
    {
      "unidadeId": "guid",
      "descricao": "Unidade Central",
      "sigla": "UNI01",
      "status": true
    }
  ]
}
```

**Quando é chamado**: 
- Pela página `Pages/Unidade/Index.cshtml`
- Para popular dropdowns em outras páginas

---

### POST `/api/Unidade/Delete`

**Descrição**: Exclui unidade com validação

**Validações**: Verifica se há veículos associados (`Veiculo.UnidadeId`)

**Response**:
```json
{
  "success": false,
  "message": "Existem veículos associados a essa unidade"
}
```

---

### GET `/api/Unidade/UpdateStatus`

**Descrição**: Alterna status ativo/inativo

**Parâmetros**: `Id` (Guid)

**Response**:
```json
{
  "success": true,
  "type": 0
}
```

---

### GET `/api/Unidade/ListaLotacao`

**Descrição**: Lista lotações de motoristas

**Parâmetros**: `motoristaId` (string GUID opcional)

**Response**:
```json
{
  "data": [
    {
      "lotacaoMotoristaId": "guid",
      "motoristaId": "guid",
      "unidadeId": "guid",
      "dataInicio": "2026-01-01",
      "dataFim": null,
      "lotado": true,
      "motivo": "Lotação regular"
    }
  ]
}
```

**Quando é chamado**: Para exibir histórico de lotações de um motorista

---

### GET `/api/Unidade/LotaMotorista`

**Descrição**: **ENDPOINT CRÍTICO** - Cria nova lotação de motorista em unidade

**Parâmetros**:
- `MotoristaId` (string GUID)
- `UnidadeId` (string GUID)
- `DataInicio` (string)
- `DataFim` (string opcional)
- `Lotado` (bool)
- `Motivo` (string)

**Validações**:
- Verifica se já existe lotação com mesmos dados (`MotoristaId`, `UnidadeId`, `DataInicio`)

**Lógica**:
1. Valida duplicação
2. Cria `LotacaoMotorista`
3. **Atualiza `Motorista.UnidadeId`** para a unidade atual
4. Salva alterações

**Response**:
```json
{
  "data": "motorista-id",
  "message": "Lotação Adicionada com Sucesso",
  "lotacaoId": "guid"
}
```

**⚠️ IMPORTANTE**: Atualiza `Motorista.UnidadeId` automaticamente.

---

### GET `/api/Unidade/EditaLotacao`

**Descrição**: Edita lotação existente

**Parâmetros**: Mesmos de `LotaMotorista` + `LotacaoId`

**Lógica**:
- Atualiza `LotacaoMotorista`
- Atualiza `Motorista.UnidadeId` se necessário

---

### GET `/api/Unidade/DeleteLotacao`

**Descrição**: Remove lotação e limpa `Motorista.UnidadeId`

**Parâmetros**: `Id` (string GUID) - ID da lotação

**Lógica**:
1. Remove `LotacaoMotorista`
2. Define `Motorista.UnidadeId = Guid.Empty`

---

### GET `/api/Unidade/AtualizaMotoristaLotacaoAtual`

**Descrição**: **ENDPOINT COMPLEXO** - Atualiza lotação atual do motorista

**Parâmetros**:
- `MotoristaId` (string)
- `UnidadeAtualId` (string)
- `UnidadeNovaId` (string opcional)
- `DataFimLotacaoAnterior` (string)
- `DataInicioNovoMotivo` (string)
- `MotivoLotacaoAtual` (string)

**Lógica**:
- Se `UnidadeNovaId == null`: Remove lotação (define `Motorista.UnidadeId = Empty`, finaliza lotação atual)
- Se `UnidadeAtualId != UnidadeNovaId`: Finaliza lotação atual e cria nova

---

### GET `/api/Unidade/AlocaMotoristaCobertura`

**Descrição**: **ENDPOINT MUITO COMPLEXO** - Sistema de cobertura de motoristas

**Parâmetros**:
- `MotoristaId` (string) - Motorista que sai
- `MotoristaCoberturaId` (string opcional) - Motorista que cobre
- `DataFimLotacao` (string)
- `DataInicioLotacao` (string)
- `DataInicioCobertura` (string)
- `DataFimCobertura` (string)
- `UnidadeId` (string)

**Lógica Complexa**:
1. **Desabilita Motorista Atual**: Finaliza lotação atual, define `Lotado = false`, motivo "Férias"
2. **Insere Motorista Atual em Nova Lotação**: Cria lotação temporária (férias)
3. **Remove Motorista Cobertura da Lotação Atual**: Se houver cobertura, finaliza lotação atual
4. **Aloca Motorista Cobertura**: Cria nova lotação para motorista de cobertura

**⚠️ CRÍTICO**: Este endpoint realiza múltiplas operações em cascata.

---

### GET `/api/Unidade/ListaLotacoes`

**Descrição**: Lista todas as lotações agrupadas por categoria

**Parâmetros**: `categoriaId` (string opcional) - Filtro por categoria

**Response**: Lista de lotações ordenadas por categoria e unidade

---

### GET `/api/Unidade/RemoveLotacoes`

**Descrição**: Desativa múltiplas lotações de um motorista

**Parâmetros**: 
- `motoristaId` (string)
- `lotacaoAtualId` (Guid) - Lotação a manter ativa

**Lógica**: Desativa todas lotações do motorista exceto a atual

---

## Interconexões

### Quem Chama Este Controller

- **Pages**: `Pages/Unidade/Index.cshtml`
- **Pages**: `Pages/Motorista/*.cshtml` - Para gestão de lotações
- **Pages**: `Pages/Contrato/*.cshtml` - Para relacionamentos

### O Que Este Controller Chama

- **`_unitOfWork.Unidade`**: CRUD
- **`_unitOfWork.LotacaoMotorista`**: Gestão de lotações
- **`_unitOfWork.Motorista`**: Atualização de `UnidadeId`
- **`_unitOfWork.ViewLotacaoMotorista`**: Consulta otimizada
- **`_unitOfWork.ViewLotacoes`**: Listagem agrupada
- **`_notyf`**: Notificações toast

---

## Notas Importantes

1. **Sistema de Lotação**: Muito complexo, afeta múltiplas entidades
2. **Motorista.UnidadeId**: Atualizado automaticamente em várias operações
3. **Cobertura**: Sistema permite substituição temporária de motoristas
4. **Notificações**: Usa `INotyfService` para feedback ao usuário

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do UnidadeController

**Arquivos Afetados**:
- `Controllers/UnidadeController.cs`

**Impacto**: Documentação de referência para operações de unidades e lotações

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
