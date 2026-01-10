# Documentação: ContratoRepository.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `ContratoRepository` é um repository específico para a entidade `Contrato`, com método otimizado para dropdowns que suporta filtro por tipo de contrato.

**Principais características:**

✅ **Herança**: Herda de `Repository<Contrato>`  
✅ **Interface Específica**: Implementa `IContratoRepository`  
✅ **Dropdown Otimizado**: Retorna `IQueryable` para composição  
✅ **Filtro por Tipo**: Suporta filtro opcional por `TipoContrato`  
✅ **Formatação Inteligente**: Texto formatado diferente com/sem tipo

---

## Estrutura da Classe

### Herança e Implementação

```csharp
public class ContratoRepository : Repository<Contrato>, IContratoRepository
```

---

## Método Específico

### `GetDropDown(string? tipoContrato = null)`

**Descrição**: **MÉTODO OTIMIZADO** - Retorna query para dropdown de contratos

**Retorno**: `IQueryable<SelectListItem>` - Permite composição adicional

**Parâmetros**:
- `tipoContrato`: Filtro opcional por tipo de contrato

**Características**:
- **Filtro de Status**: Apenas contratos com `Status == true`
- **Filtro por Tipo**: Se `tipoContrato` fornecido, filtra por tipo
- **Ordenação**: Por `AnoContrato` desc, `NumeroContrato` desc, `Fornecedor.DescricaoFornecedor` desc
- **Formatação**: 
  - Com tipo: `"{Ano}/{Numero} - {Fornecedor}"`
  - Sem tipo: `"{Ano}/{Numero} - {Fornecedor} ({TipoContrato})"`
- **AsNoTracking**: Usa `AsNoTracking()` para performance
- **Navegação**: Acessa `Fornecedor.DescricaoFornecedor` diretamente (EF Core faz JOIN automaticamente)

**Uso**:
```csharp
// Sem filtro
var contratos = unitOfWork.Contrato.GetDropDown();

// Com filtro por tipo
var contratosServicos = unitOfWork.Contrato.GetDropDown("Servicos");

// Composição adicional
var top10 = unitOfWork.Contrato.GetDropDown()
    .Take(10)
    .ToList();
```

**Vantagem**: Retorna `IQueryable` permitindo composição antes de materializar

---

## Interconexões

### Quem Usa Este Repository

- **ContratoController**: Para listagem de contratos
- **NotaFiscalController**: Para seleção de contratos em notas fiscais
- **Views Razor**: Para dropdowns de contratos

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do ContratoRepository

**Arquivos Afetados**:
- `Repository/ContratoRepository.cs`

**Impacto**: Documentação de referência para repository de contratos

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
