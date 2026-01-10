# sp_JobAtualizacaoViagens

## Código completo

```sql
CREATE PROCEDURE dbo.sp_JobAtualizacaoViagens
AS
BEGIN
    SET NOCOUNT ON
    
    DECLARE @Inicio DATETIME = GETDATE()
    DECLARE @InicioEtapa DATETIME
    DECLARE @DataInicio DATE
    DECLARE @DataFim DATE = CAST(GETDATE() AS DATE)
    DECLARE @DiasTotal INT
    
    -- Pega a data do primeiro registro até hoje
    SELECT @DataInicio = MIN(CAST(DataInicial AS DATE)) FROM Viagem WHERE Status = 'Realizada'
    SET @DiasTotal = DATEDIFF(DAY, @DataInicio, @DataFim) + 1
    
    PRINT '========================================================================'
    PRINT '         JOB DE ATUALIZACAO DE VIAGENS - FROTIX'
    PRINT '========================================================================'
    PRINT 'Inicio: ' + CONVERT(VARCHAR, @Inicio, 120)
    PRINT 'Periodo: ' + CONVERT(VARCHAR, @DataInicio, 103) + ' a ' + CONVERT(VARCHAR, @DataFim, 103)
    PRINT 'Total de dias: ' + CAST(@DiasTotal AS VARCHAR)
    PRINT ''
    
    BEGIN TRY
        -- ETAPA 1: NORMALIZAR ABASTECIMENTOS
        SET @InicioEtapa = GETDATE()
        PRINT '[ETAPA 1/6] NORMALIZAR ABASTECIMENTOS'
        EXEC dbo.sp_NormalizarAbastecimentos
        PRINT '  Tempo: ' + CAST(DATEDIFF(SECOND, @InicioEtapa, GETDATE()) AS VARCHAR) + 's'
        PRINT ''
        
        -- ETAPA 2: CALCULAR CONSUMO DOS VEICULOS
        SET @InicioEtapa = GETDATE()
        PRINT '[ETAPA 2/6] CALCULAR CONSUMO DOS VEICULOS'
        EXEC dbo.sp_CalcularConsumoVeiculos
        PRINT '  Tempo: ' + CAST(DATEDIFF(SECOND, @InicioEtapa, GETDATE()) AS VARCHAR) + 's'
        PRINT ''
        
        -- ETAPA 3: ATUALIZAR PADROES ESTATISTICOS DOS VEICULOS
        SET @InicioEtapa = GETDATE()
        PRINT '[ETAPA 3/6] ATUALIZAR PADROES ESTATISTICOS DOS VEICULOS'
        EXEC dbo.sp_AtualizarPadroesVeiculos
        PRINT '  Tempo: ' + CAST(DATEDIFF(SECOND, @InicioEtapa, GETDATE()) AS VARCHAR) + 's'
        PRINT ''
        
        -- ETAPA 4: NORMALIZAR VIAGENS (KM, MINUTOS, DATAS) - TODA A BASE
        SET @InicioEtapa = GETDATE()
        PRINT '[ETAPA 4/6] NORMALIZAR VIAGENS (KM, MINUTOS, DATAS)'
        EXEC dbo.sp_NormalizarViagens @DiasParaProcessar = @DiasTotal, @ForcarReprocessamento = 1
        PRINT '  Tempo: ' + CAST(DATEDIFF(SECOND, @InicioEtapa, GETDATE()) AS VARCHAR) + 's'
        PRINT ''
        
        -- ETAPA 5: RECALCULAR CUSTOS DAS VIAGENS - TODA A BASE
        SET @InicioEtapa = GETDATE()
        PRINT '[ETAPA 5/6] RECALCULAR CUSTOS DAS VIAGENS'
        EXEC dbo.sp_RecalcularCustosTodasViagens @DataInicio = @DataInicio, @DataFim = @DataFim
        PRINT '  Tempo: ' + CAST(DATEDIFF(SECOND, @InicioEtapa, GETDATE()) AS VARCHAR) + 's'
        PRINT ''
        
        -- ETAPA 6: ATUALIZAR ESTATISTICAS (ViagemEstatistica)
        SET @InicioEtapa = GETDATE()
        PRINT '[ETAPA 6/6] ATUALIZAR ESTATISTICAS'
        EXEC dbo.sp_AtualizarTodasEstatisticasViagem
        PRINT '  Tempo: ' + CAST(DATEDIFF(SECOND, @InicioEtapa, GETDATE()) AS VARCHAR) + 's'
        PRINT ''
        
        -- RESUMO FINAL
        DECLARE @DuracaoTotal INT = DATEDIFF(SECOND, @Inicio, GETDATE())
        
        PRINT '========================================================================'
        PRINT '                    JOB CONCLUIDO COM SUCESSO!'
        PRINT '========================================================================'
        PRINT 'Tempo total: ' + CAST(@DuracaoTotal AS VARCHAR) + ' segundos'
        PRINT 'Termino: ' + CONVERT(VARCHAR, GETDATE(), 120)
        
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE()
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY()
        DECLARE @ErrorState INT = ERROR_STATE()
        
        PRINT ''
        PRINT '========================================================================'
        PRINT '                           ERRO NO JOB!'
        PRINT '========================================================================'
        PRINT 'Erro: ' + @ErrorMessage
        PRINT 'Linha: ' + CAST(ERROR_LINE() AS VARCHAR)
        
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState)
    END CATCH
END
```

## Explicação por blocos

- **Cabeçalho e período**: calcula `@DataInicio` (primeira viagem realizada) e `@DataFim` (hoje), obtendo `@DiasTotal` para processar todo o intervalo histórico.
- **Etapa 1 – sp_NormalizarAbastecimentos**: limpa outliers e normaliza consumo/litros/km em `Abastecimento`.
- **Etapa 2 – sp_CalcularConsumoVeiculos**: recalcula `Veiculo.Consumo` médio desabilitando triggers para evitar recursão.
- **Etapa 3 – sp_AtualizarPadroesVeiculos**: gera baseline estatístico por veículo (médias, IQR) na tabela `VeiculoPadraoViagem`.
- **Etapa 4 – sp_NormalizarViagens**: reprocessa toda a base de viagens (km/datas/minutos) usando padrões de veículo e limites de outlier.
- **Etapa 5 – sp_RecalcularCustosTodasViagens**: chama `sp_CalculaCustosViagem` viagem a viagem para gravar custos (combustível, veículo, motorista, operador, lavador).
- **Etapa 6 – sp_AtualizarTodasEstatisticasViagem**: consolida estatísticas diárias em `ViagemEstatistica` com JSONs agregados.
- **Resiliência**: blocos de TRY/CATCH logam erro e repropagam via `RAISERROR`; imprime tempos por etapa e total.
- **Uso recomendado**: agendar em janela de baixa carga; é o pipeline completo que garante consistência antes de BI/dashboards.
