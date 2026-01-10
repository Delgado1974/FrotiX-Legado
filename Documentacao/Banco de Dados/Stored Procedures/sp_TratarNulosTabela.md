# sp_TratarNulosTabela

- **Objetivo**: preencher valores nulos de uma tabela informada, respeitando tipos e evitando FKs/check constraints.
- **Acionamento**: rotina manual; pode ser chamada por `sp_TratarNulosTodasTabelas`.
- **Parâmetros**: `@NomeTabela` (NVARCHAR(128)).
- **Tabelas afetadas**: tabela dinâmica passada no parâmetro (schema `dbo`).
- **Principais ações**: monta e executa SQL dinâmico que substitui nulos por padrão conforme tipo (string vazia, 0 numérico, 1 para bit), excluindo colunas FK/Check.
- **Benefício para o FrotiX**: saneamento rápido de dados legados para evitar falhas em integrações/reportes.
- **Status de uso**: sem evidência de uso automático; aplicar com cautela quando necessário.
