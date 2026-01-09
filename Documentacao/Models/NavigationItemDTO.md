# Documentação: NavigationItemDTO.cs

**📅 Última Atualização:** 08/01/2026  
**📋 Versão:** 2.0 (Padrão FrotiX Simplificado)

---

## 📋 Índice

1. [Objetivos](#objetivos)
2. [Arquivos Envolvidos](#arquivos-envolvidos)
3. [Estrutura do Model](#estrutura-do-model)
4. [Quem Chama e Por Quê](#quem-chama-e-por-quê)
5. [Problema → Solução → Código](#problema--solução--código)
6. [Fluxo de Funcionamento](#fluxo-de-funcionamento)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Objetivos

O arquivo `NavigationItemDTO.cs` contém múltiplos DTOs (Data Transfer Objects) usados no sistema de navegação do FrotiX para transferir dados entre API e frontend, especialmente para operações com TreeView Syncfusion EJ2.

**Principais objetivos:**

✅ Transferir dados de itens de navegação entre API e frontend  
✅ Suportar estrutura hierárquica de TreeView Syncfusion  
✅ Padronizar requests para operações de navegação (salvar, deletar, atualizar acesso)  
✅ Facilitar migração e gestão de recursos de navegação

---

## 📁 Arquivos Envolvidos

### Arquivo Principal
- **`Models/NavigationItemDTO.cs`** - Contém todos os DTOs de navegação

### Arquivos que Utilizam
- **`Controllers/NavigationController.cs`** - Endpoints que usam os DTOs
- **`Pages/Administracao/GestaoRecursosNavegacao.cshtml`** - Interface de gestão
- **`ViewComponents/NavigationViewComponent.cs`** - Componente de navegação

---

## 🏗️ Estrutura do Model

### NavigationItemDTO

```csharp
public class NavigationItemDTO
{
    public string Id { get; set; }
    public string Title { get; set; }
    public string NomeMenu { get; set; }
    public string OldNomeMenu { get; set; }
    public string Href { get; set; }
    public string Icon { get; set; }
    public string ParentId { get; set; }
}
```

**Uso:** Transferência simples de dados de item de navegação.

### NavigationTreeItem

```csharp
public class NavigationTreeItem
{
    public string Id { get; set; }
    public string Text { get; set; }
    public string Title { get; set; }
    public string NomeMenu { get; set; }
    public string Href { get; set; }
    public string Icon { get; set; }
    public string IconCss { get; set; }
    public string ParentId { get; set; }
    public bool HasChild { get; set; }
    public bool Expanded { get; set; }
    public List<NavigationTreeItem> Items { get; set; } = new List<NavigationTreeItem>();
}
```

**Uso:** Estrutura hierárquica completa para TreeView Syncfusion EJ2.

### SaveNavigationRequest

```csharp
public class SaveNavigationRequest
{
    public List<NavigationTreeItem> Items { get; set; }
}
```

**Uso:** Request para salvar árvore completa de navegação.

### DeleteNavigationItemRequest

```csharp
public class DeleteNavigationItemRequest
{
    public string NomeMenu { get; set; }
}
```

**Uso:** Request para deletar item por NomeMenu.

### DeleteRecursoRequest

```csharp
public class DeleteRecursoRequest
{
    public string RecursoId { get; set; }
}
```

**Uso:** Request para deletar recurso por ID.

### UpdateAcessoRequest

```csharp
public class UpdateAcessoRequest
{
    public string UsuarioId { get; set; }
    public string RecursoId { get; set; }
    public bool Acesso { get; set; }
}
```

**Uso:** Request para atualizar acesso de usuário a recurso.

---

## 🔗 Quem Chama e Por Quê

### 1. **NavigationController.cs** → Salvar Árvore Completa

**Quando:** Usuário reorganiza navegação no TreeView e salva  
**Por quê:** Persistir estrutura hierárquica completa no banco

```csharp
[HttpPost("SaveNavigation")]
public IActionResult SaveNavigation([FromBody] SaveNavigationRequest request)
{
    // ✅ Processa árvore recursivamente
    AtualizarRecursosRecursivamente(request.Items, null, 0, 0);
    _unitOfWork.Save();
    return Json(new { success = true });
}
```

### 2. **NavigationController.cs** → Deletar Item

**Quando:** Usuário deleta item de navegação  
**Por quê:** Remover item e seus filhos da navegação

```csharp
[HttpPost("DeleteNavigationItem")]
public IActionResult DeleteNavigationItem([FromBody] DeleteNavigationItemRequest request)
{
    var recurso = _unitOfWork.Recurso
        .GetFirstOrDefault(r => r.NomeMenu == request.NomeMenu);
    
    if (recurso != null)
    {
        _unitOfWork.Recurso.Remove(recurso);
        _unitOfWork.Save();
    }
    
    return Json(new { success = true });
}
```

### 3. **NavigationController.cs** → Atualizar Acesso

**Quando:** Administrador altera permissão de usuário  
**Por quê:** Atualizar controle de acesso

```csharp
[HttpPost("UpdateAcesso")]
public IActionResult UpdateAcesso([FromBody] UpdateAcessoRequest request)
{
    var controleAcesso = _unitOfWork.ControleAcesso
        .GetFirstOrDefault(ca => 
            ca.UsuarioId == request.UsuarioId && 
            ca.RecursoId == Guid.Parse(request.RecursoId));
    
    if (controleAcesso != null)
    {
        controleAcesso.Acesso = request.Acesso;
        _unitOfWork.ControleAcesso.Update(controleAcesso);
    }
    else
    {
        controleAcesso = new ControleAcesso
        {
            UsuarioId = request.UsuarioId,
            RecursoId = Guid.Parse(request.RecursoId),
            Acesso = request.Acesso
        };
        _unitOfWork.ControleAcesso.Add(controleAcesso);
    }
    
    _unitOfWork.Save();
    return Json(new { success = true });
}
```

---

## 🛠️ Problema → Solução → Código

### Problema: Estrutura Hierárquica para TreeView

**Problema:** TreeView Syncfusion EJ2 precisa de estrutura recursiva com `Items` aninhados.

**Solução:** `NavigationTreeItem` tem propriedade `Items` do tipo `List<NavigationTreeItem>`, permitindo estrutura hierárquica.

**Código:**

```csharp
// ✅ Estrutura hierárquica
var treeItem = new NavigationTreeItem
{
    Id = "1",
    Text = "Cadastros",
    HasChild = true,
    Items = new List<NavigationTreeItem>
    {
        new NavigationTreeItem
        {
            Id = "1-1",
            Text = "Veículos",
            ParentId = "1",
            HasChild = false,
            Items = new List<NavigationTreeItem>()
        }
    }
};
```

---

## 🔄 Fluxo de Funcionamento

### Fluxo: Salvar Navegação Completa

```
1. Usuário reorganiza itens no TreeView Syncfusion
   ↓
2. JavaScript monta SaveNavigationRequest com árvore completa
   ↓
3. AJAX POST para /api/navigation/savenavigation
   ↓
4. Controller processa árvore recursivamente:
   ├─ Para cada item raiz
   ├─ Atualiza Recurso no banco
   ├─ Processa filhos recursivamente
   └─ Atualiza ParentId, Nivel, Ordem
   ↓
5. Salva todas as alterações
   ↓
6. Retorna sucesso
```

---

## 📝 Notas Importantes

1. **Compatibilidade Syncfusion** - `NavigationTreeItem` segue estrutura esperada pelo componente `ejs-treeview`.

2. **Recursividade** - `Items` permite estrutura hierárquica ilimitada.

3. **NomeMenu** - Identificador único usado para vincular com `Recurso` no banco.

---

**📅 Documentação criada em:** 08/01/2026
