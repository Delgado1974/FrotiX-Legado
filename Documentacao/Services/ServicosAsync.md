# ServicosAsync.cs

## Visão Geral
Classe estática contendo **versões assíncronas** dos métodos de cálculo de custos de `Servicos.cs`. Esta classe foi criada para melhorar a performance em operações de cálculo em lote, especialmente no endpoint `CustosViagemController.CalculaCustoViagens`.

## Localização
`Services/ServicosAsync.cs`

## Dependências
- `FrotiX.Models` (entidades `Viagem`)
- `FrotiX.Repository.IRepository` (`IUnitOfWork`)
- `Servicos.cs` (usa métodos auxiliares estáticos)

## Métodos Principais

### 🔢 Cálculos de Custos (Versões Assíncronas)

#### `CalculaCustoCombustivelAsync(Viagem, IUnitOfWork)`
**Propósito**: Versão assíncrona de `Servicos.CalculaCustoCombustivel`.

**Diferenças**:
- Usa `Task.Run()` para executar consultas LINQ em thread separada
- Materializa resultados com `ToList()` antes de processar

**Chamado de**: `CustosViagemController.CalculaCustoViagens` (quando processando em lote)

**Complexidade**: Média (mesma lógica de `Servicos.CalculaCustoCombustivel`)

---

#### `CalculaCustoMotoristaAsync(Viagem, IUnitOfWork)`
**Propósito**: Versão assíncrona que retorna tupla `(double custo, int minutos)`.

**Retorno**: `Task<(double custo, int minutos)>`

**Diferenças**:
- Retorna minutos calculados junto com o custo
- Usa `Servicos.CalcularMinutosUteisViagem` (método estático compartilhado)

**Chamado de**: `CustosViagemController.CalculaCustoViagens`

**Complexidade**: Alta (mesma lógica de `Servicos.CalculaCustoMotorista`)

---

#### `CalculaCustoOperadorAsync(Viagem, IUnitOfWork)`
**Propósito**: Versão assíncrona que usa `Servicos.CalcularMediaDiariaViagensAsync` (otimizada).

**Correção Crítica**: 
- ✅ Usa `Servicos.CalcularMediaDiariaViagensAsync` (versão otimizada com `GetQuery()`)
- ❌ Não usa `Servicos.CalcularMediaDiariaViagens` (versão síncrona que materializa todas as viagens)

**Chamado de**: `CustosViagemController.CalculaCustoViagens`

**Complexidade**: Média-Alta (otimizada com agregações SQL)

---

#### `CalculaCustoLavadorAsync(Viagem, IUnitOfWork)`
**Propósito**: Versão assíncrona idêntica a `CalculaCustoOperadorAsync`, mas para lavadores.

**Correção Crítica**: 
- ✅ Usa `Servicos.CalcularMediaDiariaViagensAsync` (versão otimizada)

**Chamado de**: `CustosViagemController.CalculaCustoViagens`

**Complexidade**: Média-Alta

---

#### `CalculaCustoVeiculoAsync(Viagem, IUnitOfWork)`
**Propósito**: Versão assíncrona de `Servicos.CalculaCustoVeiculo`.

**Diferenças**:
- Usa `Task.Run()` para executar `ObterValorUnitarioVeiculo` em thread separada
- Usa `Servicos.CalcularMinutosUteisViagem` (método estático compartilhado)

**Chamado de**: `CustosViagemController.CalculaCustoViagens`

**Complexidade**: Alta (mesma lógica de `Servicos.CalculaCustoVeiculo`)

---

## Otimizações Implementadas

### ✅ Uso de `GetQuery()` para Agregações
Os métodos assíncronos que calculam média de viagens (`CalculaCustoOperadorAsync`, `CalculaCustoLavadorAsync`) usam `Servicos.CalcularMediaDiariaViagensAsync`, que:
- Usa `GetQuery()` para obter `IQueryable` (não materializa)
- Executa `Count()` e `Min()` diretamente no SQL
- Reduz tempo de execução de segundos para milissegundos em grandes volumes

### ⚠️ Limitações Atuais
- Alguns métodos ainda usam `Task.Run()` com `ToList()`, materializando todas as entidades antes de processar
- Ideal seria usar `GetQuery()` em todos os lugares para executar agregações no SQL

## Contribuição para o Sistema FrotiX

### ⚡ Performance em Lote
Esta classe é essencial para o endpoint `CustosViagemController.CalculaCustoViagens`, que recalcula custos de **centenas ou milhares de viagens** em uma única operação. Sem versões assíncronas, essa operação bloquearia threads por muito tempo.

### 🔄 Compatibilidade
- Mantém a mesma lógica de negócio de `Servicos.cs`
- Usa métodos auxiliares estáticos compartilhados (`CalcularMinutosUteisViagem`, `ObterValorUnitarioVeiculo`)
- Garante consistência entre cálculos síncronos e assíncronos

## Observações Importantes

1. **Correção Crítica**: Os métodos `CalculaCustoOperadorAsync` e `CalculaCustoLavadorAsync` foram corrigidos para usar `CalcularMediaDiariaViagensAsync` (otimizada) em vez da versão síncrona.

2. **Thread Safety**: Os métodos são thread-safe pois não compartilham estado (métodos estáticos puros).

3. **Error Handling**: Todos os métodos capturam exceções e retornam valores padrão (0) em caso de erro, usando `Alerta.TratamentoErroComLinha`.

## Arquivos Relacionados
- `Services/Servicos.cs`: Contém a lógica de negócio e métodos auxiliares compartilhados
- `Controllers/CustosViagemController.cs`: Usa estes métodos para cálculos em lote
- `Repository/IRepository/`: Acessa dados via `IUnitOfWork`
