# Documentação: EncarregadoContrato.cs

**📅 Última Atualização:** 08/01/2026  
**📋 Versão:** 2.0 (Padrão FrotiX Simplificado)

---

## 🎯 Objetivos

O Model `EncarregadoContrato` representa uma **tabela de relacionamento N-N** entre `Encarregado` e `Contrato` usando **chave primária composta** (ambos os IDs como chave).

**Principais objetivos:**

✅ Permitir que um encarregado esteja vinculado a múltiplos contratos  
✅ Permitir que um contrato tenha múltiplos encarregados  
✅ Usar chave composta para garantir unicidade da combinação  
✅ Simplificar estrutura sem necessidade de ID adicional

---

## 📁 Arquivos Envolvidos

- **`Models/EncarregadoContrato.cs`** - Model com chave composta
- **`Pages/Contrato/ItensContrato.cshtml`** - Interface de gestão de vínculos
- **`Controllers/ItensContratoController.cs`** - Endpoints para vincular/desvincular
- **`Data/FrotiXDbContext.cs`** - Configuração da chave composta

---

## 🏗️ Estrutura do Model

```csharp
public class EncarregadoContrato
{
    // ✅ Chave primária composta (2 Foreign Keys)
    [Key, Column(Order = 0)]
    public Guid EncarregadoId { get; set; }

    [Key, Column(Order = 1)]
    public Guid ContratoId { get; set; }
}
```

**Características:**
- ✅ Chave composta usando `[Key, Column(Order = ...)]`
- ✅ Sem propriedades adicionais (apenas relacionamento)
- ✅ Sem ID próprio (usa combinação dos dois IDs)

---

## 🗄️ Mapeamento Model ↔ Banco de Dados

```sql
CREATE TABLE [dbo].[EncarregadoContrato] (
    [EncarregadoId] UNIQUEIDENTIFIER NOT NULL,
    [ContratoId] UNIQUEIDENTIFIER NOT NULL,
    
    -- Chave primária composta
    CONSTRAINT [PK_EncarregadoContrato] 
        PRIMARY KEY ([EncarregadoId], [ContratoId]),
    
    -- Foreign Keys
    CONSTRAINT [FK_EncarregadoContrato_Encarregado] 
        FOREIGN KEY ([EncarregadoId]) REFERENCES [Encarregado]([EncarregadoId]) ON DELETE CASCADE,
    CONSTRAINT [FK_EncarregadoContrato_Contrato] 
        FOREIGN KEY ([ContratoId]) REFERENCES [Contrato]([ContratoId]) ON DELETE CASCADE
);
```

**Configuração no DbContext:**
```csharp
modelBuilder.Entity<EncarregadoContrato>()
    .HasKey(ec => new { ec.EncarregadoId, ec.ContratoId });
```

---

## 🔗 Quem Chama e Por Quê

### ItensContratoController.cs → Vincular Encarregado a Contrato

```csharp
[HttpPost("IncluirEncarregado")]
public IActionResult IncluirEncarregado([FromBody] ICIncluirEncarregadoContratoVM vm)
{
    // ✅ Verifica se já existe vínculo
    var existe = _unitOfWork.EncarregadoContrato
        .GetFirstOrDefault(ec => 
            ec.EncarregadoId == vm.EncarregadoId && 
            ec.ContratoId == vm.ContratoId);
    
    if (existe != null)
        return Json(new { success = false, message = "Encarregado já vinculado" });
    
    // ✅ Cria novo vínculo
    var encarregadoContrato = new EncarregadoContrato
    {
        EncarregadoId = vm.EncarregadoId,
        ContratoId = vm.ContratoId
    };
    
    _unitOfWork.EncarregadoContrato.Add(encarregadoContrato);
    _unitOfWork.Save();
    
    return Json(new { success = true });
}
```

---

## 🛠️ Problema → Solução → Código

### Problema: Evitar Duplicatas sem ID Próprio

**Solução:** Chave primária composta garante unicidade automaticamente.

```csharp
// ✅ Tentar adicionar duplicata resulta em erro de chave primária
try
{
    var novo = new EncarregadoContrato
    {
        EncarregadoId = encarregadoId,
        ContratoId = contratoId
    };
    _unitOfWork.EncarregadoContrato.Add(novo);
    _unitOfWork.Save();
}
catch (DbUpdateException ex)
{
    // ✅ SQL Server retorna erro de violação de chave primária
    if (ex.InnerException?.Message.Contains("PRIMARY KEY") == true)
    {
        // Vínculo já existe
    }
}
```

---

## 📝 Notas Importantes

1. **Chave composta** - Não precisa de `EncarregadoContratoId`, usa combinação dos dois IDs.

2. **CASCADE DELETE** - Se encarregado ou contrato for deletado, vínculos são removidos automaticamente.

3. **Sem propriedades extras** - Apenas relacionamento, sem campos adicionais como data de vinculação.

---

**📅 Documentação criada em:** 08/01/2026
