# Análise dos Jobs SQL Server (FrotiX)

## Visão geral
- Jobs mapeados: FrotiX - Atualização de Viagens, FrotiX_AtualizarEstatisticasAbastecimentos, FrotiX_AtualizarEstatisticasMotoristas, FrotiX_AtualizarEstatisticasVeiculos, FrotiX_TratarNulos.
- Frequência: 4 jobs horários (00:00-23:59) e 1 job a cada 10 minutos.
- Stored procedures chamadas: `sp_JobAtualizacaoViagens`; `sp_AtualizarEstatisticasAbastecimentosMesAtual`; `sp_RecalcularEstatisticasMotoristas` (mês atual e anterior); `sp_AtualizarEstatisticasVeiculosMesAtual`; `dbo.sp_TratarNulosTodasTabelas`.

## Convergências e possíveis sobreposições
- Três jobs horários iniciam em 00:00 (Viagens, Abastecimentos, Motoristas); podem disputar recursos simultaneamente. Apenas Veículos inicia às 00:30, reduzindo, mas não elimina sobreposição com o job de nulos (10/20/30/40/50 minutos).
- Se os tempos de execução forem longos, o job de nulos (a cada 10 min) pode encadear com os demais; monitorar para evitar instâncias em paralelo.

## Robustez (retries e tolerância a falhas)
- Com retries: Abastecimentos (3x, 5 min), Veículos (3x, 5 min).
- Sem retries: Viagens, Motoristas, TratarNulos. Recomenda-se adicionar ao menos 1–2 tentativas com backoff, especialmente para Viagens e Motoristas.
- Nenhum job tem notificação por e-mail configurada; avaliar adicionar alertas em falha.

## Cobertura funcional e lacunas
- Viagens: recalcula custos/normalização/estatísticas hora a hora — cobre base completa.
- Motoristas: cobre mês atual e anterior (mitiga lançamentos retroativos).
- Abastecimentos e Veículos: apenas mês atual; lançamentos retroativos podem ficar sem recalcular. Sugestão: agendar rotina diária/noturna para mês anterior ou mensal completa (há stored procedures de retrocálculo no repositório).
- TratarNulos: mantém dados higienizados, mas alta frequência pode ocultar falhas silenciosas; registrar métricas/tempo de execução.

## Recomendações de agendamento
- Escalonar horários para reduzir contenção. Exemplo: Viagens hh:00, Motoristas hh:10, Abastecimentos hh:20, Veículos hh:30 (já escalonado), mantendo TratarNulos nos minutos 05/15/25/35/45/55.
- Garantir que a janela diária e início não se sobreponham a janelas de manutenção/backup.

## Recomendações adicionais
- Registrar tempo médio/máximo de execução e taxa de falha por job.
- Garantir que `msdb` esteja com histórico de job habilitado para auditoria.
- Validar que as stored procedures chamadas existam e estejam versionadas (todas já estão documentadas em `Documentacao/Banco de Dados/Stored Procedures/`).
- Se houver dependência entre estatísticas (ex.: viagens antes de estatísticas derivadas), reforçar ordem de disparo no agendamento.
