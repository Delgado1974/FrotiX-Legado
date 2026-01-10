# sp_RecalcularEstatisticasVeiculoCategoria

- **Objetivo**: consolidar estatísticas de frota por categoria.
- **Acionamento**: usado por `sp_RecalcularTodasEstatisticasVeiculos` e `sp_AtualizarEstatisticasVeiculosMesAtual`.
- **Parâmetros**: nenhum.
- **Tabelas afetadas**: `EstatisticaVeiculoCategoria`.
- **Tabelas lidas**: `Veiculo`.
- **Principais cálculos**: total de veículos, ativos, próprios e locados por categoria (ou “Sem Categoria”).
- **Benefício para o FrotiX**: mostra composição da frota por categoria para planejamento e locação.
- **Status de uso**: ativo em rotinas de atualização; não chamado na aplicação.
