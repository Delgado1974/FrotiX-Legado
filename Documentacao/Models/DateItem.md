# Documentação: DateItem.cs

**📅 Última Atualização:** 08/01/2026  
**📋 Versão:** 2.0 (Padrão FrotiX Simplificado)

---

## 📋 Índice

1. [Objetivos](#objetivos)
2. [Arquivos Envolvidos](#arquivos-envolvidos)
3. [Estrutura do Model](#estrutura-do-model)
4. [Quem Chama e Por Quê](#quem-chama-e-por-quê)
5. [Problema → Solução → Código](#problema--solução--código)
6. [Fluxo de Funcionamento](#fluxo-de-funcionamento)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Objetivos

O Model `DateItem` é uma **classe DTO simples** usada para representar itens de data em formato padronizado com propriedades `Text` e `Value`, geralmente usado em dropdowns de seleção de datas ou períodos.

**Principais objetivos:**

✅ Padronizar estrutura de dados para dropdowns de datas  
✅ Facilitar serialização JSON para requisições AJAX  
✅ Simplificar criação de listas de períodos (meses, anos, etc.)  
✅ Garantir compatibilidade com componentes Syncfusion EJ2

---

## 📁 Arquivos Envolvidos

### Arquivo Principal
- **`Models/DateItem.cs`** - DTO simples para itens de data

### Arquivos que Utilizam
- **`Controllers/DashboardEventosController.cs`** - Lista de anos/meses disponíveis
- **`Controllers/DashboardViagensController.cs`** - Períodos para filtros
- **`Controllers/DashboardLavagemController.cs`** - Seleção de períodos
- **`Pages/*/Dashboard*.cshtml`** - Páginas de dashboard que precisam selecionar períodos

---

## 🏗️ Estrutura do Model

```csharp
namespace FrotiX.Models
{
    public class DateItem
    {
        public string Text { get; set; }
        public string Value { get; set; }
    }
}
```

**Características:**
- ✅ Classe simples - Sem herança ou interfaces
- ✅ Propriedades `Text` e `Value` - Padrão para dropdowns
- ✅ Sem validações - DTO puro para transferência de dados
- ✅ Sem mapeamento para banco - Não é uma entidade Entity Framework

**Diferença com `ContractDropDownItem`:**
- `ContractDropDownItem` tem `Value` primeiro, `DateItem` tem `Text` primeiro
- Ambos servem para dropdowns, mas `DateItem` é mais genérico para datas/períodos

---

## 🔗 Quem Chama e Por Quê

### 1. **DashboardEventosController.cs** → Lista Anos Disponíveis

**Quando:** Dashboard de eventos precisa de dropdown de anos  
**Por quê:** Usuário precisa filtrar eventos por ano

```csharp
[HttpGet]
[Route("api/DashboardEventos/ObterAnosDisponiveis")]
public async Task<IActionResult> ObterAnosDisponiveis()
{
    var anos = await _context.Evento
        .Where(e => e.DataInicial.HasValue)
        .Select(e => e.DataInicial.Value.Year)
        .Distinct()
        .OrderByDescending(a => a)
        .Select(a => new DateItem // ✅ Usa o DTO
        {
            Text = a.ToString(),      // ✅ Text = "2025"
            Value = a.ToString()      // ✅ Value = "2025"
        })
        .ToListAsync();
    
    return Json(new { data = anos });
}
```

### 2. **DashboardViagensController.cs** → Lista Meses do Ano

**Quando:** Dashboard de viagens precisa de dropdown de meses  
**Por quê:** Usuário precisa filtrar viagens por mês

```csharp
[HttpGet]
[Route("api/DashboardViagens/ObterMesesDisponiveis")]
public async Task<IActionResult> ObterMesesDisponiveis(int ano)
{
    var meses = new List<DateItem>();
    
    for (int mes = 1; mes <= 12; mes++)
    {
        meses.Add(new DateItem // ✅ Usa o DTO
        {
            Text = CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(mes), // ✅ "Janeiro"
            Value = mes.ToString("00") // ✅ "01"
        });
    }
    
    return Json(new { data = meses });
}
```

### 3. **Páginas Razor** → Consome via JavaScript

**Quando:** Página carrega e precisa popular dropdown de períodos  
**Por quê:** Interface do usuário precisa de lista de datas/períodos

```javascript
// ✅ Exemplo em JavaScript
function loadAnos() {
    $.ajax({
        url: '/api/dashboardeventos/obteranosdisponiveis',
        success: function(response) {
            var select = $('#anoSelect');
            select.empty();
            
            // ✅ Preenche dropdown com dados do DTO
            $.each(response.data, function(index, item) {
                select.append(
                    $('<option></option>')
                        .attr('value', item.value) // ✅ Value do DTO
                        .text(item.text)           // ✅ Text do DTO
                );
            });
        }
    });
}
```

---

## 🛠️ Problema → Solução → Código

### Problema: Formato Inconsistente para Listas de Datas

**Problema:** Diferentes endpoints retornavam datas/períodos em formatos diferentes (arrays de strings, objetos anônimos, propriedades diferentes), dificultando o consumo no frontend.

**Solução:** Criar uma classe DTO padronizada (`DateItem`) que todos os endpoints usam para retornar dados de datas/períodos em formato consistente.

**Código:**

```csharp
// ✅ ANTES: Formato inconsistente
// Endpoint 1 retornava:
return Json(new { anos = new[] { "2025", "2024", "2023" } });

// Endpoint 2 retornava:
return Json(new { 
    meses = new[] { 
        new { nome = "Janeiro", numero = 1 },
        new { nome = "Fevereiro", numero = 2 }
    }
});

// ✅ DEPOIS: Formato padronizado com DTO
public IActionResult ObterAnosDisponiveis()
{
    var anos = _context.Evento
        .Select(e => e.DataInicial.Value.Year)
        .Distinct()
        .OrderByDescending(a => a)
        .Select(a => new DateItem // ✅ Sempre mesmo formato
        {
            Text = a.ToString(),  // ✅ Sempre "Text"
            Value = a.ToString()   // ✅ Sempre "Value"
        })
        .ToList();
    
    return Json(new { data = anos });
}
```

### Problema: Compatibilidade com Componentes de Data

**Problema:** Componentes Syncfusion DatePicker e DropDownList esperam objetos com propriedades `Text` e `Value`, mas os endpoints retornavam formatos diferentes.

**Solução:** Usar `DateItem` que já segue o padrão esperado pelos componentes.

**Código:**

```csharp
// ✅ Em página Razor com Syncfusion
@Html.EJS().DropDownList("mesDropDown")
    .DataSource(Model.Meses) // ✅ Lista de DateItem
    .Fields(new Syncfusion.EJ2.DropDowns.DropDownListFieldSettings 
    { 
        Value = "Value",  // ✅ Propriedade Value do DTO
        Text = "Text"     // ✅ Propriedade Text do DTO
    })
    .Render()
```

---

## 🔄 Fluxo de Funcionamento

### Fluxo: Carregamento de Dropdown de Períodos

```
1. Usuário acessa dashboard que precisa de dropdown de períodos
   ↓
2. JavaScript chama endpoint (ex: /api/dashboardeventos/obteranosdisponiveis)
   ↓
3. Controller busca dados do banco (ex: anos distintos de eventos)
   ↓
4. Controller projeta para DateItem:
   ├─ Text = Descrição legível (ex: "2025" ou "Janeiro")
   └─ Value = Valor para processamento (ex: "2025" ou "01")
   ↓
5. Retorna JSON: { data: [DateItem, ...] }
   ↓
6. JavaScript recebe resposta e preenche <select> ou Syncfusion DropDownList
   ↓
7. Usuário seleciona período → Value é usado em filtros de consultas
```

---

## 🔍 Troubleshooting

### Erro: Dropdown vazio após carregar

**Causa:** Endpoint retornando dados em formato diferente do esperado.

**Solução:**
```javascript
// ✅ Verificar formato da resposta
console.log(response); // Deve ter estrutura: { data: [{ text: "...", value: "..." }] }

// ✅ Verificar se está usando DateItem no Controller
var result = anos.Select(a => new DateItem
{
    Text = a.ToString(),  // ✅ Deve ser "Text"
    Value = a.ToString()   // ✅ Deve ser "Value"
}).ToList();
```

### Erro: Text e Value com valores diferentes

**Causa:** Necessidade de formatar Text de forma legível enquanto Value mantém formato técnico.

**Solução:**
```csharp
// ✅ Exemplo: Meses com Text formatado e Value numérico
var meses = new List<DateItem>();
for (int mes = 1; mes <= 12; mes++)
{
    meses.Add(new DateItem
    {
        Text = CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(mes), // ✅ "Janeiro"
        Value = mes.ToString("00") // ✅ "01"
    });
}
```

### Erro: Ordem incorreta dos itens

**Causa:** Falta de ordenação na query.

**Solução:**
```csharp
// ✅ Sempre ordenar antes de projetar para DateItem
var anos = _context.Evento
    .Select(e => e.DataInicial.Value.Year)
    .Distinct()
    .OrderByDescending(a => a) // ✅ Ordenar antes
    .Select(a => new DateItem { ... })
    .ToList();
```

---

## 📊 Endpoints API Resumidos

| Método | Rota | Retorna DateItem? |
|--------|------|-------------------|
| `GET` | `/api/dashboardeventos/obteranosdisponiveis` | ✅ Sim |
| `GET` | `/api/dashboardviagens/obtermesesdisponiveis?ano={int}` | ✅ Sim |
| `GET` | `/api/dashboardlavagem/obterperiodos` | ✅ Sim |

---

## 📝 Notas Importantes

1. **Sem validações** - É um DTO puro, validações devem ser feitas antes de criar o DTO.

2. **Propriedades públicas** - Necessário para serialização JSON.

3. **Formato padronizado** - Todos os endpoints devem usar este formato para garantir consistência.

4. **Não é entidade EF** - Não tem `[Key]`, `[Table]`, nem é registrado no `DbContext`.

5. **Uso genérico** - Pode ser usado para qualquer tipo de item de data/período (anos, meses, dias, etc.).

---

**📅 Documentação criada em:** 08/01/2026  
**🔄 Última atualização:** 08/01/2026
