# GlosaService.cs, IGlosaService.cs e GlosaDtos.cs

## Visão Geral
Serviço de **cálculo e listagem de glosas** (descontos) em contratos de veículos. Consolida dados de múltiplas Ordens de Serviço (O.S.) por item do contrato, calculando valores de glosa e valores para ateste.

## Localização
- `Services/GlosaService.cs` (implementação)
- `Services/IGlosaService.cs` (interface)
- `Services/GlosaDtos.cs` (DTOs)

## Dependências
- `FrotiX.Repository.IRepository` (`IUnitOfWork`)
- `FrotiX.Data` (`ViewGlosa` - view do banco)

## Interface (`IGlosaService`)

### `ListarResumo(Guid contratoId, int mes, int ano)`
Retorna resumo consolidado de glosas por item do contrato.

**Retorna**: `IEnumerable<GlosaResumoItemDto>`

---

### `ListarDetalhes(Guid contratoId, int mes, int ano)`
Retorna detalhes individuais de cada O.S. com glosa.

**Retorna**: `IEnumerable<GlosaDetalheItemDto>`

---

## Implementação (`GlosaService`)

### Estrutura de Dados

#### `ViewGlosa` (View do Banco)
A view `ViewGlosa` contém uma linha por O.S., com:
- `ContratoId`: ID do contrato
- `NumItem`: Número do item no contrato
- `Descricao`: Descrição do item
- `Quantidade`: Quantidade do item no contrato
- `ValorUnitario`: Valor unitário do item no contrato
- `ValorGlosa`: Valor da glosa desta O.S.
- `DataSolicitacaoRaw`: Data da solicitação (DateTime para filtros)
- `DataDevolucao`: Data de devolução do veículo
- `DiasGlosa`: Quantidade de dias de glosa

---

### Métodos Principais

#### `ListarResumo(Guid contratoId, int mes, int ano)`
**Propósito**: Consolida glosas por item do contrato, somando valores de todas as O.S.

**Lógica**:
1. Busca todas as O.S. do contrato no mês/ano especificado via `ViewGlosa`
2. Agrupa por `(NumItem, Descricao)`
3. Para cada grupo:
   - `Quantidade`: Máximo do grupo (quantidade do contrato, não depende de O.S.)
   - `ValorUnitario`: Máximo do grupo (valor unitário do contrato)
   - `PrecoTotalMensal`: `Quantidade * ValorUnitario` (valor do contrato, não soma de O.S.)
   - `PrecoDiario`: `ValorUnitario / 30`
   - `Glosa`: **Soma** de todas as glosas do grupo (somatório de todas as O.S.)
   - `ValorParaAteste`: `PrecoTotalMensal - Glosa`
4. Ordena por `NumItem`

**Observação Crítica**: 
- ✅ `PrecoTotalMensal` é calculado como `Qtd * VlrUnit` do contrato (correto)
- ✅ `Glosa` é a soma de todas as glosas das O.S. (correto)
- ✅ `ValorParaAteste` = Valor do contrato menos glosa (correto)

**Chamado de**: `Controllers/GlosaController` (endpoint de resumo)

**Complexidade**: Média-Alta (agregações com GroupBy e cálculos)

---

#### `ListarDetalhes(Guid contratoId, int mes, int ano)`
**Propósito**: Retorna detalhes individuais de cada O.S. com glosa.

**Retorna**:
- `NumItem`, `Descricao`
- `Placa`: Placa do veículo
- `DataSolicitacao`: Data formatada da solicitação
- `DataDisponibilidade`: Data formatada de disponibilidade
- `DataRecolhimento`: Data formatada de recolhimento
- `DataDevolucao`: Data formatada de devolução (exibida como "Retorno" na UI)
- `DiasGlosa`: Quantidade de dias de glosa

**Chamado de**: `Controllers/GlosaController` (endpoint de detalhes)

**Complexidade**: Baixa (projeção simples)

---

## DTOs (`GlosaDtos.cs`)

### `GlosaResumoItemDto`
DTO para resumo consolidado por item:

```csharp
public class GlosaResumoItemDto
{
    public int? NumItem { get; set; }
    public string Descricao { get; set; }
    public int? Quantidade { get; set; }
    public decimal ValorUnitario { get; set; }
    public decimal PrecoTotalMensal { get; set; } // Qtd * VlrUnit
    public decimal PrecoDiario { get; set; } // VlrUnit / 30
    public decimal Glosa { get; set; } // Soma de todas as O.S.
    public decimal ValorParaAteste { get; set; } // PrecoTotalMensal - Glosa
}
```

---

### `GlosaDetalheItemDto`
DTO para detalhes individuais:

```csharp
public class GlosaDetalheItemDto
{
    public int? NumItem { get; set; }
    public string Descricao { get; set; }
    public string Placa { get; set; }
    public string DataSolicitacao { get; set; }
    public string DataDisponibilidade { get; set; }
    public string DataRecolhimento { get; set; }
    public string DataDevolucao { get; set; } // "Retorno" na UI
    public int DiasGlosa { get; set; }
}
```

---

## Contribuição para o Sistema FrotiX

### 💰 Gestão Financeira
- Cálculo correto de glosas consolidadas por item
- Separação entre valor do contrato e valor de glosa
- Cálculo de valor para ateste (valor a ser pago)

### 📊 Relatórios
- Resumo consolidado facilita análise financeira
- Detalhes permitem auditoria de cada O.S.
- Ordenação por `NumItem` facilita leitura

### 🔍 Transparência
- Dados claros sobre origem das glosas
- Histórico completo de O.S. com glosa
- Datas formatadas para exibição na UI

## Observações Importantes

1. **Versão v2**: O código contém comentário indicando que esta é a "v2" do serviço de glosa, com correções no cálculo do contrato (`Qtd * VlrUnit` independente de O.S.).

2. **Agregação Correta**: O método `ListarResumo` usa `GroupBy` e `Sum` para consolidar glosas corretamente, garantindo que múltiplas O.S. do mesmo item sejam somadas.

3. **Performance**: Usa `GetAllReducedIQueryable` com `asNoTracking: true` para otimizar consultas (não rastreia entidades no EF Core).

4. **Implementação Explícita**: O método `ListarDetalhes` tem implementação explícita da interface (`IEnumerable<GlosaDetalheItemDto> IGlosaService.ListarDetalhes(...)`) para evitar ambiguidades de namespace.

5. **Filtro por Data**: Usa `DataSolicitacaoRaw.Month` e `DataSolicitacaoRaw.Year` para filtrar por mês/ano, garantindo que apenas O.S. do período especificado sejam consideradas.

## Arquivos Relacionados
- `Controllers/GlosaController.cs`: Usa `IGlosaService` para expor endpoints de glosa
- `Data/FrotiXDbContext.cs`: Define `ViewGlosa` como DbSet
- `Repository/IRepository/`: Acessa `ViewGlosa` via `IUnitOfWork.ViewGlosa`
