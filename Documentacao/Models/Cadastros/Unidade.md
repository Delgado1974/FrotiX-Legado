# Documentação: Unidade.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Estrutura do Model](#estrutura-do-model)
3. [Mapeamento Model ↔ Banco de Dados](#mapeamento-model--banco-de-dados)
4. [Interconexões](#interconexões)

---

## Visão Geral

O Model `Unidade` representa unidades organizacionais da instituição (ex: departamentos, setores). Possui múltiplos contatos (até 3) e informações de categoria e quantidade de motoristas.

**Principais características:**

✅ **Cadastro de Unidades**: Unidades organizacionais  
✅ **Múltiplos Contatos**: Até 3 contatos por unidade  
✅ **Categoria**: Classificação da unidade  
✅ **Quantidade de Motoristas**: Campo para controle

---

## Estrutura do Model

```csharp
public class Unidade
{
    [Key]
    public Guid UnidadeId { get; set; }

    [StringLength(50, ErrorMessage = "A sigla não pode exceder 50 caracteres")]
    [Required(ErrorMessage = "(A sigla da Unidade é obrigatória)")]
    [Display(Name = "Sigla da Unidade")]
    public string? Sigla { get; set; }

    [StringLength(100, ErrorMessage = "A descrição não pode exceder 100 caracteres")]
    [Required(ErrorMessage = "(A descrição da Unidade é obrigatória)")]
    [Display(Name = "Nome da Unidade")]
    public string? Descricao { get; set; }

    // Primeiro contato
    [StringLength(50, ErrorMessage = "O ponto não pode exceder 50 caracteres")]
    [Required(ErrorMessage = "(O ponto do contato é obrigatório)")]
    [Display(Name = "Ponto (1º)")]
    public string? PontoPrimeiroContato { get; set; }

    [StringLength(100, ErrorMessage = "O nome não pode exceder 100 caracteres")]
    [Required(ErrorMessage = "(O contato é obrigatório)")]
    [Display(Name = "Contato (1º)")]
    public string? PrimeiroContato { get; set; }

    [ValidaZero(ErrorMessage = "(O ramal é obrigatório)")]
    [Required(ErrorMessage = "(O ramal é obrigatório)")]
    [Display(Name = "Ramal/Celular (1º)")]
    public long? PrimeiroRamal { get; set; }

    // Segundo contato (opcional)
    [StringLength(50)]
    [Display(Name = "Ponto (2º)")]
    public string? PontoSegundoContato { get; set; }

    [StringLength(100)]
    [Display(Name = "Contato (2º)")]
    public string? SegundoContato { get; set; }

    [Display(Name = "Ramal/Celular (2º)")]
    public long? SegundoRamal { get; set; }

    // Terceiro contato (opcional)
    [StringLength(50)]
    [Display(Name = "Ponto (3º)")]
    public string? PontoTerceiroContato { get; set; }

    [StringLength(100)]
    [Display(Name = "Contato (3º)")]
    public string? TerceiroContato { get; set; }

    [Display(Name = "Ramal/Celular (3º)")]
    public long? TerceiroRamal { get; set; }

    [Display(Name = "Ativo/Inativo")]
    public bool Status { get; set; }

    [Display(Name = "Categoria")]
    public string? Categoria { get; set; }

    [Display(Name = "Qtd Motoristas")]
    public int? QtdMotoristas { get; set; }
}
```

**Propriedades Principais:**

- **Identificação**: UnidadeId, Sigla, Descricao
- **Contatos**: 3 contatos (primeiro obrigatório, outros opcionais)
  - Ponto, Nome, Ramal/Celular para cada
- **Classificação**: Categoria, QtdMotoristas
- **Status**: Status (Ativo/Inativo)

---

## Mapeamento Model ↔ Banco de Dados

### Tabela: `Unidade`

**Tipo**: Tabela

**Chaves e Índices**:
- **PK**: `UnidadeId` (CLUSTERED)
- **IX**: `IX_Unidade_Sigla` (Sigla) - Para busca

**Tabelas Relacionadas**:
- `Motorista` - Motoristas podem estar vinculados a unidades
- `Veiculo` - Veículos podem estar vinculados a unidades
- `Requisitante` - Requisitantes pertencem a setores que podem estar em unidades

---

## Interconexões

### Quem Chama Este Arquivo

Controllers de motorista, veículo e outras entidades usam este modelo para vincular a unidades.

---

## Notas Importantes

1. **Múltiplos Contatos**: Suporta até 3 contatos (primeiro obrigatório)
2. **Sigla**: Campo importante para identificação rápida
3. **QtdMotoristas**: Campo informativo (pode ser calculado)

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
