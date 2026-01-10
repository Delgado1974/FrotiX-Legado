# MailService.cs e IMailService.cs

## Visão Geral
Serviço de **envio de emails** usando MailKit (biblioteca moderna e assíncrona para SMTP). Integrado com configurações do `appsettings.json` via `MailSettings`.

## Localização
- `Services/MailService.cs` (implementação)
- `Services/IMailService.cs` (interface)

## Dependências
- `MailKit.Net.Smtp` (cliente SMTP)
- `MimeKit` (construção de mensagens MIME)
- `Microsoft.Extensions.Options` (`IOptions<MailSettings>`)
- `FrotiX.Settings` (`MailSettings`)
- `FrotiX.Models` (`MailRequest`)

## Interface (`IMailService`)

### `SendEmailAsync(MailRequest mailRequest)`
Envia email assíncrono usando configurações SMTP.

**Parâmetros**:
- `mailRequest`: Objeto contendo destinatário, assunto e corpo HTML

---

## Implementação (`MailService`)

### Configuração
Configurações são injetadas via `IOptions<MailSettings>`:
- `Mail`: Email remetente
- `Password`: Senha do email
- `Host`: Servidor SMTP
- `Port`: Porta SMTP
- `DisplayName`: Nome de exibição (atualmente hardcoded como "FrotiX - Autenticação")

### Método Principal

#### `SendEmailAsync(MailRequest mailRequest)`
**Propósito**: Envia email HTML via SMTP.

**Fluxo**:
1. Cria mensagem MIME (`MimeMessage`)
2. Define remetente (`MailSettings.Mail`)
3. Define destinatário (`mailRequest.ToEmail`)
4. Define assunto (`mailRequest.Subject`)
5. Define corpo HTML (`mailRequest.Body`)
6. Conecta ao servidor SMTP (`SmtpClient`)
7. Autentica com credenciais
8. Envia email assíncrono
9. Desconecta

**Configuração SMTP**:
- `SecureSocketOptions.StartTlsWhenAvailable`: Usa TLS se disponível, senão cai para conexão não segura

**Chamado de**: 
- `Controllers/ForgotAccountController` (recuperação de senha)
- Outros controllers que precisam enviar notificações por email

**Complexidade**: Baixa (uso direto da biblioteca MailKit)

---

## Modelo `MailRequest`

```csharp
public class MailRequest
{
    public string ToEmail { get; set; }
    public string Subject { get; set; }
    public string Body { get; set; } // HTML
}
```

---

## Configuração (`MailSettings`)

Definido em `Settings/MailSettings.cs` e configurado em `appsettings.json`:

```json
{
  "MailSettings": {
    "Mail": "noreply@camara.leg.br",
    "Password": "senha",
    "Host": "smtp.camara.leg.br",
    "Port": 587,
    "DisplayName": "FrotiX - Gestão de Frotas"
  }
}
```

---

## Contribuição para o Sistema FrotiX

### 📧 Comunicação
- Envio de emails de recuperação de senha
- Notificações de eventos importantes
- Relatórios por email (futuro)

### 🔒 Segurança
- Autenticação SMTP segura
- Suporte a TLS/SSL
- Credenciais configuráveis via `appsettings.json`

### 🎨 Personalização
- Corpo HTML permite emails ricos
- Nome de exibição personalizado
- Assunto e destinatário dinâmicos

## Observações Importantes

1. **Nome Hardcoded**: O nome de exibição está hardcoded como "FrotiX - Autenticação" no código, mas deveria usar `MailSettings.DisplayName`.

2. **Error Handling**: O método não captura exceções explicitamente. Exceções do MailKit serão propagadas para o chamador.

3. **Timeout**: Não há timeout configurado no `SmtpClient`. Considere adicionar timeout para evitar bloqueios longos.

4. **Retry Logic**: Não há lógica de retry. Se o envio falhar, a exceção é propagada. Considere implementar retry com backoff exponencial.

5. **Templates**: O corpo HTML é passado diretamente. Considere usar templates (ex.: Razor) para emails padronizados.

## Arquivos Relacionados
- `Settings/MailSettings.cs`: Configurações de email
- `Models/MailRequest.cs`: Modelo de requisição de email
- `Controllers/ForgotAccountController.cs`: Usa `MailService` para recuperação de senha
- `appsettings.json`: Configurações SMTP
