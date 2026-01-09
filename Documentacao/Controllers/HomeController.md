# Documentação: HomeController.cs

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

O `HomeController` é um controller de exemplo/teste usado para demonstrar funcionalidades de Syncfusion DataGrid. Não é um controller crítico para o sistema FrotiX, mas serve como referência para implementações de grids e operações CRUD básicas.

**Principais características:**

✅ **Controller de Exemplo**: Usado para testes e demonstrações  
✅ **Syncfusion DataGrid**: Demonstra uso de DataGrid com operações CRUD  
✅ **Dados Mock**: Usa classe `OrdersDetails` com dados fictícios  
✅ **API Controller**: Implementa padrão API Controller do ASP.NET Core

**⚠️ IMPORTANTE**: Este controller não gerencia funcionalidades reais do sistema FrotiX. É usado apenas para testes e exemplos de implementação.

---

## Arquitetura

### Tecnologias Utilizadas

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| ASP.NET Core | 3.1+ | Framework base |
| Syncfusion EJ2 | - | Componentes DataGrid |
| JSON | - | Serialização de dados |

### Padrões de Design

- **API Controller Pattern**: Usa `[ApiController]` e `[Route("api/[controller]")]`
- **IgnoreAntiforgeryToken**: Desabilita validação de token CSRF (apenas para testes)
- **Padrão de Retorno**: Retorna JSON para todas as operações

---

## Estrutura de Arquivos

### Arquivo Principal
```
Controllers/HomeController.cs
```

### Arquivos Relacionados
- Nenhum arquivo JavaScript específico chama este controller
- Páginas de teste podem usar este controller para exemplos

---

## Endpoints API

### GET `/api/Home`

