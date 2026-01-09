# Documentação: SmartNavigation.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Estrutura de Arquivos](#estrutura-de-arquivos)
4. [Estrutura do Model](#estrutura-do-model)
5. [Lógica de Negócio](#lógica-de-negócio)
6. [Interconexões](#interconexões)
7. [Frontend](#frontend)
8. [Exemplos de Uso](#exemplos-de-uso)
9. [Troubleshooting](#troubleshooting)

---

## Visão Geral

O Model `SmartNavigation` é a estrutura central do sistema de navegação do FrotiX. Ele representa a hierarquia completa do menu lateral da aplicação, carregando dados do arquivo `nav.json` e transformando-os em uma estrutura de objetos tipados que podem ser consumidos pelo ViewComponent de navegação.

**Principais características:**

✅ **Estrutura Hierárquica**: Suporta menus com múltiplos níveis (categoria, pai, filho, irmão)  
✅ **Serialização JSON**: Carrega dados do arquivo `nav.json` na raiz do projeto  
✅ **Integração com Controle de Acesso**: Filtra itens baseado em permissões do usuário  
✅ **Suporte a Ícones**: Integração com FontAwesome para ícones do menu  
✅ **Tipos de Item**: Diferencia entre categorias, itens únicos, pais, filhos e irmãos  
✅ **Roteamento Dinâmico**: Gera rotas automaticamente baseadas na estrutura do menu

### Objetivo

O `SmartNavigation` resolve o problema de criar um menu dinâmico e hierárquico que:
- Se adapta às permissões do usuário logado
- Mantém a estrutura visual consistente
- Permite fácil manutenção através do arquivo JSON
- Suporta múltiplos níveis de aninhamento
- Integra com o sistema de recursos e controle de acesso

---

## Arquitetura

### Tecnologias Utilizadas

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| ASP.NET Core | 5.0+ | Backend e ViewComponents |
| System.Text.Json | - | Serialização JSON |
| FontAwesome | 6.x | Ícones do menu |

### Padrões de Design

- **Builder Pattern**: `NavigationBuilder` constrói objetos `SmartNavigation` a partir de JSON
- **Composite Pattern**: `ListItem` pode conter outros `ListItem` (hierarquia)
- **Strategy Pattern**: Diferentes tipos de item (`ItemType`) têm comportamentos distintos

---

## Estrutura de Arquivos

### Arquivo Principal
```
Models/SmartNavigation.cs
```

### Arquivos Relacionados
- `Models/NavigationModel.cs` - Usa `SmartNavigation` para construir menu completo
- `Models/INavigationModel.cs` - Interface que retorna `SmartNavigation`
- `ViewComponents/NavigationViewComponent.cs` - Renderiza o menu usando `SmartNavigation`
- `nav.json` - Arquivo JSON com estrutura do menu
- `Pages/Shared/Components/Navigation/Default.cshtml` - View que renderiza o menu

---

## Estrutura do Model

### Classe Principal: `SmartNavigation`

```csharp
public sealed class SmartNavigation
{
    public SmartNavigation()
    {
    }

    public SmartNavigation(IEnumerable<ListItem> items)
    {
        Lists = new List<ListItem>(items);
    }

    public string Version { get; set; }
    public List<ListItem> Lists { get; set; } = new List<ListItem>();
}
```

**Propriedades:**
- `Version` (string): Versão da estrutura de navegação
- `Lists` (List<ListItem>): Lista de itens raiz do menu

### Classe: `ListItem`

```csharp
public class ListItem
{
    public string Icon { get; set; }
    public bool ShowOnSeed { get; set; } = true;
    public string Parent { get; set; }
    public string Title { get; set; }
    public string Text { get; set; }
    public string NomeMenu { get; set; }
    public string Href { get; set; }
    public ItemType Type { get; set; } = ItemType.Single;
    public string Route { get; set; }
    public string Tags { get; set; }
    public string I18n { get; set; }
    public bool Disabled { get; set; }
    public bool HasChild { get; set; }
    public List<ListItem> Items { set; get; } = new List<ListItem>();
    public Span Span { get; set; } = new Span();
    public string[] Roles { get; set; }
}
```

**Propriedades Principais:**
- `Icon` (string): Classe FontAwesome do ícone (ex: "fa-duotone fa-car")
- `Title` (string): Título exibido no menu
- `Text` (string): Texto alternativo (geralmente igual ao Title)
- `NomeMenu` (string): Identificador único usado para controle de acesso
- `Href` (string): URL ou caminho da página
- `Type` (ItemType): Tipo do item (Category, Single, Parent, Sibling, Child)
- `Route` (string): Rota gerada dinamicamente
- `Items` (List<ListItem>): Lista de subitens (hierarquia)
- `HasChild` (bool): Indica se tem filhos
- `ShowOnSeed` (bool): Se deve aparecer na navegação básica

### Classe: `Span`

```csharp
public sealed class Span
{
    public string Position { get; set; }
    public string Class { get; set; }
    public string Text { get; set; }

    public bool HasValue() => (Position?.Length ?? 0) + (Class?.Length ?? 0) + (Text?.Length ?? 0) > 0;
}
```

**Uso:** Badges ou labels adicionais no menu (ex: contador de notificações)

### Enum: `ItemType`

```csharp
public enum ItemType
{
    Category = 0,    // Categoria principal (sem link)
    Single,          // Item único (sem filhos)
    Parent,          // Item com filhos
    Sibling,         // Item irmão (mesmo nível)
    Child            // Item filho
}
```

### Classe Estática: `NavigationBuilder`

```csharp
internal static class NavigationBuilder
{
    private static JsonSerializerOptions DefaultSettings => SerializerSettings();

    private static JsonSerializerOptions SerializerSettings(bool indented = true)
    {
        var options = new JsonSerializerOptions
        {
            DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull,
            WriteIndented = indented,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        options.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));

        return options;
    }

    public static SmartNavigation FromJson(string json) => 
        JsonSerializer.Deserialize<SmartNavigation>(json, DefaultSettings);
}
```

**Função:** Converte string JSON em objeto `SmartNavigation` tipado.

---

## Lógica de Negócio

### Processo de Construção do Menu

O `SmartNavigation` é construído através do seguinte fluxo:

1. **Leitura do JSON**: `NavigationModel` lê o arquivo `nav.json`
2. **Deserialização**: `NavigationBuilder.FromJson()` converte JSON em `SmartNavigation`
3. **Processamento**: `NavigationModel.FillProperties()` processa cada item:
   - Verifica permissões do usuário através de `ControleAcesso`
   - Gera rotas dinamicamente
   - Define tipos de item baseado na hierarquia
   - Filtra itens sem permissão
4. **Retorno**: Retorna `SmartNavigation` processado para o ViewComponent

### Método: `NavigationBuilder.FromJson()`

**Localização**: Linha 32 do arquivo `Models/SmartNavigation.cs`

**Propósito**: Deserializa uma string JSON em objeto `SmartNavigation` tipado.

**Parâmetros**:
- `json` (string): String JSON contendo estrutura do menu

**Retorno**: `SmartNavigation` - Objeto de navegação populado

**Exemplo de Código**:
```csharp
// ✅ Exemplo de uso
var jsonText = File.ReadAllText("nav.json");
var navigation = NavigationBuilder.FromJson(jsonText);
// navigation.Lists agora contém todos os itens do menu
```

**Configurações de Serialização**:
- **CamelCase**: Propriedades em camelCase no JSON
- **IgnoreNull**: Ignora propriedades nulas
- **Indented**: JSON formatado (para debug)

### Tipos de Item e Comportamento

#### ItemType.Category (0)
- **Uso**: Categoria principal sem link próprio
- **Exemplo**: "Cadastros", "Relatórios"
- **Características**: 
  - Não tem `Href` próprio
  - Contém apenas subitens
  - Não é clicável diretamente

#### ItemType.Single (1)
- **Uso**: Item único sem filhos
- **Exemplo**: "Dashboard", "Configurações"
- **Características**:
  - Tem `Href` próprio
  - Não tem `Items`
  - `HasChild = false`

#### ItemType.Parent (2)
- **Uso**: Item com filhos
- **Exemplo**: "Veículos" → ["Listar", "Cadastrar"]
- **Características**:
  - Tem `Href` próprio
  - Tem `Items` populado
  - `HasChild = true`

#### ItemType.Sibling (3)
- **Uso**: Item irmão (mesmo nível que outro)
- **Características**:
  - Mesmo `Parent` que outros itens
  - Geralmente gerado automaticamente

#### ItemType.Child (4)
- **Uso**: Item filho de um Parent
- **Características**:
  - Tem `Parent` definido
  - Está dentro de `Items` de outro `ListItem`

---

## Interconexões

### Quem Chama Este Arquivo

#### 1. **NavigationModel.cs** → Constrói SmartNavigation

**Quando**: Sempre que o menu precisa ser renderizado  
**Por quê**: `NavigationModel` usa `NavigationBuilder.FromJson()` para carregar o menu

```csharp
// ✅ Código em NavigationModel.cs
private static SmartNavigation BuildNavigation(bool seedOnly = true)
{
    var jsonText = File.ReadAllText("nav.json");
    var navigation = NavigationBuilder.FromJson(jsonText); // ← USA SmartNavigation
    var menu = FillProperties(navigation.Lists, seedOnly);
    return new SmartNavigation(menu);
}
```

#### 2. **NavigationViewComponent.cs** → Renderiza Menu

**Quando**: Usuário acessa qualquer página  
**Por quê**: ViewComponent precisa do `SmartNavigation` para renderizar o menu lateral

```csharp
// ✅ Código em NavigationViewComponent.cs
public IViewComponentResult Invoke()
{
    var items = _navigationModel.Full; // ← Retorna SmartNavigation
    return View(items);
}
```

#### 3. **Pages/Shared/Components/Navigation/Default.cshtml** → Exibe Menu

**Quando**: Renderização da view  
**Por quê**: View recebe `SmartNavigation` e itera sobre `Lists` para criar HTML

```razor
@model SmartNavigation

@foreach (var item in Model.Lists)
{
    <li>
        <a href="@item.Route">
            <i class="@item.Icon"></i>
            <span>@item.Title</span>
        </a>
        @if (item.Items.Any())
        {
            <ul>
                @foreach (var subItem in item.Items)
                {
                    <!-- Renderiza subitens -->
                }
            </ul>
        }
    </li>
}
```

### O Que Este Arquivo Usa

- **System.Text.Json**: Para deserialização JSON
- **nav.json**: Arquivo de configuração do menu

### Fluxo de Dados

```
nav.json (arquivo)
    ↓
NavigationBuilder.FromJson() ← SmartNavigation.cs
    ↓
SmartNavigation (objeto)
    ↓
NavigationModel.BuildNavigation()
    ↓
NavigationModel.FillProperties() (filtra por permissões)
    ↓
SmartNavigation (processado)
    ↓
NavigationViewComponent.Invoke()
    ↓
View (Default.cshtml)
    ↓
HTML renderizado no navegador
```

---

## Frontend

### Estrutura HTML Gerada

O `SmartNavigation` é transformado em HTML através da view `Default.cshtml`:

```html
<nav class="page-sidebar">
    <ul class="nav-menu">
        <!-- Para cada item em SmartNavigation.Lists -->
        <li class="nav-item">
            <a href="/Veiculo/Index" class="nav-link">
                <i class="fa-duotone fa-car"></i>
                <span>Veículos</span>
            </a>
            
            <!-- Se tem filhos -->
            <ul class="nav-submenu">
                <li>
                    <a href="/Veiculo/Create">Cadastrar</a>
                </li>
                <li>
                    <a href="/Veiculo/Index">Listar</a>
                </li>
            </ul>
        </li>
    </ul>
</nav>
```

### JavaScript (se aplicável)

O menu pode ter interações JavaScript para:
- Expandir/colapsar subitens
- Destacar item ativo
- Busca no menu

---

## Exemplos de Uso

### Cenário 1: Carregar Menu Completo

**Situação**: Usuário acessa o sistema e precisa ver o menu lateral

**Código**:
```csharp
// ✅ Em NavigationViewComponent.cs
public IViewComponentResult Invoke()
{
    var navigation = _navigationModel.Full; // Retorna SmartNavigation
    return View(navigation);
}
```

**Resultado**: Menu lateral renderizado com todos os itens permitidos ao usuário

### Cenário 2: Carregar Menu Básico (Seed)

**Situação**: Página inicial precisa apenas de itens essenciais

**Código**:
```csharp
// ✅ Em NavigationModel.cs
public SmartNavigation Seed => BuildNavigation(); // seedOnly = true por padrão
```

**Resultado**: Apenas itens com `ShowOnSeed = true` são incluídos

### Cenário 3: Adicionar Novo Item ao Menu

**Situação**: Desenvolvedor quer adicionar nova página ao menu

**Passos**:
1. Abrir `nav.json`
2. Adicionar novo objeto na estrutura:
```json
{
  "icon": "fa-duotone fa-chart-line",
  "title": "Estatísticas",
  "nomeMenu": "estatisticas_index",
  "href": "estatisticas_index.html",
  "showOnSeed": true
}
```
3. Criar recurso no banco com `NomeMenu = "estatisticas_index"`
4. Conceder permissão aos usuários necessários
5. O menu será atualizado automaticamente

**Resultado**: Novo item aparece no menu para usuários com permissão

---

## Troubleshooting

### Problema: Menu não aparece

**Sintoma**: Menu lateral está vazio ou não renderiza

**Causa Possível 1**: Arquivo `nav.json` não encontrado ou inválido

**Diagnóstico**:
```csharp
// Verificar se arquivo existe
var exists = File.Exists("nav.json");
// Verificar se JSON é válido
try {
    var json = File.ReadAllText("nav.json");
    var nav = NavigationBuilder.FromJson(json);
} catch (JsonException ex) {
    // JSON inválido
}
```

**Solução**: 
1. Verificar se `nav.json` existe na raiz do projeto
2. Validar sintaxe JSON (usar validador online)
3. Verificar encoding do arquivo (deve ser UTF-8)

**Causa Possível 2**: Usuário não tem permissão para nenhum item

**Diagnóstico**:
```csharp
// Verificar permissões do usuário
var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
var recursos = _unitOfWork.ControleAcesso
    .GetAll(c => c.UsuarioId == userId && c.Acesso == true);
```

**Solução**: Conceder permissões ao usuário através de `ControleAcesso`

**Código Relacionado**: `NavigationModel.FillProperties()` linha 43-132

---

### Problema: Ícones não aparecem

**Sintoma**: Menu renderiza mas ícones FontAwesome não são exibidos

**Causa**: Classe CSS do ícone incorreta ou FontAwesome não carregado

**Diagnóstico**:
```html
<!-- Verificar se FontAwesome está carregado -->
<link rel="stylesheet" href="~/css/fontawesome.min.css">
```

**Solução**: 
1. Verificar se FontAwesome está incluído no `_Layout.cshtml`
2. Verificar formato da classe no JSON (ex: "fa-duotone fa-car")
3. Verificar versão do FontAwesome (deve ser 6.x)

---

### Problema: Rotas não funcionam

**Sintoma**: Clicar no menu não navega para a página

**Causa**: Propriedade `Route` não foi gerada corretamente

**Diagnóstico**:
```csharp
// Verificar como Route é gerada em NavigationModel.cs
var route = Path.GetFileNameWithoutExtension(sanitizedHref ?? Empty)
    ?.Split(Underscore) ?? Array.Empty<string>();

item.Route = route.Length > 1
    ? $"/{route.First()}/{string.Join(Empty, route.Skip(1))}"
    : item.Href;
```

**Solução**: 
1. Verificar formato do `Href` no JSON (ex: "veiculo_index.html")
2. Verificar se rota existe no sistema de rotas do ASP.NET Core
3. Verificar se página existe no caminho correto

---

### Problema: Subitens não aparecem

**Sintoma**: Item pai aparece mas filhos não são exibidos

**Causa**: `HasChild` não está sendo definido ou `Items` está vazio

**Diagnóstico**:
```csharp
// Verificar se Items está populado
if (item.Items.Any())
{
    item.HasChild = true;
    item.Type = ItemType.Parent;
}
```

**Solução**: 
1. Verificar estrutura JSON (subitens devem estar em array `items`)
2. Verificar se `FillProperties()` está processando recursivamente
3. Verificar permissões dos subitens

---

## Validações

### Validação de JSON

O `NavigationBuilder` não valida o JSON antes de deserializar. Se o JSON estiver malformado, uma `JsonException` será lançada.

**Recomendação**: Validar JSON antes de usar em produção:

```csharp
try
{
    var navigation = NavigationBuilder.FromJson(jsonText);
}
catch (JsonException ex)
{
    // Log do erro
    _logger.LogError(ex, "Erro ao deserializar nav.json");
    // Retornar menu vazio ou padrão
    return new SmartNavigation();
}
```

### Validação de Permissões

O `NavigationModel.FillProperties()` valida permissões através de:
1. Busca `Recurso` pelo `NomeMenu`
2. Verifica `ControleAcesso` para o usuário atual
3. Filtra itens sem permissão

**Código de Validação**:
```csharp
var ObjRecurso = _currentUnitOfWork.Recurso.GetFirstOrDefault(ca =>
    ca.NomeMenu == item.NomeMenu
);

if (ObjRecurso == null)
    continue; // Recurso não encontrado, pula item

var objControleAcesso = _currentUnitOfWork.ControleAcesso.GetFirstOrDefault(
    ca => ca.UsuarioId == userId && ca.RecursoId == recursoId
);

if (objControleAcesso != null && objControleAcesso.Acesso)
{
    // Item tem permissão, adiciona ao menu
    result.Add(item);
}
```

---

## Notas Importantes

1. **Arquivo nav.json**: Deve estar na raiz do projeto e ser válido JSON
2. **Permissões**: Itens sem permissão não aparecem no menu
3. **Hierarquia**: Suporta até níveis de aninhamento (teoricamente ilimitado)
4. **Performance**: Menu é construído a cada requisição (considerar cache se necessário)
5. **Fallback**: Se banco de dados falhar, sistema usa `nav.json` como fallback

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação de documentação extensiva do modelo `SmartNavigation` seguindo padrão FrotiX

**Arquivos Afetados**:
- `Documentacao/Models/SmartNavigation.md` (criado)

**Impacto**: Documentação completa do sistema de navegação para facilitar manutenção e entendimento

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

- [Documentação NavigationModel](./NavigationModel.md)
- [Documentação INavigationModel](./INavigationModel.md)
- [Documentação RecursoTreeDTO](./RecursoTreeDTO.md)
- [Documentação Pages/Administracao - GestaoRecursosNavegacao](../Pages/Administracao%20-%20GestaoRecursosNavegacao.md)

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
