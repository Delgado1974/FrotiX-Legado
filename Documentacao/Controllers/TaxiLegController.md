# Documentação: TaxiLegController.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `TaxiLegController` gerencia operações relacionadas a táxi legal, incluindo importação de planilhas Excel com corridas e cancelamentos.

**Principais características:**

✅ **Importação Excel**: Importa planilhas Excel com corridas de táxi legal  
✅ **NPOI**: Usa NPOI para leitura de arquivos Excel  
✅ **Cancelamentos**: Gestão de corridas canceladas

---

## Endpoints API Principais

### POST `/api/TaxiLeg/Import`

**Descrição**: Importa planilha Excel com corridas de táxi legal

**Request**: `multipart/form-data` com arquivo Excel

**Lógica**: Similar ao `AbastecimentoController.Import`, processa planilha e salva corridas

---

## Interconexões

### Quem Chama Este Controller

- **Pages**: Páginas de importação de táxi legal

### O Que Este Controller Chama

- **`_unitOfWork.CorridasTaxiLeg`**: CRUD de corridas
- **`_corridasTaxiLegRepository`**: Repository específico
- **`NPOI`**: Leitura de Excel

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do TaxiLegController

**Arquivos Afetados**:
- `Controllers/TaxiLegController.cs`

**Impacto**: Documentação de referência para operações de táxi legal

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
