# Documentação: ListasCompartilhadas.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O arquivo `ListasCompartilhadas.cs` contém múltiplas classes helper para geração de listas compartilhadas usadas em dropdowns, treeviews e seleções em todo o sistema FrotiX.

**Principais características:**

✅ **Múltiplas Listas**: 15+ classes de listas diferentes  
✅ **Ordenação pt-BR**: Comparador que ignora acentos e case  
✅ **Integração com Repository**: Usa `IUnitOfWork` para dados dinâmicos  
✅ **Views Otimizadas**: Usa views quando disponíveis  
✅ **Tratamento de Erros**: Try-catch em todos os métodos

---

## Estrutura do Arquivo

O arquivo está organizado em regiões:

1. **Comparadores**: `PtBrComparer`
2. **Lista de Finalidades**: `ListaFinalidade`
3. **Lista de Nível de Combustível**: `ListaNivelCombustivel`
4. **Lista de Veículos**: `ListaVeiculos`
5. **Lista de Motoristas**: `ListaMotorista`
6. **Lista de Requisitantes**: `ListaRequisitante`
7. **Lista de Eventos**: `ListaEvento`
8. **Lista de Setores**: `ListaSetores` (TreeView)
9. **Lista de Setores para Evento**: `ListaSetoresEvento` (Lista Plana)
10. **Lista de Setores Flat**: `ListaSetoresFlat` (DropDown com Indentação)
11. **Lista de Dias da Semana**: `ListaDias`
12. **Lista de Períodos**: `ListaPeriodos`
13. **Lista de Recorrente**: `ListaRecorrente`
14. **Lista de Status**: `ListaStatus`

---

## Comparador pt-BR

### `PtBrComparer`

**Descrição**: Comparador que ignora case e acentos para ordenação em português brasileiro

**Uso**:
```csharp
var comparer = new PtBrComparer();
finalidades.OrderBy(f => f.Descricao, comparer);
```

**Vantagens**:
- Ordena corretamente palavras com acentos
- Ignora diferenças entre maiúsculas/minúsculas
- Usa `CultureInfo("pt-BR")` com `CompareOptions.IgnoreCase | CompareOptions.IgnoreNonSpace`

---

## Classes de Listas Principais

### `ListaFinalidade`

**Descrição**: Lista de finalidades de viagens

**Método**: `FinalidadesList()`

**Dados**: Lista hardcoded com 22 finalidades:
- Transporte de Funcionários
- Transporte de Convidados
- Economildo Norte/Sul/Rodoviária
- Mesa (carros pretos)
- TV/Rádio Câmara
- Aeroporto
- Manutenção (Saída/Chegada)
- Abastecimento
- Locadora (Recebimento/Devolução)
- Evento, Ambulância, etc.

**Ordenação**: Alfabética usando `PtBrComparer`

---

### `ListaNivelCombustivel`

**Descrição**: Lista de níveis de combustível com ícones

**Método**: `NivelCombustivelList()`

**Dados**: 5 níveis:
- Vazio (`tanquevazio`)
- 1/4 (`tanqueumquarto`)
- 1/2 (`tanquemeiotanque`)
- 3/4 (`tanquetresquartos`)
- Cheio (`tanquecheio`)

**Propriedades**:
- `Nivel`: ID do nível
- `Descricao`: Descrição textual
- `Imagem`: Caminho da imagem (`../images/tanque*.png`)

---

### `ListaVeiculos`

**Descrição**: Lista de veículos ativos com marca e modelo

**Método**: `VeiculosList()`

**Fonte**: `_unitOfWork.Veiculo.GetAllReduced()` com join em `MarcaVeiculo` e `ModeloVeiculo`

**Filtro**: Apenas veículos com `Status == true`

**Formato**: `"{Placa} - {Marca}/{Modelo}"`

**Ordenação**: Alfabética por descrição

---

### `ListaMotorista`

**Descrição**: Lista de motoristas ativos com foto Base64

**Método**: `MotoristaList()`

**Fonte**: `_unitOfWork.ViewMotoristas.GetAllReduced()`

**Propriedades**:
- `MotoristaId`: GUID do motorista
- `Nome`: Nome completo
- `FotoBase64`: Foto em Base64 (`data:image/jpeg;base64,...`) ou `null`
- `Status`: Status do motorista

**Filtro**: Apenas motoristas com `Status == true`

---

### `ListaRequisitante`

**Descrição**: Lista de requisitantes

**Método**: `RequisitantesList()`

**Fonte**: `_unitOfWork.ViewRequisitantes.GetAllReduced()`

**Ordenação**: Alfabética por nome

---

### `ListaEvento`

**Descrição**: Lista de eventos ativos

**Método**: `EventosList()`

**Fonte**: `_unitOfWork.Evento.GetAllReduced()`

**Filtro**: Apenas eventos com `Status == "1"`

