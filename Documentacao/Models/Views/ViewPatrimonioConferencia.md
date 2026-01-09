# Documentação: ViewPatrimonioConferencia.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

VIEW que consolida informações de patrimônios para conferência, incluindo localização atual e localização de conferência, setores e seções.

## Estrutura do Model

```csharp
public class ViewPatrimonioConferencia
{
    public Guid PatrimonioId { get; set; }
    public string? NPR { get; set; }
    public string? Marca { get; set; }
    public string? Modelo { get; set; }
    public string? Descricao { get; set; }
    public string? LocalizacaoAtual { get; set; }
    public string? NomeSetor { get; set; }
    public string? NomeSecao { get; set; }
    public bool Status { get; set; }
    public string Situacao { get; set; }
    public int? StatusConferencia { get; set; }
    public string? LocalizacaoConferencia { get; set; }
    public Guid? SetorConferenciaId { get; set; }
    public Guid? SecaoConferenciaId { get; set; }
}
```

## Notas Importantes

1. **Conferência**: Campos de conferência (LocalizacaoConferencia, SetorConferenciaId, etc.)
2. **StatusConferencia**: Indica status da conferência (0=não conferido, 1=conferido, etc.)

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
