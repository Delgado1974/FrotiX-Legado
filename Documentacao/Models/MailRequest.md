# Documentação: MailRequest.cs

**📅 Última Atualização:** 08/01/2026  
**📋 Versão:** 2.0 (Padrão FrotiX Simplificado)

---

## 🎯 Objetivos

O Model `MailRequest` é usado para encapsular dados de requisição de envio de email no sistema.

**Principais objetivos:**

✅ Capturar destinatário, assunto e corpo do email  
✅ Padronizar estrutura de dados para serviços de email  
✅ Facilitar integração com provedores de email (SendGrid, SMTP, etc.)

---

## 🏗️ Estrutura do Model

```csharp
public class MailRequest
{
    public string ToEmail { get; set; }
    public string Subject { get; set; }
    public string Body { get; set; }
}
```

**Características:**
- ✅ Propriedades simples - Estrutura básica de email
- ✅ Sem validações - Validações feitas no serviço de email

---

## 🔗 Quem Chama e Por Quê

### Services/EmailService.cs → Envio de Email

```csharp
public async Task SendEmailAsync(MailRequest request)
{
    var message = new MimeMessage();
    message.To.Add(new MailboxAddress("", request.ToEmail));
    message.Subject = request.Subject;
    message.Body = new TextPart("html") { Text = request.Body };
    
    using (var client = new SmtpClient())
    {
        await client.ConnectAsync("smtp.example.com", 587);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }
}
```

---

## 📝 Notas Importantes

1. **Estrutura simples** - Apenas campos essenciais para envio básico.

2. **Body como HTML** - Geralmente contém HTML para formatação.

---

**📅 Documentação criada em:** 08/01/2026
