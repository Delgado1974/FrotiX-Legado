# sp_RecalcularEstatisticasVeiculoUnidade

- **Objetivo**: consolidar frota por unidade (sigla).
- **Acionamento**: usado por `sp_RecalcularTodasEstatisticasVeiculos` e `sp_AtualizarEstatisticasVeiculosMesAtual`.
- **Parâmetros**: nenhum.
- **Tabelas afetadas**: `EstatisticaVeiculoUnidade`.
- **Tabelas lidas**: `Veiculo`, `Unidade`.
- **Principais cálculos**: total e ativos por unidade (agrupa pela sigla; usa o primeiro `UnidadeId` encontrado).
- **Benefício para o FrotiX**: apoia gestão regionalizada da frota.
- **Status de uso**: ativo em rotinas de atualização; não chamado na aplicação.
