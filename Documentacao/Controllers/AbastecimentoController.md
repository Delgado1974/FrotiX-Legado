# Documentação: AbastecimentoController.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Estrutura de Arquivos](#estrutura-de-arquivos)
4. [Endpoints API](#endpoints-api)
5. [Lógica de Negócio](#lógica-de-negócio)
6. [Interconexões](#interconexões)
7. [Exemplos de Uso](#exemplos-de-uso)
8. [Troubleshooting](#troubleshooting)

---

## Visão Geral

O `AbastecimentoController` é um controller crítico do sistema FrotiX que gerencia todas as operações relacionadas a abastecimentos de veículos. É implementado como **partial class** dividido em múltiplos arquivos para melhor organização.

**Principais características:**

✅ **CRUD Completo**: Listagem, filtros e edição de abastecimentos  
✅ **Importação de Dados**: Importa planilhas Excel (XLS/XLSX) com validações  
✅ **Filtros Avançados**: Por veículo, motorista, combustível, unidade, data  
✅ **Edição de KM**: Permite correção de quilometragem rodada  
✅ **Gestão de Cupons**: Lista e gerencia registros de cupons de abastecimento  
✅ **Dashboard API**: Endpoints otimizados para dashboards (arquivo separado)  
✅ **Pendências**: Sistema de validação e correção de pendências (arquivo separado)  
✅ **SignalR**: Suporte a notificações em tempo real durante importações

**⚠️ CRÍTICO**: Qualquer alteração afeta o controle de combustível do sistema.

---

## Arquitetura

### Tecnologias Utilizadas

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| ASP.NET Core | 3.1+ | Framework base |
| Entity Framework Core | - | Acesso a dados |
| NPOI | - | Leitura de arquivos Excel (XLS/XLSX) |
| SignalR | - | Notificações em tempo real |
| TransactionScope | - | Transações para importação |

### Padrões de Design

- **Partial Class**: Controller dividido em múltiplos arquivos
- **Repository Pattern**: Usa `IUnitOfWork` para acesso a dados
- **View Pattern**: Usa `ViewAbastecimentos` para consultas otimizadas
- **Transaction Pattern**: Usa `TransactionScope` para garantir atomicidade

---

## Estrutura de Arquivos

### Arquivos do Controller (Partial Class)

```
Controllers/AbastecimentoController.cs                    - Métodos principais
Controllers/AbastecimentoController.DashboardAPI.cs      - Endpoints de dashboard
Controllers/AbastecimentoController.Pendencias.cs       - Gestão de pendências
Controllers/AbastecimentoController.Import.cs            - Importação avançada
Controllers/AbastecimentoImportController.cs              - Controller alternativo de importação
```

### Arquivos Relacionados

- **Pages**: 
  - `Pages/Abastecimento/Index.cshtml` - Listagem e filtros
  - `Pages/Abastecimento/Pendencias.cshtml` - Gestão de pendências
  - `Pages/Abastecimento/Importacao.cshtml` - Interface de importação
  - `Pages/Abastecimento/DashboardAbastecimento.cshtml` - Dashboard
- **Models**: `Models/Abastecimento.cs`, `Models/AbastecimentoPendente.cs`
- **Views**: `Models/Views/ViewAbastecimentos.cs`
- **Hubs**: `Hubs/ImportacaoHub.cs` - SignalR para notificações

---

## Endpoints API

### GET `/api/Abastecimento`

**Descrição**: Retorna todos os abastecimentos ordenados por data/hora (decrescente)

**Parâmetros**: Nenhum

**Response**:
```json
{
  "data": [
    {
      "abastecimentoId": "guid",
      "dataHora": "2026-01-08T10:30:00",
      "placa": "ABC-1234",
      "motoristaCondutor": "João Silva",
      "tipoCombustivel": "Gasolina",
      "litros": 50.00,
      "valorUnitario": 5.50,
      "valorTotal": 275.00,
      "kmRodado": 450,
      "consumo": 9.00
    }
  ]
}
```

**Quando é chamado**: 
- Ao carregar página de listagem (`Pages/Abastecimento/Index.cshtml`)
- Para popular DataTable inicial

---

### GET `/api/Abastecimento/AbastecimentoVeiculos`

**Descrição**: Retorna abastecimentos filtrados por veículo

**Parâmetros**: `Id` (Guid) - ID do veículo

**Response**: Mesmo formato de `Get()`, mas filtrado por veículo

**Quando é chamado**: Ao selecionar veículo no filtro da página Index

---

### GET `/api/Abastecimento/AbastecimentoCombustivel`

**Descrição**: Retorna abastecimentos filtrados por combustível

**Parâmetros**: `Id` (Guid) - ID do combustível

**Response**: Mesmo formato de `Get()`, mas filtrado por combustível

---

### GET `/api/Abastecimento/AbastecimentoUnidade`

**Descrição**: Retorna abastecimentos filtrados por unidade

**Parâmetros**: `Id` (Guid) - ID da unidade

**Response**: Mesmo formato de `Get()`, mas filtrado por unidade

---

### GET `/api/Abastecimento/AbastecimentoMotorista`

**Descrição**: Retorna abastecimentos filtrados por motorista

**Parâmetros**: `Id` (Guid) - ID do motorista

**Response**: Mesmo formato de `Get()`, mas filtrado por motorista

---

### GET `/api/Abastecimento/AbastecimentoData`

**Descrição**: Retorna abastecimentos filtrados por data

**Parâmetros**: `dataAbastecimento` (string) - Data no formato "dd/MM/yyyy"

**Response**: Mesmo formato de `Get()`, mas filtrado por data

**Quando é chamado**: Ao selecionar data no filtro da página Index

---

### POST `/api/Abastecimento/Import`

**Descrição**: **ENDPOINT CRÍTICO** - Importa planilha Excel (XLS/XLSX) com abastecimentos

**Request**: `multipart/form-data` com arquivo Excel

**Response**:
```json
{
  "success": true,
  "message": "Planilha Importada com Sucesso",
  "response": "<table>...</table>"  // HTML da tabela de preview
}
```

**Lógica Complexa**:

1. **Upload do Arquivo**:
   - Recebe arquivo via `Request.Form.Files[0]`
   - Salva em `wwwroot/DadosEditaveis/UploadExcel/`
   - Suporta `.xls` (HSSFWorkbook) e `.xlsx` (XSSFWorkbook)

2. **Leitura da Planilha**:
   - Lê primeira linha como cabeçalho
   - Processa colunas específicas: 5, 7, 10, 11, 12, 13, 14, 15
   - Ignora linhas vazias

3. **Validações**:
   - **Duplicação por Data**: Verifica se já existe abastecimento para a data (primeira linha, coluna 0)
   - **Veículo**: Valida se placa existe no banco (coluna 5)
   - **Motorista**: Valida se nome existe no banco (coluna 10, remove pontos)
   - **Combustível**: Mapeia "GASOLINA" ou "ETANOL" para GUIDs fixos

4. **Processamento**:
   - Coluna 7: Data/Hora do abastecimento
   - Coluna 5: Placa do veículo (busca VeiculoId)
   - Coluna 10: Nome do motorista (busca MotoristaId)
   - Coluna 11: KM Anterior
   - Coluna 12: KM Atual (Hodometro)
   - Coluna 13: Tipo de combustível (mapeia para CombustivelId)
   - Coluna 14: Valor unitário
   - Coluna 15: Litros
   - Calcula: `KmRodado = KM Atual - KM Anterior`
   - Calcula: `Consumo = KmRodado / Litros`

5. **Transação**:
   - Usa `TransactionScope` com timeout de 30 minutos
   - Se erro ocorrer, rollback automático
   - Salva cada registro individualmente (`_unitOfWork.Save()` após cada linha)

6. **Preview HTML**:
   - Gera tabela HTML com dados importados
   - Inclui colunas: Data, Placa, Motorista, KM Anterior, KM Atual, Combustível, Valor Unitário, Litros, Consumo, Média
   - Média usa `ViewMediaConsumo` se disponível, senão calcula consumo atual

**⚠️ IMPORTANTE**: 
- Validação de duplicação verifica apenas primeira linha (i == 1)
- Combustíveis usam GUIDs hardcoded (não ideal, mas funcional)
- Salva após cada linha (pode ser lento para grandes volumes)

**Quando é chamado**: 
- Pela página de importação (`Pages/Abastecimento/Importacao.cshtml`)
- Upload manual de planilhas Excel

---

### POST `/api/Abastecimento/EditaKm`

**Descrição**: Edita quilometragem rodada de um abastecimento existente

**Request Body**:
```json
{
  "AbastecimentoId": "guid",
  "KmRodado": 450
}
```

**Response**:
```json
{
  "success": true,
  "message": "Abastecimento atualizado com sucesso",
  "type": 0
}
```

**Lógica**:
1. Busca abastecimento pelo ID
2. Atualiza apenas campo `KmRodado`
3. Salva alterações

**Quando é chamado**: 
- Ao editar KM na página Index via modal
- Correção manual de dados incorretos

---

### GET `/api/Abastecimento/MotoristaList`

**Descrição**: Retorna lista de motoristas ordenados por nome

**Parâmetros**: Nenhum

**Response**:
```json
{
  "data": [
    {
      "motoristaId": "guid",
      "nome": "João Silva",
      ...
    }
  ]
}
```

**Quando é chamado**: Para popular dropdown de filtro de motoristas

---

### GET `/api/Abastecimento/UnidadeList`

**Descrição**: Retorna lista de unidades ordenadas por descrição

**Parâmetros**: Nenhum

**Response**: Lista de unidades

**Quando é chamado**: Para popular dropdown de filtro de unidades

---

### GET `/api/Abastecimento/CombustivelList`

**Descrição**: Retorna lista de combustíveis ordenados por descrição

**Parâmetros**: Nenhum

**Response**: Lista de combustíveis

**Quando é chamado**: Para popular dropdown de filtro de combustíveis

---

### GET `/api/Abastecimento/VeiculoList`

**Descrição**: Retorna lista de veículos com marca/modelo formatados

**Parâmetros**: Nenhum

**Response**:
```json
{
  "data": [
    {
      "veiculoId": "guid",
      "placaMarcaModelo": "ABC-1234 - Ford/Fiesta"
    }
  ]
}
```

**Quando é chamado**: Para popular dropdown de filtro de veículos

---

### GET `/api/Abastecimento/ListaRegistroCupons`

**Descrição**: Lista registros de cupons de abastecimento ordenados por data

**Parâmetros**: `IDapi` (string) - Não usado

**Response**:
```json
{
  "data": [
    {
      "dataRegistro": "08/01/2026",
      "registroCupomId": "guid"
    }
  ]
}
```

---

### GET `/api/Abastecimento/PegaRegistroCupons`

**Descrição**: Obtém PDF de um registro de cupom específico

**Parâmetros**: `IDapi` (string GUID) - ID do registro

**Response**:
```json
{
  "RegistroPDF": "base64-string-do-pdf"
}
```

---

### GET `/api/Abastecimento/PegaRegistroCuponsData`

**Descrição**: Lista registros de cupons por data específica

**Parâmetros**: `id` (string) - Data no formato parseável por `DateTime.Parse()`

**Response**: Lista de registros da data especificada

---

### GET `/api/Abastecimento/DeleteRegistro`

**Descrição**: Exclui um registro de cupom

**Parâmetros**: `IDapi` (string GUID) - ID do registro

**Response**:
```json
{
  "success": true,
  "message": "Registro excluído com sucesso!"
}
```

---

## Lógica de Negócio

### Mapeamento de Colunas Excel

| Coluna | Descrição | Validação |
|--------|-----------|-----------|
| 0 | Data (validação de duplicação) | Verifica se já existe abastecimento para a data |
| 5 | Placa do veículo | Busca `VeiculoId` no banco |
| 7 | Data/Hora do abastecimento | Converte para `DateTime` |
| 10 | Nome do motorista | Remove pontos, busca `MotoristaId` |
| 11 | KM Anterior | Converte para `int` |
| 12 | KM Atual (Hodometro) | Converte para `int` |
| 13 | Tipo de combustível | Mapeia para GUID: "GASOLINA" → `F668F660-...`, outros → `A69AA86A-...` |
| 14 | Valor unitário | Converte para `double` |
| 15 | Litros | Converte para `double` |

### Cálculos Automáticos

1. **KM Rodado**: `KmRodado = KM Atual (col 12) - KM Anterior (col 11)`
2. **Consumo**: `Consumo = KmRodado / Litros`
3. **Média do Veículo**: Busca em `ViewMediaConsumo`, senão usa consumo atual

### Validações de Importação

- **Duplicação**: Verifica se já existe abastecimento para a data (apenas primeira linha)
- **Veículo**: Deve existir no banco, senão retorna erro
- **Motorista**: Deve existir no banco, senão retorna erro
- **Combustível**: Mapeia texto para GUID fixo

---

## Interconexões

### Quem Chama Este Controller

#### Página Index (`Pages/Abastecimento/Index.cshtml`)

**Chamadas principais**:
- `GET /api/Abastecimento` - Listagem inicial
- `GET /api/Abastecimento/AbastecimentoVeiculos` - Filtro por veículo
- `GET /api/Abastecimento/AbastecimentoCombustivel` - Filtro por combustível
- `GET /api/Abastecimento/AbastecimentoUnidade` - Filtro por unidade
- `GET /api/Abastecimento/AbastecimentoMotorista` - Filtro por motorista
- `GET /api/Abastecimento/AbastecimentoData` - Filtro por data
- `POST /api/Abastecimento/EditaKm` - Edição de KM
- `GET /api/Abastecimento/MotoristaList` - Lista motoristas
- `GET /api/Abastecimento/UnidadeList` - Lista unidades
- `GET /api/Abastecimento/CombustivelList` - Lista combustíveis
- `GET /api/Abastecimento/VeiculoList` - Lista veículos

#### Página Pendências (`Pages/Abastecimento/Pendencias.cshtml`)

**Chamadas**: Ver `AbastecimentoController.Pendencias.cs`

#### Página Importação (`Pages/Abastecimento/Importacao.cshtml`)

**Chamadas**: 
- `POST /api/Abastecimento/Import` - Importação legada
- `POST /api/Abastecimento/ImportarDual` - Importação dual (CSV + XLSX)

### O Que Este Controller Chama

- **`_unitOfWork.ViewAbastecimentos`**: Consulta otimizada de abastecimentos
- **`_unitOfWork.Abastecimento`**: CRUD de abastecimentos
- **`_unitOfWork.Veiculo`**: Validação de veículos
- **`_unitOfWork.Motorista`**: Validação de motoristas
- **`_unitOfWork.Combustivel`**: Listagem de combustíveis
- **`_unitOfWork.Unidade`**: Listagem de unidades
- **`_unitOfWork.ViewMediaConsumo`**: Média de consumo por veículo
- **`_unitOfWork.RegistroCupomAbastecimento`**: Gestão de cupons
- **`_hubContext`**: Notificações SignalR durante importação
- **`NPOI`**: Leitura de arquivos Excel

---

## Exemplos de Uso

### Exemplo 1: Listar Todos Abastecimentos

**JavaScript**:
```javascript
$.ajax({
    url: '/api/Abastecimento',
    type: 'GET',
    success: function(response) {
        // response.data contém array de abastecimentos
        console.log('Total:', response.data.length);
    }
});
```

---

### Exemplo 2: Filtrar por Veículo

**JavaScript**:
```javascript
var veiculoId = 'guid-do-veiculo';

$.ajax({
    url: '/api/Abastecimento/AbastecimentoVeiculos',
    type: 'GET',
    data: { Id: veiculoId },
    success: function(response) {
        // response.data contém abastecimentos do veículo
    }
});
```

---

### Exemplo 3: Editar KM Rodado

**JavaScript**:
```javascript
$.ajax({
    url: '/api/Abastecimento/EditaKm',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({
        AbastecimentoId: 'guid-abastecimento',
        KmRodado: 450
    }),
    success: function(response) {
        if (response.success) {
            alert(response.message);
            // Recarrega tabela
        }
    }
});
```

---

### Exemplo 4: Importar Planilha

**HTML**:
```html
<form id="formImport">
    <input type="file" name="file" accept=".xls,.xlsx" />
    <button type="submit">Importar</button>
</form>
```

**JavaScript**:
```javascript
$('#formImport').submit(function(e) {
    e.preventDefault();
    
    var formData = new FormData();
    formData.append('file', $('#file')[0].files[0]);
    
    $.ajax({
        url: '/api/Abastecimento/Import',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function(response) {
            if (response.success) {
                // Exibe preview HTML
                $('#preview').html(response.response);
            }
        }
    });
});
```

---

## Troubleshooting

### Problema: Importação falha com "Veículo não encontrado"

**Causa**: Placa na planilha não existe no banco ou formato diferente

**Solução**:
1. Verificar se placa está cadastrada em `Veiculo`
2. Verificar formato da placa (maiúsculas/minúsculas, hífen)
3. Verificar se coluna 5 está correta na planilha

---

### Problema: Importação falha com "Motorista não encontrado"

**Causa**: Nome do motorista na planilha não corresponde ao banco

**Solução**:
1. Verificar se motorista está cadastrado
2. Verificar se nome na planilha corresponde exatamente (após remover pontos)
3. Verificar se coluna 10 está correta

---

### Problema: KM Rodado negativo após importação

**Causa**: KM Anterior maior que KM Atual na planilha

**Solução**:
1. Verificar dados na planilha (colunas 11 e 12)
2. Corrigir manualmente após importação usando `EditaKm`
3. Implementar validação prévia na importação

---

### Problema: Duplicação de abastecimentos na mesma data

**Causa**: Validação de duplicação verifica apenas primeira linha

**Solução**:
1. Verificar se já existem abastecimentos para a data antes de importar
2. Melhorar validação para verificar todas as linhas
3. Usar `AutorizacaoQCard` como chave única (se disponível)

---

### Problema: Importação muito lenta

**Causa**: `_unitOfWork.Save()` é chamado após cada linha

**Solução**:
1. Otimizar para salvar em batch (múltiplas linhas por vez)
2. Usar `SaveChanges()` apenas ao final da transação
3. Considerar importação assíncrona com SignalR

---

## Notas Importantes

1. **Partial Class**: Controller dividido em múltiplos arquivos para organização
2. **GUIDs Hardcoded**: Combustíveis usam GUIDs fixos (não ideal)
3. **Validação Limitada**: Duplicação verifica apenas primeira linha
4. **Performance**: Importação salva linha por linha (pode ser lento)
5. **TransactionScope**: Timeout de 30 minutos para importações grandes

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do AbastecimentoController principal

**Arquivos Afetados**:
- `Controllers/AbastecimentoController.cs`

**Impacto**: Documentação de referência para operações de abastecimento

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
