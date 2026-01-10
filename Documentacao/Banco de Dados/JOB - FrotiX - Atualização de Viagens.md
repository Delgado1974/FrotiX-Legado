# FrotiX - Atualização de Viagens

- **Categoria:** Database Maintenance
- **Descrição:** Recalcula custos, normaliza viagens e atualiza estatísticas de toda a base de hora em hora.

## Passos
- **Step 1 — Executar sp_JobAtualizacaoViagens**
  - Comando: `EXEC sp_JobAtualizacaoViagens`
  - Banco: `FrotiX`
  - Tentativas: 0 (sem retry)
  - Ação em falha: termina o job

## Agendamento
- Tipo: diário (`freq_type=4`)
- Frequência intradiária: a cada 1 hora (`freq_subday_type=8`, `freq_subday_interval=1`)
- Janela diária: 00:00:00 até 23:59:59 (`active_start_time=000000`, `active_end_time=235959`)
- Vigência: início 2025-12-17, sem data de fim (`active_end_date=9999-12-31`)
- Servidor: (local)

## Observações
- Não há retry configurado; avaliar se é desejável reexecutar em caso de falha.
- Concorre no mesmo ciclo horário com outros jobs de estatísticas; pode valer distribuir horários para reduzir contenção.
