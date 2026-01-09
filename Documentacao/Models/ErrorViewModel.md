# Documentação: ErrorViewModel.cs

**📅 Última Atualização:** 08/01/2026  
**📋 Versão:** 2.0 (Padrão FrotiX Simplificado)

---

## 🎯 Objetivos

O Model `ErrorViewModel` é usado para exibir informações de erro em páginas de erro do ASP.NET Core, incluindo o Request ID para rastreamento.

**Principais objetivos:**

✅ Exibir informações de erro de forma amigável ao usuário  
✅ Incluir Request ID para rastreamento em logs  
✅ Controlar exibição do Request ID (apenas se não vazio)

---

## 🏗️ Estrutura do Model

```csharp
public class ErrorViewModel
{
    public string RequestId { get; set; }
    public bool ShowRequestId => !string.IsNullOrEmpty(RequestId);
}
```

**Características:**
- ✅ Propriedade `RequestId` - ID único da requisição que gerou erro
- ✅ Propriedade calculada `ShowRequestId` - Indica se RequestId deve ser exibido

---

## 🔗 Quem Chama e Por Quê

### Pages/Error.cshtml → Exibe Erro

```csharp
@model ErrorViewModel

@if (Model.ShowRequestId)
{
    <p><strong>Request ID:</strong> <code>@Model.RequestId</code></p>
}
```

---

## 📝 Notas Importantes

1. **Request ID** - Gerado automaticamente pelo ASP.NET Core para rastreamento.

2. **ShowRequestId** - Propriedade calculada evita exibir campo vazio.

---

**📅 Documentação criada em:** 08/01/2026
