# sp_AtualizarEstatisticasVeiculosMesAtual

## Código completo

```sql
CREATE PROCEDURE dbo.sp_AtualizarEstatisticasVeiculosMesAtual
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Ano INT = YEAR(GETDATE());
    DECLARE @Mes INT = MONTH(GETDATE());

    -- Atualiza snapshot da frota
    EXEC sp_RecalcularEstatisticasVeiculoGeral;
    EXEC sp_RecalcularEstatisticasVeiculoCategoria;
    EXEC sp_RecalcularEstatisticasVeiculoStatus;
    EXEC sp_RecalcularEstatisticasVeiculoModelo;
    EXEC sp_RecalcularEstatisticasVeiculoCombustivel;
    EXEC sp_RecalcularEstatisticasVeiculoUnidade;
    EXEC sp_RecalcularEstatisticasVeiculoAnoFabricacao;

    -- Atualiza mês atual
    EXEC sp_RecalcularEstatisticasVeiculoUsoMensal @Ano, @Mes;
    EXEC sp_RecalcularRankingsVeiculoAnual @Ano;

    -- Atualiza mês anterior
    IF @Mes = 1
    BEGIN
        SET @Ano = @Ano - 1;
        SET @Mes = 12;
    END
    ELSE
        SET @Mes = @Mes - 1;

    EXEC sp_RecalcularEstatisticasVeiculoUsoMensal @Ano, @Mes;

    PRINT 'Estatísticas de veículos do mês atual e anterior atualizadas!';
END
```

## Explicação por blocos

- **Snapshot da frota**: recalcula estatísticas gerais e por categoria/status/modelo/combustível/unidade/ano de fabricação.
- **Mês atual**: recalcula uso mensal e rankings anuais do ano corrente.
- **Mês anterior**: recua um mês (ajustando ano em janeiro) e recalcula uso mensal.
- **Saída**: mensagem de conclusão.
- **Uso**: job diário/semana para manter KPIs de frota atualizados sem percorrer histórico completo.
