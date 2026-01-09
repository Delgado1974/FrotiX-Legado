# Documentação: Operador.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O Model `Operador` representa operadores de serviços (ex: operadores de rádio, operadores de sistema). Similar a `Motorista`, mas vinculado diretamente a um contrato.

**Principais características:**

✅ **Cadastro de Operadores**: Operadores de serviços  
✅ **Vinculação com Contrato**: Sempre vinculado a um contrato  
✅ **Informações Pessoais**: Nome, CPF, data de nascimento, contatos  
✅ **Foto**: Campo para foto do operador

## Estrutura do Model

```csharp
public class Operador
{
    [Key]
    public Guid OperadorId { get; set; }

    [Required]
    [StringLength(100)]
    [Display(Name = "Nome do Operador")]
    public string? Nome { get; set; }

    [Required]
    [StringLength(20)]
    [Display(Name = "Ponto")]
    public string? Ponto { get; set; }

    [Required]
    [Display(Name = "Data de Nascimento")]
    public DateTime? DataNascimento { get; set; }

    [Required]
    [StringLength(20)]
    [Display(Name = "CPF")]
    public string? CPF { get; set; }

    [Required]
    [StringLength(50)]
    [Display(Name = "Primeiro Celular")]
    public string? Celular01 { get; set; }

    [StringLength(50)]
    [Display(Name = "Segundo Celular")]
    public string? Celular02 { get; set; }

    [Display(Name = "Data de Ingresso")]
    public DateTime? DataIngresso { get; set; }

    public byte[]? Foto { get; set; }

    [Display(Name = "Ativo/Inativo")]
    public bool Status { get; set; }

    public DateTime? DataAlteracao { get; set; }
    public string? UsuarioIdAlteracao { get; set; }

    [Required]
    [Display(Name = "Contrato")]
    public Guid ContratoId { get; set; }

    [ForeignKey("ContratoId")]
    public virtual Contrato? Contrato { get; set; }

    [NotMapped]
    public IFormFile? ArquivoFoto { get; set; }
}
```

## Interconexões

Controllers de operador e contratos usam este modelo.

## Notas Importantes

1. **Contrato Obrigatório**: Sempre vinculado a um contrato (diferente de Motorista)
2. **Similar a Motorista**: Estrutura similar mas sem CNH e outros campos específicos

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
