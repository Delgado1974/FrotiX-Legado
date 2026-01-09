# Documentação: ContractDropDownItem.cs

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

O Model `ContractDropDownItem` é uma **classe DTO (Data Transfer Object) simples** usada para representar itens de dropdown de contratos em formato padronizado com propriedades `Value` e `Text`.

**Principais objetivos:**

✅ Padronizar estrutura de dados para dropdowns de contratos  
✅ Facilitar serialização JSON para requisições AJAX  
✅ Simplificar criação de listas `<select>` em páginas Razor  
✅ Garantir compatibilidade com componentes Syncfusion EJ2

---

## 📁 Arquivos Envolvidos

### Arquivo Principal
- **`Models/ContractDropDownItem.cs`** - DTO simples para dropdowns

### Arquivos que Utilizam
- **`Controllers/ContratoController.cs`** - Endpoints que retornam listas de contratos
- **`Controllers/ItensContratoController.cs`** - Listagem de contratos para página ItensContrato
- **`Repository/ContratoRepository.cs`** - Método `GetDropDown()` que pode retornar este formato
- **`Pages/Contrato/*.cshtml`** - Páginas que exibem dropdowns de contratos
- **`Pages/Empenho/*.cshtml`** - Páginas que precisam selecionar contratos

---

## 🏗️ Estrutura do Model

```csharp
namespace FrotiX.Models
{
    public sealed class ContractDropDownItem
    {
        public string Value { get; set; }
        public string Text { get; set; }
    }
}
```

**Características:**
- ✅ Classe `sealed` - Não pode ser herdada (otimização de performance)
- ✅ Propriedades simples `Value` e `Text` - Padrão HTML `<select>`
- ✅ Sem validações - DTO puro para transferência de dados
- ✅ Sem mapeamento para banco - Não é uma entidade Entity Framework

---

## 🔗 Quem Chama e Por Quê

### 1. **ContratoController.cs** → Retorna Lista de Contratos

**Quando:** Endpoint chamado via AJAX para popular dropdown  
**Por quê:** Páginas precisam de lista de contratos em formato padronizado

```csharp
[Route("ListaContratosPorStatus")]
[HttpGet]
public IActionResult ListaContratosPorStatus(int status)
{
    bool statusBool = status == 1;
    
    var result = (
        from c in _unitOfWork.Contrato.GetAll()
        where c.Status == statusBool
        orderby c.AnoContrato descending, c.NumeroContrato descending
        select new ContractDropDownItem // ✅ Usa o DTO
        {
            Value = c.ContratoId.ToString(),
            Text = c.AnoContrato + "/" + c.NumeroContrato + " - " + c.Objeto
        }
    ).ToList();
    
    return Json(new { data = result });
}
```

### 2. **ItensContratoController.cs** → Lista Contratos para Página ItensContrato

**Quando:** Página `/Contrato/ItensContrato` carrega dropdown de contratos  
**Por quê:** Usuário precisa selecionar um contrato para ver/gerenciar seus itens

```csharp
[HttpGet]
[Route("ListaContratos")]
public IActionResult ListaContratos(bool status = true)
{
    var contratos = _unitOfWork.Contrato
        .GetAll(c => c.Status == status)
        .OrderByDescending(c => c.AnoContrato)
        .ThenByDescending(c => c.NumeroContrato)
        .Select(c => new ContractDropDownItem // ✅ Usa o DTO
        {
            Value = c.ContratoId.ToString(),
            Text = $"{c.AnoContrato}/{c.NumeroContrato} - {c.Objeto}"
        })
        .ToList();
    
    return Json(new { data = contratos });
}
```

### 3. **Páginas Razor** → Consome via JavaScript

**Quando:** Página carrega e precisa popular dropdown  
**Por quê:** Interface do usuário precisa de lista de contratos

```javascript
// ✅ Exemplo em JavaScript
function loadContratos() {
    $.ajax({
        url: '/api/contrato/listacontratosporsstatus?status=1',
        success: function(response) {
            var select = $('#contratoSelect');
            select.empty();
            
            // ✅ Preenche dropdown com dados do DTO
            $.each(response.data, function(index, item) {
                select.append(
                    $('<option></option>')
                        .attr('value', item.value) // ✅ Value do DTO
                        .text(item.text)            // ✅ Text do DTO
                );
            });
        }
    });
}
```

---

## 🛠️ Problema → Solução → Código

### Problema: Formato Inconsistente de Dados para Dropdowns

**Problema:** Diferentes endpoints retornavam contratos em formatos diferentes (objetos anônimos, arrays diferentes, propriedades com nomes diferentes), dificultando o consumo no frontend.

**Solução:** Criar uma classe DTO padronizada (`ContractDropDownItem`) que todos os endpoints usam para retornar dados de contratos em formato consistente.

**Código:**

