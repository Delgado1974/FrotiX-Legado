# Documentação: ItensContrato.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O arquivo `ItensContrato.cs` contém ViewModels para gestão de itens de contrato (veículos, motoristas, operadores, etc.). O modelo `ItensContrato` em si é apenas um wrapper com ContratoId.

**Nota**: Este arquivo contém principalmente ViewModels, não uma entidade principal. Ver `ItensContratoViewModel` e outras classes relacionadas no arquivo.

## Estrutura do Model

```csharp
public class ItensContrato
{
    [NotMapped]
    public Guid ContratoId { get; set; }
}

public class ItensContratoViewModel
{
    public Guid ContratoId { get; set; }
    public ItensContrato ItensContrato { get; set; }
    public IEnumerable<SelectListItem> ContratoList { get; set; }
}
```

## Notas Importantes

1. **Wrapper**: Model principal é apenas wrapper
2. **ViewModels**: Arquivo contém múltiplos ViewModels para diferentes operações

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
