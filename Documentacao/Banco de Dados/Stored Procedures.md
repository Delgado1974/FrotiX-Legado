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
