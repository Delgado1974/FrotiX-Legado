# Documentação: ViewPendenciasManutencao.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

VIEW que consolida itens de manutenção pendentes com dados de motoristas, veículos e viagens. Usada para identificar pendências que precisam de atenção.

## Estrutura do Model

```csharp
public class ViewPendenciasManutencao
{
    public Guid ItemManutencaoId { get; set; }
    public Guid ManutencaoId { get; set; }
    public Guid MotoristaId { get; set; }
    public Guid ViagemId { get; set; }
    public Guid VeiculoId { get; set; }
    public string? TipoItem { get; set; }
    public string? NumFicha { get; set; }
    public string? DataItem { get; set; }
    public string? Resumo { get; set; }
    public string? Descricao { get; set; }
    public string? Status { get; set; }
    public string? Nome { get; set; }  // Nome do motorista
    public string? ImagemOcorrencia { get; set; }
}
```

## Interconexões

Controllers de manutenção usam para listar pendências que requerem ação.

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
