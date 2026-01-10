# sp_RecalcularEstatisticasVeiculoModelo

- **Objetivo**: consolidar frota por modelo de veículo.
- **Acionamento**: usado por `sp_RecalcularTodasEstatisticasVeiculos` e `sp_AtualizarEstatisticasVeiculosMesAtual`.
- **Parâmetros**: nenhum.
- **Tabelas afetadas**: `EstatisticaVeiculoModelo`.
- **Tabelas lidas**: `Veiculo`, `ModeloVeiculo`.
- **Principais cálculos**: total e ativos por modelo (agrupa somente pela descrição do modelo, pega o primeiro `ModeloId` encontrado).
- **Benefício para o FrotiX**: dá visibilidade do mix de modelos para gestão de frota.
- **Status de uso**: ativo em rotinas de atualização; não chamado na aplicação.
