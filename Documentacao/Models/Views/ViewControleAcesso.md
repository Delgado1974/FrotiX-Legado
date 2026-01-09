# Documentação: ViewControleAcesso.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

VIEW que consolida informações de controle de acesso com dados de usuários e recursos. Usada para exibir permissões de forma consolidada em interfaces de gestão.

## Estrutura do Model

```csharp
public class ViewControleAcesso
{
    public string? UsuarioId { get; set; }
    public Guid RecursoId { get; set; }
    public bool Acesso { get; set; }
    public string? Nome { get; set; }            // Nome do recurso
    public string? Descricao { get; set; }       // Descrição do recurso
    public double? Ordem { get; set; }           // Ordem do recurso
    public string? NomeCompleto { get; set; }    // Nome completo do usuário
    public string? IDS { get; set; }             // IDs concatenados (formato especial)
}
```

## Interconexões

Controllers de gestão de recursos e permissões usam esta view para exibir permissões de forma consolidada.

## Notas Importantes

1. **Dados Consolidados**: Inclui informações de usuário e recurso
2. **IDS**: Campo especial para IDs concatenados (formato específico)

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
