# sp_CalculaCustosViagem

## Código completo

```sql
CREATE PROCEDURE dbo.sp_CalculaCustosViagem
    @ViagemId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON

    DECLARE @VeiculoId UNIQUEIDENTIFIER
    DECLARE @MotoristaId UNIQUEIDENTIFIER
    DECLARE @DataInicial DATETIME
    DECLARE @KmRodado INT
    DECLARE @Minutos INT
    DECLARE @Status VARCHAR(50)

    -- Custos calculados
    DECLARE @CustoCombustivel FLOAT = 0
    DECLARE @CustoVeiculo FLOAT = 0
    DECLARE @CustoMotorista FLOAT = 0
    DECLARE @CustoLavador FLOAT = 0
    DECLARE @CustoOperador FLOAT = 0

    -- Variáveis auxiliares
    DECLARE @ConsumoVeiculo FLOAT
    DECLARE @ValorCombustivel FLOAT
    DECLARE @ValorUnitarioVeiculo FLOAT
    DECLARE @CustoMensalMotorista FLOAT
    DECLARE @CustoMensalLavador FLOAT
    DECLARE @CustoMensalOperador FLOAT
    DECLARE @MediaMensalViagens FLOAT
    DECLARE @ItemVeiculoId UNIQUEIDENTIFIER
    DECLARE @ContratoMotoristaId UNIQUEIDENTIFIER
    DECLARE @ContratoAtivo UNIQUEIDENTIFIER
    DECLARE @QuantidadeLavador INT
    DECLARE @QuantidadeOperador INT

    -- ========================================================================
    -- BUSCA DADOS USANDO CAMPOS NORMALIZADOS
    -- ========================================================================
    SELECT 
        @VeiculoId = VeiculoId,
        @MotoristaId = MotoristaId,
        @DataInicial = COALESCE(DataInicialNormalizada, DataInicial),
        @KmRodado = COALESCE(KmRodadoNormalizado, 
                             CASE WHEN KmFinal >= KmInicial THEN KmFinal - KmInicial ELSE 0 END),
        @Minutos = COALESCE(MinutosNormalizado, Minutos, 0),
        @Status = Status
    FROM Viagem
    WHERE ViagemId = @ViagemId

    -- Só processa viagens realizadas com veículo
    IF @VeiculoId IS NULL OR @Status <> 'Realizada'
        RETURN

    -- Garantir valores não negativos
    IF @KmRodado < 0 SET @KmRodado = 0
    IF @Minutos < 0 SET @Minutos = 0

    -- ========================================================================
    -- 1. CUSTO COMBUSTÍVEL
    -- ========================================================================
    IF @KmRodado > 0
    BEGIN
        SET @ConsumoVeiculo = dbo.fn_CalculaConsumoVeiculo(@VeiculoId)
        SET @ValorCombustivel = dbo.fn_GetValorCombustivelProximo(@VeiculoId, @DataInicial)

        IF @ConsumoVeiculo IS NOT NULL AND @ConsumoVeiculo > 0 AND @ValorCombustivel IS NOT NULL
            SET @CustoCombustivel = @KmRodado * (@ValorCombustivel / @ConsumoVeiculo)
    END

    -- ========================================================================
    -- 2. CUSTO VEÍCULO (Jornada 8h × 22 dias = 10.560 min/mês)
    -- ========================================================================
    IF @Minutos > 0
    BEGIN
        SELECT @ItemVeiculoId = ItemVeiculoId FROM Veiculo WHERE VeiculoId = @VeiculoId

        IF @ItemVeiculoId IS NOT NULL
        BEGIN
            SELECT @ValorUnitarioVeiculo = ValorUnitario
            FROM ItemVeiculoContrato
            WHERE ItemVeiculoId = @ItemVeiculoId

            IF @ValorUnitarioVeiculo IS NOT NULL AND @ValorUnitarioVeiculo > 0
                -- FÓRMULA: Jornada 8h × 22 dias = 10.560 minutos/mês
                SET @CustoVeiculo = @ValorUnitarioVeiculo * (CAST(@Minutos AS FLOAT) / 10560.0)
        END
    END

    -- ========================================================================
    -- 3. CUSTO MOTORISTA (Jornada 220h = 13.200 min/mês + TETO)
    -- ========================================================================
    IF @Minutos > 0 AND @MotoristaId IS NOT NULL
    BEGIN
        SELECT @ContratoMotoristaId = ContratoId
        FROM Motorista
        WHERE MotoristaId = @MotoristaId

        IF @ContratoMotoristaId IS NOT NULL
        BEGIN
            -- Busca repactuação mais recente
            SELECT TOP 1 @CustoMensalMotorista = RT.ValorMotorista
            FROM RepactuacaoTerceirizacao RT
            INNER JOIN RepactuacaoContrato RC ON RT.RepactuacaoContratoId = RC.RepactuacaoContratoId
            WHERE RC.ContratoId = @ContratoMotoristaId
              AND RT.DataRepactuacao <= @DataInicial
            ORDER BY RT.DataRepactuacao DESC

            -- Fallback: se não tiver repactuação, usa Contrato
            IF @CustoMensalMotorista IS NULL
            BEGIN
                SELECT @CustoMensalMotorista = CustoMensalMotorista
                FROM Contrato
                WHERE ContratoId = @ContratoMotoristaId AND Status = 1
            END

            IF @CustoMensalMotorista IS NOT NULL AND @CustoMensalMotorista > 0
            BEGIN
                SET @CustoMotorista = @CustoMensalMotorista * (CAST(@Minutos AS FLOAT) / 13200.0)
                
                -- TETO: máximo = salário mensal
                IF @CustoMotorista > @CustoMensalMotorista
                    SET @CustoMotorista = @CustoMensalMotorista
            END
        END
    END

    -- ========================================================================
    -- 4. CUSTO LAVADOR (rateado por média de viagens/mês)
    -- ========================================================================
    IF @DataInicial IS NOT NULL
    BEGIN
        SELECT TOP 1 @ContratoAtivo = ContratoId
        FROM Contrato
        WHERE ContratoLavadores = 1 AND Status = 1
        ORDER BY DataInicio DESC

        IF @ContratoAtivo IS NOT NULL
        BEGIN
            SELECT TOP 1 
                @CustoMensalLavador = RT.ValorLavador,
                @QuantidadeLavador = RT.QtdLavadores
            FROM RepactuacaoTerceirizacao RT
            INNER JOIN RepactuacaoContrato RC ON RT.RepactuacaoContratoId = RC.RepactuacaoContratoId
            WHERE RC.ContratoId = @ContratoAtivo
              AND RT.DataRepactuacao <= @DataInicial
            ORDER BY RT.DataRepactuacao DESC

            IF @CustoMensalLavador IS NULL
            BEGIN
                SELECT @CustoMensalLavador = CustoMensalLavador,
                       @QuantidadeLavador = ISNULL(QuantidadeLavador, 1)
                FROM Contrato
                WHERE ContratoId = @ContratoAtivo
            END

            IF @CustoMensalLavador IS NOT NULL AND @CustoMensalLavador > 0
            BEGIN
                SET @MediaMensalViagens = dbo.fn_CalculaMediaMensalViagens(@DataInicial)
                IF @MediaMensalViagens > 0
                    SET @CustoLavador = (@CustoMensalLavador * ISNULL(@QuantidadeLavador, 1)) / @MediaMensalViagens
            END
        END
    END

    -- ========================================================================
    -- 5. CUSTO OPERADOR (rateado por média de viagens/mês)
    -- ========================================================================
    IF @DataInicial IS NOT NULL
    BEGIN
        SELECT TOP 1 @ContratoAtivo = ContratoId
        FROM Contrato
        WHERE ContratoOperadores = 1 AND Status = 1
        ORDER BY DataInicio DESC

        IF @ContratoAtivo IS NOT NULL
        BEGIN
            SELECT TOP 1 
                @CustoMensalOperador = RT.ValorOperador,
                @QuantidadeOperador = RT.QtdOperadores
            FROM RepactuacaoTerceirizacao RT
            INNER JOIN RepactuacaoContrato RC ON RT.RepactuacaoContratoId = RC.RepactuacaoContratoId
            WHERE RC.ContratoId = @ContratoAtivo
              AND RT.DataRepactuacao <= @DataInicial
            ORDER BY RT.DataRepactuacao DESC

            IF @CustoMensalOperador IS NULL
            BEGIN
                SELECT @CustoMensalOperador = CustoMensalOperador,
                       @QuantidadeOperador = ISNULL(QuantidadeOperador, 1)
                FROM Contrato
                WHERE ContratoId = @ContratoAtivo
            END

            IF @CustoMensalOperador IS NOT NULL AND @CustoMensalOperador > 0
            BEGIN
                IF @MediaMensalViagens IS NULL OR @MediaMensalViagens = 0
                    SET @MediaMensalViagens = dbo.fn_CalculaMediaMensalViagens(@DataInicial)
                
                IF @MediaMensalViagens > 0
                    SET @CustoOperador = (@CustoMensalOperador * ISNULL(@QuantidadeOperador, 1)) / @MediaMensalViagens
            END
        END
    END

    -- ========================================================================
    -- ATUALIZA VIAGEM
    -- ========================================================================
    UPDATE Viagem
    SET CustoCombustivel = ROUND(@CustoCombustivel, 2),
        CustoVeiculo = ROUND(@CustoVeiculo, 2),
        CustoMotorista = ROUND(@CustoMotorista, 2),
        CustoLavador = ROUND(@CustoLavador, 2),
        CustoOperador = ROUND(@CustoOperador, 2)
    WHERE ViagemId = @ViagemId
END
```

## Explicação por blocos

- **Coleta de dados normalizados**: lê `Viagem` já normalizada (datas/km/minutos) para evitar distorções; ignora viagens não “Realizada” ou sem veículo.
- **Consumo combustível**: usa `fn_CalculaConsumoVeiculo` e `fn_GetValorCombustivelProximo`; custo = km * (valor/consumo).
- **Custo veículo**: rateia `ValorUnitarioVeiculo` pela jornada de 10.560 min/mês (8h x 22d).
- **Custo motorista**: busca repactuação mais recente ou custo do contrato; rateia por 13.200 min/mês (220h) com teto no valor mensal.
- **Custos lavador/operador**: pega contrato ativo de lavadores/operadores, repactuação ou contrato; divide pelo `fn_CalculaMediaMensalViagens` e pela quantidade de profissionais.
- **Atualização**: grava custos na própria `Viagem`, arredondados em 2 casas.
- **Uso**: chamado em massa por `sp_RecalcularCustosTodasViagens`; pode ser reutilizado por triggers/integrações na inclusão de viagens.
