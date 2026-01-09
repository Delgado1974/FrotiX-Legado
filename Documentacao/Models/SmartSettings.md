# Documentação: SmartSettings.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Estrutura de Arquivos](#estrutura-de-arquivos)
4. [Estrutura do Model](#estrutura-do-model)
5. [Configuração](#configuração)
6. [Interconexões](#interconexões)
7. [Frontend](#frontend)
8. [Exemplos de Uso](#exemplos-de-uso)
9. [Troubleshooting](#troubleshooting)

---

## Visão Geral

O Model `SmartSettings` representa as configurações gerais da aplicação FrotiX, incluindo informações do tema, versão, recursos habilitados e dados do usuário. Essas configurações são carregadas do arquivo `appsettings.json` e disponibilizadas através de injeção de dependência em todas as páginas e componentes.

**Principais características:**

✅ **Configuração Centralizada**: Todas as configurações da aplicação em um único lugar  
✅ **Injeção de Dependência**: Disponível via DI em qualquer página/controller  
✅ **Tema e Branding**: Configurações visuais e de identidade  
✅ **Recursos Habilitados**: Controle de quais features estão ativas  
✅ **Dados do Usuário**: Informações do usuário padrão para exibição

### Objetivo

O `SmartSettings` resolve o problema de gerenciar configurações da aplicação de forma centralizada e tipada, permitindo:
- Acesso fácil às configurações em qualquer parte do código
- Manutenção simples através do `appsettings.json`
- Personalização do tema e branding
- Controle de features habilitadas/desabilitadas
- Informações do usuário para exibição no layout

---

## Arquitetura

### Tecnologias Utilizadas

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| ASP.NET Core | 5.0+ | Options Pattern para configuração |
| Microsoft.Extensions.Options | - | Binding de configurações |

### Padrões de Design

- **Options Pattern**: Padrão do ASP.NET Core para configurações tipadas
- **Singleton**: Configurações são injetadas como Singleton (uma instância para toda aplicação)
- **Configuration Binding**: Binding automático de `appsettings.json` para objeto tipado

---

## Estrutura de Arquivos

### Arquivo Principal
```
Models/SmartSettings.cs
```

### Arquivos Relacionados
- `appsettings.json` - Arquivo de configuração com seção `SmartSettings`
- `Startup.cs` - Configuração de injeção de dependência
- `Pages/_ViewImports.cshtml` - Injeção nas páginas Razor
- `Pages/Shared/_Layout.cshtml` - Uso das configurações no layout

---

## Estrutura do Model

### Classe Principal: `SmartSettings`

```csharp
public class SmartSettings
{
    public const string SectionName = nameof(SmartSettings);

    public string Version { get; set; }
    public string App { get; set; }
    public string AppName { get; set; }
    public string AppFlavor { get; set; }
    public string AppFlavorSubscript { get; set; }
    public Theme Theme { get; set; }
    public Features Features { get; set; }
}
```

**Propriedades:**
- `SectionName` (const string): Nome da seção no `appsettings.json` ("SmartSettings")
- `Version` (string): Versão da aplicação
- `App` (string): Nome curto da aplicação
- `AppName` (string): Nome completo da aplicação
- `AppFlavor` (string): Versão do framework (ex: "ASP.NET Core 5")
- `AppFlavorSubscript` (string): Subscript do framework (ex: ".NET Core 5")
- `Theme` (Theme): Configurações do tema
- `Features` (Features): Recursos habilitados/desabilitados

### Classe: `Theme`

```csharp
public class Theme
{
    public string ThemeVersion { get; set; }
    public string IconPrefix { get; set; }
    public string Logo { get; set; }
    public string User { get; set; }
    public string Role { get; set; } = "Administrator";
    public string Email { get; set; }
    public string Twitter { get; set; }
    public string Avatar { get; set; }
}
```

**Propriedades:**
- `ThemeVersion` (string): Versão do tema SmartAdmin
- `IconPrefix` (string): Prefixo dos ícones FontAwesome (ex: "fal", "fa-duotone")
- `Logo` (string): Nome do arquivo do logo
- `User` (string): Nome do usuário padrão para exibição
- `Role` (string): Função do usuário padrão (padrão: "Administrator")
- `Email` (string): Email do usuário padrão
- `Twitter` (string): Twitter do usuário padrão
- `Avatar` (string): Nome do arquivo do avatar padrão

### Classe: `Features`

```csharp
public class Features
{
    public bool AppSidebar { get; set; }
    public bool AppHeader { get; set; }
    public bool AppLayoutShortcut { get; set; }
    public bool AppFooter { get; set; }
    public bool ShortcutMenu { get; set; }
    public bool GoogleAnalytics { get; set; }
    public bool ChatInterface { get; set; }
    public bool LayoutSettings { get; set; }
}
```

**Propriedades (todas boolean):**
- `AppSidebar`: Menu lateral habilitado
- `AppHeader`: Cabeçalho da aplicação habilitado
- `AppLayoutShortcut`: Atalhos de layout habilitados
- `AppFooter`: Rodapé habilitado
- `ShortcutMenu`: Menu de atalhos habilitado
- `GoogleAnalytics`: Google Analytics habilitado
- `ChatInterface`: Interface de chat habilitada
- `LayoutSettings`: Configurações de layout habilitadas

### Classe: `SmartError`

```csharp
public class SmartError
{
    public string[][] Errors { get; set; } = { };

    public static SmartError Failed(params string[] errors) => 
        new SmartError { Errors = new[] { errors } };
}
```

**Uso**: Estrutura para retornar erros de validação de forma padronizada.

---

## Configuração

### Configuração no appsettings.json

```json
{
  "SmartSettings": {
    "Version": "4.3.1",
    "App": "FrotiX",
    "AppName": "FrotiX",
    "AppFlavor": "ASP.NET Core 5",
    "AppFlavorSubscript": ".NET Core 5",
    "Theme": {
      "ThemeVersion": "4.5.1",
      "IconPrefix": "fal",
      "Logo": "logo.png",
      "User": "Alexandre Delgado",
      "Email": "alexandre.silva@camara.leg.br",
      "Twitter": "codexlantern",
      "Avatar": "avatar-admin.png"
    },
    "Features": {
      "AppSidebar": true,
      "AppHeader": true,
      "AppLayoutShortcut": true,
      "AppFooter": true,
      "ShortcutMenu": false,
      "GoogleAnalytics": false,
      "ChatInterface": false,
      "LayoutSettings": false
    }
  }
}
```

### Configuração no Startup.cs

```csharp
// ✅ Configuração de Options Pattern
services.Configure<SmartSettings>(
    Configuration.GetSection(SmartSettings.SectionName)
);

// ✅ Registro como Singleton para acesso direto
services.AddSingleton(s => 
    s.GetRequiredService<IOptions<SmartSettings>>().Value
);
```

**Explicação**:
1. `Configure<SmartSettings>()`: Faz binding da seção `SmartSettings` do `appsettings.json` para o objeto tipado
2. `AddSingleton()`: Registra uma instância única que pode ser injetada diretamente (sem `IOptions<>`)

---

## Interconexões

### Quem Chama Este Arquivo

#### 1. **Pages/_ViewImports.cshtml** → Injeção nas Páginas

**Quando**: Todas as páginas Razor carregam  
**Por quê**: Disponibiliza `SmartSettings` em todas as páginas

```razor
@inject SmartSettings Settings
```

**Uso nas páginas**:
```razor
@{
    ViewData["Title"] = Settings.AppName;
}
```

#### 2. **Pages/Shared/_Layout.cshtml** → Uso no Layout

**Quando**: Layout principal é renderizado  
**Por quê**: Usa configurações para exibir informações do tema

```razor
@inject SmartSettings Settings

<!-- Logo -->
<img src="~/images/@Settings.Theme.Logo" alt="@Settings.AppName" />

<!-- Nome do usuário -->
<span>@Settings.Theme.User</span>

<!-- Avatar -->
<img src="~/images/@Settings.Theme.Avatar" alt="Avatar" />
```

#### 3. **Controllers/HomeController.cs** → Uso em Controllers

**Quando**: Controller precisa acessar configurações  
**Por quê**: Retornar informações da aplicação em APIs

```csharp
public class HomeController : Controller
{
    private readonly SmartSettings _settings;

    public HomeController(SmartSettings settings)
    {
        _settings = settings;
    }

    public IActionResult GetAppInfo()
    {
        return Json(new {
            app = _settings.App,
            version = _settings.Version,
            name = _settings.AppName
        });
    }
}
```

#### 4. **Startup.cs** → Configuração Inicial

**Quando**: Aplicação inicia  
**Por quê**: Configurar Options Pattern e registrar Singleton

```csharp
services.Configure<SmartSettings>(
    Configuration.GetSection(SmartSettings.SectionName)
);
services.AddSingleton(s => 
    s.GetRequiredService<IOptions<SmartSettings>>().Value
);
```

### O Que Este Arquivo Usa

- **Microsoft.Extensions.Configuration**: Para ler `appsettings.json`
- **Microsoft.Extensions.Options**: Para Options Pattern
- **appsettings.json**: Arquivo de configuração

### Fluxo de Dados

```
appsettings.json
    ↓
IConfiguration (Startup.cs)
    ↓
services.Configure<SmartSettings>()
    ↓
SmartSettings (objeto populado)
    ↓
services.AddSingleton()
    ↓
Injeção de Dependência
    ↓
Pages/Controllers/ViewComponents
```

---

## Frontend

### Uso no Layout Principal

O `SmartSettings` é usado extensivamente no `_Layout.cshtml`:

```razor
@inject SmartSettings Settings

<!-- Logo -->
<div class="page-logo">
    <img src="~/images/@Settings.Theme.Logo" 
         alt="@Settings.AppName" 
         class="logo-img" />
</div>

<!-- Informações do usuário -->
<div class="page-user">
    <img src="~/images/@Settings.Theme.Avatar" 
         alt="@Settings.Theme.User" 
         class="user-avatar" />
    <span class="user-name">@Settings.Theme.User</span>
    <span class="user-role">@Settings.Theme.Role</span>
</div>

<!-- Rodapé (se habilitado) -->
@if (Settings.Features.AppFooter)
{
    <footer class="page-footer">
        <span>@Settings.AppName v@Settings.Version</span>
    </footer>
}
```

### Uso em JavaScript (se necessário)

Configurações podem ser expostas ao JavaScript:

```razor
<script>
    window.appSettings = {
        appName: '@Settings.AppName',
        version: '@Settings.Version',
        iconPrefix: '@Settings.Theme.IconPrefix'
    };
</script>
```

---

## Exemplos de Uso

### Cenário 1: Exibir Nome da Aplicação

**Situação**: Página precisa exibir nome da aplicação no título

**Código**:
```razor
@inject SmartSettings Settings

@{
    ViewData["Title"] = $"{Settings.AppName} - Dashboard";
}
```

**Resultado**: Título da página mostra "FrotiX - Dashboard"

### Cenário 2: Verificar se Feature Está Habilitada

**Situação**: Renderizar componente apenas se feature estiver habilitada

**Código**:
```razor
@inject SmartSettings Settings

@if (Settings.Features.ChatInterface)
{
    <div class="chat-widget">
        <!-- Interface de chat -->
    </div>
}
```

**Resultado**: Chat só aparece se `ChatInterface = true` no `appsettings.json`

### Cenário 3: Usar Prefixo de Ícone Dinamicamente

**Situação**: Ícones precisam usar prefixo configurável

**Código**:
```razor
@inject SmartSettings Settings

<i class="@Settings.Theme.IconPrefix fa-car"></i>
```

**Resultado**: Ícone usa prefixo correto (ex: "fal fa-car" ou "fa-duotone fa-car")

### Cenário 4: Acessar em Controller

**Situação**: API precisa retornar informações da aplicação

**Código**:
```csharp
[ApiController]
[Route("api/[controller]")]
public class AppController : ControllerBase
{
    private readonly SmartSettings _settings;

    public AppController(SmartSettings settings)
    {
        _settings = settings;
    }

    [HttpGet("info")]
    public IActionResult GetInfo()
    {
        return Ok(new {
            app = _settings.App,
            version = _settings.Version,
            name = _settings.AppName,
            theme = _settings.Theme.ThemeVersion
        });
    }
}
```

**Resultado**: Endpoint retorna informações da aplicação

---

## Troubleshooting

### Problema: Configurações não são carregadas

**Sintoma**: `SmartSettings` injetado está null ou com valores padrão

**Causa Possível 1**: Seção não existe no `appsettings.json`

**Diagnóstico**:
```json
// Verificar se existe seção "SmartSettings" no appsettings.json
{
  "SmartSettings": {
    // ...
  }
}
```

**Solução**: Adicionar seção `SmartSettings` no `appsettings.json`

**Causa Possível 2**: Configuração não foi registrada no `Startup.cs`

**Diagnóstico**:
```csharp
// Verificar se existe em Startup.cs
services.Configure<SmartSettings>(
    Configuration.GetSection(SmartSettings.SectionName)
);
services.AddSingleton(s => 
    s.GetRequiredService<IOptions<SmartSettings>>().Value
);
```

**Solução**: Adicionar configuração no `Startup.cs`

**Código Relacionado**: `Startup.cs` linhas 196-199

---

### Problema: Valores não atualizam após mudança no appsettings.json

**Sintoma**: Mudanças no `appsettings.json` não refletem na aplicação

**Causa**: Singleton mantém valores em memória

**Solução**: 
1. Reiniciar aplicação após mudanças
2. Ou usar `IOptionsSnapshot<SmartSettings>` para valores atualizáveis (requer recompilação)

---

### Problema: Erro ao injetar SmartSettings

**Sintoma**: Erro de injeção de dependência ao tentar usar `SmartSettings`

**Causa**: Não foi registrado no container de DI

**Diagnóstico**:
```csharp
// Verificar se está registrado
services.AddSingleton(s => 
    s.GetRequiredService<IOptions<SmartSettings>>().Value
);
```

**Solução**: Adicionar registro no `Startup.cs`

---

## Validações

### Validação de Configuração

O ASP.NET Core valida automaticamente se a seção existe no `appsettings.json` ao fazer binding. Se não existir, valores serão `null` ou padrão.

**Recomendação**: Validar configurações críticas:

```csharp
public class SmartSettings
{
    // Adicionar validações se necessário
    [Required]
    public string AppName { get; set; }
}
```

---

## Notas Importantes

1. **Singleton**: `SmartSettings` é Singleton, uma instância para toda aplicação
2. **appsettings.json**: Mudanças requerem reinicialização da aplicação
3. **Injeção**: Disponível via `@inject` em páginas Razor ou construtor em controllers
4. **Seção**: Nome da seção é "SmartSettings" (definido em `SectionName`)
5. **Fallback**: Se configuração não existir, valores serão `null` ou padrão

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação de documentação extensiva do modelo `SmartSettings` seguindo padrão FrotiX

**Arquivos Afetados**:
- `Documentacao/Models/SmartSettings.md` (criado)

**Impacto**: Documentação completa das configurações da aplicação para facilitar manutenção

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

## Histórico de Versões

| Versão | Data | Descrição |
|--------|------|-----------|
| 2.0 | 08/01/2026 | Documentação inicial completa |
| 1.0 | - | Versão inicial do código |

---

## Referências

- [Documentação Startup.cs](../Controllers/Startup.md) (se existir)
- [Documentação _Layout.cshtml](../Pages/Shared/_Layout.md) (se existir)

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
