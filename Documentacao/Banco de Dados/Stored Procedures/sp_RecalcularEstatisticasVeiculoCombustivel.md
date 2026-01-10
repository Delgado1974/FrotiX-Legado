# sp_RecalcularEstatisticasVeiculoCombustivel

- **Objetivo**: consolidar frota por tipo de combustível.
- **Acionamento**: chamado por `sp_RecalcularTodasEstatisticasVeiculos` e `sp_AtualizarEstatisticasVeiculosMesAtual`.
- **Parâmetros**: nenhum.
- **Tabelas afetadas**: `EstatisticaVeiculoCombustivel`.
- **Tabelas lidas**: `Veiculo`, `Combustivel`.
- **Principais cálculos**: total de veículos agrupado pela descrição do combustível (ou “Não Informado”).
- **Benefício para o FrotiX**: auxilia na gestão de abastecimento e mix de combustível.
- **Status de uso**: ativo em rotinas de atualização; não chamado na aplicação.