**Ordenação**: Alfabética por nome

---

### `ListaSetores` (TreeView)

**Descrição**: Lista hierárquica de setores para TreeView Syncfusion

**Método**: `SetoresList()`

**Fonte**: `_unitOfWork.ViewSetores.GetAll()`

**Estrutura Hierárquica**:
- Detecta filhos via `SetorPaiId`
- Propriedade `HasChild` indica se tem filhos
- `SetorPaiId == null` para itens raiz

**Propriedades**:
- `SetorSolicitanteId`: GUID do setor
- `SetorPaiId`: GUID do pai (null para raiz)
- `Nome`: Nome do setor
- `HasChild`: Indica se tem filhos
- `Expanded`, `IsSelected`: Para controle de UI

**Debug**: Inclui mensagens de debug para troubleshooting

---

### `ListaSetoresEvento` (Lista Plana)

**Descrição**: Lista plana de setores para eventos

**Método**: `SetoresEventoList()`

**Fonte**: `_unitOfWork.SetorSolicitante.GetAll()`

**Formato**: `"{Nome} ({Sigla})"`

**Ordenação**: Alfabética

---

### `ListaSetoresFlat` (DropDown com Indentação)

**Descrição**: Lista plana de setores com indentação visual para DropDownList

**Método**: `SetoresListFlat()`

**Fonte**: `_unitOfWork.ViewSetores.GetAllReduced()`

**Características**:
- Calcula nível hierárquico recursivamente
- Adiciona indentação visual (`—` repetido)
- Proteção contra loops circulares (`HashSet<Guid>`)
- Limite máximo de 50 níveis

**Formato**: `"— — Nome do Setor"` (com indentação)

**Método Auxiliar**: `CalcularNivel()` - Calcula profundidade hierárquica

---

### `ListaDias`

**Descrição**: Lista de dias da semana

**Método**: `DiasList()`

**Dados**: 7 dias (Segunda a Domingo)

**Formato**: `{ DiaId: "Monday", Dia: "Segunda" }`

---

### `ListaPeriodos`

**Descrição**: Lista de períodos de recorrência

**Método**: `PeriodosList()`

**Dados**: 4 períodos:
- Diário (`D`)
- Semanal (`S`)
- Quinzenal (`Q`)
- Mensal (`M`)

---

### `ListaRecorrente`

**Descrição**: Lista de opções de recorrência (Sim/Não)

**Método**: `RecorrenteList()`

**Dados**: 2 opções:
- Não (`N`)
- Sim (`S`)

**Nota**: Propriedade corrigida de `Recorrente` para `Descricao`

---

### `ListaStatus`

**Descrição**: Lista de status de viagens

**Método**: `StatusList()`

**Dados**: 4 status:
- Todas (`Todas`)
- Abertas (`Aberta`)
- Realizadas (`Realizada`)
- Canceladas (`Cancelada`)

---

## Padrão de Implementação

Todas as classes seguem o mesmo padrão:

1. **Construtor Vazio**: Para uso sem `IUnitOfWork`
2. **Construtor com IUnitOfWork**: Para acesso a dados
3. **Método de Lista**: Retorna `List<T>` ou `IEnumerable<T>`
4. **Try-Catch**: Tratamento de erros com log
5. **Retorno Seguro**: Retorna lista vazia em caso de erro

---

## Interconexões

### Quem Usa Estas Classes

- **Controllers**: Para popular dropdowns em views
- **Pages Razor**: Para seleções em formulários
- **JavaScript**: Dados serializados para componentes Syncfusion

### O Que Estas Classes Usam

- **FrotiX.Repository.IRepository**: `IUnitOfWork`
- **FrotiX.Models**: Modelos de domínio
- **System.Linq**: Para queries e ordenação
- **System.Globalization**: Para comparação pt-BR

---

## Exemplos de Uso

### Exemplo 1: Dropdown de Finalidades

```csharp
public IActionResult Index()
{
    var listaFinalidade = new ListaFinalidade();
    var finalidades = listaFinalidade.FinalidadesList();
    
    ViewBag.Finalidades = finalidades;
    return View();
}
```

### Exemplo 2: TreeView de Setores

```csharp
public IActionResult SelecionarSetor()
{
    var listaSetores = new ListaSetores(_unitOfWork);
    var setores = listaSetores.SetoresList();
    
    return Json(setores);
}
```

### Exemplo 3: Dropdown de Veículos

```csharp
public IActionResult SelecionarVeiculo()
{
    var listaVeiculos = new ListaVeiculos(_unitOfWork);
    var veiculos = listaVeiculos.VeiculosList();
    
    return Json(veiculos);
}
```

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do ListasCompartilhadas

**Arquivos Afetados**:
- `Helpers/ListasCompartilhadas.cs`

**Impacto**: Documentação de referência para listas compartilhadas

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
