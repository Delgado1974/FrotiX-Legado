# Documentação: OcorrenciaViagemController.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `OcorrenciaViagemController` gerencia operações CRUD de ocorrências de viagens, incluindo criação, listagem, baixa, reabertura e exclusão.

**Principais características:**

✅ **CRUD Completo**: Criação, listagem, atualização, exclusão  
✅ **Múltiplas Ocorrências**: Criação em lote  
✅ **Status**: Sistema de baixa/reabertura  
✅ **Upload de Imagens**: Upload de imagens de ocorrências  
✅ **Filtros**: Por viagem, veículo, status

**Nota**: Controller implementado como partial class dividido em múltiplos arquivos:
- `OcorrenciaViagemController.cs` - Métodos principais
- `OcorrenciaViagemController.Listar.cs` - Listagens
- `OcorrenciaViagemController.Gestao.cs` - Gestão avançada
- `OcorrenciaViagemController.Upsert.cs` - Criação/edição
- `OcorrenciaViagemController.Debug.cs` - Métodos de debug

---

## Endpoints API Principais

### GET `/api/OcorrenciaViagem/ListarPorViagem`

**Descrição**: Lista ocorrências de uma viagem específica

**Parâmetros**: `viagemId` (Guid)

**Response**: Lista ordenada por data de criação (descendente)

---

### GET `/api/OcorrenciaViagem/ListarAbertasPorVeiculo`

**Descrição**: Lista ocorrências abertas de um veículo (para popup)

**Parâmetros**: `veiculoId` (Guid)

---

### GET `/api/OcorrenciaViagem/ContarAbertasPorVeiculo`

**Descrição**: Conta ocorrências abertas de um veículo

**Parâmetros**: `veiculoId` (Guid)

---

### POST `/api/OcorrenciaViagem/Criar`

**Descrição**: Cria nova ocorrência

**Request Body**: `OcorrenciaViagemDTO`

**Campos**: ViagemId, VeiculoId, MotoristaId, Resumo, Descricao, ImagemOcorrencia

---

### POST `/api/OcorrenciaViagem/CriarMultiplas`

**Descrição**: Cria múltiplas ocorrências de uma vez

**Request Body**: Lista de `OcorrenciaViagemDTO`

**Uso**: Ao finalizar viagem com múltiplas ocorrências

---

### POST `/api/OcorrenciaViagem/DarBaixa`

**Descrição**: Dá baixa em ocorrência (marca como resolvida)

**Parâmetros**: `ocorrenciaId` (Guid)

---

### POST `/api/OcorrenciaViagem/Reabrir`

**Descrição**: Reabre ocorrência baixada

**Parâmetros**: `ocorrenciaId` (Guid)

---

### POST `/api/OcorrenciaViagem/Excluir`

**Descrição**: Exclui ocorrência

**Parâmetros**: `ocorrenciaId` (Guid)

---

## Interconexões

### Quem Chama Este Controller

- **Pages**: `Pages/Viagem/*.cshtml` - Gestão de ocorrências
- **Pages**: `Pages/Ocorrencia/*.cshtml` - Páginas específicas

### O Que Este Controller Chama

- **`_unitOfWork.OcorrenciaViagem`**: CRUD
- **`_unitOfWork.ViewOcorrenciasViagem`**: View otimizada
- **`_unitOfWork.ViewOcorrenciasAbertasVeiculo`**: View de ocorrências abertas

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do OcorrenciaViagemController

**Arquivos Afetados**:
- `Controllers/OcorrenciaViagemController.cs`
- `Controllers/OcorrenciaViagemController.*.cs` (múltiplos arquivos parciais)

**Impacto**: Documentação de referência para operações de ocorrências

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
