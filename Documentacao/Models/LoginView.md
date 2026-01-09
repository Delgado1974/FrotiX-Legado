# Documentação: LoginView.cs

**📅 Última Atualização:** 08/01/2026  
**📋 Versão:** 2.0 (Padrão FrotiX Simplificado)

---

## 🎯 Objetivos

O Model `LoginView` é usado na página de login do sistema, capturando credenciais do usuário (username e senha).

**Principais objetivos:**

✅ Capturar username e senha do usuário  
✅ Validar campos obrigatórios  
✅ Integrar com sistema de autenticação ASP.NET Identity

---

## 🏗️ Estrutura do Model

```csharp
public class LoginView
{
    [Required]
    [UIHint("username")]
    public string UserName { get; set; }
    
    [Required]
    [UIHint("password")]
    public string Password { get; set; }
}
```

**Características:**
- ✅ Validação `[Required]` - Ambos campos obrigatórios
- ✅ `[UIHint]` - Indica tipo de input para renderização

---

## 🔗 Quem Chama e Por Quê

### Pages/Account/Login.cshtml.cs → Autenticação

```csharp
[BindProperty]
public LoginView LoginView { get; set; }

public async Task<IActionResult> OnPostAsync()
{
    if (!ModelState.IsValid)
        return Page();
    
    var result = await _signInManager.PasswordSignInAsync(
        LoginView.UserName,
        LoginView.Password,
        isPersistent: false,
        lockoutOnFailure: true
    );
    
    if (result.Succeeded)
        return RedirectToPage("/Index");
    
    ModelState.AddModelError("", "Credenciais inválidas");
    return Page();
}
```

---

## 📝 Notas Importantes

1. **UIHint** - Ajuda renderização de inputs com tipos específicos.

2. **Validação** - `[Required]` garante que campos não sejam vazios.

---

**📅 Documentação criada em:** 08/01/2026
