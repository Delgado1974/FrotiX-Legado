# Servicos.cs

## Visão Geral
Classe estática centralizada contendo **cálculos de custos de viagens** e utilitários diversos para o sistema FrotiX. Esta classe é fundamental para o cálculo financeiro de cada viagem realizada, incluindo custos de veículo, motorista, operador, lavador e combustível.

## Localização
`Services/Servicos.cs`

## Dependências
- `FrotiX.Models` (entidades `Viagem`, `Veiculo`, `Motorista`, etc.)
- `FrotiX.Repository.IRepository` (`IUnitOfWork`)
- `HtmlAgilityPack` (conversão HTML para texto)

## Métodos Principais

### 🔢 Cálculos de Custos

#### `CalculaCustoCombustivel(Viagem, IUnitOfWork)`
**Propósito**: Calcula o custo de combustível para uma viagem específica.

**Lógica**:
1. Busca o veículo e seu tipo de combustível
2. Tenta obter o último abastecimento do veículo
3. Se não houver abastecimento, usa o preço médio do combustível (`MediaCombustivel`)
4. Calcula: `(KmFinal - KmInicial) / ConsumoVeiculo * ValorCombustivel`
5. Se consumo for 0, assume padrão de 10 km/L

**Chamado de**: `CustosViagemController.CalculaCustoViagens`, `ServicosAsync.CalculaCustoCombustivelAsync`

**Complexidade**: Média (consultas ao banco, cálculos simples)

---

#### `CalculaCustoVeiculo(Viagem, IUnitOfWork)`
**Propósito**: Calcula o custo do veículo baseado em horas úteis de operação.

**Lógica**:
1. Obtém valor unitário do veículo (contrato/ata/próprio) via `ObterValorUnitarioVeiculo`
2. Define: 16 horas úteis/dia (6h-22h), 22 dias úteis/mês = 21.120 minutos/mês
3. Calcula custo por minuto: `valorUnitario / minutosMesUteis`
4. Calcula minutos úteis da viagem via `CalcularMinutosUteisViagem` (considera dias úteis e limite de 16h/dia)
5. Retorna: `minutosViagemUteis * custoMinutoVeiculo`, limitado ao valor mensal

**Chamado de**: `CustosViagemController.CalculaCustoViagens`, `ServicosAsync.CalculaCustoVeiculoAsync`

**Complexidade**: Alta (cálculo complexo de dias úteis com exceções)

---

#### `CalculaCustoMotorista(Viagem, IUnitOfWork, ref int minutos)`
**Propósito**: Calcula o custo do motorista terceirizado para a viagem.

**Lógica**:
1. Verifica se motorista é terceirizado (`ContratoId != null`)
2. Busca última repactuação do contrato e valor do motorista
3. Define: 12 horas/dia (jornada máxima), 22 dias úteis/mês = 15.840 minutos/mês
4. Calcula minutos úteis via `CalcularMinutosUteisViagem` (limite 12h/dia)
5. Retorna custo calculado limitado ao valor mensal
6. Se `minutos == -1`, registra os minutos totais calculados

**Chamado de**: `CustosViagemController.CalculaCustoViagens`, `ServicosAsync.CalculaCustoMotoristaAsync`

**Complexidade**: Alta (mesma complexidade de `CalculaCustoVeiculo`)

---

#### `CalculaCustoOperador(Viagem, IUnitOfWork)`
**Propósito**: Calcula o custo de operadores terceirizados distribuído por viagem.

**Lógica**:
1. Busca contrato de operadores terceirizados mais recente (`ContratoOperadores == true`)
2. Obtém última repactuação e valores (`QtdOperadores * ValorOperador`)
3. Calcula média diária de viagens até a data da viagem via `CalcularMediaDiariaViagens`
4. Retorna: `CustoMensalTotal / MediaViagensMensais`

**Chamado de**: `CustosViagemController.CalculaCustoViagens`, `ServicosAsync.CalculaCustoOperadorAsync`

**Complexidade**: Média-Alta (requer cálculo de média histórica)

---

#### `CalculaCustoLavador(Viagem, IUnitOfWork)`
**Propósito**: Calcula o custo de lavadores terceirizados distribuído por viagem.

**Lógica**: Idêntica a `CalculaCustoOperador`, mas busca contrato com `ContratoLavadores == true`.

**Chamado de**: `CustosViagemController.CalculaCustoViagens`, `ServicosAsync.CalculaCustoLavadorAsync`

**Complexidade**: Média-Alta

---

### 📊 Métodos Auxiliares de Cálculo

#### `CalcularMinutosUteisViagem(DateTime inicio, DateTime fim, TimeSpan duracao, int horasMaximasDia)`
**Propósito**: Calcula minutos úteis considerando dias úteis (seg-sex) e limite de horas por dia.

**Regras Especiais**:
- Se início ou fim cair em fim de semana, conta esse dia (exceção)
- Viagens curtas (≤ horasMaximasDia): retorna minutos reais
- Viagens longas: conta dias úteis com exceções × minutos máximos/dia
- Ajusta se duração real for menor que o calculado

**Chamado de**: `CalculaCustoVeiculo`, `CalculaCustoMotorista`, `ServicosAsync`

**Complexidade**: Alta (lógica complexa de contagem de dias com exceções)

---

#### `ContarDiasUteisComExcecoes(DateTime dataInicio, DateTime dataFim)`
**Propósito**: Conta dias úteis (seg-sex) incluindo início/fim se forem fim de semana.

**Lógica**: Itera dia a dia e conta se:
- É dia útil (seg-sex), OU
- É fim de semana MAS é o dia inicial ou final

**Chamado de**: `CalcularMinutosUteisViagem`

**Complexidade**: Média (iteração simples com condições)

---