```csharp
// ✅ ANTES: Formato inconsistente
// Endpoint 1 retornava:
return Json(new { 
    contratoId = c.ContratoId, 
    descricao = $"{c.AnoContrato}/{c.NumeroContrato}" 
});

// Endpoint 2 retornava:
return Json(new { 
    id = c.ContratoId.ToString(), 
    nome = c.Objeto 
});

// ✅ DEPOIS: Formato padronizado com DTO
public IActionResult ListaContratos()
{
    var result = _unitOfWork.Contrato
        .GetAll()
        .Select(c => new ContractDropDownItem // ✅ Sempre mesmo formato
        {
            Value = c.ContratoId.ToString(), // ✅ Sempre "Value"
            Text = $"{c.AnoContrato}/{c.NumeroContrato} - {c.Objeto}" // ✅ Sempre "Text"
        })
        .ToList();
    
    return Json(new { data = result });
}
```

### Problema: Compatibilidade com Syncfusion DropDownList

**Problema:** Componentes Syncfusion EJ2 DropDownList esperam objetos com propriedades `Value` e `Text`, mas os endpoints retornavam formatos diferentes.

**Solução:** Usar `ContractDropDownItem` que já segue o padrão esperado pelo Syncfusion.

**Código:**

```csharp
// ✅ Em página Razor com Syncfusion
@Html.EJS().DropDownList("contratoDropDown")
    .DataSource(Model.Contratos) // ✅ Lista de ContractDropDownItem
    .Fields(new Syncfusion.EJ2.DropDowns.DropDownListFieldSettings 
    { 
        Value = "Value",  // ✅ Propriedade Value do DTO
        Text = "Text"     // ✅ Propriedade Text do DTO
    })
    .Render()
```

---

## 🔄 Fluxo de Funcionamento

### Fluxo: Carregamento de Dropdown de Contratos

```
1. Usuário acessa página que precisa de dropdown de contratos
   ↓
2. JavaScript chama endpoint (ex: /api/contrato/listacontratosporsstatus?status=1)
   ↓
3. Controller busca contratos do banco via Repository
   ↓
4. Controller projeta para ContractDropDownItem:
   ├─ Value = ContratoId (Guid convertido para string)
   └─ Text = "Ano/Numero - Objeto"
   ↓
5. Retorna JSON: { data: [ContractDropDownItem, ...] }
   ↓
6. JavaScript recebe resposta e preenche <select> ou Syncfusion DropDownList
   ↓
7. Usuário seleciona contrato → Value (ContratoId) é usado em requisições subsequentes
```

---

## 🔍 Troubleshooting

### Erro: Dropdown vazio após carregar

**Causa:** Endpoint retornando dados em formato diferente do esperado.

**Solução:**
```javascript
// ✅ Verificar formato da resposta
console.log(response); // Deve ter estrutura: { data: [{ value: "...", text: "..." }] }

// ✅ Verificar se está usando ContractDropDownItem no Controller
var result = contratos.Select(c => new ContractDropDownItem
{
    Value = c.ContratoId.ToString(), // ✅ Deve ser "Value" (maiúscula)
    Text = $"{c.AnoContrato}/{c.NumeroContrato}" // ✅ Deve ser "Text" (maiúscula)
}).ToList();
```

### Erro: Syncfusion DropDownList não exibe texto

**Causa:** Configuração de `Fields` incorreta ou propriedades com nomes diferentes.

**Solução:**
```csharp
// ✅ Garantir que Fields aponta para propriedades corretas
.Fields(new DropDownListFieldSettings 
{ 
    Value = "Value", // ✅ Deve corresponder à propriedade do DTO
    Text = "Text"    // ✅ Deve corresponder à propriedade do DTO
})
```

### Erro: Value é Guid mas precisa ser string

**Causa:** `ContractDropDownItem.Value` é `string`, mas `ContratoId` é `Guid`.

**Solução:**
```csharp
// ✅ Sempre converter Guid para string
Value = c.ContratoId.ToString() // ✅ Converte Guid → string
```

---

## 📊 Endpoints API Resumidos

| Método | Rota | Retorna ContractDropDownItem? |
|--------|------|-------------------------------|
| `GET` | `/api/contrato/listacontratosporsstatus?status={int}` | ✅ Sim |
| `GET` | `/api/itenscontrato/listacontratos?status={bool}` | ✅ Sim |

---

## 📝 Notas Importantes

1. **Classe `sealed`** - Não pode ser herdada, otimizando performance do .NET.

2. **Sem validações** - É um DTO puro, validações devem ser feitas na entidade `Contrato` antes de criar o DTO.

3. **Propriedades públicas** - Necessário para serialização JSON.

4. **Formato padronizado** - Todos os endpoints devem usar este formato para garantir consistência.

5. **Não é entidade EF** - Não tem `[Key]`, `[Table]`, nem é registrado no `DbContext`.

---

**📅 Documentação criada em:** 08/01/2026  
**🔄 Última atualização:** 08/01/2026
