# usp_PreencheNulos_Motorista

## Código completo

```sql
CREATE PROCEDURE dbo.usp_PreencheNulos_Motorista
    @Keys dbo.MotoristaKeyList READONLY
AS
BEGIN
    SET NOCOUNT ON;

    -- Atualiza somente colunas NULL e somente linhas passadas em @Keys
    UPDATE M
       SET
         -- strings
         CPF               = ISNULL(M.CPF,               ''),
         CNH               = ISNULL(M.CNH,               ''),
         CategoriaCNH      = ISNULL(M.CategoriaCNH,      ''),
         Celular01         = ISNULL(M.Celular01,         ''),
         Celular02         = ISNULL(M.Celular02,         ''),
         OrigemIndicacao   = ISNULL(M.OrigemIndicacao,   ''),
         UsuarioIdAlteracao= ISNULL(M.UsuarioIdAlteracao,''),
         TipoCondutor      = ISNULL(M.TipoCondutor,      ''),
         EfetivoFerista    = ISNULL(M.EfetivoFerista,    ''),

         -- datas
         DataNascimento    = ISNULL(M.DataNascimento,     CONVERT(date,'19000101')),
         DataVencimentoCNH = ISNULL(M.DataVencimentoCNH,  CONVERT(date,'19000101')),
         DataIngresso      = ISNULL(M.DataIngresso,       CONVERT(date,'19000101')),
         DataAlteracao     = ISNULL(M.DataAlteracao,      GETDATE()),

         -- binário (mantenho excluído por padrão)
         -- Foto           = ISNULL(M.Foto,        0x),
         -- CNHDigital     = ISNULL(M.CNHDigital,  0x),

         -- numéricos/bit
         Status            = ISNULL(M.Status, 0),
         CodMotoristaQCard = ISNULL(M.CodMotoristaQCard, 0),

         -- GUIDs
         UnidadeId         = ISNULL(M.UnidadeId, CONVERT(uniqueidentifier,'00000000-0000-0000-0000-000000000000')),
         ContratoId        = ISNULL(M.ContratoId,CONVERT(uniqueidentifier,'00000000-0000-0000-0000-000000000000')),
         CondutorId        = ISNULL(M.CondutorId,CONVERT(uniqueidentifier,'00000000-0000-0000-0000-000000000000'))
    FROM dbo.Motorista AS M
    INNER JOIN @Keys      AS K ON K.MotoristaId = M.MotoristaId
    WHERE
         M.CPF                IS NULL OR
         M.CNH                IS NULL OR
         M.CategoriaCNH       IS NULL OR
         M.Celular01          IS NULL OR
         M.Celular02          IS NULL OR
         M.OrigemIndicacao    IS NULL OR
         M.UsuarioIdAlteracao IS NULL OR
         M.TipoCondutor       IS NULL OR
         M.EfetivoFerista     IS NULL OR

         M.DataNascimento     IS NULL OR
         M.DataVencimentoCNH  IS NULL OR
         M.DataIngresso       IS NULL OR
         M.DataAlteracao      IS NULL OR

         -- M.Foto            IS NULL OR
         -- M.CNHDigital      IS NULL OR

         M.Status             IS NULL OR
         M.CodMotoristaQCard  IS NULL OR

         M.UnidadeId          IS NULL OR
         M.ContratoId         IS NULL OR
         M.CondutorId         IS NULL;
END
```

## Explicação por blocos

- **Escopo controlado**: atualiza apenas IDs presentes em `@Keys` (TVP `MotoristaKeyList`).
- **Campos tratados**: strings, datas (1900-01-01 como default), status/códigos numéricos, GUIDs vazios; fotos/comprovantes estão comentados.
- **Filtro**: só linhas que ainda têm algum campo nulo entre os listados.
- **Uso**: saneamento pontual de motoristas específicos; não há job conhecido. Evita varrer a tabela inteira.
