# Documentação: Requisitante.cs

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

O Model `Requisitante` representa usuários que solicitam viagens no sistema. Vinculado a um setor solicitante e possui informações de contato (ponto, ramal, email).

**Principais características:**

✅ **Solicitante de Viagens**: Usuário que solicita viagens  
✅ **Vinculação com Setor**: Pertence a um SetorSolicitante  
✅ **Contato**: Ponto, ramal e email  
✅ **Status**: Ativo/Inativo

---

## Estrutura do Model

```csharp
public class Requisitante
{
    [Key]
    public Guid RequisitanteId { get; set; }

    [Required(ErrorMessage = "(O nome do requisitante é obrigatório)")]
    [Display(Name = "Requisitante")]
    public string? Nome { get; set; }

    [Required(ErrorMessage = "(O ponto é obrigatório)")]
    [Display(Name = "Ponto")]
    public string? Ponto { get; set; }

    [ValidaZero(ErrorMessage = "(O ramal é obrigatório)")]
    [Required(ErrorMessage = "(O ramal é obrigatório)")]
    [Display(Name = "Ramal")]
    public int? Ramal { get; set; }

    [Display(Name = "Email")]
    public string? Email { get; set; }

    [Display(Name = "Ativo/Inativo")]
    public bool Status { get; set; }

    public DateTime? DataAlteracao { get; set; }
    public string? UsuarioIdAlteracao { get; set; }

    [Display(Name = "Setor Solicitante")]
    public Guid SetorSolicitanteId { get; set; }

    [ForeignKey("SetorSolicitanteId")]
    public virtual SetorSolicitante SetorSolicitante { get; set; }
}
```

**Propriedades Principais:**

- `RequisitanteId` (Guid): Chave primária
- `Nome` (string?): Nome do requisitante (obrigatório)
- `Ponto` (string?): Ponto do requisitante (obrigatório)
- `Ramal` (int?): Ramal telefônico (obrigatório)
- `Email` (string?): Email (opcional)
- `Status` (bool): Ativo/Inativo
- `SetorSolicitanteId` (Guid): FK para SetorSolicitante (obrigatório)

---

## Mapeamento Model ↔ Banco de Dados

### Tabela: `Requisitante`

**Tipo**: Tabela

**Chaves e Índices**:
- **PK**: `RequisitanteId` (CLUSTERED)
- **FK**: `SetorSolicitanteId` → `SetorSolicitante(SetorSolicitanteId)`

**Tabelas Relacionadas**:
- `SetorSolicitante` - Setor do requisitante
- `Viagem` - Viagens solicitadas pelo requisitante
- `Evento` - Eventos do requisitante

---

## Interconexões

### Quem Chama Este Arquivo

Controllers de viagem e evento usam este modelo para vincular solicitantes.

---

## Notas Importantes

1. **Setor Obrigatório**: Sempre vinculado a um setor
2. **Ramal**: Campo numérico para ramal telefônico
3. **Status**: Filtrar por Status = true em listagens

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