#### `ObterValorUnitarioVeiculo(Veiculo, IUnitOfWork)`
**Propósito**: Extrai valor unitário do veículo baseado em seu tipo (contrato/ata/próprio).

**Lógica**:
1. Se `ContratoId != null`: busca última repactuação do contrato e `ItemVeiculoContrato.ValorUnitario`
2. Se `AtaId != null`: busca última repactuação da ATA e `ItemVeiculoAta.ValorUnitario`
3. Senão: retorna 100 (veículo próprio)

**Chamado de**: `CalculaCustoVeiculo`, `ServicosAsync.CalculaCustoVeiculoAsync`

**Complexidade**: Média (consultas com joins)

---

#### `CalcularMediaDiariaViagens(DateTime dataViagem, IUnitOfWork)`
**Propósito**: Calcula média mensal de viagens baseada no histórico diário até a data especificada.

**Lógica**:
1. Busca todas as viagens realizadas ANTES da data (`Status == "Realizada"`)
2. Calcula total de dias desde a primeira viagem até a data
3. Média diária = `totalViagens / totalDias`
4. Média mensal = `mediaDiaria * 30`
5. Retorna mínimo de 0.1 para evitar divisão por zero

**Chamado de**: `CalculaCustoOperador`, `CalculaCustoLavador`

**Complexidade**: Média-Alta (consulta histórica e cálculos)

---

#### `CalcularMediaDiariaViagensAsync(DateTime, IUnitOfWork)`
**Propósito**: Versão assíncrona otimizada usando `GetQuery()` para executar `COUNT()` e `MIN()` no SQL.

**Otimização**: Usa `IQueryable` para executar agregações no banco (milissegundos) em vez de materializar todas as viagens.

**Chamado de**: `ServicosAsync.CalculaCustoOperadorAsync`, `ServicosAsync.CalculaCustoLavadorAsync`

**Complexidade**: Média-Alta (otimizada)

---

### 🔄 Conversão HTML para Texto

#### `ConvertHtml(string html)`
**Propósito**: Converte HTML para texto simples usando `HtmlAgilityPack`.

**Chamado de**: Vários controllers e páginas que precisam exibir conteúdo HTML como texto

**Complexidade**: Baixa

---

#### `ConvertTo(HtmlNode, TextWriter)` e `ConvertContentTo(HtmlNode, TextWriter)`
**Propósito**: Métodos auxiliares recursivos para conversão HTML.

**Complexidade**: Baixa

---

### 🌳 TreeView e Hierarquia

#### `Employees()` (endpoint API)
**Propósito**: Retorna JSON de setores solicitantes para Syncfusion TreeView.

**Retorna**: `{ id, Name, hasChildren }` para cada setor

**Chamado de**: Frontend (JavaScript) via `/api/Servicos/Employees`

**Complexidade**: Baixa

---

#### `Read_TreeViewData(int? id)`
**Propósito**: Retorna dados hierárquicos para TreeView (atualmente usa dados mock).

**Nota**: Usa `GetHierarchicalData()` que retorna dados estáticos. Provavelmente deveria usar dados reais de `SetorSolicitante`.

**Complexidade**: Baixa

---

### 🔤 Normalização de Texto

#### `TiraAcento(string texto)`
**Propósito**: Remove acentos e caracteres inválidos, substitui espaços por underscore. Útil para nomes de arquivo.

**Funcionalidades**:
- Remove acentos usando normalização Unicode (`NormalizationForm.FormD`)
- Remove caracteres inválidos para nomes de arquivo
- Substitui espaços por underscore
- Remove múltiplos underscores/hífens/pontos consecutivos
- Limita a 255 caracteres

**Exemplos**:
- `"Açúcar & Café.pdf"` → `"Acucar_Cafe.pdf"`
- `"São Paulo/Rio"` → `"Sao_PauloRio"`
- `"Relatório 2024: análise"` → `"Relatorio_2024_analise"`

**Chamado de**: Vários lugares que precisam gerar nomes de arquivo seguros

**Complexidade**: Média (múltiplas transformações e regex)

---

## Contribuição para o Sistema FrotiX

### 💰 Cálculos Financeiros
Esta classe é **crítica** para o cálculo correto dos custos de cada viagem. Sem ela, o sistema não conseguiria:
- Calcular custos reais de operação
- Gerar relatórios financeiros precisos
- Fazer análises de custo-benefício
- Repactuar contratos baseado em dados reais

### ⚡ Performance
- Métodos síncronos são rápidos mas podem bloquear threads
- Versões assíncronas (`ServicosAsync`) otimizam consultas usando `GetQuery()` para agregações SQL

### 🔧 Manutenibilidade
- Métodos estáticos facilitam testes unitários
- Lógica centralizada evita duplicação
- Cálculos complexos estão bem documentados com comentários

## Observações Importantes

1. **Dias Úteis**: A lógica de dias úteis tem uma exceção importante: se início ou fim da viagem cair em fim de semana, esse dia é contado. Isso pode ser intencional para viagens que começam/finalizam fora do horário comercial.

2. **Valores Padrão**: 
   - Consumo padrão: 10 km/L (se não houver histórico)
   - Veículo próprio: R$ 100/mês

3. **Limites de Custo**: Todos os cálculos garantem que o custo nunca ultrapasse o valor mensal do contrato/repactuação.

4. **Média de Viagens**: O cálculo de média usa apenas viagens **anteriores** à data da viagem sendo calculada, garantindo que não haja "vazamento de futuro" nos cálculos.

## Arquivos Relacionados
- `Services/ServicosAsync.cs`: Versões assíncronas dos métodos de cálculo
- `Controllers/CustosViagemController.cs`: Usa estes métodos para recalcular custos em lote
- `Repository/IRepository/`: Acessa dados via `IUnitOfWork`
