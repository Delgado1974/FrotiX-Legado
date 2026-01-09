# Documentação: ExcelViewModel.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Estrutura de Arquivos](#estrutura-de-arquivos)
4. [Estrutura do Model](#estrutura-do-model)
5. [Interconexões](#interconexões)
6. [Exemplos de Uso](#exemplos-de-uso)

---

## Visão Geral

O Model `ExcelViewModel` é um DTO simples usado para transferir dados de planilhas Excel entre camadas da aplicação. Representa uma aba (sheet) de uma planilha com seus dados.

**Principais características:**

✅ **DTO Simples**: Apenas nome da aba e dados  
✅ **Transferência de Dados**: Para importação/exportação Excel  
✅ **Estrutura Mínima**: Apenas campos essenciais

### Objetivo

O `ExcelViewModel` resolve o problema de:
- Transferir dados de planilhas Excel
- Representar abas de planilhas
- Facilitar importação/exportação

---

## Estrutura do Model

```csharp
public class ExcelViewModel
{
    public string SheetName { get; set; }
    public string Data { get; set; }
}
```

**Propriedades:**

- `SheetName` (string): Nome da aba da planilha
- `Data` (string): Dados da planilha (geralmente JSON ou CSV)

---

## Interconexões

### Quem Chama Este Arquivo

Controllers de importação/exportação Excel usam este DTO para transferir dados.

---

## Notas Importantes

1. **Simplicidade**: DTO muito simples, apenas para transferência
2. **Data como String**: Dados podem estar em formato JSON ou CSV

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
