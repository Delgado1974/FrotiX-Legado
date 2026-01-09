# Documentação: ViewMediaConsumo.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Estrutura do Model](#estrutura-do-model)

---

## Visão Geral

O Model `ViewMediaConsumo` representa uma VIEW do banco de dados que calcula a média de consumo (km/litro) de cada veículo baseado no histórico de abastecimentos.

**Principais características:**

✅ **View do Banco**: Representa uma VIEW SQL  
✅ **Cálculo de Média**: Consumo médio calculado  
✅ **Por Veículo**: Uma linha por veículo

---

## Estrutura do Model

```csharp
public class ViewMediaConsumo
{
    public Guid VeiculoId { get; set; }
    public decimal? ConsumoGeral { get; set; }
}
```

**Propriedades:**

- `VeiculoId` (Guid): ID do veículo
- `ConsumoGeral` (decimal?): Média de consumo em km/litro

**Cálculo na View**:
```sql
AVG(KmRodado / NULLIF(Litros, 0)) AS ConsumoGeral
```

---

## Interconexões

### Quem Chama Este Arquivo

Controllers e páginas que precisam exibir consumo médio de veículos consultam esta view.

---

## Notas Importantes

1. **Média Calculada**: Baseada em todos os abastecimentos do veículo
2. **NULLIF**: Evita divisão por zero
3. **Performance**: View otimizada para consultas rápidas de consumo

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
