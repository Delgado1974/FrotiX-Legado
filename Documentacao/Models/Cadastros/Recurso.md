# Documentação: Recurso.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O Model `Recurso` representa recursos do sistema (páginas, funcionalidades) que aparecem no menu de navegação. Suporta hierarquia (recursos pais e filhos) e integração com sistema de controle de acesso.

**Principais características:**

✅ **Navegação Hierárquica**: Suporta recursos pais e filhos  
✅ **Ícones FontAwesome**: Campo Icon para ícones do menu  
✅ **Controle de Acesso**: Integrado com `ControleAcesso`  
✅ **URLs**: Campo Href para rotas das páginas

## Estrutura do Model

```csharp
public class Recurso
{
    [Key]
    public Guid RecursoId { get; set; }

    [Required(ErrorMessage = "O nome do Recurso é obrigatório")]
    [Display(Name = "Nome do Recurso")]
    public string Nome { get; set; } = string.Empty;

    [Required(ErrorMessage = "O nome de Menu do Recurso é obrigatório")]
    [Display(Name = "Nome de Menu do Recurso")]
    public string NomeMenu { get; set; } = string.Empty;

    [Display(Name = "Descrição do Recurso")]
    public string? Descricao { get; set; }

    [Required(ErrorMessage = "A Ordem é obrigatória")]
    [Display(Name = "Ordem do Recurso")]
    public double Ordem { get; set; }

    // Navegação hierárquica
    [Display(Name = "Recurso Pai")]
    public Guid? ParentId { get; set; }

    [Required(ErrorMessage = "O ícone é obrigatório")]
    [Display(Name = "Ícone FontAwesome")]
    public string Icon { get; set; } = "fa-duotone fa-folder";

    [Required(ErrorMessage = "A URL é obrigatória")]
    [Display(Name = "URL da Página")]
    public string Href { get; set; } = "javascript:void(0);";

    [Display(Name = "Ativo no Menu")]
    public bool Ativo { get; set; } = true;

    [Display(Name = "Nível na Hierarquia")]
    public int Nivel { get; set; } = 0;

    [Display(Name = "Tem Filhos")]
    public bool HasChild { get; set; } = false;

    // Navegação EF Core
    public virtual Recurso? Parent { get; set; }
    public virtual ICollection<Recurso> Children { get; set; } = new List<Recurso>();
}
```

## Interconexões

- `NavigationModel`: Usa recursos para construir menu
- `ControleAcesso`: Controla acesso a recursos
- `NavigationController`: Gerencia recursos

## Notas Importantes

1. **Hierarquia**: ParentId permite estrutura de menu hierárquica
2. **Ícones**: Campo Icon usa classes FontAwesome
3. **Ativo**: Campo Ativo controla se aparece no menu
4. **HasChild**: Flag para indicar se tem filhos (otimização)

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
