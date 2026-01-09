# Documentação: TempDataExtensions.cs

**📅 Última Atualização:** 08/01/2026  
**📋 Versão:** 2.0 (Padrão FrotiX Simplificado)

---

## 🎯 Objetivos

A classe `TempDataExtensions` fornece métodos de extensão para `ITempDataDictionary` que permitem armazenar e recuperar objetos complexos usando serialização JSON.

**Principais objetivos:**

✅ Armazenar objetos complexos no TempData (não apenas strings)  
✅ Serializar/deserializar automaticamente usando Newtonsoft.Json  
✅ Facilitar passagem de dados entre Actions/Pages após redirects

---

## 🏗️ Estrutura do Model

```csharp
public static class TempDataExtensions
{
    public static void Put<T>(this ITempDataDictionary tempData, string key, T value)
    {
        tempData[key] = JsonConvert.SerializeObject(value);
    }

    public static T Get<T>(this ITempDataDictionary tempData, string key)
    {
        if (tempData.TryGetValue(key, out object o))
        {
            return o == null ? default : JsonConvert.DeserializeObject<T>((string)o);
        }
        return default;
    }
}
```

**Características:**
- ✅ Métodos de extensão - `Put<T>()` e `Get<T>()`
- ✅ Serialização JSON - Usa `Newtonsoft.Json`
- ✅ Type-safe - Genéricos garantem tipo correto

---

## 🔗 Quem Chama e Por Quê

### Controllers → Armazenar Objetos Complexos

```csharp
// ✅ Armazenar ToastMessage
TempData.Put("toast", new ToastMessage("Sucesso!", "Verde"));

// ✅ Armazenar ViewModel
TempData.Put("encarregado", encarregadoViewModel);

// ✅ Recuperar em outra Action/Page
var toast = TempData.Get<ToastMessage>("toast");
var encarregado = TempData.Get<EncarregadoViewModel>("encarregado");
```

---

## 🛠️ Problema → Solução → Código

### Problema: TempData só aceita strings

**Solução:** Serializar objeto para JSON antes de armazenar, deserializar ao recuperar.

```csharp
// ✅ ANTES: Só strings
TempData["mensagem"] = "Texto simples";

// ✅ DEPOIS: Objetos complexos
TempData.Put("toast", new ToastMessage("Sucesso!", "Verde", 3000));
```

---

## 📝 Notas Importantes

1. **Serialização JSON** - Objetos são convertidos para JSON string antes de armazenar.

2. **Type-safe** - Genéricos garantem tipo correto na recuperação.

3. **Default values** - Retorna `default(T)` se chave não existir.

---

**📅 Documentação criada em:** 08/01/2026
