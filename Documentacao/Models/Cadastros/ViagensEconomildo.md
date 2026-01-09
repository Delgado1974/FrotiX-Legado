# Documentação: ViagensEconomildo.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O Model `ViagensEconomildo` representa viagens do sistema Economildo (sistema de transporte público). Diferente de `Viagem` padrão, é específico para integração com sistema Economildo.

## Estrutura do Model

```csharp
public class ViagensEconomildo
{
    [Key]
    public Guid ViagemEconomildoId { get; set; }

    public DateTime? Data { get; set; }
    public string? MOB { get; set; }              // Identificador MOB
    public string? Responsavel { get; set; }
    public Guid VeiculoId { get; set; }
    public Guid MotoristaId { get; set; }
    public string? IdaVolta { get; set; }
    public string? HoraInicio { get; set; }
    public string? HoraFim { get; set; }
    public int? QtdPassageiros { get; set; }
    public string? Trajeto { get; set; }
    public int? Duracao { get; set; }
}
```

## Notas Importantes

1. **Sistema Economildo**: Integração com sistema de transporte público
2. **MOB**: Identificador do sistema Economildo
3. **Passageiros**: Campo QtdPassageiros específico

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
