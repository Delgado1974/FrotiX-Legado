# Documentação: ToastMessage.cs

**📅 Última Atualização:** 08/01/2026  
**📋 Versão:** 2.0 (Padrão FrotiX Simplificado)

---

## 🎯 Objetivos

O Model `ToastMessage` representa uma mensagem toast (notificação temporária) com texto, cor e duração configuráveis.

**Principais objetivos:**

✅ Padronizar estrutura de mensagens toast  
✅ Suportar diferentes cores (Verde, Vermelho, Laranja)  
✅ Permitir configuração de duração de exibição

---

## 🏗️ Estrutura do Model

```csharp
public class ToastMessage
{
    public string Texto { get; set; }
    public string Cor { get; set; }
    public int Duracao { get; set; }

    public ToastMessage(string texto, string cor = "Verde", int duracao = 2000)
    {
        Texto = texto;
        Cor = cor;
        Duracao = duracao;
    }
}

public enum ToastColor
{
    Verde,
    Vermelho,
    Laranja
}
```

**Características:**
- ✅ Construtor com valores padrão - Verde, 2000ms
- ✅ Enum `ToastColor` - Cores disponíveis

---

## 🔗 Quem Chama e Por Quê

### Controllers → Mensagens de Sucesso/Erro

```csharp
TempData.Put("toast", new ToastMessage("Operação realizada com sucesso!", "Verde"));
return RedirectToPage("./Index");
```

### Pages/_Layout.cshtml → Exibição

```csharp
@{
    var toast = TempData.Get<ToastMessage>("toast");
}
@if (toast != null)
{
    <script>
        AppToast.show("@toast.Cor", "@toast.Texto", @toast.Duracao);
    </script>
}
```

---

## 📝 Notas Importantes

1. **TempData** - Usado com `TempDataExtensions.Put/Get` para persistir entre redirects.

2. **Duração em ms** - Padrão 2000ms (2 segundos).

3. **Cores** - Verde (sucesso), Vermelho (erro), Laranja (aviso).

---

**📅 Documentação criada em:** 08/01/2026
