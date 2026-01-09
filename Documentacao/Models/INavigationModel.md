# Documentação: INavigationModel.cs

**📅 Última Atualização:** 08/01/2026  
**📋 Versão:** 2.0 (Padrão FrotiX Simplificado)

---

## 🎯 Objetivos

A interface `INavigationModel` define o contrato para classes que fornecem navegação do sistema, especificando duas propriedades: `Seed` (navegação básica) e `Full` (navegação completa).

**Principais objetivos:**

✅ Definir contrato para classes de navegação  
✅ Padronizar acesso a navegação básica e completa  
✅ Facilitar injeção de dependência e testes

---

## 🏗️ Estrutura do Model

```csharp
public interface INavigationModel
{
    SmartNavigation Seed { get; }
    SmartNavigation Full { get; }
}
```

**Características:**
- ✅ Interface simples - Apenas duas propriedades
- ✅ Propriedades somente leitura - Apenas getters
- ✅ Retorna `SmartNavigation` - Objeto de navegação estruturado

---

## 🔗 Quem Chama e Por Quê

### NavigationModel.cs → Implementa Interface

```csharp
public class NavigationModel : INavigationModel
{
    public SmartNavigation Full => BuildNavigation(seedOnly: false);
    public SmartNavigation Seed => BuildNavigation();
}
```

### ViewComponents/NavigationViewComponent.cs → Usa Interface

```csharp
public class NavigationViewComponent : ViewComponent
{
    private readonly INavigationModel _navigationModel;
    
    public NavigationViewComponent(INavigationModel navigationModel, IUnitOfWork unitOfWork)
    {
        _navigationModel = navigationModel;
    }
    
    public IViewComponentResult Invoke()
    {
        var items = _navigationModel.Full; // ✅ Usa interface
        return View(items);
    }
}
```

---

## 🛠️ Problema → Solução → Código

### Problema: Acoplamento Direto com NavigationModel

**Problema:** Componentes dependiam diretamente de `NavigationModel`, dificultando testes e substituição de implementação.

**Solução:** Criar interface `INavigationModel` que define o contrato, permitindo injeção de dependência e facilitando testes.

**Código:**

```csharp
// ✅ ANTES: Acoplamento direto
public class NavigationViewComponent : ViewComponent
{
    private readonly NavigationModel _navigationModel; // ❌ Classe concreta
    
    public NavigationViewComponent(NavigationModel navigationModel)
    {
        _navigationModel = navigationModel;
    }
}

// ✅ DEPOIS: Usando interface
public class NavigationViewComponent : ViewComponent
{
    private readonly INavigationModel _navigationModel; // ✅ Interface
    
    public NavigationViewComponent(INavigationModel navigationModel)
    {
        _navigationModel = navigationModel;
    }
}
```

---

## 📝 Notas Importantes

1. **Injeção de Dependência** - Interface permite registrar `NavigationModel` como `INavigationModel` no container DI.

2. **Testabilidade** - Facilita criação de mocks para testes unitários.

3. **Extensibilidade** - Permite criar outras implementações da interface no futuro.

---

**📅 Documentação criada em:** 08/01/2026
