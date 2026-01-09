# Documentação: ViewItensManutencao.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Estrutura do Model](#estrutura-do-model)

---

## Visão Geral

O Model `ViewItensManutencao` representa uma VIEW do banco de dados que consolida informações de itens de manutenção (ocorrências convertidas em itens de manutenção) com dados relacionados de manutenções, motoristas e viagens.

---

## Estrutura do Model

```csharp
public class ViewItensManutencao
{
    public Guid ItemManutencaoId { get; set; }
    public Guid ManutencaoId { get; set; }
    public string? TipoItem { get; set; }
    public string? NumFicha { get; set; }
    public string? DataItem { get; set; }        // Formatada
    public string? Resumo { get; set; }
    public string? Descricao { get; set; }
    public string? Status { get; set; }
    public string? ImagemOcorrencia { get; set; }
    public string? NomeMotorista { get; set; }
    public Guid? MotoristaId { get; set; }
    public Guid? ViagemId { get; set; }
}
```

**Propriedades Principais:**

- **Item**: ItemManutencaoId, TipoItem, NumFicha, Status
- **Manutenção**: ManutencaoId
- **Ocorrência**: Resumo, Descricao, ImagemOcorrencia
- **Viagem**: ViagemId, NumFicha
- **Motorista**: MotoristaId, NomeMotorista

---

## Notas Importantes

1. **Conversão de Ocorrências**: Itens podem vir de ocorrências de viagem
2. **TipoItem**: Indica tipo do item de manutenção

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
