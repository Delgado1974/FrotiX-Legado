# sp_AtualizarEstatisticasAbastecimentosMesAtual

## Código completo

```sql
CREATE PROCEDURE dbo.sp_AtualizarEstatisticasAbastecimentosMesAtual
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Ano INT = YEAR(GETDATE());
    DECLARE @Mes INT = MONTH(GETDATE());

    -- Recalcula mês atual
    EXEC sp_RecalcularEstatisticasAbastecimentos @Ano, @Mes;
    EXEC sp_RecalcularEstatisticasAbastecimentosAnuais @Ano;

    -- Recalcula também mês anterior
    IF @Mes = 1
    BEGIN
        SET @Ano = @Ano - 1;
        SET @Mes = 12;
    END
    ELSE
        SET @Mes = @Mes - 1;

    EXEC sp_RecalcularEstatisticasAbastecimentos @Ano, @Mes;

    PRINT 'Estatísticas de abastecimentos do mês atual e anterior atualizadas!';
END
```

## Explicação por blocos

- **Data de referência**: usa ano/mês atuais de `GETDATE()`.
- **Mês atual**: chama `sp_RecalcularEstatisticasAbastecimentos` (mensal) e `sp_RecalcularEstatisticasAbastecimentosAnuais` (anual para o ano corrente).
- **Mês anterior**: ajusta ano/mês (vira para dez/ano-1 quando mês=1) e recalcula a mensal.
- **Saída**: mensagem de conclusão; sem parâmetros.
- **Uso**: ideal para job diário que mantém estatísticas de abastecimento em dia sem percorrer todo o histórico.
