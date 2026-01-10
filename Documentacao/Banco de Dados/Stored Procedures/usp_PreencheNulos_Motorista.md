# usp_PreencheNulos_Motorista

- **Objetivo**: preencher campos nulos de motoristas específicos usando uma lista de chaves (`dbo.MotoristaKeyList`).
- **Acionamento**: rotina de saneamento pontual; não há referência em jobs ou aplicação.
- **Parâmetros**: `@Keys` (table-valued `dbo.MotoristaKeyList` com `MotoristaId`).
- **Tabelas afetadas**: `Motorista` (apenas IDs passados).
- **Principais ações**: substitui nulos por padrões (strings vazias, datas 1900-01-01, `GETDATE()` para `DataAlteracao`, 0 para numéricos e status, GUID vazio para FKs).
- **Benefício para o FrotiX**: corrige registros específicos de motoristas sem afetar toda a tabela, facilitando migrações e integrações.
- **Status de uso**: sem evidência de uso automático; aplicar sob demanda para higienização.
