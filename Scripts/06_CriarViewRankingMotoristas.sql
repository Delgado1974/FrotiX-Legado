-- =============================================
-- View: vw_RankingMotoristasPorPeriodo
-- Descrição: Calcula ranking de motoristas por viagens e KM
-- Uso: SELECT * FROM vw_RankingMotoristasPorPeriodo WHERE Ano = 2025 AND Mes = 1
-- =============================================

IF EXISTS (SELECT * FROM sys.views WHERE name = 'vw_RankingMotoristasPorPeriodo')
    DROP VIEW vw_RankingMotoristasPorPeriodo;
GO

CREATE VIEW vw_RankingMotoristasPorPeriodo
AS
WITH ViagensPorMotorista AS (
    SELECT
        YEAR(v.DataInicial) AS Ano,
        MONTH(v.DataInicial) AS Mes,
        v.MotoristaId,
        m.Nome AS NomeMotorista,
        COUNT(*) AS TotalViagens,
        SUM(
            CASE
                WHEN v.KmInicial IS NOT NULL
                     AND v.KmFinal IS NOT NULL
                     AND v.KmFinal >= v.KmInicial
                     AND (v.KmFinal - v.KmInicial) <= 2000
                THEN v.KmFinal - v.KmInicial
                ELSE 0
            END
        ) AS KmTotal
    FROM Viagem v
    INNER JOIN Motorista m ON v.MotoristaId = m.MotoristaId
    WHERE v.MotoristaId IS NOT NULL
      AND v.DataInicial IS NOT NULL
    GROUP BY YEAR(v.DataInicial), MONTH(v.DataInicial), v.MotoristaId, m.Nome
)
SELECT
    Ano,
    Mes,
    MotoristaId,
    NomeMotorista,
    TotalViagens,
    KmTotal,
    ROW_NUMBER() OVER (PARTITION BY Ano, Mes ORDER BY TotalViagens DESC, KmTotal DESC) AS PosicaoViagens,
    ROW_NUMBER() OVER (PARTITION BY Ano, Mes ORDER BY KmTotal DESC, TotalViagens DESC) AS PosicaoKm
FROM ViagensPorMotorista;
GO

-- Teste da View
-- SELECT * FROM vw_RankingMotoristasPorPeriodo WHERE Ano = 2025 AND Mes = 1 ORDER BY PosicaoViagens;
