# Documentação: DeleteMovimentacaoWrapper.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O Model `DeleteMovimentacaoWrapper` é uma classe wrapper usada para deleção de movimentações de empenho e empenho de multas. ViewModel auxiliar para operações de delete.

## Estrutura do Model

```csharp
public class DeleteMovimentacaoWrapperViewModel
{
    public MovimentacaoEmpenhoViewModel mEmpenho { get; set; }
    public MovimentacaoEmpenhoMultaViewModel mEmpenhoMulta { get; set; }
}
```

## Notas Importantes

1. **Wrapper**: Classe auxiliar para operações de delete
2. **Duas Movimentações**: Agrupa movimentações de empenho e empenho de multas

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