**Descrição**: Retorna a view padrão (não usado em produção)

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
        Alerta.TratamentoErroComLinha("HomeController.cs", "Index", error);
        return View(); // padronizado
    }
}
```

**Quando é chamado**: Raramente usado, apenas para testes

---

### GET `/api/Home/DataSource`

**Descrição**: Retorna todos os registros de `OrdersDetails` como JSON

**Parâmetros**: Nenhum

**Response**:
```json
[
  {
    "orderid": 10001,
    "customerid": "ALFKI",
    "employeeid": 1,
    "freight": 2.3,
    "orderdate": "1991-05-15T00:00:00",
    "shipcity": "Berlin",
    "shipname": "Simons bistro",
    "shipcountry": "Denmark",
    "shippeddate": "1996-07-16T00:00:00",
    "shipaddress": "Kirchgasse 6",
    "verified": false
  }
]
```

**Código Fonte**:
```csharp
[Route("DataSource")]
[HttpGet]
public IActionResult DataSource()
{
    try
    {
        var order = OrdersDetails.GetAllRecords();
        return Json(order);
    }
    catch (Exception error)
    {
        Alerta.TratamentoErroComLinha("HomeController.cs", "DataSource", error);
        return View(); // padronizado
    }
}
```

**Uso**: Fornece dados para Syncfusion DataGrid em páginas de teste

---

### POST `/api/Home/UrlDatasource`

**Descrição**: Retorna dados paginados para Syncfusion DataGrid com suporte a contagem total

**Request Body**:
```json
{
  "requiresCounts": true,
  "skip": 0,
  "take": 10
}
```

**Parâmetros**:
- `requiresCounts` (bool): Se true, retorna contagem total junto com dados
- `skip` (int): Número de registros a pular (paginação)
- `take` (int): Número de registros a retornar

**Response com contagem**:
```json
{
  "result": [...],  // Array de registros paginados
  "count": 45       // Total de registros
}
```

**Response sem contagem**:
```json
[...]  // Array completo de registros
```

**Código Fonte**:
```csharp
public IActionResult UrlDatasource([FromBody] Data dm)
{
    try
    {
        var order = OrdersDetails.GetAllRecords();
        var Data = order.ToList();
        int count = order.Count();
        return dm.requiresCounts
            ? Json(new
            {
                result = Data.Skip(dm.skip).Take(dm.take),
                count = count
            })
            : Json(Data);
    }
    catch (Exception error)
    {
        Alerta.TratamentoErroComLinha("HomeController.cs", "UrlDatasource", error);
        return View(); // padronizado
    }
}
```

**Uso**: Endpoint padrão para Syncfusion DataGrid com paginação server-side

---

### POST `/api/Home/CrudUpdate`

**Descrição**: Realiza operações CRUD (Create, Update) em registros de `OrdersDetails`

**Request Body**:
```json
{
  "action": "update",  // ou "insert"
  "value": {
    "orderid": 10001,
    "customerid": "ALFKI",
    "employeeid": 1,
    "freight": 2.3,
    "orderdate": "1991-05-15T00:00:00",
    "shipcity": "Berlin",
    "shipcountry": "Denmark"
  }
}
```

**Parâmetros**:
- `action` (string): "update" ou "insert"
- `value` (OrdersDetails): Objeto com dados a atualizar/inserir

**Response**:
```json
{
  "orderid": 10001,
  "customerid": "ALFKI",
  ...
}
```

**Código Fonte**:
```csharp
public ActionResult CrudUpdate([FromBody] CRUDModel<OrdersDetails> value)
{
    try
    {
        if (value.action == "update")
        {
            var ord = value.value;
            OrdersDetails val = OrdersDetails
                .GetAllRecords()
                .Where(or => or.orderid == ord.orderid)
                .FirstOrDefault();
            val.orderid = ord.orderid;
            val.employeeid = ord.employeeid;
            val.customerid = ord.customerid;
            val.freight = ord.freight;
            val.orderdate = ord.orderdate;
            val.shipcity = ord.shipcity;
            val.shipcountry = ord.shipcountry;
        }
        else if (value.action == "insert")
        {
            OrdersDetails.GetAllRecords().Insert(0, value.value);
        }
        return Json(value.value);
    }
    catch (Exception error)
    {
        Alerta.TratamentoErroComLinha("HomeController.cs", "CrudUpdate", error);
        return View(); // padronizado
    }
}
```

**Uso**: Operações CRUD para Syncfusion DataGrid inline editing

---

## Lógica de Negócio

### Classe: `OrdersDetails`

Classe auxiliar que simula uma tabela de pedidos com dados fictícios.

**Propriedades**:
- `orderid` (int?): ID do pedido
- `customerid` (string): ID do cliente
- `employeeid` (int?): ID do funcionário
- `freight` (double?): Valor do frete
- `orderdate` (DateTime): Data do pedido
- `shipcity` (string): Cidade de entrega
- `shipname` (string): Nome do navio/transportadora
- `shipcountry` (string): País de entrega
- `shippeddate` (DateTime): Data de envio
- `shipaddress` (string): Endereço de entrega
- `verified` (bool): Se pedido foi verificado

**Método Estático: `GetAllRecords()`**

Gera dados fictícios se a lista estiver vazia:

```csharp
public static List<OrdersDetails> GetAllRecords()
{
    if (order.Count() == 0)
    {
        int code = 10000;
        for (int i = 1; i < 10; i++)
        {
            // Gera 5 registros por iteração
            // Total: 45 registros fictícios
            order.Add(new OrdersDetails(...));
            // ... mais 4 registros
            code += 5;
        }
    }
    return order;
}
```

**⚠️ IMPORTANTE**: Dados são armazenados em memória (`static List<OrdersDetails> order`). Não persistem entre reinicializações do servidor.

---

### Classe: `Data`

DTO para requisições de paginação:

```csharp
public class Data
{
    public bool requiresCounts { get; set; }
    public int skip { get; set; }
    public int take { get; set; }
}
```

---

### Classe: `CRUDModel<T>`

Model genérico para operações CRUD do Syncfusion:

```csharp
public class CRUDModel<T> where T : class
{
    public string action { get; set; }      // "insert", "update", "remove"
    public string table { get; set; }
    public string keyColumn { get; set; }
    public object key { get; set; }
    public T value { get; set; }
    public List<T> added { get; set; }
    public List<T> changed { get; set; }
    public List<T> deleted { get; set; }
    public IDictionary<string, object> @params { get; set; }
}
```

---

## Interconexões

### Quem Chama Este Controller

- **Páginas de Teste**: Páginas de exemplo/teste podem usar este controller
- **Desenvolvedores**: Usado como referência para implementação de DataGrids

### O Que Este Controller Chama

- **`OrdersDetails.GetAllRecords()`**: Busca dados fictícios
- **`Alerta.TratamentoErroComLinha()`**: Tratamento de erros padronizado

### Fluxo de Dados

```
Cliente (Syncfusion DataGrid)
    ↓
