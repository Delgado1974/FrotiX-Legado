# Documentação: ForgotAccount.cs

**📅 Última Atualização:** 08/01/2026  
**📋 Versão:** 2.0 (Padrão FrotiX Simplificado)

---

## 🎯 Objetivos

O Model `ForgotAccount` é usado na funcionalidade de recuperação de conta, permitindo que usuários recuperem acesso usando username ou email.

**Principais objetivos:**

✅ Capturar username ou email do usuário  
✅ Validar se conta existe no sistema  
✅ Iniciar processo de recuperação de senha

---

## 🏗️ Estrutura do Model

```csharp
public class ForgotAccount
{
    public string UserName { get; set; }
    public string Email { get; set; }
}
```

**Características:**
- ✅ Campos opcionais - Usuário pode informar username OU email
- ✅ Sem validações no Model - Validações feitas no Controller/PageModel

---

## 🔗 Quem Chama e Por Quê

### Pages/Account/ForgotPassword.cshtml.cs → Recuperação

```csharp
[BindProperty]
public ForgotAccount ForgotAccount { get; set; }

public async Task<IActionResult> OnPostAsync()
{
    var user = await _userManager.FindByNameAsync(ForgotAccount.UserName) 
            ?? await _userManager.FindByEmailAsync(ForgotAccount.Email);
    
    if (user == null)
    {
        // Usuário não encontrado
        return Page();
    }
    
    // Gera token de reset e envia email
    var token = await _userManager.GeneratePasswordResetTokenAsync(user);
    // ... envia email
}
```

---

## 📝 Notas Importantes

1. **Campos opcionais** - Ambos podem ser nulos, validação verifica se pelo menos um foi preenchido.

2. **Busca flexível** - Sistema busca por username OU email.

---

**📅 Documentação criada em:** 08/01/2026
