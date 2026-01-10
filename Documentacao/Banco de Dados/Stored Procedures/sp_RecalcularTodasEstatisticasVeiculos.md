# sp_RecalcularTodasEstatisticasVeiculos

- **Objetivo**: executar o recálculo completo de estatísticas da frota (snapshot atual, uso mensal e rankings anuais).
- **Acionamento**: rotina administrativa; pode ser agendada ou usada após cargas/ajustes.
- **Parâmetros**: nenhum.
- **Fluxo**: chama, em sequência, as SPs de snapshot (`sp_RecalcularEstatisticasVeiculoGeral`, `...Categoria`, `...Status`, `...Modelo`, `...Combustivel`, `...Unidade`, `...AnoFabricacao`); depois itera meses encontrados em `Viagem`/`Abastecimento` executando `sp_RecalcularEstatisticasVeiculoUsoMensal`; em seguida processa rankings anuais via `sp_RecalcularRankingsVeiculoAnual`.
- **Tabelas afetadas**: todas as tabelas de estatística de veículo (snapshot, uso mensal e rankings).
- **Benefício para o FrotiX**: recompõe toda a base de indicadores de frota após grandes alterações.
- **Status de uso**: rotina de manutenção; não há referência em código C#.
