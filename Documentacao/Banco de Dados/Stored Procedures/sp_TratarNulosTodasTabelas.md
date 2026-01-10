# sp_TratarNulosTodasTabelas

- **Objetivo**: aplicar `sp_TratarNulosTabela` em todas as tabelas base do schema `dbo` (exceto AspNet e EF).
- **Acionamento**: rotina de saneamento manual; não há job associado.
- **Parâmetros**: nenhum.
- **Tabelas afetadas**: todas as tabelas base `dbo` não ignoradas.
- **Benefício para o FrotiX**: corrige nulos em massa após importações ou migrações, reduzindo problemas de consistência.
- **Status de uso**: não referenciado no código; usar apenas quando precisar higienizar dados, pois pode mascarar dados faltantes.
