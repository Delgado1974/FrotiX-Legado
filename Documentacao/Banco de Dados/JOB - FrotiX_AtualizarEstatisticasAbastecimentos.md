# FrotiX_AtualizarEstatisticasAbastecimentos

- **Categoria:** Database Maintenance
- **Descrição:** Atualiza tabelas estatísticas de abastecimentos de hora em hora.

## Passos
- **Step 1 — Executar sp_AtualizarEstatisticasAbastecimentosMesAtual**
  - Comando: `EXEC sp_AtualizarEstatisticasAbastecimentosMesAtual;`
  - Banco: `FrotiX`
  - Tentativas: 3; intervalo de retry: 5 minutos
  - Ação em falha: termina o job após esgotar tentativas

## Agendamento
- Tipo: diário (`freq_type=4`)
- Frequência intradiária: a cada 1 hora (`freq_subday_type=8`, `freq_subday_interval=1`)
- Janela diária: 00:00:00 até 23:59:59
- Vigência: início 2026-01-01, sem data de fim
- Servidor: (local)

## Observações
- Trabalha apenas com o mês atual; se existirem lançamentos retroativos, pode ser necessário complementar com um job mensal de retrocálculo.
- Executa nos mesmos horários de outros jobs horários; avaliar se há necessidade de escalonar para evitar contenção.
