# sp_RecalcularEstatisticasVeiculoGeral

- **Objetivo**: gerar snapshot geral da frota.
- **Acionamento**: usado por `sp_RecalcularTodasEstatisticasVeiculos` e `sp_AtualizarEstatisticasVeiculosMesAtual`.
- **Parâmetros**: nenhum.
- **Tabelas afetadas**: `EstatisticaVeiculoGeral`.
- **Tabelas lidas**: `Veiculo`.
- **Principais cálculos**: total, ativos, inativos, próprios, locados; idade média; km médio; valor mensal de locação da frota locada.
- **Benefício para o FrotiX**: fornece visão macro de frota para gestão e custos.
- **Status de uso**: ativo em rotinas de atualização; não chamado na aplicação.
