# Documentação: Stored Procedures - FrotiX

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 1.0

---

# PARTE 1: DOCUMENTAÇÃO DAS STORED PROCEDURES

## Índice
1. [Visão Geral](#visão-geral)
2. [Lista de Stored Procedures](#lista-de-stored-procedures)
3. [Detalhamento por Procedure](#detalhamento-por-procedure)

---

## Visão Geral

Este documento contém a documentação completa de todas as **Stored Procedures** do banco de dados FrotiX. As procedures são organizadas por funcionalidade e incluem descrição, parâmetros, retorno e exemplos de uso.

> **Nova organização (09/01/2026):** cada procedure agora possui um arquivo dedicado em `Documentacao/Banco de dados/Stored Procedures/` com resumo de objetivo, acionamento (job/trigger/manual), tabelas envolvidas, cálculos e status de uso. Este arquivo permanece como índice histórico.

---

## Quadro-resumo de execução e dependências 🗺️

Legenda de frequência: 🔄 diário | 📅 mensal | 🛠️ manual/on-demand | 🏁 job/orquestração

| SP / Função | Frequência sugerida | Acionamento típico | Depende de | Gera / Alimenta | Observações |
|---|---|---|---|---|---|
| sp_JobAtualizacaoViagens | 🏁 diário (madrugada) | Job SQL Agent | Todas abaixo em sequência | Consumo, custos, estatísticas de viagem | Pipeline completo; orquestra 6 etapas |
| sp_NormalizarAbastecimentos | 🔄 diário (antes de consumo) | Job (Etapa 1) | Abastecimento | Abastecimento normalizado | Trata outliers (IQR) e normaliza consumo |
| sp_CalcularConsumoVeiculos | 🔄 diário | Job (Etapa 2) | Abastecimento normalizado | Veiculo.Consumo | Desabilita/reabilita triggers de Veiculo |
| sp_AtualizarPadroesVeiculos | 🔄 diário | Job (Etapa 3) | Viagem normalizada (km 1–2000) | VeiculoPadraoViagem | Base para correções de km em viagens |
| sp_NormalizarViagens | 🔄 diário | Job (Etapa 4) | VeiculoPadraoViagem | Viagem.*Normalizado | Corrige datas/km/minutos; outliers >2000 km |
| sp_RecalcularCustosTodasViagens | 🔄 diário | Job (Etapa 5) | Viagem normalizada | Viagem (custos) | Usa sp_CalculaCustosViagem por cursor |
| sp_AtualizarTodasEstatisticasViagem | 📅 semanal/mensal (ou após saneamento) | Job (Etapa 6) | Custos recalculados | ViagemEstatistica | Itera dia a dia chamando sp_AtualizarEstatisticasViagem |
| sp_AtualizarEstatisticasViagem | 🔄 diário (por data) | Chamada pela anterior | Viagem, Motorista, Veiculo | ViagemEstatistica | Gera métricas e JSONs por dia |
| sp_AtualizarEstatisticasAbastecimentosMesAtual | 🔄 diário | Job dedicado (sug.) | sp_RecalcularEstatisticasAbastecimentos / Anuais | Estatísticas mensais/anuais de abastecimento | Processa mês atual e anterior |
| sp_RecalcularEstatisticasAbastecimentos | 🛠️ on-demand / mensal | Manual/Job | Abastecimento | EstatísticaAbastecimento* | Recalcula mês específico |
| sp_RecalcularEstatisticasAbastecimentosAnuais | 🛠️ on-demand / anual | Manual/Job | Abastecimento | EstatísticaAbastecimentoVeiculo, AnosDisponiveisAbastecimento | Por ano |
| sp_RecalcularTodasEstatisticasAbastecimentos | 🛠️ on-demand | Manual | Abastecimento | Todas estatísticas mensais/anuais | Percorre todos os meses/anos |
| sp_AtualizarEstatisticasMesAtual | 🔄 diário | Job dedicado (sug.) | sp_RecalcularEstatisticasMotoristas | Estatísticas e rankings de motoristas (mês atual/anterior) | KPIs de condutores |
| sp_RecalcularEstatisticasMotoristas | 📅 mensal | Manual/Job | Viagem, Multa, Abastecimento | EstatísticaMotoristasMensal, Rankings, Heatmap | Por mês/ano |
| sp_RecalcularEstatisticasMotoristaUnico | 🛠️ on-demand | Manual | Viagem/Multa/Abastecimento (1 motorista) | Estatísticas do motorista | Uso pontual após correções |
| sp_RecalcularTodasEstatisticasMotoristas | 🛠️ on-demand | Manual | Viagem/Multa/Abastecimento | Estatísticas e rankings de motoristas | Percorre meses com dados |
| sp_AtualizarEstatisticasVeiculosMesAtual | 🔄 diário | Job dedicado (sug.) | sp_RecalcularEstatisticasVeiculo* + UsoMensal + Rankings | Snapshot + mês atual/anterior | Versão rápida (não percorre histórico inteiro) |
| sp_RecalcularEstatisticasVeiculoGeral/Categoria/Status/Modelo/Combustivel/Unidade/AnoFabricacao | 📅 mensal | Manual/Job | Veiculo (+ Combustivel/Unidade/Modelo) | Tabelas de snapshot da frota | Podem rodar em sequência ou via “Todas” |
| sp_RecalcularEstatisticasVeiculoUsoMensal | 📅 mensal | Manual/Job | Viagem, Abastecimento | EstatisticaVeiculoUsoMensal | Por ano/mês |
| sp_RecalcularRankingsVeiculoAnual | 📅 mensal/anual | Manual/Job | Viagem, Abastecimento | Rankings de veículo, AnosDisponiveisVeiculo | Por ano |
| sp_RecalcularTodasEstatisticasVeiculos | 🛠️ on-demand | Manual | Viagem, Abastecimento | Todas as tabelas de veículo | Reprocessa snapshot, uso e rankings |
| sp_CalculaCustosViagem | 🔄 conforme uso | Chamada por sp_RecalcularCustosTodasViagens ou gatilho | Viagem, Veiculo, Contrato | Viagem (custos) | Pode ser usada isoladamente |
| sp_Requisitante_TratarNulos / sp_TratarNulosTabela / sp_TratarNulosTodasTabelas / usp_PreencheNulos_Motorista | 🛠️ manual | Administrativa | N/A | Saneamento de dados | Usar com cautela; não há job conhecido |

> Dica: para ambientes produtivos, agende o pipeline de viagens (sp_JobAtualizacaoViagens) em janela de baixa carga, e as “MesAtual” (abastecimento/motorista/veículo) diariamente logo após a virada do dia. Rotinas “Todas” são pesadas e devem ser disparadas apenas após migrações ou correções maciças.

### Convenções

- **Nome**: Nome completo da procedure no banco
- **Schema**: Schema onde está localizada (geralmente `dbo`)
- **Parâmetros**: Lista completa de parâmetros com tipos e descrições
- **Retorno**: Tipo de retorno (ResultSet, OUTPUT, etc.)
- **Uso**: Quando e por que usar esta procedure

---

## Lista de Stored Procedures

> **Nota**: Esta lista será atualizada conforme novas procedures forem identificadas no arquivo SQL do banco.

### Procedures de Sistema

- `sp_tr_SetString` - Gerencia strings de tradução/localização
- `sp_tr_GetString` - Recupera strings de tradução/localização

### Procedures de Negócio

> **TODO**: Adicionar procedures conforme forem identificadas no arquivo SQL

---

## Detalhamento por Procedure

### `sp_tr_SetString`

**Schema**: `dbo`  
**Tipo**: Sistema / Localização

**Descrição**:  
Gerencia strings de tradução/localização no sistema. Faz MERGE (INSERT ou UPDATE) na tabela `tr_String`.

**Parâmetros**:
- `@Key` (varchar(255)): Chave identificadora da string
- `@Value` (nvarchar(4000)): Valor da string a ser armazenada

**Retorno**: Nenhum (apenas execução)

**SQL**:
```sql
CREATE OR ALTER PROCEDURE dbo.sp_tr_SetString 
	@Key varchar(255) = 0, 
	@Value nvarchar(4000) = 0
AS
BEGIN
	SET NOCOUNT ON;

	MERGE [dbo].[tr_String] AS T 
	USING (SELECT @Key as Id, @Value as Value) AS S 
		ON (T.Id = S.Id) 
	WHEN NOT MATCHED BY TARGET THEN 
		INSERT(Id, Value) VALUES(S.Id, S.Value) 
	WHEN MATCHED THEN 
		UPDATE SET T.Value = S.Value;
END
```

**Exemplo de Uso**:
```sql
EXEC sp_tr_SetString @Key = 'MensagemBemVindo', @Value = 'Bem-vindo ao sistema FrotiX'
```

**Tabela Relacionada**: `tr_String`

---

### `sp_tr_GetString`

**Schema**: `dbo`  
**Tipo**: Sistema / Localização

**Descrição**:  
Recupera uma string de tradução/localização da tabela `tr_String`.

**Parâmetros**:
- `@Key` (varchar(255)): Chave identificadora da string

**Retorno**: ResultSet com coluna `Value` (nvarchar(4000))

**SQL**:
```sql
CREATE OR ALTER PROCEDURE dbo.sp_tr_GetString 
	@Key varchar(255) = 0
AS
BEGIN
	SET NOCOUNT ON;

	SELECT Value 
	FROM [dbo].[tr_String] 
	WHERE Id = @Key
END
```

**Exemplo de Uso**:
```sql
EXEC sp_tr_GetString @Key = 'MensagemBemVindo'
-- Retorna: 'Bem-vindo ao sistema FrotiX'
```

**Tabela Relacionada**: `tr_String`

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

> **FORMATO**: Entradas em ordem **decrescente** (mais recente primeiro)

---

## [08/01/2026] - Criação da Documentação

**Descrição**:
- Criada estrutura inicial de documentação de Stored Procedures
- Adicionadas procedures de sistema identificadas no arquivo SQL

**Status**: ✅ **Em Progresso**

**Responsável**: Claude (AI Assistant)
**Versão**: 1.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema de Documentação FrotiX  
**Versão**: 1.0
