# Documentação: LoginController.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Estrutura de Arquivos](#estrutura-de-arquivos)
4. [Endpoints API](#endpoints-api)
5. [Lógica de Negócio](#lógica-de-negócio)
6. [Interconexões](#interconexões)
7. [Exemplos de Uso](#exemplos-de-uso)
8. [Troubleshooting](#troubleshooting)

---

## Visão Geral

O `LoginController` gerencia informações do usuário logado no sistema. Fornece endpoints para recuperar dados do usuário atual, incluindo nome completo e ponto, que são usados em várias partes do sistema para exibição e controle de acesso.

**Principais características:**

✅ **Informações do Usuário**: Recupera dados do usuário autenticado  
✅ **Claims Identity**: Usa ASP.NET Core Identity Claims para identificar usuário  
✅ **Variáveis Globais**: Atualiza variável global `Settings.GlobalVariables.gPontoUsuario`  
✅ **API Controller**: Implementa padrão API Controller

---

## Arquitetura

### Tecnologias Utilizadas

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| ASP.NET Core Identity | 3.1+ | Autenticação e Claims |
| ASP.NET Core | 3.1+ | Framework base |
| Entity Framework Core | - | Acesso a dados de usuários |

### Padrões de Design

- **API Controller Pattern**: Usa `[ApiController]` e `[Route("api/[controller]")]`
- **Dependency Injection**: Recebe `IUnitOfWork` e `IWebHostEnvironment` via construtor
- **Claims-Based Authentication**: Usa `ClaimTypes.NameIdentifier` para identificar usuário

---

## Estrutura de Arquivos

### Arquivo Principal
```
Controllers/LoginController.cs
```

### Arquivos Relacionados
- **JavaScript**: `wwwroot/js/site.js` - Pode chamar `RecuperaUsuarioAtual()`
- **Pages**: `Pages/Login/Index.cshtml` - Página de login
- **Models**: `Models/Cadastros/AspNetUsers.cs` - Model de usuário

---

## Endpoints API

### GET `/api/Login`

**Descrição**: Retorna view padrão (não usado em produção)

**Parâmetros**: Nenhum

**Response**: View HTML

**Código Fonte**:
```csharp
[HttpGet]
public IActionResult Get()
{
    try
    {
        return View();
    }
    catch (Exception error)
    {
        Alerta.TratamentoErroComLinha("LoginController.cs", "Get", error);
        return View(); // padronizado
    }
}
```

**Quando é chamado**: Raramente usado

---

### GET `/api/Login`

**Descrição**: Retorna view Index (não usado em produção)

**Parâmetros**: Nenhum

**Response**: View HTML

**Código Fonte**:
```csharp
public IActionResult Index()
{
    try
    {
        return View();
    }
    catch (Exception error)
    {
        Alerta.TratamentoErroComLinha("LoginController.cs", "Index", error);
        return View(); // padronizado
    }
}
```

---

### GET `/api/Login/RecuperaUsuarioAtual`

**Descrição**: **ENDPOINT PRINCIPAL** - Recupera informações do usuário logado (nome completo e ponto)

**Parâmetros**: Nenhum (usa Claims do usuário autenticado)

**Response**:
```json
{
  "nome": "João da Silva",
  "ponto": "PONTO_01"
}
```

**Código Fonte**:
```csharp
[Route("RecuperaUsuarioAtual")]
public IActionResult RecuperaUsuarioAtual()
{
    try
    {
        string usuarioCorrenteNome;
        string usuarioCorrentePonto;

        // Pega o usuário corrente
        ClaimsPrincipal currentUser = User;
        var currentUserID = currentUser.FindFirst(ClaimTypes.NameIdentifier).Value;

        var objUsuario = _unitOfWork.AspNetUsers.GetFirstOrDefault(u =>
            u.Id == currentUserID
        );

        usuarioCorrenteNome = objUsuario.NomeCompleto;
        usuarioCorrentePonto = objUsuario.Ponto;
        Settings.GlobalVariables.gPontoUsuario = objUsuario.Ponto;

        return Json(new
        {
            nome = usuarioCorrenteNome,
            ponto = usuarioCorrentePonto
        });
    }
    catch (Exception error)
    {
        Alerta.TratamentoErroComLinha("LoginController.cs", "RecuperaUsuarioAtual", error);
        return View(); // padronizado
    }
}
```

**Quando é chamado**:
- Ao carregar páginas que precisam exibir nome do usuário
- Para atualizar variável global `gPontoUsuario`
- Para validações baseadas em ponto do usuário

**⚠️ IMPORTANTE**: Requer autenticação. Usuário deve estar logado.

---

## Lógica de Negócio

### Fluxo: Recuperar Usuário Atual

```
1. Cliente faz requisição GET /api/Login/RecuperaUsuarioAtual
   ↓
2. Controller extrai ClaimTypes.NameIdentifier do User (ClaimsPrincipal)
   ↓
3. Busca AspNetUsers no banco pelo Id
   ↓
4. Extrai NomeCompleto e Ponto
   ↓
5. Atualiza Settings.GlobalVariables.gPontoUsuario (variável global)
   ↓
6. Retorna JSON com nome e ponto
```

### Variável Global: `Settings.GlobalVariables.gPontoUsuario`

**O que é**: Variável estática que armazena o ponto do usuário logado

**Quando é atualizada**: Sempre que `RecuperaUsuarioAtual()` é chamado

**Uso**: Usada em várias partes do sistema para filtros e validações baseadas em ponto

**⚠️ CUIDADO**: Variável global pode causar problemas em ambientes multi-threaded ou quando múltiplos usuários acessam simultaneamente. Considerar usar Session ou Claims em vez de variável global.

---

## Interconexões

### Quem Chama Este Controller

#### JavaScript (`wwwroot/js/site.js` ou páginas específicas)

```javascript
// Exemplo de chamada
$.ajax({
    url: '/api/Login/RecuperaUsuarioAtual',
    type: 'GET',
    success: function(response) {
        console.log('Usuário:', response.nome);
        console.log('Ponto:', response.ponto);
        // Atualiza interface com nome do usuário
    }
});
```

#### Pages Razor

Páginas podem chamar este endpoint via JavaScript para:
- Exibir nome do usuário no cabeçalho
- Validar permissões baseadas em ponto
- Filtrar dados por ponto do usuário

### O Que Este Controller Chama

- **`_unitOfWork.AspNetUsers.GetFirstOrDefault()`**: Busca usuário no banco
- **`Alerta.TratamentoErroComLinha()`**: Tratamento de erros padronizado
- **`Settings.GlobalVariables.gPontoUsuario`**: Atualiza variável global

### Fluxo de Dados

```
Usuário Logado (Claims)
    ↓
GET /api/Login/RecuperaUsuarioAtual
    ↓
Extrai UserId dos Claims
    ↓
Busca AspNetUsers no banco
    ↓
Atualiza gPontoUsuario (global)
    ↓
Retorna JSON { nome, ponto }
    ↓
JavaScript atualiza interface
```

---

## Exemplos de Uso

### Exemplo 1: Exibir Nome do Usuário no Cabeçalho

**JavaScript**:
```javascript
$(document).ready(function() {
    $.ajax({
        url: '/api/Login/RecuperaUsuarioAtual',
        type: 'GET',
        success: function(response) {
            $('#usuario-nome').text(response.nome);
            $('#usuario-ponto').text(response.ponto);
        },
        error: function() {
            console.error('Erro ao recuperar dados do usuário');
        }
    });
});
```

**HTML**:
```html
<div id="usuario-nome"></div>
<div id="usuario-ponto"></div>
```

---

### Exemplo 2: Filtrar Dados por Ponto do Usuário

**JavaScript**:
```javascript
function carregarDadosFiltrados() {
    $.ajax({
        url: '/api/Login/RecuperaUsuarioAtual',
        type: 'GET',
        success: function(usuario) {
            // Usa ponto do usuário para filtrar
            $.ajax({
                url: '/api/Abastecimento/Get',
                data: { ponto: usuario.ponto },
                success: function(dados) {
                    // Exibe apenas dados do ponto do usuário
                }
            });
        }
    });
}
```

---

### Exemplo 3: Validação de Permissão

**JavaScript**:
```javascript
function verificarPermissao() {
    $.ajax({
        url: '/api/Login/RecuperaUsuarioAtual',
        type: 'GET',
        success: function(usuario) {
            if (usuario.ponto === 'ADMIN') {
                // Permite acesso
            } else {
                // Bloqueia acesso
                alert('Você não tem permissão para esta ação');
            }
        }
    });
}
```

---

## Troubleshooting

### Problema: Retorna null ou erro ao chamar RecuperaUsuarioAtual()

**Causa**: Usuário não está autenticado ou Claim não está presente

**Diagnóstico**:
```csharp
// Verificar se usuário está autenticado
if (!User.Identity.IsAuthenticated)
{
    // Usuário não está logado
}

// Verificar se Claim existe
var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
if (string.IsNullOrEmpty(userId))
{
    // Claim não encontrada
}
```

**Solução**:
1. Verificar se usuário fez login
2. Verificar se `Startup.cs` configura Claims corretamente
3. Verificar se `AspNetUsers` tem registro com o Id do Claim

---

### Problema: Variável Global gPontoUsuario não está atualizada

**Causa**: Endpoint não foi chamado ou erro ocorreu antes da atualização

**Solução**:
1. Verificar se endpoint foi chamado (logs do servidor)
2. Verificar se usuário tem campo `Ponto` preenchido no banco
3. Chamar endpoint explicitamente ao carregar página

---

### Problema: Erro "Object reference not set" ao acessar objUsuario

**Causa**: Usuário não encontrado no banco de dados

**Diagnóstico**:
```csharp
var objUsuario = _unitOfWork.AspNetUsers.GetFirstOrDefault(u =>
    u.Id == currentUserID
);

if (objUsuario == null)
{
    // Usuário não encontrado no banco
    // Mas existe no Identity (Claims)
}
```

**Solução**:
1. Verificar se usuário existe em `AspNetUsers`
2. Sincronizar dados entre Identity e `AspNetUsers`
3. Adicionar validação null antes de acessar propriedades

**Código Melhorado**:
```csharp
var objUsuario = _unitOfWork.AspNetUsers.GetFirstOrDefault(u =>
    u.Id == currentUserID
);

if (objUsuario == null)
{
    return Json(new
    {
        success = false,
        message = "Usuário não encontrado no banco de dados"
    });
}

usuarioCorrenteNome = objUsuario.NomeCompleto ?? string.Empty;
usuarioCorrentePonto = objUsuario.Ponto ?? string.Empty;
```

---

### Problema: ClaimTypes.NameIdentifier retorna null

**Causa**: Claims não foram configuradas corretamente no Identity

**Solução**:
1. Verificar configuração do Identity em `Startup.cs` ou `Program.cs`
2. Verificar se `AddDefaultIdentity` ou `AddIdentity` está configurado
3. Verificar se Claims são adicionadas durante login

---

## Notas Importantes

1. **Autenticação Obrigatória**: Endpoint `RecuperaUsuarioAtual()` requer usuário autenticado
2. **Variável Global**: `gPontoUsuario` é atualizada globalmente - pode causar problemas em multi-thread
3. **BindProperty**: `AbastecimentoObj` está presente mas não é usado neste controller (provavelmente copiado de outro controller)
4. **Logger Errado**: Construtor usa `ILogger<AbastecimentoController>` em vez de `ILogger<LoginController>` - **BUG POTENCIAL**

---

## Melhorias Sugeridas

1. **Corrigir Logger**: Usar `ILogger<LoginController>` no construtor
2. **Remover BindProperty**: `AbastecimentoObj` não é usado neste controller
3. **Substituir Variável Global**: Usar Session ou Claims em vez de `Settings.GlobalVariables.gPontoUsuario`
4. **Validação Null**: Adicionar validação para `objUsuario == null`
5. **Cache**: Considerar cachear dados do usuário para reduzir queries ao banco

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do LoginController

**Arquivos Afetados**:
- `Controllers/LoginController.cs`

**Impacto**: Documentação de referência para recuperação de dados do usuário logado

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
