# sp_RecalcularTodasEstatisticasMotoristas

## Código completo

```sql
CREATE PROCEDURE dbo.sp_RecalcularTodasEstatisticasMotoristas
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @AnoMes TABLE (Ano INT, Mes INT);

    -- Busca todos os anos/meses com viagens
    INSERT INTO @AnoMes (Ano, Mes)
    SELECT DISTINCT YEAR(DataInicial), MONTH(DataInicial)
    FROM Viagem
    WHERE DataInicial IS NOT NULL AND MotoristaId IS NOT NULL
    ORDER BY YEAR(DataInicial), MONTH(DataInicial);

    -- Adiciona meses de multas que não estão em viagens
    INSERT INTO @AnoMes (Ano, Mes)
    SELECT DISTINCT YEAR(Data), MONTH(Data)
    FROM Multa
    WHERE Data IS NOT NULL
      AND MotoristaId IS NOT NULL
      AND NOT EXISTS (
          SELECT 1 FROM @AnoMes am
          WHERE am.Ano = YEAR(Data) AND am.Mes = MONTH(Data)
      );

    -- Adiciona meses de abastecimentos que não estão nas anteriores
    INSERT INTO @AnoMes (Ano, Mes)
    SELECT DISTINCT YEAR(DataHora), MONTH(DataHora)
    FROM Abastecimento
    WHERE DataHora IS NOT NULL
      AND MotoristaId IS NOT NULL
      AND MotoristaId <> '00000000-0000-0000-0000-000000000000'
      AND NOT EXISTS (
          SELECT 1 FROM @AnoMes am
          WHERE am.Ano = YEAR(DataHora) AND am.Mes = MONTH(DataHora)
      );

    DECLARE @Ano INT, @Mes INT;
    DECLARE cur CURSOR FOR SELECT Ano, Mes FROM @AnoMes ORDER BY Ano, Mes;

    OPEN cur;
    FETCH NEXT FROM cur INTO @Ano, @Mes;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        PRINT 'Processando ' + CAST(@Mes AS VARCHAR) + '/' + CAST(@Ano AS VARCHAR) + '...';
        EXEC sp_RecalcularEstatisticasMotoristas @Ano, @Mes;
        FETCH NEXT FROM cur INTO @Ano, @Mes;
    END

    CLOSE cur;
    DEALLOCATE cur;

    PRINT 'Todas as estatísticas foram recalculadas!';
END
```

## Explicação por blocos

- **Levantamento de períodos**: combina meses que têm viagens, multas ou abastecimentos com motorista, evitando duplicação.
- **Loop mensal**: para cada (ano, mês) executa `sp_RecalcularEstatisticasMotoristas`.
- **Logs**: imprime mês/ano processado e mensagem final.
- **Uso**: reprocessamento completo dos KPIs de motoristas após correções amplas em viagens/multas/abastecimentos.
