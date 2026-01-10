# sp_RecalcularCustosTodasViagens

## Código completo

```sql
CREATE PROCEDURE dbo.sp_RecalcularCustosTodasViagens
    @DataInicio DATE = NULL,
    @DataFim DATE = NULL
AS
BEGIN
    SET NOCOUNT ON
    
    -- Se não informou datas, pega TODA a base
    IF @DataInicio IS NULL
        SELECT @DataInicio = MIN(CAST(DataInicial AS DATE)) FROM Viagem WHERE Status = 'Realizada'
    
    IF @DataFim IS NULL
        SET @DataFim = CAST(GETDATE() AS DATE)
    
    DECLARE @ViagemId UNIQUEIDENTIFIER
    DECLARE @Total INT = 0
    DECLARE @Processadas INT = 0
    DECLARE @Inicio DATETIME = GETDATE()
    
    SELECT @Total = COUNT(*)
    FROM Viagem
    WHERE CAST(DataInicial AS DATE) >= @DataInicio
      AND CAST(DataInicial AS DATE) <= @DataFim
      AND Status = 'Realizada'
    
    PRINT '  Recalculando custos de ' + CAST(@Total AS VARCHAR) + ' viagens...'
    PRINT '  Período: ' + CONVERT(VARCHAR, @DataInicio, 103) + ' a ' + CONVERT(VARCHAR, @DataFim, 103)
    
    -- Desabilita o trigger via CONTEXT_INFO
    SET CONTEXT_INFO 0x1
    
    DECLARE viagem_cursor CURSOR LOCAL FAST_FORWARD FOR
        SELECT ViagemId
        FROM Viagem
        WHERE CAST(DataInicial AS DATE) >= @DataInicio
          AND CAST(DataInicial AS DATE) <= @DataFim
          AND Status = 'Realizada'
    
    OPEN viagem_cursor
    FETCH NEXT FROM viagem_cursor INTO @ViagemId
    
    WHILE @@FETCH_STATUS = 0
    BEGIN
        EXEC dbo.sp_CalculaCustosViagem @ViagemId
        SET @Processadas = @Processadas + 1
        
        IF @Processadas % 500 = 0
            PRINT '    Processadas ' + CAST(@Processadas AS VARCHAR) + ' de ' + CAST(@Total AS VARCHAR)
        
        FETCH NEXT FROM viagem_cursor INTO @ViagemId
    END
    
    CLOSE viagem_cursor
    DEALLOCATE viagem_cursor
    
    SET CONTEXT_INFO 0x0
    
    DECLARE @Duracao INT = DATEDIFF(SECOND, @Inicio, GETDATE())
    PRINT '  ✓ Concluído! ' + CAST(@Processadas AS VARCHAR) + ' viagens em ' + CAST(@Duracao AS VARCHAR) + 's'
END
```

## Explicação por blocos

- **Datas padrão**: se não informar, processa da primeira viagem realizada até hoje.
- **Seleção do universo**: conta viagens realizadas no período para log/progresso.
- **Desabilitar trigger**: usa `CONTEXT_INFO 0x1` para desativar trigger de viagem durante o recálculo.
- **Cursor FAST_FORWARD**: percorre somente `ViagemId` de viagens realizadas no intervalo, chamando `sp_CalculaCustosViagem` para cada uma.
- **Log de progresso**: imprime a cada 500 viagens processadas.
- **Finalização**: reativa trigger (`CONTEXT_INFO 0x0`) e loga duração total.
- **Uso**: etapa 5 do job; útil também após mudanças de contratos/consumo ou correção de dados históricos.
