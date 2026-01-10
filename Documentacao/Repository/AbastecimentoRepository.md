# Documentação: AbastecimentoRepository.cs

> **Última Atualização**: 08/01/2026  
> **Versão Atual**: 2.0

---

# PARTE 1: DOCUMENTAÇÃO DA FUNCIONALIDADE

## Visão Geral

O `AbastecimentoRepository` é um repository específico para a entidade `Abastecimento`, estendendo o repository genérico com métodos customizados.

**Principais características:**

✅ **Herança**: Herda de `Repository<Abastecimento>`  
✅ **Interface Específica**: Implementa `IAbastecimentoRepository`  
✅ **Métodos Customizados**: `GetAbastecimentoListForDropDown()` e `Update()` customizado

---

## Estrutura da Classe

### Herança e Implementação

```csharp
public class AbastecimentoRepository : Repository<Abastecimento>, IAbastecimentoRepository
```

**Herança**: `Repository<Abastecimento>` - Herda operações CRUD genéricas  
**Interface**: `IAbastecimentoRepository` - Define métodos específicos

---

## Construtor

```csharp
public AbastecimentoRepository(FrotiXDbContext db) : base(db)
{
    _db = db;
}
```

---

## Métodos Específicos

### `GetAbastecimentoListForDropDown()`

**Descrição**: Retorna lista de abastecimentos formatada para DropDownList

**Retorno**: `IEnumerable<SelectListItem>`

**Implementação**:
```csharp
public IEnumerable<SelectListItem> GetAbastecimentoListForDropDown()
{
    return _db.Abastecimento
        .Select(i => new SelectListItem()
        {
            Text = i.Litros.ToString(),
            Value = i.AbastecimentoId.ToString()
        });
}
```

**Características**:
- Usa `Litros` como texto (pode não ser ideal)
- Retorna `AbastecimentoId` como valor
- Não ordena resultados

**Uso**: Para dropdowns em views (uso limitado)

---

### `Update(Abastecimento abastecimento)`

**Descrição**: **MÉTODO CUSTOMIZADO** - Atualiza abastecimento com lógica específica

**Implementação**:
```csharp
public new void Update(Abastecimento abastecimento)
{
    var objFromDb = _db.Abastecimento.FirstOrDefault(s => s.AbastecimentoId == abastecimento.AbastecimentoId);
    
    _db.Update(abastecimento);
    _db.SaveChanges();
}
```

**Características**:
- Usa `new` para ocultar método da classe base
- Busca entidade do banco antes de atualizar
- Chama `SaveChanges()` diretamente (inconsistente com padrão)

**Nota**: ⚠️ **Inconsistência** - Chama `SaveChanges()` diretamente

---

## Interconexões

### Quem Usa Este Repository

- **AbastecimentoController**: CRUD de abastecimentos
- **Controllers de Relatórios**: Para consultas de abastecimentos

---

# PARTE 2: LOG DE MODIFICAÇÕES/CORREÇÕES

## [08/01/2026] - Documentação Inicial Completa

**Descrição**: Criação da documentação completa do AbastecimentoRepository

**Arquivos Afetados**:
- `Repository/AbastecimentoRepository.cs`

**Impacto**: Documentação de referência para repository de abastecimentos

**Status**: ✅ **Concluído**

**Versão**: 2.0

---

**Última atualização**: 08/01/2026  
**Autor**: Sistema FrotiX  
**Versão**: 2.0