GET /api/Home/DataSource
    ↓
OrdersDetails.GetAllRecords()
    ↓
Retorna JSON com dados fictícios
    ↓
DataGrid exibe dados
```

---

## Exemplos de Uso

### Exemplo 1: Carregar Dados no DataGrid

**JavaScript (Syncfusion)**:
```javascript
var grid = new ej.grids.Grid({
    dataSource: new ej.data.DataManager({
        url: '/api/Home/DataSource',
        adaptor: new ej.data.UrlAdaptor()
    }),
    // ... configurações do grid
});
```

**O que acontece**:
1. DataGrid faz requisição GET para `/api/Home/DataSource`
2. Controller retorna todos os registros de `OrdersDetails`
3. DataGrid renderiza os dados

---

### Exemplo 2: Paginação Server-Side

**JavaScript**:
```javascript
var grid = new ej.grids.Grid({
    dataSource: new ej.data.DataManager({
        url: '/api/Home/UrlDatasource',
        adaptor: new ej.data.UrlAdaptor()
    }),
    // ... configurações
});
```

**Request automático do Syncfusion**:
```json
{
  "requiresCounts": true,
  "skip": 0,
  "take": 10
}
```

**Response**:
```json
{
  "result": [...],  // 10 primeiros registros
  "count": 45       // Total disponível
}
```

---

### Exemplo 3: Edição Inline

**JavaScript**:
```javascript
// Usuário edita célula no grid
grid.updateRow(0, { freight: 5.5 });

// Syncfusion envia automaticamente:
POST /api/Home/CrudUpdate
{
  "action": "update",
  "value": {
    "orderid": 10001,
    "freight": 5.5,
    ...
  }
}
```

**O que acontece**:
1. Controller recebe requisição de atualização
2. Busca registro existente pelo `orderid`
3. Atualiza propriedades
4. Retorna objeto atualizado

---

## Troubleshooting

### Problema: Dados não persistem após reiniciar servidor

**Causa**: `OrdersDetails` usa lista estática em memória (`static List<OrdersDetails> order`)

**Solução**: Este é comportamento esperado. Para persistência real, usar banco de dados através de `_unitOfWork`.

**Código Relacionado**: Linha 13 do `HomeController.cs`

---

### Problema: Erro "View não encontrada" ao chamar Index()

**Causa**: Controller tenta retornar View mas não há view correspondente

**Solução**: Este endpoint não é usado em produção. Se necessário, criar view em `Views/Home/Index.cshtml` ou remover método.

---

### Problema: Syncfusion DataGrid não carrega dados

**Causa**: Endpoint retorna View() em caso de erro em vez de JSON

**Solução**: Verificar logs de erro. O método `Alerta.TratamentoErroComLinha()` registra erros. Corrigir causa raiz do erro.

**Código Relacionado**: Linhas 39-40 do `HomeController.cs`

---

### Problema: Operação CRUD não funciona

**Causa**: Dados são armazenados em memória e podem ser perdidos

**Solução**: Este é comportamento esperado para controller de exemplo. Para produção, implementar persistência em banco de dados.

---

## Notas Importantes

1. **Controller de Exemplo**: Este controller não gerencia funcionalidades reais do FrotiX
2. **Dados em Memória**: Todos os dados são armazenados em memória e não persistem
3. **Syncfusion**: Serve como referência para implementação de DataGrids Syncfusion
4. **IgnoreAntiforgeryToken**: Desabilitado apenas para facilitar testes

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do HomeController

**Arquivos Afetados**:
- `Controllers/HomeController.cs`

**Impacto**: Documentação de referência para controller de exemplo

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
