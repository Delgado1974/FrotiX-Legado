# sp_RecalcularEstatisticasAbastecimentosAnuais

## Código completo

```sql
CREATE PROCEDURE dbo.sp_RecalcularEstatisticasAbastecimentosAnuais
    @Ano INT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Recalcula estatísticas anuais por veículo (para ranking)
        DELETE FROM EstatisticaAbastecimentoVeiculo WHERE Ano = @Ano;

        INSERT INTO EstatisticaAbastecimentoVeiculo (Ano, VeiculoId, Placa, TipoVeiculo, Categoria, TotalAbastecimentos, ValorTotal, LitrosTotal, DataAtualizacao)
        SELECT
            @Ano,
            a.VeiculoId,
            v.Placa,
            m.DescricaoModelo,
            v.Categoria,
            COUNT(*),
            SUM(ISNULL(a.Litros, 0) * ISNULL(a.ValorUnitario, 0)),
            SUM(ISNULL(a.Litros, 0)),
            GETDATE()
        FROM Abastecimento a
        INNER JOIN Veiculo v ON a.VeiculoId = v.VeiculoId
        LEFT JOIN ModeloVeiculo m ON v.ModeloId = m.ModeloId
        WHERE YEAR(a.DataHora) = @Ano
          AND a.VeiculoId IS NOT NULL AND a.VeiculoId <> '00000000-0000-0000-0000-000000000000'
        GROUP BY a.VeiculoId, v.Placa, m.DescricaoModelo, v.Categoria;

        -- Atualiza lista de anos disponíveis
        DELETE FROM AnosDisponiveisAbastecimento WHERE Ano = @Ano;
        INSERT INTO AnosDisponiveisAbastecimento (Ano, TotalAbastecimentos, DataAtualizacao)
        SELECT @Ano, COUNT(*), GETDATE()
        FROM Abastecimento
        WHERE YEAR(DataHora) = @Ano;

        COMMIT TRANSACTION;
        PRINT 'Estatísticas anuais de abastecimentos do ano ' + CAST(@Ano AS VARCHAR) + ' recalculadas com sucesso.';

    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
```

## Explicação por blocos

- **Limpeza e recálculo**: remove registros do ano e insere consolidados por veículo (placa, modelo, categoria) com totais de abastecimentos, litros e valor.
- **Registro de anos**: atualiza `AnosDisponiveisAbastecimento` com total de abastecimentos do ano.
- **Transação**: garante consistência; rollback em erro.
- **Uso**: chamado em rotinas de mês atual e recálculo total; executável manualmente por ano.
