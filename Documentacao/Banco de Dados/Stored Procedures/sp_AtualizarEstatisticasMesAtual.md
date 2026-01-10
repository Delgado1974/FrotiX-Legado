# sp_AtualizarEstatisticasMesAtual

## Código completo

```sql
CREATE PROCEDURE dbo.sp_AtualizarEstatisticasMesAtual
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Ano INT = YEAR(GETDATE());
    DECLARE @Mes INT = MONTH(GETDATE());

    -- Recalcula mês atual
    EXEC sp_RecalcularEstatisticasMotoristas @Ano, @Mes;

    -- Recalcula também mês anterior
    IF @Mes = 1
    BEGIN
        SET @Ano = @Ano - 1;
        SET @Mes = 12;
    END
    ELSE
        SET @Mes = @Mes - 1;

    EXEC sp_RecalcularEstatisticasMotoristas @Ano, @Mes;

    PRINT 'Estatísticas do mês atual e anterior atualizadas!';
END
```

## Explicação por blocos

- **Data de referência**: obtém ano/mês do sistema.
- **Mês atual**: executa `sp_RecalcularEstatisticasMotoristas` para o mês corrente.
- **Mês anterior**: ajusta ano/mês (tratando janeiro) e executa novamente.
- **Saída**: mensagem de conclusão.
- **Uso**: ideal para job diário que mantém KPIs de motoristas atualizados sem reprocessar todo o histórico.
