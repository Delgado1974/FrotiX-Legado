# FrotiX_AtualizarEstatisticasMotoristas

- **Categoria:** [Uncategorized (Local)]
- **Descrição:** Atualiza tabelas estatísticas do dashboard de motoristas a cada hora.

## Passos
- **Step 1 — Recalcular Estatísticas do Mês Atual**
  - Script T-SQL:
    - Define `@Ano = YEAR(GETDATE())` e `@Mes = MONTH(GETDATE())`.
    - Executa `sp_RecalcularEstatisticasMotoristas @Ano, @Mes`.
    - Recalcula também o mês anterior (ajusta ano/mês quando o mês atual é janeiro).
    - Executa novamente `sp_RecalcularEstatisticasMotoristas @Ano, @Mes` para o mês anterior.
  - Banco: `FrotiX`
  - Tentativas: 0 (sem retry)
  - Ação em falha: termina o job

## Agendamento
- Tipo: diário (`freq_type=4`)
- Frequência intradiária: a cada 1 hora (`freq_subday_type=8`, `freq_subday_interval=1`)
- Janela diária: 00:00:00 até 23:59:59
- Vigência: início 2026-01-01, sem data de fim
- Servidor: (local)

## Observações
- O passo cobre mês atual e anterior, mitigando lançamentos retroativos.
- Sem retries configurados; considerar adicionar para maior resiliência.
- Executa no mesmo ciclo horário de outros jobs; avaliar sobreposição conforme carga.
