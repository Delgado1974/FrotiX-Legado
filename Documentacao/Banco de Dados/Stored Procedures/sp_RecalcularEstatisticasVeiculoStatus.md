# sp_RecalcularEstatisticasVeiculoStatus

- **Objetivo**: consolidar frota por status (Ativo/Inativo).
- **Acionamento**: usado por `sp_RecalcularTodasEstatisticasVeiculos` e `sp_AtualizarEstatisticasVeiculosMesAtual`.
- **Parâmetros**: nenhum.
- **Tabelas afetadas**: `EstatisticaVeiculoStatus`.
- **Tabelas lidas**: `Veiculo`.
- **Principais cálculos**: total de veículos agrupado por status (1 = Ativo, 0 = Inativo).
- **Benefício para o FrotiX**: mede disponibilidade de frota.
- **Status de uso**: ativo em rotinas de atualização; não chamado na aplicação.
