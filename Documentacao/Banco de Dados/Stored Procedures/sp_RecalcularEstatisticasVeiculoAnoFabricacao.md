# sp_RecalcularEstatisticasVeiculoAnoFabricacao

- **Objetivo**: agrupar veículos por ano de fabricação e registrar contagem.
- **Acionamento**: utilizado por `sp_RecalcularTodasEstatisticasVeiculos` e `sp_AtualizarEstatisticasVeiculosMesAtual`.
- **Parâmetros**: nenhum.
- **Tabelas afetadas**: `EstatisticaVeiculoAnoFabricacao`.
- **Tabelas lidas**: `Veiculo`.
- **Principais cálculos**: conta veículos por ano de fabricação (ignora nulos/0) e grava data de atualização.
- **Benefício para o FrotiX**: fornece visão de distribuição etária da frota.
- **Status de uso**: ativo em rotinas de atualização; não chamado na aplicação.
