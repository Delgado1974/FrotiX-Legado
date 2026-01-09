# Documentação: ViewMotoristasViagem.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Estrutura do Model](#estrutura-do-model)

---

## Visão Geral

O Model `ViewMotoristasViagem` representa uma VIEW do banco de dados que lista motoristas com informações relevantes para seleção em viagens, incluindo status, tipo de condutor e foto.

---

## Estrutura do Model

```csharp
public class ViewMotoristasViagem
{
    public Guid MotoristaId { get; set; }
    public string? Nome { get; set; }
    public bool Status { get; set; }
    public string? MotoristaCondutor { get; set; }
    public string? TipoCondutor { get; set; }
    public byte[]? Foto { get; set; }
}
```

**Propriedades Principais:**

- **Motorista**: MotoristaId, Nome, Status
- **Tipo**: MotoristaCondutor, TipoCondutor
- **Foto**: Foto (byte[])

---

## Notas Importantes

1. **Foco em Viagens**: VIEW específica para seleção em viagens
2. **Foto Incluída**: Campo Foto para exibição em seleções

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
