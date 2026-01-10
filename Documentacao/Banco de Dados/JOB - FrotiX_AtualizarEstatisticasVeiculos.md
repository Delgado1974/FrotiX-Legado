# FrotiX_AtualizarEstatisticasVeiculos

- **Categoria:** Database Maintenance
- **Descrição:** Atualiza tabelas estatísticas de veículos de hora em hora.

## Passos
- **Step 1 — Executar sp_AtualizarEstatisticasVeiculosMesAtual**
  - Comando: `EXEC sp_AtualizarEstatisticasVeiculosMesAtual;`
  - Banco: `FrotiX`
  - Tentativas: 3; intervalo de retry: 5 minutos
  - Ação em falha: termina o job após esgotar tentativas

## Agendamento
- Tipo: diário (`freq_type=4`)
- Frequência intradiária: a cada 1 hora (`freq_subday_type=8`, `freq_subday_interval=1`)
- Janela diária: 00:30:00 até 23:59:59 (`active_start_time=003000`)
- Vigência: início 2026-01-01, sem data de fim
- Servidor: (local)

## Observações
- Executa com início 00:30, o que já reduz concorrência com os demais jobs que iniciam em 00:00.
- Abrange apenas mês atual; se houver lançamentos retroativos, considerar rotina complementar de retrocálculo.
