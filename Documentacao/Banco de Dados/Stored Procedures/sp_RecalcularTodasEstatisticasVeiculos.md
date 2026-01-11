# sp_RecalcularTodasEstatisticasVeiculos

## Código completo

```sql
CREATE PROCEDURE dbo.sp_RecalcularTodasEstatisticasVeiculos
AS
BEGIN
    SET NOCOUNT ON;

    PRINT 'Iniciando recálculo de todas as estatísticas de veículos...';
    PRINT '';

    -- Estatísticas da frota (snapshot atual)
    PRINT '1. Recalculando estatísticas gerais da frota...';
    EXEC sp_RecalcularEstatisticasVeiculoGeral;

    PRINT '2. Recalculando estatísticas por categoria...';
    EXEC sp_RecalcularEstatisticasVeiculoCategoria;

    PRINT '3. Recalculando estatísticas por status...';
    EXEC sp_RecalcularEstatisticasVeiculoStatus;

    PRINT '4. Recalculando estatísticas por modelo...';
    EXEC sp_RecalcularEstatisticasVeiculoModelo;

    PRINT '5. Recalculando estatísticas por combustível...';
    EXEC sp_RecalcularEstatisticasVeiculoCombustivel;

    PRINT '6. Recalculando estatísticas por unidade...';
    EXEC sp_RecalcularEstatisticasVeiculoUnidade;

    PRINT '7. Recalculando estatísticas por ano de fabricação...';
    EXEC sp_RecalcularEstatisticasVeiculoAnoFabricacao;

    -- Estatísticas de uso (por ano/mês)
    PRINT '';
    PRINT '8. Recalculando estatísticas de uso mensal...';

    DECLARE @AnoMes TABLE (Ano INT, Mes INT);

    -- Anos/meses de viagens
    INSERT INTO @AnoMes (Ano, Mes)
    SELECT DISTINCT YEAR(DataInicial), MONTH(DataInicial)
    FROM Viagem
    WHERE DataInicial IS NOT NULL;

    -- Anos/meses de abastecimentos (sem duplicar)
    INSERT INTO @AnoMes (Ano, Mes)
    SELECT DISTINCT YEAR(DataHora), MONTH(DataHora)
    FROM Abastecimento
    WHERE DataHora IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM @AnoMes am WHERE am.Ano = YEAR(DataHora) AND am.Mes = MONTH(DataHora));

    DECLARE @Ano INT, @Mes INT;
    DECLARE cur CURSOR FOR SELECT DISTINCT Ano, Mes FROM @AnoMes ORDER BY Ano, Mes;

    OPEN cur;
    FETCH NEXT FROM cur INTO @Ano, @Mes;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        PRINT '   Processando ' + CAST(@Mes AS VARCHAR) + '/' + CAST(@Ano AS VARCHAR) + '...';
        EXEC sp_RecalcularEstatisticasVeiculoUsoMensal @Ano, @Mes;
        FETCH NEXT FROM cur INTO @Ano, @Mes;
    END

    CLOSE cur;
    DEALLOCATE cur;

    -- Rankings anuais
    PRINT '';
    PRINT '9. Recalculando rankings anuais...';

    DECLARE @Anos TABLE (Ano INT);
    INSERT INTO @Anos SELECT DISTINCT Ano FROM @AnoMes;

    DECLARE cur2 CURSOR FOR SELECT Ano FROM @Anos ORDER BY Ano;
    OPEN cur2;
    FETCH NEXT FROM cur2 INTO @Ano;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        PRINT '   Processando rankings de ' + CAST(@Ano AS VARCHAR) + '...';
        EXEC sp_RecalcularRankingsVeiculoAnual @Ano;
        FETCH NEXT FROM cur2 INTO @Ano;
    END

    CLOSE cur2;
    DEALLOCATE cur2;

    PRINT '';
    PRINT '=====================================================';
    PRINT 'Todas as estatísticas de veículos foram recalculadas!';
    PRINT '=====================================================';
END
```

## Explicação por blocos

- **Snapshot**: recalcula todas as tabelas de estado atual da frota (geral, categoria, status, modelo, combustível, unidade, ano fab.).
- **Levantamento de meses**: junta meses de `Viagem` e `Abastecimento` sem duplicar.
- **Uso mensal**: para cada mês encontrado, executa `sp_RecalcularEstatisticasVeiculoUsoMensal`.
- **Rankings anuais**: para cada ano distinto, executa `sp_RecalcularRankingsVeiculoAnual`.
- **Logs**: imprime cada etapa e mensagem final de sucesso.
- **Uso**: reprocessamento completo da área de veículo; execute em janela de baixa carga após migrações ou ajustes grandes.
