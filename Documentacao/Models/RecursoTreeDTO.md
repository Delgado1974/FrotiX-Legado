# Documentação: RecursoTreeDTO.cs

**📅 Última Atualização:** 08/01/2026  
**📋 Versão:** 2.0 (Padrão FrotiX Simplificado)

---

## 🎯 Objetivos

O DTO `RecursoTreeDTO` representa um recurso na estrutura hierárquica de TreeView Syncfusion EJ2, permitindo conversão bidirecional entre entidade `Recurso` do banco de dados e formato esperado pelo componente TreeView.

**Principais objetivos:**

✅ Converter `Recurso` (banco) para formato TreeView Syncfusion  
✅ Converter TreeView Syncfusion para `Recurso` (banco)  
✅ Suportar estrutura hierárquica recursiva com `Items`  
✅ Manter compatibilidade com componente `ejs-treeview`

---

## 📁 Arquivos Envolvidos

- **`Models/RecursoTreeDTO.cs`** - DTO principal
- **`Controllers/NavigationController.cs`** - Usa DTOs para operações de navegação
- **`ViewComponents/NavigationViewComponent.cs`** - Converte Recursos para DTOs
- **`Models/Cadastros/Recurso.cs`** - Entidade do banco

---

## 🏗️ Estrutura do Model

```csharp
public class RecursoTreeDTO
{
    public string? Id { get; set; }                    // ✅ Guid convertido para string
    public string? Text { get; set; }                  // ✅ Nome do recurso
    public string? NomeMenu { get; set; }              // ✅ Identificador único
    public string? Icon { get; set; }                  // ✅ Classe FontAwesome
    public string? IconCss { get; set; }               // ✅ CSS do ícone
    public string? Href { get; set; }                  // ✅ URL da página
    public string? ParentId { get; set; }              // ✅ ID do pai (string)
    public bool HasChild { get; set; }                 // ✅ Tem filhos?
    public bool Expanded { get; set; } = true;         // ✅ Expandido por padrão
    public double Ordem { get; set; }                   // ✅ Ordem de exibição
    public int Nivel { get; set; }                     // ✅ Nível na hierarquia
    public string? Descricao { get; set; }            // ✅ Descrição
    public bool Ativo { get; set; } = true;           // ✅ Ativo no menu
    public List<RecursoTreeDTO>? Items { get; set; }   // ✅ Filhos (recursivo)
    
    // ✅ Método estático de conversão
    public static RecursoTreeDTO FromRecurso(Recurso recurso)
    {
        return new RecursoTreeDTO
        {
            Id = recurso.RecursoId.ToString(),
            Text = recurso.Nome,
            NomeMenu = recurso.NomeMenu,
            Icon = recurso.Icon,
            IconCss = recurso.Icon,
            Href = recurso.Href,
            ParentId = recurso.ParentId?.ToString(),
            Ordem = recurso.Ordem,
            Nivel = recurso.Nivel,
            Descricao = recurso.Descricao,
            Ativo = recurso.Ativo,
            HasChild = recurso.HasChild,
            Expanded = true
        };
    }
    
    // ✅ Método de conversão reversa
    public Recurso ToRecurso()
    {
        return new Recurso
        {
            RecursoId = Guid.TryParse(Id, out var id) ? id : Guid.NewGuid(),
            Nome = Text,
            NomeMenu = NomeMenu,
            Icon = Icon,
            Href = Href,
            ParentId = Guid.TryParse(ParentId, out var parentId) ? parentId : null,
            Ordem = Ordem,
            Nivel = Nivel,
            Descricao = Descricao,
            Ativo = Ativo,
            HasChild = HasChild
        };
    }
}
```

---

## 🔗 Quem Chama e Por Quê

### NavigationController.cs → Montar Árvore Recursiva

```csharp
private List<RecursoTreeDTO> MontarArvoreRecursiva(List<Recurso> recursos, Guid? parentId)
{
    return recursos
        .Where(r => 
            (parentId == null && r.ParentId == null) || 
            (parentId != null && r.ParentId == parentId)
        )
        .OrderBy(r => r.Ordem)
        .Select(r =>
        {
            var dto = RecursoTreeDTO.FromRecurso(r); // ✅ Converte para DTO
            dto.Items = MontarArvoreRecursiva(recursos, r.RecursoId); // ✅ Recursivo
            dto.HasChild = dto.Items != null && dto.Items.Any();
            return dto;
        })
        .ToList();
}
```

---

## 🛠️ Problema → Solução → Código

### Problema: TreeView Precisa de IDs como String

**Problema:** Syncfusion TreeView espera `Id` e `ParentId` como `string`, mas `Recurso` usa `Guid`.

**Solução:** Métodos `FromRecurso()` e `ToRecurso()` fazem conversão automática.

**Código:**

```csharp
// ✅ Conversão Guid → string
public static RecursoTreeDTO FromRecurso(Recurso recurso)
{
    return new RecursoTreeDTO
    {
        Id = recurso.RecursoId.ToString(), // ✅ Guid → string
        ParentId = recurso.ParentId?.ToString() // ✅ Guid? → string?
    };
}

// ✅ Conversão string → Guid
public Recurso ToRecurso()
{
    return new Recurso
    {
        RecursoId = Guid.TryParse(Id, out var id) ? id : Guid.NewGuid(), // ✅ string → Guid
        ParentId = Guid.TryParse(ParentId, out var parentId) ? parentId : null // ✅ string? → Guid?
    };
}
```

---

## 📝 Notas Importantes

1. **Conversão bidirecional** - Métodos `FromRecurso()` e `ToRecurso()` permitem ida e volta.

2. **Estrutura recursiva** - `Items` permite hierarquia ilimitada.

3. **Compatibilidade Syncfusion** - Formato segue exatamente o esperado pelo `ejs-treeview`.

---

**📅 Documentação criada em:** 08/01/2026
