# sp_RecalcularTodasEstatisticasAbastecimentos

- **Objetivo**: recalcular estatísticas de abastecimento para todos os meses e anos existentes.
- **Acionamento**: rotina administrativa; pode ser usada após carga/ajuste de dados.
- **Parâmetros**: nenhum (descobre meses/anos a partir de `Abastecimento`).
- **Fluxo**: itera por meses encontrados executando `sp_RecalcularEstatisticasAbastecimentos`; em seguida, recalcula estatísticas anuais via `sp_RecalcularEstatisticasAbastecimentosAnuais` para cada ano.
- **Tabelas afetadas**: mesmas das sub-SPs mensais e anuais.
- **Benefício para o FrotiX**: garante consistência histórica de métricas e rankings de abastecimento.
- **Status de uso**: rotina de manutenção; não há referência em código C#.
