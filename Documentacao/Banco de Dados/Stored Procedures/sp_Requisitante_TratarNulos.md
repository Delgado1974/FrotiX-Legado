# sp_Requisitante_TratarNulos

- **Objetivo**: preencher campos nulos na tabela `Requisitante` com valores padrão.
- **Acionamento**: rotina corretiva/manual; não há chamadas conhecidas em jobs ou aplicação.
- **Parâmetros**: nenhum.
- **Tabelas afetadas**: `Requisitante`.
- **Principais ações**: substitui nulos por strings vazias, `0` para `Ramal`, `1` para `Status`, GUID vazio para `UsuarioIdAlteracao` quando nulo, `GETDATE()` para `DataAlteracao`.
- **Benefício para o FrotiX**: evita erros por nulos em integrações/consultas e padroniza dados legados.
- **Status de uso**: sem evidência de uso automático; utilizar apenas quando necessário para saneamento.
