# FrotiX_TratarNulos

- **Categoria:** [Uncategorized (Local)]
- **Descrição:** Trata campos nulos em todas as tabelas do FrotiX.

## Passos
- **Step 1 — Executar SP Anti-Nulos**
  - Comando: `EXEC dbo.sp_TratarNulosTodasTabelas`
  - Banco: `FrotiX`
  - Tentativas: 0 (sem retry)
  - Ação em falha: termina o job

## Agendamento
- Tipo: diário (`freq_type=4`)
- Frequência intradiária: a cada 10 minutos (`freq_subday_type=4`, `freq_subday_interval=10`)
- Janela diária: 00:00:00 até 23:59:59
- Vigência: início 2025-12-01, sem data de fim
- Servidor: (local)

## Observações
- Job de alta frequência (6 execuções por hora); importante monitorar tempo de execução para evitar sobreposição.
- Sem retries; se falhar, próxima janela cobre nova tentativa em ~10 minutos.
