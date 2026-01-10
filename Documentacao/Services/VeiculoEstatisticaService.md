# VeiculoEstatisticaService.cs

## Visão Geral
Serviço para calcular **estatísticas de viagens por veículo** baseadas no histórico. Usado pela **IA evolutiva** para calibrar alertas de validação (detectar anomalias em quilometragem e duração de viagens).

## Localização
`Services/VeiculoEstatisticaService.cs`

## Dependências
- `FrotiX.Data` (`FrotiXDbContext`)
- `Microsoft.Extensions.Caching.Memory` (`IMemoryCache`)
- `Microsoft.EntityFrameworkCore` (`ToListAsync`, `AsNoTracking`)
- `FrotiX.Models.DTO` (`EstatisticaVeiculoDto`)

## Características

### Cache
- **TTL**: 10 minutos
- **Chave**: `"VeiculoEstatistica_{veiculoId}"`
- Reduz recálculos frequentes

### Histórico
- Considera últimas **100 viagens** finalizadas
- Filtra viagens com KM válido (KmFinal > KmInicial > 0)
- Filtra durações válidas (1 minuto a 24 horas)

---

## Métodos Principais

### `ObterEstatisticasAsync(Guid veiculoId)`
**Propósito**: Obtém estatísticas de um veículo (com cache).

**Fluxo**:
1. Verifica cache
2. Se não em cache: calcula estatísticas
3. Armazena no cache por 10 minutos
4. Retorna estatísticas

**Complexidade**: Média-Alta (consultas e cálculos estatísticos)

---

### `CalcularEstatisticasAsync(Guid veiculoId)` (privado)
**Propósito**: Calcula estatísticas baseadas no histórico.

**Estatísticas Calculadas**:

#### Quilometragem:
- `KmMedio`: Média aritmética
- `KmMediano`: Mediana
- `KmDesvioPadrao`: Desvio padrão
- `KmMinimo`, `KmMaximo`: Valores extremos
- `KmPercentil95`, `KmPercentil99`: Percentis

#### Duração:
- `DuracaoMediaMinutos`: Média
- `DuracaoMedianaMinutos`: Mediana
- `DuracaoDesvioPadraoMinutos`: Desvio padrão
- `DuracaoMinimaMinutos`, `DuracaoMaximaMinutos`: Extremos
- `DuracaoPercentil95Minutos`: Percentil 95

#### Metadados:
- `TotalViagens`: Quantidade de viagens analisadas
- `DataViagemMaisAntiga`, `DataViagemMaisRecente`: Período do histórico

**Complexidade**: Alta (cálculos estatísticos complexos)

---

### `InvalidarCache(Guid veiculoId)`
**Propósito**: Invalida cache de um veículo (chamar após finalizar viagem).

**Uso**: Chamar após criar/atualizar viagem para forçar recálculo.

---

## Contribuição para o Sistema FrotiX

### 🤖 IA Evolutiva
- Fornece dados estatísticos para calibração de alertas
- Detecta anomalias (viagens fora do padrão)
- Melhora precisão de validações automáticas

### 📊 Análises
- Permite análise de padrões de uso por veículo
- Identifica veículos com comportamento atípico
- Suporta tomada de decisão baseada em dados

## Observações Importantes

1. **Histórico Limitado**: Considera apenas últimas 100 viagens. Para veículos com muito histórico, pode não refletir padrão completo.

2. **Filtros Rigorosos**: Filtra viagens inválidas (KM negativo, duração extrema). Garante qualidade dos dados estatísticos.

3. **Cache**: Cache de 10 minutos pode não refletir mudanças recentes. Use `InvalidarCache()` após operações críticas.

4. **Performance**: Cálculos estatísticos podem ser lentos com muitos dados. Cache ajuda, mas considere otimizações para grandes volumes.

## Arquivos Relacionados
- `Models/DTO/EstatisticaVeiculoDto.cs`: DTO de estatísticas
- `Controllers/DashboardVeiculosController.cs`: Usa estatísticas para análises
- `Data/FrotiXDbContext.cs`: Acessa dados de viagens
