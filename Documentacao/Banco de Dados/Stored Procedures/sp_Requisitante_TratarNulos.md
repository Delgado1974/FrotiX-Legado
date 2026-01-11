# sp_Requisitante_TratarNulos

## Código completo

```sql
CREATE PROCEDURE dbo.sp_Requisitante_TratarNulos
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.Requisitante
    SET 
        Nome = ISNULL(Nome, ''),
        Ponto = ISNULL(Ponto, ''),
        Ramal = ISNULL(Ramal, 0),
        Email = ISNULL(Email, ''),
        Status = ISNULL(Status, 1),
        UsuarioIdAlteracao = ISNULL(UsuarioIdAlteracao, ''),
        DataAlteracao = ISNULL(DataAlteracao, GETDATE())
    WHERE 
        Nome IS NULL
        OR Ponto IS NULL
        OR Ramal IS NULL
        OR Email IS NULL
        OR Status IS NULL
        OR UsuarioIdAlteracao IS NULL
        OR DataAlteracao IS NULL;
END
```

## Explicação por blocos

- **Atualização simples**: um único `UPDATE` na tabela `Requisitante` preenchendo nulos com padrões seguros.
- **Defaults aplicados**: strings vazias para textos, 0 para `Ramal`, 1 para `Status`, `GETDATE()` para `DataAlteracao`, GUID/str vazia para `UsuarioIdAlteracao`.
- **Filtro**: só linhas que tenham algum campo nulo listado.
- **Uso**: rotina manual de saneamento; não há job conhecido. Executar apenas quando desejar higienizar dados legados.
