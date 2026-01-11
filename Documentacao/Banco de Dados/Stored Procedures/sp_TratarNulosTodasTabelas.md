# sp_TratarNulosTodasTabelas

## Código completo

```sql
CREATE PROCEDURE dbo.sp_TratarNulosTodasTabelas
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Tabela NVARCHAR(128);
    DECLARE curTabelas CURSOR FOR
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = 'dbo' 
          AND TABLE_TYPE = 'BASE TABLE'
          AND TABLE_NAME NOT LIKE 'AspNet%'
          AND TABLE_NAME NOT LIKE '__EF%';
    
    OPEN curTabelas;
    FETCH NEXT FROM curTabelas INTO @Tabela;
    
    WHILE @@FETCH_STATUS = 0
    BEGIN
        EXEC dbo.sp_TratarNulosTabela @Tabela;
        FETCH NEXT FROM curTabelas INTO @Tabela;
    END
    
    CLOSE curTabelas;
    DEALLOCATE curTabelas;
END
```

## Explicação por blocos

- **Cursor de tabelas**: percorre todas as tabelas base `dbo`, ignorando AspNet e tabelas EF temporárias.
- **Chamada**: executa `sp_TratarNulosTabela` para cada tabela selecionada.
- **Uso**: saneamento em massa; rodar com cautela, pois pode encobrir dados faltantes. Ideal após importações/migrações.
