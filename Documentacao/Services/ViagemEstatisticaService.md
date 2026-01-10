# ViagemEstatisticaService.cs

## Visão Geral
Serviço para calcular e armazenar **estatísticas consolidadas de viagens por dia**. Calcula métricas agregadas (totais, médias, distribuições) e armazena em tabela `ViagemEstatistica` para consulta rápida.

## Localização
`Services/ViagemEstatisticaService.cs`

## Dependências
- `FrotiX.Data` (`FrotiXDbContext`)
- `FrotiX.Repository.IRepository` (`IViagemEstatisticaRepository`, `IUnitOfWork`)
- `Microsoft.EntityFrameworkCore` (`Include`, `ToListAsync`)
- `System.Text.Json` (`JsonSerializer`)

## Características

### Cache em Banco
- Estatísticas são armazenadas na tabela `ViagemEstatistica`
- Uma linha por dia (`DataReferencia`)
- Atualização automática ao calcular

### Métricas Calculadas
- Totais e contagens por status
- Custos agregados (total, médio, por tipo)
- Quilometragem (total, média)
- Distribuições em JSON (por status, motorista, veículo, finalidade, etc.)

---

## Métodos Principais

### `ObterEstatisticasAsync(DateTime data)`
**Propósito**: Obtém ou calcula estatísticas para uma data específica.

**Comportamento**:
- **SEMPRE recalcula** se registro já existe (faz UPDATE)
- Insere novo registro se não existir
- Retorna estatísticas atualizadas

**Complexidade**: Alta (múltiplas consultas e agregações)

---

### `ObterEstatisticasPeriodoAsync(DateTime dataInicio, DateTime dataFim)`
**Propósito**: Obtém estatísticas de um período **APENAS LENDO DO CACHE** (não recalcula).

**⚠️ CRÍTICO**: Este método **não recalcula**. Apenas lê da tabela `ViagemEstatistica`.

**Uso**: Para relatórios e dashboards que precisam de dados históricos rápidos.

**Complexidade**: Baixa (consulta simples)

---

### `CalcularEstatisticasAsync(DateTime dataReferencia)` (privado)
**Propósito**: Calcula estatísticas em tempo real para uma data.

**Métricas Calculadas**:

#### Estatísticas Gerais:
- `TotalViagens`: Total de viagens do dia
- `ViagensFinalizadas`, `ViagensEmAndamento`, `ViagensAgendadas`, `ViagensCanceladas`: Contagem por status

#### Custos:
- `CustoTotal`: Soma de todos os custos
- `CustoMedioPorViagem`: Média
- `CustoVeiculo`, `CustoMotorista`, `CustoOperador`, `CustoLavador`, `CustoCombustivel`: Por tipo

#### Quilometragem:
- `QuilometragemTotal`: Soma de KM rodados
- `QuilometragemMedia`: Média por viagem

#### Distribuições (JSON):
- `ViagensPorStatusJson`: Contagem por status
- `ViagensPorMotoristaJson`: Top 10 motoristas
- `ViagensPorVeiculoJson`: Top 10 veículos
- `ViagensPorFinalidadeJson`: Por finalidade
- `ViagensPorRequisitanteJson`: Top 10 requisitantes
- `ViagensPorSetorJson`: Top 10 setores
- `CustosPorMotoristaJson`: Top 10 por custo
- `CustosPorVeiculoJson`: Top 10 por custo
- `KmPorVeiculoJson`: Top 10 por KM
- `CustosPorTipoJson`: Distribuição por tipo de custo

**Complexidade**: Muito Alta (múltiplas consultas com `Include`, agregações, serialização JSON)

---

### `RecalcularEstatisticasAsync(DateTime data)`
**Propósito**: Força recálculo das estatísticas (ignora cache).

**Uso**: Após importações em lote ou correções de dados.

---

### `AtualizarEstatisticasDiaAsync(DateTime data)`
**Propósito**: Atualiza estatísticas de um dia específico (usado após criar/editar/deletar viagem).

**Uso**: Chamar após operações CRUD de viagens para manter estatísticas atualizadas.

---

## Contribuição para o Sistema FrotiX

### 📊 Dashboards e Relatórios
- Fornece dados agregados para dashboards
- Permite análises históricas rápidas
- Suporta gráficos e visualizações

### ⚡ Performance
- Cache em banco reduz tempo de consulta
- Evita recalcular estatísticas a cada requisição
- Consultas otimizadas com índices

### 🔄 Atualização Automática
- Estatísticas são atualizadas automaticamente
- Mantém dados sempre atualizados
- Suporta recálculo sob demanda

## Observações Importantes

1. **⚠️ CRÍTICO - Método de Período**: `ObterEstatisticasPeriodoAsync` **não recalcula**. Se estatísticas não existirem para o período, retornará lista vazia. Use `ObterEstatisticasAsync` para cada data se precisar garantir cálculo.

2. **Performance**: `CalcularEstatisticasAsync` é muito pesado (múltiplas consultas com `Include`). Considere otimizar ou executar em background.

3. **Atualização Automática**: Após criar/editar/deletar viagem, chame `AtualizarEstatisticasDiaAsync` para manter estatísticas atualizadas.

4. **JSON Distribuições**: Distribuições são armazenadas como JSON. Para consultar, deserialize no frontend ou use funções JSON do SQL Server.

5. **Top 10**: Várias distribuições limitam a Top 10. Se precisar de mais, ajuste o código.

## Arquivos Relacionados
- `Models/ViagemEstatistica.cs`: Entidade de estatísticas
- `Repository/IRepository/IViagemEstatisticaRepository.cs`: Repositório de estatísticas
- `Controllers/DashboardEventosController.cs`: Usa estatísticas para dashboards
