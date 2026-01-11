# sp_RecalcularTodasEstatisticasAbastecimentos

## Código completo

```sql
CREATE PROCEDURE dbo.sp_RecalcularTodasEstatisticasAbastecimentos
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @AnoMes TABLE (Ano INT, Mes INT);

    -- Busca todos os anos/meses com abastecimentos
    INSERT INTO @AnoMes (Ano, Mes)
    SELECT DISTINCT YEAR(DataHora), MONTH(DataHora)
    FROM Abastecimento
    WHERE DataHora IS NOT NULL
    ORDER BY YEAR(DataHora), MONTH(DataHora);

    DECLARE @Ano INT, @Mes INT;
    DECLARE cur CURSOR FOR SELECT Ano, Mes FROM @AnoMes ORDER BY Ano, Mes;

    OPEN cur;
    FETCH NEXT FROM cur INTO @Ano, @Mes;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        PRINT 'Processando ' + CAST(@Mes AS VARCHAR) + '/' + CAST(@Ano AS VARCHAR) + '...';
        EXEC sp_RecalcularEstatisticasAbastecimentos @Ano, @Mes;
        FETCH NEXT FROM cur INTO @Ano, @Mes;
    END

    CLOSE cur;
    DEALLOCATE cur;

    -- Recalcula estatísticas anuais
    DECLARE @Anos TABLE (Ano INT);
    INSERT INTO @Anos SELECT DISTINCT Ano FROM @AnoMes;

    DECLARE cur2 CURSOR FOR SELECT Ano FROM @Anos ORDER BY Ano;
    OPEN cur2;
    FETCH NEXT FROM cur2 INTO @Ano;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        PRINT 'Processando estatísticas anuais de ' + CAST(@Ano AS VARCHAR) + '...';
        EXEC sp_RecalcularEstatisticasAbastecimentosAnuais @Ano;
        FETCH NEXT FROM cur2 INTO @Ano;
    END

    CLOSE cur2;
    DEALLOCATE cur2;

    PRINT 'Todas as estatísticas de abastecimentos foram recalculadas!';
END
```

## Explicação por blocos

- **Levantamento de períodos**: monta tabela temporária com todos os (ano, mês) existentes em `Abastecimento`.
- **Loop mensal**: percorre cada mês encontrado e chama `sp_RecalcularEstatisticasAbastecimentos`.
- **Loop anual**: em seguida percorre cada ano distinto e chama `sp_RecalcularEstatisticasAbastecimentosAnuais`.
- **Logs**: imprime progresso por mês/ano e mensagem final.
- **Uso**: rotina pesada de reprocessamento completo, indicada após importações ou grandes correções históricas.
