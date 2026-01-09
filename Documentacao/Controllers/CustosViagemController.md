# Documentação: CustosViagemController.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `CustosViagemController` gerencia visualização e cálculo de custos de viagens, incluindo filtros por veículo, motorista, status, finalidade, setor e data.

**Principais características:**

✅ **Visualização**: Lista custos de viagens com dados reduzidos  
✅ **Cálculo em Lote**: Recalcula custos de todas as viagens realizadas  
✅ **Filtros**: Por veículo, motorista, status, finalidade, setor, data  
✅ **Fichas**: Recuperação de fichas de vistoria

---

## Endpoints API Principais

### GET `/api/CustosViagem`

**Descrição**: Lista custos de viagens com dados reduzidos

**Parâmetros**: `Id` (string opcional)

**Response**: Lista de custos com campos essenciais

---

### POST `/api/CustosViagem/CalculaCustoViagens`

**Descrição**: **ENDPOINT CRÍTICO** - Recalcula custos de todas as viagens realizadas

**Lógica**:
- Busca todas viagens com `StatusAgendamento == false` e `Status == "Realizada"`
- Calcula custos: Motorista, Veículo, Combustível
- Atualiza campos: `CustoMotorista`, `CustoVeiculo`, `CustoCombustivel`

**Uso**: Para recalcular custos após mudanças em contratos/preços

---

### GET `/api/CustosViagem/ViagemVeiculos`

**Descrição**: Lista custos filtrados por veículo

**Parâmetros**: `Id` (Guid) - ID do veículo

---

### GET `/api/CustosViagem/ViagemMotoristas`

**Descrição**: Lista custos filtrados por motorista

---

### GET `/api/CustosViagem/PegaFicha`

**Descrição**: Obtém ficha de vistoria de uma viagem

---

## Interconexões

### Quem Chama Este Controller

- **Pages**: `Pages/CustosViagem/*.cshtml`
- **Pages**: Páginas de análise de custos

### O Que Este Controller Chama

- **`_unitOfWork.ViewCustosViagem`**: View otimizada
- **`_unitOfWork.Viagem`**: CRUD e cálculos
- **`Servicos`**: Métodos de cálculo de custos

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do CustosViagemController

**Arquivos Afetados**:
- `Controllers/CustosViagemController.cs`

**Impacto**: Documentação de referência para gestão de custos

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
